import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, CheckCircle, ChevronDown } from 'lucide-react';
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

    const hasReceivedItems = items.some(item => item.receivedQuantity > 0);
    if (!hasReceivedItems) {
      toast.error('Please enter received quantity for at least one item');
      return false;
    }

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
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/grn/modify')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>Create GRN</h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Create Goods Receipt Note from invoice
            </p>
          </div>
        </div>
        {selectedInvoiceId && items.length > 0 && (
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/grn/modify')}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={createMutation.isPending}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-white border border-violet-200 rounded-md hover:bg-violet-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Package size={15} />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={createMutation.isPending}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <CheckCircle size={15} />
              Create GRN
            </button>
          </div>
        )}
      </div>

      {/* Invoice Selection Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
        <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
          <h2 className='text-base font-semibold text-gray-900'>
            Invoice Selection
          </h2>
        </div>
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Invoice Number
              </label>
              {isLoadingInvoices ? (
                <div className='flex items-center gap-2 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                  <div className='animate-spin rounded-full h-4 w-4 border-2 border-violet-600 border-t-transparent'></div>
                  <span className='text-sm text-gray-500'>
                    Loading invoices...
                  </span>
                </div>
              ) : (
                <div className='relative'>
                  <select
                    value={selectedInvoiceId || ''}
                    onChange={e => setSelectedInvoiceId(Number(e.target.value))}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              )}
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Received Date
              </label>
              <input
                type='date'
                value={receivedDate}
                onChange={e => setReceivedDate(e.target.value)}
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                required
              />
            </div>
          </div>

          {invoiceDetails && (
            <div className='mt-6 p-4 bg-violet-50 rounded-lg border border-violet-100'>
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    PO Number
                  </p>
                  <p className='text-sm font-semibold text-violet-600'>
                    {invoiceDetails.poNumber}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Supplier
                  </p>
                  <p className='text-sm font-medium text-gray-900'>
                    {invoiceDetails.supplierName}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Invoice Date
                  </p>
                  <p className='text-sm font-medium text-gray-900'>
                    {invoiceDetails.invoiceDate}
                  </p>
                </div>
                <div>
                  <p className='text-xs font-medium text-gray-500 mb-1'>
                    Invoice Amount
                  </p>
                  <p className='text-sm font-semibold text-gray-900'>
                    ₹
                    {invoiceDetails.invoiceAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delivery Details Card */}
      {selectedInvoiceId && (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <h2 className='text-base font-semibold text-gray-900'>
              Delivery Details
            </h2>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Warehouse Location
                </label>
                <input
                  type='text'
                  value={warehouseLocation}
                  onChange={e => setWarehouseLocation(e.target.value)}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  placeholder='Enter any remarks'
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table Card */}
      {selectedInvoiceId && items.length > 0 && (
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc] flex items-center justify-between'>
            <h2 className='text-base font-semibold text-gray-900'>Items</h2>
            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700'>
              {items.length} items
            </span>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Item Name
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    PO Qty
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Already Received
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Remaining Qty
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Received Qty *
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Accepted Qty
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Rejected Qty
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Batch/Serial
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {items.map((item, index) => (
                  <tr
                    key={index}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3.5'>
                      <div>
                        <p className='text-sm font-medium text-gray-900'>
                          {item.itemName}
                        </p>
                        {item.itemCode && (
                          <p className='text-xs text-gray-500 mt-0.5'>
                            {item.itemCode}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {item.poQuantity}{' '}
                      <span className='text-xs text-gray-400'>
                        {item.unitOfMeasurement}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <span className='text-sm font-medium text-blue-600'>
                        {item.alreadyReceived}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <span className='text-sm font-semibold text-amber-600'>
                        {item.remainingQuantity}
                      </span>
                    </td>
                    <td className='px-4 py-3.5'>
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
                        className='w-24 px-3 py-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      />
                    </td>
                    <td className='px-4 py-3.5'>
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
                        className='w-24 px-3 py-2 text-sm text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      />
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <span className='text-sm font-medium text-red-600'>
                        {(item.rejectedQuantity || 0).toFixed(2)}
                      </span>
                    </td>
                    <td className='px-4 py-3.5'>
                      <input
                        type='text'
                        value={item.batchNumber || ''}
                        onChange={e =>
                          handleItemChange(index, 'batchNumber', e.target.value)
                        }
                        placeholder='Batch/Serial'
                        className='w-32 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateGRNPage;
