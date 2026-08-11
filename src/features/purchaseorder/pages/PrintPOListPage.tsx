/**
 * Print PO List Page
 * Shows list of approved Purchase Orders that can be printed or downloaded as PDF
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Printer, Download, Paperclip, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { usePurchaseOrdersByStatus } from '../hooks/usePurchaseOrders';
import { format, parseISO } from 'date-fns';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';

export const PrintPOListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [docsPo, setDocsPo] = useState<{ id: number; poNumber: string } | null>(
    null
  );
  const [supplierDocs, setSupplierDocs] = useState<any[]>([]);
  const [docsLoading, setDocsLoading] = useState(false);

  const itemsPerPage = 15;

  const {
    data: approvedPOs = [],
    isLoading,
    error,
  } = usePurchaseOrdersByStatus('APPROVED');

  // Filter POs based on search term
  const filteredPOs = approvedPOs.filter(
    (po: any) =>
      !searchTerm ||
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.raisedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredPOs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPOs = filteredPOs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePrintPreview = (poId: number) => {
    navigate(`/purchase-orders/print/${poId}`);
  };

  const handleDownloadPDF = async (poId: number, poNumber: string) => {
    try {
      setDownloadingId(poId);
      const response = await apiClient.get(
        `/purchaseorder/${poId}/export/pdf`,
        {
          responseType: 'blob',
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `PO_${poNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getPOTypeBadge = (poType: string) => {
    const typeConfig: Record<string, { bg: string; text: string }> = {
      DIRECT: { bg: 'bg-purple-100', text: 'text-purple-800' },
      INDIRECT: { bg: 'bg-blue-100', text: 'text-blue-800' },
    };

    const config = typeConfig[poType] || typeConfig.INDIRECT;
    return (
      <span
        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {poType}
      </span>
    );
  };

  // Supplier documents (email-channel uploads) for one PO
  const handleShowDocs = async (po: any) => {
    setDocsPo({ id: po.id, poNumber: po.poNumber });
    setDocsLoading(true);
    try {
      const response = await apiClient.get('/supplier-documents', {
        params: { referenceType: 'PO', referenceId: po.id },
      });
      setSupplierDocs(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading supplier documents:', error);
      toast.error('Failed to load supplier documents');
      setSupplierDocs([]);
    } finally {
      setDocsLoading(false);
    }
  };

  const handleDownloadDoc = async (doc: any) => {
    try {
      const response = await apiClient.get(
        `/supplier-documents/${doc.id}/download`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFilename || 'document');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const formatDocType = (type: string) =>
    (type || '')
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());

  /**
   * Supplier's email-channel response to the PO (magic-link flow).
   * "Awaiting" until the supplier acts on the emailed link.
   */
  const getSupplierResponseBadge = (po: any) => {
    const styles: Record<string, string> = {
      ACCEPTED: 'bg-green-50 text-green-700 border-green-200',
      CHANGE_REQUESTED: 'bg-amber-50 text-amber-700 border-amber-200',
      DECLINED: 'bg-red-50 text-red-700 border-red-200',
    };
    const labels: Record<string, string> = {
      ACCEPTED: 'Accepted',
      CHANGE_REQUESTED: 'Change requested',
      DECLINED: 'Declined',
    };
    if (!po.vendorResponse) {
      return (
        <span className='inline-flex px-2.5 py-1 rounded-full text-xs font-medium border bg-gray-50 text-gray-500 border-gray-200'>
          Awaiting
        </span>
      );
    }
    const title = [
      po.vendorResponseRemarks,
      po.vendorProposedDeliveryDate
        ? `Proposed delivery: ${po.vendorProposedDeliveryDate}`
        : null,
    ]
      .filter(Boolean)
      .join(' — ');
    return (
      <span
        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[po.vendorResponse] ||
          'bg-gray-50 text-gray-500 border-gray-200'
        }`}
        title={title || undefined}
      >
        {labels[po.vendorResponse] || po.vendorResponse}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
          <span className='text-2xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Error Loading Data
        </h3>
        <p className='text-gray-500'>
          Failed to load approved POs. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Supplier documents modal */}
      {docsPo && (
        <div className='fixed inset-0 z-50 flex items-center justify-center'>
          <div
            className='absolute inset-0 bg-gray-900/50'
            onClick={() => setDocsPo(null)}
          />
          <div className='relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg mx-4 overflow-hidden'>
            <div className='px-5 py-4 border-b border-gray-100 flex items-center justify-between'>
              <div>
                <h3 className='text-sm font-semibold text-gray-900'>
                  Supplier documents — {docsPo.poNumber}
                </h3>
                <p className='text-xs text-gray-500 mt-0.5'>
                  Files the supplier sent through the email link
                </p>
              </div>
              <button
                onClick={() => setDocsPo(null)}
                className='p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
            <div className='max-h-[360px] overflow-y-auto'>
              {docsLoading ? (
                <div className='flex justify-center py-10'>
                  <Loader2 className='w-6 h-6 animate-spin text-violet-600' />
                </div>
              ) : supplierDocs.length === 0 ? (
                <p className='text-sm text-gray-500 text-center py-10'>
                  No documents received yet
                </p>
              ) : (
                <ul className='divide-y divide-gray-100'>
                  {supplierDocs.map(doc => (
                    <li
                      key={doc.id}
                      className='px-5 py-3 flex items-center justify-between gap-3'
                    >
                      <div className='min-w-0'>
                        <p className='text-sm font-medium text-gray-900 truncate'>
                          {doc.originalFilename}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {formatDocType(doc.docType)}
                          {doc.uploadedByEmail
                            ? ` · from ${doc.uploadedByEmail}`
                            : ''}
                          {doc.uploadedAt
                            ? ` · ${new Date(doc.uploadedAt).toLocaleDateString('en-IN')}`
                            : ''}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDownloadDoc(doc)}
                        className='inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-md transition-colors flex-shrink-0'
                      >
                        <Download className='w-3.5 h-3.5' />
                        Download
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-800'>
            Print Purchase Orders
          </h1>
          <p className='text-sm text-gray-500 mt-1'>
            View, print, or download approved purchase orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by PO number, supplier, or raised by...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Table */}
      {approvedPOs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Search className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Data Found
          </h3>
          <p className='text-gray-500'>
            No approved purchase orders available.
          </p>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F7F8FA]'>
                  <tr>
                    <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide w-16'>
                      S.No
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      PO Number
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      PO Type
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      PO Date
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Supplier
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Raised By
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Department
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Total Amount
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Supplier Response
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {paginatedPOs.map((po: any, index: number) => (
                    <tr
                      key={po.id}
                      className='hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0'
                    >
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 text-center'>
                        {startIndex + index + 1}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {po.poNumber}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getPOTypeBadge(po.poType)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {po.poDate ? formatDate(po.poDate) : 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {po.supplierName || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {po.raisedBy || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {po.department || 'N/A'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        ₹{' '}
                        {po.grandTotal?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '0.00'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        {getSupplierResponseBadge(po)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center space-x-2'>
                          <button
                            onClick={() => handlePrintPreview(po.id)}
                            className='inline-flex items-center px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-md transition-colors'
                            title='Print Preview'
                          >
                            <Printer className='w-4 h-4 mr-1.5' />
                            Print
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadPDF(po.id, po.poNumber)
                            }
                            disabled={downloadingId === po.id}
                            className='inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                            title='Download PDF'
                          >
                            {downloadingId === po.id ? (
                              <Loader2 className='w-4 h-4 mr-1.5 animate-spin' />
                            ) : (
                              <Download className='w-4 h-4 mr-1.5' />
                            )}
                            PDF
                          </button>
                          <button
                            onClick={() => handleShowDocs(po)}
                            className='inline-flex items-center px-2.5 py-1.5 border border-gray-200 text-gray-600 hover:text-violet-600 hover:border-violet-300 hover:bg-violet-50 text-sm font-semibold rounded-md transition-colors'
                            title='Supplier documents'
                          >
                            <Paperclip className='w-4 h-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
              {/* Mobile view */}
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>

              {/* Desktop view */}
              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    Showing{' '}
                    <span className='font-medium'>{startIndex + 1}</span> to{' '}
                    <span className='font-medium'>
                      {Math.min(endIndex, filteredPOs.length)}
                    </span>{' '}
                    of <span className='font-medium'>{filteredPOs.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredPOs.length === 0 && approvedPOs.length > 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>
                No results match your search criteria
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PrintPOListPage;
