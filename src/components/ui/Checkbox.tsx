import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check, Minus } from 'lucide-react';

export interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  description?: string;
  error?: string;
  animate?: boolean;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ 
  className, 
  label, 
  description, 
  error, 
  animate = false,
  indeterminate = false,
  id,
  ...props 
}, ref) => {
  const [checkboxId] = React.useState(() => id || `checkbox-${Math.random().toString(36).substr(2, 9)}`);
  const hasError = !!error;

  const checkbox = (
    <CheckboxPrimitive.Root
      ref={ref}
      id={checkboxId}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
        hasError && 'border-destructive focus-visible:ring-destructive',
        className
      )}
      aria-invalid={hasError}
      aria-describedby={
        error ? `${checkboxId}-error` : description ? `${checkboxId}-description` : undefined
      }
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {animate ? (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {indeterminate ? (
              <Minus className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </motion.div>
        ) : (
          indeterminate ? (
            <Minus className="h-3 w-3" />
          ) : (
            <Check className="h-3 w-3" />
          )
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );

  if (label || description || error) {
    return (
      <div className="space-y-2">
        <div className="flex items-start space-x-2">
          {checkbox}
          <div className="grid gap-1.5 leading-none">
            {label && (
              <label
                htmlFor={checkboxId}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-muted-foreground" id={`${checkboxId}-description`}>
                {description}
              </p>
            )}
          </div>
        </div>
        {error && (
          <motion.p
            initial={animate ? { opacity: 0, y: -10 } : {}}
            animate={animate ? { opacity: 1, y: 0 } : {}}
            exit={animate ? { opacity: 0, y: -10 } : {}}
            className="text-sm text-destructive"
            id={`${checkboxId}-error`}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }

  return checkbox;
});
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

// Checkbox Group component for managing multiple checkboxes
export interface CheckboxGroupProps {
  value?: string[];
  onValueChange?: (value: string[]) => void;
  className?: string;
  children: React.ReactNode;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const CheckboxGroup = React.forwardRef<HTMLDivElement, CheckboxGroupProps>(
  ({
    value = [],
    onValueChange,
    className,
    children,
    label,
    description,
    error,
    required = false,
    disabled = false,
    ...props
  }, ref) => {
    const [groupId] = React.useState(() => `checkbox-group-${Math.random().toString(36).substr(2, 9)}`);

    const handleValueChange = (itemValue: string, checked: boolean) => {
      if (!onValueChange) return;
      
      if (checked) {
        onValueChange([...value, itemValue]);
      } else {
        onValueChange(value.filter(v => v !== itemValue));
      }
    };

    return (
      <div
        ref={ref}
        className={cn('space-y-3', className)}
        role="group"
        aria-labelledby={label ? `${groupId}-label` : undefined}
        aria-describedby={
          error ? `${groupId}-error` : description ? `${groupId}-description` : undefined
        }
        {...props}
      >
        {label && (
          <label
            id={`${groupId}-label`}
            className="text-sm font-medium leading-none"
          >
            {label}
            {required && <span className="text-destructive ml-1" aria-label="required">*</span>}
          </label>
        )}
        
        {description && (
          <p className="text-sm text-muted-foreground" id={`${groupId}-description`}>
            {description}
          </p>
        )}

        <div className="space-y-2">
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === Checkbox) {
              const childProps = child.props as CheckboxProps;
              const childValue = childProps.value as string;
              return React.cloneElement(child as React.ReactElement<CheckboxProps>, {
                checked: value.includes(childValue),
                onCheckedChange: (checked: boolean) => handleValueChange(childValue, checked),
                disabled: disabled || childProps.disabled,
              });
            }
            return child;
          })}
        </div>

        {error && (
          <p className="text-sm text-destructive" id={`${groupId}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);
CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxGroup };