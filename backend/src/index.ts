import express from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import datasetsRoutes from './routes/datasets.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Static serving of uploaded CSV files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetsRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

