import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Package,
  DollarSign,
  Send,
  AlertCircle,
  Loader2,
  CheckCircle,
} from 'lucide-react';
import {
  useVendorOrder,
  useVendorPOItemsForInvoicing,
  useCreateVendorInvoice,
  VendorInvoiceItem,
} from '../hooks/useVendorPortal';
import toast from 'react-hot-toast';

interface InvoiceItemForm {
  poItemId: number;
  itemName: string;
  itemCode?: string;
  poQuantity: number;
  remainingQuantity: number;
  invoiceQuantity: number;
  unitPrice: number;
  uom?: string;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  otherTaxRate: number;
  taxAmount: number;
  totalAmount: number;
  remarks: string;
}

const VendorInvoiceCreatePage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>(); // Actually using query param, but better to use URLSearchParams
  const navigate = useNavigate();

  // Get PO ID from URL query params manually since it's not a route param in the path proposed
  const queryParams = new URLSearchParams(window.location.search);
  const poIdParam = queryParams.get('poId');
  const poIdNum = poIdParam ? parseInt(poIdParam, 10) : undefined;

  const {
    data: order,
    isLoading: orderLoading,
    error: orderError,
  } = useVendorOrder(poIdNum);
  const {
    data: poItems,
    isLoading: itemsLoading,
    error: itemsError,
  } = useVendorPOItemsForInvoicing(poIdNum);
  const createInvoiceMutation = useCreateVendorInvoice();

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // Initialize items when data is loaded
  useEffect(() => {
    if (poItems && poItems.length > 0) {
      const initialItems: InvoiceItemForm[] = poItems.map(
        (item: VendorInvoiceItem) => ({
          poItemId: item.poItemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          poQuantity: item.poQuantity,
          remainingQuantity: item.remainingQuantity,
          invoiceQuantity: item.remainingQuantity, // Default to full remaining
          unitPrice: item.unitPrice,
          uom: item.unitOfMeasurement,
          cgstRate: item.cgstRate || 0,
          sgstRate: item.sgstRate || 0,
          igstRate: item.igstRate || 0,
          otherTaxRate: item.otherTaxRate || 0,
          taxAmount: 0,
          totalAmount: 0,
          remarks: '',
        })
      );
      setItems(initialItems);
    }
  }, [poItems]);

  // Calculate totals whenever inputs change
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalTax = 0;

    const calculatedItems = items.map(item => {
      const baseTotal = item.invoiceQuantity * item.unitPrice;
      const totalTaxRate =
        item.cgstRate + item.sgstRate + item.igstRate + item.otherTaxRate;
      const itemTax = (baseTotal * totalTaxRate) / 100;
      const itemTotal = baseTotal + itemTax;

      subtotal += baseTotal;
      totalTax += itemTax;

      return { ...item, taxAmount: itemTax, totalAmount: itemTotal };
    });

    return {
      subtotal,
      taxAmount: totalTax,
      grandTotal: subtotal + totalTax,
      calculatedItems,
    };
  }, [items]);

  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseFloat(value) || 0;
    setItems(prev => {
      const updated = [...prev];
      // Ensure strictly positive and not more than remaining
      const validQty = Math.min(
        Math.max(0, qty),
        updated[index].remainingQuantity
      );
      updated[index] = { ...updated[index], invoiceQuantity: validQty };
      return updated;
    });
  };

  const handleRemarksChange = (index: number, value: string) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], remarks: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poIdNum || !order) return;

    if (!invoiceNumber.trim()) {
      toast.error('Please enter an invoice number');
      return;
    }

    // Filter items with quantity > 0
    const itemsToSubmit = items
      .filter(item => item.invoiceQuantity > 0)
      .map(item => ({
        poItemId: item.poItemId,
        invoiceQuantity: item.invoiceQuantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        otherTaxRate: item.otherTaxRate,
        remarks: item.remarks,
      }));

    if (itemsToSubmit.length === 0) {
      toast.error(
        'Please include at least one item with quantity greater than 0'
      );
      return;
    }

    createInvoiceMutation.mutate(
      {
        poId: poIdNum,
        invoiceNumber,
        invoiceDate,
        supplierId: order.supplierId || 0, // Backend will validate/override
        remarks,
        items: itemsToSubmit,
      },
      {
        onSuccess: () => {
          navigate('/vendor/invoices'); // Or back to order details
        },
      }
    );
  };

  if (orderLoading || itemsLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-violet-600' />
      </div>
    );
  }

  if (orderError || itemsError || !order) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3'>
          <AlertCircle className='w-5 h-5 text-red-500 flex-shrink-0 mt-0.5' />
          <div>
            <h3 className='font-medium text-red-800'>Error Loading Data</h3>
            <p className='text-red-600 text-sm mt-1'>
              Unable to load Purchase Order details. Please try again.
            </p>
            <Link
              to='/vendor/orders'
              className='text-red-700 hover:text-red-800 text-sm font-medium mt-2 inline-block'
            >
              ← Back to Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-7xl mx-auto space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Link
            to={`/vendor/orders/${poIdNum}`}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </Link>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Create Invoice</h1>
            <p className='text-gray-500'>For PO: {order.poNumber}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* Invoice Details Card */}
        <div className='bg-white border rounded-lg overflow-hidden'>
          <div className='p-4 border-b bg-gray-50 flex items-center gap-2'>
            <FileText className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              Invoice Details
            </h2>
          </div>
          <div className='p-6 grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invoice Number <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                value={invoiceNumber}
                onChange={e => setInvoiceNumber(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                placeholder='Enter invoice number'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Invoice Date <span className='text-red-500'>*</span>
              </label>
              <input
                type='date'
                value={invoiceDate}
                onChange={e => setInvoiceDate(e.target.value)}
                min={
                  order.poDate
                    ? new Date(order.poDate).toISOString().split('T')[0]
                    : undefined
                }
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                required
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Remarks
              </label>
              <input
                type='text'
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                placeholder='Optional remarks'
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className='bg-white border rounded-lg overflow-hidden'>
          <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Package className='w-5 h-5 text-violet-600' />
              <h2 className='text-lg font-semibold text-gray-900'>
                Line Items
              </h2>
            </div>
            <div className='text-sm text-gray-500'>
              Remaining items available for invoicing
            </div>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    UOM
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Qty
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Remaining
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Unit Price
                  </th>
                  <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase min-w-[120px]'>
                    Invoice Qty
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Tax
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {totals.calculatedItems.map((item, index) => (
                  <tr
                    key={item.poItemId}
                    className={
                      item.remainingQuantity === 0
                        ? 'bg-gray-50 opacity-60'
                        : 'hover:bg-gray-50'
                    }
                  >
                    <td className='px-6 py-4'>
                      <div className='font-medium text-gray-900'>
                        {item.itemName}
                      </div>
                      {item.itemCode && (
                        <div className='text-sm text-gray-500'>
                          {item.itemCode}
                        </div>
                      )}
                      <input
                        type='text'
                        value={item.remarks}
                        onChange={e =>
                          handleRemarksChange(index, e.target.value)
                        }
                        placeholder='Remarks for item...'
                        className='mt-1 w-full text-xs px-2 py-1 border rounded focus:ring-1 focus:ring-violet-500'
                      />
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-gray-600'>
                      {item.uom}
                    </td>
                    <td className='px-6 py-4 text-center text-sm text-gray-900'>
                      {item.poQuantity}
                    </td>
                    <td className='px-6 py-4 text-center text-sm font-medium text-violet-600'>
                      {item.remainingQuantity}
                    </td>
                    <td className='px-6 py-4 text-right text-sm text-gray-900'>
                      ₹
                      {item.unitPrice.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className='px-6 py-4'>
                      <input
                        type='number'
                        value={item.invoiceQuantity}
                        onChange={e =>
                          handleQuantityChange(index, e.target.value)
                        }
                        className='w-full px-3 py-1 border rounded text-center focus:ring-2 focus:ring-violet-500'
                        min='0'
                        max={item.remainingQuantity}
                        step='0.01'
                        disabled={item.remainingQuantity <= 0}
                      />
                    </td>
                    <td className='px-6 py-4 text-right text-sm text-gray-600'>
                      ₹
                      {item.taxAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                      <div className='text-xs text-gray-400'>
                        {item.cgstRate +
                          item.sgstRate +
                          item.igstRate +
                          item.otherTaxRate}
                        %
                      </div>
                    </td>
                    <td className='px-6 py-4 text-right text-sm font-medium text-gray-900'>
                      ₹
                      {item.totalAmount.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))}
                {totals.calculatedItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-6 py-8 text-center text-gray-500'
                    >
                      No items available for invoicing.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Card */}
        <div className='flex justify-end'>
          <div className='w-full md:w-1/3 bg-white border rounded-lg p-6 space-y-3'>
            <div className='flex justify-between text-gray-600'>
              <span>Subtotal</span>
              <span>
                ₹
                {totals.subtotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className='flex justify-between text-gray-600'>
              <span>Total Tax</span>
              <span>
                ₹
                {totals.taxAmount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className='pt-3 border-t flex justify-between font-bold text-lg text-gray-900'>
              <span>Grand Total</span>
              <span className='text-violet-600'>
                ₹
                {totals.grandTotal.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>

            <button
              type='submit'
              disabled={
                createInvoiceMutation.isPending || totals.grandTotal <= 0
              }
              className='w-full mt-4 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {createInvoiceMutation.isPending ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <Send className='w-5 h-5' />
              )}
              Submit Invoice
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default VendorInvoiceCreatePage;
