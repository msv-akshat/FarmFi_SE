import express from 'express';
import { listCrops } from '../controllers/cropCatalogController.js';
const router = express.Router();

router.get('/', listCrops);

export default router;
