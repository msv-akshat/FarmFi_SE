import sql from '../config/db.js';

// ==================== DASHBOARD ====================

export const getDashboardStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const stats = await sql`
      SELECT 
        COUNT(DISTINCT f.id) FILTER (WHERE f.status = 'admin_approved') as approved_fields,
        COUNT(DISTINCT f.id) as total_fields,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'admin_approved') as approved_crops,
        COUNT(DISTINCT c.id) as total_crops,
        COALESCE(SUM(DISTINCT f.area::numeric) FILTER (WHERE f.status = 'admin_approved'), 0) as total_area,
        COUNT(DISTINCT dp.id) FILTER (WHERE LOWER(dp.predicted_disease) != 'healthy') as total_predictions
      FROM farmers farmer
      LEFT JOIN fields f ON f.farmer_id = farmer.id
      LEFT JOIN crop_data c ON c.farmer_id = farmer.id
      LEFT JOIN disease_predictions dp ON dp.farmer_id = farmer.id
      WHERE farmer.id = ${farmerId}
    `;

    res.json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FIELDS ====================

// Get all fields for farmer
export const getFields = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { status, limit } = req.query;

    let query = sql`
      SELECT 
        f.id,
        f.farmer_id,
        f.field_name,
        f.area as area_acres,
        f.mandal_id,
        f.village_id,
        f.survey_number,
        f.soil_type,
        f.status,
        f.submitted_by,
        f.employee_verified_by,
        f.admin_verified_by,
        f.source,
        f.created_at,
        f.updated_at,
        m.mandal_name,
        v.village_name,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'admin_approved') as approved_crops_count,
        COUNT(DISTINCT c.id) as total_crops_count
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN crop_data c ON c.field_id = f.id
      WHERE f.farmer_id = ${farmerId}
    `;

    if (status) {
      query = sql`${query} AND f.status = ${status}`;
    }

    let fields = await sql`
      ${query}
      GROUP BY f.id, m.mandal_name, v.village_name
      ORDER BY f.created_at DESC
    `;

    // Apply limit if specified
    if (limit) {
      fields = fields.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: fields
    });
  } catch (error) {
    console.error('Get fields error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single field details with analytics
export const getFieldDetails = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const field = await sql`
      SELECT 
        f.id,
        f.farmer_id,
        f.field_name,
        f.area as area_acres,
        f.mandal_id,
        f.village_id,
        f.survey_number,
        f.soil_type,
        f.status,
        f.submitted_by,
        f.employee_verified_by,
        f.admin_verified_by,
        f.source,
        f.created_at,
        f.updated_at,
        m.mandal_name,
        v.village_name,
        e.username as employee_verified_by_name,
        a.username as admin_verified_by_name
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN employees e ON f.employee_verified_by = e.id
      LEFT JOIN admins a ON f.admin_verified_by = a.id
      WHERE f.id = ${id} AND f.farmer_id = ${farmerId}
    `;

    if (field.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    // Get all crops for this field
    const crops = await sql`
      SELECT 
        c.id,
        c.field_id,
        c.farmer_id,
        c.crop_type_id,
        c.area,
        c.season,
        c.crop_year,
        c.sowing_date,
        c.expected_harvest_date,
        c.status,
        c.created_at,
        c.updated_at,
        ct.crop_name,
        ct.category as crop_category,
        COUNT(dp.id) as prediction_count
      FROM crop_data c
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN disease_predictions dp ON dp.crop_id = c.id
      WHERE c.field_id = ${id}
      GROUP BY c.id, c.field_id, c.farmer_id, c.crop_type_id, c.area, c.season, 
               c.crop_year, c.sowing_date, c.expected_harvest_date, c.status, 
               c.created_at, c.updated_at, ct.crop_name, ct.category
      ORDER BY c.created_at DESC
    `;

    // Get current growing crops (admin approved only)
    const currentCrops = crops.filter(c => c.status === 'admin_approved');

    // Get disease predictions for this field
    const predictions = await sql`
      SELECT 
        dp.*,
        ct.crop_name,
        c.season,
        c.crop_year
      FROM disease_predictions dp
      LEFT JOIN crop_data c ON dp.crop_id = c.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      WHERE dp.field_id = ${id}
      ORDER BY dp.created_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        ...field[0],
        all_crops: crops,
        current_crops: currentCrops,
        recent_predictions: predictions,
        analytics: {
          total_crops: crops.length,
          approved_crops: currentCrops.length,
          total_predictions: predictions.length
        }
      }
    });
  } catch (error) {
    console.error('Get field details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new field
export const createField = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_name, area, village_id, mandal_id, survey_number, soil_type } = req.body;

    // Validate required fields
    if (!field_name || !area || !village_id || !mandal_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field name, area, mandal and village are required' 
      });
    }

    const result = await sql`
      INSERT INTO fields (
        farmer_id, field_name, area, village_id, mandal_id, 
        survey_number, soil_type, status, submitted_by, source
      ) VALUES (
        ${farmerId}, ${field_name}, ${area}, ${village_id}, ${mandal_id},
        ${survey_number || null}, ${soil_type || null}, 'pending', ${farmerId}, 'farmer_app'
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Field created successfully. Awaiting employee verification.',
      data: result[0]
    });
  } catch (error) {
    console.error('Create field error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CROPS ====================

// Get all crops for farmer
export const getCrops = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { status, field_id, season, year } = req.query;

    // Build WHERE conditions dynamically
    let whereConditions = ['c.farmer_id = $1'];
    let params = [farmerId];
    let paramIndex = 2;

    if (status) {
      whereConditions.push(`c.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }
    if (field_id) {
      whereConditions.push(`c.field_id = $${paramIndex}`);
      params.push(parseInt(field_id));
      paramIndex++;
    }
    if (season) {
      whereConditions.push(`c.season = $${paramIndex}`);
      params.push(season);
      paramIndex++;
    }
    if (year) {
      whereConditions.push(`c.crop_year = $${paramIndex}`);
      params.push(parseInt(year));
      paramIndex++;
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const crops = await sql.unsafe(`
      SELECT 
        c.id,
        c.field_id,
        c.farmer_id,
        c.crop_type_id,
        c.area,
        c.season,
        c.crop_year,
        c.sowing_date,
        c.expected_harvest_date,
        c.status,
        c.created_at,
        c.updated_at,
        f.field_name,
        m.mandal_name,
        v.village_name,
        ct.crop_name,
        ct.category as crop_category,
        COUNT(dp.id) as prediction_count
      FROM crop_data c
      LEFT JOIN fields f ON c.field_id = f.id
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN disease_predictions dp ON dp.crop_id = c.id
      ${whereClause}
      GROUP BY c.id, c.field_id, c.farmer_id, c.crop_type_id, c.area, c.season,
               c.crop_year, c.sowing_date, c.expected_harvest_date, c.status,
               c.created_at, c.updated_at, f.field_name, m.mandal_name, 
               v.village_name, ct.crop_name, ct.category
      ORDER BY c.created_at DESC
    `, params);

    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get crop details with full analytics
export const getCropDetails = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const crop = await sql`
      SELECT 
        c.id,
        c.field_id,
        c.farmer_id,
        c.crop_type_id,
        c.area,
        c.season,
        c.crop_year,
        c.sowing_date,
        c.expected_harvest_date,
        c.status,
        c.employee_verified_by,
        c.employee_verified_at,
        c.admin_verified_by,
        c.admin_verified_at,
        c.rejection_reason,
        c.created_at,
        c.updated_at,
        f.field_name,
        f.area as field_area,
        f.survey_number,
        f.soil_type,
        m.mandal_name,
        v.village_name,
        ct.crop_name,
        ct.category as crop_category,
        e.username as employee_verified_by_name,
        a.username as admin_verified_by_name
      FROM crop_data c
      LEFT JOIN fields f ON c.field_id = f.id
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN employees e ON c.employee_verified_by = e.id
      LEFT JOIN admins a ON c.admin_verified_by = a.id
      WHERE c.id = ${id} AND c.farmer_id = ${farmerId}
    `;

    if (crop.length === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Get all disease predictions for this crop
    const predictions = await sql`
      SELECT * FROM disease_predictions
      WHERE crop_id = ${id}
      ORDER BY created_at DESC
    `;

    // Calculate analytics
    const severityCount = {
      high: predictions.filter(p => p.severity === 'high').length,
      medium: predictions.filter(p => p.severity === 'medium').length,
      low: predictions.filter(p => p.severity === 'low').length
    };

    res.json({
      success: true,
      data: {
        ...crop[0],
        predictions,
        analytics: {
          total_predictions: predictions.length,
          severity_breakdown: severityCount,
          latest_prediction: predictions[0] || null
        }
      }
    });
  } catch (error) {
    console.error('Get crop details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create new crop with season validation
export const createCrop = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_id, crop_name, crop_type_id, area, season, crop_year, sowing_date } = req.body;

    // Validate required fields
    if (!field_id || !crop_name || !crop_type_id || !area || !season || !crop_year) {
      return res.status(400).json({ 
        success: false, 
        message: 'All crop details are required' 
      });
    }

    // Validate season
    const validSeasons = ['Rabi', 'Kharif', 'Whole Year'];
    if (!validSeasons.includes(season)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Season must be Rabi, Kharif, or Whole Year' 
      });
    }

    // Check if field belongs to farmer and is approved
    const field = await sql`
      SELECT * FROM fields 
      WHERE id = ${field_id} AND farmer_id = ${farmerId} AND status = 'admin_approved'
    `;

    if (field.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Field not found or not approved yet' 
      });
    }

    // Validate crop overlap rules
    const existingCrops = await sql`
      SELECT * FROM crop_data
      WHERE field_id = ${field_id}
      AND crop_year = ${crop_year}
      AND status != 'rejected'
    `;

    // Check for "Whole Year" conflicts
    const hasWholeYear = existingCrops.some(c => c.season === 'Whole Year');
    if (hasWholeYear || season === 'Whole Year') {
      return res.status(400).json({
        success: false,
        message: season === 'Whole Year' 
          ? 'Cannot add Whole Year crop when other crops exist for this year'
          : 'Cannot add crop when a Whole Year crop exists for this year'
      });
    }

    // Check for duplicate season
    const sameSeason = existingCrops.filter(c => c.season === season);
    if (sameSeason.length > 0) {
      return res.status(400).json({
        success: false,
        message: `A ${season} crop already exists for this field in ${crop_year}`
      });
    }

    // Create crop
    const result = await sql`
      INSERT INTO crop_data (
        field_id, farmer_id, crop_name, crop_type_id, area, season, crop_year,
        sowing_date, status, submitted_by, source
      ) VALUES (
        ${field_id}, ${farmerId}, ${crop_name}, ${crop_type_id}, ${area}, ${season}, ${crop_year},
        ${sowing_date || null}, 'pending', ${farmerId}, 'farmer_app'
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Crop added successfully. Awaiting verification.',
      data: result[0]
    });
  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get current growing crops for a field (for disease detection)
export const getCurrentCrops = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_id } = req.params;

    const crops = await sql`
      SELECT 
        c.*,
        ct.category as crop_category
      FROM crop_data c
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      WHERE c.field_id = ${field_id}
      AND c.farmer_id = ${farmerId}
      AND c.status = 'admin_approved'
      ORDER BY c.created_at DESC
    `;

    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('Get current crops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DISEASE PREDICTIONS ====================

// Get all predictions with filters
export const getPredictions = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_id, crop_id, severity, limit } = req.query;

    // Build WHERE conditions dynamically
    let whereConditions = ['dp.farmer_id = $1'];
    let params = [farmerId];
    let paramIndex = 2;

    if (field_id) {
      whereConditions.push(`dp.field_id = $${paramIndex}`);
      params.push(parseInt(field_id));
      paramIndex++;
    }
    if (crop_id) {
      whereConditions.push(`dp.crop_id = $${paramIndex}`);
      params.push(parseInt(crop_id));
      paramIndex++;
    }
    if (severity) {
      whereConditions.push(`dp.severity = $${paramIndex}`);
      params.push(severity);
      paramIndex++;
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    const limitClause = limit ? `LIMIT ${parseInt(limit)}` : '';

    const predictions = await sql.unsafe(`
      SELECT 
        dp.*,
        f.field_name,
        ct.crop_name,
        c.season,
        c.crop_year
      FROM disease_predictions dp
      LEFT JOIN fields f ON dp.field_id = f.id
      LEFT JOIN crop_data c ON dp.crop_id = c.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      ${whereClause}
      ORDER BY dp.created_at DESC
      ${limitClause}
    `, params);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error) {
    console.error('Get predictions error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single prediction details
export const getPredictionDetails = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { id } = req.params;

    const prediction = await sql`
      SELECT 
        dp.*,
        f.field_name,
        f.survey_number,
        ct.crop_name,
        c.season,
        c.crop_year,
        m.mandal_name,
        v.village_name
      FROM disease_predictions dp
      LEFT JOIN fields f ON dp.field_id = f.id
      LEFT JOIN crop_data c ON dp.crop_id = c.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      WHERE dp.id = ${id} AND dp.farmer_id = ${farmerId}
    `;

    if (prediction.length === 0) {
      return res.status(404).json({ success: false, message: 'Prediction not found' });
    }

    res.json({
      success: true,
      data: prediction[0]
    });
  } catch (error) {
    console.error('Get prediction details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Save disease prediction with S3 upload and Lambda prediction
export const savePrediction = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { field_id, crop_id } = req.body;

    // Validate image upload
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Image file is required' 
      });
    }

    // Validate crop belongs to farmer and is approved
    const cropData = await sql`
      SELECT cd.*, ct.crop_name
      FROM crop_data cd
      JOIN crop_types ct ON cd.crop_type_id = ct.id
      WHERE cd.id = ${crop_id} 
      AND cd.farmer_id = ${farmerId}
      AND cd.field_id = ${field_id}
      AND cd.status = 'admin_approved'
    `;

    if (cropData.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid crop or crop not approved' 
      });
    }

    const cropName = cropData[0].crop_name.toLowerCase();

    // Map crop name to plant name for Lambda
    const CROP_TO_PLANT_MAPPING = {
      'maize': 'maize',
      'corn': 'corn',
      'tomato': 'tomato',
      'potato': 'potato',
      'grape': 'grape',
      'apple': 'apple',
      'pepper': 'pepper',
      'bell pepper': 'pepper',
      'cherry': 'cherry',
      'blueberry': 'blueberry',
      'peach': 'peach',
      'raspberry': 'raspberry',
      'soybean': 'soybean',
      'squash': 'squash',
      'strawberry': 'strawberry',
      'orange': 'orange'
    };

    const plantName = CROP_TO_PLANT_MAPPING[cropName];
    if (!plantName) {
      return res.status(400).json({ 
        success: false, 
        message: `Disease detection not available for crop: ${cropName}` 
      });
    }

    // Upload image to S3
    const AWS = (await import('aws-sdk')).default;
    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION
    });

    const s3Key = `images/${Date.now()}_${req.file.originalname}`;
    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype
    };

    const s3Result = await s3.putObject(s3Params).promise();
    const imageUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Call Lambda for disease prediction
    const lambdaUrl = 'https://fecil5ew47tajxpqobh45lar640pwlmv.lambda-url.us-east-1.on.aws/';
    const base64Image = req.file.buffer.toString('base64');

    const lambdaPayload = {
      image: base64Image,
      plant: plantName,
      mode: 'predict'
    };

    const lambdaResponse = await fetch(lambdaUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lambdaPayload)
    });

    if (!lambdaResponse.ok) {
      throw new Error(`Lambda invocation failed: ${lambdaResponse.statusText}`);
    }

    const lambdaResult = await lambdaResponse.json();
    const { prediction, confidence } = lambdaResult;

    // Calculate severity based on confidence
    let severity = 'low';
    if (confidence > 0.85) {
      severity = 'high';
    } else if (confidence >= 0.6) {
      severity = 'medium';
    }

    // Generate recommendations based on disease
    const diseaseType = prediction.includes('healthy') ? 'healthy' : prediction.split('___')[1] || prediction;
    let recommendations = '';
    
    if (prediction.includes('healthy')) {
      recommendations = 'Crop appears healthy. Continue regular monitoring and maintain good agricultural practices.';
    } else {
      recommendations = `Disease detected: ${diseaseType}. Recommended actions:\n`;
      recommendations += '1. Isolate affected plants if possible\n';
      recommendations += '2. Consult with agricultural extension officer\n';
      recommendations += '3. Consider appropriate fungicide/treatment\n';
      recommendations += '4. Monitor surrounding crops for spread\n';
      recommendations += '5. Maintain proper field hygiene';
    }

    // Save prediction to database
    const result = await sql`
      INSERT INTO disease_predictions (
        farmer_id, field_id, crop_id, image_url, predicted_disease,
        confidence, recommendations, severity
      ) VALUES (
        ${farmerId}, ${field_id}, ${crop_id}, ${imageUrl}, ${prediction},
        ${confidence}, ${recommendations}, ${severity}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      message: 'Disease prediction completed successfully',
      prediction: {
        id: result[0].id,
        predicted_disease: result[0].predicted_disease,
        confidence: result[0].confidence,
        severity: result[0].severity,
        recommendations: result[0].recommendations,
        image_url: result[0].image_url,
        created_at: result[0].created_at
      }
    });
  } catch (error) {
    console.error('Save prediction error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to process disease prediction' 
    });
  }
};

// ==================== UTILITIES ====================

// Get crop types
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

// ==================== PROFILE & SETTINGS ====================

// Change password
export const changePassword = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }

    // Get current farmer
    const farmer = await sql`SELECT * FROM farmers WHERE id = ${farmerId}`;
    
    if (farmer.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    // Verify old password
    const bcrypt = (await import('bcrypt')).default;
    const isValid = await bcrypt.compare(oldPassword, farmer[0].password);
    
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await sql`
      UPDATE farmers 
      SET password = ${hashedPassword}, updated_at = NOW()
      WHERE id = ${farmerId}
    `;

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const farmerId = req.user.id;
    const { name, phone, village_id } = req.body;

    // Validate at least one field to update
    if (!name && !phone && !village_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    // Check if phone is being updated and if it's already taken
    if (phone) {
      const existingFarmer = await sql`
        SELECT id FROM farmers 
        WHERE phone = ${phone} AND id != ${farmerId}
      `;
      
      if (existingFarmer.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number is already registered' 
        });
      }
    }

    // Build update query
    const updates = [];
    const params = [];
    
    if (name) {
      updates.push('name = $' + (params.length + 1));
      params.push(name);
    }
    if (phone) {
      updates.push('phone = $' + (params.length + 1));
      params.push(phone);
    }
    if (village_id) {
      updates.push('village_id = $' + (params.length + 1));
      params.push(parseInt(village_id));
    }
    
    updates.push('updated_at = NOW()');
    params.push(farmerId);

    const updateQuery = `
      UPDATE farmers 
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, name, phone, village_id
    `;

    const result = await sql.unsafe(updateQuery, params);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get farmer profile
export const getProfile = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const farmer = await sql`
      SELECT 
        f.id,
        f.name,
        f.phone,
        f.village_id,
        f.created_at,
        v.village_name,
        m.mandal_name,
        m.id as mandal_id
      FROM farmers f
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN mandals m ON v.mandal_id = m.id
      WHERE f.id = ${farmerId}
    `;

    if (farmer.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    res.json({
      success: true,
      data: farmer[0]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get analytics data
export const getAnalytics = async (req, res) => {
  try {
    const farmerId = req.user.id;

    // Severity breakdown
    const severityData = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE severity = 'high' AND LOWER(predicted_disease) != 'healthy') as high,
        COUNT(*) FILTER (WHERE severity = 'medium' AND LOWER(predicted_disease) != 'healthy') as medium,
        COUNT(*) FILTER (WHERE severity = 'low' AND LOWER(predicted_disease) != 'healthy') as low
      FROM disease_predictions
      WHERE farmer_id = ${farmerId}
    `;

    // Crop distribution
    const cropDistribution = await sql`
      SELECT 
        ct.crop_name,
        COUNT(c.id) as count
      FROM crop_data c
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      WHERE c.farmer_id = ${farmerId} AND c.status = 'admin_approved'
      GROUP BY ct.crop_name
      ORDER BY count DESC
      LIMIT 10
    `;

    // Field status
    const fieldStatus = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'admin_approved') as admin_approved,
        COUNT(*) FILTER (WHERE status = 'employee_verified') as employee_verified,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
      FROM fields
      WHERE farmer_id = ${farmerId}
    `;

    // Predictions trend (last 7 days)
    const predictionsTrend = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM disease_predictions
      WHERE farmer_id = ${farmerId}
        AND created_at >= NOW() - INTERVAL '30 days'
        AND LOWER(predicted_disease) != 'healthy'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Area distribution by field
    const areaDistribution = await sql`
      SELECT 
        field_name,
        area::numeric as area
      FROM fields
      WHERE farmer_id = ${farmerId} AND status = 'admin_approved'
      ORDER BY area DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        severity: severityData[0],
        cropDistribution,
        fieldStatus: fieldStatus[0],
        predictionsTrend,
        areaDistribution
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
