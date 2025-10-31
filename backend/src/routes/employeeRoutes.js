import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getPendingFields,
  verifyField,
  uploadCropsExcel,
  uploadCropForm,
  getFieldLandInfo,
  getFarmerFields,
  getCropTypes,
  upload,
  getUploadedCrops,
  getDashboardStats
} from '../controllers/employeeController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Utilities
router.get('/crop-types', getCropTypes);

// Field approval
router.get('/fields/pending', getPendingFields);
router.patch('/fields/:id/verify', verifyField);

// Farmer fields
router.get('/farmers/:phone/fields', getFarmerFields);

// Crop upload
router.post('/crops/upload-excel', upload.single('file'), uploadCropsExcel);
router.post('/crops/upload-form', uploadCropForm);
router.get('/crops/uploaded', getUploadedCrops);
router.get('/fields/:field_id/land-info', getFieldLandInfo);

export default router;
