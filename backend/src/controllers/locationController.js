import sql from "../config/db.js";
import { AppError } from '../utils/appError.js';

export const getMandals = async (req, res, next) => {
  try {
    const mandals = await sql`SELECT * FROM mandals ORDER BY name`;
    res.status(200).json({ success: true, data: mandals });
  } catch (error) { next(error); }
};

export const getVillagesByMandal = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return next(new AppError('Mandal ID is required', 400));
    const villages = await sql`SELECT * FROM villages WHERE mandal_id = ${id} ORDER BY name`;
    res.status(200).json({ success: true, data: villages });
  } catch (error) { next(error); }
};
