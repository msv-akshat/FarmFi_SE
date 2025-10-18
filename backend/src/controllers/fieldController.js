import sql from '../config/db.js';
import { AppError } from '../utils/appError.js';

export const getMyFields = async (req, res, next) => {
    try {
        const fields = await sql`
      SELECT f.*, m.name AS mandal_name, v.name AS village_name
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      WHERE f.farmer_id = ${req.user.id}
      ORDER BY f.created_at DESC
    `;
        res.json({ success: true, data: fields });
    } catch (error) { next(error); }
};

export const createField = async (req, res, next) => {
    try {
        const { field_name, area, latitude, longitude, mandal_id, village_id } = req.body;
        const result = await sql`
      INSERT INTO fields (farmer_id, field_name, area, latitude, longitude, mandal_id, village_id, status)
      VALUES (${req.user.id}, ${field_name}, ${area}, ${latitude}, ${longitude}, ${mandal_id}, ${village_id}, 'pending')
      RETURNING *
    `;
        res.status(201).json({ success: true, data: result[0] });
    } catch (error) { next(error); }
};

export const verifyField = async (req, res, next) => {
    try {
        await sql`UPDATE fields SET verified = TRUE WHERE id = ${req.params.id}`;
        res.json({ success: true, message: 'Field verified!' });
    } catch (error) { next(error); }
};

export const deleteField = async (req, res, next) => {
    try {
        const [field] = await sql`SELECT verified FROM fields WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
        if (!field) return next(new AppError('Field not found', 404));
        if (field.verified) return next(new AppError('Cannot delete a verified field', 403));
        await sql`DELETE FROM fields WHERE id = ${req.params.id}`;
        res.json({ success: true, message: 'Deleted!' });
    } catch (error) { next(error); }
};

export const updateField = async (req, res, next) => {
    try {
        const [field] = await sql`SELECT verified FROM fields WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
        if (!field) return next(new AppError('Field not found', 404));
        if (field.verified) return next(new AppError('Cannot update a verified field', 403));
        const { field_name, area, latitude, longitude, mandal_id, village_id, status } = req.body;
        let updates = {};
        if (field_name !== undefined) updates.field_name = field_name;
        if (area !== undefined) updates.area = area;
        if (latitude !== undefined) updates.latitude = latitude;
        if (longitude !== undefined) updates.longitude = longitude;
        if (mandal_id !== undefined) updates.mandal_id = mandal_id;
        if (village_id !== undefined) updates.village_id = village_id;
        if (status !== undefined) updates.status = status;
        if (Object.keys(updates).length === 0) return next(new AppError('No fields to update', 400));
        await sql`UPDATE fields SET ${sql(updates)} WHERE id = ${req.params.id} AND farmer_id = ${req.user.id}`;
        res.json({ success: true, message: 'Field updated!' });
    } catch (error) { next(error); }
};

export const getVerifiedFields = async (req, res, next) => {
  try {
    const fields = await sql`
      SELECT id, field_name, area FROM fields
      WHERE farmer_id = ${req.user.id} AND status = 'approved' AND verified = true
      ORDER BY created_at DESC
    `;
    res.json(fields);
  } catch (err) { next(err); }
}