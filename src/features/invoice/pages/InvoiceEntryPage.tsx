import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  FileText,
  ChevronDown,
  ChevronUp,
  Upload,
  Scan,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  FileImage,
  Check,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  usePOsForInvoicing,
  usePODetails,
  usePOItemsForInvoicing,
  useCreateInvoice,
  useSubmitInvoice,
  useGenerateInvoiceNumber,
} from '../hooks/useInvoice';
import type { CreateInvoiceRequest, InvoiceItemRequest } from '../types';
import { useProcessOcrImage, useOcrStatus } from '../hooks/useOcr';
import type { ExtractedInvoiceData, ExtractedLineItem } from '../api/ocrApi';
import { checkDuplicate } from '../api/ocrApi';

// ========== TYPES ==========

interface InvoiceItemForm extends InvoiceItemRequest {
  itemName: string;
  itemCode?: string;
  hsnSacCode?: string;
  unitOfMeasurement?: string;
  poQuantity: number;
  remainingQuantity: number;
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

// ========== COMPONENT ==========

const InvoiceEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== PO State =====
  const [selectedPoId, setSelectedPoId] = useState<number | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [freightCharges, setFreightCharges] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
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
  const [ocrExtractedData, setOcrExtractedData] =
    useState<ExtractedInvoiceData | null>(null);

  // ===== Queries =====
  const { data: availablePOs } = usePOsForInvoicing();
  const { data: poDetails } = usePODetails(selectedPoId);
  const { data: poItems } = usePOItemsForInvoicing(selectedPoId);
  const { data: generatedNumber } = useGenerateInvoiceNumber();

  // ===== Mutations =====
  const createMutation = useCreateInvoice();
  const submitMutation = useSubmitInvoice();
  const processOcrMutation = useProcessOcrImage();
  const { data: ocrStatus } = useOcrStatus();

  // Set generated invoice number
  useEffect(() => {
    if (generatedNumber && !invoiceNumber) {
      setInvoiceNumber(generatedNumber);
    }
  }, [generatedNumber]);

  // Load PO items when PO is selected
  useEffect(() => {
    if (poItems && poItems.length > 0) {
      const formItems: InvoiceItemForm[] = poItems.map(item => {
        const base: InvoiceItemForm = {
          poItemId: item.poItemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          unitOfMeasurement: item.unitOfMeasurement,
          poQuantity: item.poQuantity,
          remainingQuantity: item.remainingQuantity,
          invoiceQuantity: item.remainingQuantity,
          unitPrice: item.unitPrice,
          cgstRate: item.cgstRate || 0,
          sgstRate: item.sgstRate || 0,
          igstRate: item.igstRate || 0,
          otherTaxRate: item.otherTaxRate || 0,
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
        calculateItemAmounts(base);
        return base;
      });
      setItems(formItems);
    }
  }, [poItems]);

  // ===== Calculations =====
  const calculateItemAmounts = (item: InvoiceItemForm) => {
    const baseAmount = item.invoiceQuantity * item.unitPrice;
    const taxableAmount = baseAmount - (item.otherCharges || 0);
    const cgstAmount = (taxableAmount * (item.cgstRate || 0)) / 100;
    const sgstAmount = (taxableAmount * (item.sgstRate || 0)) / 100;
    const igstAmount = (taxableAmount * (item.igstRate || 0)) / 100;
    const otherTaxAmount = (taxableAmount * (item.otherTaxRate || 0)) / 100;
    const totalTaxAmount =
      cgstAmount + sgstAmount + igstAmount + otherTaxAmount;
    const totalAmount = taxableAmount + totalTaxAmount;

    item.baseAmount = baseAmount;
    item.taxableAmount = taxableAmount;
    item.cgstAmount = cgstAmount;
    item.sgstAmount = sgstAmount;
    item.igstAmount = igstAmount;
    item.totalTaxAmount = totalTaxAmount;
    item.totalAmount = totalAmount;
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItemForm,
    value: any
  ) => {
    const updatedItems = [...items];
    const item = updatedItems[index];
    (item as any)[field] = value;

    if (field === 'invoiceQuantity') {
      const qty = parseFloat(value) || 0;
      if (qty > item.remainingQuantity) {
        toast.error(
          `Invoice quantity cannot exceed remaining quantity (${item.remainingQuantity})`
        );
        item.invoiceQuantity = item.remainingQuantity;
      }
    }

    calculateItemAmounts(item);
    setItems(updatedItems);
  };

  const calculateTotals = () => {
    const subTotal = items.reduce((sum, item) => sum + item.baseAmount, 0);
    const taxAmount = items.reduce((sum, item) => sum + item.totalTaxAmount, 0);
    const grandTotal = subTotal + taxAmount + freightCharges - discountAmount;
    return { subTotal, taxAmount, grandTotal };
  };

  // ===== File Upload =====
  const handleFileSelect = useCallback((file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    processOcrMutation.reset();
    setScannedItems([]);
    setSelectedScannedIndices(new Set());
    setOcrExtractedData(null);
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

  // ===== OCR =====
  const handleScan = async () => {
    if (!uploadedFile) return;
    try {
      const result = await processOcrMutation.mutateAsync(uploadedFile);
      if (result.success && result.extractedData) {
        applyOcrData(result.extractedData);
      }
    } catch {
      /* handled by hook */
    }
  };

  const applyOcrData = async (data: ExtractedInvoiceData) => {
    setOcrExtractedData(data);

    // Fill invoice header fields from OCR
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

    // Populate scanned items staging area (don't overwrite PO items)
    if (data.lineItems && data.lineItems.length > 0) {
      const scanned: ScannedItem[] = data.lineItems.map(li => ({
        ...li,
        transferred: false,
      }));
      setScannedItems(scanned);
      setSelectedScannedIndices(new Set(scanned.map((_, i) => i)));
      setShowScannedItems(true);
    }

    // Add OCR info to remarks
    const extraInfo: string[] = [];
    if (data.supplierName) extraInfo.push(`Supplier: ${data.supplierName}`);
    if (data.gstNumber) extraInfo.push(`GSTIN: ${data.gstNumber}`);
    if (data.grandTotal != null)
      extraInfo.push(
        `Invoice Total: ${data.currency || 'INR'} ${data.grandTotal.toLocaleString()}`
      );
    if (extraInfo.length > 0) {
      setRemarks(prev =>
        prev
          ? `${prev}\n[OCR] ${extraInfo.join(' | ')}`
          : `[OCR] ${extraInfo.join(' | ')}`
      );
    }

    toast.success(
      `Scanned: ${data.lineItems?.length || 0} items found, Total: ₹${data.grandTotal?.toLocaleString() || 0}`,
      { duration: 4000 }
    );
  };

  // ===== Scanned Items =====
  const toggleScannedItem = (index: number) => {
    setSelectedScannedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const addScannedToRemarks = () => {
    // Add scanned item details to remarks for reference
    const details = scannedItems
      .filter(
        (_, i) => selectedScannedIndices.has(i) && !scannedItems[i].transferred
      )
      .map(
        si =>
          `${si.description}: Qty ${si.quantity || '-'} x ${si.unitPrice || '-'} = ${si.amount || '-'}`
      )
      .join('\n');

    if (details) {
      setRemarks(prev =>
        prev
          ? `${prev}\n\n[Scanned Line Items]\n${details}`
          : `[Scanned Line Items]\n${details}`
      );
      const updated = [...scannedItems];
      selectedScannedIndices.forEach(idx => {
        if (updated[idx]) updated[idx] = { ...updated[idx], transferred: true };
      });
      setScannedItems(updated);
      setSelectedScannedIndices(new Set());
      toast.success('Scanned item details added to remarks');
    }
  };

  // ===== Submit =====
  const handleSubmit = async (isDraft: boolean) => {
    if (!selectedPoId) return toast.error('Please select a Purchase Order');
    if (!poDetails) return toast.error('PO details not loaded');
    if (items.length === 0) return toast.error('Please add at least one item');

    const poDateObj = new Date(poDetails.poDate);
    const invDateObj = new Date(invoiceDate);
    if (invDateObj < poDateObj)
      return toast.error('Invoice date cannot be before PO date');

    const request: CreateInvoiceRequest = {
      poId: selectedPoId,
      invoiceNumber,
      invoiceDate,
      supplierId: poDetails.supplierId,
      remarks: remarks || undefined,
      freightCharges: freightCharges || undefined,
      discountAmount: discountAmount || undefined,
      items: items.map(item => ({
        poItemId: item.poItemId,
        invoiceQuantity: item.invoiceQuantity,
        unitPrice: item.unitPrice,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        otherTaxRate: item.otherTaxRate,
        otherCharges: item.otherCharges,
        buyback: item.buyback,
        remarks: item.remarks,
      })),
    };

    try {
      const created = await createMutation.mutateAsync(request);
      // "Create Invoice" must move the invoice out of DRAFT, otherwise it
      // won't be eligible for GRN (GRN excludes DRAFT/CANCELLED invoices).
      if (!isDraft && created?.id) {
        await submitMutation.mutateAsync(created.id);
      }
      navigate('/invoice/list');
    } catch {
      /* error shown by hook */
    }
  };

  const totals = calculateTotals();
  const isScanning = processOcrMutation.isPending;
  const hasScannedItems = scannedItems.length > 0;
  const untransferredCount = scannedItems.filter(s => !s.transferred).length;

  // ===== RENDER =====
  return (
    <div className='h-[calc(100vh-4rem)] flex flex-col'>
      {/* Header */}
      <div className='flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => navigate('/invoice/list')}
            className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg'
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Invoice Entry
            </h1>
            <p className='text-xs text-gray-500'>
              Create invoice from approved Purchase Order
            </p>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => navigate('/invoice/list')}
            className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
          >
            Cancel
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={createMutation.isPending || submitMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50'
          >
            <Save size={15} /> Save Draft
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={createMutation.isPending || submitMutation.isPending}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:opacity-50'
          >
            <FileText size={15} /> Create Invoice
          </button>
        </div>
      </div>

      {/* Two-Panel Layout */}
      <div className='flex flex-1 overflow-hidden'>
        {/* ===== LEFT PANEL: Document Preview ===== */}
        <div className='w-[38%] border-r border-gray-200 bg-gray-50 flex flex-col'>
          <div className='px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-700'>
              Document Preview
            </h2>
            {uploadedFile && (
              <div className='flex items-center gap-2'>
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
                    setScannedItems([]);
                    setOcrExtractedData(null);
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
                className={`h-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
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
                <div className='flex items-center gap-2 mb-3 px-1'>
                  <FileImage className='w-4 h-4 text-gray-400' />
                  <span className='text-xs text-gray-600 truncate'>
                    {uploadedFile.name}
                  </span>
                  <span className='text-xs text-gray-400'>
                    ({(uploadedFile.size / 1024).toFixed(0)} KB)
                  </span>
                </div>

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

                {/* OCR Extracted Info Summary */}
                {ocrExtractedData && (
                  <div className='mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 space-y-1'>
                    {ocrExtractedData.supplierName && (
                      <p>
                        <span className='font-medium'>Supplier:</span>{' '}
                        {ocrExtractedData.supplierName}
                      </p>
                    )}
                    {ocrExtractedData.gstNumber && (
                      <p>
                        <span className='font-medium'>GSTIN:</span>{' '}
                        {ocrExtractedData.gstNumber}
                      </p>
                    )}
                    {ocrExtractedData.invoiceNumber && (
                      <p>
                        <span className='font-medium'>Invoice #:</span>{' '}
                        {ocrExtractedData.invoiceNumber}
                      </p>
                    )}
                    {ocrExtractedData.grandTotal != null && (
                      <p>
                        <span className='font-medium'>Total:</span> ₹
                        {ocrExtractedData.grandTotal.toLocaleString()}
                      </p>
                    )}
                  </div>
                )}

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
                        alt='Invoice'
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
        <div className='flex-1 overflow-y-auto bg-[#f8f9fc]'>
          <div className='p-6 space-y-5'>
            {/* Select PO */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                <h2 className='text-base font-semibold text-gray-900'>
                  Select Purchase Order
                </h2>
              </div>
              <div className='p-6'>
                <div className='grid grid-cols-2 gap-x-8 gap-y-5'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <span className='text-red-500'>*</span> Purchase Order
                    </label>
                    <div className='relative'>
                      <select
                        value={selectedPoId || ''}
                        onChange={e => setSelectedPoId(Number(e.target.value))}
                        className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500'
                        required
                      >
                        <option value=''>Select PO</option>
                        {availablePOs?.map(po => (
                          <option key={po.poId} value={po.poId}>
                            {po.poNumber} - {po.supplierName} ({po.poDate})
                          </option>
                        ))}
                      </select>
                      <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                    </div>
                  </div>
                  {poDetails && (
                    <>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Supplier
                        </label>
                        <p className='text-sm text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                          {poDetails.supplierName}
                          {poDetails.supplierCode &&
                            ` (${poDetails.supplierCode})`}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          PO Date
                        </label>
                        <p className='text-sm text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                          {poDetails.poDate}
                        </p>
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          PO Amount
                        </label>
                        <p className='text-sm font-semibold text-gray-900 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200'>
                          ₹
                          {poDetails.grandTotal?.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }) || '0.00'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {selectedPoId && (
              <>
                {/* Invoice Information */}
                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                    <h2 className='text-base font-semibold text-gray-900'>
                      Invoice Information
                    </h2>
                  </div>
                  <div className='p-6'>
                    <div className='grid grid-cols-3 gap-x-8 gap-y-5'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          <span className='text-red-500'>*</span> Invoice Number
                        </label>
                        <input
                          type='text'
                          value={invoiceNumber}
                          onChange={e => setInvoiceNumber(e.target.value)}
                          className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          <span className='text-red-500'>*</span> Invoice Date
                        </label>
                        <input
                          type='date'
                          value={invoiceDate}
                          onChange={e => setInvoiceDate(e.target.value)}
                          className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                          required
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Freight Charges
                        </label>
                        <input
                          type='number'
                          value={freightCharges}
                          onChange={e =>
                            setFreightCharges(parseFloat(e.target.value) || 0)
                          }
                          className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                          min='0'
                          step='0.01'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Discount Amount
                        </label>
                        <input
                          type='number'
                          value={discountAmount}
                          onChange={e =>
                            setDiscountAmount(parseFloat(e.target.value) || 0)
                          }
                          className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                          min='0'
                          step='0.01'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scanned Items (Raw OCR Data) */}
                {hasScannedItems && (
                  <div className='bg-white rounded-lg border border-orange-200 overflow-hidden'>
                    <div
                      className='px-6 py-3 border-b border-orange-100 bg-orange-50 flex items-center justify-between cursor-pointer'
                      onClick={() => setShowScannedItems(!showScannedItems)}
                    >
                      <div className='flex items-center gap-2'>
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
                        <p className='text-xs text-gray-500 mb-3'>
                          These items were extracted from the scanned invoice.
                          Since this is a PO-based invoice, items come from the
                          PO. Use "Add to Remarks" to attach scanned details for
                          reference.
                        </p>
                        <div className='overflow-x-auto'>
                          <table className='w-full text-xs'>
                            <thead>
                              <tr className='bg-orange-50'>
                                <th className='px-2 py-2 text-left w-8'>
                                  <input
                                    type='checkbox'
                                    checked={
                                      selectedScannedIndices.size ===
                                        untransferredCount &&
                                      untransferredCount > 0
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
                                <th className='px-2 py-2 text-left'>
                                  Description
                                </th>
                                <th className='px-2 py-2 text-left'>HSN</th>
                                <th className='px-2 py-2 text-right'>Qty</th>
                                <th className='px-2 py-2 text-right'>
                                  Unit Price
                                </th>
                                <th className='px-2 py-2 text-right'>Amount</th>
                                <th className='px-2 py-2 text-center'>
                                  Status
                                </th>
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
                                        checked={selectedScannedIndices.has(
                                          idx
                                        )}
                                        onChange={() => toggleScannedItem(idx)}
                                        className='rounded border-gray-300 text-purple-600'
                                      />
                                    )}
                                  </td>
                                  <td className='px-2 py-2'>
                                    {si.description || '-'}
                                  </td>
                                  <td className='px-2 py-2'>
                                    {si.hsnCode || '-'}
                                  </td>
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
                                      <span className='text-gray-400'>
                                        Pending
                                      </span>
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
                              onClick={addScannedToRemarks}
                              disabled={selectedScannedIndices.size === 0}
                              className='flex items-center px-3 py-1.5 bg-orange-500 text-white text-xs rounded-lg hover:bg-orange-600 disabled:opacity-50'
                            >
                              <Plus className='w-3.5 h-3.5 mr-1' />
                              Add to Remarks ({selectedScannedIndices.size})
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Invoice Items (from PO) */}
                {items.length > 0 && (
                  <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                      <h2 className='text-base font-semibold text-gray-900'>
                        Invoice Items
                      </h2>
                    </div>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead>
                          <tr className='bg-[#fafbfc]'>
                            <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                              Item
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              PO Qty
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Remaining
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Invoice Qty
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Rate
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              CGST %
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              SGST %
                            </th>
                            <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-gray-100'>
                          {items.map((item, index) => (
                            <tr key={index} className='hover:bg-gray-50'>
                              <td className='px-4 py-3.5'>
                                <p className='text-sm font-medium text-gray-900'>
                                  {item.itemName}
                                </p>
                                {item.itemCode && (
                                  <p className='text-xs text-gray-500 mt-0.5'>
                                    {item.itemCode}
                                  </p>
                                )}
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                                {item.poQuantity}
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                                {item.remainingQuantity}
                              </td>
                              <td className='px-4 py-3.5'>
                                <input
                                  type='number'
                                  value={item.invoiceQuantity}
                                  onChange={e =>
                                    handleItemChange(
                                      index,
                                      'invoiceQuantity',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className='w-24 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                                  min='0'
                                  max={item.remainingQuantity}
                                  step='0.01'
                                  required
                                />
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                                ₹
                                {item.unitPrice.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                                {item.cgstRate}%
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm text-gray-600'>
                                {item.sgstRate}%
                              </td>
                              <td className='px-4 py-3.5 text-right text-sm font-semibold text-gray-900'>
                                ₹
                                {item.totalAmount.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className='px-6 py-4 border-t border-gray-200 bg-white'>
                      <div className='flex justify-end'>
                        <div className='w-80 bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3'>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Subtotal</span>
                            <span className='font-medium text-gray-900'>
                              ₹
                              {totals.subTotal.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          <div className='flex justify-between text-sm'>
                            <span className='text-gray-600'>Tax Amount</span>
                            <span className='font-medium text-gray-900'>
                              ₹
                              {totals.taxAmount.toLocaleString('en-IN', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          </div>
                          {freightCharges > 0 && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>
                                Freight Charges
                              </span>
                              <span className='font-medium text-gray-900'>
                                ₹
                                {freightCharges.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          )}
                          {discountAmount > 0 && (
                            <div className='flex justify-between text-sm'>
                              <span className='text-gray-600'>Discount</span>
                              <span className='font-medium text-red-600'>
                                -₹
                                {discountAmount.toLocaleString('en-IN', {
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
                                {totals.grandTotal.toLocaleString('en-IN', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Remarks */}
                <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
                  <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
                    <h2 className='text-base font-semibold text-gray-900'>
                      Remarks
                    </h2>
                  </div>
                  <div className='p-6'>
                    <textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      rows={4}
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-violet-500'
                      placeholder='Enter any remarks or notes...'
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEntryPage;
