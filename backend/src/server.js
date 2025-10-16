import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js'; // optional
import cropRoutes from './routes/cropRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js'; // for /me, /fields etc
import cropCatalogRoutes from './routes/cropCatalogRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/fields', fieldRoutes);      // or everything via farmerRoutes
app.use('/api/crops', cropRoutes);
app.use('/api', locationRoutes);
app.use('/api/farmer', farmerRoutes);

console.log("Mounting cropTypes route!")
app.use('/api/crop-types', cropCatalogRoutes);

app.get("/api/db-test", async (req, res) => {
  res.json({ success: true, time: new Date().toISOString() });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
