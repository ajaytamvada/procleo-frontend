import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import {
  ArrowLeft,
  ShoppingCart,
  Calendar,
  Truck,
  Package,
  FileText,
  DollarSign,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle,
} from 'lucide-react';

interface VendorOrderDetail {
  id: number;
  poNumber: string;
  poDate: string;
  deliveryDate?: string;
  status: string;
  paymentTerms?: string;
  deliveryTerms?: string;
  currency?: string;
  totalAmount: number;
  taxAmount?: number;
  grandTotal?: number;
  rfpNumber?: string;
  remarks?: string;
  items: VendorOrderItem[];
}

interface VendorOrderItem {
  id: number;
  itemName: string;
  itemCode?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  uom?: string;
  receivedQuantity?: number;
}

const useVendorOrder = (orderId: number | undefined) => {
  return useQuery({
    queryKey: ['vendor', 'orders', orderId],
    queryFn: async () => {
      const response = await apiClient.get(`/vendor-portal/orders/${orderId}`);
      return response.data as VendorOrderDetail;
    },
    enabled: !!orderId,
  });
};

const VendorOrderDetails: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const orderIdNum = orderId ? parseInt(orderId, 10) : undefined;
  const { data: order, isLoading, error } = useVendorOrder(orderIdNum);

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
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-violet-600' />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div>
            <h3 className='font-medium text-red-800'>Error Loading Order</h3>
            <p className='text-red-600 text-sm mt-1'>
              {(error as Error)?.message || 'Unable to load order details'}
            </p>
            <Link
              to='/vendor/orders'
              className='text-red-700 hover:text-red-800 text-sm font-medium mt-2 inline-block'
            >
              ← Back to Purchase Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            to='/vendor/orders'
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </Link>
          <div>
            <div className='flex items-center gap-3'>
              <h1 className='text-2xl font-bold text-gray-900'>
                {order.poNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
              >
                {order.status}
              </span>
            </div>
            <p className='text-gray-500'>
              {order.rfpNumber && `RFP: ${order.rfpNumber}`}
            </p>
          </div>
        </div>
      </div>

      {/* Order Info Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-500 mb-2'>
            <Calendar className='w-4 h-4' />
            <span className='text-sm'>Order Date</span>
          </div>
          <p className='font-semibold text-gray-900'>
            {order.poDate ? new Date(order.poDate).toLocaleDateString() : 'N/A'}
          </p>
        </div>
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-500 mb-2'>
            <Truck className='w-4 h-4' />
            <span className='text-sm'>Delivery Date</span>
          </div>
          <p className='font-semibold text-gray-900'>
            {order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-500 mb-2'>
            <Package className='w-4 h-4' />
            <span className='text-sm'>Total Items</span>
          </div>
          <p className='font-semibold text-gray-900'>
            {order.items?.length || 0}
          </p>
        </div>
        <div className='bg-white border rounded-lg p-4'>
          <div className='flex items-center gap-2 text-gray-500 mb-2'>
            <DollarSign className='w-4 h-4' />
            <span className='text-sm'>Total Amount</span>
          </div>
          <p className='font-semibold text-violet-600'>
            ₹
            {(order.grandTotal || order.totalAmount || 0).toLocaleString(
              'en-IN',
              { minimumFractionDigits: 2 }
            )}
          </p>
        </div>
      </div>

      {/* Order Details */}
      <div className='bg-white border rounded-lg'>
        <div className='p-4 border-b bg-gray-50'>
          <h2 className='text-lg font-semibold text-gray-900'>Order Details</h2>
        </div>
        <div className='p-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
          <div>
            <span className='text-sm text-gray-500'>Payment Terms</span>
            <p className='font-medium text-gray-900'>
              {order.paymentTerms || 'N/A'}
            </p>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Delivery Terms</span>
            <p className='font-medium text-gray-900'>
              {order.deliveryTerms || 'N/A'}
            </p>
          </div>
          <div>
            <span className='text-sm text-gray-500'>Currency</span>
            <p className='font-medium text-gray-900'>
              {order.currency || 'INR'}
            </p>
          </div>
          {order.remarks && (
            <div>
              <span className='text-sm text-gray-500'>Remarks</span>
              <p className='font-medium text-gray-900'>{order.remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <div className='bg-white border rounded-lg overflow-hidden'>
        <div className='p-4 border-b bg-gray-50'>
          <h2 className='text-lg font-semibold text-gray-900'>Order Items</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                  Item
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                  UOM
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                  Qty Ordered
                </th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                  Qty Received
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Unit Price
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Tax
                </th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {order.items?.map(item => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  <td className='px-4 py-3'>
                    <div className='font-medium text-gray-900'>
                      {item.itemName}
                    </div>
                    {item.itemCode && (
                      <div className='text-sm text-gray-500'>
                        {item.itemCode}
                      </div>
                    )}
                  </td>
                  <td className='px-4 py-3 text-center text-gray-600'>
                    {item.uom || 'Nos'}
                  </td>
                  <td className='px-4 py-3 text-center text-gray-900'>
                    {item.quantity}
                  </td>
                  <td className='px-4 py-3 text-center'>
                    <span
                      className={`font-medium ${(item.receivedQuantity || 0) >= item.quantity ? 'text-green-600' : 'text-gray-600'}`}
                    >
                      {item.receivedQuantity || 0}
                      {(item.receivedQuantity || 0) >= item.quantity && (
                        <CheckCircle className='w-4 h-4 inline ml-1 text-green-500' />
                      )}
                    </span>
                  </td>
                  <td className='px-4 py-3 text-right text-gray-900'>
                    ₹
                    {item.unitPrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className='px-4 py-3 text-right text-gray-600'>
                    ₹
                    {(item.taxAmount || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className='px-4 py-3 text-right font-medium text-gray-900'>
                    ₹
                    {item.totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className='bg-gray-50'>
              <tr>
                <td colSpan={5}></td>
                <td className='px-4 py-3 text-right font-medium text-gray-600'>
                  Subtotal:
                </td>
                <td className='px-4 py-3 text-right font-medium text-gray-900'>
                  ₹
                  {(order.totalAmount || 0).toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
              {order.taxAmount && (
                <tr>
                  <td colSpan={5}></td>
                  <td className='px-4 py-3 text-right font-medium text-gray-600'>
                    Tax:
                  </td>
                  <td className='px-4 py-3 text-right font-medium text-gray-900'>
                    ₹
                    {order.taxAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={5}></td>
                <td className='px-4 py-3 text-right font-bold text-gray-900'>
                  Grand Total:
                </td>
                <td className='px-4 py-3 text-right font-bold text-violet-600'>
                  ₹
                  {(order.grandTotal || order.totalAmount || 0).toLocaleString(
                    'en-IN',
                    { minimumFractionDigits: 2 }
                  )}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className='flex justify-end gap-4'>
        <Link
          to='/vendor/orders'
          className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
        >
          Back to Orders
        </Link>
        {order.status === 'APPROVED' && (
          <Link
            to={`/vendor/invoices/create?poId=${order.id}`}
            className='px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2'
          >
            <FileText className='w-4 h-4' />
            Create Invoice
          </Link>
        )}
      </div>
    </div>
  );
};

export default VendorOrderDetails;
