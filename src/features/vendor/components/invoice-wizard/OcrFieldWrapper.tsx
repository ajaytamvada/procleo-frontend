import React from 'react';
import { Sparkles } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface OcrFieldWrapperProps {
  label: string;
  fieldName: string;
  ocrFilledFields: Set<string>;
  required?: boolean;
  children: React.ReactNode;
}

const OcrFieldWrapper: React.FC<OcrFieldWrapperProps> = ({
  label,
  fieldName,
  ocrFilledFields,
  required,
  children,
}) => {
  const isFilled = ocrFilledFields.has(fieldName);

  return (
    <div>
      <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5'>
        {label}
        {required && <span className='text-red-500'>*</span>}
        {isFilled && (
          <Tooltip.Provider delayDuration={200}>
            <Tooltip.Root>
              <Tooltip.Trigger asChild>
                <span className='inline-flex items-center gap-1 text-xs bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded-full border border-violet-200 cursor-default'>
                  <Sparkles className='w-3 h-3' />
                  AI
                </span>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className='bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg'
                  sideOffset={5}
                >
                  Auto-filled by OCR
                  <Tooltip.Arrow className='fill-gray-900' />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        )}
      </label>
      <div className={isFilled ? 'ring-2 ring-violet-200 rounded-lg' : ''}>
        {children}
      </div>
    </div>
  );
};

export default OcrFieldWrapper;
