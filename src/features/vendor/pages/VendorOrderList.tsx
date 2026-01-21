import React from 'react';
import { ShoppingCart, Calendar, Truck, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

const useVendorOrders = () => {
  return useQuery({
    queryKey: ['vendor', 'orders'],
    queryFn: async () => {
      const response = await apiClient.get('/api/vendor-portal/orders');
      return response.data;
    },
  });
};

const VendorOrderList: React.FC = () => {
  const { data: orders, isLoading, error } = useVendorOrders();

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
        Error loading purchase orders. Please try again later.
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Purchase Orders</h1>
          <p className='text-gray-500 mt-1'>
            View and manage your purchase orders
          </p>
        </div>
      </div>

      {!orders || orders.length === 0 ? (
        <div className='bg-gray-50 border border-gray-200 rounded-lg p-12 text-center'>
          <ShoppingCart className='w-16 h-16 text-gray-300 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-700'>
            No Purchase Orders
          </h3>
          <p className='text-gray-500 mt-1'>
            You don't have any purchase orders yet.
          </p>
        </div>
      ) : (
        <div className='grid gap-4'>
          {/* List implementation waiting for real data */}
        </div>
      )}
    </div>
  );
};

export default VendorOrderList;
