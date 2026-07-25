import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import AgentNav from '../components/AgentNav';
import AgentBriefCard from '../components/AgentBriefCard';
import AgentChat from '../components/AgentChat';

const AgentChatPage = () => {
  return (
    <div className='p-6'>
      <div className='mb-2'>
        <h1 className='flex items-center gap-2 text-2xl font-semibold text-gray-900 dark:text-gray-100'>
          <Sparkles className='h-6 w-6 text-violet-600' /> ProcLeo Assistant
        </h1>
        <p className='text-sm text-muted-foreground'>
          Ask questions or give instructions. Anything that changes data always
          asks for your confirmation.
        </p>
      </div>

      <AgentNav />

      <AgentBriefCard />

      <Card className='h-[calc(100vh-18rem)] overflow-hidden'>
        <AgentChat />
      </Card>
    </div>
  );
};

export default AgentChatPage;
