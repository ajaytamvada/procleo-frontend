import React, { useState } from 'react';
import {
  FileText,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  Search,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendorRFPs } from '../hooks/useVendorPortal';
import type { VendorRFP } from '../hooks/useVendorPortal';

const statusColors: Record<string, string> = {
  FLOATED: 'bg-blue-100 text-blue-700',
  NEGOTIATION: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CLOSED: 'bg-gray-100 text-gray-700',
};

const VendorRFPList: React.FC = () => {
  const { data: rfps, isLoading, error } = useVendorRFPs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
        <AlertCircle className='inline-block w-5 h-5 mr-2' />
        Error loading RFPs. Please try again later.
      </div>
    );
  }

  // Filter RFPs
  const filteredRFPs = (rfps || []).filter((rfp: VendorRFP) => {
    const matchesSearch =
      !searchTerm ||
      rfp.rfpNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rfp.department?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || rfp.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate days remaining
  const getDaysRemaining = (closingDate: string) => {
    const today = new Date();
    const closing = new Date(closingDate);
    const diff = Math.ceil(
      (closing.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diff;
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>RFP Invitations</h1>
          <p className='text-gray-500 mt-1'>
            View and respond to RFP invitations from buyers
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-xl border border-gray-200 p-4'>
        <div className='flex flex-col md:flex-row gap-4'>
          {/* Search */}
          <div className='flex-1 relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by RFP number, title, or department...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>

          {/* Status Filter */}
          <div className='flex items-center gap-2'>
            <Filter className='w-4 h-4 text-gray-400' />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className='px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value='ALL'>All Status</option>
              <option value='FLOATED'>Open for Quotation</option>
              <option value='NEGOTIATION'>In Negotiation</option>
              <option value='APPROVED'>Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* RFP List */}
      {filteredRFPs.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>No RFPs Found</h3>
          <p className='text-gray-500 mt-1'>
            {searchTerm || statusFilter !== 'ALL'
              ? 'Try adjusting your filters'
              : "You don't have any RFP invitations yet"}
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {filteredRFPs.map((rfp: VendorRFP) => {
            const daysRemaining = getDaysRemaining(rfp.closingDate);
            const isExpired = daysRemaining < 0;
            const isUrgent = daysRemaining >= 0 && daysRemaining <= 3;

            return (
              <div
                key={rfp.id}
                className='bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow'
              >
                <div className='flex flex-col md:flex-row md:items-center gap-4'>
                  {/* RFP Info */}
                  <div className='flex-1'>
                    <div className='flex items-center gap-3 mb-2'>
                      <span className='font-mono text-sm bg-gray-100 px-2 py-1 rounded'>
                        {rfp.rfpNumber}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          statusColors[rfp.status] || statusColors.CLOSED
                        }`}
                      >
                        {rfp.status}
                      </span>
                      {rfp.hasSubmittedQuotation && (
                        <span className='flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700'>
                          <CheckCircle className='w-3 h-3' />
                          Quoted
                        </span>
                      )}
                    </div>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      {rfp.title || 'RFP Request'}
                    </h3>
                    <p className='text-sm text-gray-500 mt-1'>
                      {rfp.department} • {rfp.itemCount} items
                    </p>
                  </div>

                  {/* Dates and Actions */}
                  <div className='flex flex-col items-end gap-3'>
                    {/* Closing Date */}
                    <div className='flex items-center gap-2 text-sm'>
                      <Calendar className='w-4 h-4 text-gray-400' />
                      <span className='text-gray-600'>
                        Closes: {new Date(rfp.closingDate).toLocaleDateString()}
                      </span>
                      {isExpired ? (
                        <span className='px-2 py-0.5 text-xs font-medium rounded bg-red-100 text-red-700'>
                          Expired
                        </span>
                      ) : isUrgent ? (
                        <span className='px-2 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-700'>
                          {daysRemaining} days left
                        </span>
                      ) : null}
                    </div>

                    {/* Actions */}
                    <div className='flex gap-2'>
                      <Link
                        to={`/vendor/rfps/${rfp.id}`}
                        className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
                      >
                        <ExternalLink className='w-4 h-4' />
                        View Details
                      </Link>
                      {!rfp.hasSubmittedQuotation &&
                        rfp.status === 'FLOATED' &&
                        !isExpired && (
                          <Link
                            to={`/vendor/quotations/submit/${rfp.id}`}
                            className='flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors'
                          >
                            Submit Quotation
                          </Link>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorRFPList;
