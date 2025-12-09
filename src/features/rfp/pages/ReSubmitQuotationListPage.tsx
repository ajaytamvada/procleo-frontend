/**
 * Re-Submit Quotation List Page
 * Shows list of submitted quotations that can be modified/re-submitted
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  Edit,
  Calendar,
  User,
  Package,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { useSubmittedQuotations } from '../hooks/useReSubmitQuotation';

export const ReSubmitQuotationListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch submitted quotations
  const { data: rfps = [], isLoading, error } = useSubmittedQuotations();

  // Filter RFPs based on search term
  const filteredRFPs = rfps.filter(
    rfp =>
      !searchTerm ||
      rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Flatten to show one row per quotation and filter for NEGOTIATION status
  const quotationRows = filteredRFPs.flatMap(rfp =>
    (rfp.quotations || [])
      .filter(quotation => quotation.status === 'NEGOTIATION')
      .map(quotation => ({
        rfp,
        quotation,
        supplier: rfp.suppliers?.find(s => s.supplierId === quotation.supplierId),
      }))
  );

  const handleEditQuotation = (rfpId: number, quotationId: number) => {
    navigate(`/rfp/${rfpId}/resubmit-quotation/${quotationId}`);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>
          Loading submitted quotations...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>
              Error Loading Quotations
            </h3>
            <p className='text-red-600 text-sm mt-1'>
              {error instanceof Error
                ? error.message
                : 'Unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Re-Submit RFP</h1>
            <p className='text-sm text-gray-600'>
              Modify and re-submit existing quotations
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='relative max-w-md'>
          <Search
            size={18}
            className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
          />
          <input
            type='text'
            placeholder='Search by RFP number or requested by...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
        </div>
      </div>

      {/* Quotations List */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='bg-white rounded-lg border border-gray-200'>
          {quotationRows.length === 0 ? (
            <div className='p-8 text-center'>
              <Package size={48} className='mx-auto text-gray-300 mb-3' />
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                {searchTerm
                  ? 'No matching quotations found'
                  : 'No submitted quotations available'}
              </h3>
              <p className='text-gray-600 text-sm'>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Submitted quotations will appear here for modification'}
              </p>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Supplier Name
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      RFP Number
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Quotation Number
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Quotation Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Created By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Status
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Amount
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {quotationRows.map((row, index) => (
                    <tr
                      key={`${row.quotation.id}-${index}`}
                      className='hover:bg-gray-50'
                    >
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Building2 size={16} className='text-gray-400 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {row.supplier?.supplierName ||
                              row.quotation.supplierName ||
                              `Supplier ${row.quotation.supplierId}`}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Package size={16} className='text-purple-600 mr-2' />
                          <span className='text-sm font-medium text-purple-600'>
                            {row.rfp.rfpNumber}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm text-gray-900'>
                          {row.quotation.quotationNumber || 'N/A'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Calendar size={16} className='text-gray-400 mr-2' />
                          <span className='text-sm text-gray-600'>
                            {row.quotation.quotationDate
                              ? new Date(
                                row.quotation.quotationDate
                              ).toLocaleDateString()
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <User size={16} className='text-gray-400 mr-2' />
                          <span className='text-sm text-gray-600'>
                            {row.rfp.requestedBy || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.quotation.status === 'SUBMITTED'
                              ? 'bg-green-100 text-green-800'
                              : row.quotation.status === 'NEGOTIATION'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                        >
                          {row.quotation.status || 'SUBMITTED'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                        ₹
                        {(
                          row.quotation.netAmount ||
                          row.quotation.totalAmount ||
                          0
                        ).toFixed(2)}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() =>
                            handleEditQuotation(row.rfp.id!, row.quotation.id!)
                          }
                          className='inline-flex items-center px-3 py-1.5 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors'
                        >
                          <Edit size={14} className='mr-1.5' />
                          Modify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary */}
        {quotationRows.length > 0 && (
          <div className='mt-4 text-sm text-gray-600'>
            Showing {quotationRows.length} quotation
            {quotationRows.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReSubmitQuotationListPage;
