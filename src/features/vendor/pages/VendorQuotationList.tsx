import React from 'react';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  DollarSign,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVendorQuotations, VendorQuotation } from '../hooks/useVendorPortal';

const statusConfig: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  DRAFT: {
    color: 'bg-gray-100 text-gray-700',
    icon: <FileText className='w-3 h-3' />,
    label: 'Draft',
  },
  SUBMITTED: {
    color: 'bg-blue-100 text-blue-700',
    icon: <Clock className='w-3 h-3' />,
    label: 'Submitted',
  },
  UNDER_EVALUATION: {
    color: 'bg-amber-100 text-amber-700',
    icon: <Clock className='w-3 h-3' />,
    label: 'Under Evaluation',
  },
  NEGOTIATION: {
    color: 'bg-orange-100 text-orange-700',
    icon: <MessageSquare className='w-3 h-3' />,
    label: 'Negotiation',
  },
  SELECTED: {
    color: 'bg-green-100 text-green-700',
    icon: <CheckCircle className='w-3 h-3' />,
    label: 'Selected',
  },
  REJECTED: {
    color: 'bg-red-100 text-red-700',
    icon: <XCircle className='w-3 h-3' />,
    label: 'Rejected',
  },
};

const VendorQuotationList: React.FC = () => {
  const { data: quotations, isLoading, error } = useVendorQuotations();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
        <AlertCircle className='inline-block w-5 h-5 mr-2' />
        Error loading quotations. Please try again later.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>My Quotations</h1>
          <p className='text-gray-500 mt-1'>
            Track status of your submitted quotations
          </p>
        </div>
      </div>

      {/* List */}
      {!quotations || quotations.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-12 text-center'>
          <FileText className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>
            No Quotations Submitted
          </h3>
          <p className='text-gray-500 mt-1 mb-6'>
            You haven't submitted any quotations yet. Check active RFPs to
            participate.
          </p>
          <Link
            to='/vendor/rfp-invitations'
            className='inline-flex items-center px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors'
          >
            Browse Active RFPs
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {quotations.map((quotation: VendorQuotation) => {
            const status =
              statusConfig[quotation.status] || statusConfig.SUBMITTED;

            return (
              <div
                key={quotation.id}
                className='bg-white border rounded-lg p-5 hover:shadow-md transition-shadow'
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1'>
                    <div className='flex items-center gap-3'>
                      <h3 className='font-semibold text-gray-900'>
                        {quotation.quotationNumber ||
                          `Quotation #${quotation.id}`}
                      </h3>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      {quotation.isSelected && (
                        <span className='inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700'>
                          <CheckCircle className='w-3 h-3' />
                          Winner
                        </span>
                      )}
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                      For RFP: {quotation.rfpNumber}{' '}
                      {quotation.rfpTitle && `- ${quotation.rfpTitle}`}
                    </p>
                  </div>
                  <Link
                    to={`/vendor/rfp-invitations/${quotation.rfpId}`}
                    className='flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700'
                  >
                    View RFP
                    <ExternalLink className='w-3 h-3' />
                  </Link>
                </div>

                <div className='mt-4 flex items-center gap-6 text-sm'>
                  <div className='flex items-center gap-2'>
                    <DollarSign className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>Amount:</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {(quotation.netAmount || 0).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>Submitted:</span>
                    <span className='text-gray-900'>
                      {quotation.submittedDate
                        ? new Date(quotation.submittedDate).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <FileText className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>Items:</span>
                    <span className='text-gray-900'>{quotation.itemCount}</span>
                  </div>
                </div>

                {quotation.negotiationNotes && (
                  <div className='mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                    <div className='flex items-start gap-2'>
                      <MessageSquare className='w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5' />
                      <div>
                        <p className='text-sm font-medium text-orange-800'>
                          Negotiation Notes
                        </p>
                        <p className='text-sm text-orange-700 mt-0.5'>
                          {quotation.negotiationNotes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {quotation.status === 'NEGOTIATION' && (
                  <div className='mt-4 flex justify-end'>
                    <Link
                      to={`/vendor/quotations/resubmit/${quotation.id}`}
                      className='inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors'
                    >
                      Resubmit Quotation
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VendorQuotationList;
