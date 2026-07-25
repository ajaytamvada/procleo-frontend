import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Pencil, SkipForward, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { prettify } from './severity';
import { useDecideApproval } from '../hooks/useAgent';
import type { ApprovalItem } from '../types/agent.types';

const AgentApprovalCard = ({ item }: { item: ApprovalItem }) => {
  const decide = useDecideApproval();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState(item.subject ?? '');
  const [body, setBody] = useState(item.body ?? '');

  const busy = decide.isPending;

  const approve = () =>
    decide.mutate({ taskId: item.taskId, decision: { action: 'APPROVE' } });

  const saveAndSend = () =>
    decide.mutate({
      taskId: item.taskId,
      decision: {
        action: 'EDIT_APPROVE',
        editedSubject: subject,
        editedBody: body,
      },
    });

  const skip = () =>
    decide.mutate({ taskId: item.taskId, decision: { action: 'SKIP' } });

  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='mb-3 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary'>{prettify(item.taskType)}</Badge>
            {item.poId != null && (
              <Link
                to={`/agent/pos/${item.poId}`}
                className='text-sm font-medium text-violet-600 hover:underline'
              >
                {item.poNumber ?? `PO #${item.poId}`}
              </Link>
            )}
            {item.supplierName && (
              <span className='text-sm text-muted-foreground'>
                · {item.supplierName}
              </span>
            )}
          </div>
          <span className='text-xs text-muted-foreground'>
            To: {item.toAddress ?? '—'}
          </span>
        </div>

        {editing ? (
          <div className='space-y-3'>
            <input
              className='w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder='Subject'
            />
            <textarea
              className='min-h-[160px] w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900'
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder='Email body'
            />
            <div className='flex gap-2'>
              <Button
                leftIcon={<Check className='h-4 w-4' />}
                loading={busy}
                onClick={saveAndSend}
              >
                Save &amp; send
              </Button>
              <Button
                variant='ghost'
                leftIcon={<X className='h-4 w-4' />}
                onClick={() => {
                  setSubject(item.subject ?? '');
                  setBody(item.body ?? '');
                  setEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className='mb-1 text-sm font-semibold text-gray-900 dark:text-gray-100'>
              {item.subject ?? '(no subject)'}
            </div>
            <p className='mb-4 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300'>
              {item.body ?? ''}
            </p>
            <div className='flex gap-2'>
              <Button
                leftIcon={<Check className='h-4 w-4' />}
                loading={busy}
                onClick={approve}
              >
                Approve &amp; send
              </Button>
              <Button
                variant='outline'
                leftIcon={<Pencil className='h-4 w-4' />}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                variant='ghost'
                leftIcon={<SkipForward className='h-4 w-4' />}
                loading={busy}
                onClick={skip}
              >
                Skip
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentApprovalCard;
