import express from 'express';
import { register, login } from '../controllers/authController.js';
import { validateRegistration, validateLogin } from '../middleware/validators.js';

const router = express.Router();

// Farmer registration
router.post('/register', validateRegistration, register);

// Login route for all user types
router.post('/login', validateLogin, login);

export default router;