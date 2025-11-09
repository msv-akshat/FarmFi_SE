import sql from '../config/db.js';

// ==================== AUTHENTICATION ====================

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    const admins = await sql`
      SELECT * FROM admins WHERE username = ${username}
    `;

    if (admins.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const admin = admins[0];

    // Direct password comparison (no hashing as per your requirement)
    if (password !== admin.password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const jwt = (await import('jsonwebtoken')).default;
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== DASHBOARD ====================

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT f.id) FILTER (WHERE f.role = 'farmer') as total_farmers,
        COUNT(DISTINCT e.id) as total_employees,
        COUNT(DISTINCT fi.id) as total_fields,
        COUNT(DISTINCT fi.id) FILTER (WHERE fi.status = 'admin_approved') as approved_fields,
        COUNT(DISTINCT fi.id) FILTER (WHERE fi.status = 'employee_verified') as pending_admin_approval,
        COUNT(DISTINCT c.id) as total_crops,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'admin_approved') as approved_crops,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'employee_verified') as pending_crop_approval,
        COUNT(DISTINCT dp.id) FILTER (WHERE LOWER(dp.predicted_disease) != 'healthy') as total_disease_predictions,
        COALESCE(SUM(DISTINCT fi.area::numeric) FILTER (WHERE fi.status = 'admin_approved'), 0) as total_area
      FROM farmers f
      FULL OUTER JOIN employees e ON true
      FULL OUTER JOIN fields fi ON true
      FULL OUTER JOIN crop_data c ON true
      FULL OUTER JOIN disease_predictions dp ON true
    `;

    // Get recent activity (last 7 days)
    const recentActivity = await sql`
      WITH dates AS (
        SELECT generate_series(
          CURRENT_DATE - INTERVAL '6 days',
          CURRENT_DATE,
          '1 day'
        )::date as date
      )
      SELECT 
        TO_CHAR(d.date, 'DD Mon') as date,
        COUNT(DISTINCT CASE WHEN DATE(f.created_at) = d.date THEN f.id END) as new_farmers,
        COUNT(DISTINCT CASE WHEN DATE(fi.created_at) = d.date THEN fi.id END) as new_fields,
        COUNT(DISTINCT CASE WHEN DATE(c.created_at) = d.date THEN c.id END) as new_crops,
        COUNT(DISTINCT CASE WHEN DATE(dp.created_at) = d.date AND LOWER(dp.predicted_disease) != 'healthy' THEN dp.id END) as new_predictions
      FROM dates d
      LEFT JOIN farmers f ON DATE(f.created_at) = d.date AND f.role = 'farmer'
      LEFT JOIN fields fi ON DATE(fi.created_at) = d.date
      LEFT JOIN crop_data c ON DATE(c.created_at) = d.date
      LEFT JOIN disease_predictions dp ON DATE(dp.created_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;

    // Disease severity breakdown
    const diseaseStats = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE severity = 'high' AND LOWER(predicted_disease) != 'healthy') as high,
        COUNT(*) FILTER (WHERE severity = 'medium' AND LOWER(predicted_disease) != 'healthy') as medium,
        COUNT(*) FILTER (WHERE severity = 'low' AND LOWER(predicted_disease) != 'healthy') as low
      FROM disease_predictions
    `;

    res.json({
      success: true,
      data: {
        ...stats[0],
        recent_activity: recentActivity,
        disease_severity: diseaseStats[0]
      }
    });
  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== EMPLOYEE MANAGEMENT ====================

export const getEmployees = async (req, res) => {
  try {
    const { limit } = req.query;

    let employees = await sql`
      SELECT 
        e.id,
        e.username,
        e.email,
        e.role,
        e.created_at,
        COUNT(DISTINCT fi.id) as fields_verified,
        COUNT(DISTINCT c.id) as crops_verified
      FROM employees e
      LEFT JOIN fields fi ON fi.submitted_by = e.id AND fi.source = 'employee_upload'
      LEFT JOIN crop_data c ON c.submitted_by = e.id AND c.source = 'employee_upload'
      GROUP BY e.id, e.username, e.email, e.role, e.created_at
      ORDER BY e.created_at DESC
    `;

    if (limit) {
      employees = employees.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEmployeeDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const employee = await sql`
      SELECT 
        e.id,
        e.username,
        e.email,
        e.role,
        e.created_at,
        e.updated_at
      FROM employees e
      WHERE e.id = ${id}
    `;

    if (employee.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Get employee's work stats
    const stats = await sql`
      SELECT 
        COUNT(DISTINCT fi.id) as total_fields,
        COUNT(DISTINCT fi.id) FILTER (WHERE fi.status = 'employee_verified') as verified_fields,
        COUNT(DISTINCT fi.id) FILTER (WHERE fi.status = 'admin_approved') as approved_fields,
        COUNT(DISTINCT c.id) as total_crops,
        COUNT(DISTINCT c.id) FILTER (WHERE c.status = 'admin_approved') as approved_crops
      FROM fields fi
      LEFT JOIN crop_data c ON c.submitted_by = ${id} AND c.source = 'employee_upload'
      WHERE fi.submitted_by = ${id} AND fi.source = 'employee_upload'
    `;

    // Recent activity
    const recentFields = await sql`
      SELECT 
        fi.id,
        fi.field_name,
        fi.area,
        fi.status,
        fi.created_at,
        f.name as farmer_name,
        m.mandal_name,
        v.village_name
      FROM fields fi
      LEFT JOIN farmers f ON fi.farmer_id = f.id
      LEFT JOIN mandals m ON fi.mandal_id = m.id
      LEFT JOIN villages v ON fi.village_id = v.id
      WHERE fi.submitted_by = ${id}
      ORDER BY fi.created_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        ...employee[0],
        stats: stats[0],
        recent_fields: recentFields
      }
    });
  } catch (error) {
    console.error('Get employee details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, password, and email are required' 
      });
    }

    // Check if username exists
    const existing = await sql`
      SELECT id FROM employees WHERE username = ${username}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }

    const result = await sql`
      INSERT INTO employees (username, password, email, role, created_by)
      VALUES (${username}, ${password}, ${email}, 'employee', ${req.user.id})
      RETURNING id, username, email, role, created_at
    `;

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, password } = req.body;

    if (!username && !email && !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    // Build update query
    const updates = [];
    const params = [];
    
    if (username) {
      updates.push(`username = $${params.length + 1}`);
      params.push(username);
    }
    if (email) {
      updates.push(`email = $${params.length + 1}`);
      params.push(email);
    }
    if (password) {
      updates.push(`password = $${params.length + 1}`);
      params.push(password);
    }
    
    updates.push('updated_at = NOW()');
    params.push(id);

    const updateQuery = `
      UPDATE employees 
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, username, email, role, updated_at
    `;

    const result = await sql.unsafe(updateQuery, params);

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      DELETE FROM employees WHERE id = ${id}
      RETURNING id, username
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FARMER MANAGEMENT ====================

export const getFarmers = async (req, res) => {
  try {
    const { limit, search } = req.query;

    let query = sql`
      SELECT 
        f.id,
        f.name,
        f.phone,
        f.role,
        f.village_id,
        f.mandal_id,
        f.created_at,
        m.mandal_name,
        v.village_name,
        COUNT(DISTINCT fi.id) as total_fields,
        COUNT(DISTINCT c.id) as total_crops,
        COUNT(DISTINCT dp.id) as total_predictions
      FROM farmers f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN fields fi ON fi.farmer_id = f.id
      LEFT JOIN crop_data c ON c.farmer_id = f.id
      LEFT JOIN disease_predictions dp ON dp.farmer_id = f.id
      WHERE f.role = 'farmer'
    `;

    if (search) {
      query = sql`
        ${query} AND (f.name ILIKE ${`%${search}%`} OR f.phone ILIKE ${`%${search}%`})
      `;
    }

    let farmers = await sql`
      ${query}
      GROUP BY f.id, f.name, f.phone, f.role, f.village_id, f.mandal_id, f.created_at, m.mandal_name, v.village_name
      ORDER BY f.created_at DESC
    `;

    if (limit) {
      farmers = farmers.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: farmers
    });
  } catch (error) {
    console.error('Get farmers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFarmerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const farmer = await sql`
      SELECT 
        f.id,
        f.name,
        f.phone,
        f.role,
        f.village_id,
        f.mandal_id,
        f.created_at,
        f.updated_at,
        m.mandal_name,
        v.village_name
      FROM farmers f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      WHERE f.id = ${id} AND f.role = 'farmer'
    `;

    if (farmer.length === 0) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    // Get farmer's fields
    const fields = await sql`
      SELECT 
        fi.id,
        fi.field_name,
        fi.area,
        fi.status,
        fi.survey_number,
        fi.soil_type,
        fi.created_at,
        m.mandal_name,
        v.village_name,
        COUNT(DISTINCT c.id) as crop_count
      FROM fields fi
      LEFT JOIN mandals m ON fi.mandal_id = m.id
      LEFT JOIN villages v ON fi.village_id = v.id
      LEFT JOIN crop_data c ON c.field_id = fi.id
      WHERE fi.farmer_id = ${id}
      GROUP BY fi.id, fi.field_name, fi.area, fi.status, fi.survey_number, fi.soil_type, fi.created_at, m.mandal_name, v.village_name
      ORDER BY fi.created_at DESC
    `;

    // Get farmer's crops
    const crops = await sql`
      SELECT 
        c.id,
        c.crop_name,
        c.area,
        c.season,
        c.crop_year,
        c.status,
        c.created_at,
        fi.field_name
      FROM crop_data c
      LEFT JOIN fields fi ON c.field_id = fi.id
      WHERE c.farmer_id = ${id}
      ORDER BY c.created_at DESC
      LIMIT 10
    `;

    // Get disease predictions
    const predictions = await sql`
      SELECT 
        dp.id,
        dp.predicted_disease,
        dp.confidence,
        dp.severity,
        dp.created_at,
        fi.field_name,
        c.crop_name
      FROM disease_predictions dp
      LEFT JOIN fields fi ON dp.field_id = fi.id
      LEFT JOIN crop_data c ON dp.crop_id = c.id
      WHERE dp.farmer_id = ${id}
      ORDER BY dp.created_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        ...farmer[0],
        fields,
        crops,
        predictions
      }
    });
  } catch (error) {
    console.error('Get farmer details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== FIELDS MANAGEMENT ====================

export const getFields = async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = sql`
      SELECT 
        fi.id,
        fi.field_name,
        fi.area,
        fi.status,
        fi.survey_number,
        fi.soil_type,
        fi.source,
        fi.created_at,
        fi.updated_at,
        f.name as farmer_name,
        f.phone as farmer_phone,
        m.mandal_name,
        v.village_name,
        e.username as submitted_by_employee,
        COUNT(DISTINCT c.id) as crop_count
      FROM fields fi
      LEFT JOIN farmers f ON fi.farmer_id = f.id
      LEFT JOIN mandals m ON fi.mandal_id = m.id
      LEFT JOIN villages v ON fi.village_id = v.id
      LEFT JOIN employees e ON fi.submitted_by = e.id
      LEFT JOIN crop_data c ON c.field_id = fi.id
    `;

    if (status) {
      query = sql`${query} WHERE fi.status = ${status}`;
    }

    let fields = await sql`
      ${query}
      GROUP BY fi.id, fi.field_name, fi.area, fi.status, fi.survey_number, fi.soil_type, fi.source, fi.created_at, fi.updated_at, f.name, f.phone, m.mandal_name, v.village_name, e.username
      ORDER BY fi.created_at DESC
    `;

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

export const getFieldDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const field = await sql`
      SELECT 
        fi.*,
        f.name as farmer_name,
        f.phone as farmer_phone,
        m.mandal_name,
        v.village_name,
        e.username as employee_name,
        a.username as admin_name
      FROM fields fi
      LEFT JOIN farmers f ON fi.farmer_id = f.id
      LEFT JOIN mandals m ON fi.mandal_id = m.id
      LEFT JOIN villages v ON fi.village_id = v.id
      LEFT JOIN employees e ON fi.employee_verified_by = e.id
      LEFT JOIN admins a ON fi.admin_verified_by = a.id
      WHERE fi.id = ${id}
    `;

    if (field.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    // Get crops for this field
    const crops = await sql`
      SELECT 
        c.*,
        ct.crop_name,
        ct.category
      FROM crop_data c
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      WHERE c.field_id = ${id}
      ORDER BY c.created_at DESC
    `;

    res.json({
      success: true,
      data: {
        ...field[0],
        crops
      }
    });
  } catch (error) {
    console.error('Get field details error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveField = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;

    const result = await sql`
      UPDATE fields
      SET 
        status = 'admin_approved',
        admin_verified_by = ${adminId},
        admin_verified_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    res.json({
      success: true,
      message: 'Field approved successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Approve field error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectField = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const result = await sql`
      UPDATE fields
      SET 
        status = 'rejected',
        rejection_reason = ${rejection_reason},
        admin_verified_by = ${req.user.id},
        admin_verified_at = NOW(),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Field not found' });
    }

    res.json({
      success: true,
      message: 'Field rejected successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Reject field error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CROPS MANAGEMENT ====================

export const getCrops = async (req, res) => {
  try {
    const { status, limit } = req.query;

    let query = sql`
      SELECT 
        c.*,
        f.name as farmer_name,
        fi.field_name,
        ct.crop_name,
        ct.category,
        e.username as submitted_by_employee
      FROM crop_data c
      LEFT JOIN farmers f ON c.farmer_id = f.id
      LEFT JOIN fields fi ON c.field_id = fi.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN employees e ON c.submitted_by = e.id
    `;

    if (status) {
      query = sql`${query} WHERE c.status = ${status}`;
    }

    let crops = await sql`
      ${query}
      ORDER BY c.created_at DESC
    `;

    if (limit) {
      crops = crops.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: crops
    });
  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCropById = async (req, res) => {
  try {
    const { id } = req.params;

    const crop = await sql`
      SELECT 
        c.*,
        f.id as farmer_id,
        f.name as farmer_name,
        f.phone as farmer_phone,
        fi.id as field_id,
        fi.survey_number as field_survey_number,
        fi.field_name,
        ct.crop_name,
        ct.category,
        v.village_name,
        m.mandal_name,
        e.username as uploaded_by_employee
      FROM crop_data c
      LEFT JOIN farmers f ON c.farmer_id = f.id
      LEFT JOIN fields fi ON c.field_id = fi.id
      LEFT JOIN crop_types ct ON c.crop_type_id = ct.id
      LEFT JOIN villages v ON fi.village_id = v.id
      LEFT JOIN mandals m ON fi.mandal_id = m.id
      LEFT JOIN employees e ON c.submitted_by = e.id
      WHERE c.id = ${id}
    `;

    if (crop.length === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    // Get disease predictions for this crop
    const predictions = await sql`
      SELECT 
        dp.id,
        dp.predicted_disease as disease_name,
        dp.confidence,
        dp.severity,
        dp.created_at
      FROM disease_predictions dp
      WHERE dp.crop_id = ${id}
      ORDER BY dp.created_at DESC
    `;

    const cropData = {
      ...crop[0],
      predictions: predictions
    };

    res.json({
      success: true,
      data: cropData
    });
  } catch (error) {
    console.error('Get crop by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const approveCrop = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sql`
      UPDATE crop_data
      SET 
        status = 'admin_approved',
        admin_verified_by = ${req.user.id},
        admin_verified_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({
      success: true,
      message: 'Crop approved successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Approve crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const rejectCrop = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
      return res.status(400).json({ 
        success: false, 
        message: 'Rejection reason is required' 
      });
    }

    const result = await sql`
      UPDATE crop_data
      SET 
        status = 'rejected',
        rejection_reason = ${rejection_reason},
        admin_verified_by = ${req.user.id},
        admin_verified_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({
      success: true,
      message: 'Crop rejected successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Reject crop error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== ANALYTICS ====================

export const getFieldsAnalytics = async (req, res) => {
  try {
    // Status distribution
    const statusDistribution = await sql`
      SELECT 
        status as name,
        COUNT(*)::int as count,
        COALESCE(SUM(area::numeric), 0) as total_area
      FROM fields
      GROUP BY status
    `;

    // Fields by mandal
    const mandalDistribution = await sql`
      SELECT 
        m.mandal_name as mandal,
        COUNT(fi.id)::int as count,
        COALESCE(SUM(fi.area::numeric), 0) as total_area
      FROM mandals m
      LEFT JOIN fields fi ON fi.mandal_id = m.id
      GROUP BY m.mandal_name
      ORDER BY count DESC
      LIMIT 10
    `;

    // Soil type distribution
    const soilDistribution = await sql`
      SELECT 
        soil_type,
        COUNT(*)::int as count
      FROM fields
      WHERE soil_type IS NOT NULL
      GROUP BY soil_type
      ORDER BY count DESC
    `;

    // Monthly trend
    const monthlyTrend = await sql`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*)::int as count
      FROM fields
      WHERE created_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;

    res.json({
      success: true,
      data: {
        status_distribution: statusDistribution,
        mandal_distribution: mandalDistribution,
        soil_distribution: soilDistribution,
        monthly_trend: monthlyTrend
      }
    });
  } catch (error) {
    console.error('Get fields analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCropsAnalytics = async (req, res) => {
  try {
    // Crop distribution
    const cropDistribution = await sql`
      SELECT 
        ct.crop_name,
        COUNT(c.id)::int as count,
        COALESCE(SUM(c.area::numeric), 0) as total_area
      FROM crop_types ct
      LEFT JOIN crop_data c ON c.crop_type_id = ct.id
      WHERE c.id IS NOT NULL
      GROUP BY ct.crop_name
      ORDER BY count DESC
      LIMIT 15
    `;

    // Season distribution
    const seasonDistribution = await sql`
      SELECT 
        season as name,
        COUNT(*)::int as count,
        COALESCE(SUM(area::numeric), 0) as total_area
      FROM crop_data
      GROUP BY season
    `;

    // Status distribution
    const statusDistribution = await sql`
      SELECT 
        status as name,
        COUNT(*)::int as count
      FROM crop_data
      GROUP BY status
    `;

    // Year-wise trend
    const yearlyTrends = await sql`
      SELECT 
        crop_year as year,
        COUNT(*)::int as count
      FROM crop_data
      GROUP BY crop_year
      ORDER BY crop_year ASC
      LIMIT 5
    `;

    res.json({
      success: true,
      data: {
        crop_distribution: cropDistribution,
        season_distribution: seasonDistribution,
        status_distribution: statusDistribution,
        yearly_trends: yearlyTrends
      }
    });
  } catch (error) {
    console.error('Get crops analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDiseaseAnalytics = async (req, res) => {
  try {
    // Disease distribution (exclude "Healthy" or "healthy")
    const diseaseDistribution = await sql`
      SELECT 
        predicted_disease as disease_name,
        COUNT(*)::int as count,
        AVG(confidence::numeric) as avg_confidence
      FROM disease_predictions
      WHERE LOWER(predicted_disease) != 'healthy'
      GROUP BY predicted_disease
      ORDER BY count DESC
      LIMIT 15
    `;

    // Severity distribution (exclude healthy predictions)
    const severityDistribution = await sql`
      SELECT 
        INITCAP(severity) as name,
        COUNT(*)::int as count
      FROM disease_predictions
      WHERE LOWER(predicted_disease) != 'healthy'
      GROUP BY severity
      ORDER BY 
        CASE severity
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END
    `;

    // Disease trends (last 6 months)
    const monthlyTrends = await sql`
      SELECT 
        TO_CHAR(created_at, 'Mon YYYY') as month,
        COUNT(*)::int as count,
        COUNT(*) FILTER (WHERE severity = 'high' AND LOWER(predicted_disease) != 'healthy')::int as high_severity,
        COUNT(*) FILTER (WHERE severity = 'medium' AND LOWER(predicted_disease) != 'healthy')::int as medium_severity,
        COUNT(*) FILTER (WHERE severity = 'low' AND LOWER(predicted_disease) != 'healthy')::int as low_severity
      FROM disease_predictions
      WHERE created_at >= NOW() - INTERVAL '6 months'
        AND LOWER(predicted_disease) != 'healthy'
      GROUP BY TO_CHAR(created_at, 'Mon YYYY'), DATE_TRUNC('month', created_at)
      ORDER BY DATE_TRUNC('month', created_at) ASC
    `;

    // Crop-wise disease frequency (exclude healthy)
    const cropWiseDisease = await sql`
      SELECT 
        c.crop_name,
        COUNT(dp.id)::int as prediction_count,
        COUNT(*) FILTER (WHERE dp.severity = 'high')::int as high_severity_count
      FROM crop_data c
      LEFT JOIN disease_predictions dp ON dp.crop_id = c.id AND LOWER(dp.predicted_disease) != 'healthy'
      WHERE dp.id IS NOT NULL
      GROUP BY c.crop_name
      ORDER BY prediction_count DESC
      LIMIT 10
    `;

    // Recent high-severity predictions (exclude healthy)
    const highSeverityAlerts = await sql`
      SELECT 
        dp.id,
        dp.predicted_disease as disease_name,
        dp.confidence,
        dp.severity,
        dp.created_at,
        f.name as farmer_name,
        fi.field_name,
        c.crop_name
      FROM disease_predictions dp
      LEFT JOIN farmers f ON dp.farmer_id = f.id
      LEFT JOIN fields fi ON dp.field_id = fi.id
      LEFT JOIN crop_data c ON dp.crop_id = c.id
      WHERE dp.severity = 'high' AND LOWER(dp.predicted_disease) != 'healthy'
      ORDER BY dp.created_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        disease_distribution: diseaseDistribution,
        severity_distribution: severityDistribution,
        monthly_trends: monthlyTrends,
        crop_wise_disease: cropWiseDisease,
        high_severity_alerts: highSeverityAlerts
      }
    });
  } catch (error) {
    console.error('Get disease analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== PROFILE & SETTINGS ====================

export const getProfile = async (req, res) => {
  try {
    const adminId = req.user.id;

    const admin = await sql`
      SELECT id, username, email, role, created_at, updated_at
      FROM admins
      WHERE id = ${adminId}
    `;

    if (admin.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    res.json({
      success: true,
      data: admin[0]
    });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { username, email } = req.body;

    if (!username && !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'At least one field is required to update' 
      });
    }

    const updates = [];
    const params = [];
    
    if (username) {
      updates.push(`username = $${params.length + 1}`);
      params.push(username);
    }
    if (email) {
      updates.push(`email = $${params.length + 1}`);
      params.push(email);
    }
    
    updates.push('updated_at = NOW()');
    params.push(adminId);

    const updateQuery = `
      UPDATE admins 
      SET ${updates.join(', ')}
      WHERE id = $${params.length}
      RETURNING id, username, email, role, updated_at
    `;

    const result = await sql.unsafe(updateQuery, params);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old password and new password are required' 
      });
    }

    const admin = await sql`SELECT password FROM admins WHERE id = ${adminId}`;
    
    if (admin.length === 0) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    // Direct password comparison
    if (oldPassword !== admin[0].password) {
      return res.status(401).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }

    await sql`
      UPDATE admins 
      SET password = ${newPassword}, updated_at = NOW()
      WHERE id = ${adminId}
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
