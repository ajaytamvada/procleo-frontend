import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { useAnalytics } from '../hooks/useAgent';

const prettyTool = (t: string) => t.toLowerCase().replace(/_/g, ' ');

const Stat = ({ label, value }: { label: string; value: string | number }) => (
  <div>
    <div className='text-lg font-semibold text-gray-900 dark:text-gray-100'>
      {value}
    </div>
    <div className='text-xs text-muted-foreground'>{label}</div>
  </div>
);

/**
 * Lightweight "how is the agent being used" card: proposed-action outcomes, confirm rate, thumbs
 * feedback, and the most-used actions. Renders nothing until there's data.
 */
const AgentInsightsCard = () => {
  const { data } = useAnalytics();

  if (!data) return null;
  const hasAnything =
    data.totalActions > 0 || data.feedbackUp > 0 || data.feedbackDown > 0;
  if (!hasAnything) return null;

  const actioned = data.confirmed + data.cancelled + data.failed;
  const confirmRate =
    actioned > 0 ? Math.round((data.confirmed / actioned) * 100) : 0;

  return (
    <Card className='mt-6'>
      <CardContent className='pt-6'>
        <h3 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100'>
          <BarChart3 className='h-4 w-4 text-violet-600' /> Agent insights
        </h3>

        <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
          <Stat label='Confirmed' value={data.confirmed} />
          <Stat label='Cancelled' value={data.cancelled} />
          <Stat label='Confirm rate' value={`${confirmRate}%`} />
          <Stat
            label='Feedback'
            value={`${data.feedbackUp} 👍 / ${data.feedbackDown} 👎`}
          />
        </div>

        {data.topTools.length > 0 && (
          <div className='mt-5'>
            <div className='mb-1.5 text-xs font-medium text-muted-foreground'>
              Most-used actions
            </div>
            <div className='flex flex-wrap gap-1.5'>
              {data.topTools.map(t => (
                <span
                  key={t.tool}
                  className='rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                >
                  {prettyTool(t.tool)} · {t.count}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AgentInsightsCard;
