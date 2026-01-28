import React from 'react';
import {
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

// Create a local hook if not yet in useVendorPortal
// You can move this to useVendorPortal.ts later
const useVendorQuotations = () => {
  return useQuery({
    queryKey: ['vendor', 'quotations'],
    queryFn: async () => {
      const response = await apiClient.get('/vendor-portal/quotations');
      return response.data;
    },
  });
};

const statusColors: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
};

const VendorQuotationList: React.FC = () => {
  const { data: quotations, isLoading, error } = useVendorQuotations();

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
            to='/vendor/rfps'
            className='inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            Browse Active RFPs
          </Link>
        </div>
      ) : (
        <div className='grid gap-4'>
          {/* Render list implementation here when API returns data */}
          {/* Currently the API returns empty list as placeholder, so "No Quotations" will show */}
          <p>Quotations found: {quotations.length}</p>
        </div>
      )}
    </div>
  );
};

export default VendorQuotationList;
