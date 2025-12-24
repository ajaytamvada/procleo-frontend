import React, { useState, useRef, useCallback } from 'react';
import {
  X,
  Upload,
  FileImage,
  Loader2,
  CheckCircle,
  AlertCircle,
  Scan,
} from 'lucide-react';
import { useOcrStatus, useProcessOcrImage } from '../hooks/useOcr';
import type { ExtractedInvoiceData } from '../api/ocrApi';

interface OcrUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyData: (data: ExtractedInvoiceData) => void;
}

const OcrUploadModal: React.FC<OcrUploadModalProps> = ({
  isOpen,
  onClose,
  onApplyData,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: ocrStatus, isLoading: statusLoading } = useOcrStatus();
  const processOcrMutation = useProcessOcrImage();

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        // Create preview URL for images
        if (file.type.startsWith('image/')) {
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        } else {
          setPreviewUrl(null);
        }
      }
    },
    []
  );

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const handleProcess = async () => {
    if (!selectedFile) return;

    try {
      const result = await processOcrMutation.mutateAsync(selectedFile);
      if (result.success && result.extractedData) {
        onApplyData(result.extractedData);
        handleClose();
      }
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    processOcrMutation.reset();
    onClose();
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  const isProcessing = processOcrMutation.isPending;
  const result = processOcrMutation.data;
  const showResult = result && result.success && result.extractedData;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <div className='flex items-center space-x-3'>
            <div className='p-2 bg-blue-100 rounded-lg'>
              <Scan className='w-5 h-5 text-blue-600' />
            </div>
            <div>
              <h2 className='text-lg font-semibold text-gray-900'>
                Scan Invoice
              </h2>
              <p className='text-sm text-gray-500'>
                Upload an invoice image to extract data
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-gray-500' />
          </button>
        </div>

        {/* Content */}
        <div className='p-6'>
          {/* OCR Status Warning */}
          {statusLoading ? (
            <div className='flex items-center justify-center py-4'>
              <Loader2 className='w-5 h-5 animate-spin text-blue-600' />
              <span className='ml-2 text-gray-600'>
                Checking OCR availability...
              </span>
            </div>
          ) : !ocrStatus?.available ? (
            <div className='flex items-center p-4 mb-4 bg-amber-50 border border-amber-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-amber-600 mr-3' />
              <p className='text-sm text-amber-800'>
                {ocrStatus?.message || 'OCR service is not available'}
              </p>
            </div>
          ) : null}

          {/* File Upload Area */}
          {!showResult && (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {selectedFile ? (
                <div className='space-y-4'>
                  {previewUrl && (
                    <div className='flex justify-center'>
                      <img
                        src={previewUrl}
                        alt='Preview'
                        className='max-h-48 rounded-lg shadow-sm'
                      />
                    </div>
                  )}
                  <div className='flex items-center justify-center space-x-2'>
                    <FileImage className='w-5 h-5 text-gray-500' />
                    <span className='text-sm font-medium text-gray-700'>
                      {selectedFile.name}
                    </span>
                    <span className='text-sm text-gray-500'>
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={handleClearFile}
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Choose a different file
                  </button>
                </div>
              ) : (
                <>
                  <Upload className='w-12 h-12 text-gray-400 mx-auto mb-4' />
                  <p className='text-lg font-medium text-gray-700 mb-2'>
                    Drag & drop your invoice image here
                  </p>
                  <p className='text-sm text-gray-500 mb-4'>
                    or click to browse files
                  </p>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/jpeg,image/png,image/tiff,image/bmp,application/pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp,.pdf'
                    onChange={handleFileChange}
                    className='hidden'
                    id='ocr-file-input'
                  />
                  <label
                    htmlFor='ocr-file-input'
                    className='inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors'
                  >
                    <Upload className='w-4 h-4 mr-2' />
                    Select File
                  </label>
                  <p className='text-xs text-gray-400 mt-4'>
                    Supported formats:{' '}
                    {ocrStatus?.supportedFormats?.join(', ') ||
                      'JPG, PNG, TIFF, BMP, PDF'}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className='mt-6 flex flex-col items-center py-8'>
              <Loader2 className='w-10 h-10 animate-spin text-blue-600 mb-4' />
              <p className='text-gray-700 font-medium'>Processing file...</p>
              <p className='text-sm text-gray-500'>Extracting invoice data</p>
            </div>
          )}

          {/* Results */}
          {showResult && result.extractedData && (
            <div className='mt-4 space-y-4'>
              <div className='flex items-center p-4 bg-green-50 border border-green-200 rounded-lg'>
                <CheckCircle className='w-5 h-5 text-green-600 mr-3' />
                <div>
                  <p className='text-sm font-medium text-green-800'>
                    Invoice scanned successfully
                  </p>
                  <p className='text-xs text-green-600'>
                    Confidence: {result.confidence.toFixed(0)}% • Processing
                    time: {result.processingTimeMs}ms
                  </p>
                </div>
              </div>

              <div className='bg-gray-50 rounded-lg p-4'>
                <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                  Extracted Data
                </h3>
                <div className='grid grid-cols-2 gap-4 text-sm'>
                  {result.extractedData.invoiceNumber && (
                    <div>
                      <span className='text-gray-500'>Invoice Number:</span>
                      <p className='font-medium'>
                        {result.extractedData.invoiceNumber}
                      </p>
                    </div>
                  )}
                  {result.extractedData.invoiceDate && (
                    <div>
                      <span className='text-gray-500'>Invoice Date:</span>
                      <p className='font-medium'>
                        {result.extractedData.invoiceDate}
                      </p>
                    </div>
                  )}
                  {result.extractedData.supplierName && (
                    <div>
                      <span className='text-gray-500'>Supplier:</span>
                      <p className='font-medium'>
                        {result.extractedData.supplierName}
                      </p>
                    </div>
                  )}
                  {result.extractedData.currency && (
                    <div>
                      <span className='text-gray-500'>Currency:</span>
                      <p className='font-medium'>
                        {result.extractedData.currency}
                      </p>
                    </div>
                  )}
                  {result.extractedData.grandTotal && (
                    <div className='col-span-2'>
                      <span className='text-gray-500'>Grand Total:</span>
                      <p className='font-medium text-lg text-blue-600'>
                        {result.extractedData.currency === 'USD'
                          ? '$'
                          : result.extractedData.currency === 'EUR'
                            ? '€'
                            : result.extractedData.currency === 'GBP'
                              ? '£'
                              : '₹'}{' '}
                        {result.extractedData.grandTotal.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {result.extractedData.billingAddress && (
                    <div className='col-span-2'>
                      <span className='text-gray-500'>Billing Address:</span>
                      <p className='font-medium text-sm'>
                        {result.extractedData.billingAddress}
                      </p>
                    </div>
                  )}
                </div>

                {/* Line Items */}
                {result.extractedData.lineItems &&
                  result.extractedData.lineItems.length > 0 && (
                    <div className='mt-4'>
                      <h4 className='text-sm font-semibold text-gray-700 mb-2'>
                        Line Items
                      </h4>
                      <div className='overflow-x-auto'>
                        <table className='min-w-full text-xs'>
                          <thead>
                            <tr className='bg-gray-100'>
                              <th className='px-2 py-1 text-left'>
                                Description
                              </th>
                              <th className='px-2 py-1 text-right'>Qty</th>
                              <th className='px-2 py-1 text-right'>Rate</th>
                              <th className='px-2 py-1 text-right'>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.extractedData.lineItems
                              .slice(0, 10)
                              .map((item, idx) => (
                                <tr
                                  key={idx}
                                  className='border-b border-gray-100'
                                >
                                  <td className='px-2 py-1'>
                                    {item.description}
                                  </td>
                                  <td className='px-2 py-1 text-right'>
                                    {item.quantity || '-'}
                                  </td>
                                  <td className='px-2 py-1 text-right'>
                                    {item.unitPrice
                                      ? item.unitPrice.toLocaleString()
                                      : '-'}
                                  </td>
                                  <td className='px-2 py-1 text-right'>
                                    {item.amount
                                      ? item.amount.toLocaleString()
                                      : '-'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        {result.extractedData.lineItems.length > 10 && (
                          <p className='text-xs text-gray-500 mt-1'>
                            + {result.extractedData.lineItems.length - 10} more
                            items
                          </p>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Error State */}
          {result && !result.success && (
            <div className='mt-4 flex items-center p-4 bg-red-50 border border-red-200 rounded-lg'>
              <AlertCircle className='w-5 h-5 text-red-600 mr-3' />
              <p className='text-sm text-red-800'>
                {result.errorMessage || 'Failed to process image'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end px-6 py-4 border-t border-gray-200 bg-gray-50 space-x-3'>
          <button
            onClick={handleClose}
            className='px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          {showResult ? (
            <button
              onClick={() => {
                if (result?.extractedData) {
                  onApplyData(result.extractedData);
                  handleClose();
                }
              }}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <CheckCircle className='w-4 h-4 inline mr-2' />
              Apply to Form
            </button>
          ) : (
            <button
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing || !ocrStatus?.available}
              className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isProcessing ? (
                <>
                  <Loader2 className='w-4 h-4 inline mr-2 animate-spin' />
                  Processing...
                </>
              ) : (
                <>
                  <Scan className='w-4 h-4 inline mr-2' />
                  Scan Invoice
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrUploadModal;
