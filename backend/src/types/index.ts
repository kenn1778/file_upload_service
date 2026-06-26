export interface FileMetadata {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  uploadedAt: Date;
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
