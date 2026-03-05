import apiClient from './client';
import type { UploadResponse } from '@/types';

export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<UploadResponse>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteImage: (filename: string) =>
    apiClient.delete(`/upload/${filename}`),
};
