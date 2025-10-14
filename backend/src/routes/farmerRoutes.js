import express from 'express';
import {
  getMyProfile,
  updateMyProfile,
  getMyFields,
  createField,
  getField,
  updateField,
  deleteField
} from '../controllers/farmerController.js';
import { protectFarmer } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protectFarmer, getMyProfile);
router.put('/me', protectFarmer, updateMyProfile);

router.get('/fields', protectFarmer, getMyFields);
router.post('/fields', protectFarmer, createField);
router.get('/fields/:id', protectFarmer, getField);
router.put('/fields/:id', protectFarmer, updateField);
router.delete('/fields/:id', protectFarmer, deleteField);

export default router;
