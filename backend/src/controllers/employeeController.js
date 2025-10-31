import sql from '../config/db.js';
import multer from 'multer';
import XLSX from 'xlsx';
import path from 'path';

// ==================== FIELD APPROVAL ====================

// Get pending fields for verification
export const getPendingFields = async (req, res) => {
  try {
    const { status, mandal_id, village_id } = req.query;

    // Build dynamic WHERE conditions
    let query = sql`
      SELECT 
        f.id,
        f.farmer_id,
        f.field_name,
        f.area,
        f.mandal_id,
        f.village_id,
        f.survey_number,
        f.soil_type,
        f.status,
        f.source,
        f.created_at,
        f.updated_at,
        m.mandal_name,
        v.village_name,
        fa.name as farmer_name,
        fa.phone as farmer_phone
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN farmers fa ON f.farmer_id = fa.id
      WHERE 1=1
    `;

    // Apply filters
    if (status) {
      query = sql`${query} AND f.status = ${status}`;
    } else {
      query = sql`${query} AND f.status IN ('pending', 'employee_verified')`;
    }

    if (mandal_id) {
      query = sql`${query} AND f.mandal_id = ${mandal_id}`;
    }

    if (village_id) {
      query = sql`${query} AND f.village_id = ${village_id}`;
    }

    query = sql`${query} ORDER BY f.created_at DESC`;

    const fields = await query;

    res.json({
      success: true,
      data: fields
    });
  } catch (error) {
    console.error('Get pending fields error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify field (employee action)
export const verifyField = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { id } = req.params;
    const { action, notes, rejection_reason } = req.body; // action: 'verify' or 'reject'

    if (!action || !['verify', 'reject'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Action must be verify or reject' 
      });
    }

    if (action === 'reject' && !rejection_reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required when rejecting a field' 
      });
    }

    // Check if field exists and is pending
    const field = await sql`
      SELECT * FROM fields 
      WHERE id = ${id} AND status IN ('pending', 'employee_verified')
    `;

    if (field.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Field not found or already processed' 
      });
    }

    let newStatus;
    if (action === 'verify') {
      newStatus = 'employee_verified';
    } else {
      newStatus = 'rejected';
    }

    // Update field status
    const updated = await sql`
      UPDATE fields 
      SET 
        status = ${newStatus},
        employee_verified_by = ${employeeId},
        rejection_reason = ${action === 'reject' ? rejection_reason : null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    res.json({
      success: true,
      message: `Field ${action === 'verify' ? 'verified' : 'rejected'} successfully`,
      data: updated[0]
    });
  } catch (error) {
    console.error('Verify field error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EXCEL UPLOAD ====================

// Configure multer for Excel file upload
const storage = multer.memoryStorage();
export const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  }
});

// Upload crops via Excel
export const uploadCropsExcel = async (req, res) => {
  try {
    const employeeId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload an Excel file' 
      });
    }

    // Parse Excel file
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Excel file is empty' 
      });
    }

    const results = {
      total: data.length,
      success: 0,
      failed: 0,
      errors: []
    };

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        // Expected columns: farmer_name, farmer_phone, field_name, crop_name, area, season, crop_year, village_name, mandal_name, soil_type
        const { 
          farmer_name, 
          farmer_phone, 
          field_name, 
          crop_name, 
          area, 
          season, 
          crop_year,
          village_name,
          mandal_name,
          soil_type
        } = row;

        // Validate required fields
        if (!farmer_name || !farmer_phone || !field_name || !crop_name || !area || !season || !crop_year || !village_name || !mandal_name) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Missing required fields`);
          continue;
        }

        // Get or create farmer
        let farmer = await sql`
          SELECT id FROM farmers WHERE phone = ${farmer_phone}
        `;

        let farmerId;
        if (farmer.length === 0) {
          // Create new farmer with default password
          const newFarmer = await sql`
            INSERT INTO farmers (name, phone, password, role)
            VALUES (${farmer_name}, ${farmer_phone}, 'test123', 'farmer')
            RETURNING id
          `;
          farmerId = newFarmer[0].id;
        } else {
          farmerId = farmer[0].id;
        }

        // Get mandal and village
        const mandal = await sql`
          SELECT id FROM mandals WHERE mandal_name = ${mandal_name}
        `;

        if (mandal.length === 0) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Mandal '${mandal_name}' not found`);
          continue;
        }

        const village = await sql`
          SELECT id FROM villages 
          WHERE village_name = ${village_name} AND mandal_id = ${mandal[0].id}
        `;

        if (village.length === 0) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Village '${village_name}' not found in mandal '${mandal_name}'`);
          continue;
        }

        // Create or get field
        let field = await sql`
          SELECT id, area FROM fields 
          WHERE farmer_id = ${farmerId} 
          AND field_name = ${field_name}
          AND village_id = ${village[0].id}
        `;

        let fieldId;
        let fieldTotalArea;
        let cropArea = parseFloat(area); // Area for this crop from Excel
        
        if (field.length === 0) {
          // Create new field - use crop area as minimum field area
          // (User should provide correct field area in Excel, but we'll use crop area as minimum)
          const newField = await sql`
            INSERT INTO fields (
              farmer_id, field_name, area, village_id, mandal_id, 
              soil_type, status, submitted_by, source
            ) VALUES (
              ${farmerId}, ${field_name}, ${cropArea}, ${village[0].id}, ${mandal[0].id},
              ${soil_type || null}, 'pending', ${employeeId}, 'employee_upload'
            )
            RETURNING id, area
          `;
          fieldId = newField[0].id;
          fieldTotalArea = parseFloat(newField[0].area);
        } else {
          fieldId = field[0].id;
          fieldTotalArea = parseFloat(field[0].area);
          
          // LAND VALIDATION: Check if requested crop area fits
          const occupiedLand = await sql`
            SELECT COALESCE(SUM(area), 0)::numeric as occupied
            FROM crop_data
            WHERE field_id = ${fieldId}
              AND status NOT IN ('rejected', 'harvested')
          `;
          
          const occupied = parseFloat(occupiedLand[0].occupied) || 0;
          const remaining = fieldTotalArea - occupied;
          
          if (cropArea > remaining) {
            results.failed++;
            results.errors.push(`Row ${i + 2}: Insufficient land. Field '${field_name}' has ${fieldTotalArea} acres total, ${occupied} acres occupied, ${remaining.toFixed(2)} acres available. Requested: ${cropArea} acres.`);
            continue;
          }
          
          // Also check if crop area exceeds total field area
          if (cropArea > fieldTotalArea) {
            results.failed++;
            results.errors.push(`Row ${i + 2}: Crop area (${cropArea} acres) cannot exceed field total area (${fieldTotalArea} acres) for field '${field_name}'.`);
            continue;
          }
        }

        // Get crop type
        const cropType = await sql`
          SELECT id FROM crop_types WHERE crop_name = ${crop_name}
        `;

        if (cropType.length === 0) {
          results.failed++;
          results.errors.push(`Row ${i + 2}: Crop type '${crop_name}' not found`);
          continue;
        }

        // Create crop
        await sql`
          INSERT INTO crop_data (
            field_id, farmer_id, crop_name, crop_type_id, area, season, crop_year,
            status, submitted_by, source
          ) VALUES (
            ${fieldId}, ${farmerId}, ${crop_name}, ${cropType[0].id}, ${cropArea}, 
            ${season}, ${crop_year}, 'pending', ${employeeId}, 'employee_upload'
          )
        `;

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 2}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      message: 'Excel file processed',
      results
    });
  } catch (error) {
    console.error('Upload crops excel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SIMPLE FORM UPLOAD ====================

// Upload single crop via form (with land tracking)
export const uploadCropForm = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { 
      farmer_phone,
      field_id,
      crop_name,
      area,
      season,
      crop_year,
      sowing_date,
      expected_harvest_date
    } = req.body;

    // Validate required fields
    if (!farmer_phone || !field_id || !crop_name || !area || !season || !crop_year) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    // Get farmer
    const farmer = await sql`
      SELECT id FROM farmers WHERE phone = ${farmer_phone}
    `;

    if (farmer.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Farmer not found with this phone number' 
      });
    }

    const farmerId = farmer[0].id;

    // Get field details
    const field = await sql`
      SELECT * FROM fields 
      WHERE id = ${field_id} AND farmer_id = ${farmerId}
    `;

    if (field.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Field not found or does not belong to this farmer' 
      });
    }

    const fieldArea = parseFloat(field[0].area);
    const requestedArea = parseFloat(area);

    // Calculate occupied land (sum of active crops in this field)
    const occupiedLand = await sql`
      SELECT COALESCE(SUM(area), 0)::numeric as occupied
      FROM crop_data
      WHERE field_id = ${field_id}
        AND status NOT IN ('rejected', 'harvested')
    `;

    const occupied = parseFloat(occupiedLand[0].occupied) || 0;
    const remaining = fieldArea - occupied;

    // Check if requested area fits
    if (requestedArea > remaining) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient land. Field: ${fieldArea} acres, Occupied: ${occupied} acres, Available: ${remaining} acres. You requested: ${requestedArea} acres.`,
        field_area: fieldArea,
        occupied_area: occupied,
        remaining_area: remaining,
        requested_area: requestedArea
      });
    }

    // Get crop type
    const cropType = await sql`
      SELECT id FROM crop_types WHERE crop_name = ${crop_name}
    `;

    if (cropType.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Crop type '${crop_name}' not found` 
      });
    }

    // Create crop
    const [newCrop] = await sql`
      INSERT INTO crop_data (
        field_id, farmer_id, crop_name, crop_type_id, area, season, crop_year,
        sowing_date, expected_harvest_date, status, submitted_by, source
      ) VALUES (
        ${field_id}, ${farmerId}, ${crop_name}, ${cropType[0].id}, ${requestedArea}, 
        ${season}, ${crop_year}, ${sowing_date || null}, ${expected_harvest_date || null},
        'pending', ${employeeId}, 'employee_upload'
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: 'Crop added successfully',
      data: newCrop,
      land_info: {
        field_area: fieldArea,
        occupied_before: occupied,
        occupied_after: occupied + requestedArea,
        remaining_after: remaining - requestedArea
      }
    });
  } catch (error) {
    console.error('Upload crop form error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get field land utilization
export const getFieldLandInfo = async (req, res) => {
  try {
    const { field_id } = req.params;

    // Get field details
    const field = await sql`
      SELECT * FROM fields WHERE id = ${field_id}
    `;

    if (field.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Field not found' 
      });
    }

    const fieldArea = parseFloat(field[0].area);

    // Get all active crops
    const crops = await sql`
      SELECT id, crop_name, area, season, crop_year, status
      FROM crop_data
      WHERE field_id = ${field_id}
        AND status NOT IN ('rejected', 'harvested')
      ORDER BY created_at DESC
    `;

    const occupied = crops.reduce((sum, crop) => sum + parseFloat(crop.area), 0);
    const remaining = fieldArea - occupied;

    res.json({
      success: true,
      data: {
        field_id: field[0].id,
        field_name: field[0].field_name,
        total_area: fieldArea,
        occupied_area: occupied,
        remaining_area: remaining,
        utilization_percentage: (occupied / fieldArea * 100).toFixed(2),
        active_crops: crops
      }
    });
  } catch (error) {
    console.error('Get field land info error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get farmer fields by phone
export const getFarmerFields = async (req, res) => {
  try {
    const { phone } = req.params;

    // Get farmer
    const farmer = await sql`
      SELECT id FROM farmers WHERE phone = ${phone}
    `;

    if (farmer.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Farmer not found' 
      });
    }

    // Get farmer fields
    const fields = await sql`
      SELECT 
        f.id, f.field_name, f.area, f.status, f.soil_type,
        v.village_name, m.mandal_name
      FROM fields f
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN mandals m ON f.mandal_id = m.id
      WHERE f.farmer_id = ${farmer[0].id}
      ORDER BY f.created_at DESC
    `;

    res.json({
      success: true,
      data: fields
    });
  } catch (error) {
    console.error('Get farmer fields error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== UPLOADED CROPS TRACKING ====================

// Get crops uploaded by employee
export const getUploadedCrops = async (req, res) => {
  try {
    const employeeId = req.user.id;
    const { 
      status, 
      farmer_name, 
      crop_name, 
      season, 
      start_date, 
      end_date 
    } = req.query;

    // Build query incrementally for postgres.js
    let query = sql`
      SELECT 
        c.id,
        c.field_id,
        c.farmer_id,
        c.crop_name,
        c.season,
        c.crop_year,
        c.area,
        c.status,
        c.created_at,
        c.updated_at,
        f.name as farmer_name,
        f.phone as farmer_phone,
        fld.field_name,
        fld.area as field_area,
        m.mandal_name,
        v.village_name
      FROM crop_data c
      LEFT JOIN farmers f ON c.farmer_id = f.id
      LEFT JOIN fields fld ON c.field_id = fld.id
      LEFT JOIN mandals m ON fld.mandal_id = m.id
      LEFT JOIN villages v ON fld.village_id = v.id
      WHERE c.submitted_by = ${employeeId} 
        AND c.source = 'employee_upload'
    `;

    if (status) {
      query = sql`${query} AND c.status = ${status}`;
    }

    if (farmer_name) {
      query = sql`${query} AND f.name ILIKE ${'%' + farmer_name + '%'}`;
    }

    if (crop_name) {
      query = sql`${query} AND c.crop_name ILIKE ${'%' + crop_name + '%'}`;
    }

    if (season) {
      query = sql`${query} AND c.season = ${season}`;
    }

    if (start_date) {
      query = sql`${query} AND c.created_at >= ${start_date}`;
    }

    if (end_date) {
      query = sql`${query} AND c.created_at <= ${end_date}`;
    }

    query = sql`${query} ORDER BY c.created_at DESC`;

    const crops = await query;

    // Get summary statistics
    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'employee_verified') as verified,
        COUNT(*) FILTER (WHERE status = 'admin_approved') as approved,
        COUNT(*) FILTER (WHERE status = 'rejected') as rejected
      FROM crop_data
      WHERE submitted_by = ${employeeId} AND source = 'employee_upload'
    `;

    res.json({
      success: true,
      data: crops,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Get uploaded crops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DASHBOARD ====================

// Get crop types (shared utility)
export const getCropTypes = async (req, res) => {
  try {
    const cropTypes = await sql`SELECT * FROM crop_types ORDER BY crop_name`;

    res.json({
      success: true,
      data: cropTypes
    });
  } catch (error) {
    console.error('Get crop types error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const employeeId = req.user.id;

    // Get field stats
    const fieldStats = await sql`
      SELECT 
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending_fields,
        COUNT(CASE WHEN status = 'employee_verified' THEN 1 END)::int as verified_fields
      FROM fields
      WHERE submitted_by = ${employeeId}
    `;

    // Get crop stats
    const cropStats = await sql`
      SELECT 
        COUNT(*)::int as uploaded_crops,
        COUNT(CASE WHEN status = 'admin_approved' THEN 1 END)::int as approved_crops
      FROM crop_data
      WHERE submitted_by = ${employeeId} AND source = 'employee_upload'
    `;

    // Get weekly activity (last 7 days)
    const weeklyActivity = await sql`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'::interval
        )::date as date
      )
      SELECT 
        TO_CHAR(d.date, 'Dy') as name,
        COALESCE(COUNT(DISTINCT CASE WHEN f.status = 'employee_verified' AND DATE(f.updated_at) = d.date THEN f.id END), 0)::int as fields,
        COALESCE(COUNT(DISTINCT CASE WHEN c.source = 'employee_upload' AND DATE(c.created_at) = d.date THEN c.id END), 0)::int as crops
      FROM dates d
      LEFT JOIN fields f ON DATE(f.updated_at) = d.date AND f.submitted_by = ${employeeId}
      LEFT JOIN crop_data c ON DATE(c.created_at) = d.date AND c.submitted_by = ${employeeId}
      GROUP BY d.date
      ORDER BY d.date
    `;

    res.json({
      success: true,
      data: {
        pending_fields: fieldStats[0].pending_fields || 0,
        verified_fields: fieldStats[0].verified_fields || 0,
        uploaded_crops: cropStats[0].uploaded_crops || 0,
        approved_crops: cropStats[0].approved_crops || 0,
        weeklyActivity
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

