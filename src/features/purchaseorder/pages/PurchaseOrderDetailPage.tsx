import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Download,
  Package,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  Send,
} from 'lucide-react';
import type { PurchaseOrder } from '../types';
import { POStatus, POType } from '../types';
import { format } from 'date-fns';

const PurchaseOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchaseOrderDetails();
  }, [id]);

  const fetchPurchaseOrderDetails = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration
      const mockData: PurchaseOrder = {
        id: 1,
        poNumber: 'PO/2024-2025/001',
        rfpNumber: 'RFP2024/00001',
        quotationNumber: 'QT2024/00001',
        poDate: '2024-09-08',
        deliveryDate: '2024-09-15',
        supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
        supplierId: 1,
        supplierCode: 'SUP001',
        raisedBy: 'Wei',
        department: 'Operations',
        approvalGroup: 'Finance',
        paymentTerms: 'NETT 30 DAYS',
        termsConditions: 'Standard terms and conditions apply',
        shipToAddress: '123 Main Street, City, State 12345',
        billToAddress: '456 Corporate Avenue, City, State 54321',
        status: POStatus.APPROVED,
        poType: POType.DIRECT,
        currency: 'INR',
        subTotal: 440000,
        taxAmount: 56000,
        discountAmount: 0,
        grandTotal: 496000,
        items: [
          {
            id: 1,
            itemName: 'Bitumen Pressure Distributor',
            itemCode: 'BPD-001',
            itemDescription:
              'Heavy duty bitumen pressure distributor with automated controls',
            quantity: 2,
            unitOfMeasurement: 'Units',
            unitPrice: 200000,
            tax1Type: 'CGST',
            tax1Rate: 9,
            tax1Amount: 18000,
            tax2Type: 'SGST',
            tax2Rate: 9,
            tax2Amount: 18000,
            totalAmount: 400000,
            grandTotal: 436000,
            deliveryDate: '2024-09-15',
            category: 'Equipment',
            subCategory: 'Heavy Machinery',
          },
          {
            id: 2,
            itemName: 'Spare Parts Kit',
            itemCode: 'SPK-001',
            itemDescription: 'Comprehensive spare parts kit for maintenance',
            quantity: 1,
            unitOfMeasurement: 'Set',
            unitPrice: 40000,
            tax1Type: 'CGST',
            tax1Rate: 9,
            tax1Amount: 3600,
            tax2Type: 'SGST',
            tax2Rate: 9,
            tax2Amount: 3600,
            totalAmount: 40000,
            grandTotal: 47200,
            deliveryDate: '2024-09-15',
            category: 'Spare Parts',
            subCategory: 'Maintenance',
          },
        ],
        createdBy: 'Admin',
        createdDate: '2024-09-08',
        approvedBy: 'Manager',
        approvedDate: '2024-09-08',
      };
      setPurchaseOrder(mockData);
    } catch (error) {
      console.error('Error fetching purchase order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (
      window.confirm('Are you sure you want to approve this Purchase Order?')
    ) {
      // Implement approval logic
      console.log('Approving PO:', id);
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason) {
      // Implement rejection logic
      console.log('Rejecting PO:', id, 'Reason:', reason);
    }
  };

  const handleCreateGRN = () => {
    navigate(`/grn/create?poId=${id}`);
  };

  const handleCreateInvoice = () => {
    navigate(`/invoices/create?poId=${id}`);
  };

  const handleDownload = () => {
    // Implement download logic
    console.log('Downloading PO:', id);
  };

  const handleSend = () => {
    // Implement send to supplier logic
    console.log('Sending PO to supplier:', id);
  };

  const getStatusBadgeClass = (status?: POStatus) => {
    switch (status) {
      case POStatus.DRAFT:
        return 'bg-gray-100 text-gray-800';
      case POStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case POStatus.APPROVED:
        return 'bg-green-100 text-green-800';
      case POStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case POStatus.PARTIALLY_DELIVERED:
        return 'bg-yellow-100 text-yellow-800';
      case POStatus.DELIVERED:
        return 'bg-purple-100 text-purple-800';
      case POStatus.INVOICED:
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status?: POStatus) => {
    switch (status) {
      case POStatus.APPROVED:
        return <CheckCircle className='w-4 h-4' />;
      case POStatus.REJECTED:
        return <XCircle className='w-4 h-4' />;
      case POStatus.PARTIALLY_DELIVERED:
      case POStatus.DELIVERED:
        return <Truck className='w-4 h-4' />;
      default:
        return <Clock className='w-4 h-4' />;
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>Loading...</div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>Purchase Order not found</div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-start'>
        <div className='flex items-center space-x-4'>
          <button
            onClick={() => navigate('/purchase-orders')}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              Purchase Order Details
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              PO Number: {purchaseOrder.poNumber}
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-3'>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClass(purchaseOrder.status)}`}
          >
            {getStatusIcon(purchaseOrder.status)}
            <span className='ml-1'>
              {purchaseOrder.status?.replace('_', ' ')}
            </span>
          </span>
          {purchaseOrder.status === POStatus.DRAFT && (
            <button
              onClick={() => navigate(`/purchase-orders/${id}/edit`)}
              className='flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
            >
              <Edit className='w-4 h-4 mr-2' />
              Edit
            </button>
          )}
          {purchaseOrder.status === POStatus.SUBMITTED && (
            <>
              <button
                onClick={handleApprove}
                className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
              >
                <CheckCircle className='w-4 h-4 mr-2' />
                Approve
              </button>
              <button
                onClick={handleReject}
                className='flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
              >
                <XCircle className='w-4 h-4 mr-2' />
                Reject
              </button>
            </>
          )}
          {purchaseOrder.status === POStatus.APPROVED && (
            <>
              <button
                onClick={handleCreateGRN}
                className='flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
              >
                <Package className='w-4 h-4 mr-2' />
                Create GRN
              </button>
              <button
                onClick={handleSend}
                className='flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
              >
                <Send className='w-4 h-4 mr-2' />
                Send to Supplier
              </button>
            </>
          )}
          {purchaseOrder.status === POStatus.DELIVERED && (
            <button
              onClick={handleCreateInvoice}
              className='flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors'
            >
              <FileText className='w-4 h-4 mr-2' />
              Create Invoice
            </button>
          )}
          <button
            onClick={handleDownload}
            className='flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors'
          >
            <Download className='w-4 h-4 mr-2' />
            Download
          </button>
        </div>
      </div>

      {/* PO Information */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Purchase Order Information
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                PO Number
              </label>
              <p className='text-sm text-gray-900'>{purchaseOrder.poNumber}</p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                PO Date
              </label>
              <p className='text-sm text-gray-900'>
                {format(new Date(purchaseOrder.poDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Delivery Date
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.deliveryDate
                  ? format(new Date(purchaseOrder.deliveryDate), 'dd/MM/yyyy')
                  : '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                RFP Number
              </label>
              <p className='text-sm text-blue-600 hover:text-blue-800 cursor-pointer'>
                {purchaseOrder.rfpNumber || '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Quotation Number
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.quotationNumber || '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                PO Type
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.poType || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Information */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Supplier Information
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Supplier Name
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.supplierName}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Supplier Code
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.supplierCode || '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Payment Terms
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.paymentTerms || '-'}
              </p>
            </div>
            <div className='md:col-span-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Bill To Address
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.billToAddress || '-'}
              </p>
            </div>
            <div className='md:col-span-3'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Ship To Address
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.shipToAddress || '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>Line Items</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Item Details
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Quantity
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Unit Price
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Tax
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Total
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {purchaseOrder.items?.map((item, index) => (
                <tr key={item.id || index}>
                  <td className='px-6 py-4'>
                    <div>
                      <p className='text-sm font-medium text-gray-900'>
                        {item.itemName}
                      </p>
                      <p className='text-xs text-gray-500'>{item.itemCode}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {item.itemDescription}
                      </p>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <p className='text-sm text-gray-900'>
                      {item.quantity} {item.unitOfMeasurement}
                    </p>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <p className='text-sm text-gray-900'>
                      ₹ {item.unitPrice?.toLocaleString('en-IN')}
                    </p>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='text-xs'>
                      {item.tax1Type && (
                        <p>
                          {item.tax1Type}: {item.tax1Rate}% (₹{' '}
                          {item.tax1Amount?.toLocaleString('en-IN')})
                        </p>
                      )}
                      {item.tax2Type && (
                        <p>
                          {item.tax2Type}: {item.tax2Rate}% (₹{' '}
                          {item.tax2Amount?.toLocaleString('en-IN')})
                        </p>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <p className='text-sm font-semibold text-gray-900'>
                      ₹ {item.grandTotal?.toLocaleString('en-IN')}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className='px-6 py-4 border-t border-gray-200 bg-gray-50'>
          <div className='flex justify-end space-y-2'>
            <div className='text-right'>
              <div className='flex justify-between items-center py-1'>
                <span className='text-sm text-gray-600 mr-8'>Subtotal:</span>
                <span className='text-sm font-medium text-gray-900'>
                  ₹ {purchaseOrder.subTotal?.toLocaleString('en-IN')}
                </span>
              </div>
              <div className='flex justify-between items-center py-1'>
                <span className='text-sm text-gray-600 mr-8'>Tax Amount:</span>
                <span className='text-sm font-medium text-gray-900'>
                  ₹ {purchaseOrder.taxAmount?.toLocaleString('en-IN')}
                </span>
              </div>
              {purchaseOrder.discountAmount &&
                purchaseOrder.discountAmount > 0 && (
                  <div className='flex justify-between items-center py-1'>
                    <span className='text-sm text-gray-600 mr-8'>
                      Discount:
                    </span>
                    <span className='text-sm font-medium text-red-600'>
                      - ₹ {purchaseOrder.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              <div className='flex justify-between items-center py-2 border-t border-gray-300 mt-2'>
                <span className='text-base font-semibold text-gray-900 mr-8'>
                  Grand Total:
                </span>
                <span className='text-lg font-bold text-primary-600'>
                  ₹ {purchaseOrder.grandTotal?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Additional Information
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Department
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.department || '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Raised By
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.raisedBy || '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Created Date
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.createdDate
                  ? format(
                      new Date(purchaseOrder.createdDate),
                      'dd/MM/yyyy HH:mm'
                    )
                  : '-'}
              </p>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Approved By
              </label>
              <p className='text-sm text-gray-900'>
                {purchaseOrder.approvedBy || '-'}
                {purchaseOrder.approvedDate && (
                  <span className='text-xs text-gray-500 ml-2'>
                    (
                    {format(new Date(purchaseOrder.approvedDate), 'dd/MM/yyyy')}
                    )
                  </span>
                )}
              </p>
            </div>
            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Terms & Conditions
              </label>
              <p className='text-sm text-gray-900 whitespace-pre-wrap'>
                {purchaseOrder.termsConditions || '-'}
              </p>
            </div>
            {purchaseOrder.remarks && (
              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Remarks
                </label>
                <p className='text-sm text-gray-900'>{purchaseOrder.remarks}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderDetailPage;
