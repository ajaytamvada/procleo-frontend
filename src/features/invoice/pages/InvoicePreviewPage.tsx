import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft } from 'lucide-react';
import { Invoice, InvoiceStatus, InvoiceType } from '../../purchaseorder/types';
import { format } from 'date-fns';

export const InvoicePreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching Invoice details
    const fetchInvoice = async () => {
      setLoading(true);
      try {
        // Mock data similar to InvoiceListPage
        const mockInvoice: Invoice = {
          id: id ? parseInt(id) : 1,
          invoiceNumber: 'INV/2024/005',
          invoiceDate: '2024-09-20',
          poId: 1,
          poNumber: 'PO/2024-2025/001',
          grnId: 1,
          grnNumber: 'GRN/2024-2025/001',
          supplierId: 1,
          supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
          supplierInvoiceNumber: 'NAL/INV/24-25/108',
          supplierInvoiceDate: '2024-09-18',
          invoiceType: InvoiceType.STANDARD,
          status: InvoiceStatus.APPROVED,
          dueDate: '2024-10-20',
          currency: 'INR',

          // Money fields
          subTotal: 496000,
          taxAmount: 89280, // 18% GST approximately
          discountAmount: 0,
          freightCharges: 5000,
          grandTotal: 590280,
          paidAmount: 0,
          balanceAmount: 590280,

          billToAddress:
            'Autovitica Construction Ltd, HQ, Bengaluru, Karnataka, 560001',
          shipToAddress:
            'Main Warehouse - Section A, Mysore Road, Bengaluru, Karnataka, 560039',

          items: [
            {
              id: 1,
              itemName: 'Bitumen Sprayer',
              itemCode: 'EQ-BS-001',
              itemDescription:
                'High capacity bitumen sprayer with automated control',
              invoiceQuantity: 1,
              unitOfMeasurement: 'NOS',
              unitPrice: 450000,
              baseAmount: 450000,
              taxableAmount: 450000,
              cgstRate: 9,
              cgstAmount: 40500,
              sgstRate: 9,
              sgstAmount: 40500,
              totalTaxAmount: 81000,
              totalAmount: 531000,
            },
            {
              id: 2,
              itemName: 'Spray Nozzle Set',
              itemCode: 'SP-NZ-005',
              itemDescription: 'Spare nozzle set for sprayer',
              invoiceQuantity: 5,
              unitOfMeasurement: 'SET',
              unitPrice: 9200,
              baseAmount: 46000,
              taxableAmount: 46000,
              cgstRate: 9,
              cgstAmount: 4140,
              sgstRate: 9,
              sgstAmount: 4140,
              totalTaxAmount: 8280,
              totalAmount: 54280,
            },
          ],
        };

        setTimeout(() => {
          setInvoice(mockInvoice);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching Invoice:', error);
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PAID':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-medium text-gray-900'>Invoice Not Found</h3>
        <button
          onClick={() => navigate('/invoice/list')}
          className='mt-4 text-blue-600 hover:underline'
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className='space-y-6 max-w-5xl mx-auto pb-10'>
      {/* Header Actions */}
      <div className='flex items-center justify-between print:hidden'>
        <button
          onClick={() => navigate('/invoice/list')}
          className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to Invoice List
        </button>
        <button
          onClick={handlePrint}
          className='flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors'
        >
          <Printer className='h-4 w-4' />
          <span>Print</span>
        </button>
      </div>

      {/* Main Content Card */}
      <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-8 print:shadow-none print:border-0'>
        {/* Document Header */}
        <div className='flex justify-between items-start border-b border-gray-200 pb-6 mb-6'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Invoice</h1>
            <p className='text-sm text-gray-500 mt-1 capitalize'>
              {invoice.invoiceType?.replace(/_/g, ' ').toLowerCase()}
            </p>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-semibold text-gray-900'>
              {invoice.invoiceNumber}
            </div>
            <div
              className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}
            >
              {invoice.status?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8'>
          <div className='space-y-4'>
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Vendor
              </label>
              <div className='mt-1 font-medium text-gray-900'>
                {invoice.supplierName}
              </div>
              {invoice.supplierInvoiceNumber && (
                <div className='text-xs text-gray-500 mt-1'>
                  Ref: {invoice.supplierInvoiceNumber}{' '}
                  {invoice.supplierInvoiceDate &&
                    `(${format(new Date(invoice.supplierInvoiceDate), 'dd/MM/yyyy')})`}
                </div>
              )}
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Bill To
                </label>
                <div className='mt-1 text-sm text-gray-700 whitespace-pre-line'>
                  {invoice.billToAddress || '-'}
                </div>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Ship To
                </label>
                <div className='mt-1 text-sm text-gray-700 whitespace-pre-line'>
                  {invoice.shipToAddress || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Invoice Date
                </label>
                <div className='mt-1 text-gray-900'>
                  {invoice.invoiceDate
                    ? format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Due Date
                </label>
                <div className='mt-1 text-red-600 font-medium'>
                  {invoice.dueDate
                    ? format(new Date(invoice.dueDate), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  PO Reference
                </label>
                <div className='mt-1 text-blue-600'>
                  {invoice.poNumber || '-'}
                </div>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  GRN Reference
                </label>
                <div className='mt-1 text-blue-600'>
                  {invoice.grnNumber || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className='mb-8'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>Line Items</h3>
          <div className='overflow-hidden border border-gray-200 rounded-lg'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12'>
                    #
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Description
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Qty
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Tax
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {invoice.items?.map((item, index) => (
                  <tr key={index}>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm font-medium text-gray-900'>
                        {item.itemName}
                      </div>
                      <div className='text-xs text-gray-500 mt-0.5'>
                        {item.itemDescription}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900 text-right'>
                      {item.invoiceQuantity}{' '}
                      <span className='text-xs text-gray-500'>
                        {item.unitOfMeasurement}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900 text-right'>
                      ₹
                      {item.unitPrice?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-600 text-right'>
                      ₹
                      {item.totalTaxAmount?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold text-gray-900 text-right'>
                      ₹
                      {item.totalAmount?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Section */}
        <div className='flex justify-end mb-6'>
          <div className='w-full md:w-1/3 space-y-3'>
            <div className='flex justify-between text-sm'>
              <span className='text-gray-500'>Sub Total</span>
              <span className='font-medium text-gray-900'>
                ₹
                {invoice.subTotal?.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {invoice.taxAmount && invoice.taxAmount > 0 && (
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Total Tax</span>
                <span className='font-medium text-gray-900'>
                  ₹
                  {invoice.taxAmount?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {invoice.freightCharges && invoice.freightCharges > 0 && (
              <div className='flex justify-between text-sm'>
                <span className='text-gray-500'>Freight & Other Charges</span>
                <span className='font-medium text-gray-900'>
                  ₹
                  {invoice.freightCharges?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            <div className='flex justify-between text-lg font-bold border-t border-gray-200 pt-3 mt-3'>
              <span className='text-gray-900'>Grand Total</span>
              <span className='text-blue-600'>
                ₹
                {invoice.grandTotal?.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className='flex justify-between text-sm font-medium pt-1'>
              <span className='text-gray-500'>Balance Due</span>
              <span className='text-red-600'>
                ₹
                {invoice.balanceAmount?.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreviewPage;
