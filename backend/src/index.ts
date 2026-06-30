import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fileRoutes from './routes/files';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static web app files
app.use(express.static(path.join(__dirname, '../../mobile/dist')));

// API Routes (must be before static file fallback)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api', (_req, res) => {
  res.json({ name: 'File Upload Service', version: '1.0.0', endpoints: ['GET /health', 'POST /api/files/upload-url', 'POST /api/files/confirm', 'GET /api/files/:id', 'GET /api/files/user/:userId'] });
});

app.use('/api/files', fileRoutes);

// Fallback to serve the web app for any non-API routes (SPA support)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(__dirname, '../../mobile/dist/index.html'));
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
