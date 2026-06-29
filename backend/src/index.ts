import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fileRoutes from './routes/files';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>File Upload Service</title>
<style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f5f5f5}.card{background:#fff;padding:2rem;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,.1);text-align:center}h1{color:#333;margin:0 0 .5rem}p{color:#666;margin:0 0 1.5rem}.endpoint{background:#f0f0f0;padding:.5rem 1rem;border-radius:6px;margin:.25rem 0;font-family:monospace;font-size:.9rem}code{color:#e91e63}</style></head>
<body><div class="card"><h1>File Upload Service</h1><p>Backend API is running</p><div class="endpoint">GET <code>/health</code></div><div class="endpoint">POST <code>/api/files/upload-url</code></div><div class="endpoint">POST <code>/api/files/confirm</code></div><div class="endpoint">GET <code>/api/files/:id</code></div><div class="endpoint">GET <code>/api/files/user/:userId</code></div></div></body></html>`);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api', (_req, res) => {
  res.json({ name: 'File Upload Service', version: '1.0.0', endpoints: ['GET /health', 'POST /api/files/upload-url', 'POST /api/files/confirm', 'GET /api/files/:id', 'GET /api/files/user/:userId'] });
});

app.use('/api/files', fileRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
