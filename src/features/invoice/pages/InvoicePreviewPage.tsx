import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
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
          taxAmount: 89280,
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
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
      case 'OVERDUE':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING_APPROVAL':
      case 'SUBMITTED':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'THREE_WAY_MATCHED':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'PARTIALLY_PAID':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DRAFT':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
              <div>
                <div className='w-40 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-28 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
              </div>
            </div>
            <div className='w-32 h-10 bg-gray-200 rounded-md animate-pulse'></div>
          </div>

          {/* Content Skeleton */}
          <div className='bg-white rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto'>
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading invoice details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/invoice/list')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Invoice Preview
            </h1>
          </div>

          {/* Error Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-2 max-w-2xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-900'>
                  Invoice Not Found
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  The invoice you're looking for doesn't exist or has been
                  removed.
                </p>
                <button
                  onClick={() => navigate('/invoice/list')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Back to Invoice List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Action Bar (Hidden during print) */}
      <div className='print:hidden p-2 pb-0'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/invoice/list')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Invoice Preview
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {invoice.invoiceNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Printer size={15} />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Print-Ready Document */}
      <div className='max-w-5xl mx-auto px-6 pb-6 print:p-0 print:max-w-none'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden print:border-0 print:rounded-none'>
          <div className='p-6 print:p-12'>
            {/* Document Header */}
            <div className='border-b-2 border-violet-600 pb-6 mb-8'>
              <div className='flex items-start justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-violet-600'>
                    INVOICE
                  </h1>
                  <p className='text-sm text-gray-500 mt-1 capitalize'>
                    {invoice.invoiceType?.replace(/_/g, ' ').toLowerCase()}
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-gray-900'>
                    {invoice.invoiceNumber}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(invoice.status)}`}
                  >
                    {invoice.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
              {/* Left Column */}
              <div className='space-y-6'>
                {/* Vendor Info */}
                <div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Building2 size={14} className='text-violet-600' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500 mb-1'>
                        Vendor
                      </p>
                      <p className='text-sm font-medium text-gray-900'>
                        {invoice.supplierName}
                      </p>
                      {invoice.supplierInvoiceNumber && (
                        <p className='text-xs text-gray-500 mt-1'>
                          Ref: {invoice.supplierInvoiceNumber}
                          {invoice.supplierInvoiceDate &&
                            ` (${format(new Date(invoice.supplierInvoiceDate), 'dd/MM/yyyy')})`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bill To / Ship To */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-2'>
                      Bill To
                    </p>
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {invoice.billToAddress || '-'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-2'>
                      Ship To
                    </p>
                    <p className='text-sm text-gray-700 leading-relaxed'>
                      {invoice.shipToAddress || '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Calendar size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Invoice Date
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {invoice.invoiceDate
                          ? format(new Date(invoice.invoiceDate), 'dd/MM/yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Calendar size={14} className='text-red-600' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Due Date
                      </p>
                      <p className='text-sm font-medium text-red-600 mt-0.5'>
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), 'dd/MM/yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        PO Reference
                      </p>
                      <p className='text-sm font-medium text-violet-600 mt-0.5'>
                        {invoice.poNumber || '-'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        GRN Reference
                      </p>
                      <p className='text-sm font-medium text-violet-600 mt-0.5'>
                        {invoice.grnNumber || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className='mb-8'>
              <h3 className='text-base font-semibold text-gray-900 mb-4'>
                Line Items
              </h3>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-12'>
                        #
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Description
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Qty
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Tax
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {invoice.items?.map((item, index) => (
                      <tr
                        key={index}
                        className='hover:bg-gray-50 transition-colors'
                      >
                        <td className='px-4 py-3.5 text-sm text-gray-600 text-center'>
                          {index + 1}
                        </td>
                        <td className='px-4 py-3.5'>
                          <p className='text-sm font-medium text-gray-900'>
                            {item.itemName}
                          </p>
                          <p className='text-xs text-gray-500 mt-0.5'>
                            {item.itemDescription}
                          </p>
                        </td>
                        <td className='px-4 py-3.5 text-right'>
                          <span className='text-sm text-gray-900'>
                            {item.invoiceQuantity}
                          </span>
                          <span className='text-xs text-gray-500 ml-1'>
                            {item.unitOfMeasurement}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-700 text-right'>
                          ₹
                          {item.unitPrice?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600 text-right'>
                          ₹
                          {item.totalTaxAmount?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className='px-4 py-3.5 text-sm font-semibold text-gray-900 text-right'>
                          ₹
                          {item.totalAmount?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className='flex justify-end'>
              <div className='w-80 bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Sub Total</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {invoice.subTotal?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {invoice.taxAmount && invoice.taxAmount > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>Total Tax</span>
                      <span className='font-medium text-gray-900'>
                        ₹
                        {invoice.taxAmount?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  {invoice.freightCharges && invoice.freightCharges > 0 && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-gray-600'>
                        Freight & Other Charges
                      </span>
                      <span className='font-medium text-gray-900'>
                        ₹
                        {invoice.freightCharges?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                  <div className='border-t-2 border-violet-600 pt-3 mt-3'>
                    <div className='flex justify-between'>
                      <span className='text-base font-bold text-gray-900'>
                        Grand Total
                      </span>
                      <span className='text-lg font-bold text-violet-600'>
                        ₹
                        {invoice.grandTotal?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  {invoice.balanceAmount && invoice.balanceAmount > 0 && (
                    <div className='flex justify-between text-sm pt-2'>
                      <span className='text-gray-600'>Balance Due</span>
                      <span className='font-semibold text-red-600'>
                        ₹
                        {invoice.balanceAmount?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='mt-12 pt-6 border-t border-gray-200 text-center'>
              <p className='text-xs text-gray-400'>
                This is a system-generated invoice from Autovitica P2P
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                Printed on:{' '}
                {new Date().toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          @page {
            margin: 0.5in;
            size: A4;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:p-0 {
            padding: 0 !important;
          }

          .print\\:max-w-none {
            max-width: none !important;
          }

          .print\\:border-0 {
            border: 0 !important;
          }

          .print\\:rounded-none {
            border-radius: 0 !important;
          }

          .print\\:p-12 {
            padding: 3rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default InvoicePreviewPage;
