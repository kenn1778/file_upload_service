import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { generateUploadUrl, generateDownloadUrl } from '../services/s3Service';
import { insertFileRecord, getFileById, getFilesByUserId } from '../services/dbService';

const requestUploadSchema = z.object({
  userId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
});

export async function requestUploadUrl(req: Request, res: Response) {
  try {
    const { userId, fileName, fileSize, mimeType } = requestUploadSchema.parse(req.body);
    const fileId = uuidv4();
    const s3Key = `uploads/${userId}/${fileId}/${fileName}`;

    const uploadUrl = await generateUploadUrl(s3Key, mimeType);

    res.json({ uploadUrl, fileId, s3Key });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request body', details: error.errors });
      return;
    }
    console.error('Error generating upload URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
}

const confirmUploadSchema = z.object({
  userId: z.string().min(1),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  s3Key: z.string().min(1),
});

export async function confirmUpload(req: Request, res: Response) {
  try {
    const data = confirmUploadSchema.parse(req.body);
    const record = await insertFileRecord(data);
    res.status(201).json(record);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid request body', details: error.errors });
      return;
    }
    console.error('Error confirming upload:', error);
    res.status(500).json({ error: 'Failed to confirm upload' });
  }
}

export async function getFile(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const file = await getFileById(id);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const downloadUrl = await generateDownloadUrl(file.s3_key);

    res.json({
      id: file.id,
      userId: file.user_id,
      fileName: file.file_name,
      fileSize: file.file_size,
      mimeType: file.mime_type,
      uploadedAt: file.uploaded_at,
      downloadUrl,
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
}

export async function listUserFiles(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const files = await getFilesByUserId(userId);

    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const downloadUrl = await generateDownloadUrl(file.s3_key);
        return {
          id: file.id,
          userId: file.user_id,
          fileName: file.file_name,
          fileSize: file.file_size,
          mimeType: file.mime_type,
          uploadedAt: file.uploaded_at,
          downloadUrl,
        };
      })
    );

    res.json(filesWithUrls);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
}
