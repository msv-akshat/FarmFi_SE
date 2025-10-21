import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import cropCatalogRoutes from './routes/cropCatalogRoutes.js';
import fieldImageRoutes from './routes/fieldImageRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api', locationRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/images', fieldImageRoutes);
app.use('/api/crop-types', cropCatalogRoutes);

app.use('/api/analytics', analyticsRoutes);

app.get("/api/db-test", async (req, res) => {
  res.json({ success: true, time: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
