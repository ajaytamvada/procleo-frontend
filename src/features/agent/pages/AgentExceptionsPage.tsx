import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Play, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import AgentNav from '../components/AgentNav';
import { prettify, severityVariant } from '../components/severity';
import {
  useExceptions,
  useResolveException,
  useRunTick,
} from '../hooks/useAgent';

const SEVERITIES = ['', 'CRITICAL', 'WARNING', 'INFO'];

const fmt = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString() : '—';

const AgentExceptionsPage = () => {
  const [severity, setSeverity] = useState('');
  const { data, isLoading, isError, refetch } = useExceptions(
    'open',
    severity || undefined
  );
  const resolve = useResolveException();
  const runTick = useRunTick();

  const rows = data?.content ?? [];

  return (
    <div className='p-6'>
      <div className='mb-2 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100'>
            Agent PO — Exceptions
          </h1>
          <p className='text-sm text-muted-foreground'>
            What needs your attention: unacknowledged POs, disputes, and replies
            to review.
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

      <Card>
        <CardHeader className='flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-amber-500' />
            Open exceptions
          </CardTitle>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Severity</span>
            <select
              className='h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-900'
              value={severity}
              onChange={e => setSeverity(e.target.value)}
            >
              {SEVERITIES.map(s => (
                <option key={s} value={s}>
                  {s === '' ? 'All' : prettify(s)}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='py-12 text-center text-muted-foreground'>
              Loading…
            </div>
          ) : isError ? (
            <div className='py-12 text-center text-red-600'>
              Failed to load exceptions.
            </div>
          ) : rows.length === 0 ? (
            <div className='flex flex-col items-center gap-2 py-12 text-center text-muted-foreground'>
              <CheckCircle2 className='h-8 w-8 text-green-500' />
              No open exceptions. The agent has everything under control.
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b text-left text-muted-foreground'>
                    <th className='py-2 pr-4 font-medium'>Severity</th>
                    <th className='py-2 pr-4 font-medium'>Type</th>
                    <th className='py-2 pr-4 font-medium'>PO</th>
                    <th className='py-2 pr-4 font-medium'>Supplier</th>
                    <th className='py-2 pr-4 font-medium'>Raised</th>
                    <th className='py-2 pr-4 font-medium'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className='border-b last:border-0'>
                      <td className='py-3 pr-4'>
                        <Badge variant={severityVariant(row.severity)}>
                          {prettify(row.severity)}
                        </Badge>
                      </td>
                      <td className='py-3 pr-4 capitalize'>
                        {prettify(row.alertType)}
                      </td>
                      <td className='py-3 pr-4'>
                        {row.poId != null ? (
                          <Link
                            to={`/agent/pos/${row.poId}`}
                            className='font-medium text-violet-600 hover:underline'
                          >
                            {row.poNumber ?? `PO #${row.poId}`}
                          </Link>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className='py-3 pr-4'>{row.supplierName ?? '—'}</td>
                      <td className='py-3 pr-4 text-muted-foreground'>
                        {fmt(row.createdAt)}
                      </td>
                      <td className='py-3 pr-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          loading={
                            resolve.isPending &&
                            resolve.variables?.id === row.id
                          }
                          onClick={() => resolve.mutate({ id: row.id })}
                        >
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentExceptionsPage;
