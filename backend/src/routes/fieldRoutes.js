import express from 'express';
import { protectFarmer, protectEmployee } from '../middleware/auth.js';
import {
  getMyFields,
  createField,
  updateField,
  deleteField,
  verifyField,
  getVerifiedFields,
  getField
} from '../controllers/fieldController.js';

const router = express.Router();

// Get only approved & verified for selectors
router.get('/verified', protectFarmer, getVerifiedFields);

// Farmer CRUD methods on fields
router.get('/', protectFarmer, getMyFields);
router.post('/', protectFarmer, createField);
router.get('/:id', protectFarmer, getField);
router.put('/:id', protectFarmer, updateField);
router.delete('/:id', protectFarmer, deleteField);

// Verification (by employee only)
router.post('/:id/verify', protectEmployee, verifyField);



export default router;
