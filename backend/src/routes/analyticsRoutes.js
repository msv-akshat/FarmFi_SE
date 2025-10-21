import express from "express";
import {
  getCropDistribution,
  getFieldSizeByCrop,
  getFieldStatusBreakdown,
  getAreaDistribution
} from "../controllers/analyticsController.js";
import { protectFarmer } from "../middleware/auth.js";

const router = express.Router();

router.get("/crop-distribution", protectFarmer, getCropDistribution);
router.get("/field-size-by-crop", protectFarmer, getFieldSizeByCrop);
router.get("/status-breakdown", protectFarmer, getFieldStatusBreakdown);
router.get("/area-distribution", protectFarmer, getAreaDistribution);

export default router;
