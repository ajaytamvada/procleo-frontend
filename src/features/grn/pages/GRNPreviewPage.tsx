import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  Package,
  Building2,
  Calendar,
  FileText,
  Truck,
  AlertCircle,
} from 'lucide-react';
import { GRN, GRNStatus, GRNType } from '../../purchaseorder/types';
import { format } from 'date-fns';

export const GRNPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [grn, setGrn] = useState<GRN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGRN = async () => {
      setLoading(true);
      try {
        const mockGRN: GRN = {
          id: id ? parseInt(id) : 1,
          grnNumber: 'GRN/2024-2025/001',
          poId: 1,
          poNumber: 'PO/2024-2025/001',
          poDate: '2024-09-08',
          supplierId: 1,
          supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
          receivedDate: '2024-09-15',
          receivedBy: 'Warehouse Manager',
          warehouseLocation: 'Main Warehouse - Section A',
          deliveryChallanNumber: 'DC/2024/1234',
          deliveryChallanDate: '2024-09-15',
          vehicleNumber: 'KA-01-AB-1234',
          transporterName: 'Fast Logistics',
          status: GRNStatus.APPROVED,
          grnType: GRNType.STANDARD,
          qualityCheckStatus: 'PASSED',
          totalReceivedValue: 496000,
          createdBy: 'John Doe',
          createdDate: '2024-09-15',
          remarks: 'Received in good condition.',
          items: [
            {
              id: 1,
              itemName: 'Bitumen Sprayer',
              itemCode: 'EQ-BS-001',
              itemDescription:
                'High capacity bitumen sprayer with automated control',
              poQuantity: 1,
              receivedQuantity: 1,
              acceptedQuantity: 1,
              rejectedQuantity: 0,
              unitOfMeasurement: 'NOS',
              unitPrice: 450000,
              totalValue: 450000,
              qualityStatus: 'Passed',
              qualityRemarks: 'Operation tested OK',
            },
            {
              id: 2,
              itemName: 'Spray Nozzle Set',
              itemCode: 'SP-NZ-005',
              itemDescription: 'Spare nozzle set for sprayer',
              poQuantity: 5,
              receivedQuantity: 5,
              acceptedQuantity: 4,
              rejectedQuantity: 1,
              unitOfMeasurement: 'SET',
              unitPrice: 9200,
              totalValue: 46000,
              qualityStatus: 'Partial Failure',
              qualityRemarks: 'One nozzle damaged',
            },
          ],
        };

        setTimeout(() => {
          setGrn(mockGRN);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching GRN:', error);
        setLoading(false);
      }
    };

    fetchGRN();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'REJECTED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'PENDING_APPROVAL':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'QUALITY_CHECK_PENDING':
        return 'bg-violet-50 text-violet-700 border-violet-200';
      case 'QUALITY_CHECK_PASSED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'QUALITY_CHECK_FAILED':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'DRAFT':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getQualityStatusColor = (status?: string) => {
    switch (status?.toUpperCase()) {
      case 'PASSED':
        return 'text-green-600';
      case 'FAILED':
      case 'PARTIAL FAILURE':
        return 'text-red-600';
      case 'PENDING':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
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
                Loading GRN details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!grn) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/grn/list')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>GRN Preview</h1>
          </div>

          {/* Error Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-2 max-w-2xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-900'>
                  GRN Not Found
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  The GRN you're looking for doesn't exist or has been removed.
                </p>
                <button
                  onClick={() => navigate('/grn/list')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Back to GRN List
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
              onClick={() => navigate('/grn/list')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                GRN Preview
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>{grn.grnNumber}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Printer size={15} />
            Print GRN
          </button>
        </div>
      </div>

      {/* Print-Ready Document */}
      <div className='max-w-5xl mx-auto px-6 pb-6 print:p-0 print:max-w-none'>
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden print:border-0 print:rounded-none'>
          <div className='p-8 print:p-12'>
            {/* Document Header */}
            <div className='border-b-2 border-violet-600 pb-6 mb-8'>
              <div className='flex items-start justify-between'>
                <div>
                  <h1 className='text-2xl font-bold text-violet-600'>
                    GOODS RECEIPT NOTE
                  </h1>
                  <p className='text-sm text-gray-500 mt-1'>
                    Autovitica Procurement System
                  </p>
                </div>
                <div className='text-right'>
                  <p className='text-lg font-bold text-gray-900'>
                    {grn.grnNumber}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border mt-2 ${getStatusColor(grn.status)}`}
                  >
                    {grn.status?.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
              {/* Left Column */}
              <div className='space-y-6'>
                {/* Supplier Info */}
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <Building2 size={14} className='text-violet-600' />
                  </div>
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-1'>
                      Supplier Details
                    </p>
                    <p className='text-sm font-medium text-gray-900'>
                      {grn.supplierName}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      ID: {grn.supplierId}
                    </p>
                  </div>
                </div>

                {/* PO Info */}
                <div className='flex items-start gap-3'>
                  <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                    <FileText size={14} className='text-gray-500' />
                  </div>
                  <div>
                    <p className='text-xs font-medium text-gray-500 mb-1'>
                      Purchase Order
                    </p>
                    <p className='text-sm font-medium text-violet-600'>
                      {grn.poNumber}
                    </p>
                    <p className='text-xs text-gray-500 mt-0.5'>
                      Date:{' '}
                      {grn.poDate
                        ? format(new Date(grn.poDate), 'dd/MM/yyyy')
                        : '-'}
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
                        Received Date
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {grn.receivedDate
                          ? format(new Date(grn.receivedDate), 'dd/MM/yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Package size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Received By
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {grn.receivedBy || '-'}
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
                        Delivery Challan
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {grn.deliveryChallanNumber || '-'}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-3'>
                    <div className='w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                      <Truck size={14} className='text-gray-500' />
                    </div>
                    <div>
                      <p className='text-xs font-medium text-gray-500'>
                        Vehicle Number
                      </p>
                      <p className='text-sm font-medium text-gray-900 mt-0.5'>
                        {grn.vehicleNumber || '-'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Warehouse Info Card */}
            <div className='bg-gray-50 rounded-lg border border-gray-200 p-4 mb-8'>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Warehouse Location
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {grn.warehouseLocation || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Transporter
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    {grn.transporterName || '-'}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Quality Check Status
                  </p>
                  <p
                    className={`text-sm font-semibold ${getQualityStatusColor(grn.qualityCheckStatus)}`}
                  >
                    {grn.qualityCheckStatus || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className='mb-8'>
              <h3 className='text-base font-semibold text-gray-900 mb-4'>
                Received Items
              </h3>
              <div className='border border-gray-200 rounded-lg overflow-hidden'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-12'>
                        #
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Item Details
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        PO Qty
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Received
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Accepted
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Rejected
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                        Quality Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {grn.items?.map((item, index) => (
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
                            {item.itemCode || '-'}
                          </p>
                          <p className='text-xs text-gray-400 mt-0.5'>
                            {item.itemDescription}
                          </p>
                        </td>
                        <td className='px-4 py-3.5 text-right'>
                          <span className='text-sm text-gray-700'>
                            {item.poQuantity}
                          </span>
                          <span className='text-xs text-gray-500 ml-1'>
                            {item.unitOfMeasurement}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-right'>
                          <span className='text-sm font-semibold text-blue-600'>
                            {item.receivedQuantity}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-right'>
                          <span className='text-sm font-semibold text-green-600'>
                            {item.acceptedQuantity}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-right'>
                          <span className='text-sm font-semibold text-red-600'>
                            {item.rejectedQuantity}
                          </span>
                        </td>
                        <td className='px-4 py-3.5 text-sm text-gray-600'>
                          {item.qualityRemarks || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Value */}
            <div className='flex justify-end mb-8'>
              <div className='w-80 bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <div className='flex justify-between'>
                  <span className='text-base font-bold text-gray-900'>
                    Total Received Value
                  </span>
                  <span className='text-lg font-bold text-violet-600'>
                    ₹
                    {grn.totalReceivedValue?.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Remarks */}
            {grn.remarks && (
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8'>
                <p className='text-sm font-semibold text-amber-800 mb-1'>
                  General Remarks
                </p>
                <p className='text-sm text-amber-700'>{grn.remarks}</p>
              </div>
            )}

            {/* Footer */}
            <div className='mt-12 pt-6 border-t border-gray-200 text-center'>
              <p className='text-xs text-gray-400'>
                This is a system-generated GRN document from Autovitica P2P
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

export default GRNPreviewPage;
