import sql from '../config/db.js';

export const listCrops = async (req, res, next) => {
  try {
    const crops = await sql`SELECT id, name FROM crops ORDER BY name`;
    res.json({ success: true, data: crops });
  } catch (error) { next(error); }
};
