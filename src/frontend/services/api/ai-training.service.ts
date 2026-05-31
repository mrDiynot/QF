import { apiClient } from '@/lib/axios';

// ============================================================================
// AI Training Types
// ============================================================================

export interface ToneSettings {
  tone: string;
  formality: string;
  personalityTraits: string[];
}

export interface QualificationCriteria {
  budgetWeight: number;
  authorityWeight: number;
  needWeight: number;
  timelineWeight: number;
  minScoreToQualify: number;
}

export interface TrainingStatus {
  lastTrainedAt?: string;
  status: string;
  version?: string;
}

export interface AutoResponseStatus {
  enabled: boolean;
  configuredAt?: string;
}

export interface AITrainingConfig {
  businessId: string;
  businessName: string;
  knowledgeBaseArticles: number;
  responseTemplates: number;
  toneSettings: ToneSettings;
  qualificationCriteria: QualificationCriteria;
  trainingStatus: TrainingStatus;
  autoResponse: AutoResponseStatus;
}

export interface UpdateToneRequest {
  tone: string;
  formality?: string;
  personalityTraits?: string[];
}

export interface MessageSample {
  role: string;
  content: string;
}

export interface ConversationSample {
  id: string;
  channel: string;
  messageCount: number;
  createdAt: string;
  sample: MessageSample[];
}

export interface QualificationSample {
  leadId: string;
  leadName: string;
  score: number;
  budgetScore: number;
  authorityScore: number;
  needScore: number;
  timelineScore: number;
  qualifiedAt: string;
}

export interface ResponseTemplateSample {
  id: string;
  name: string;
  category: string;
  template: string;
  usageCount: number;
}

export interface TrainingDataResponse {
  type: string;
  businessId: string;
  totalSamples: number;
  conversations?: ConversationSample[];
  qualifications?: QualificationSample[];
  responseTemplates?: ResponseTemplateSample[];
}

export interface TrainingSample {
  input: string;
  expectedOutput: string;
  context?: string;
}

export interface AddTrainingDataRequest {
  type: string;
  samples: TrainingSample[];
}

export interface AddTrainingDataResult {
  samplesAdded: number;
  status: string;
  message: string;
}

export interface TrainingJobStatus {
  jobId: string;
  status: string;
  message: string;
  estimatedCompletionTime?: string;
  completedAt?: string;
}

export interface AITestRequest {
  input: string;
  context?: string;
}

export interface AITestResponse {
  input: string;
  response: string;
  confidence: number;
  processingTimeMs: number;
  modelVersion: string;
}

// ============================================================================
// AI Training Service
// ============================================================================

export const aiTrainingService = {
  getConfig: async (): Promise<AITrainingConfig> => {
    const { data } = await apiClient.get<AITrainingConfig>('/ai-training/config');
    return data;
  },

  updateTone: async (request: UpdateToneRequest): Promise<ToneSettings> => {
    const { data } = await apiClient.put<ToneSettings>('/ai-training/tone', request);
    return data;
  },

  updateQualificationCriteria: async (criteria: QualificationCriteria): Promise<QualificationCriteria> => {
    const { data } = await apiClient.put<QualificationCriteria>('/ai-training/qualification-criteria', criteria);
    return data;
  },

  getTrainingData: async (type: string = 'conversations', limit: number = 50): Promise<TrainingDataResponse> => {
    const { data } = await apiClient.get<TrainingDataResponse>(`/ai-training/data?type=${type}&limit=${limit}`);
    return data;
  },

  addTrainingData: async (request: AddTrainingDataRequest): Promise<AddTrainingDataResult> => {
    const { data } = await apiClient.post<AddTrainingDataResult>('/ai-training/data', request);
    return data;
  },

  triggerTraining: async (): Promise<TrainingJobStatus> => {
    const { data } = await apiClient.post<TrainingJobStatus>('/ai-training/train');
    return data;
  },

  getTrainingStatus: async (jobId: string): Promise<TrainingJobStatus> => {
    const { data } = await apiClient.get<TrainingJobStatus>(`/ai-training/train/${jobId}`);
    return data;
  },

  testModel: async (request: AITestRequest): Promise<AITestResponse> => {
    const { data } = await apiClient.post<AITestResponse>('/ai-training/test', request);
    return data;
  },

  updateAutoResponse: async (enabled: boolean): Promise<AutoResponseStatus> => {
    const { data } = await apiClient.put<AutoResponseStatus>('/ai-training/auto-response', { enabled });
    return data;
  },
};

export default aiTrainingService;
