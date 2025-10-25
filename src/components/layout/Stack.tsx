import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const stackVariants = cva(
  'flex',
  {
    variants: {
      direction: {
        row: 'flex-row',
        column: 'flex-col',
        'row-reverse': 'flex-row-reverse',
        'column-reverse': 'flex-col-reverse',
      },
      align: {
        start: 'items-start',
        center: 'items-center',
        end: 'items-end',
        stretch: 'items-stretch',
        baseline: 'items-baseline',
      },
      justify: {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
        around: 'justify-around',
        evenly: 'justify-evenly',
      },
      gap: {
        0: 'gap-0',
        1: 'gap-1',
        2: 'gap-2',
        3: 'gap-3',
        4: 'gap-4',
        6: 'gap-6',
        8: 'gap-8',
        12: 'gap-12',
      },
      wrap: {
        true: 'flex-wrap',
        false: 'flex-nowrap',
        reverse: 'flex-wrap-reverse',
      },
    },
    defaultVariants: {
      direction: 'row',
      align: 'start',
      justify: 'start',
      gap: 0,
      wrap: false,
    },
  }
);

export interface StackProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stackVariants> {
  as?: React.ElementType;
  responsive?: {
    sm?: Partial<VariantProps<typeof stackVariants>>;
    md?: Partial<VariantProps<typeof stackVariants>>;
    lg?: Partial<VariantProps<typeof stackVariants>>;
    xl?: Partial<VariantProps<typeof stackVariants>>;
  };
}

const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ 
    className, 
    direction, 
    align, 
    justify, 
    gap, 
    wrap,
    responsive,
    as: Component = 'div', 
    ...props 
  }, ref) => {
    const responsiveClasses = responsive ? cn(
      responsive.sm?.direction && `sm:flex-${responsive.sm.direction}`,
      responsive.sm?.align && `sm:items-${responsive.sm.align}`,
      responsive.sm?.justify && `sm:justify-${responsive.sm.justify}`,
      responsive.sm?.gap && `sm:gap-${responsive.sm.gap}`,
      responsive.md?.direction && `md:flex-${responsive.md.direction}`,
      responsive.md?.align && `md:items-${responsive.md.align}`,
      responsive.md?.justify && `md:justify-${responsive.md.justify}`,
      responsive.md?.gap && `md:gap-${responsive.md.gap}`,
      responsive.lg?.direction && `lg:flex-${responsive.lg.direction}`,
      responsive.lg?.align && `lg:items-${responsive.lg.align}`,
      responsive.lg?.justify && `lg:justify-${responsive.lg.justify}`,
      responsive.lg?.gap && `lg:gap-${responsive.lg.gap}`,
      responsive.xl?.direction && `xl:flex-${responsive.xl.direction}`,
      responsive.xl?.align && `xl:items-${responsive.xl.align}`,
      responsive.xl?.justify && `xl:justify-${responsive.xl.justify}`,
      responsive.xl?.gap && `xl:gap-${responsive.xl.gap}`
    ) : '';

    return (
      <Component
        className={cn(
          stackVariants({ direction, align, justify, gap, wrap }),
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Stack.displayName = 'Stack';

// Convenience components
const HStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack {...props} direction="row" ref={ref} />
);
HStack.displayName = 'HStack';

const VStack = React.forwardRef<HTMLDivElement, Omit<StackProps, 'direction'>>(
  (props, ref) => <Stack {...props} direction="column" ref={ref} />
);
VStack.displayName = 'VStack';

export { Stack, HStack, VStack, stackVariants };