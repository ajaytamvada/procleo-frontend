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
  aiSummary?: string;
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

      console.log('[Chatbot] Raw SQL Response:', body);

      let parsedResponse: ChatbotResponse;

      // Robustly handle different response formats and normalize to ChatbotResponse
      if (body && body.type) {
        parsedResponse = body as ChatbotResponse;
      } else if (body && body.data && body.data.type) {
        parsedResponse = body.data as ChatbotResponse;
      } else if (body && (body as any).result && (body as any).result.type) {
        parsedResponse = (body as any).result as ChatbotResponse;
      } else {
        console.warn('Unexpected response structure in askQuestion:', body);
        parsedResponse = body as ChatbotResponse;
      }

      // ---------------------------------------------------------
      // AI ENHANCEMENT: Generate Natural Language Summary
      // ---------------------------------------------------------
      if (parsedResponse && parsedResponse.data && parsedResponse.data.length > 0) {
        try {
          const prompt = `
             The user asked a question about procurement data.
             
             User Question: "${parsedResponse.question || 'User Query'}"
             
             Database Results:
             ${JSON.stringify(parsedResponse.data, null, 2).substring(0, 1000)} ${parsedResponse.data.length > 5 ? '...(more data truncated)' : ''}
             
             Task:
             Provide a helpful, natural language answer based STRICTLY on the data above.
             - If it's a list, summarize key items or counts.
             - If it's a single value, state it clearly.
             - Be concise and professional.
             - Do not mention "database results" or "JSON". Just answer the question.
             `;

          console.log('[Chatbot] Asking AI to summarize...');
          const aiResponse = await apiClient.post('/ocr/generate', { prompt, max_tokens: 256 }, { timeout: 45000 });

          if (aiResponse.data && aiResponse.data.success) {
            parsedResponse.aiSummary = aiResponse.data.text;
          }
        } catch (e) {
          console.error('[Chatbot] AI Summary failed:', e);
          // Fallback: Just show data without AI summary
        }
      }

      return parsedResponse;
    },
  });

  return {
    questions,
    isLoadingQuestions,
    askQuestion,
    isAsking,
  };
};
