import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  isLoading?: boolean;
}

export interface ChatSource {
  job_interview_id: string | null;
  candidate_name: string | null;
  panel_member_name: string | null;
  field_type: string | null;
  relevance: number | null;
}

export interface ChatResponse {
  success: boolean;
  reply: string;
  sources: ChatSource[];
  searchQuery: string;
  resultCount: number;
  timestamp: string;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export const chatApi = {
  async sendMessage(
    message: string,
    history: ChatHistoryEntry[] = []
  ): Promise<ChatResponse> {
    const response = await apiClient.post<ChatResponse>('/api/v1/chat', {
      message,
      history,
    });
    return response.data;
  },
};

export default chatApi;
