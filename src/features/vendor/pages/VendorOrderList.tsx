import React from 'react';
import {
  ShoppingCart,
  Calendar,
  Truck,
  AlertCircle,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

const useVendorOrders = () => {
  return useQuery({
    queryKey: ['vendor', 'orders'],
    queryFn: async () => {
      const response = await apiClient.get('/vendor-portal/orders');
      return response.data;
    },
  });
};

const VendorOrderList: React.FC = () => {
  const { data: orders, isLoading, error } = useVendorOrders();
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PARTIALLY_DELIVERED':
        return 'bg-blue-100 text-blue-800';
      case 'DELIVERED':
        return 'bg-purple-100 text-purple-800';
      case 'INVOICED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          {orders.map((po: any) => (
            <div
              key={po.id}
              className='bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow'
            >
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                <div className='flex items-start gap-4'>
                  <div className='p-3 bg-purple-50 rounded-lg'>
                    <ShoppingCart className='w-6 h-6 text-purple-600' />
                  </div>
                  <div>
                    <div className='flex items-center gap-2'>
                      <h3 className='font-semibold text-gray-900'>
                        {po.poNumber}
                      </h3>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(po.status)}`}
                      >
                        {po.status}
                      </span>
                    </div>
                    <p className='text-sm text-gray-500 mt-1'>
                      RFP: {po.rfpNumber || 'N/A'} • {po.itemCount} Items
                    </p>
                    <p className='text-sm font-medium text-gray-900 mt-1'>
                      Amount: ₹
                      {po.totalAmount?.toLocaleString('en-IN') || '0.00'}
                    </p>
                  </div>
                </div>

                <div className='flex items-center gap-6'>
                  <div className='text-sm text-gray-500'>
                    <div className='flex items-center gap-1'>
                      <Calendar className='w-4 h-4' />
                      Created: {po.poDate}
                    </div>
                    {po.deliveryDate && (
                      <div className='flex items-center gap-1 mt-1'>
                        <Truck className='w-4 h-4' />
                        Due: {po.deliveryDate}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/vendor/orders/${po.id}`)}
                    className='p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VendorOrderList;
