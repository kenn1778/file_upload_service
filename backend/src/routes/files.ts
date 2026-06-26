import { Router } from 'express';
import {
  requestUploadUrl,
  confirmUpload,
  getFile,
  listUserFiles,
} from '../controllers/fileController';

const router = Router();

router.post('/upload-url', requestUploadUrl);
router.post('/confirm', confirmUpload);
router.get('/:id', getFile);
router.get('/user/:userId', listUserFiles);

export default router;
