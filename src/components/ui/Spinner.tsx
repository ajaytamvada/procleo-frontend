import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const spinnerVariants = cva(
  'animate-spin rounded-full border-2 border-current border-t-transparent',
  {
    variants: {
      size: {
        sm: 'h-4 w-4',
        default: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
      },
      variant: {
        default: 'text-primary',
        secondary: 'text-secondary-foreground',
        muted: 'text-muted-foreground',
        white: 'text-white',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface SpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  animate?: boolean;
  label?: string;
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      className,
      size,
      variant,
      animate = false,
      label = 'Loading...',
      ...props
    },
    ref
  ) => {
    const commonClassName = cn(spinnerVariants({ size, variant }), className);

    if (animate) {
      return (
        <motion.div
          className={commonClassName}
          ref={ref}
          role='status'
          aria-label={label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        >
          <span className='sr-only'>{label}</span>
        </motion.div>
      );
    }

    return (
      <div
        className={commonClassName}
        ref={ref}
        role='status'
        aria-label={label}
        {...props}
      >
        <span className='sr-only'>{label}</span>
      </div>
    );
  }
);
Spinner.displayName = 'Spinner';

// Skeleton loader component
const skeletonVariants = cva('animate-pulse rounded-md bg-muted', {
  variants: {
    variant: {
      default: 'bg-muted',
      text: 'bg-muted h-4 w-full',
      avatar: 'bg-muted rounded-full',
      button: 'bg-muted h-10 w-24',
      card: 'bg-muted h-32 w-full',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  animate?: boolean;
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, animate = false, ...props }, ref) => {
    const commonClassName = cn(skeletonVariants({ variant }), className);

    if (animate) {
      return (
        <motion.div
          className={commonClassName}
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        />
      );
    }

    return <div className={commonClassName} ref={ref} {...props} />;
  }
);
Skeleton.displayName = 'Skeleton';

// Progress bar component
const progressVariants = cva(
  'relative h-2 w-full overflow-hidden rounded-full bg-secondary',
  {
    variants: {
      size: {
        sm: 'h-1',
        default: 'h-2',
        lg: 'h-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
  value?: number;
  max?: number;
  animate?: boolean;
  showLabel?: boolean;
  label?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      size,
      value = 0,
      max = 100,
      animate = true,
      showLabel = false,
      label,
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    return (
      <div className='w-full space-y-2'>
        {(showLabel || label) && (
          <div className='flex justify-between text-sm'>
            <span>{label || 'Progress'}</span>
            <span>{Math.round(percentage)}%</span>
          </div>
        )}
        <div
          className={cn(progressVariants({ size }), className)}
          ref={ref}
          role='progressbar'
          aria-valuenow={value}
          aria-valuemax={max}
          {...props}
        >
          <motion.div
            className='h-full w-full flex-1 bg-primary transition-all'
            initial={animate ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export {
  Spinner,
  Skeleton,
  Progress,
  spinnerVariants,
  skeletonVariants,
  progressVariants,
};
