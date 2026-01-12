import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

export interface ChatbotQuestion {
  id: number;
  text: string;
}

export interface ChatbotResponse {
  questionId: number;
  question: string;
  data: any[];
  type: 'empty' | 'single_value' | 'table';
}

export const useChatbot = () => {
  const { data: questions, isLoading: isLoadingQuestions } = useQuery({
    queryKey: ['chatbot-questions'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/chatbot/questions');
      const body = response.data;

      // Robustly handle response format
      if (Array.isArray(body)) {
        return body;
      } else if (body && Array.isArray(body.data)) {
        return body.data;
      } else if (body && Array.isArray((body as any).result)) {
        return (body as any).result;
      }
      console.error('Unexpected response format:', body);
      return [];
    },
  });

  const { mutateAsync: askQuestion, isPending: isAsking } = useMutation({
    mutationFn: async (questionId: number) => {
      const response = await apiClient.post<any>('/chatbot/ask', {
        questionId,
      });

      const body = response.data;

      // Robustly handle different response formats
      // Case 1: Direct response
      if (body && body.type) {
        return body as ChatbotResponse;
      }
      // Case 2: Wrapped in data
      if (body && body.data && body.data.type) {
        return body.data as ChatbotResponse;
      }
      // Case 3: Wrapped in result
      if (body && (body as any).result && (body as any).result.type) {
        return (body as any).result as ChatbotResponse;
      }

      console.warn('Unexpected response structure in askQuestion:', body);
      return body as ChatbotResponse;
    },
  });

  return {
    questions,
    isLoadingQuestions,
    askQuestion,
    isAsking,
  };
};
