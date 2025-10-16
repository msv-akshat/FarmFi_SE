import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

// Farmer registration
export const register = async (req, res, next) => {
  try {
    const { name, phone, password, mandal_id, village_id } = req.body;
    const userExists = await sql`SELECT id FROM farmers WHERE phone = ${phone}`;
    if (userExists.length) return next(new AppError('Phone number already registered', 400));
    const hashed = await bcrypt.hash(password, 10);
    const result = await sql`
      INSERT INTO farmers (name, phone, password, mandal_id, village_id)
      VALUES (${name}, ${phone}, ${hashed}, ${mandal_id}, ${village_id})
      RETURNING id, name, phone, mandal_id, village_id
    `;
    const farmer = result[0];
    const token = jwt.sign({ id: farmer.id, role: 'farmer' }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    res.status(201).json({ success: true, data: { farmer, token } });
  } catch (error) { next(error); }
};

// Login (farmer/employee/admin)
export const login = async (req, res, next) => {
  try {
    const { identifier, password, userType } = req.body;
    let user;
    switch (userType) {
      case 'farmer':
        user = await sql`SELECT * FROM farmers WHERE phone = ${identifier}`;
        break;
      case 'employee':
      case 'admin':
        user = await sql`SELECT * FROM employees WHERE username = ${identifier} AND role = ${userType}`;
        break;
      default:
        return next(new AppError('Invalid user type', 400));
    }
    if (!user.length) return next(new AppError('Invalid credentials', 401));
    const valid = await bcrypt.compare(password, user[0].password);
    if (!valid) return next(new AppError('Invalid credentials', 401));
    const token = jwt.sign({ id: user[0].id, role: userType }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
    const { password: _, ...data } = user[0];
    res.status(200).json({ success: true, data: { user: data, token } });
  } catch (error) { next(error); }
};
