import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  Building,
  AlertCircle,
} from 'lucide-react';

const useRFPDetails = (id: string) => {
  return useQuery({
    queryKey: ['vendor', 'rfp', id],
    queryFn: async () => {
      const response = await apiClient.get(`/vendor-portal/rfps/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

const VendorRFPDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rfp, isLoading, error } = useRFPDetails(id || '');

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600'></div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
        <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-2' />
        <h3 className='text-lg font-medium text-gray-900'>Error Loading RFP</h3>
        <p className='text-gray-500 mb-4'>
          Could not load the RFP details. It may not exist or you may not have
          access.
        </p>
        <button
          onClick={() => navigate('/vendor/rfp-invitations')}
          className='text-violet-600 font-medium hover:text-violet-700'
        >
          Return to List
        </button>
      </div>
    );
  }

  const isExpired = new Date(rfp.closingDate) < new Date();

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Header / Breadcrumb */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate('/vendor/rfp-invitations')}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
        >
          <ArrowLeft className='w-5 h-5 text-gray-600' />
        </button>
        <div>
          <h1 className='text-xl font-bold text-gray-900 flex items-center gap-3'>
            {rfp.rfpNumber}
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                rfp.status === 'FLOATED'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {rfp.status}
            </span>
          </h1>
          <p className='text-sm text-gray-500'>{rfp.title}</p>
        </div>
        <div className='ml-auto'>
          {!rfp.hasSubmittedQuotation &&
            rfp.status === 'FLOATED' &&
            !isExpired && (
              <Link
                to={`/vendor/quotations/submit/${rfp.id}`}
                className='inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-medium'
              >
                Submit Quotation
              </Link>
            )}
          {rfp.hasSubmittedQuotation && (
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-100 rounded-lg font-medium'>
              <CheckCircle className='w-4 h-4' />
              Quotation Submitted
            </div>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Main Info */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Description Card */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-gray-50/50'>
              <h3 className='font-semibold text-gray-900'>
                Description & Remarks
              </h3>
            </div>
            <div className='p-6'>
              <p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
                {rfp.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Line Items */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center'>
              <h3 className='font-semibold text-gray-900'>Requested Items</h3>
              <span className='text-xs font-medium bg-gray-100 px-2 py-1 rounded-full text-gray-600'>
                {rfp.items?.length || 0} Items
              </span>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Item
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Qty
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Required By
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200 bg-white'>
                  {rfp.items?.map((item: any, index: number) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {item.itemName}
                        </div>
                        {item.itemCode && (
                          <div className='text-xs text-gray-500'>
                            {item.itemCode}
                          </div>
                        )}
                        {item.description && (
                          <div className='text-xs text-gray-500 mt-0.5'>
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm text-gray-900 font-medium'>
                          {item.quantity} {item.uom || 'Units'}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {item.requiredDate
                          ? new Date(item.requiredDate).toLocaleDateString()
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className='space-y-6'>
          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='font-semibold text-gray-900 mb-4'>Timeline</h3>

            <div className='flex items-start gap-3'>
              <div className='p-2 bg-blue-50 rounded-lg text-blue-600'>
                <Calendar className='w-4 h-4' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Closing Date</p>
                <p className='text-sm font-medium text-gray-900'>
                  {new Date(rfp.closingDate).toLocaleDateString()}
                </p>
                <p className='text-xs text-gray-400'>
                  {new Date(rfp.closingDate).toLocaleTimeString()}
                </p>
              </div>
            </div>

            <div className='flex items-start gap-3'>
              <div className='p-2 bg-gray-50 rounded-lg text-gray-600'>
                <Clock className='w-4 h-4' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Published On</p>
                <p className='text-sm font-medium text-gray-900'>
                  {rfp.requestDate
                    ? new Date(rfp.requestDate).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl border border-gray-200 p-6 space-y-4'>
            <h3 className='font-semibold text-gray-900 mb-4'>Buyer Details</h3>
            <div className='flex items-start gap-3'>
              <div className='p-2 bg-gray-50 rounded-lg text-gray-600'>
                <Building className='w-4 h-4' />
              </div>
              <div>
                <p className='text-sm text-gray-500'>Department</p>
                <p className='text-sm font-medium text-gray-900'>
                  {rfp.department || 'Procurement Department'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRFPDetails;
