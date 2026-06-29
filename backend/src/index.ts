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
  res.json({ name: 'File Upload Service', version: '1.0.0', status: 'running' });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/files', fileRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
