import { query } from '../config/database';
import { FileMetadata, CreateFileRecord } from '../types';

export async function insertFileRecord(record: CreateFileRecord): Promise<FileMetadata> {
  const result = await query(
    `INSERT INTO files (user_id, file_name, file_size, mime_type, s3_key)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, file_name, file_size, mime_type, s3_key, uploaded_at`,
    [record.userId, record.fileName, record.fileSize, record.mimeType, record.s3Key]
  );
  return result.rows[0];
}

export async function getFileById(id: string): Promise<FileMetadata | null> {
  const result = await query('SELECT * FROM files WHERE id = $1', [id]);
  return result.rows[0] || null;
}

export async function getFilesByUserId(userId: string): Promise<FileMetadata[]> {
  const result = await query(
    'SELECT * FROM files WHERE user_id = $1 ORDER BY uploaded_at DESC',
    [userId]
  );
  return result.rows;
}

export async function deleteFileRecord(id: string): Promise<boolean> {
  const result = await query('DELETE FROM files WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
