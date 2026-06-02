import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInvoiceById, updateEmailInvoice } from '../api/invoiceApi';
import type { Invoice, UpdateDirectInvoiceRequest } from '../types';

interface ItemForm {
  id?: number;
  itemName: string;
  itemCode: string;
  hsnSacCode: string;
  quantity: number;
  unitPrice: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  otherTaxRate: number;
  remarks: string;
  // calculated
  baseAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  totalAmount: number;
}

const calcItem = (item: ItemForm): ItemForm => {
  const baseAmount = item.quantity * item.unitPrice;
  const cgstAmount = (baseAmount * (item.cgstRate || 0)) / 100;
  const sgstAmount = (baseAmount * (item.sgstRate || 0)) / 100;
  const igstAmount = (baseAmount * (item.igstRate || 0)) / 100;
  const totalTax = cgstAmount + sgstAmount + igstAmount;
  return {
    ...item,
    baseAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTax,
    totalAmount: baseAmount + totalTax,
  };
};

const emptyItem = (): ItemForm =>
  calcItem({
    itemName: '',
    itemCode: '',
    hsnSacCode: '',
    quantity: 1,
    unitPrice: 0,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    otherTaxRate: 0,
    remarks: '',
    baseAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTax: 0,
    totalAmount: 0,
  });

export default function EditEmailInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  // Form state
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [supplierId, setSupplierId] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [supplierCode, setSupplierCode] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<ItemForm[]>([]);

  // Load invoice
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await getInvoiceById(Number(id));
        setInvoice(data);
        setInvoiceNumber(data.invoiceNumber || '');
        setInvoiceDate(data.invoiceDate || '');
        setSupplierId(data.supplierId || 0);
        setSupplierName(data.supplierName || '');
        setSupplierCode(data.supplierCode || '');
        setDueDate(data.dueDate || '');
        setPaymentTerms(data.paymentTerms || '');
        setCurrency(data.currency || 'INR');
        setRemarks(data.remarks || '');

        // Map existing items to form
        if (data.items && data.items.length > 0) {
          setItems(
            data.items.map(item =>
              calcItem({
                id: item.id,
                itemName: item.itemName || '',
                itemCode: item.itemCode || '',
                hsnSacCode: item.hsnSacCode || '',
                quantity: item.invoiceQuantity || 0,
                unitPrice: item.unitPrice || 0,
                cgstRate: item.cgstRate || 0,
                sgstRate: item.sgstRate || 0,
                igstRate: item.igstRate || 0,
                otherTaxRate: item.otherTaxRate || 0,
                remarks: item.remarks || '',
                baseAmount: 0,
                cgstAmount: 0,
                sgstAmount: 0,
                igstAmount: 0,
                totalTax: 0,
                totalAmount: 0,
              })
            )
          );
        } else {
          setItems([emptyItem()]);
        }
      } catch (err) {
        toast.error('Failed to load invoice');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const updateItem = (
    index: number,
    field: keyof ItemForm,
    value: string | number
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = calcItem({ ...updated[index], [field]: value });
      return updated;
    });
  };

  const addItem = () => setItems(prev => [...prev, emptyItem()]);

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const subTotal = items.reduce((sum, i) => sum + i.baseAmount, 0);
  const totalTax = items.reduce((sum, i) => sum + i.totalTax, 0);
  const grandTotal = items.reduce((sum, i) => sum + i.totalAmount, 0);

  const handleSave = async (submitAfter: boolean) => {
    if (!invoiceNumber.trim()) {
      toast.error('Invoice number is required');
      return;
    }
    if (!invoiceDate) {
      toast.error('Invoice date is required');
      return;
    }
    if (items.length === 0 || !items[0].itemName.trim()) {
      toast.error('At least one item is required');
      return;
    }

    setSaving(true);
    try {
      const request: UpdateDirectInvoiceRequest = {
        id: Number(id),
        invoiceNumber,
        invoiceDate,
        supplierId: supplierId || 0,
        locationId: 0,
        remarks,
        isDraft: !submitAfter,
        items: items.map(item => ({
          id: item.id,
          itemName: item.itemName,
          itemCode: item.itemCode,
          hsnSacCode: item.hsnSacCode,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          cgstRate: item.cgstRate,
          sgstRate: item.sgstRate,
          igstRate: item.igstRate,
          otherTaxRate: item.otherTaxRate,
          remarks: item.remarks,
        })),
      };

      await updateEmailInvoice(Number(id), request);
      toast.success(
        submitAfter ? 'Invoice saved & ready to submit' : 'Invoice saved'
      );
      navigate(`/invoice/preview/${id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save invoice';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-4'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate(-1)}
            className='p-2 hover:bg-gray-100 rounded-lg'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold'>Edit Invoice</h1>
            <p className='text-sm text-gray-500'>
              {invoice?.source === 'EMAIL' && 'OCR-scanned invoice — '}
              Correct any fields before submitting
              {invoice?.ocrConfidenceScore != null && (
                <span className='ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full'>
                  OCR Confidence: {invoice.ocrConfidenceScore}%
                </span>
              )}
            </p>
          </div>
        </div>
        <div className='flex gap-2'>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-gray-50'
          >
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700'
          >
            <Send size={15} />
            Save & Submit
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left: Invoice Details */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Basic Info */}
          <div className='bg-white rounded-lg border p-5'>
            <h2 className='font-semibold mb-4'>Invoice Details</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Invoice Number *
                </label>
                <input
                  type='text'
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={invoiceNumber}
                  onChange={e => setInvoiceNumber(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Invoice Date *
                </label>
                <input
                  type='date'
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={invoiceDate}
                  onChange={e => setInvoiceDate(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Due Date
                </label>
                <input
                  type='date'
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Currency
                </label>
                <select
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option value='INR'>INR (₹)</option>
                  <option value='USD'>USD ($)</option>
                  <option value='EUR'>EUR (€)</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Payment Terms
                </label>
                <input
                  type='text'
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  placeholder='e.g. NET30'
                />
              </div>
            </div>
          </div>

          {/* Supplier Info */}
          <div className='bg-white rounded-lg border p-5'>
            <h2 className='font-semibold mb-4'>Supplier</h2>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Supplier Name
                </label>
                <input
                  type='text'
                  className='w-full border rounded-lg px-3 py-2 text-sm bg-gray-50'
                  value={supplierName}
                  readOnly
                />
                {supplierId === 0 && (
                  <p className='text-xs text-amber-600 mt-1'>
                    Supplier not matched — resolve before submitting
                  </p>
                )}
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Supplier ID
                </label>
                <input
                  type='number'
                  className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  value={supplierId || ''}
                  onChange={e => setSupplierId(Number(e.target.value))}
                  placeholder='Enter supplier ID'
                />
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className='bg-white rounded-lg border p-5'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='font-semibold'>Line Items</h2>
              <button
                onClick={addItem}
                className='inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-violet-600 border border-violet-200 rounded-lg hover:bg-violet-50'
              >
                <Plus size={14} />
                Add Item
              </button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-gray-50'>
                    <th className='px-3 py-2 text-left font-medium text-gray-600 w-8'>
                      #
                    </th>
                    <th className='px-3 py-2 text-left font-medium text-gray-600 min-w-[180px]'>
                      Item Name *
                    </th>
                    <th className='px-3 py-2 text-left font-medium text-gray-600'>
                      HSN/SAC
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-20'>
                      Qty *
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-24'>
                      Unit Price *
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-16'>
                      CGST%
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-16'>
                      SGST%
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-16'>
                      IGST%
                    </th>
                    <th className='px-3 py-2 text-right font-medium text-gray-600 w-24'>
                      Total
                    </th>
                    <th className='px-3 py-2 w-10'></th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {items.map((item, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-3 py-2 text-gray-400'>{idx + 1}</td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          className='w-full border rounded px-2 py-1.5 text-sm'
                          value={item.itemName}
                          onChange={e =>
                            updateItem(idx, 'itemName', e.target.value)
                          }
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='text'
                          className='w-full border rounded px-2 py-1.5 text-sm'
                          value={item.hsnSacCode}
                          onChange={e =>
                            updateItem(idx, 'hsnSacCode', e.target.value)
                          }
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          className='w-full border rounded px-2 py-1.5 text-sm text-right'
                          value={item.quantity}
                          onChange={e =>
                            updateItem(idx, 'quantity', Number(e.target.value))
                          }
                          min={0}
                          step='0.01'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          className='w-full border rounded px-2 py-1.5 text-sm text-right'
                          value={item.unitPrice}
                          onChange={e =>
                            updateItem(idx, 'unitPrice', Number(e.target.value))
                          }
                          min={0}
                          step='0.01'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          className='w-full border rounded px-2 py-1.5 text-sm text-right'
                          value={item.cgstRate}
                          onChange={e =>
                            updateItem(idx, 'cgstRate', Number(e.target.value))
                          }
                          min={0}
                          step='0.01'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          className='w-full border rounded px-2 py-1.5 text-sm text-right'
                          value={item.sgstRate}
                          onChange={e =>
                            updateItem(idx, 'sgstRate', Number(e.target.value))
                          }
                          min={0}
                          step='0.01'
                        />
                      </td>
                      <td className='px-3 py-2'>
                        <input
                          type='number'
                          className='w-full border rounded px-2 py-1.5 text-sm text-right'
                          value={item.igstRate}
                          onChange={e =>
                            updateItem(idx, 'igstRate', Number(e.target.value))
                          }
                          min={0}
                          step='0.01'
                        />
                      </td>
                      <td className='px-3 py-2 text-right font-medium whitespace-nowrap'>
                        ₹
                        {item.totalAmount.toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-3 py-2'>
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(idx)}
                            className='p-1 text-gray-400 hover:text-red-500 rounded'
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Remarks */}
          <div className='bg-white rounded-lg border p-5'>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Remarks
            </label>
            <textarea
              className='w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
              rows={3}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Right: Summary & Metadata */}
        <div className='space-y-6'>
          {/* Totals */}
          <div className='bg-white rounded-lg border p-5'>
            <h2 className='font-semibold mb-4'>Summary</h2>
            <div className='space-y-3 text-sm'>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Sub Total</span>
                <span className='font-medium'>
                  ₹
                  {subTotal.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-gray-500'>Total Tax</span>
                <span className='font-medium'>
                  ₹
                  {totalTax.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className='border-t pt-3 flex justify-between'>
                <span className='font-semibold'>Grand Total</span>
                <span className='font-bold text-lg'>
                  ₹
                  {grandTotal.toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* OCR Metadata */}
          {invoice?.source === 'EMAIL' && (
            <div className='bg-white rounded-lg border p-5'>
              <h2 className='font-semibold mb-4'>Email/OCR Info</h2>
              <div className='space-y-2 text-sm'>
                <div>
                  <span className='text-gray-500'>Source:</span>{' '}
                  <span className='font-medium'>Email</span>
                </div>
                {invoice.ocrConfidenceScore != null && (
                  <div>
                    <span className='text-gray-500'>OCR Confidence:</span>{' '}
                    <span className='font-medium'>
                      {invoice.ocrConfidenceScore}%
                    </span>
                  </div>
                )}
                {invoice.poMatchStatus && (
                  <div>
                    <span className='text-gray-500'>PO Match:</span>{' '}
                    <span className='font-medium'>
                      {invoice.poMatchStatus.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
                {invoice.poNumber && (
                  <div>
                    <span className='text-gray-500'>Linked PO:</span>{' '}
                    <span className='font-medium text-violet-600'>
                      {invoice.poNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Original Document */}
          {invoice?.attachmentPath && (
            <div className='bg-white rounded-lg border p-5'>
              <h2 className='font-semibold mb-3'>Original Document</h2>
              <a
                href={`/api/invoice/${id}/download`}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 text-sm text-violet-600 hover:underline'
              >
                View scanned document
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
