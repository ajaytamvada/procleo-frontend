import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Printer, ArrowLeft, Search } from 'lucide-react';
import { GRN, GRNStatus, GRNType } from '../../purchaseorder/types';
import { format } from 'date-fns';

export const GRNPreviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [grn, setGrn] = useState<GRN | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching GRN details
    // In a real app, this would be an API call hook like useGRN(id)
    const fetchGRN = async () => {
      setLoading(true);
      try {
        // Mock data similar to GRNListPage
        // For demonstration, we return a mock object that matches the requested ID or a default one
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

        // Simulate network delay
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
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'PENDING_APPROVAL':
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

  if (!grn) {
    return (
      <div className='text-center py-12'>
        <h3 className='text-lg font-medium text-gray-900'>GRN Not Found</h3>
        <button
          onClick={() => navigate('/grn/list')}
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
          onClick={() => navigate('/grn/list')}
          className='flex items-center text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-2' />
          Back to GRN List
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
            <h1 className='text-3xl font-bold text-gray-900'>
              Goods Receipt Note
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              Autovitica Procurement System
            </p>
          </div>
          <div className='text-right'>
            <div className='text-2xl font-semibold text-gray-900'>
              {grn.grnNumber}
            </div>
            <div
              className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(grn.status)}`}
            >
              {grn.status?.replace(/_/g, ' ')}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8'>
          <div className='space-y-4'>
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Supplier Details
              </label>
              <div className='mt-1 font-medium text-gray-900'>
                {grn.supplierName}
              </div>
              <div className='text-sm text-gray-600'>ID: {grn.supplierId}</div>
            </div>
            <div>
              <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                Purchase Order
              </label>
              <div className='mt-1 font-medium text-blue-600'>
                {grn.poNumber}
              </div>
              <div className='text-sm text-gray-600'>
                Date:{' '}
                {grn.poDate ? format(new Date(grn.poDate), 'dd/MM/yyyy') : '-'}
              </div>
            </div>
          </div>

          <div className='space-y-4'>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Received Date
                </label>
                <div className='mt-1 text-gray-900'>
                  {grn.receivedDate
                    ? format(new Date(grn.receivedDate), 'dd/MM/yyyy')
                    : '-'}
                </div>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Received By
                </label>
                <div className='mt-1 text-gray-900'>
                  {grn.receivedBy || '-'}
                </div>
              </div>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Delivery Challan
                </label>
                <div className='mt-1 text-gray-900'>
                  {grn.deliveryChallanNumber || '-'}
                </div>
              </div>
              <div>
                <label className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>
                  Vehicle Number
                </label>
                <div className='mt-1 text-gray-900'>
                  {grn.vehicleNumber || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse Info */}
        <div className='bg-gray-50 rounded-md p-4 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='text-xs font-medium text-gray-500'>
                Warehouse Location
              </label>
              <div className='text-sm font-semibold text-gray-900'>
                {grn.warehouseLocation || '-'}
              </div>
            </div>
            <div>
              <label className='text-xs font-medium text-gray-500'>
                Transporter
              </label>
              <div className='text-sm font-semibold text-gray-900'>
                {grn.transporterName || '-'}
              </div>
            </div>
            <div>
              <label className='text-xs font-medium text-gray-500'>
                Quality Check Status
              </label>
              <div
                className={`text-sm font-semibold ${grn.qualityCheckStatus === 'PASSED' ? 'text-green-600' : 'text-gray-900'}`}
              >
                {grn.qualityCheckStatus || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className='mb-8'>
          <h3 className='text-lg font-bold text-gray-900 mb-4'>
            Received Items
          </h3>
          <div className='overflow-hidden border border-gray-200 rounded-lg'>
            <table className='min-w-full divide-y divide-gray-200'>
              <thead className='bg-gray-50'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
                    #
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Item Details
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    PO Qty
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Received
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Accepted
                  </th>
                  <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Rejected
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Quality Remarks
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {grn.items?.map((item, index) => (
                  <tr key={index}>
                    <td className='px-4 py-3 text-sm text-gray-500'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm font-medium text-gray-900'>
                        {item.itemName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.itemCode || '-'}
                      </div>
                      <div className='text-xs text-gray-500 mt-0.5'>
                        {item.itemDescription}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900 text-right'>
                      {item.poQuantity}{' '}
                      <span className='text-xs text-gray-500'>
                        {item.unitOfMeasurement}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-sm text-blue-700 font-semibold text-right'>
                      {item.receivedQuantity}
                    </td>
                    <td className='px-4 py-3 text-sm text-green-700 font-semibold text-right'>
                      {item.acceptedQuantity}
                    </td>
                    <td className='px-4 py-3 text-sm text-red-600 font-semibold text-right'>
                      {item.rejectedQuantity}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-600'>
                      {item.qualityRemarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Remarks */}
        {grn.remarks && (
          <div className='border-t border-gray-200 pt-6'>
            <label className='text-sm font-medium text-gray-900'>
              General Remarks:
            </label>
            <p className='mt-1 text-sm text-gray-600'>{grn.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GRNPreviewPage;
