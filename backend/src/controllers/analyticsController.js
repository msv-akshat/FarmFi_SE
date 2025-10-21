import sql from '../config/db.js';

// Crop Distribution - Enhanced with detailed breakdown
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

// Detailed Crop Distribution Analytics
export const getDetailedCropAnalytics = async (req, res, next) => {
  try {
    // Get comprehensive crop data with area, production, fields
    const cropDetails = await sql`
      SELECT 
        c.name as crop_name,
        COUNT(DISTINCT f.id)::int as field_count,
        SUM(cd.area)::float as total_area,
        AVG(cd.area)::float as avg_area_per_field,
        SUM(cd.production)::float as total_production,
        AVG(cd.production)::float as avg_production,
        COALESCE(AVG(cd.yield), 0)::float as avg_yield,
        COUNT(CASE WHEN cd.season = 'Kharif' THEN 1 END)::int as kharif_count,
        COUNT(CASE WHEN cd.season = 'Rabi' THEN 1 END)::int as rabi_count,
        COUNT(CASE WHEN cd.season = 'Whole Year' THEN 1 END)::int as whole_year_count,
        json_agg(DISTINCT cd.crop_year ORDER BY cd.crop_year DESC) as years
      FROM fields f
      JOIN crop_data cd ON cd.field_id = f.id
      JOIN crops c ON cd.crop_id = c.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true
        AND cd.verified = true
      GROUP BY c.name
      ORDER BY total_area DESC
    `;

    // Get season-wise distribution
    const seasonDistribution = await sql`
      SELECT 
        cd.season,
        COUNT(*)::int as count,
        SUM(cd.area)::float as total_area
      FROM fields f
      JOIN crop_data cd ON cd.field_id = f.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true
        AND cd.verified = true
      GROUP BY cd.season
    `;

    // Get year-wise trend
    const yearlyTrend = await sql`
      SELECT 
        cd.crop_year,
        COUNT(*)::int as crop_count,
        SUM(cd.area)::float as total_area,
        SUM(cd.production)::float as total_production
      FROM fields f
      JOIN crop_data cd ON cd.field_id = f.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true
        AND cd.verified = true
      GROUP BY cd.crop_year
      ORDER BY cd.crop_year ASC
    `;

    res.json({
      success: true,
      data: {
        cropDetails,
        seasonDistribution,
        yearlyTrend,
        summary: {
          totalCrops: cropDetails.length,
          totalArea: cropDetails.reduce((sum, c) => sum + (c.total_area || 0), 0),
          totalProduction: cropDetails.reduce((sum, c) => sum + (c.total_production || 0), 0),
          totalFields: cropDetails.reduce((sum, c) => sum + c.field_count, 0)
        }
      }
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

// Detailed Field Area Analytics
export const getDetailedFieldAreaAnalytics = async (req, res, next) => {
  try {
    // Get all fields with details
    const fieldDetails = await sql`
      SELECT 
        f.id,
        f.field_name,
        f.area,
        f.status,
        f.verified,
        f.created_at,
        m.name as mandal_name,
        v.name as village_name,
        COUNT(DISTINCT cd.id)::int as crop_count
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      LEFT JOIN crop_data cd ON cd.field_id = f.id AND cd.verified = true
      WHERE f.farmer_id = ${req.user.id}
      GROUP BY f.id, f.field_name, f.area, f.status, f.verified, f.created_at, m.name, v.name
      ORDER BY f.area DESC
    `;

    // Area distribution by location
    const areaByLocation = await sql`
      SELECT 
        m.name as mandal,
        COUNT(f.id)::int as field_count,
        SUM(f.area)::float as total_area,
        AVG(f.area)::float as avg_area
      FROM fields f
      JOIN mandals m ON f.mandal_id = m.id
      WHERE f.farmer_id = ${req.user.id}
        AND f.verified = true
      GROUP BY m.name
      ORDER BY total_area DESC
    `;

    // Size categories - simplified
    const sizeCategories = await sql`
      SELECT 
        CASE 
          WHEN area < 1 THEN 'Small (< 1 ha)'
          WHEN area >= 1 AND area < 5 THEN 'Medium (1-5 ha)'
          WHEN area >= 5 AND area < 10 THEN 'Large (5-10 ha)'
          ELSE 'Very Large (> 10 ha)'
        END as size_category,
        COUNT(*)::int as count,
        SUM(area)::float as total_area
      FROM fields
      WHERE farmer_id = ${req.user.id}
        AND verified = true
      GROUP BY 1
      ORDER BY 
        MIN(CASE 
          WHEN area < 1 THEN 1
          WHEN area >= 1 AND area < 5 THEN 2
          WHEN area >= 5 AND area < 10 THEN 3
          ELSE 4
        END)
    `;

    res.json({
      success: true,
      data: {
        fieldDetails,
        areaByLocation,
        sizeCategories,
        summary: {
          totalFields: fieldDetails.length,
          totalArea: fieldDetails.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0),
          averageArea: fieldDetails.length > 0 
            ? fieldDetails.reduce((sum, f) => sum + (parseFloat(f.area) || 0), 0) / fieldDetails.length 
            : 0,
          verifiedFields: fieldDetails.filter(f => f.verified).length
        }
      }
    });
  } catch (err) { 
    console.error('Error in getDetailedFieldAreaAnalytics:', err);
    next(err); 
  }
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

// Detailed Field Status Analytics
export const getDetailedFieldStatusAnalytics = async (req, res, next) => {
  try {
    // Status breakdown with details
    const statusBreakdown = await sql`
      SELECT 
        f.status,
        f.verified,
        COUNT(f.id)::int as count,
        SUM(f.area)::float as total_area,
        json_agg(
          json_build_object(
            'id', f.id,
            'field_name', f.field_name,
            'area', f.area,
            'created_at', f.created_at,
            'mandal', m.name,
            'village', v.name
          ) ORDER BY f.created_at DESC
        ) as fields
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      WHERE f.farmer_id = ${req.user.id}
      GROUP BY f.status, f.verified
      ORDER BY 
        CASE f.status
          WHEN 'approved' THEN 1
          WHEN 'pending' THEN 2
          WHEN 'rejected' THEN 3
        END
    `;

    // Verification timeline
    const verificationTimeline = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*)::int as total_created,
        COUNT(CASE WHEN verified = true THEN 1 END)::int as verified_count,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved_count
      FROM fields
      WHERE farmer_id = ${req.user.id}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    // Approval statistics
    const approvalStats = await sql`
      SELECT 
        COUNT(*)::int as total_fields,
        COUNT(CASE WHEN status = 'approved' THEN 1 END)::int as approved,
        COUNT(CASE WHEN status = 'pending' THEN 1 END)::int as pending,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END)::int as rejected,
        COUNT(CASE WHEN verified = true THEN 1 END)::int as verified,
        AVG(CASE 
          WHEN approval_date IS NOT NULL AND created_at IS NOT NULL 
          THEN EXTRACT(EPOCH FROM (approval_date - created_at))/86400 
        END)::float as avg_approval_days
      FROM fields
      WHERE farmer_id = ${req.user.id}
    `;

    // Recent status changes
    const recentChanges = await sql`
      SELECT 
        f.id,
        f.field_name,
        f.area,
        f.status,
        f.verified,
        f.updated_at,
        m.name as mandal,
        v.name as village
      FROM fields f
      LEFT JOIN mandals m ON f.mandal_id = m.id
      LEFT JOIN villages v ON f.village_id = v.id
      WHERE f.farmer_id = ${req.user.id}
      ORDER BY f.updated_at DESC
      LIMIT 10
    `;

    res.json({
      success: true,
      data: {
        statusBreakdown,
        verificationTimeline,
        approvalStats: approvalStats[0] || {},
        recentChanges,
        summary: {
          totalFields: statusBreakdown.reduce((sum, s) => sum + s.count, 0),
          approvalRate: approvalStats[0] 
            ? ((approvalStats[0].approved / approvalStats[0].total_fields) * 100).toFixed(1)
            : 0,
          verificationRate: approvalStats[0]
            ? ((approvalStats[0].verified / approvalStats[0].total_fields) * 100).toFixed(1)
            : 0
        }
      }
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
