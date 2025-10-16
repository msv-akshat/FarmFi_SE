import express from 'express';
import { protectFarmer } from '../middleware/auth.js';
import { getMyCrops, createCropData, deleteCrop, verifyCrop } from '../controllers/cropController.js';
import { protectEmployee } from '../middleware/auth.js';
import { getSingleCrop, updateCrop } from '../controllers/cropController.js';

const router = express.Router();
router.get('/', protectFarmer, getMyCrops);
router.post('/', protectFarmer, createCropData);
router.delete('/:id', protectFarmer, deleteCrop);
router.post('/:id/verify', protectEmployee, verifyCrop);
router.get('/:id', protectFarmer, getSingleCrop);
router.put('/:id', protectFarmer, updateCrop);

export default router;
