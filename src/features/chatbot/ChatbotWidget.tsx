import React, { useState, useRef, useEffect } from 'react';
import {
  useChatbot,
  ChatbotQuestion,
  ChatbotResponse,
} from './hooks/useChatbot';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string | React.ReactNode;
  timestamp: Date;
}

interface ChatbotWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  isOpen,
  onClose,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content:
        'Hello! I am ProcLeo Assistant. How can I help you today? Select a question below to get started.',
      timestamp: new Date(),
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { questions, isLoadingQuestions, askQuestion, isAsking } = useChatbot();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleQuestionSelect = async (question: ChatbotQuestion) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question.text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await askQuestion(question.id);
      console.log('Chatbot Answer Response:', response);

      if (!response || !response.type) {
        throw new Error('Invalid response from server');
      }

      let botContent: React.ReactNode;

      if (response.type === 'empty') {
        botContent = 'I found no records matching your query.';
      } else if (response.type === 'single_value') {
        if (!response.data || response.data.length === 0) {
          botContent = 'No data available.';
        } else {
          const key = Object.keys(response.data[0])[0];
          const value = response.data[0][key];
          botContent = (
            <div className='text-lg font-medium'>
              {key}: <span className='text-primary'>{value}</span>
            </div>
          );
        }
      } else {
        if (!response.data || response.data.length === 0) {
          botContent = 'I found no records matching your query.';
        } else {
          const headers = Object.keys(response.data[0]);
          botContent = (
            <div className='overflow-x-auto mt-2 bg-white rounded border border-gray-200 shadow-sm max-h-60'>
              <table className='min-w-full text-xs'>
                <thead className='bg-gray-50 text-gray-700 sticky top-0'>
                  <tr>
                    {headers.map(h => (
                      <th
                        key={h}
                        className='px-2 py-1 border-b text-left font-semibold uppercase tracking-wider'
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {response.data.map((row, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      {headers.map(h => (
                        <td
                          key={h}
                          className='px-2 py-1 text-gray-600 whitespace-nowrap'
                        >
                          {String(row[h] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className='px-2 py-1 text-xs text-gray-400 bg-gray-50 border-t'>
                Showing {response.data.length} result(s)
              </div>
            </div>
          );
        }
      }

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: botContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chatbot Error Details:', error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content:
          'Sorry, I encountered an error fetching that information. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className='fixed bottom-6 right-6 flex flex-col items-end'
      style={{ zIndex: 100 }}
    >
      <div className='w-[400px] h-[600px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200'>
        {/* Header */}
        <div className='bg-primary p-4 flex justify-between items-center text-primary-foreground shadow-sm'>
          <div className='flex items-center gap-2'>
            <Bot className='h-5 w-5' />
            <span className='font-semibold'>ProcLeo Assistant</span>
          </div>
          <button
            onClick={onClose}
            className='text-primary-foreground/80 hover:text-white transition-colors'
          >
            <X className='h-5 w-5' />
          </button>
        </div>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50'>
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex w-full max-w-[90%] gap-2',
                msg.type === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center',
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-emerald-600 text-white'
                )}
              >
                {msg.type === 'user' ? (
                  <User className='h-5 w-5' />
                ) : (
                  <Bot className='h-5 w-5' />
                )}
              </div>

              <div
                className={cn(
                  'p-3 rounded-2xl text-sm shadow-sm',
                  msg.type === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                )}
              >
                {msg.content}
                <div
                  className={cn(
                    'text-[10px] mt-1 opacity-70',
                    msg.type === 'user'
                      ? 'text-primary-foreground'
                      : 'text-gray-400'
                  )}
                >
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}

          {isAsking && (
            <div className='flex w-full mr-auto gap-2'>
              <div className='flex-shrink-0 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center'>
                <Bot className='h-5 w-5' />
              </div>
              <div className='bg-white p-3 rounded-2xl rounded-tl-sm text-sm border border-gray-100 shadow-sm flex items-center gap-2'>
                <span className='animate-pulse'>Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input/Selection Area */}
        <div className='p-4 bg-white border-t border-gray-100'>
          <p className='text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider'>
            Suggested Questions
          </p>
          {isLoadingQuestions ? (
            <div className='text-sm text-center py-2 text-gray-500'>
              Loading questions...
            </div>
          ) : (
            <div className='flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar'>
              {questions?.map(q => (
                <button
                  key={q.id}
                  onClick={() => handleQuestionSelect(q)}
                  disabled={isAsking}
                  className='text-xs border border-gray-200 bg-gray-50 hover:bg-primary/5 hover:border-primary/20 hover:text-primary text-gray-700 px-3 py-1.5 rounded-full transition-all text-left truncate max-w-full disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {q.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
