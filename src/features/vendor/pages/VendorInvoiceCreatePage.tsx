import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Upload,
  Eye,
  Scan,
  X,
  File as FileIcon
} from 'lucide-react';
import {
  useVendorOrder,
  useVendorPOItemsForInvoicing,
  useCreateVendorInvoice,
  VendorInvoiceItem,
} from '../hooks/useVendorPortal';
import toast from 'react-hot-toast';
import { apiClient, ApiResponse } from '@/lib/api';

// Define the shape of relevant OCR data
interface ExtractedOcrData {
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierName?: string;
  grandTotal?: number;
  currency?: string;
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
  }>;
  rawText?: string;
  confidence: number;
}

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
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  // Get PO ID from URL query params manually
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

  // UI State
  const [activeTab, setActiveTab] = useState<'manual' | 'upload'>('manual');
  const [splitView, setSplitView] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // OCR State
  const [isUploading, setIsUploading] = useState(false);
  const [ocrData, setOcrData] = useState<ExtractedOcrData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // Debug PO items loading
  useEffect(() => {
    console.log('DEBUG: poItems changed:', poItems);
    if (poItems && poItems.length > 0) {
      console.log('DEBUG: Initializing items state with', poItems.length, 'entries');
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
    } else {
      console.warn('DEBUG: poItems is empty or undefined');
    }
  }, [poItems]);

  // Handle File Upload & OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setSplitView(true);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    console.log('DEBUG: Starting OCR upload. Current items state:', items);
    console.log('DEBUG: PO ID:', poIdNum);

    console.log('DEBUG: Starting OCR for PO:', poIdNum);
    console.log('DEBUG: Current PO Items:', items);

    try {
      // Call Backend OCR Endpoint
      // Note: apiClient adds the Authorization header automatically
      const response = await apiClient.post<ApiResponse<ExtractedOcrData>>('/ocr/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 120000, // Increase timeout to 2 minutes for LLM processing
      });

      if (response.data && response.data.success) {
        // According to OcrResultDto from backend: { success: true, extractedData: {...} }
        // Depending on apiClient response wrapping, check if we need response.data.data
        // The backend returns OcrResultDto directly.
        const result = response.data as any; // Cast to avoid strict type issues for now or define interface
        const extracted = result.extractedData;

        // Auto-fill header fields
        if (extracted.invoiceNumber) setInvoiceNumber(extracted.invoiceNumber);

        // Date parsing: Try standard format first, then fallback to DD-MM-YYYY
        if (extracted.invoiceDate) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(extracted.invoiceDate)) {
            setInvoiceDate(extracted.invoiceDate);
          }
        } else if (extracted.rawText) {
          // Fallback: simple regex for dd-mm-yyyy in rawText if LLM missed it
          const dateMatch = extracted.rawText.match(/(\d{2})-(\d{2})-(\d{4})/);
          if (dateMatch) {
            const [_, dd, mm, yyyy] = dateMatch;
            setInvoiceDate(`${yyyy}-${mm}-${dd}`);
          }
        }

        setOcrData(extracted);

        // --- ITEM MAPPING LOGIC ---
        if (extracted.lineItems && extracted.lineItems.length > 0) {
          setItems(prevItems => {
            const newItems = [...prevItems];
            const usedIndices = new Set<number>(); // Track mapped PO items

            extracted.lineItems?.forEach(ocrItem => {
              const ocrDesc = ocrItem.description?.toLowerCase() || '';
              const ocrAmount = ocrItem.amount || 0;
              const ocrPrice = ocrItem.unitPrice || 0;

              // Find best match in PO items
              // Strategy: 
              // 1. Exact amount match (Unit Price)
              // 2. Description contains fuzzy match

              let bestMatchIndex = -1;

              // Try to find by Unit Price (most reliable for numbers)
              bestMatchIndex = newItems.findIndex((poItem, idx) => {
                if (usedIndices.has(idx)) return false;
                return Math.abs(poItem.unitPrice - ocrPrice) < 1.0; // Within 1 rupee diff
              });

              // If not found, try description
              if (bestMatchIndex === -1 && ocrDesc) {
                bestMatchIndex = newItems.findIndex((poItem, idx) => {
                  if (usedIndices.has(idx)) return false;
                  const poDesc = poItem.itemName.toLowerCase();
                  return poDesc.includes(ocrDesc) || ocrDesc.includes(poDesc);
                });
              }

              // If match found, update the item
              if (bestMatchIndex !== -1) {
                usedIndices.add(bestMatchIndex);
                const targetItem = newItems[bestMatchIndex];

                // Update quantity based on OCR, but cap at remaining
                const scannedQty = ocrItem.quantity || 1;
                const validQty = Math.min(scannedQty, targetItem.remainingQuantity);

                newItems[bestMatchIndex] = {
                  ...targetItem,
                  invoiceQuantity: validQty,
                  // Optional: Update unit price if allowed? usually PO price is fixed.
                  // For now keeping PO unit price but filling quantity.
                };
              }
            });

            return newItems;
          });
          toast.success(`Mapped OCR items to PO items automatically.`);
        }
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract data. Please enter details manually.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClearUpload = () => {
    setPreviewUrl(null);
    setSplitView(false);
    setOcrData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setActiveTab('manual'); // Reset to manual view logic internally even if staying on upload tab intent
  };

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
          toast.success('Invoice submitted successfully');
          navigate('/vendor/invoices');
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

  // --- Render Components ---

  const renderTabs = () => (
    <div className='flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6 w-fit'>
      <button
        onClick={() => { setActiveTab('manual'); setSplitView(false); }}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'manual'
          ? 'bg-white text-violet-700 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <span className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Manual Entry
        </span>
      </button>
      <button
        onClick={() => setActiveTab('upload')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'upload'
          ? 'bg-white text-violet-700 shadow-sm'
          : 'text-gray-500 hover:text-gray-700'
          }`}
      >
        <span className="flex items-center gap-2">
          <Scan className="w-4 h-4" />
          Upload & Auto-Fill
        </span>
      </button>
    </div>
  );

  const renderUploadArea = () => (
    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-12 mb-6 text-center hover:border-violet-500 transition-colors">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-violet-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Invoice</h3>
        <p className="text-gray-500 mb-6 max-w-md">
          Drag and drop your PDF or image invoice here, or click to browse.
          We'll extract the details for you.
        </p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Select File
        </button>
      </div>
    </div>
  );

  const renderFormContent = () => (
    <div className='space-y-6'>
      {/* Invoice Details Card */}
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <FileText className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              Invoice Details
            </h2>
          </div>
          {ocrData && (
            <div className='flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200'>
              <CheckCircle className="w-3 h-3" />
              Data Extracted
            </div>
          )}
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
      <div className='bg-white border rounded-lg overflow-hidden shadow-sm'>
        <div className='p-4 border-b bg-gray-50 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Package className='w-5 h-5 text-violet-600' />
            <h2 className='text-lg font-semibold text-gray-900'>
              Line Items
            </h2>
          </div>
          <div className='text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded'>
            Matches PO items
          </div>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b'>
              <tr>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Item</th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>Rem</th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Price</th>
                <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-24'>Qty</th>
                <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Total</th>
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
                  <td className='px-4 py-3'>
                    <div className='font-medium text-gray-900 text-sm'>{item.itemName}</div>
                    <div className='text-xs text-gray-500'>{item.itemCode}</div>
                  </td>
                  <td className='px-4 py-3 text-center text-sm font-medium text-violet-600'>
                    {item.remainingQuantity}
                  </td>
                  <td className='px-4 py-3 text-right text-sm text-gray-900'>
                    {item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className='px-4 py-3'>
                    <input
                      type='number'
                      value={item.invoiceQuantity}
                      onChange={e => handleQuantityChange(index, e.target.value)}
                      className='w-full px-2 py-1 border rounded text-center text-sm focus:ring-1 focus:ring-violet-500'
                      min='0'
                      max={item.remainingQuantity}
                      disabled={item.remainingQuantity <= 0}
                    />
                  </td>
                  <td className='px-4 py-3 text-right text-sm font-medium text-gray-900'>
                    {item.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {
        ocrData?.lineItems && ocrData.lineItems.length > 0 && (
          <div className='bg-white border rounded-lg overflow-hidden shadow-sm mt-6 border-orange-200'>
            <div className='p-4 border-b bg-orange-50 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <AlertCircle className='w-5 h-5 text-orange-600' />
                <h2 className='text-lg font-semibold text-gray-900'>
                  Scanned Items (Raw Data)
                </h2>
              </div>
              <div className='text-xs text-orange-800 bg-orange-100 px-2 py-1 rounded'>
                Verify & Match Manually if needed
              </div>
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>Description</th>
                    <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Qty</th>
                    <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Price</th>
                    <th className='px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase'>Total</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {ocrData.lineItems.map((item, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm text-gray-900'>{item.description}</td>
                      <td className='px-4 py-3 text-right text-sm text-gray-900'>{item.quantity}</td>
                      <td className='px-4 py-3 text-right text-sm text-gray-900'>{item.unitPrice}</td>
                      <td className='px-4 py-3 text-right text-sm text-gray-900'>{item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      }

      {/* Summary Card */}
      <div className='flex justify-end'>
        <div className='w-full md:w-2/3 bg-white border rounded-lg p-6 space-y-3 shadow-sm'>
          <div className='flex justify-between text-gray-600'>
            <span>Subtotal</span>
            <span>₹ {totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className='flex justify-between text-gray-600'>
            <span>Total Tax</span>
            <span>₹ {totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className='pt-3 border-t flex justify-between font-bold text-lg text-gray-900'>
            <span>Grand Total</span>
            <span className='text-violet-600'>
              ₹ {totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <button
            type='submit'
            disabled={createInvoiceMutation.isPending || totals.grandTotal <= 0}
            className='w-full mt-4 bg-violet-600 text-white py-3 rounded-lg hover:bg-violet-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50'
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
    </div >
  );

  return (
    <div className='p-6 max-w-[1600px] mx-auto space-y-6 h-screen flex flex-col'>
      {/* Header (Always Visible) */}
      <div className='flex items-center justify-between mb-4 flex-shrink-0'>
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

      {/* Tabs */}
      <div className="flex-shrink-0">
        {renderTabs()}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0">
        {activeTab === 'upload' && !splitView && renderUploadArea()}

        {/* Split View Container */}
        {splitView ? (
          <div className="flex h-full gap-6">
            {/* Left Pane: PDF Viewer */}
            <div className="w-1/2 bg-gray-800 rounded-lg overflow-hidden flex flex-col shadow-lg">
              <div className="p-3 bg-gray-900 text-white flex justify-between items-center">
                <span className="flex items-center gap-2 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  Document Preview
                </span>
                <button onClick={handleClearUpload} className="text-gray-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 bg-gray-700 items-center justify-center flex relative">
                {isUploading ? (
                  <div className="text-center text-white">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-violet-400" />
                    <p>Analyzing document...</p>
                    <p className="text-xs text-gray-400 mt-1">This may take a few seconds</p>
                  </div>
                ) : previewUrl ? (
                  <iframe
                    src={previewUrl}
                    className="w-full h-full object-contain bg-gray-500"
                    title="Invoice Preview"
                  />
                ) : (
                  <div className="text-gray-400">No preview available</div>
                )}
              </div>
            </div>

            {/* Right Pane: Form */}
            <div className="w-1/2 overflow-y-auto pr-2 pb-6">
              <form onSubmit={handleSubmit}>
                {renderFormContent()}
              </form>
            </div>
          </div>
        ) : (
          activeTab === 'manual' && (
            <div className="max-w-7xl mx-auto">
              <form onSubmit={handleSubmit}>
                {renderFormContent()}
              </form>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default VendorInvoiceCreatePage;
