import bcrypt from 'bcryptjs';
import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

export const getMyProfile = async (req, res, next) => {
  try {
    const farmer = await sql`SELECT id, name, phone, mandal_id, village_id FROM farmers WHERE id = ${req.user.id}`;
    if (!farmer.length) return next(new AppError('Farmer not found', 404));
    res.json({ success: true, data: farmer[0] });
  } catch (error) { next(error); }
};

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

export const getMyFields = async (req, res, next) => {
  try {
    const fields = await sql`SELECT * FROM fields WHERE farmer_id = ${req.user.id}`;
    res.json({ success: true, data: fields });
  } catch (error) { next(error); }
};

export const createField = async (req, res, next) => {
  try {
    const { field_name, area, latitude, longitude } = req.body;
    const result = await sql`
      INSERT INTO fields (farmer_id, field_name, area, latitude, longitude, status)
      VALUES (${req.user.id}, ${field_name}, ${area}, ${latitude}, ${longitude}, 'pending')
      RETURNING *
    `;
    res.status(201).json({ success: true, data: result[0] });
  } catch (error) { next(error); }
};

export const getField = async (req, res, next) => {
  try {
    const field = await sql`SELECT * FROM fields WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
    if (!field.length) return next(new AppError('Field not found', 404));
    res.json({ success: true, data: field[0] });
  } catch (error) { next(error); }
};

export const updateField = async (req, res, next) => {
  try {
    const { field_name, area, latitude, longitude, status } = req.body;
    let updates = {};
    if (field_name) updates.field_name = field_name;
    if (area) updates.area = area;
    if (latitude) updates.latitude = latitude;
    if (longitude) updates.longitude = longitude;
    if (status) updates.status = status;
    if (Object.keys(updates).length === 0) return next(new AppError('No fields to update', 400));
    await sql`UPDATE fields SET ${sql(updates)} WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
    res.json({ success: true, message: 'Field updated!' });
  } catch (error) { next(error); }
};

export const deleteField = async (req, res, next) => {
  try {
    await sql`DELETE FROM fields WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
    res.json({ success: true, message: 'Field deleted!' });
  } catch (error) { next(error); }
};
