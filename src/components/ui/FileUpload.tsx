import React, { useState, useRef } from 'react';
import { Upload, X, Download, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface FileUploadProps {
  label: string;
  value?: string; // Comma-separated file paths
  onChange: (filePaths: string) => void;
  accept?: string;
  disabled?: boolean;
  multiple?: boolean;
}

interface UploadedFile {
  name: string;
  path: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  value = '',
  onChange,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif',
  disabled = false,
  multiple = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Parse existing files from comma-separated paths
  const existingFiles: UploadedFile[] = value
    ? value.split(',').filter(Boolean).map(path => ({
        name: path.split('/').pop() || path,
        path: path.trim(),
      }))
    : [];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadError(null);

    try {
      const uploadedPaths: string[] = [...existingFiles.map(f => f.path)];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post<{ data: number; upload_inv: string; message?: string }>(
          '/files/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        if (response.data.data === 1 && response.data.upload_inv !== '-') {
          uploadedPaths.push(response.data.upload_inv);
        } else {
          throw new Error(response.data.message || 'Upload failed');
        }
      }

      // Update with comma-separated paths
      onChange(uploadedPaths.join(','));

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = async (fileToRemove: UploadedFile) => {
    try {
      // Delete from server
      await apiClient.delete(`/files/delete/${encodeURIComponent(fileToRemove.path)}`);

      // Remove from local state
      const updatedFiles = existingFiles.filter(f => f.path !== fileToRemove.path);
      onChange(updatedFiles.map(f => f.path).join(','));
    } catch (error) {
      console.error('Delete error:', error);
      setUploadError('Failed to delete file');
    }
  };

  const handleDownloadFile = (file: UploadedFile) => {
    const downloadUrl = `${apiClient.defaults.baseURL}/files/download/${encodeURIComponent(file.path)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      {/* Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          id={`file-upload-${label.replace(/\s+/g, '-')}`}
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
        />
        <label
          htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
            ${
              disabled || uploading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
            }`}
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Choose File'}
        </label>
        {multiple && (
          <span className="text-xs text-gray-500">You can select multiple files</span>
        )}
      </div>

      {/* Error Message */}
      {uploadError && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {uploadError}
        </div>
      )}

      {/* Uploaded Files List */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          {existingFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={18} className="text-blue-600 flex-shrink-0" />
                <span className="text-sm text-gray-700 truncate">{file.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadFile(file)}
                  className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                  title="Download file"
                >
                  <Download size={18} />
                </button>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file)}
                    className="p-1 text-red-600 hover:bg-red-100 rounded"
                    title="Remove file"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accept types hint */}
      <p className="text-xs text-gray-500">
        Accepted formats: {accept.split(',').join(', ')}
      </p>
    </div>
  );
};
