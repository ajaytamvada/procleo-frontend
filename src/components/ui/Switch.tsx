import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label?: string;
  description?: string;
  error?: string;
  animate?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(
  (
    {
      className,
      label,
      description,
      error,
      animate = false,
      size = 'default',
      id,
      ...props
    },
    ref
  ) => {
    const [switchId] = React.useState(
      () => id || `switch-${Math.random().toString(36).substr(2, 9)}`
    );
    const hasError = !!error;

    const sizeClasses = {
      sm: {
        root: 'h-4 w-7',
        thumb:
          'h-3 w-3 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
      },
      default: {
        root: 'h-5 w-9',
        thumb:
          'h-4 w-4 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0',
      },
      lg: {
        root: 'h-6 w-11',
        thumb:
          'h-5 w-5 data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0',
      },
    };

    const switchElement = (
      <SwitchPrimitive.Root
        ref={ref}
        id={switchId}
        className={cn(
          'peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
          sizeClasses[size].root,
          hasError &&
            'data-[state=unchecked]:bg-destructive/20 focus-visible:ring-destructive',
          className
        )}
        aria-invalid={hasError}
        aria-describedby={
          error
            ? `${switchId}-error`
            : description
              ? `${switchId}-description`
              : undefined
        }
        {...props}
      >
        <SwitchPrimitive.Thumb
          className={cn(
            'pointer-events-none block rounded-full bg-background shadow-lg ring-0 transition-transform',
            sizeClasses[size].thumb
          )}
        >
          {animate && (
            <motion.div
              className='h-full w-full'
              initial={false}
              animate={{ scale: props.checked ? 1 : 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </SwitchPrimitive.Thumb>
      </SwitchPrimitive.Root>
    );

    if (label || description || error) {
      return (
        <div className='space-y-2'>
          <div className='flex items-start justify-between space-x-3'>
            <div className='grid gap-1.5 leading-none'>
              {label && (
                <label
                  htmlFor={switchId}
                  className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                >
                  {label}
                </label>
              )}
              {description && (
                <p
                  className='text-sm text-muted-foreground'
                  id={`${switchId}-description`}
                >
                  {description}
                </p>
              )}
            </div>
            {switchElement}
          </div>
          {error && (
            <motion.p
              initial={animate ? { opacity: 0, y: -10 } : {}}
              animate={animate ? { opacity: 1, y: 0 } : {}}
              exit={animate ? { opacity: 0, y: -10 } : {}}
              className='text-sm text-destructive'
              id={`${switchId}-error`}
              role='alert'
            >
              {error}
            </motion.p>
          )}
        </div>
      );
    }

    return switchElement;
  }
);
Switch.displayName = SwitchPrimitive.Root.displayName;

export { Switch };
