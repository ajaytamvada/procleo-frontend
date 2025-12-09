import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

const inputVariants = cva(
  'flex w-full rounded-lg border bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 text-sm shadow-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-white/95',
  {
    variants: {
      size: {
        sm: 'h-9 px-3 text-xs',
        default: 'h-11 px-4',
        lg: 'h-12 px-5',
      },
      variant: {
        default: 'border-gray-200 hover:border-gray-300',
        error:
          'border-red-300 focus-visible:ring-red-500/20 focus-visible:border-red-500',
        success:
          'border-green-300 focus-visible:ring-green-500/20 focus-visible:border-green-500',
      },
    },
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  helperText?: string;
  label?: string;
  required?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      size,
      variant,
      leftIcon,
      rightIcon,
      error,
      helperText,
      label,
      required,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [inputId] = React.useState(
      () => id || `input-${Math.random().toString(36).substr(2, 9)}`
    );
    const isPassword = type === 'password';
    const inputType = isPassword && showPassword ? 'text' : type;
    const hasError = !!error;
    const currentVariant = hasError ? 'error' : variant;

    const inputElement = (
      <div className='relative'>
        {leftIcon && (
          <div className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400'>
            {leftIcon}
          </div>
        )}
        <input
          type={inputType}
          className={cn(
            inputVariants({ size, variant: currentVariant }),
            leftIcon && 'pl-10',
            (rightIcon || isPassword) && 'pr-10',
            className
          )}
          ref={ref}
          id={inputId}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />
        {(rightIcon || isPassword) && (
          <div className='absolute right-3 top-1/2 -translate-y-1/2'>
            {isPassword ? (
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-sm transition-colors duration-200'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </button>
            ) : (
              <div className='text-gray-400'>{rightIcon}</div>
            )}
          </div>
        )}
      </div>
    );

    if (label || error || helperText) {
      return (
        <div className='space-y-1'>
          {label && (
            <label
              htmlFor={inputId}
              className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            >
              {label}
              {required && (
                <span className='text-destructive ml-1' aria-label='required'>
                  *
                </span>
              )}
            </label>
          )}
          {inputElement}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className='text-sm text-destructive'
              id={`${inputId}-error`}
              role='alert'
            >
              {error}
            </motion.p>
          )}
          {helperText && !error && (
            <p
              className='text-sm text-muted-foreground'
              id={`${inputId}-helper`}
            >
              {helperText}
            </p>
          )}
        </div>
      );
    }

    return inputElement;
  }
);
Input.displayName = 'Input';

export { Input, inputVariants };
