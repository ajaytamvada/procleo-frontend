import { MailCheck, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import AgentNav from '../components/AgentNav';
import AgentApprovalCard from '../components/ApprovalCard';
import { useApprovals, useRunTick } from '../hooks/useAgent';

const AgentApprovalsPage = () => {
  const { data, isLoading, isError, refetch } = useApprovals();
  const runTick = useRunTick();
  const items = data ?? [];

  return (
    <div className='p-6'>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
            Agent PO — Approvals
          </h1>
          <p className='text-sm text-muted-foreground'>
            Drafts the agent prepared. Approve, tweak, or skip before they go to
            suppliers.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            leftIcon={<RefreshCw className='h-4 w-4' />}
            onClick={() => refetch()}
          >
            Refresh
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

      {isLoading ? (
        <div className='py-12 text-center text-muted-foreground'>Loading…</div>
      ) : isError ? (
        <div className='py-12 text-center text-red-600'>
          Failed to load approvals.
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center gap-2 py-12 text-center text-muted-foreground'>
            <MailCheck className='h-8 w-8 text-green-500' />
            Nothing waiting for approval. Run the agent loop to generate chasers
            for tracked POs.
          </CardContent>
        </Card>
      ) : (
        <div className='space-y-4'>
          {items.map(item => (
            <AgentApprovalCard key={item.taskId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AgentApprovalsPage;
