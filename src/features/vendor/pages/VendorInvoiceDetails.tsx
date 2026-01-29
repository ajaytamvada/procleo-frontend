import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  AlertCircle,
  Download,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  useVendorInvoiceDetails,
  downloadVendorInvoice,
} from '../hooks/useVendorInvoices';

const VendorInvoiceDetails: React.FC = () => {
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const parsedId = invoiceId ? parseInt(invoiceId) : undefined;

  const { data: invoice, isLoading, error } = useVendorInvoiceDetails(parsedId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = async () => {
    if (invoice?.id && invoice?.invoiceNumber) {
      try {
        await downloadVendorInvoice(invoice.id, invoice.invoiceNumber);
      } catch (e) {
        alert(
          'Failed to download invoice. Please try printing to PDF instead.'
        );
      }
    }
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

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-6'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
              <div>
                <div className='w-40 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-28 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
              </div>
            </div>
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

  if (error || !invoice) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-6'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <button
            onClick={() => navigate('/vendor/invoices')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className='text-xl font-semibold text-gray-900'>
            Invoice Details
          </h1>
        </div>

        {/* Error Card */}
        <div className='bg-white rounded-lg border border-gray-200 p-6 max-w-2xl'>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
              <AlertCircle className='w-5 h-5 text-red-600' />
            </div>
            <div>
              <h3 className='text-base font-semibold text-gray-900'>
                Invoice Not Found
              </h3>
              <p className='text-sm text-gray-500 mt-1'>
                The invoice you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <button
                onClick={() => navigate('/vendor/invoices')}
                className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
              >
                <ArrowLeft size={15} />
                Back to Invoice List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Action Bar (Hidden during print) */}
      <div className='print:hidden p-6 pb-0'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/vendor/invoices')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Invoice #{invoice.invoiceNumber}
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                View and manage invoice details
              </p>
            </div>
          </div>
          <div className='flex items-center gap-2'>
            <button
              onClick={handleDownload}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
            >
              <Download size={15} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
            >
              <Printer size={15} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Print-Ready Document */}
      <div className='max-w-5xl mx-auto px-6 pb-6 print:p-0 print:max-w-none'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden print:border-0 print:rounded-none shadow-sm'>
          <div className='p-8 print:p-12'>
            {/* Document Header */}
            <div className='border-b-2 border-violet-600 pb-6 mb-8'>
              <div className='flex items-start justify-between'>
                <div>
                  <h1 className='text-3xl font-bold text-violet-600 tracking-tight'>
                    INVOICE
                  </h1>
                  <p className='text-sm text-gray-500 mt-1 capitalize'>
                    {invoice.invoiceType?.replace(/_/g, ' ').toLowerCase() ||
                      'Standard Invoice'}
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
              <div className='space-y-8'>
                {/* Vendor Info */}
                <div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Building2 size={16} className='text-violet-600' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1'>
                        Vendor
                      </p>
                      <p className='text-sm font-medium text-gray-900'>
                        {invoice.supplierName}
                      </p>
                      {invoice.supplierInvoiceNumber && (
                        <p className='text-xs text-gray-500 mt-1'>
                          Ref: {invoice.supplierInvoiceNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bill To / Ship To */}
                <div className='grid grid-cols-2 gap-6'>
                  <div>
                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                      Bill To
                    </p>
                    <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
                      {invoice.billToAddress || 'Autovitica HQ'}
                    </p>
                  </div>
                  <div>
                    <p className='text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2'>
                      Ship To
                    </p>
                    <p className='text-sm text-gray-700 leading-relaxed whitespace-pre-line'>
                      {invoice.shipToAddress || 'Autovitica Warehouse'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className='space-y-6'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Calendar size={16} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Invoice Date
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {invoice.invoiceDate
                          ? format(
                              new Date(invoice.invoiceDate),
                              'MMM dd, yyyy'
                            )
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Calendar size={16} className='text-red-600' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Due Date
                      </p>
                      <p className='text-sm font-medium text-red-600 mt-0.5'>
                        {invoice.dueDate
                          ? format(new Date(invoice.dueDate), 'MMM dd, yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <FileText size={16} className='text-gray-500' />
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
                      <FileText size={16} className='text-gray-500' />
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
              <h3 className='text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4'>
                Line Items
              </h3>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-gray-50'>
                      <th className='px-4 py-3 text-center text-xs font-semibold text-gray-600 tracking-wider w-12 border-b border-gray-200'>
                        #
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wider border-b border-gray-200'>
                        Description
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider border-b border-gray-200'>
                        Qty
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider border-b border-gray-200'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider border-b border-gray-200'>
                        Tax
                      </th>
                      <th className='px-4 py-3 text-right text-xs font-semibold text-gray-600 tracking-wider border-b border-gray-200'>
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
              <div className='w-full max-w-sm bg-gray-50 rounded-lg p-6 border border-gray-200'>
                <div className='space-y-3'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-gray-600'>Sub Total</span>
                    <span className='font-medium text-gray-900'>
                      ₹
                      {invoice.subTotal?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00'}
                    </span>
                  </div>
                  {invoice.taxAmount !== undefined && invoice.taxAmount > 0 && (
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
                  {invoice.freightCharges !== undefined &&
                    invoice.freightCharges > 0 && (
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
                  <div className='border-t-2 border-violet-600 pt-4 mt-2'>
                    <div className='flex justify-between items-baseline'>
                      <span className='text-base font-bold text-gray-900'>
                        Grand Total
                      </span>
                      <span className='text-xl font-bold text-violet-600'>
                        ₹
                        {invoice.grandTotal?.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                  {invoice.balanceAmount !== undefined &&
                    invoice.balanceAmount > 0 && (
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
            <div className='mt-16 pt-8 border-t border-gray-200 text-center'>
              <p className='text-xs text-gray-400 uppercase tracking-wider mb-2'>
                System Generated
              </p>
              <p className='text-xs text-gray-500'>
                This is a digitally generated invoice from Autovitica P2P
                Portal.
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
            background-color: white;
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
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VendorInvoiceDetails;
