import { apiClient } from '@/lib/axios';

export interface Survey {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'published' | 'archived';
  questions: string;
  responseCount: number;
  averageScore?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SurveyStats {
  totalSurveys: number;
  totalResponses: number;
  publishedSurveys: number;
  draftSurveys: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  email?: string;
  answers: string;
  score?: number;
  createdAt: string;
}

export interface CreateSurveyRequest {
  name: string;
  description?: string;
  questions: string;
}

export interface UpdateSurveyRequest {
  name?: string;
  description?: string;
  status?: string;
  questions?: string;
  isActive?: boolean;
}

export const surveysService = {
  async getSurveys(): Promise<Survey[]> {
    try {
      const response = await apiClient.get<Survey[]>('/surveys');
      return response.data || [];
    } catch (error) {
      console.error('[Surveys] Failed to get surveys:', error);
      return [];
    }
  },

  async getSurvey(id: string): Promise<Survey> {
    const response = await apiClient.get<Survey>(`/surveys/${id}`);
    return response.data;
  },

  async getStats(): Promise<SurveyStats> {
    try {
      const response = await apiClient.get<SurveyStats>('/surveys/stats');
      return response.data || { totalSurveys: 0, totalResponses: 0, publishedSurveys: 0, draftSurveys: 0 };
    } catch (error) {
      console.error('[Surveys] Failed to get stats:', error);
      return { totalSurveys: 0, totalResponses: 0, publishedSurveys: 0, draftSurveys: 0 };
    }
  },

  async createSurvey(request: CreateSurveyRequest): Promise<Survey> {
    // Ensure questions is a valid JSON string
    const payload = {
      name: request.name,
      description: request.description || null,
      questions: request.questions || '[]',
    };
    console.log('[Surveys] Creating survey with payload:', payload);
    const response = await apiClient.post<Survey>('/surveys', payload);
    return response.data;
  },

  async updateSurvey(id: string, request: UpdateSurveyRequest): Promise<Survey> {
    const response = await apiClient.patch<Survey>(`/surveys/${id}`, request);
    return response.data;
  },

  async deleteSurvey(id: string): Promise<void> {
    await apiClient.delete(`/surveys/${id}`);
  },

  async getResponses(surveyId: string): Promise<SurveyResponse[]> {
    try {
      const response = await apiClient.get<SurveyResponse[]>(`/surveys/${surveyId}/responses`);
      return response.data || [];
    } catch (error) {
      console.error('[Surveys] Failed to get responses:', error);
      return [];
    }
  },
};
