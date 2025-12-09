import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const gridVariants = cva('grid', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
      12: 'grid-cols-12',
    },
    gap: {
      0: 'gap-0',
      1: 'gap-1',
      2: 'gap-2',
      3: 'gap-3',
      4: 'gap-4',
      6: 'gap-6',
      8: 'gap-8',
    },
    responsive: {
      true: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      false: '',
    },
  },
  defaultVariants: {
    cols: 1,
    gap: 4,
    responsive: false,
  },
});

export interface GridProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridVariants> {
  as?: React.ElementType;
  smCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  mdCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  lgCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  xlCols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
}

const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      className,
      cols,
      gap,
      responsive,
      smCols,
      mdCols,
      lgCols,
      xlCols,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const responsiveClasses = cn(
      smCols && `sm:grid-cols-${smCols}`,
      mdCols && `md:grid-cols-${mdCols}`,
      lgCols && `lg:grid-cols-${lgCols}`,
      xlCols && `xl:grid-cols-${xlCols}`
    );

    return (
      <Component
        className={cn(
          gridVariants({
            cols: responsive ? undefined : cols,
            gap,
            responsive,
          }),
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Grid.displayName = 'Grid';

const gridItemVariants = cva('', {
  variants: {
    span: {
      1: 'col-span-1',
      2: 'col-span-2',
      3: 'col-span-3',
      4: 'col-span-4',
      5: 'col-span-5',
      6: 'col-span-6',
      full: 'col-span-full',
    },
    start: {
      1: 'col-start-1',
      2: 'col-start-2',
      3: 'col-start-3',
      4: 'col-start-4',
      5: 'col-start-5',
      6: 'col-start-6',
    },
    end: {
      1: 'col-end-1',
      2: 'col-end-2',
      3: 'col-end-3',
      4: 'col-end-4',
      5: 'col-end-5',
      6: 'col-end-6',
      7: 'col-end-7',
    },
  },
});

export interface GridItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof gridItemVariants> {
  as?: React.ElementType;
  smSpan?: VariantProps<typeof gridItemVariants>['span'];
  mdSpan?: VariantProps<typeof gridItemVariants>['span'];
  lgSpan?: VariantProps<typeof gridItemVariants>['span'];
  xlSpan?: VariantProps<typeof gridItemVariants>['span'];
}

const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  (
    {
      className,
      span,
      start,
      end,
      smSpan,
      mdSpan,
      lgSpan,
      xlSpan,
      as: Component = 'div',
      ...props
    },
    ref
  ) => {
    const responsiveClasses = cn(
      smSpan && `sm:col-span-${smSpan}`,
      mdSpan && `md:col-span-${mdSpan}`,
      lgSpan && `lg:col-span-${lgSpan}`,
      xlSpan && `xl:col-span-${xlSpan}`
    );

    return (
      <Component
        className={cn(
          gridItemVariants({ span, start, end }),
          responsiveClasses,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
GridItem.displayName = 'GridItem';

export { Grid, GridItem, gridVariants, gridItemVariants };
