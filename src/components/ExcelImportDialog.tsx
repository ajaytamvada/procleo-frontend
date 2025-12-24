import React, { useState } from 'react';
import {
  Upload,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

interface ImportError {
  rowNumber: number;
  field: string;
  errorMessage: string;
}

interface ImportResult<T> {
  totalRows: number;
  successCount: number;
  failureCount: number;
  successfulImports: T[];
  errors: ImportError[];
  status: 'SUCCESS' | 'PARTIAL_SUCCESS' | 'FAILED' | 'NO_DATA';
  message: string;
}

interface ExcelImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entityName: string; // e.g., "Category", "SubCategory"
  importEndpoint?: string; // e.g., "/master/categories/import"
  templateEndpoint?: string; // e.g., "/master/categories/template"
  onImportSuccess: (data?: any) => void; // Callback to refresh list
  onFileData?: (file: File) => Promise<any>; // Optional: Handle file client-side
  onTemplateDownload?: () => void; // Optional: Handle template download client-side
}

const ExcelImportDialog: React.FC<ExcelImportDialogProps> = ({
  isOpen,
  onClose,
  entityName,
  importEndpoint,
  templateEndpoint,
  onImportSuccess,
  onFileData,
  onTemplateDownload,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult<any> | null>(null);
  const [dragActive, setDragActive] = useState(false);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx')) {
        setFile(droppedFile);
        setResult(null);
      } else {
        toast.error('Please upload an Excel file (.xlsx)');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setResult(null);
      } else {
        toast.error('Please upload an Excel file (.xlsx)');
      }
    }
  };

  const downloadTemplate = async () => {
    try {
      if (onTemplateDownload) {
        onTemplateDownload();
        return;
      }

      if (!templateEndpoint) {
        console.error('No template endpoint provided');
        return;
      }

      const response = await apiClient.get(templateEndpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${entityName}_Import_Template.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      if (onFileData) {
        // Client-side handling
        const data = await onFileData(file);
        const count = Array.isArray(data) ? data.length : 0;

        setResult({
          status: 'SUCCESS',
          totalRows: count,
          successCount: count,
          failureCount: 0,
          successfulImports: data,
          errors: [],
          message: 'Import processed successfully',
        });
        toast.success(`Successfully imported ${count} records!`);
        onImportSuccess(data);

        // Auto-close after short delay
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else if (importEndpoint) {
        // Server-side hadling
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiClient.post(importEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setResult(response.data);

        if (response.data.status === 'SUCCESS') {
          toast.success(
            `Successfully imported all ${response.data.successCount} records!`
          );
          onImportSuccess();
        } else if (response.data.status === 'PARTIAL_SUCCESS') {
          toast.success(
            `Imported ${response.data.successCount} records. ${response.data.failureCount} failed.`
          );
          onImportSuccess();
        } else if (response.data.status === 'FAILED') {
          toast.error('Import failed. Please check the errors below.');
        } else {
          toast.error('No data found in the file');
        }
      }
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error(
        'Failed to upload file: ' +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div>
            <h2 className='text-xl font-bold text-gray-900'>
              Import {entityName}
            </h2>
            <p className='text-sm text-gray-600 mt-1'>
              Upload an Excel file to bulk import {entityName.toLowerCase()}{' '}
              data
            </p>
          </div>
          <button
            onClick={handleClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className='p-6 space-y-6'>
          {/* Download Template */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-start gap-3'>
              <FileSpreadsheet
                className='text-blue-600 flex-shrink-0 mt-0.5'
                size={20}
              />
              <div className='flex-1'>
                <h3 className='font-semibold text-blue-900 mb-1'>
                  Step 1: Download Template
                </h3>
                <p className='text-sm text-blue-700 mb-3'>
                  Download the Excel template and fill in your data. Required
                  fields are marked with *.
                </p>
                <button
                  onClick={downloadTemplate}
                  className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium'
                >
                  <Download size={16} />
                  Download Template
                </button>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <h3 className='font-semibold text-gray-900 mb-3'>
              Step 2: Upload Filled Template
            </h3>

            {/* Drag and Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className='mx-auto text-gray-400 mb-4' size={48} />
              <p className='text-gray-700 font-medium mb-2'>
                Drag and drop your Excel file here, or click to browse
              </p>
              <p className='text-sm text-gray-500 mb-4'>
                Supports .xlsx files only
              </p>
              <input
                type='file'
                accept='.xlsx'
                onChange={handleFileChange}
                className='hidden'
                id='file-upload'
              />
              <label
                htmlFor='file-upload'
                className='inline-block px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer text-sm font-medium'
              >
                Browse Files
              </label>
            </div>

            {/* Selected File */}
            {file && (
              <div className='mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg'>
                <FileSpreadsheet className='text-green-600' size={24} />
                <div className='flex-1'>
                  <p className='font-medium text-gray-900'>{file.name}</p>
                  <p className='text-sm text-gray-500'>
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>

          {/* Import Result */}
          {result && (
            <div className='space-y-4'>
              <div
                className={`p-4 rounded-lg border ${
                  result.status === 'SUCCESS'
                    ? 'bg-green-50 border-green-200'
                    : result.status === 'PARTIAL_SUCCESS'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div className='flex items-start gap-3'>
                  {result.status === 'SUCCESS' ? (
                    <CheckCircle2
                      className='text-green-600 flex-shrink-0 mt-0.5'
                      size={20}
                    />
                  ) : (
                    <AlertCircle
                      className='text-red-600 flex-shrink-0 mt-0.5'
                      size={20}
                    />
                  )}
                  <div className='flex-1'>
                    <h4 className='font-semibold text-gray-900 mb-2'>
                      Import Result
                    </h4>
                    <div className='text-sm space-y-1'>
                      <p>Total Rows: {result.totalRows}</p>
                      <p className='text-green-700'>
                        ✓ Success: {result.successCount}
                      </p>
                      {result.failureCount > 0 && (
                        <p className='text-red-700'>
                          ✗ Failed: {result.failureCount}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Errors */}
              {result.errors && result.errors.length > 0 && (
                <div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Errors ({result.errors.length})
                  </h4>
                  <div className='max-h-60 overflow-y-auto border rounded-lg'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50 sticky top-0'>
                        <tr>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                            Row
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                            Field
                          </th>
                          <th className='px-4 py-2 text-left text-xs font-medium text-gray-500'>
                            Error
                          </th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-200'>
                        {result.errors.map((error, idx) => (
                          <tr key={idx} className='hover:bg-gray-50'>
                            <td className='px-4 py-2 text-sm text-gray-900'>
                              {error.rowNumber}
                            </td>
                            <td className='px-4 py-2 text-sm text-gray-600'>
                              {error.field}
                            </td>
                            <td className='px-4 py-2 text-sm text-red-600'>
                              {error.errorMessage}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-3 p-6 border-t bg-gray-50'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors'
          >
            Close
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 ${
              !file || uploading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {uploading ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                Importing...
              </>
            ) : (
              <>
                <Upload size={16} />
                Import Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportDialog;
