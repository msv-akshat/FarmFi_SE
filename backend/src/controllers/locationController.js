import sql from "../config/db.js";
import { AppError } from '../utils/appError.js';

// @desc    Get all mandals
// @route   GET /api/mandals
// @access  Public
export const getMandals = async (req, res, next) => {
  try {
    const result = await sql`
      SELECT * FROM mandals ORDER BY name
    `;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getMandals:", error);
    next(error);
  }
};

// @desc    Get villages by mandal ID
// @route   GET /api/mandals/:id/villages
// @access  Public
export const getVillagesByMandal = async (req, res, next) => {
  try {
    // ✅ FIX: Use 'id' to match the route parameter /mandals/:id/villages
    const { id } = req.params;

    if (!id) {
        return next(new AppError('Mandal ID is required', 400));
    }

    const result = await sql`
      SELECT * FROM villages WHERE mandal_id = ${id} ORDER BY name
    `;

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getVillagesByMandal:", error);
    next(error);
  }
};
