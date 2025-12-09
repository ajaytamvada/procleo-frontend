import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        success:
          'border-green-500/50 text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400 [&>svg]:text-green-600',
        warning:
          'border-yellow-500/50 text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 [&>svg]:text-yellow-600',
        info: 'border-blue-500/50 text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-400 [&>svg]:text-blue-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const iconMap = {
  default: AlertCircle,
  destructive: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  animate?: boolean;
  dismissible?: boolean;
  onDismiss?: () => void;
  icon?: React.ReactNode;
  title?: string;
  action?: React.ReactNode;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant = 'default',
      animate = false,
      dismissible = false,
      onDismiss,
      icon,
      title,
      action,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const IconComponent = icon || (variant ? iconMap[variant] : null);
    const IconToRender = React.isValidElement(IconComponent)
      ? IconComponent
      : IconComponent && typeof IconComponent === 'function'
        ? React.createElement(
            IconComponent as React.ComponentType<{ className?: string }>,
            { className: 'h-4 w-4' }
          )
        : null;

    const handleDismiss = () => {
      setIsVisible(false);
      onDismiss?.();
    };

    if (!isVisible) return null;

    if (animate) {
      return (
        <motion.div
          className={cn(alertVariants({ variant }), className)}
          ref={ref}
          role='alert'
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          {...(props as any)}
        >
          {IconToRender}

          <div className='flex-1'>
            {title && (
              <h5 className='mb-1 font-medium leading-none tracking-tight'>
                {title}
              </h5>
            )}
            <div className='text-sm [&_p]:leading-relaxed'>{children}</div>
          </div>

          <div className='flex items-start gap-2 ml-auto'>
            {action && <div className='flex-shrink-0'>{action}</div>}

            {dismissible && (
              <button
                type='button'
                onClick={handleDismiss}
                className='flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
                aria-label='Dismiss alert'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>
        </motion.div>
      );
    }

    return (
      <div
        className={cn(alertVariants({ variant }), className)}
        ref={ref}
        role='alert'
        {...props}
      >
        {IconToRender}

        <div className='flex-1'>
          {title && (
            <h5 className='mb-1 font-medium leading-none tracking-tight'>
              {title}
            </h5>
          )}
          <div className='text-sm [&_p]:leading-relaxed'>{children}</div>
        </div>

        <div className='flex items-start gap-2 ml-auto'>
          {action && <div className='flex-shrink-0'>{action}</div>}

          {dismissible && (
            <button
              type='button'
              onClick={handleDismiss}
              className='flex-shrink-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              aria-label='Dismiss alert'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>
    );
  }
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('mb-1 font-medium leading-none tracking-tight', className)}
    {...props}
  />
));
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm [&_p]:leading-relaxed', className)}
    {...props}
  />
));
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription, alertVariants };
