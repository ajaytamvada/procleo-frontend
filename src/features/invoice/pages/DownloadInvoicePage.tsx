import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePOsForInvoicing, useInvoicesByPoId } from '../hooks/useInvoice';
import { downloadInvoiceAttachment } from '../api/invoiceApi';

const DownloadInvoicePage: React.FC = () => {
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);

  // Queries
  const { data: availablePOs, isLoading: isLoadingPOs } = usePOsForInvoicing();
  const { data: invoices, isLoading: isLoadingInvoices } =
    useInvoicesByPoId(selectedPoId);

  const handleDownload = async (invoiceId: number, invoiceNumber: string) => {
    try {
      const blob = await downloadInvoiceAttachment(invoiceId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to download invoice. Please try again.';
      toast.error(errorMessage);
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Download Invoice</h1>
        <p className='text-sm text-gray-500 mt-1'>
          View and download invoice documents
        </p>
      </div>

      {/* Selection Card */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Check Details</h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* PO Number Dropdown */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PO Number <span className='text-red-500'>*</span>
              </label>
              {isLoadingPOs ? (
                <div className='text-sm text-gray-500'>Loading POs...</div>
              ) : (
                <select
                  value={selectedPoId || ''}
                  onChange={e => setSelectedPoId(Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value=''>Select PO</option>
                  {availablePOs?.map(po => (
                    <option key={po.poId} value={po.poId}>
                      {po.poNumber} - {po.supplierName} ({po.poDate})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Table */}
      {selectedPoId && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Invoice Details
            </h2>
          </div>
          <div className='overflow-x-auto'>
            {isLoadingInvoices ? (
              <div className='flex items-center justify-center h-64'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : invoices && invoices.length > 0 ? (
              <table className='w-full'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Invoice Number
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Invoice Date
                    </th>
                    <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Download Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex items-center justify-center'>
                          <FileText className='w-4 h-4 text-gray-400 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {invoice.invoiceNumber}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500'>
                        {invoice.invoiceDate}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        {invoice.attachmentPath ? (
                          <button
                            onClick={() =>
                              handleDownload(invoice.id, invoice.invoiceNumber)
                            }
                            className='inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors'
                            title='Download Invoice'
                          >
                            <Download className='w-4 h-4 mr-1' />
                            Download
                          </button>
                        ) : (
                          <span className='text-xs text-gray-400'>
                            No attachment
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className='p-12 text-center text-gray-500'>
                <FileText className='w-12 h-12 mx-auto mb-4 text-gray-300' />
                <p className='text-lg font-medium'>No invoices found</p>
                <p className='text-sm mt-1'>
                  No invoices exist for this Purchase Order
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadInvoicePage;
