import sql from '../config/db.js';

// Crop Distribution
export const getCropDistribution = async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT c.name as crop, COUNT(*)::int as count
      FROM fields f
      JOIN crop_data cd ON cd.field_id = f.id
      JOIN crops c ON cd.crop_id = c.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true
        AND cd.verified = true
        AND cd.id = (
          SELECT id FROM crop_data
          WHERE field_id = f.id AND verified = true
          ORDER BY crop_year DESC, updated_at DESC LIMIT 1
        )
      GROUP BY c.name
      ORDER BY count DESC
    `;
    res.json({
      labels: rows.map(r => r.crop),
      data: rows.map(r => r.count)
    });
  } catch (err) { next(err); }
};

// Field Size Per Crop
export const getFieldSizeByCrop = async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT c.name as crop, SUM(f.area)::float as total_area
      FROM fields f
      JOIN crop_data cd ON cd.field_id = f.id
      JOIN crops c ON cd.crop_id = c.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true AND cd.verified = true
        AND cd.id = (
          SELECT id FROM crop_data
          WHERE field_id = f.id AND verified = true
          ORDER BY crop_year DESC, updated_at DESC LIMIT 1
        )
      GROUP BY c.name
      ORDER BY total_area DESC
    `;
    res.json({
      labels: rows.map(r => r.crop),
      data: rows.map(r => r.total_area)
    });
  } catch (err) { next(err); }
};

// Field Status Breakdown
export const getFieldStatusBreakdown = async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT status, COUNT(*)::int as count
      FROM fields
      WHERE farmer_id = ${req.user.id}
      GROUP BY status
    `;
    res.json({
      labels: rows.map(r => r.status),
      data: rows.map(r => r.count)
    });
  } catch (err) { next(err); }
};

// Area Distribution Per Field
export const getAreaDistribution = async (req, res, next) => {
  try {
    const rows = await sql`
      SELECT field_name, area
      FROM fields
      WHERE farmer_id = ${req.user.id}
        AND verified = true
      ORDER BY area DESC
    `;
    res.json({
      labels: rows.map(r => r.field_name),
      data: rows.map(r => Number(r.area))
    });
  } catch (err) { next(err); }
};
