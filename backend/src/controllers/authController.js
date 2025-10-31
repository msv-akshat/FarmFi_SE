import sql from '../config/db.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Farmer Registration
export const registerFarmer = async (req, res) => {
  try {
    const { name, phone, password, mandal_id, village_id, address } = req.body;

    // Validate required fields
    if (!name || !phone || !password || !mandal_id || !village_id) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, phone, password, mandal and village are required' 
      });
    }

    // Check if phone already exists
    const existing = await sql`
      SELECT id FROM farmers WHERE phone = ${phone}
    `;

    if (existing.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Phone number already registered' 
      });
    }

    // Create farmer (no password hashing for now)
    const result = await sql`
      INSERT INTO farmers (name, phone, password, mandal_id, village_id, address, role)
      VALUES (${name}, ${phone}, ${password}, ${mandal_id}, ${village_id}, ${address || null}, 'farmer')
      RETURNING id, name, phone, mandal_id, village_id, role, created_at
    `;

    // Generate token
    const token = jwt.sign(
      { id: result[0].id, role: 'farmer', phone: result[0].phone },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        id: result[0].id,
        name: result[0].name,
        phone: result[0].phone,
        role: result[0].role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login (Farmer, Employee, Admin)
export const login = async (req, res) => {
  try {
    const { phone, username, password, role } = req.body;

    // For farmer, require phone; for employee/admin, require username
    const identifier = role === 'farmer' ? phone : (username || phone);

    if (!identifier || !password || !role) {
      return res.status(400).json({ 
        success: false, 
        message: role === 'farmer' ? 'Phone, password and role are required' : 'Username, password and role are required'
      });
    }

    let user;
    let tableName;

    // Query based on role
    if (role === 'farmer') {
      const result = await sql`SELECT * FROM farmers WHERE phone = ${identifier}`;
      user = result[0];
      tableName = 'farmers';
    } else if (role === 'employee') {
      const result = await sql`SELECT * FROM employees WHERE username = ${identifier}`;
      user = result[0];
      tableName = 'employees';
    } else if (role === 'admin') {
      const result = await sql`SELECT * FROM admins WHERE username = ${identifier}`;
      user = result[0];
      tableName = 'admins';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password (plain text comparison for now)
    if (user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { 
        id: user.id, 
        role: role,
        phone: role === 'farmer' ? user.phone : user.username 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name || user.username,
        phone: role === 'farmer' ? user.phone : user.username,
        role: role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Mandals and Villages (for registration)
export const getLocations = async (req, res) => {
  try {
    const mandals = await sql`SELECT id, mandal_name as name FROM mandals ORDER BY mandal_name`;
    const villages = await sql`SELECT id, village_name as name, mandal_id FROM villages ORDER BY village_name`;

    res.json({
      success: true,
      mandals,
      villages
    });
  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { old_password, new_password } = req.body;
    const userId = req.user.id;
    const role = req.user.role;

    if (!old_password || !new_password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Old and new password are required' 
      });
    }

    // Get user based on role
    let user;
    let tableName;

    if (role === 'farmer') {
      const result = await sql`SELECT * FROM farmers WHERE id = ${userId}`;
      user = result[0];
      tableName = 'farmers';
    } else if (role === 'employee') {
      const result = await sql`SELECT * FROM employees WHERE id = ${userId}`;
      user = result[0];
      tableName = 'employees';
    } else if (role === 'admin') {
      const result = await sql`SELECT * FROM admins WHERE id = ${userId}`;
      user = result[0];
      tableName = 'admins';
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Verify old password (plain text comparison for now)
    if (user.password !== old_password) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    // Update password (no hashing for now)
    await sql`
      UPDATE ${sql(tableName)}
      SET password = ${new_password}, updated_at = NOW()
      WHERE id = ${userId}
    `;

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
