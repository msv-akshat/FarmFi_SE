import express from 'express';
import { protectFarmer } from '../middleware/auth.js';
import { getMyFields, createField, updateField, deleteField, verifyField } from '../controllers/fieldController.js';
import { protectEmployee } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protectFarmer, getMyFields);
router.post('/', protectFarmer, createField);
router.put('/:id', protectFarmer, updateField);
router.delete('/:id', protectFarmer, deleteField);
router.post('/:id/verify', protectEmployee, verifyField);
export default router;
