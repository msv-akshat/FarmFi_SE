import express from 'express';
import { getMandals, getVillagesByMandal } from '../controllers/locationController.js';
const router = express.Router();

router.get('/mandals', getMandals);
router.get('/mandals/:id/villages', getVillagesByMandal);

export default router;
