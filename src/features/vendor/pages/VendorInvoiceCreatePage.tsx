import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import {
  useVendorOrder,
  useVendorPOItemsForInvoicing,
  useCreateVendorInvoice,
  VendorInvoiceItem,
} from '../hooks/useVendorPortal';
import toast from 'react-hot-toast';
import { apiClient, ApiResponse } from '@/lib/api';
import { Stepper } from '@/components/common/Stepper';
import StepUpload from '../components/invoice-wizard/StepUpload';
import StepInvoiceDetails from '../components/invoice-wizard/StepInvoiceDetails';
import StepLineItems from '../components/invoice-wizard/StepLineItems';
import StepReview from '../components/invoice-wizard/StepReview';
import FloatingPdfPanel, {
  PdfPanelMode,
} from '../components/invoice-wizard/FloatingPdfPanel';

// OCR data shape from backend
interface ExtractedOcrData {
  invoiceNumber?: string;
  invoiceDate?: string;
  supplierName?: string;
  grandTotal?: number;
  currency?: string;
  dueDate?: string;
  paymentTerms?: string;
  gstNumber?: string;
  panNumber?: string;
  billingAddress?: string;
  shippingAddress?: string;
  supplierAddress?: string;
  lineItems?: Array<{
    description: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    hsnCode?: string;
    unit?: string;
    taxRate?: number;
    taxAmount?: number;
  }>;
  rawText?: string;
  confidence: number;
}

interface InvoiceItemForm {
  poItemId: number;
  itemName: string;
  itemCode?: string;
  hsnSacCode?: string;
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

const WIZARD_STEPS = [
  { number: 1, label: 'Upload Invoice' },
  { number: 2, label: 'Invoice Details' },
  { number: 3, label: 'Line Items & Tax' },
  { number: 4, label: 'Review & Submit' },
];

const VendorInvoiceCreatePage: React.FC = () => {
  const { poId: _poId } = useParams<{ poId: string }>();
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

  // Wizard State
  const [currentStep, setCurrentStep] = useState(1);

  // PDF Panel State
  const [pdfPanelMode, setPdfPanelMode] = useState<PdfPanelMode>('hidden');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // OCR State
  const [isUploading, setIsUploading] = useState(false);
  const [ocrData, setOcrData] = useState<ExtractedOcrData | null>(null);
  const [ocrFilledFields, setOcrFilledFields] = useState<Set<string>>(
    new Set()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [paymentTerms, setPaymentTerms] = useState('');
  const [supplierGstin, setSupplierGstin] = useState('');
  const [supplierPan, setSupplierPan] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<InvoiceItemForm[]>([]);

  // Initialize items from PO
  useEffect(() => {
    if (poItems && poItems.length > 0) {
      const initialItems: InvoiceItemForm[] = poItems.map(
        (item: VendorInvoiceItem) => ({
          poItemId: item.poItemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          poQuantity: item.poQuantity,
          remainingQuantity: item.remainingQuantity,
          invoiceQuantity: item.remainingQuantity,
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

  // Handle File Upload & OCR
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL and show floating panel
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setUploadedFileName(file.name);
    setPdfPanelMode('floating');
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<ApiResponse<ExtractedOcrData>>(
        '/ocr/process',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 300000,
        }
      );

      if (response.data && response.data.success) {
        const result = response.data as any;
        const extracted = result.extractedData;
        const filledFields = new Set<string>();

        // Auto-fill header fields and track which ones were filled
        if (extracted.invoiceNumber) {
          setInvoiceNumber(extracted.invoiceNumber);
          filledFields.add('invoiceNumber');
        }

        if (extracted.invoiceDate) {
          if (/^\d{4}-\d{2}-\d{2}$/.test(extracted.invoiceDate)) {
            setInvoiceDate(extracted.invoiceDate);
            filledFields.add('invoiceDate');
          }
        } else if (extracted.rawText) {
          const dateMatch = extracted.rawText.match(/(\d{2})-(\d{2})-(\d{4})/);
          if (dateMatch) {
            const [, dd, mm, yyyy] = dateMatch;
            setInvoiceDate(`${yyyy}-${mm}-${dd}`);
            filledFields.add('invoiceDate');
          }
        }

        if (extracted.dueDate) {
          setDueDate(extracted.dueDate);
          filledFields.add('dueDate');
        }
        if (extracted.currency) {
          setCurrency(extracted.currency);
          filledFields.add('currency');
        }
        if (extracted.paymentTerms) {
          setPaymentTerms(extracted.paymentTerms);
          filledFields.add('paymentTerms');
        }
        if (extracted.gstNumber) {
          setSupplierGstin(extracted.gstNumber);
          filledFields.add('supplierGstin');
        }
        if (extracted.panNumber) {
          setSupplierPan(extracted.panNumber);
          filledFields.add('supplierPan');
        }
        if (extracted.billingAddress) {
          setBillingAddress(extracted.billingAddress);
          filledFields.add('billingAddress');
        }
        if (extracted.shippingAddress) {
          setShippingAddress(extracted.shippingAddress);
          filledFields.add('shippingAddress');
        }
        if (extracted.supplierAddress && !extracted.billingAddress) {
          setBillingAddress(extracted.supplierAddress);
          filledFields.add('billingAddress');
        }

        setOcrFilledFields(filledFields);
        setOcrData(extracted);

        if (extracted.lineItems && extracted.lineItems.length > 0) {
          toast.success(
            `Scanned ${extracted.lineItems.length} line items. Review in Step 3.`
          );
        }

        // Auto-advance to step 2
        setCurrentStep(2);
      }
    } catch (error) {
      console.error('OCR Error:', error);
      toast.error('Failed to extract data. Please enter details manually.');
      setCurrentStep(2);
    } finally {
      setIsUploading(false);
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    let subtotal = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    let totalTax = 0;

    const calculatedItems = items.map(item => {
      const taxableValue = item.invoiceQuantity * item.unitPrice;
      const cgstAmt = (taxableValue * item.cgstRate) / 100;
      const sgstAmt = (taxableValue * item.sgstRate) / 100;
      const igstAmt = (taxableValue * item.igstRate) / 100;
      const otherTaxAmt = (taxableValue * item.otherTaxRate) / 100;
      const itemTax = cgstAmt + sgstAmt + igstAmt + otherTaxAmt;
      const itemTotal = taxableValue + itemTax;

      subtotal += taxableValue;
      totalCgst += cgstAmt;
      totalSgst += sgstAmt;
      totalIgst += igstAmt;
      totalTax += itemTax;

      return {
        ...item,
        taxableValue,
        cgstAmount: cgstAmt,
        sgstAmount: sgstAmt,
        igstAmount: igstAmt,
        taxAmount: itemTax,
        totalAmount: itemTotal,
      };
    });

    return {
      subtotal,
      totalCgst,
      totalSgst,
      totalIgst,
      taxAmount: totalTax,
      grandTotal: subtotal + totalTax,
      calculatedItems,
    };
  }, [items]);

  // Handlers
  const handleQuantityChange = (index: number, value: string) => {
    const qty = parseFloat(value) || 0;
    setItems(prev => {
      const updated = [...prev];
      const validQty = Math.min(
        Math.max(0, qty),
        updated[index].remainingQuantity
      );
      updated[index] = { ...updated[index], invoiceQuantity: validQty };
      return updated;
    });
  };

  const handleItemFieldChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleFieldChange = useCallback((field: string, value: string) => {
    const setters: Record<string, (v: string) => void> = {
      invoiceNumber: setInvoiceNumber,
      invoiceDate: setInvoiceDate,
      dueDate: setDueDate,
      currency: setCurrency,
      paymentTerms: setPaymentTerms,
      remarks: setRemarks,
      supplierGstin: setSupplierGstin,
      supplierPan: setSupplierPan,
      billingAddress: setBillingAddress,
      shippingAddress: setShippingAddress,
    };
    setters[field]?.(value);
  }, []);

  const handleSubmit = () => {
    if (!poIdNum || !order) return;

    if (!invoiceNumber.trim()) {
      toast.error('Please enter an invoice number');
      setCurrentStep(2);
      return;
    }

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
      setCurrentStep(3);
      return;
    }

    createInvoiceMutation.mutate(
      {
        poId: poIdNum,
        invoiceNumber,
        invoiceDate,
        supplierId: order.supplierId || 0,
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

  // Step validation
  const canAdvance = () => {
    if (currentStep === 2) {
      if (!invoiceNumber.trim()) {
        toast.error('Invoice number is required');
        return false;
      }
      if (!invoiceDate) {
        toast.error('Invoice date is required');
        return false;
      }
    }
    if (currentStep === 3) {
      const hasItems = items.some(i => i.invoiceQuantity > 0);
      if (!hasItems) {
        toast.error('At least one item must have quantity > 0');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (canAdvance()) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Loading state
  if (orderLoading || itemsLoading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-violet-600' />
      </div>
    );
  }

  // Error state
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

  const minInvoiceDate = order.poDate
    ? new Date(order.poDate).toISOString().split('T')[0]
    : undefined;

  return (
    <div className='p-6 max-w-[1400px] mx-auto'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
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

      {/* Stepper */}
      <Stepper steps={WIZARD_STEPS} currentStep={currentStep} />

      {/* Step Content */}
      <div className='min-h-[400px]'>
        {currentStep === 1 && (
          <StepUpload
            fileInputRef={fileInputRef}
            onFileUpload={handleFileUpload}
            onSkip={() => setCurrentStep(2)}
            isUploading={isUploading}
          />
        )}

        {currentStep === 2 && (
          <StepInvoiceDetails
            invoiceNumber={invoiceNumber}
            invoiceDate={invoiceDate}
            dueDate={dueDate}
            currency={currency}
            paymentTerms={paymentTerms}
            remarks={remarks}
            supplierGstin={supplierGstin}
            supplierPan={supplierPan}
            billingAddress={billingAddress}
            shippingAddress={shippingAddress}
            ocrFilledFields={ocrFilledFields}
            minInvoiceDate={minInvoiceDate}
            onFieldChange={handleFieldChange}
          />
        )}

        {currentStep === 3 && (
          <StepLineItems
            totals={totals}
            ocrLineItems={ocrData?.lineItems}
            onQuantityChange={handleQuantityChange}
            onItemFieldChange={handleItemFieldChange}
          />
        )}

        {currentStep === 4 && (
          <StepReview
            data={{
              invoiceNumber,
              invoiceDate,
              dueDate,
              currency,
              paymentTerms,
              remarks,
              supplierGstin,
              supplierPan,
              billingAddress,
              shippingAddress,
            }}
            totals={totals}
            ocrFilledFields={ocrFilledFields}
            isPending={createInvoiceMutation.isPending}
            onSubmit={handleSubmit}
            onEditStep={setCurrentStep}
          />
        )}
      </div>

      {/* Navigation Buttons */}
      {currentStep < 4 && (
        <div className='flex justify-between mt-8 pt-6 border-t'>
          <button
            type='button'
            onClick={handleBack}
            disabled={currentStep === 1}
            className='px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>
          <button
            type='button'
            onClick={handleNext}
            className='px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors flex items-center gap-2'
          >
            Next
            <ArrowRight className='w-4 h-4' />
          </button>
        </div>
      )}

      {/* Back button on review step */}
      {currentStep === 4 && (
        <div className='flex justify-start mt-8 pt-6 border-t'>
          <button
            type='button'
            onClick={handleBack}
            className='px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>
        </div>
      )}

      {/* Floating PDF Panel */}
      <FloatingPdfPanel
        mode={pdfPanelMode}
        onModeChange={setPdfPanelMode}
        previewUrl={previewUrl}
        isUploading={isUploading}
        fileName={uploadedFileName}
      />
    </div>
  );
};

export default VendorInvoiceCreatePage;
