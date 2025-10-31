import express from 'express';
import { registerFarmer, login, getLocations, changePassword } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', registerFarmer);
router.post('/login', login);
router.get('/locations', getLocations);

// Protected routes
router.post('/change-password', authenticateToken, changePassword);

export default router;
