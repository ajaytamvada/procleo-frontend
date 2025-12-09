import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useInvoicesForGRN,
  useInvoiceDetailsForGRN,
  useCreateGRN,
} from '../hooks/useGRN';
import type {
  CreateGRNRequest,
  GRNItemRequest,
  InvoiceItemForGRN,
} from '../types';

interface GRNItemForm extends GRNItemRequest {
  itemName: string;
  itemCode?: string;
  poQuantity: number;
  invoiceQuantity: number;
  alreadyReceived: number;
  remainingQuantity: number;
  unitOfMeasurement?: string;
  unitPrice: number;
}

const CreateGRNPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(
    null
  );
  const [receivedDate, setReceivedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [warehouseLocation, setWarehouseLocation] = useState('');
  const [deliveryChallanNumber, setDeliveryChallanNumber] = useState('');
  const [deliveryChallanDate, setDeliveryChallanDate] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [transporterName, setTransporterName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<GRNItemForm[]>([]);

  // Queries
  const { data: availableInvoices, isLoading: isLoadingInvoices } =
    useInvoicesForGRN();
  const { data: invoiceDetails } = useInvoiceDetailsForGRN(selectedInvoiceId);
  const createMutation = useCreateGRN();

  // Load invoice items when invoice is selected
  useEffect(() => {
    if (invoiceDetails && invoiceDetails.items) {
      const formItems: GRNItemForm[] = invoiceDetails.items.map(
        (item: InvoiceItemForGRN) => ({
          invoiceItemId: item.invoiceItemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          poQuantity: item.poQuantity,
          invoiceQuantity: item.invoiceQuantity,
          alreadyReceived: item.receivedQuantity,
          remainingQuantity: item.remainingQuantity,
          receivedQuantity: item.remainingQuantity,
          acceptedQuantity: item.remainingQuantity,
          rejectedQuantity: 0,
          unitOfMeasurement: item.unitOfMeasurement,
          unitPrice: item.unitPrice,
          batchNumber: '',
          serialNumber: '',
          storageLocation: warehouseLocation,
          qualityStatus: 'PENDING',
        })
      );
      setItems(formItems);
    }
  }, [invoiceDetails, warehouseLocation]);

  const handleItemChange = (
    index: number,
    field: keyof GRNItemForm,
    value: any
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    (item as any)[field] = value;

    // Auto-calculate accepted quantity when received quantity changes
    if (field === 'receivedQuantity') {
      item.acceptedQuantity = value;
      item.rejectedQuantity = 0;
    }

    // Recalculate rejected when accepted changes
    if (field === 'acceptedQuantity') {
      item.rejectedQuantity = item.receivedQuantity - value;
    }

    setItems(updatedItems);
  };

  const validateForm = (): boolean => {
    if (!selectedInvoiceId) {
      toast.error('Please select an invoice');
      return false;
    }

    if (!receivedDate) {
      toast.error('Please enter received date');
      return false;
    }

    if (items.length === 0) {
      toast.error('No items to receive');
      return false;
    }

    // Check if any item has received quantity > 0
    const hasReceivedItems = items.some(item => item.receivedQuantity > 0);
    if (!hasReceivedItems) {
      toast.error('Please enter received quantity for at least one item');
      return false;
    }

    // Validate received quantities
    for (const item of items) {
      if (item.receivedQuantity > item.remainingQuantity) {
        toast.error(
          `Received quantity cannot exceed remaining quantity for ${item.itemName}`
        );
        return false;
      }

      if (
        (item.acceptedQuantity || 0) + (item.rejectedQuantity || 0) !==
        item.receivedQuantity
      ) {
        toast.error(
          `Accepted + Rejected must equal Received quantity for ${item.itemName}`
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (isDraft: boolean) => {
    if (!validateForm()) return;

    const request: CreateGRNRequest = {
      invoiceId: selectedInvoiceId!,
      receivedDate,
      warehouseLocation: warehouseLocation || undefined,
      deliveryChallanNumber: deliveryChallanNumber || undefined,
      deliveryChallanDate: deliveryChallanDate || undefined,
      vehicleNumber: vehicleNumber || undefined,
      transporterName: transporterName || undefined,
      grnType: 'STANDARD',
      remarks: remarks || undefined,
      items: items
        .filter(item => item.receivedQuantity > 0)
        .map(item => ({
          invoiceItemId: item.invoiceItemId,
          receivedQuantity: item.receivedQuantity,
          acceptedQuantity: item.acceptedQuantity,
          rejectedQuantity: item.rejectedQuantity,
          batchNumber: item.batchNumber || undefined,
          serialNumber: item.serialNumber || undefined,
          expiryDate: item.expiryDate || undefined,
          storageLocation: item.storageLocation || undefined,
          binNumber: item.binNumber || undefined,
          qualityStatus: item.qualityStatus,
          qualityRemarks: item.qualityRemarks || undefined,
          remarks: item.remarks || undefined,
        })),
      isDraft,
    };

    await createMutation.mutateAsync(request);
    navigate('/grn/modify');
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Create GRN</h1>
        <p className='text-sm text-gray-500 mt-1'>
          Create Goods Receipt Note from invoice
        </p>
      </div>

      {/* Invoice Selection */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Invoice Selection
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invoice Number <span className='text-red-500'>*</span>
              </label>
              {isLoadingInvoices ? (
                <div className='text-sm text-gray-500'>Loading invoices...</div>
              ) : (
                <select
                  value={selectedInvoiceId || ''}
                  onChange={e => setSelectedInvoiceId(Number(e.target.value))}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  required
                >
                  <option value=''>Select Invoice</option>
                  {availableInvoices?.map(invoice => (
                    <option key={invoice.invoiceId} value={invoice.invoiceId}>
                      {invoice.invoiceNumber} - {invoice.supplierName} (
                      {invoice.invoiceDate})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Received Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                required
              />
            </div>
          </div>

          {invoiceDetails && (
            <div className='mt-4 p-4 bg-blue-50 rounded-lg'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                <div>
                  <span className='text-gray-600'>PO Number:</span>
                  <p className='font-semibold'>{invoiceDetails.poNumber}</p>
                </div>
                <div>
                  <span className='text-gray-600'>Supplier:</span>
                  <p className='font-semibold'>{invoiceDetails.supplierName}</p>
                </div>
                <div>
                  <span className='text-gray-600'>Invoice Date:</span>
                  <p className='font-semibold'>{invoiceDetails.invoiceDate}</p>
                </div>
                <div>
                  <span className='text-gray-600'>Invoice Amount:</span>
                  <p className='font-semibold'>
                    ₹{invoiceDetails.invoiceAmount.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Details */}
      {selectedInvoiceId && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Delivery Details
            </h2>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Warehouse Location
                </label>
                <input
                  type='text'
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter warehouse location'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Delivery Challan Number
                </label>
                <input
                  type='text'
                  value={deliveryChallanNumber}
                  onChange={e => setDeliveryChallanNumber(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter challan number'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Delivery Challan Date
                </label>
                <input
                  type='date'
                  value={deliveryChallanDate}
                  onChange={e => setDeliveryChallanDate(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Vehicle Number
                </label>
                <input
                  type='text'
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter vehicle number'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Transporter Name
                </label>
                <input
                  type='text'
                  value={transporterName}
                  onChange={e => setTransporterName(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter transporter name'
                />
              </div>

              <div className='md:col-span-2 lg:col-span-3'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter any remarks'
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      {selectedInvoiceId && items.length > 0 && (
        <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <h2 className='text-lg font-semibold text-gray-900'>
              Items ({items.length})
            </h2>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Qty
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Already Received
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Remaining Qty
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Received Qty *
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Accepted Qty
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Rejected Qty
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Batch/Serial
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {items.map((item, index) => (
                  <tr key={index} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <div>
                        <div className='font-medium text-gray-900'>
                          {item.itemName}
                        </div>
                        {item.itemCode && (
                          <div className='text-xs text-gray-500'>
                            {item.itemCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center text-sm'>
                      {item.poQuantity} {item.unitOfMeasurement}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-blue-600'>
                      {item.alreadyReceived}
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-orange-600'>
                      {item.remainingQuantity}
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.receivedQuantity}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'receivedQuantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min='0'
                        max={item.remainingQuantity}
                        step='0.01'
                        className='w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500'
                      />
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='number'
                        value={item.acceptedQuantity}
                        onChange={e =>
                          handleItemChange(
                            index,
                            'acceptedQuantity',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min='0'
                        max={item.receivedQuantity}
                        step='0.01'
                        className='w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500'
                      />
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-red-600'>
                      {(item.rejectedQuantity || 0).toFixed(2)}
                    </td>
                    <td className='px-4 py-3'>
                      <input
                        type='text'
                        value={item.batchNumber || ''}
                        onChange={e =>
                          handleItemChange(index, 'batchNumber', e.target.value)
                        }
                        placeholder='Batch/Serial'
                        className='w-32 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedInvoiceId && items.length > 0 && (
        <div className='flex justify-end gap-4'>
          <button
            onClick={() => navigate('/grn/modify')}
            className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
            className='px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50'
          >
            <div className='flex items-center gap-2'>
              <Package className='w-4 h-4' />
              Save as Draft
            </div>
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
            className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
          >
            <div className='flex items-center gap-2'>
              <CheckCircle className='w-4 h-4' />
              Create GRN
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateGRNPage;
