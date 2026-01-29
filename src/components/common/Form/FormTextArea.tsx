import React, { forwardRef } from 'react';
import { Textarea } from '@/components/ui/Textarea';

interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ label, error, required, className = '', ...props }, ref) => {
    return (
      <div className='group'>
        <label className='block text-sm font-semibold text-gray-700 mb-2 transition-colors group-focus-within:text-indigo-600'>
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
        <Textarea
          ref={ref}
          className={`w-full px-4 py-3 text-sm bg-white border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 shadow-sm resize-none ${className}`}
          error={error}
          {...props}
        />
      </div>
    );
  }
);

FormTextarea.displayName = 'FormTextarea';

export default FormTextarea;
