/**
 * RFP Summary List Page
 * Shows list of RFPs available for summary viewing
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Loader2,
  AlertCircle,
  Calendar,
  User,
  Package,
  FileText,
} from 'lucide-react';
import { useRFPsForSummary } from '../hooks/useRFPSummary';

export const RFPSummaryListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: rfps = [], isLoading, error } = useRFPsForSummary();

  // Filter RFPs based on search term
  const filteredRFPs = rfps.filter(
    rfp =>
      !searchTerm ||
      rfp.rfpNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewSummary = (rfpId: number) => {
    navigate(`/rfp/${rfpId}/summary`);
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>Loading RFPs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>Error Loading RFPs</h3>
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
            <h1 className='text-2xl font-bold text-gray-900'>RFP Summary</h1>
            <p className='text-sm text-gray-600'>
              View comprehensive RFP summary reports including quotation
              comparisons
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

      {/* RFP List */}
      <div className='flex-1 overflow-auto p-6'>
        <div className='bg-white rounded-lg border border-gray-200'>
          {filteredRFPs.length === 0 ? (
            <div className='p-8 text-center'>
              <Package size={48} className='mx-auto text-gray-300 mb-3' />
              <h3 className='text-lg font-medium text-gray-900 mb-1'>
                {searchTerm
                  ? 'No matching RFPs found'
                  : 'No RFPs available for summary'}
              </h3>
              <p className='text-gray-600 text-sm'>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'RFPs with quotations will appear here'}
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
                      RFP Number
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      RFP Date
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Requested By
                    </th>
                    <th
                      scope='col'
                      className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                    >
                      Department
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
                      Quotations
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
                  {filteredRFPs.map(rfp => (
                    <tr key={rfp.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Package size={16} className='text-purple-600 mr-2' />
                          <span className='text-sm font-medium text-purple-600'>
                            {rfp.rfpNumber}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Calendar size={16} className='text-gray-400 mr-2' />
                          <span className='text-sm text-gray-600'>
                            {new Date(rfp.requestDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <User size={16} className='text-gray-400 mr-2' />
                          <span className='text-sm text-gray-600'>
                            {rfp.requestedBy || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='text-sm text-gray-600'>
                          {rfp.department || 'N/A'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {rfp.status}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                        {rfp.quotations?.length || 0} received
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => handleViewSummary(rfp.id!)}
                          className='inline-flex items-center px-3 py-1.5 border border-purple-300 rounded-lg text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors'
                        >
                          <FileText size={14} className='mr-1.5' />
                          View Summary
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
        {filteredRFPs.length > 0 && (
          <div className='mt-4 text-sm text-gray-600'>
            Showing {filteredRFPs.length} RFP
            {filteredRFPs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};

export default RFPSummaryListPage;
