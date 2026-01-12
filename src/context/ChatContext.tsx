import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { TokenManager, apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export interface ChatMessage {
  id: number;
  senderId: number;
  senderType: 'USER' | 'VENDOR';
  recipientId: number;
  recipientType: 'USER' | 'VENDOR';
  content: string;
  isRead: boolean;
  createdAt: string;
}

interface ChatContextType {
  isConnected: boolean;
  messages: ChatMessage[];
  sendMessage: (
    recipientId: number,
    recipientType: string,
    content: string
  ) => void;
  markAsRead: (senderId: number, senderType: string) => void;
  activeRecipient: { id: number; type: string; name: string } | null;
  setActiveRecipient: (
    recipient: { id: number; type: string; name: string } | null
  ) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, user } = useAuth();
  const { hasModule } = usePermissions();
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeRecipient, setActiveRecipient] = useState<{
    id: number;
    type: string;
    name: string;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const clientRef = useRef<Client | null>(null);

  // Only connect if user is authenticated AND has CHAT module permission
  const shouldConnect = isAuthenticated && hasModule('CHAT');

  useEffect(() => {
    if (!shouldConnect) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    if (clientRef.current?.active) return;

    const token = TokenManager.getAccessToken();
    if (!token) return;

    // Initialize STOMP Client
    const client = new Client({
      brokerURL: `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8080/ws`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: str => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = frame => {
      setIsConnected(true);
      // toast.success('Connected to Chat Server');

      // Subscribe to my personal queue
      // The backend sends to /user/{username}/queue/messages, but client subscribes to /user/queue/messages
      // Spring automatically translates this based on the authenticated user session
      client.subscribe('/user/queue/messages', (message: IMessage) => {
        const receivedMsg: ChatMessage = JSON.parse(message.body);
        setMessages(prev => [receivedMsg, ...prev]); // Prepend new message

        // Show notification if chat window is closed or not focused on this sender
        if (!isOpen) {
          toast(
            `New message from ${receivedMsg.senderType === 'USER' ? 'Procurement Team' : 'Vendor'}`,
            {
              icon: '💬',
            }
          );
        }
      });
    };

    client.onStompError = frame => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.onWebSocketClose = () => {
      setIsConnected(false);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
    };
    return () => {
      client.deactivate();
    };
  }, [shouldConnect, isOpen]);

  // Fetch history when activeRecipient changes
  useEffect(() => {
    if (!activeRecipient) return;

    const fetchHistory = async () => {
      try {
        const response = await apiClient.get('/chat/history', {
          params: {
            recipientId: activeRecipient.id,
            recipientType: activeRecipient.type,
            page: 0,
            size: 50,
          },
        });
        // Merge history with existing messages, avoiding duplicates
        // We trust history more, or just basic ID check
        // For simplicity, let's just add new ones that don't exist
        // Ideally, we want to replace the conversation view with this history + any real-time buffer

        // Better approach: When opening a chat, we likely want to see that chat.
        // But we maintain a single 'messages' array for all.
        // So we filter out old messages for this recipient and replace with fetched history?
        // Or just append unique IDs.

        const historyMessages: ChatMessage[] = response.data.content;

        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newUnique = historyMessages.filter(m => !existingIds.has(m.id));
          return [...newUnique, ...prev];
        });
      } catch (error) {
        console.error('Failed to fetch chat history', error);
      }
    };

    fetchHistory();
  }, [activeRecipient]);

  const sendMessage = (
    recipientId: number,
    recipientType: string,
    content: string
  ) => {
    if (!clientRef.current || !isConnected) {
      toast.error('Not connected to chat server');
      return;
    }

    const payload = {
      recipientId,
      recipientType,
      content,
    };

    clientRef.current.publish({
      destination: '/app/chat.send',
      body: JSON.stringify(payload),
    });

    // Optimistically add to local state?
    // Ideally we wait for ack, but for now we rely on the backend pushing it back to us via the topic
    // OR we assume success.
    // Better pattern: The backend should echo the message back to the sender queue so we have a single source of truth (ID, timestamp)
    // For MVP, we'll wait for the echo or just fetch history.
  };

  const markAsRead = async (senderId: number, senderType: string) => {
    try {
      await apiClient.post(
        `/chat/mark-read?senderId=${senderId}&senderType=${senderType}`
      );

      setMessages(prev => {
        // Mark messages from this sender as read
        return prev.map(msg => {
          if (msg.senderId === senderId && msg.senderType === senderType) {
            return { ...msg, isRead: true };
          }
          return msg;
        });
      });
    } catch (error) {
      console.error('Failed to mark messages as read', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        messages,
        sendMessage,
        markAsRead,
        activeRecipient,
        setActiveRecipient,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
