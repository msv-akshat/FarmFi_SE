import express from 'express';
import { uploadAndPredict, getHistory } from '../controllers/fieldImageController.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Upload image and run prediction
router.post('/upload-and-predict', upload.single('image'), uploadAndPredict);

// Get prediction history
router.get('/history', getHistory);

export default router;
