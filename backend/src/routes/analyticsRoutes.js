import express from "express";
import {
  getCropDistribution,
  getFieldSizeByCrop,
  getFieldStatusBreakdown,
  getAreaDistribution,
  getDetailedCropAnalytics,
  getDetailedFieldAreaAnalytics,
  getDetailedFieldStatusAnalytics
} from "../controllers/analyticsController.js";
import { protectFarmer } from "../middleware/auth.js";

const router = express.Router();

// Simple analytics (for dashboard charts)
router.get("/crop-distribution", protectFarmer, getCropDistribution);
router.get("/field-size-by-crop", protectFarmer, getFieldSizeByCrop);
router.get("/status-breakdown", protectFarmer, getFieldStatusBreakdown);
router.get("/area-distribution", protectFarmer, getAreaDistribution);

// Detailed analytics (for dedicated pages)
router.get("/detailed-crop-analytics", protectFarmer, getDetailedCropAnalytics);
router.get("/detailed-field-area-analytics", protectFarmer, getDetailedFieldAreaAnalytics);
router.get("/detailed-field-status-analytics", protectFarmer, getDetailedFieldStatusAnalytics);

export default router;
