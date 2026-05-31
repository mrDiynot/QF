/**
 * Files API Service
 */

import { apiClient } from '@/lib/axios';

export interface UploadedFile {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  entityType?: string;
  entityId?: string;
  uploadedBy: string;
  createdAt: string;
}

export interface UploadFileRequest {
  file: File;
  entityType?: string;
  entityId?: string;
}

export const filesService = {
  uploadFile: async ({ file, entityType, entityId }: UploadFileRequest) => {
    const formData = new FormData();
    formData.append('file', file);
    if (entityType) formData.append('entityType', entityType);
    if (entityId) formData.append('entityId', entityId);

    const response = await apiClient.post<UploadedFile>('/Files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getFileById: async (id: string) => {
    const response = await apiClient.get<UploadedFile>(`/Files/${id}`);
    return response.data;
  },

  getFilesByEntity: async (entityType: string, entityId: string) => {
    const response = await apiClient.get<UploadedFile[]>(`/Files/entity/${entityType}/${entityId}`);
    return response.data;
  },

  deleteFile: async (id: string) => {
    await apiClient.delete(`/Files/${id}`);
  },

  getDownloadUrl: async (id: string) => {
    const response = await apiClient.get<{ downloadUrl: string }>(`/Files/${id}/download`);
    return response.data;
  },
};
