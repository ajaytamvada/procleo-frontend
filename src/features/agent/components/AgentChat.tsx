import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Search, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useBrief, useConfirmAction, useSendChat } from '../hooks/useAgent';
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
 * The reusable Agent conversation UI (message list + input). Fills its container's height,
 * so the parent decides the frame — the full page or the floating panel. Opens with a
 * dynamic greeting summarising the user's live workload.
 */
const AgentChat = ({ onNavigate }: AgentChatProps) => {
  const { data: brief, isLoading: briefLoading } = useBrief();
  const [messages, setMessages] = useState<ChatUiMessage[]>([]);
  const [input, setInput] = useState('');
  const send = useSendChat();
  const confirm = useConfirmAction();
  const navigate = useNavigate();
  const bottomRef = useRef<HTMLDivElement>(null);
  const greeted = useRef(false);

  // Seed the opening greeting once the brief has resolved (or failed).
  useEffect(() => {
    if (greeted.current || briefLoading) return;
    greeted.current = true;
    setMessages([{ role: 'assistant', content: buildGreeting(brief) }]);
  }, [brief, briefLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickChips = useMemo(() => {
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

  const appendAssistant = (res: ChatResponse) =>
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        content: res.message,
        proposedAction:
          res.type === 'proposed_action' ? res.proposedAction : null,
        handoff: res.type === 'handoff' ? res.handoff : null,
        steps: res.steps ?? null,
      },
    ]);

  const submit = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || send.isPending) return;
    const history: ChatHistoryItem[] = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    setMessages(prev => [...prev, { role: 'user', content: trimmed }]);
    setInput('');
    send.mutate({ message: trimmed, history }, { onSuccess: appendAssistant });
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

  return (
    <div className='flex h-full flex-col'>
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
              {m.content}
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
            </div>
          </div>
        ))}
        {send.isPending && (
          <div className='flex justify-start'>
            <div className='rounded-2xl bg-gray-100 px-4 py-2 text-sm text-muted-foreground dark:bg-gray-800'>
              Thinking…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className='border-t p-3'>
        <div className='mb-2 flex flex-wrap gap-1.5'>
          {quickChips.map(s => (
            <button
              key={s}
              type='button'
              onClick={() => submit(s)}
              disabled={send.isPending}
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
            loading={send.isPending}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AgentChat;
