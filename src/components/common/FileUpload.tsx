import React, { useState, useRef } from 'react';
import { Upload, X, FileText, File, Image as ImageIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { FilePreviewModal } from './FilePreviewModal';

interface FileUploadProps {
  value: string; // Comma separated filenames
  onChange: (value: string) => void;
  maxFiles?: number;
  allowedTypes?: string[]; // e.g., ['image/', 'application/pdf']
}

export const FileUpload: React.FC<FileUploadProps> = ({
  value,
  onChange,
  maxFiles = 5,
  allowedTypes = [
    'image/*',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const files = value ? value.split(',').filter(f => f.trim()) : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const selectedFile = e.target.files[0];

    // Validate type
    // Note: Simple validation, can be improved
    // const fileType = selectedFile.type;
    // const isAllowed = allowedTypes.some(type => {
    //   if (type.endsWith('/*')) return fileType.startsWith(type.slice(0, -2));
    //   return type === fileType;
    // });

    // if (!isAllowed) {
    //   toast.error('File type not supported');
    //   return;
    // }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await apiClient.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.data === 1 && response.data.upload_inv) {
        const newFilename = response.data.upload_inv;
        const newFiles = [...files, newFilename];
        onChange(newFiles.join(','));
        toast.success('File uploaded successfully');
      } else {
        toast.error(
          'Upload failed: ' + (response.data.message || 'Unknown error')
        );
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeFile = (filenameToRemove: string) => {
    const newFiles = files.filter(f => f !== filenameToRemove);
    onChange(newFiles.join(','));
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || ''))
      return <ImageIcon size={20} className='text-blue-500' />;
    if (ext === 'pdf') return <FileText size={20} className='text-red-500' />;
    if (['doc', 'docx'].includes(ext || ''))
      return <FileText size={20} className='text-blue-700' />;
    if (['xls', 'xlsx'].includes(ext || ''))
      return <FileText size={20} className='text-green-600' />;
    return <File size={20} className='text-gray-500' />;
  };

  return (
    <div className='w-full'>
      <div className='space-y-3'>
        {/* Upload Button */}
        {files.length < maxFiles && (
          <div>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileSelect}
              className='hidden'
              // accept={allowedTypes.join(',')}
            />
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className='flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-all text-gray-600 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isUploading ? (
                <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600' />
              ) : (
                <Upload size={18} />
              )}
              <span className='text-sm font-medium'>
                {isUploading
                  ? 'Uploading...'
                  : files.length > 0
                    ? 'Upload Additional Files'
                    : 'Click to Upload Files'}
              </span>
            </button>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className='flex gap-2 overflow-x-auto pb-1'>
            {files.map((filename, idx) => (
              <div
                key={idx}
                className='flex items-center gap-2 p-2.5 bg-white border border-gray-200 rounded-lg group hover:border-gray-300 hover:shadow-sm transition-all flex-shrink-0 min-w-[200px] max-w-[300px]'
              >
                <div className='flex items-center gap-2 overflow-hidden flex-1 min-w-0'>
                  <div className='flex-shrink-0'>{getFileIcon(filename)}</div>
                  <div className='flex flex-col min-w-0 flex-1'>
                    <span
                      className='text-xs font-medium text-gray-700 truncate'
                      title={filename}
                    >
                      {filename}
                    </span>
                    <button
                      type='button'
                      className='text-xs text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer bg-transparent border-none p-0 text-left w-fit'
                      onClick={e => {
                        e.stopPropagation();
                        setPreviewFile(filename);
                      }}
                    >
                      View
                    </button>
                  </div>
                </div>
                <button
                  type='button'
                  onClick={() => removeFile(filename)}
                  className='p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0'
                  title='Remove file'
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        <FilePreviewModal
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          filename={previewFile || ''}
        />
      </div>
    </div>
  );
};
