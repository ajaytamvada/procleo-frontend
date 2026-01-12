import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'; // Assuming a Dialog component exists, or I will use a simple fixed overlay if not found.
import {
  X,
  Download,
  FileText,
  Image as ImageIcon,
  Loader,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  filename: string;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  filename,
}) => {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && filename) {
      loadFile();
    }
    return () => {
      // Cleanup object URL
      if (fileUrl) {
        URL.revokeObjectURL(fileUrl);
        setFileUrl(null);
      }
    };
  }, [isOpen, filename]);

  const loadFile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/files/download/${filename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: response.headers['content-type'],
      });
      const url = URL.createObjectURL(blob);
      setFileUrl(url);
      setFileType(response.headers['content-type']);
    } catch (err) {
      console.error('Error loading file:', err);
      setError(
        'Failed to load file. It may not exist or the server is unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isImage = fileType.startsWith('image/');
  const isPdf = fileType === 'application/pdf';

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <h3 className='font-semibold text-lg text-gray-800 truncate pr-4'>
            {filename}
          </h3>
          <div className='flex items-center gap-2'>
            {/* Download Button */}
            {fileUrl && (
              <a
                href={fileUrl}
                download={filename}
                className='p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                title='Download'
              >
                <Download size={20} />
              </a>
            )}
            <button
              onClick={onClose}
              className='p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 overflow-auto bg-gray-50 p-4 flex items-center justify-center min-h-[300px]'>
          {loading ? (
            <div className='flex flex-col items-center gap-3 text-gray-500'>
              <Loader className='animate-spin text-blue-600' size={32} />
              <span>Loading preview...</span>
            </div>
          ) : error ? (
            <div className='text-center text-red-500 bg-red-50 p-6 rounded-lg border border-red-100'>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {isImage && fileUrl && (
                <img
                  src={fileUrl}
                  alt='Preview'
                  className='max-w-full max-h-full object-contain shadow-sm rounded-lg'
                />
              )}

              {isPdf && fileUrl && (
                <iframe
                  src={fileUrl}
                  className='w-full h-full min-h-[60vh] rounded-lg shadow-sm border border-gray-200'
                  title='PDF Preview'
                />
              )}

              {!isImage && !isPdf && fileUrl && (
                <div className='text-center'>
                  <div className='w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <FileText size={40} className='text-gray-500' />
                  </div>
                  <p className='text-gray-800 font-medium mb-2'>
                    Preview not available
                  </p>
                  <p className='text-gray-500 text-sm mb-6'>
                    This file type cannot be previewed directly.
                  </p>
                  <a
                    href={fileUrl}
                    download={filename}
                    className='inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
                  >
                    <Download size={18} />
                    Download File
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
