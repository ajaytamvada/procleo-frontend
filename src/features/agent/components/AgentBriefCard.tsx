import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  Mail,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useBrief } from '../hooks/useAgent';
import type { BriefItem } from '../types/agent.types';

const kindIcon = (kind: string) => {
  switch (kind) {
    case 'approvals':
      return <ClipboardList className='h-4 w-4' />;
    case 'exceptions':
      return <AlertTriangle className='h-4 w-4' />;
    case 'awaiting_ack':
      return <Mail className='h-4 w-4' />;
    default:
      return <FileText className='h-4 w-4' />;
  }
};

const severityClasses = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300';
    case 'warning':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    default:
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
  }
};

const Row = ({ item }: { item: BriefItem }) => {
  const body = (
    <div className='flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/60'>
      <span
        className={cn(
          'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
          severityClasses(item.severity)
        )}
      >
        {kindIcon(item.kind)}
      </span>
      <div className='min-w-0 flex-1'>
        <div className='text-sm font-medium text-gray-900 dark:text-gray-100'>
          <span className='mr-1 font-semibold'>{item.count}</span>
          {item.title}
        </div>
        {item.detail && (
          <div className='truncate text-xs text-muted-foreground'>
            {item.detail}
          </div>
        )}
      </div>
      {item.actionUrl && (
        <ArrowRight className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
      )}
    </div>
  );

  return item.actionUrl ? (
    <Link to={item.actionUrl} className='block'>
      {body}
    </Link>
  ) : (
    body
  );
};

/** Proactive "what needs me today" summary. Renders nothing while loading or on error. */
const AgentBriefCard = () => {
  const { data, isLoading, isError } = useBrief();

  if (isLoading || isError || !data) {
    return null;
  }

  return (
    <Card className='mb-6'>
      <CardContent className='pt-6'>
        <div className='mb-3 flex items-center gap-2'>
          {data.totalCount === 0 ? (
            <CheckCircle2 className='h-5 w-5 text-green-500' />
          ) : (
            <ClipboardList className='h-5 w-5 text-violet-600' />
          )}
          <h2 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            {data.headline}
          </h2>
        </div>
        {data.items.length > 0 && (
          <div className='space-y-1'>
            {data.items.map(item => (
              <Row key={item.kind} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentBriefCard;
