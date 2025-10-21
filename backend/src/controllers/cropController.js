import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

// List all crop logs (for one farmer, pretty names from related tables)
export const getMyCrops = async (req, res, next) => {
  try {
    const crops = await sql`
      SELECT 
        c.id,
        c.crop_year,
        c.season,
        c.area,
        c.production,
        c.verified,
        c.field_id,
        crops.name as crop_name,
        f.field_name
      FROM crop_data c
      JOIN crops ON c.crop_id = crops.id
      JOIN fields f ON c.field_id = f.id
      WHERE f.farmer_id = ${req.user.id}
      ORDER BY c.crop_year DESC, c.season DESC
    `;
    res.json({ success: true, data: crops });
  } catch (error) { next(error); }
};

// Create a crop log with crop_id
export const createCropData = async (req, res, next) => {
  try {
    const { field_id, crop_id, crop_year, season, area, production } = req.body;
    
    // Check if field exists and is verified
    const [field] = await sql`SELECT area, verified FROM fields WHERE id = ${field_id}`;
    if (!field) return next(new AppError('Field not found', 404));
    if (!field.verified) return next(new AppError('Can only add crops to verified fields', 403));
    
    // Check if same crop already exists for this field/season/year
    const existing = await sql`
      SELECT * FROM crop_data 
      WHERE field_id = ${field_id} 
      AND crop_id = ${crop_id}
      AND crop_year = ${crop_year} 
      AND season = ${season}
    `;
    let isUpdate = false;
    let existingCrop = null;
    if (existing.length) {
      isUpdate = true;
      existingCrop = existing[0];
    }

    // Enforce whole year vs rabi/kharif rule
    const cropsThisYear = await sql`
      SELECT season FROM crop_data WHERE field_id = ${field_id} AND crop_year = ${crop_year}`;
    const hasWholeYear = cropsThisYear.some(c => c.season === 'whole year');
    const hasRabiOrKharif = cropsThisYear.some(c => c.season === 'rabi' || c.season === 'kharif');
    if ((season === 'whole year' && cropsThisYear.length > 0) ||
        (season !== 'whole year' && hasWholeYear)) {
      return next(new AppError(
        'You cannot add a "Whole Year" crop if any Rabi/Kharif crop exists for this field and year, or add a Rabi/Kharif crop if a "Whole Year" crop exists. Please check your existing crops for this field and year.',
        400
      ));
    }

    // Calculate total area already allocated for this field/season/year (excluding this crop if updating)
    const [{ total }] = await sql`
      SELECT COALESCE(SUM(area), 0) as total 
      FROM crop_data 
      WHERE field_id = ${field_id} 
      AND crop_year = ${crop_year} 
      AND season = ${season}
      ${isUpdate ? sql`AND id != ${existingCrop.id}` : sql``}
    `;

    const requestedArea = parseFloat(area);
    const newTotalArea = parseFloat(total) + requestedArea;
    const availableArea = parseFloat(field.area) - parseFloat(total);

    if (newTotalArea > parseFloat(field.area)) {
      return next(new AppError(
        `Insufficient area for this crop.\n\nField total area: ${field.area} ha\nArea already allocated for this season/year: ${total} ha\nAvailable area for this season/year: ${(parseFloat(field.area) - parseFloat(total)).toFixed(2)} ha\nRequested area: ${requestedArea} ha.\n\nPlease reduce the area or check your existing crops for this field, season, and year.`,
        400
      ));
    }

    let result;
    if (isUpdate) {
      // Add area to existing crop
      const updatedArea = parseFloat(existingCrop.area) + requestedArea;
      // Optionally, update production if provided (sum or replace)
      const updatedProduction = production !== undefined && production !== null
        ? (parseFloat(existingCrop.production || 0) + parseFloat(production))
        : existingCrop.production;
      result = await sql`
        UPDATE crop_data SET area = ${updatedArea}, production = ${updatedProduction}
        WHERE id = ${existingCrop.id}
        RETURNING *
      `;
      res.status(200).json({ success: true, data: result[0], message: `Crop already existed, area updated to ${updatedArea} ha.` });
    } else {
      result = await sql`
        INSERT INTO crop_data (field_id, crop_id, crop_year, season, area, production)
        VALUES (${field_id}, ${crop_id}, ${crop_year}, ${season}, ${area}, ${production})
        RETURNING *
      `;
      res.status(201).json({ success: true, data: result[0] });
    }
  } catch (error) { next(error); }
};

// Verify crop (for admin/employee)
export const verifyCrop = async (req, res, next) => {
  try {
    await sql`UPDATE crop_data SET verified = TRUE WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Crop verified!' });
  } catch (error) { next(error); }
};

// Prevent edit/delete of verified crops
export const deleteCrop = async (req, res, next) => {
  try {
    const [crop] = await sql`SELECT verified FROM crop_data WHERE id = ${req.params.id}`;
    if (!crop) return next(new AppError('Crop not found', 404));
    if (crop.verified) return next(new AppError('Cannot delete a verified crop', 403));
    await sql`DELETE FROM crop_data WHERE id = ${req.params.id}`;
    res.json({ success: true, message: 'Deleted!' });
  } catch (error) { next(error); }
};

// Get single crop by id (with field/crop name)
export const getSingleCrop = async (req, res, next) => {
  try {
    const [crop] = await sql`
      SELECT
        c.*,
        crops.name AS crop_name,
        f.field_name,
        f.area AS field_total_area
      FROM crop_data c
      JOIN crops ON c.crop_id = crops.id
      JOIN fields f ON c.field_id = f.id
      WHERE c.id = ${req.params.id}
      LIMIT 1
    `;
    if (!crop) return next(new AppError('Crop not found', 404));
    res.json({ success: true, data: crop });
  } catch (error) { next(error); }
};

// Update crop (but only if not verified)
export const updateCrop = async (req, res, next) => {
  try {
    const [current] = await sql`
      SELECT c.*, c.verified, c.field_id, c.area as old_area, c.crop_year, c.season
      FROM crop_data c
      WHERE c.id = ${req.params.id}
    `;
    if (!current) return next(new AppError('Crop not found', 404));
    if (current.verified) return next(new AppError('Cannot update a verified crop', 403));
    
    const { crop_id, crop_year, season, area, production } = req.body;
    
    // Get field info
    const [field] = await sql`SELECT area FROM fields WHERE id = ${current.field_id}`;
    if (!field) return next(new AppError('Field not found', 404));
    
    // Enforce whole year vs rabi/kharif rule
    const cropsThisYear = await sql`
      SELECT season FROM crop_data WHERE field_id = ${current.field_id} AND crop_year = ${crop_year} AND id != ${req.params.id}`;
    const hasWholeYear = cropsThisYear.some(c => c.season === 'whole year');
    const hasRabiOrKharif = cropsThisYear.some(c => c.season === 'rabi' || c.season === 'kharif');
    if ((season === 'whole year' && cropsThisYear.length > 0) ||
        (season !== 'whole year' && hasWholeYear)) {
      return next(new AppError('Cannot mix "whole year" crops with rabi/kharif crops in the same field and year', 400));
    }

    // Calculate total area for this field/season/year (excluding current crop)
    const [{ total }] = await sql`
      SELECT COALESCE(SUM(area), 0) as total 
      FROM crop_data 
      WHERE field_id = ${current.field_id} 
      AND crop_year = ${crop_year}
      AND season = ${season}
      AND id != ${req.params.id}
    `;

    const requestedArea = parseFloat(area);
    const availableArea = parseFloat(field.area) - parseFloat(total);

    if (requestedArea > availableArea) {
      return next(new AppError(
        `Insufficient area. Field has ${field.area} ha, ${total} ha already allocated to other crops, ${availableArea.toFixed(2)} ha available`,
        400
      ));
    }

    await sql`
      UPDATE crop_data SET
        crop_id = ${crop_id},
        crop_year = ${crop_year},
        season = ${season},
        area = ${area},
        production = ${production}
      WHERE id = ${req.params.id}
    `;
    res.json({ success: true, message: 'Crop updated!' });
  } catch (error) { next(error); }
};