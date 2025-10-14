import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import locationRoutes from './routes/locationRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';
import sql from './config/db.js';

dotenv.config();
console.log("DATABASE_URL Loaded:", process.env.DATABASE_URL);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api', locationRoutes);

// Health check
app.get("/api/db-test", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ success: true, time: result[0].now });
  } catch (err) {
    console.error("DB TEST ERROR:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
