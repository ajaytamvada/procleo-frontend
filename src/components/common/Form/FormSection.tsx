import React from 'react';

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <div className='h-8 w-1 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full' />
        <div>
          <h3 className='text-xl font-bold text-gray-900'>{title}</h3>
          {subtitle && (
            <p className='text-sm text-gray-500 mt-0.5'>{subtitle}</p>
          )}
        </div>
      </div>
      <div className='bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 shadow-sm'>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
