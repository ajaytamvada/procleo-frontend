import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Bot, X } from 'lucide-react';
import AgentChat from './AgentChat';

interface AgentLauncherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Global floating AI assistant: a persistent button on every authenticated page that opens a
 * right-side slide-over hosting the agent conversation. Built on the Radix Dialog primitives
 * already in the app (no new dependency) with a custom right-anchored panel.
 */
const AgentLauncher = ({ open, onOpenChange }: AgentLauncherProps) => {
  return (
    <>
      {!open && (
        <button
          type='button'
          onClick={() => onOpenChange(true)}
          aria-label='Open the ProcLeo assistant'
          className='fixed bottom-6 right-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2'
        >
          <Bot className='h-6 w-6' />
        </button>
      )}

      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className='fixed inset-0 z-[90] bg-black/30 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in' />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className='fixed inset-y-0 right-0 z-[100] flex w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl focus:outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right dark:border-gray-800 dark:bg-gray-900'
          >
            <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-800'>
              <div className='flex items-center gap-2'>
                <span className='flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'>
                  <Bot className='h-5 w-5' />
                </span>
                <div>
                  <DialogPrimitive.Title className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
                    ProcLeo Assistant
                  </DialogPrimitive.Title>
                  <p className='text-xs text-muted-foreground'>
                    Ask, or tell me to do something
                  </p>
                </div>
              </div>
              <DialogPrimitive.Close
                aria-label='Close'
                className='rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              >
                <X className='h-5 w-5' />
              </DialogPrimitive.Close>
            </div>

            <div className='flex-1 overflow-hidden'>
              <AgentChat onNavigate={() => onOpenChange(false)} />
            </div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
};

export default AgentLauncher;
