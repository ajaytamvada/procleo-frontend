import React, { useState, useEffect, useRef } from 'react';
import { useChat, ChatMessage } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import {
  MessageSquare,
  X,
  Send,
  ChevronLeft,
  User,
  Bot,
  HelpCircle,
} from 'lucide-react';
import { TokenManager, apiClient } from '@/lib/api';
import { usePermissions } from '@/hooks/usePermissions';

// Simple Contact Interface
interface ChatContact {
  id: number;
  type: 'USER' | 'VENDOR';
  name: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
  avatarUrl?: string;
}

interface ChatWidgetProps {
  onOpenChatbot?: () => void;
}

export const ChatWidget: React.FC<ChatWidgetProps> = ({ onOpenChatbot }) => {
  const {
    isConnected,
    isOpen,
    setIsOpen,
    messages,
    sendMessage,
    markAsRead,
    activeRecipient,
    setActiveRecipient,
  } = useChat();
  const { user } = useAuth();
  const { hasModule } = usePermissions();
  const [messageInput, setMessageInput] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && activeRecipient) {
      scrollToBottom();
      markAsRead(activeRecipient.id, activeRecipient.type);
      setContacts(prev =>
        prev.map(c => {
          if (c.id === activeRecipient.id && c.type === activeRecipient.type) {
            return { ...c, unreadCount: 0 };
          }
          return c;
        })
      );
    }
  }, [messages, isOpen, activeRecipient]);

  // Fetch contacts when widget opens or search changes
  useEffect(() => {
    if (!isOpen) return;

    const fetchContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const response = await apiClient.get('/chat/contacts', {
          params: { query: searchInput },
        });
        setContacts(response.data);
      } catch (error) {
        console.error('Failed to fetch contacts', error);
        setContacts([]);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchContacts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isOpen, searchInput]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !activeRecipient) return;

    sendMessage(activeRecipient.id, activeRecipient.type, messageInput);
    setMessageInput('');
  };

  const filteredMessages = activeRecipient
    ? messages
        .filter(
          m =>
            (m.senderId === activeRecipient.id &&
              m.senderType === activeRecipient.type) ||
            (m.recipientId === activeRecipient.id &&
              m.recipientType === activeRecipient.type)
        )
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
    : [];

  // Permission Check
  if (!hasModule('CHAT')) {
    return null;
  }

  const handleChatClick = () => {
    setShowMenu(false);
    setIsOpen(true);
  };

  const handleChatbotClick = () => {
    setShowMenu(false);
    if (onOpenChatbot) {
      onOpenChatbot();
    }
  };

  return (
    <>
      {/* Blue Rounded Corner Background - Slides in from right */}
      <div
        className={`fixed bottom-0 right-0 pointer-events-none transition-transform duration-400 ease-in-out ${
          showMenu && !isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, #1a1d4d 0%, #252952 100%)',
          borderTopLeftRadius: '100%',
          width: '300px',
          height: '300px',
          zIndex: 45,
        }}
      />

      <div
        className='fixed bottom-6 right-6 flex flex-col items-end gap-3'
        style={{ zIndex: 60 }}
      >
        {/* Chat Window */}
        {isOpen && (
          <div className='w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden transition-all duration-200 ease-in-out'>
            {/* Header */}
            <div className='bg-indigo-600 p-4 text-white flex items-center justify-between'>
              {activeRecipient ? (
                <div className='flex items-center gap-2'>
                  <button
                    onClick={() => setActiveRecipient(null)}
                    className='hover:bg-indigo-700 p-1 rounded-full'
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className='flex flex-col'>
                    <span className='font-semibold text-sm'>
                      {activeRecipient.name}
                    </span>
                    <span className='text-xs opacity-80 flex items-center gap-1'>
                      <div className='w-1.5 h-1.5 bg-green-400 rounded-full' />
                      Online
                    </span>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <MessageSquare size={20} />
                  <span className='font-semibold'>Messages</span>
                </div>
              )}
              <div className='flex items-center gap-2'>
                <div
                  className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}
                  title={isConnected ? 'Connected' : 'Disconnected'}
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className='hover:bg-indigo-700 p-1 rounded-full text-indigo-100 hover:text-white'
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='flex-1 overflow-y-auto bg-gray-50 relative'>
              {!activeRecipient ? (
                <div className='flex flex-col h-full'>
                  <div className='p-3 border-b border-gray-100 bg-white'>
                    <input
                      type='text'
                      placeholder='Search people...'
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      className='w-full bg-gray-100 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500/20 text-gray-800 placeholder:text-gray-400'
                    />
                  </div>
                  <div className='flex-1 overflow-y-auto p-2'>
                    {isLoadingContacts ? (
                      <div className='p-4 text-center text-gray-400 text-sm'>
                        Searching...
                      </div>
                    ) : contacts.length > 0 ? (
                      contacts.map(contact => (
                        <button
                          key={`${contact.type}-${contact.id}`}
                          onClick={() => setActiveRecipient(contact)}
                          className='w-full flex items-center gap-3 p-3 hover:bg-white hover:shadow-sm rounded-xl transition-all duration-200 border border-transparent hover:border-gray-100 mb-1'
                        >
                          <div className='w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold'>
                            {contact.avatarUrl ? (
                              <img
                                src={contact.avatarUrl}
                                alt={contact.name}
                                className='w-full h-full rounded-full object-cover'
                              />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div className='flex-1 text-left min-w-0'>
                            <div className='flex justify-between items-baseline'>
                              <div className='font-medium text-gray-800 text-sm truncate pr-2'>
                                {contact.name}
                              </div>
                              {contact.lastMessageTime && (
                                <div className='text-[10px] text-gray-400 whitespace-nowrap'>
                                  {new Date(
                                    contact.lastMessageTime
                                  ).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              )}
                            </div>
                            <div className='text-xs text-gray-500 truncate'>
                              {contact.lastMessage ? (
                                <span
                                  className={
                                    contact.unreadCount > 0
                                      ? 'font-medium text-gray-800'
                                      : ''
                                  }
                                >
                                  {contact.lastMessage}
                                </span>
                              ) : (
                                <span>
                                  {contact.type === 'VENDOR'
                                    ? 'External Vendor'
                                    : 'Internal User'}
                                </span>
                              )}
                            </div>
                          </div>
                          {contact.unreadCount > 0 && (
                            <div className='w-5 h-5 bg-indigo-600 rounded-full text-[10px] text-white flex items-center justify-center font-bold'>
                              {contact.unreadCount}
                            </div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className='p-8 text-center text-gray-400 text-sm flex flex-col items-center gap-2'>
                        {searchInput ? (
                          <p>No results found.</p>
                        ) : (
                          <>
                            <MessageSquare size={32} className='opacity-20' />
                            <p>Search to start a chat</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className='p-4 space-y-3'>
                  {filteredMessages.map((msg, idx) => {
                    const myType = user?.vendorId ? 'VENDOR' : 'USER';
                    const myId = user?.vendorId || user?.id;
                    const isSentByMe =
                      msg.senderType === myType && msg.senderId === myId;

                    return (
                      <div
                        key={idx}
                        className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                            isSentByMe
                              ? 'bg-indigo-600 text-white rounded-br-none'
                              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                          }`}
                        >
                          {msg.content}
                          <div
                            className={`text-[10px] mt-1 text-right ${isSentByMe ? 'text-indigo-200' : 'text-gray-400'}`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Footer / Input */}
            {activeRecipient && (
              <form
                onSubmit={handleSend}
                className='p-3 bg-white border-t border-gray-100 flex gap-2'
              >
                <input
                  type='text'
                  value={messageInput}
                  onChange={e => setMessageInput(e.target.value)}
                  placeholder='Type a message...'
                  className='flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all'
                />
                <button
                  type='submit'
                  disabled={!messageInput.trim() || !isConnected}
                  className='w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm'
                >
                  <Send size={18} className='translate-x-0.5' />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Expandable Menu */}
        {showMenu && !isOpen && (
          <div
            className='flex flex-col items-end gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200'
            style={{ zIndex: 55 }}
          >
            <button
              onClick={handleChatClick}
              className='bg-white hover:bg-gray-50 text-gray-800 text-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:scale-105'
            >
              <MessageSquare size={15} className='text-indigo-600' />
              <span className='font-medium'>Chat</span>
            </button>

            <button
              onClick={handleChatbotClick}
              className='bg-white hover:bg-gray-50 text-gray-800 text-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3 transition-all duration-200 hover:shadow-xl hover:scale-105'
            >
              <Bot size={15} className='text-indigo-600' />
              <span className='font-medium'>Chatbot</span>
            </button>

            <button
              onClick={() => setShowMenu(false)}
              className='w-10 h-10 bg-white hover:bg-gray-50 text-gray-800 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 hover:shadow-xl hover:scale-105'
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Main "Need Help" Button */}
        {!isOpen && !showMenu && (
          <button
            onClick={() => setShowMenu(true)}
            className='bg-[#1a1d4d] hover:bg-[#252952] text-white px-4 py-2 rounded-full shadow-xl flex items-center gap-3 transition-all duration-300 hover:shadow-2xl hover:scale-105'
            style={{ zIndex: 55 }}
          >
            <HelpCircle size={20} />
            <span className='text-sm font-semibold text-base'>Need Help</span>
          </button>
        )}
      </div>
    </>
  );
};
