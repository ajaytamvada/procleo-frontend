import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  FileText,
  Scan,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  FileImage,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useCreateDirectInvoice,
  useGenerateInvoiceNumber,
} from '../hooks/useInvoice';
import type {
  CreateDirectInvoiceRequest,
  DirectInvoiceItemRequest,
} from '../types';
import { useProcessOcrImage, useOcrStatus } from '../hooks/useOcr';
import type { ExtractedInvoiceData, ExtractedLineItem } from '../api/ocrApi';
import { matchVendor, checkDuplicate } from '../api/ocrApi';

// ========== TYPES ==========

interface InvoiceItemForm extends DirectInvoiceItemRequest {
  baseAmount: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
}

interface ScannedItem extends ExtractedLineItem {
  transferred: boolean;
}

// ========== HELPERS ==========

const calculateItemAmounts = (item: InvoiceItemForm): InvoiceItemForm => {
  const baseAmount = item.quantity * item.unitPrice;
  const taxableAmount = baseAmount;
  const cgstAmount = (taxableAmount * (item.cgstRate || 0)) / 100;
  const sgstAmount = (taxableAmount * (item.sgstRate || 0)) / 100;
  const igstAmount = (taxableAmount * (item.igstRate || 0)) / 100;
  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;
  const totalAmount = taxableAmount + totalTaxAmount;

  return {
    ...item,
    baseAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    totalTaxAmount,
    totalAmount,
  };
};

const createEmptyItem = (
  defaults?: Partial<InvoiceItemForm>
): InvoiceItemForm => {
  const item: InvoiceItemForm = {
    itemName: '',
    itemCode: '',
    hsnSacCode: '',
    manufacturer: '',
    quantity: 1,
    unitPrice: 0,
    cgstRate: defaults?.cgstRate ?? 9,
    sgstRate: defaults?.sgstRate ?? 9,
    igstRate: defaults?.igstRate ?? 0,
    otherTaxRate: 0,
    otherCharges: 0,
    buyback: 0,
    remarks: '',
    baseAmount: 0,
    taxableAmount: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalTaxAmount: 0,
    totalAmount: 0,
  };
  return calculateItemAmounts(item);
};

const formatCurrency = (amount: number, currency: string = 'INR') => {
  const symbol =
    currency === 'USD'
      ? '$'
      : currency === 'EUR'
        ? '€'
        : currency === 'GBP'
          ? '£'
          : '₹';
  return `${symbol} ${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

// ========== MAIN COMPONENT ==========

const DirectInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== Form State =====
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [poNumber, setPoNumber] = useState('');
  const [poDate, setPoDate] = useState('');
  const [supplierId, setSupplierId] = useState<number>(0);
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierPan, setSupplierPan] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [currency, setCurrency] = useState('INR');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [locationId, setLocationId] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // ===== Document & OCR State =====
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [showScannedItems, setShowScannedItems] = useState(true);
  const [selectedScannedIndices, setSelectedScannedIndices] = useState<
    Set<number>
  >(new Set());
  const [dragActive, setDragActive] = useState(false);

  // ===== Hooks =====
  const { data: generatedNumber } = useGenerateInvoiceNumber();
  const createMutation = useCreateDirectInvoice();
  const processOcrMutation = useProcessOcrImage();
  const { data: ocrStatus } = useOcrStatus();

  useEffect(() => {
    if (generatedNumber && !invoiceNumber) {
      setInvoiceNumber(generatedNumber);
    }
  }, [generatedNumber]);

  useEffect(() => {
    if (sameAsBilling) {
      setShippingAddress(billingAddress);
    }
  }, [sameAsBilling, billingAddress]);

  // ===== File Upload =====
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    setUploadedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    // Reset OCR state
    processOcrMutation.reset();
    setScannedItems([]);
    setSelectedScannedIndices(new Set());
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect]
  );

  // ===== OCR Processing =====
  const handleScan = async () => {
    if (!uploadedFile) return;
    try {
      const result = await processOcrMutation.mutateAsync(uploadedFile);
      if (result.success && result.extractedData) {
        applyOcrData(result.extractedData);
      }
    } catch {
      // Error handled by mutation hook
    }
  };

  const applyOcrData = async (data: ExtractedInvoiceData) => {
    // Fill header fields
    if (data.invoiceNumber) {
      setInvoiceNumber(data.invoiceNumber);
      try {
        const dup = await checkDuplicate(data.invoiceNumber);
        if (dup.exists) {
          toast.error(`Invoice #${data.invoiceNumber} already exists!`, {
            duration: 6000,
          });
        }
      } catch {
        /* skip */
      }
    }
    if (data.invoiceDate) setInvoiceDate(data.invoiceDate);
    if (data.dueDate) setDueDate(data.dueDate);
    if (data.currency) setCurrency(data.currency);
    if (data.paymentTerms) setPaymentTerms(data.paymentTerms);
    if (data.gstNumber) setSupplierGstin(data.gstNumber);
    if (data.panNumber) setSupplierPan(data.panNumber);
    if (data.supplierAddress) setSupplierAddress(data.supplierAddress);
    if (data.billingAddress) setBillingAddress(data.billingAddress);
    if (data.shippingAddress) setShippingAddress(data.shippingAddress);

    // Vendor fuzzy match
    if (data.supplierName) {
      setSupplierName(data.supplierName);
      try {
        const vendors = await matchVendor(data.supplierName);
        if (vendors.length === 1) {
          setSupplierId(vendors[0].id);
          toast.success(`Auto-matched supplier: ${vendors[0].name}`);
        } else if (vendors.length > 1) {
          toast(
            `Found ${vendors.length} suppliers matching "${data.supplierName}". Select manually.`,
            { duration: 5000 }
          );
        }
      } catch {
        /* skip */
      }
    }

    // Populate scanned items staging area
    if (data.lineItems && data.lineItems.length > 0) {
      const scanned: ScannedItem[] = data.lineItems.map(li => ({
        ...li,
        transferred: false,
      }));
      setScannedItems(scanned);
      setSelectedScannedIndices(new Set(scanned.map((_, i) => i)));
      setShowScannedItems(true);
    }

    toast.success(
      `Extracted: ${data.lineItems?.length || 0} items, Total: ${formatCurrency(data.grandTotal || 0, data.currency)}`,
      { duration: 4000 }
    );
  };

  // ===== Scanned Items Management =====
  const toggleScannedItem = (index: number) => {
    setSelectedScannedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const addSelectedToInvoice = () => {
    const defaultCgst = items.length > 0 ? items[0].cgstRate : 9;
    const defaultSgst = items.length > 0 ? items[0].sgstRate : 9;

    const newItems: InvoiceItemForm[] = [];
    const updatedScanned = [...scannedItems];

    selectedScannedIndices.forEach(idx => {
      const si = updatedScanned[idx];
      if (si && !si.transferred) {
        const item = createEmptyItem({
          cgstRate: defaultCgst,
          sgstRate: defaultSgst,
        });
        item.itemName = si.description || '';
        item.hsnSacCode = si.hsnCode || '';
        item.quantity = si.quantity || 1;
        item.unitPrice = si.unitPrice || 0;
        item.cgstRate = (si as any).cgstRate || defaultCgst || 0;
        item.sgstRate = (si as any).sgstRate || defaultSgst || 0;
        item.igstRate = (si as any).igstRate || 0;
        newItems.push(calculateItemAmounts(item));
        updatedScanned[idx] = { ...si, transferred: true };
      }
    });

    if (newItems.length > 0) {
      setItems(prev => [...prev, ...newItems]);
      setScannedItems(updatedScanned);
      setSelectedScannedIndices(new Set());
      toast.success(`Added ${newItems.length} items to invoice`);
    }
  };

  // ===== Line Items Management =====
  const addItem = () => setItems(prev => [...prev, createEmptyItem()]);

  const removeItem = (index: number) =>
    setItems(prev => prev.filter((_, i) => i !== index));

  const updateItem = (
    index: number,
    field: keyof InvoiceItemForm,
    value: any
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = calculateItemAmounts({
        ...updated[index],
        [field]: value,
      });
      return updated;
    });
  };

  // ===== Totals =====
  const totals = items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.baseAmount,
      cgst: acc.cgst + item.cgstAmount,
      sgst: acc.sgst + item.sgstAmount,
      igst: acc.igst + item.igstAmount,
      tax: acc.tax + item.totalTaxAmount,
      grand: acc.grand + item.totalAmount,
    }),
    { subtotal: 0, cgst: 0, sgst: 0, igst: 0, tax: 0, grand: 0 }
  );

  // ===== Submit =====
  const handleSubmit = async (isDraft: boolean) => {
    if (!invoiceNumber) return toast.error('Invoice number is required');
    if (!invoiceDate) return toast.error('Invoice date is required');
    if (!supplierId) return toast.error('Please select a supplier');
    if (!locationId) return toast.error('Please select a location');
    if (items.length === 0) return toast.error('Please add at least one item');

    for (let i = 0; i < items.length; i++) {
      if (!items[i].itemName)
        return toast.error(`Item ${i + 1}: Name is required`);
      if (items[i].quantity <= 0)
        return toast.error(`Item ${i + 1}: Quantity must be > 0`);
      if (items[i].unitPrice <= 0)
        return toast.error(`Item ${i + 1}: Price must be > 0`);
    }

    const request: CreateDirectInvoiceRequest = {
      invoiceNumber,
      invoiceDate,
      dueDate: dueDate || undefined,
      poNumber: poNumber || undefined,
      poDate: poDate || undefined,
      supplierId,
      locationId,
      currency,
      paymentTerms: paymentTerms || undefined,
      supplierGstin: supplierGstin || undefined,
      supplierPan: supplierPan || undefined,
      supplierAddress: supplierAddress || undefined,
      billingAddress: billingAddress || undefined,
      shippingAddress: shippingAddress || undefined,
      remarks: remarks || undefined,
      isDraft,
      items: items.map(item => ({
        itemName: item.itemName,
        itemCode: item.itemCode || undefined,
        hsnSacCode: item.hsnSacCode || undefined,
        manufacturer: item.manufacturer || undefined,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        otherTaxRate: item.otherTaxRate,
        otherCharges: item.otherCharges,
        buyback: item.buyback,
        remarks: item.remarks || undefined,
      })),
    };

    try {
      await createMutation.mutateAsync(request);
      toast.success(isDraft ? 'Saved as draft' : 'Invoice submitted');
      navigate('/invoice/list');
    } catch {
      /* error shown by hook */
    }
  };

  // ===== RENDER =====
  const isScanning = processOcrMutation.isPending;
  const hasScannedItems = scannedItems.length > 0;
  const untransferredCount = scannedItems.filter(s => !s.transferred).length;

  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header Bar */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={() => navigate('/invoice/list')}
            className='p-1.5 hover:bg-gray-100 rounded-lg'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Direct Invoice</h1>
            <p className='text-xs text-gray-500'>
              Create invoice without PO reference
            </p>
          </div>
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending}
            className='flex items-center px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50'
          >
            <Save className='w-4 h-4 mr-1.5' />
            Save Draft
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending}
            className='flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50'
          >
            <FileText className='w-4 h-4 mr-1.5' />
            Submit Invoice
          </button>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className='flex flex-1 overflow-hidden'>
        {/* ===== LEFT PANEL: Document Preview ===== */}
        <div className='w-[40%] border-r border-gray-200 bg-gray-50 flex flex-col'>
          <div className='px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-700'>
              Document Preview
            </h2>
            {uploadedFile && (
              <div className='flex items-center space-x-2'>
                <button
                  onClick={handleScan}
                  disabled={isScanning || !ocrStatus?.available}
                  className='flex items-center px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 disabled:opacity-50'
                >
                  {isScanning ? (
                    <>
                      <Loader2 className='w-3.5 h-3.5 mr-1.5 animate-spin' />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Scan className='w-3.5 h-3.5 mr-1.5' />
                      Scan with OCR
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setPreviewUrl(null);
                    processOcrMutation.reset();
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className='p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded'
                >
                  <X className='w-4 h-4' />
                </button>
              </div>
            )}
          </div>

          <div className='flex-1 overflow-auto p-4'>
            {!uploadedFile ? (
              <div
                className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer ${
                  dragActive
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                onDrop={handleDrop}
                onDragOver={e => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className='w-12 h-12 text-gray-300 mb-4' />
                <p className='text-sm font-medium text-gray-600 mb-1'>
                  Drop invoice here
                </p>
                <p className='text-xs text-gray-400 mb-4'>or click to browse</p>
                <span className='px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg'>
                  Select File
                </span>
                <p className='text-xs text-gray-400 mt-4'>
                  PDF, JPG, PNG, TIFF (max 10MB)
                </p>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.pdf,.jpg,.jpeg,.png,.tiff,.tif,.bmp'
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className='hidden'
                />
              </div>
            ) : (
              <div className='h-full flex flex-col'>
                {/* File info */}
                <div className='flex items-center space-x-2 mb-3 px-1'>
                  <FileImage className='w-4 h-4 text-gray-400' />
                  <span className='text-xs text-gray-600 truncate'>
                    {uploadedFile.name}
                  </span>
                  <span className='text-xs text-gray-400'>
                    ({(uploadedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>

                {/* OCR result banner */}
                {processOcrMutation.data?.success && (
                  <div className='flex items-center px-3 py-2 mb-3 bg-green-50 border border-green-200 rounded-lg'>
                    <CheckCircle className='w-4 h-4 text-green-600 mr-2 shrink-0' />
                    <span className='text-xs text-green-700'>
                      Scanned ({processOcrMutation.data.processingTimeMs}ms) —{' '}
                      {scannedItems.length} items found
                    </span>
                  </div>
                )}
                {processOcrMutation.data &&
                  !processOcrMutation.data.success && (
                    <div className='flex items-center px-3 py-2 mb-3 bg-red-50 border border-red-200 rounded-lg'>
                      <AlertCircle className='w-4 h-4 text-red-600 mr-2 shrink-0' />
                      <span className='text-xs text-red-700'>
                        {processOcrMutation.data.errorMessage}
                      </span>
                    </div>
                  )}

                {/* Document viewer */}
                <div className='flex-1 bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  {uploadedFile.type === 'application/pdf' ? (
                    <iframe
                      src={previewUrl || ''}
                      className='w-full h-full'
                      title='Invoice Preview'
                    />
                  ) : (
                    <div className='h-full overflow-auto p-2 flex items-start justify-center'>
                      <img
                        src={previewUrl || ''}
                        alt='Invoice Preview'
                        className='max-w-full object-contain'
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===== RIGHT PANEL: Invoice Form ===== */}
        <div className='flex-1 overflow-y-auto bg-gray-50'>
          <div className='p-6 space-y-5'>
            {/* Invoice Information */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Invoice Information
                </h2>
              </div>
              <div className='p-5 grid grid-cols-3 gap-4'>
                <Field label='Invoice Number' required>
                  <input
                    type='text'
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className='input-field'
                  />
                </Field>
                <Field label='Invoice Date' required>
                  <input
                    type='date'
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className='input-field'
                  />
                </Field>
                <Field label='Due Date'>
                  <input
                    type='date'
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className='input-field'
                  />
                </Field>
                <Field label='Currency'>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className='input-field'
                  >
                    <option value='INR'>INR - Indian Rupee</option>
                    <option value='USD'>USD - US Dollar</option>
                    <option value='EUR'>EUR - Euro</option>
                    <option value='GBP'>GBP - British Pound</option>
                  </select>
                </Field>
                <Field label='Payment Terms'>
                  <input
                    type='text'
                    value={paymentTerms}
                    onChange={e => setPaymentTerms(e.target.value)}
                    className='input-field'
                    placeholder='e.g., Net 30'
                  />
                </Field>
                <Field label='Location' required>
                  <input
                    type='number'
                    value={locationId || ''}
                    onChange={e => setLocationId(Number(e.target.value))}
                    className='input-field'
                    placeholder='Location ID'
                  />
                </Field>
              </div>
            </section>

            {/* Supplier Information */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Supplier Information
                </h2>
              </div>
              <div className='p-5 grid grid-cols-2 gap-4'>
                <Field label='Supplier ID' required>
                  <input
                    type='number'
                    value={supplierId || ''}
                    onChange={e => setSupplierId(Number(e.target.value))}
                    className='input-field'
                    placeholder='Supplier ID'
                  />
                </Field>
                <Field label='Supplier Name'>
                  <input
                    type='text'
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className='input-field'
                    placeholder='Auto-filled from OCR'
                  />
                </Field>
                <Field label='GSTIN'>
                  <input
                    type='text'
                    value={supplierGstin}
                    onChange={e => setSupplierGstin(e.target.value)}
                    className='input-field'
                    placeholder='e.g., 27AABCU9603R1ZM'
                  />
                </Field>
                <Field label='PAN'>
                  <input
                    type='text'
                    value={supplierPan}
                    onChange={e => setSupplierPan(e.target.value)}
                    className='input-field'
                    placeholder='e.g., AABCU9603R'
                  />
                </Field>
                <div className='col-span-2'>
                  <Field label='Supplier Address'>
                    <textarea
                      value={supplierAddress}
                      onChange={e => setSupplierAddress(e.target.value)}
                      rows={2}
                      className='input-field'
                      placeholder='Supplier address'
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Addresses */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Addresses
                </h2>
              </div>
              <div className='p-5 grid grid-cols-2 gap-4'>
                <Field label='Billing Address'>
                  <textarea
                    value={billingAddress}
                    onChange={e => setBillingAddress(e.target.value)}
                    rows={2}
                    className='input-field'
                    placeholder='Billing address'
                  />
                </Field>
                <div>
                  <div className='flex items-center justify-between mb-1'>
                    <label className='text-xs font-medium text-gray-600'>
                      Shipping Address
                    </label>
                    <label className='flex items-center space-x-1.5 text-xs text-gray-500 cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={sameAsBilling}
                        onChange={e => setSameAsBilling(e.target.checked)}
                        className='rounded border-gray-300 text-purple-600 focus:ring-purple-500'
                      />
                      <span>Same as billing</span>
                    </label>
                  </div>
                  <textarea
                    value={shippingAddress}
                    onChange={e => {
                      setSameAsBilling(false);
                      setShippingAddress(e.target.value);
                    }}
                    rows={2}
                    className='input-field'
                    placeholder='Shipping address'
                    disabled={sameAsBilling}
                  />
                </div>
              </div>
            </section>

            {/* PO Reference (optional) */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-800'>
                  PO Reference{' '}
                  <span className='text-xs font-normal text-gray-400'>
                    (optional)
                  </span>
                </h2>
              </div>
              <div className='p-5 grid grid-cols-2 gap-4'>
                <Field label='PO Number'>
                  <input
                    type='text'
                    value={poNumber}
                    onChange={e => setPoNumber(e.target.value)}
                    className='input-field'
                    placeholder='Manual PO reference'
                  />
                </Field>
                <Field label='PO Date'>
                  <input
                    type='date'
                    value={poDate}
                    onChange={e => setPoDate(e.target.value)}
                    className='input-field'
                  />
                </Field>
              </div>
            </section>

            {/* Scanned Items (Raw OCR Data) */}
            {hasScannedItems && (
              <section className='bg-white rounded-lg border border-orange-200'>
                <div
                  className='px-5 py-3 border-b border-orange-100 flex items-center justify-between cursor-pointer hover:bg-orange-50'
                  onClick={() => setShowScannedItems(!showScannedItems)}
                >
                  <div className='flex items-center space-x-2'>
                    <Scan className='w-4 h-4 text-orange-500' />
                    <h2 className='text-sm font-semibold text-gray-800'>
                      Scanned Items (Raw Data)
                    </h2>
                    {untransferredCount > 0 && (
                      <span className='px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full'>
                        {untransferredCount} pending
                      </span>
                    )}
                  </div>
                  {showScannedItems ? (
                    <ChevronUp className='w-4 h-4 text-gray-400' />
                  ) : (
                    <ChevronDown className='w-4 h-4 text-gray-400' />
                  )}
                </div>
                {showScannedItems && (
                  <div className='p-4'>
                    <div className='overflow-x-auto'>
                      <table className='w-full text-xs'>
                        <thead>
                          <tr className='bg-orange-50'>
                            <th className='px-2 py-2 text-left w-8'>
                              <input
                                type='checkbox'
                                checked={
                                  selectedScannedIndices.size ===
                                    scannedItems.filter(s => !s.transferred)
                                      .length && untransferredCount > 0
                                }
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedScannedIndices(
                                      new Set(
                                        scannedItems
                                          .map((s, i) =>
                                            s.transferred ? -1 : i
                                          )
                                          .filter(i => i >= 0)
                                      )
                                    );
                                  } else {
                                    setSelectedScannedIndices(new Set());
                                  }
                                }}
                                className='rounded border-gray-300 text-purple-600'
                              />
                            </th>
                            <th className='px-2 py-2 text-left'>Description</th>
                            <th className='px-2 py-2 text-left'>HSN</th>
                            <th className='px-2 py-2 text-right'>Qty</th>
                            <th className='px-2 py-2 text-right'>Unit Price</th>
                            <th className='px-2 py-2 text-right'>Amount</th>
                            <th className='px-2 py-2 text-center'>Status</th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {scannedItems.map((si, idx) => (
                            <tr
                              key={idx}
                              className={
                                si.transferred
                                  ? 'bg-green-50 opacity-60'
                                  : 'hover:bg-gray-50'
                              }
                            >
                              <td className='px-2 py-2'>
                                {!si.transferred && (
                                  <input
                                    type='checkbox'
                                    checked={selectedScannedIndices.has(idx)}
                                    onChange={() => toggleScannedItem(idx)}
                                    className='rounded border-gray-300 text-purple-600'
                                  />
                                )}
                              </td>
                              <td className='px-2 py-2'>
                                {si.description || '-'}
                              </td>
                              <td className='px-2 py-2'>{si.hsnCode || '-'}</td>
                              <td className='px-2 py-2 text-right'>
                                {si.quantity || '-'}
                              </td>
                              <td className='px-2 py-2 text-right'>
                                {si.unitPrice?.toLocaleString() || '-'}
                              </td>
                              <td className='px-2 py-2 text-right'>
                                {si.amount?.toLocaleString() || '-'}
                              </td>
                              <td className='px-2 py-2 text-center'>
                                {si.transferred ? (
                                  <span className='inline-flex items-center px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs'>
                                    <Check className='w-3 h-3 mr-0.5' />
                                    Added
                                  </span>
                                ) : (
                                  <span className='text-gray-400'>Pending</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {untransferredCount > 0 && (
                      <div className='flex justify-end mt-3'>
                        <button
                          onClick={addSelectedToInvoice}
                          disabled={selectedScannedIndices.size === 0}
                          className='flex items-center px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 disabled:opacity-50'
                        >
                          <Plus className='w-3.5 h-3.5 mr-1' />
                          Add Selected to Invoice ({selectedScannedIndices.size}
                          )
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {/* Line Items */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100 flex items-center justify-between'>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Line Items
                </h2>
                <button
                  onClick={addItem}
                  className='flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700'
                >
                  <Plus className='w-3.5 h-3.5 mr-1' />
                  Add Item
                </button>
              </div>
              <div className='overflow-x-auto'>
                {items.length > 0 ? (
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='bg-gray-50 border-b border-gray-200'>
                        <th className='px-3 py-2.5 text-left font-medium text-gray-500 uppercase'>
                          Description
                        </th>
                        <th className='px-3 py-2.5 text-left font-medium text-gray-500 uppercase'>
                          HSN
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-20'>
                          Qty
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-24'>
                          Unit Price
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-24'>
                          Amount
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-16'>
                          CGST%
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-16'>
                          SGST%
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-16'>
                          IGST%
                        </th>
                        <th className='px-3 py-2.5 text-right font-medium text-gray-500 uppercase w-24'>
                          Total
                        </th>
                        <th className='px-3 py-2.5 w-10'></th>
                      </tr>
                    </thead>
                    <tbody className='divide-y divide-gray-100'>
                      {items.map((item, idx) => (
                        <tr key={idx} className='hover:bg-gray-50'>
                          <td className='px-3 py-2'>
                            <input
                              type='text'
                              value={item.itemName}
                              onChange={e =>
                                updateItem(idx, 'itemName', e.target.value)
                              }
                              className='w-full px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                              placeholder='Item name'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='text'
                              value={item.hsnSacCode || ''}
                              onChange={e =>
                                updateItem(idx, 'hsnSacCode', e.target.value)
                              }
                              className='w-20 px-2 py-1 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-blue-500'
                              placeholder='HSN'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              value={item.quantity}
                              onChange={e =>
                                updateItem(
                                  idx,
                                  'quantity',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-20 px-2 py-1 border border-gray-200 rounded text-right text-xs focus:ring-1 focus:ring-blue-500'
                              min='0'
                              step='0.01'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              value={item.unitPrice}
                              onChange={e =>
                                updateItem(
                                  idx,
                                  'unitPrice',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-24 px-2 py-1 border border-gray-200 rounded text-right text-xs focus:ring-1 focus:ring-blue-500'
                              min='0'
                              step='0.01'
                            />
                          </td>
                          <td className='px-3 py-2 text-right text-xs text-gray-600'>
                            {item.baseAmount.toLocaleString('en-IN', {
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              value={item.cgstRate || 0}
                              onChange={e =>
                                updateItem(
                                  idx,
                                  'cgstRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-16 px-2 py-1 border border-gray-200 rounded text-right text-xs focus:ring-1 focus:ring-blue-500'
                              min='0'
                              max='100'
                              step='0.5'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              value={item.sgstRate || 0}
                              onChange={e =>
                                updateItem(
                                  idx,
                                  'sgstRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-16 px-2 py-1 border border-gray-200 rounded text-right text-xs focus:ring-1 focus:ring-blue-500'
                              min='0'
                              max='100'
                              step='0.5'
                            />
                          </td>
                          <td className='px-3 py-2'>
                            <input
                              type='number'
                              value={item.igstRate || 0}
                              onChange={e =>
                                updateItem(
                                  idx,
                                  'igstRate',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className='w-16 px-2 py-1 border border-gray-200 rounded text-right text-xs focus:ring-1 focus:ring-blue-500'
                              min='0'
                              max='100'
                              step='0.5'
                            />
                          </td>
                          <td className='px-3 py-2 text-right text-xs font-semibold text-gray-900'>
                            {formatCurrency(item.totalAmount, currency)}
                          </td>
                          <td className='px-3 py-2 text-center'>
                            <button
                              onClick={() => removeItem(idx)}
                              className='text-red-400 hover:text-red-600'
                            >
                              <Trash2 className='w-3.5 h-3.5' />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className='p-8 text-center text-gray-400 text-sm'>
                    No items yet. Scan an invoice or click "Add Item".
                  </div>
                )}
              </div>

              {/* Totals */}
              {items.length > 0 && (
                <div className='px-5 py-4 border-t border-gray-200 bg-gray-50'>
                  <div className='flex justify-end'>
                    <div className='w-72 space-y-1.5 text-sm'>
                      <TotalRow
                        label='Subtotal'
                        value={totals.subtotal}
                        currency={currency}
                      />
                      {totals.cgst > 0 && (
                        <TotalRow
                          label='CGST'
                          value={totals.cgst}
                          currency={currency}
                          light
                        />
                      )}
                      {totals.sgst > 0 && (
                        <TotalRow
                          label='SGST'
                          value={totals.sgst}
                          currency={currency}
                          light
                        />
                      )}
                      {totals.igst > 0 && (
                        <TotalRow
                          label='IGST'
                          value={totals.igst}
                          currency={currency}
                          light
                        />
                      )}
                      <TotalRow
                        label='Total Tax'
                        value={totals.tax}
                        currency={currency}
                      />
                      <div className='flex justify-between pt-2 border-t border-gray-300'>
                        <span className='font-bold text-gray-900'>
                          Grand Total
                        </span>
                        <span className='font-bold text-lg text-green-600'>
                          {formatCurrency(totals.grand, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Remarks */}
            <section className='bg-white rounded-lg border border-gray-200'>
              <div className='px-5 py-3 border-b border-gray-100'>
                <h2 className='text-sm font-semibold text-gray-800'>Remarks</h2>
              </div>
              <div className='p-5'>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  className='input-field'
                  placeholder='Additional notes...'
                />
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Global styles for form inputs */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.8125rem;
          transition: all 0.15s;
          outline: none;
        }
        .input-field:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.15);
        }
        .input-field:disabled {
          background-color: #f9fafb;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

// ===== Sub-components =====

const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div>
    <label className='block text-xs font-medium text-gray-600 mb-1'>
      {label} {required && <span className='text-red-400'>*</span>}
    </label>
    {children}
  </div>
);

const TotalRow: React.FC<{
  label: string;
  value: number;
  currency: string;
  light?: boolean;
}> = ({ label, value, currency, light }) => (
  <div className='flex justify-between'>
    <span className={light ? 'text-gray-500 text-xs' : 'text-gray-600'}>
      {label}
    </span>
    <span
      className={light ? 'text-gray-500 text-xs' : 'font-medium text-gray-900'}
    >
      {formatCurrency(value, currency)}
    </span>
  </div>
);

export default DirectInvoicePage;
