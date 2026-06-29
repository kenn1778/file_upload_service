const API_BASE = 'https://5ileupload.duckdns.org/api';

export interface UploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  s3Key: string;
}

export interface FileRecord {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl: string;
}

export async function requestUploadUrl(
  userId: string,
  fileName: string,
  fileSize: number,
  mimeType: string
): Promise<UploadUrlResponse> {
  const res = await fetch(`${API_BASE}/files/upload-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fileName, fileSize, mimeType }),
  });
  if (!res.ok) throw new Error('Failed to get upload URL');
  return res.json();
}

export async function confirmUpload(
  userId: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  s3Key: string
): Promise<FileRecord> {
  const res = await fetch(`${API_BASE}/files/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, fileName, fileSize, mimeType, s3Key }),
  });
  if (!res.ok) throw new Error('Failed to confirm upload');
  return res.json();
}

export async function uploadFileToS3(uploadUrl: string, fileUri: string, mimeType: string) {
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: { 'Content-Type': mimeType },
  });

  if (!uploadRes.ok) throw new Error('Upload to S3 failed');
}

export async function listUserFiles(userId: string): Promise<FileRecord[]> {
  const res = await fetch(`${API_BASE}/files/user/${userId}`);
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}
