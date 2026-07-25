import { useEffect, useState } from 'react';
import { Bot, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const KEY_DISMISSED = 'agent_welcome_dismissed';
const KEY_VIEWS = 'agent_welcome_views';
const MAX_VIEWS = 3;

/**
 * Dismissible post-login nudge introducing the AI assistant. Shows a few times then stops
 * (view-count in localStorage), or until the user dismisses/tries it. Opens the assistant by
 * dispatching the global 'procleo:open-agent' event that Layout listens for.
 */
const AgentWelcomeBanner = () => {
  const [visible, setVisible] = useState(() => {
    if (localStorage.getItem(KEY_DISMISSED) === '1') return false;
    const views = parseInt(localStorage.getItem(KEY_VIEWS) || '0', 10);
    return views < MAX_VIEWS;
  });

  useEffect(() => {
    if (!visible) return;
    const views = parseInt(localStorage.getItem(KEY_VIEWS) || '0', 10);
    localStorage.setItem(KEY_VIEWS, String(views + 1));
    // Count this view once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY_DISMISSED, '1');
    setVisible(false);
  };

  const tryIt = () => {
    window.dispatchEvent(new Event('procleo:open-agent'));
    dismiss();
  };

  if (!visible) return null;

  return (
    <div className='relative mb-6 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-r from-violet-600 to-indigo-600 p-5 text-white shadow-sm dark:border-violet-800'>
      <button
        type='button'
        onClick={dismiss}
        aria-label='Dismiss'
        className='absolute right-3 top-3 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white'
      >
        <X className='h-4 w-4' />
      </button>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-start gap-3'>
          <span className='flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-white/15'>
            <Bot className='h-6 w-6' />
          </span>
          <div>
            <h3 className='flex items-center gap-1.5 text-base font-semibold'>
              Meet your ProcLeo assistant
              <Sparkles className='h-4 w-4 text-violet-200' />
            </h3>
            <p className='mt-0.5 max-w-xl text-sm text-violet-100'>
              It can handle your approvals, chase suppliers, raise requisitions,
              and answer questions about your procurement data — just ask, in
              plain English.
            </p>
          </div>
        </div>
        <div className='flex flex-shrink-0 gap-2 pl-14 sm:pl-0'>
          <Button
            variant='secondary'
            className='bg-white text-violet-700 hover:bg-violet-50'
            onClick={tryIt}
          >
            Try it
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AgentWelcomeBanner;
