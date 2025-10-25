import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

const avatarVariants = cva(
  'relative flex shrink-0 overflow-hidden rounded-full',
  {
    variants: {
      size: {
        sm: 'h-8 w-8',
        default: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
        '2xl': 'h-20 w-20',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  animate?: boolean;
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ 
    className, 
    size, 
    src, 
    alt, 
    fallback,
    animate = false,
    status,
    showStatus = false,
    ...props 
  }, ref) => {
    const [imageError, setImageError] = React.useState(false);
    const [imageLoaded, setImageLoaded] = React.useState(false);

    const Component = animate ? motion.div : 'div';
    
    const motionProps = animate ? {
      initial: { scale: 0, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 0, opacity: 0 },
      transition: { type: 'spring' as const, stiffness: 500, damping: 30 },
    } : {};

    // Filter out motion-conflicting props when using motion.div
    const { onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, onAnimationIteration, ...safeProps } = props;

    // Generate initials from fallback text
    const getInitials = (text: string) => {
      return text
        .split(' ')
        .slice(0, 2)
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase();
    };

    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
    };

    const statusSize = {
      sm: 'h-2 w-2',
      default: 'h-2.5 w-2.5',
      lg: 'h-3 w-3',
      xl: 'h-4 w-4',
      '2xl': 'h-5 w-5',
    };

    return (
      <Component
        className={cn(avatarVariants({ size }), className)}
        ref={ref}
        {...motionProps}
        {...safeProps}
      >
        {src && !imageError ? (
          <img
            className={cn(
              'aspect-square h-full w-full object-cover transition-opacity',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            src={src}
            alt={alt || 'Avatar'}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            {fallback ? (
              <span className="text-sm font-medium text-muted-foreground">
                {getInitials(fallback)}
              </span>
            ) : (
              <User className="h-1/2 w-1/2 text-muted-foreground" />
            )}
          </div>
        )}
        
        {showStatus && status && (
          <div
            className={cn(
              'absolute bottom-0 right-0 rounded-full border-2 border-background',
              statusColors[status],
              statusSize[size || 'default']
            )}
            aria-label={`Status: ${status}`}
          />
        )}
      </Component>
    );
  }
);
Avatar.displayName = 'Avatar';

const AvatarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    max?: number;
    size?: VariantProps<typeof avatarVariants>['size'];
    animate?: boolean;
  }
>(({ className, children, max = 5, size = 'default', animate = false, ...props }, ref) => {
  const childrenArray = React.Children.toArray(children);
  const visibleChildren = childrenArray.slice(0, max);
  const remainingCount = Math.max(0, childrenArray.length - max);

  const Component = animate ? motion.div : 'div';
  
  // Filter out motion-conflicting props when using motion.div
  const { onDrag, onDragEnd, onDragStart, onAnimationStart, onAnimationEnd, onAnimationIteration, ...safeProps } = props;

  return (
    <Component
      className={cn('flex -space-x-2', className)}
      ref={ref}
      {...safeProps}
    >
      {visibleChildren.map((child, index) => (
        <div
          key={index}
          className="relative ring-2 ring-background"
          style={{ zIndex: max - index }}
        >
          {React.isValidElement(child) 
            ? React.cloneElement(child, { size } as any)
            : child
          }
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            avatarVariants({ size }),
            'flex items-center justify-center bg-muted ring-2 ring-background'
          )}
        >
          <span className="text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </span>
        </div>
      )}
    </Component>
  );
});
AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup, avatarVariants };