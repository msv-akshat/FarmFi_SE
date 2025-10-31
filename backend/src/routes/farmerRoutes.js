import express from 'express';
import { authenticateToken, requireFarmer } from '../middleware/auth.js';
import multer from 'multer';
import {
  getDashboardStats,
  getFields,
  getFieldDetails,
  createField,
  getCrops,
  getCropDetails,
  createCrop,
  getCurrentCrops,
  getPredictions,
  getPredictionDetails,
  savePrediction,
  getCropTypes,
  changePassword,
  updateProfile,
  getProfile,
  getAnalytics
} from '../controllers/farmerController.js';

const router = express.Router();

// All routes require farmer authentication
router.use(authenticateToken, requireFarmer);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);
router.get('/dashboard/analytics', getAnalytics);

// Fields
router.get('/fields', getFields);
router.post('/fields', createField);
router.get('/fields/:id', getFieldDetails);
router.get('/fields/:field_id/current-crops', getCurrentCrops);

// Crops
router.get('/crops', getCrops);
router.post('/crops', createCrop);
router.get('/crops/:id', getCropDetails);

// Disease Predictions
router.get('/predictions', getPredictions);
const upload = multer({ storage: multer.memoryStorage() });
router.post('/predictions', upload.single('image'), savePrediction);
router.get('/predictions/:id', getPredictionDetails);

// Utilities
router.get('/crop-types', getCropTypes);

// Profile & Settings
router.get('/profile', getProfile);
router.patch('/profile', updateProfile);
router.post('/change-password', changePassword);

export default router;
