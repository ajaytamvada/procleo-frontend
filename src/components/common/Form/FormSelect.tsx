import React, { forwardRef } from 'react';
import { Select } from '@/components/ui/Select';
import { ChevronDown } from 'lucide-react';

interface FormSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, required, className = '', children, ...props }, ref) => {
    return (
      <div className='group'>
        <label className='block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        <div className='relative'>
          <Select
            ref={ref}
            className={`w-full h-12 px-4 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 hover:border-gray-300 shadow-sm appearance-none cursor-pointer ${className}`}
            error={error}
            {...props}
          >
            {children}
          </Select>
          <ChevronDown className='absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none' />
        </div>
      </div>
    );
  }
);

FormSelect.displayName = 'FormSelect';

export default FormSelect;
