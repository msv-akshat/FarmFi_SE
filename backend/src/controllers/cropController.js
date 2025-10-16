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
    const existing = await sql`
      SELECT * FROM crop_data WHERE field_id = ${field_id} AND crop_year = ${crop_year} AND season = ${season}
    `;
    if (existing.length) return next(new AppError('Crop already exists for this field/season/year', 400));
    const result = await sql`
      INSERT INTO crop_data (field_id, crop_id, crop_year, season, area, production)
      VALUES (${field_id}, ${crop_id}, ${crop_year}, ${season}, ${area}, ${production})
      RETURNING *
    `;
    res.status(201).json({ success: true, data: result[0] });
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
        f.field_name
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
    const [current] = await sql`SELECT verified FROM crop_data WHERE id = ${req.params.id}`;
    if (!current) return next(new AppError('Crop not found', 404));
    if (current.verified) return next(new AppError('Cannot update a verified crop', 403));
    const { crop_id, crop_year, season, area, production } = req.body;
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