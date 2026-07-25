import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Inbox,
  Mail,
  MailOpen,
  Pause,
  Play,
  Send,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AgentNav from '../components/AgentNav';
import {
  useEnrollPo,
  usePausePo,
  useRunTick,
  useSimulateInbound,
  useThread,
  useTimeline,
} from '../hooks/useAgent';
import type { TimelineEntry } from '../types/agent.types';

const fmt = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString() : '';

const kindIcon = (kind: string) => {
  switch (kind) {
    case 'email_out':
      return <Mail className='h-4 w-4 text-violet-600' />;
    case 'email_in':
      return <MailOpen className='h-4 w-4 text-blue-600' />;
    case 'extraction':
      return <Sparkles className='h-4 w-4 text-amber-500' />;
    case 'exception':
      return <AlertTriangle className='h-4 w-4 text-red-600' />;
    default:
      return <FileText className='h-4 w-4 text-gray-400' />;
  }
};

const AgentPoTimelinePage = () => {
  const { poId: poIdParam } = useParams<{ poId: string }>();
  const poId = poIdParam ? Number(poIdParam) : null;

  const { data: timeline, isLoading } = useTimeline(poId);
  const { data: thread } = useThread(poId);
  const enroll = useEnrollPo();
  const pause = usePausePo();
  const runTick = useRunTick();
  const simulate = useSimulateInbound();

  const [replyBody, setReplyBody] = useState(
    'Thank you for the purchase order. We confirm delivery by 2026-08-15.'
  );
  const [fromAddress, setFromAddress] = useState('sales@vendor.com');

  useEffect(() => {
    if (thread?.contactEmail) {
      setFromAddress(thread.contactEmail);
    }
  }, [thread?.contactEmail]);

  const entries: TimelineEntry[] = timeline ?? [];

  const sendReply = () => {
    if (poId == null) return;
    simulate.mutate({
      threadToken: thread?.threadToken ?? undefined,
      poId,
      fromAddress,
      body: replyBody,
    });
  };

  return (
    <div className='p-6'>
      <Link
        to='/agent/exceptions'
        className='mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' /> Back to Agent PO
      </Link>

      <div className='mb-2 flex items-center justify-between'>
        <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
          PO #{poId} — Agent activity
        </h1>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            leftIcon={<Inbox className='h-4 w-4' />}
            loading={enroll.isPending}
            onClick={() => poId != null && enroll.mutate(poId)}
          >
            Enroll
          </Button>
          <Button
            variant='ghost'
            leftIcon={<Pause className='h-4 w-4' />}
            loading={pause.isPending}
            onClick={() => poId != null && pause.mutate(poId)}
          >
            Pause
          </Button>
          <Button
            leftIcon={<Play className='h-4 w-4' />}
            loading={runTick.isPending}
            onClick={() => runTick.mutate()}
          >
            Run agent loop
          </Button>
        </div>
      </div>

      <AgentNav />

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Card>
            <CardHeader>
              <CardTitle>Activity timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className='py-8 text-center text-muted-foreground'>
                  Loading…
                </div>
              ) : entries.length === 0 ? (
                <div className='py-8 text-center text-muted-foreground'>
                  No activity yet. Enroll this PO and run the agent loop.
                </div>
              ) : (
                <ol className='space-y-4'>
                  {entries.map((e, i) => (
                    <li key={i} className='flex gap-3'>
                      <div className='mt-0.5'>{kindIcon(e.kind)}</div>
                      <div className='flex-1 border-b pb-3 last:border-0'>
                        <div className='text-sm text-gray-900 dark:text-gray-100'>
                          {e.summary}
                        </div>
                        <div className='text-xs text-muted-foreground'>
                          {e.actor} · {fmt(e.timestamp)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <div className='space-y-6'>
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Send className='h-4 w-4' /> Simulate a supplier reply
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <p className='text-xs text-muted-foreground'>
                Test helper: feeds a reply into the loop (RECEIVE → EXTRACT →
                APPLY) without real email.
                {thread?.threadToken
                  ? ` Thread: ${thread.threadToken}`
                  : ' Send a chaser first to create a thread.'}
              </p>
              <input
                className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
                value={fromAddress}
                onChange={e => setFromAddress(e.target.value)}
                placeholder='From address'
              />
              <textarea
                className='min-h-[120px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder='Reply body'
              />
              <Button
                className='w-full'
                leftIcon={<Send className='h-4 w-4' />}
                loading={simulate.isPending}
                disabled={!thread?.threadToken}
                onClick={sendReply}
              >
                Send simulated reply
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email thread</CardTitle>
            </CardHeader>
            <CardContent>
              {!thread || thread.messages.length === 0 ? (
                <div className='py-4 text-center text-sm text-muted-foreground'>
                  No messages yet.
                </div>
              ) : (
                <div className='space-y-3'>
                  {thread.messages.map(m => (
                    <div
                      key={m.id}
                      className={
                        m.direction === 'out'
                          ? 'rounded-lg bg-violet-50 p-3 dark:bg-violet-950/40'
                          : 'rounded-lg bg-gray-50 p-3 dark:bg-gray-800/60'
                      }
                    >
                      <div className='mb-1 text-xs text-muted-foreground'>
                        {m.direction === 'out' ? 'Sent' : 'Received'} ·{' '}
                        {fmt(m.sentAt)}
                      </div>
                      <div className='whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200'>
                        {m.body}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AgentPoTimelinePage;
