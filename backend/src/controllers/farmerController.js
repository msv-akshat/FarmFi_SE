import bcrypt from 'bcryptjs';
import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

// Get current user's profile
export const getMyProfile = async (req, res, next) => {
  try {
    const farmer = await sql`
      SELECT id, name, phone, mandal_id, village_id
      FROM farmers
      WHERE id = ${req.user.id}
    `;
    if (!farmer.length) return next(new AppError('Farmer not found', 404));
    res.json({ success: true, data: farmer[0] });
  } catch (error) { next(error); }
};

// Update profile
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, phone, mandal_id, village_id, password } = req.body;
    let updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (mandal_id) updates.mandal_id = mandal_id;
    if (village_id) updates.village_id = village_id;
    if (password) updates.password = await bcrypt.hash(password, 10);
    if (Object.keys(updates).length === 0) return next(new AppError('No fields to update', 400));
    await sql`UPDATE farmers SET ${sql(updates)} WHERE id = ${req.user.id}`;
    res.json({ success: true, message: 'Profile updated!' });
  } catch (error) { next(error); }
};
