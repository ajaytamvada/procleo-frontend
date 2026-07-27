import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  Check,
  RotateCcw,
  Search,
  Send,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  useBrief,
  useConfirmAction,
  useSendChat,
  useSubmitFeedback,
} from '../hooks/useAgent';
import { useAgentChatStore } from '../store/agentChatStore';
import { streamChat } from '../services/agent.service';
import type {
  Brief,
  BriefItem,
  ChatHistoryItem,
  ChatResponse,
  ChatUiMessage,
} from '../types/agent.types';

/** Short, human phrase for a brief item, used in the opening greeting. */
const shortLabel = (item: BriefItem): string => {
  switch (item.kind) {
    case 'approvals':
      return item.count === 1 ? 'PR to approve' : 'PRs to approve';
    case 'rfp_approvals':
      return item.count === 1 ? 'RFP to approve' : 'RFPs to approve';
    case 'po_approvals':
      return item.count === 1 ? 'PO to approve' : 'POs to approve';
    case 'invoice_approvals':
      return item.count === 1 ? 'invoice to approve' : 'invoices to approve';
    case 'grn_approvals':
      return item.count === 1 ? 'GRN to approve' : 'GRNs to approve';
    case 'exceptions':
      return item.count === 1 ? 'exception to review' : 'exceptions to review';
    case 'awaiting_ack':
      return 'awaiting supplier ack';
    case 'drafts':
      return item.count === 1 ? 'draft PR' : 'draft PRs';
    default:
      return item.kind.replace(/_/g, ' ');
  }
};

/**
 * Best-effort read of "what record am I looking at" from the URL, sent to the agent so "approve
 * this" / "chase it" resolves to the record on screen. It's only a hint — the confirm card still
 * shows the real record, so a wrong guess is caught.
 */
const describeRoute = (pathname: string): string | undefined => {
  const idSeg = pathname
    .split('/')
    .filter(Boolean)
    .reverse()
    .find(s => /^\d+$/.test(s));
  if (!idSeg) return undefined;
  let type: string | undefined;
  if (pathname.includes('purchase-orders') || pathname.includes('/agent/pos'))
    type = 'Purchase Order';
  else if (
    pathname.includes('purchase-requisition') ||
    pathname.includes('/purchase/')
  )
    type = 'Purchase Requisition';
  else if (pathname.includes('/rfp')) type = 'RFP';
  else if (pathname.includes('invoice')) type = 'Invoice';
  else if (pathname.includes('/grn')) type = 'GRN';
  else if (pathname.includes('/asset')) type = 'Asset';
  return type ? `${type} (id ${idSeg})` : undefined;
};

const buildGreeting = (brief?: Brief): string => {
  if (!brief || brief.totalCount === 0) {
    return "Hi 👋 I'm your ProcLeo assistant. You're all clear right now — nothing needs your attention. I can raise a requisition, chase a supplier, approve things, or answer questions about your procurement data. What would you like to do?";
  }
  const parts = brief.items.slice(0, 4).map(i => `${i.count} ${shortLabel(i)}`);
  return `Hi 👋 Here's what needs you today — ${parts.join(', ')}. I can act on any of these, raise requisitions, chase suppliers, or just answer questions. Where should we start?`;
};

interface AgentChatProps {
  /** Called when the user navigates away via a handoff (e.g. to close a panel). */
  onNavigate?: () => void;
}

/**
 * The reusable Agent conversation UI. Its messages live in a persisted store (agentChatStore), so
 * the conversation survives navigation, panel open/close, and refresh — and the full page and the
 * floating panel share ONE conversation. Opens with a dynamic greeting; chips adapt each turn.
 */
const AgentChat = ({ onNavigate }: AgentChatProps) => {
  const { data: brief, isLoading: briefLoading } = useBrief();
  const messages = useAgentChatStore(s => s.messages);
  const setMessages = useAgentChatStore(s => s.setMessages);
  const reset = useAgentChatStore(s => s.reset);
  const [input, setInput] = useState('');
  const send = useSendChat();
  const confirm = useConfirmAction();
  const feedback = useSubmitFeedback();
  const navigate = useNavigate();
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Abort any in-flight stream when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const busy = streaming || send.isPending;

  // Greet only when there's no existing conversation to resume.
  useEffect(() => {
    if (briefLoading || messages.length > 0) return;
    setMessages([{ role: 'assistant', content: buildGreeting(brief) }]);
  }, [brief, briefLoading, messages.length, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const starterChips = useMemo(() => {
    const chips: string[] = [];
    const hasApprovals = (brief?.items ?? []).some(i =>
      i.kind.includes('approval')
    );
    if (hasApprovals) chips.push('What needs my approval?');
    chips.push('Raise a PR for 2 laptops');
    chips.push('Create an RFP from approved PRs');
    if (!hasApprovals) chips.push('What can you do?');
    return chips.slice(0, 4);
  }, [brief]);

  // Chips "keep changing": show the latest assistant turn's suggestions, else the starters.
  const activeChips = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') {
        const s = messages[i].suggestions;
        return s && s.length > 0 ? s : starterChips;
      }
    }
    return starterChips;
  }, [messages, starterChips]);

  // Patch the last message (the in-flight assistant turn) as stream events arrive.
  const patchLast = (patch: (m: ChatUiMessage) => ChatUiMessage) =>
    setMessages(prev => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      next[next.length - 1] = patch(next[next.length - 1]);
      return next;
    });

  // Fold a complete (non-streamed) response — WRITE proposal, handoff, or canned text — onto the turn.
  const applyFinal = (m: ChatUiMessage, res: ChatResponse): ChatUiMessage => ({
    ...m,
    content: res.message ?? m.content,
    proposedAction:
      res.type === 'proposed_action'
        ? res.proposedAction
        : (m.proposedAction ?? null),
    handoff: res.type === 'handoff' ? res.handoff : (m.handoff ?? null),
    steps: res.steps ?? m.steps ?? null,
    suggestions: res.suggestions ?? m.suggestions ?? null,
  });

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const history: ChatHistoryItem[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    const context = describeRoute(location.pathname);
    // Add the user turn and an empty assistant turn that the stream fills in.
    setMessages(prev => [
      ...prev,
      { role: 'user', content: trimmed },
      { role: 'assistant', content: '' },
    ]);
    setInput('');
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;
    let streamedAny = false;

    streamChat(
      trimmed,
      history,
      context,
      {
        onStep: s => {
          streamedAny = true;
          patchLast(m => ({ ...m, steps: [...(m.steps ?? []), s] }));
        },
        onToken: t => {
          streamedAny = true;
          patchLast(m => ({ ...m, content: (m.content ?? '') + t }));
        },
        onMeta: suggestions => patchLast(m => ({ ...m, suggestions })),
        onFinal: res => {
          streamedAny = true;
          patchLast(m => applyFinal(m, res));
        },
        onError: msg => patchLast(m => ({ ...m, content: m.content || msg })),
      },
      controller.signal
    )
      .catch(async err => {
        if (controller.signal.aborted) return;
        // SSE blocked or failed mid-flight: fall back to the plain endpoint so we still answer.
        if (!streamedAny) {
          await new Promise<void>(resolve =>
            send.mutate(
              { message: trimmed, history, context },
              {
                onSuccess: res =>
                  patchLast(m => applyFinal({ ...m, content: '' }, res)),
                onSettled: () => resolve(),
              }
            )
          );
        } else {
          patchLast(m => ({
            ...m,
            content: m.content || 'The assistant could not finish responding.',
          }));
        }
        void err;
      })
      .finally(() => {
        setStreaming(false);
        abortRef.current = null;
      });
  };

  const handleReset = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    setStreaming(false);
    reset();
  };

  const resolveAction = (
    index: number,
    actionId: number,
    doConfirm: boolean
  ) => {
    confirm.mutate(
      { actionId, confirm: doConfirm },
      {
        onSuccess: res => {
          setMessages(prev => {
            const next = [...prev];
            if (next[index])
              next[index] = { ...next[index], actionResolved: true };
            return [...next, { role: 'assistant', content: res.message }];
          });
        },
      }
    );
  };

  const goTo = (route: string) => {
    navigate(route);
    onNavigate?.();
  };

  const rate = (index: number, rating: 'up' | 'down') => {
    const prev = messages[index - 1];
    const userMessage = prev && prev.role === 'user' ? prev.content : '';
    feedback.mutate({
      rating,
      userMessage,
      assistantReply: messages[index].content,
    });
    setMessages(cur => {
      const next = [...cur];
      if (next[index]) next[index] = { ...next[index], feedback: rating };
      return next;
    });
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center justify-end border-b border-gray-200 px-3 py-1.5 dark:border-gray-800'>
        <button
          type='button'
          onClick={handleReset}
          className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
        >
          <RotateCcw className='h-3 w-3' /> New chat
        </button>
      </div>

      <div className='flex flex-1 flex-col gap-4 overflow-y-auto p-4'>
        {messages.map((m, i) => (
          <div
            key={i}
            className={cn(
              'flex',
              m.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
                m.role === 'user'
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100'
              )}
            >
              {m.role === 'assistant' && m.steps && m.steps.length > 0 && (
                <div className='mb-2 space-y-1 border-b border-gray-200 pb-2 dark:border-gray-700'>
                  {m.steps.map((s, si) => (
                    <div
                      key={si}
                      className='flex items-start gap-1.5 text-xs text-muted-foreground'
                    >
                      <Search className='mt-0.5 h-3 w-3 flex-shrink-0' />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              )}
              {m.content
                ? m.content
                : m.role === 'assistant' &&
                  (!m.steps || m.steps.length === 0) &&
                  streaming &&
                  i === messages.length - 1 && (
                    <span className='inline-flex items-center gap-1 text-muted-foreground'>
                      <span className='h-1.5 w-1.5 animate-pulse rounded-full bg-current' />
                      Thinking…
                    </span>
                  )}
              {m.proposedAction && (
                <div className='mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/40'>
                  <div className='mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800 dark:text-amber-300'>
                    Confirm action
                  </div>
                  <div className='mb-3 text-sm text-gray-800 dark:text-gray-200'>
                    {m.proposedAction.summary}
                  </div>
                  <div className='flex gap-2'>
                    <Button
                      size='sm'
                      leftIcon={<Check className='h-4 w-4' />}
                      loading={confirm.isPending}
                      disabled={m.actionResolved}
                      onClick={() =>
                        resolveAction(i, m.proposedAction!.actionId, true)
                      }
                    >
                      Confirm
                    </Button>
                    <Button
                      size='sm'
                      variant='ghost'
                      leftIcon={<X className='h-4 w-4' />}
                      disabled={m.actionResolved}
                      onClick={() =>
                        resolveAction(i, m.proposedAction!.actionId, false)
                      }
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              {m.handoff && (
                <div className='mt-3'>
                  <Button
                    size='sm'
                    variant='outline'
                    rightIcon={<ArrowUpRight className='h-4 w-4' />}
                    onClick={() => goTo(m.handoff!.route)}
                  >
                    {m.handoff.label}
                  </Button>
                </div>
              )}
              {m.role === 'assistant' && i > 0 && (
                <div className='mt-2 flex items-center gap-0.5'>
                  <button
                    type='button'
                    disabled={!!m.feedback}
                    onClick={() => rate(i, 'up')}
                    aria-label='Helpful'
                    className={cn(
                      'rounded p-1 hover:bg-black/5 disabled:hover:bg-transparent dark:hover:bg-white/10',
                      m.feedback === 'up'
                        ? 'text-green-600'
                        : 'text-muted-foreground'
                    )}
                  >
                    <ThumbsUp className='h-3.5 w-3.5' />
                  </button>
                  <button
                    type='button'
                    disabled={!!m.feedback}
                    onClick={() => rate(i, 'down')}
                    aria-label='Not helpful'
                    className={cn(
                      'rounded p-1 hover:bg-black/5 disabled:hover:bg-transparent dark:hover:bg-white/10',
                      m.feedback === 'down'
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                    )}
                  >
                    <ThumbsDown className='h-3.5 w-3.5' />
                  </button>
                  {m.feedback && (
                    <span className='ml-1 text-xs text-muted-foreground'>
                      Thanks!
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className='border-t border-gray-200 p-3 dark:border-gray-800'>
        <div className='mb-2 flex flex-wrap gap-1.5'>
          {activeChips.map(s => (
            <button
              key={s}
              type='button'
              onClick={() => submit(s)}
              disabled={busy}
              className='rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
            >
              {s}
            </button>
          ))}
        </div>
        <form
          className='flex gap-2'
          onSubmit={e => {
            e.preventDefault();
            submit(input);
          }}
        >
          <input
            className='flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 dark:border-gray-700 dark:bg-gray-900'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder='Ask, or tell me to do something…'
          />
          <Button
            type='submit'
            leftIcon={<Send className='h-4 w-4' />}
            loading={busy}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
