import express from 'express';
// ✅ FIX: Renamed function to be more descriptive
import { getMandals, getVillagesByMandal } from '../controllers/locationController.js';

const router = express.Router();

// Get all mandals
router.get('/mandals', getMandals);

// Get villages by mandal ID
// The route parameter is ':id', which is now correctly used in the controller
router.get('/mandals/:id/villages', getVillagesByMandal);

export default router;
