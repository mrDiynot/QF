/**
 * Users API Service
 */

import { apiClient } from '@/lib/axios';
import type { UserProfile, UpdateUserProfileRequest } from '@/types/api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export const usersService = {
  getCurrentUser: async () => {
    const response = await apiClient.get<UserProfile>('/Users/me');
    return response.data;
  },

  updateCurrentUser: async (data: UpdateUserProfileRequest) => {
    const response = await apiClient.patch<UserProfile>('/Users/me', data);
    return response.data;
  },

  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ profilePictureUrl: string }>('/Users/me/picture', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.post<{ success: boolean }>('/Users/me/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  getUsers: async () => {
    const response = await apiClient.get<User[]>('/Users');
    return response.data;
  },

  getUserById: async (id: string) => {
    const response = await apiClient.get<User>(`/Users/${id}`);
    return response.data;
  },

  updateUser: async (id: string, data: Partial<User>) => {
    const response = await apiClient.patch<User>(`/Users/${id}`, data);
    return response.data;
  },

  deactivateUser: async (id: string) => {
    await apiClient.post(`/Users/${id}/deactivate`);
  },

  reactivateUser: async (id: string) => {
    await apiClient.post(`/Users/${id}/reactivate`);
  },
};
