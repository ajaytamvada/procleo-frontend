import React, { forwardRef } from 'react';
import { Input } from '@/components/ui/Input';

interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'default' | 'sm' | 'lg';
  label: string;
  error?: string;
  required?: boolean;
  icon?: React.ReactNode;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, required, icon, className = '', ...props }, ref) => {
    return (
      <div className='group'>
        <label className='block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        <div className='relative'>
          {icon && (
            <div
              className='absolute left-3.5 top-6 -translate-y-1/2 
                    text-gray-400 group-focus-within:text-indigo-600 
                    transition-colors z-10 pointer-events-none'
            >
              {icon}
            </div>
          )}
          <Input
            ref={ref}
            className={`w-full h-12 ${icon ? 'pl-11 pr-4' : 'px-4'} text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 shadow-sm ${className}`}
            error={error}
            {...props}
          />
        </div>
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

export default FormInput;
