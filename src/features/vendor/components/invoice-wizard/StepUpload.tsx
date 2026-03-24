import React from 'react';
import { Upload, ArrowRight, Loader2 } from 'lucide-react';

interface StepUploadProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkip: () => void;
  isUploading: boolean;
}

const StepUpload: React.FC<StepUploadProps> = ({
  fileInputRef,
  onFileUpload,
  onSkip,
  isUploading,
}) => {
  return (
    <div className='max-w-2xl mx-auto'>
      <div className='bg-white border-2 border-dashed border-gray-300 rounded-xl p-16 text-center hover:border-violet-400 transition-colors'>
        <div className='flex flex-col items-center'>
          <div className='w-20 h-20 bg-violet-50 rounded-full flex items-center justify-center mb-6'>
            {isUploading ? (
              <Loader2 className='w-10 h-10 text-violet-600 animate-spin' />
            ) : (
              <Upload className='w-10 h-10 text-violet-600' />
            )}
          </div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>
            {isUploading ? 'Analyzing your invoice...' : 'Upload Your Invoice'}
          </h3>
          <p className='text-gray-500 mb-8 max-w-md'>
            {isUploading
              ? 'Extracting data using AI. This may take a moment.'
              : "Upload a PDF or image of your invoice and we'll extract the details automatically."}
          </p>
          <input
            type='file'
            ref={fileInputRef}
            onChange={onFileUpload}
            accept='.pdf,.jpg,.jpeg,.png'
            className='hidden'
          />
          {!isUploading && (
            <div className='flex flex-col items-center gap-4'>
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='px-8 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium text-base'
              >
                Select File
              </button>
              <button
                type='button'
                onClick={onSkip}
                className='text-gray-500 hover:text-violet-600 text-sm font-medium flex items-center gap-1.5 transition-colors'
              >
                Skip — Enter Manually
                <ArrowRight className='w-4 h-4' />
              </button>
            </div>
          )}
        </div>
      </div>
      <p className='text-center text-xs text-gray-400 mt-4'>
        Supported formats: PDF, JPG, JPEG, PNG (max 10MB)
      </p>
    </div>
  );
};

export default StepUpload;
