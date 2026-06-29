export interface FileMetadata {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  s3_key: string;
  uploaded_at: Date;
}

export interface CreateFileRecord {
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
}

export interface PreSignedUrlResponse {
  uploadUrl: string;
  fileId: string;
  s3Key: string;
}

export interface FileResponse {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}
