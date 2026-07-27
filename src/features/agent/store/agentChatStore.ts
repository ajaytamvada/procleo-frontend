import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatUiMessage } from '../types/agent.types';

const MAX_MESSAGES = 60;

interface AgentChatState {
  messages: ChatUiMessage[];
  /** React-style updater: pass a new array or a function of the previous array. */
  setMessages: (
    value: ChatUiMessage[] | ((prev: ChatUiMessage[]) => ChatUiMessage[])
  ) => void;
  reset: () => void;
}

/**
 * The agent conversation lives here (not in component state) so it survives navigation, closing and
 * reopening the panel, refresh, and new windows — and so the full page and the floating panel share
 * ONE continuous conversation. Persisted to localStorage; capped so it can't grow unbounded.
 */
export const useAgentChatStore = create<AgentChatState>()(
  persist(
    set => ({
      messages: [],
      setMessages: value =>
        set(state => {
          const next =
            typeof value === 'function'
              ? (value as (p: ChatUiMessage[]) => ChatUiMessage[])(
                  state.messages
                )
              : value;
          return {
            messages:
              next.length > MAX_MESSAGES ? next.slice(-MAX_MESSAGES) : next,
          };
        }),
      reset: () => set({ messages: [] }),
    }),
    { name: 'procleo-agent-chat' }
  )
);
