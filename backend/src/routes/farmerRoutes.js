import express from 'express';
import {
  getMyProfile,
  updateMyProfile
} from '../controllers/farmerController.js';
import {
  getMyFields,
  createField,
  getField,
  updateField,
  deleteField
} from '../controllers/fieldController.js';
import { protectFarmer } from '../middleware/auth.js';

const router = express.Router();

// Farmer profile routes
router.get('/me', protectFarmer, getMyProfile);
router.put('/me', protectFarmer, updateMyProfile);

// Farmer’s field management routes
router.get('/fields', protectFarmer, getMyFields);
router.post('/fields', protectFarmer, createField);
router.get('/fields/:id', protectFarmer, getField);
router.put('/fields/:id', protectFarmer, updateField);
router.delete('/fields/:id', protectFarmer, deleteField);

export default router;
