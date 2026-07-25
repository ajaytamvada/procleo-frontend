import { NavLink } from 'react-router-dom';
import { Inbox, MailCheck, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Simple top nav shared across Agent PO pages. */
const AgentNav = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
      isActive
        ? 'bg-violet-600 text-white'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
    );

  return (
    <div className='mb-6 flex items-center gap-2'>
      <NavLink to='/agent/exceptions' className={linkClass}>
        <Inbox className='h-4 w-4' />
        Exceptions
      </NavLink>
      <NavLink to='/agent/approvals' className={linkClass}>
        <MailCheck className='h-4 w-4' />
        Approvals
      </NavLink>
      <NavLink to='/agent/chat' className={linkClass}>
        <Sparkles className='h-4 w-4' />
        Assistant
      </NavLink>
    </div>
  );
};

export default AgentNav;
