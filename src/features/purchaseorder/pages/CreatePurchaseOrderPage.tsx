import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
  FileText,
  FileSearch,
  ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';
import { POStatus } from '../types';
import {
  useGeneratePONumber,
  useCreatePOFromRFP,
  useCreatePurchaseOrder,
  useSubmitPOForApproval,
  useApprovedRFPsForPOCreation,
} from '../hooks/usePurchaseOrders';
import { useVendors } from '../../master/hooks/useVendorAPI';
import { useContract } from '../../contract/hooks/useContract';
import { apiClient } from '@/lib/api';

const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfpIdParam = searchParams.get('rfpId');
  const contractIdParam = searchParams.get('contractId');

  // Step state: 'select-rfp' (Step 1) or 'create-po' (Step 2)
  const [currentStep, setCurrentStep] = useState<'select-rfp' | 'create-po'>(
    rfpIdParam || contractIdParam ? 'create-po' : 'select-rfp'
  );
  const [selectedRfpId, setSelectedRfpId] = useState<string>('');

  const [loading, setLoading] = useState(false);
  const [loadingRFP, setLoadingRFP] = useState(false);
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    poNumber: '',
    rfpNumber: '',
    quotationNumber: '',
    poDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: '',
    supplierId: 0,
    supplierName: '',
    contractNumber: '',
    raisedBy: '',
    department: '',
    approvalGroup: '',
    paymentTerms: '',
    termsConditions: 'DELIEVERY AS PER SCHEDULE',
    shipToAddress: '',
    billToAddress: '',
    remarks: '',
    items: [],
    currency: 'INR',
    subTotal: 0,
    taxAmount: 0,
    grandTotal: 0,
  });

  // React Query hooks
  const { data: generatedPONumber, isLoading: isGeneratingPO } =
    useGeneratePONumber();
  const createPOFromRFP = useCreatePOFromRFP();
  const createPO = useCreatePurchaseOrder();
  const submitForApproval = useSubmitPOForApproval();
  const { data: vendors = [] } = useVendors();
  const { data: approvedRFPs = [], isLoading: isLoadingRFPs } =
    useApprovedRFPsForPOCreation();
  const { data: contractData, isLoading: isLoadingContract } = useContract(
    Number(contractIdParam)
  );

  // Load RFP data when rfpId param is present (direct link)
  useEffect(() => {
    if (rfpIdParam) {
      setSelectedRfpId(rfpIdParam);
      loadRFPData(parseInt(rfpIdParam));
    }
  }, [rfpIdParam]);

  // Set generated PO number when available
  useEffect(() => {
    if (
      generatedPONumber &&
      !formData.poNumber &&
      currentStep === 'create-po'
    ) {
      setFormData(prev => ({ ...prev, poNumber: generatedPONumber }));
    }
  }, [generatedPONumber, currentStep]);

  // Load Contract data when contractId is present
  useEffect(() => {
    if (contractIdParam && contractData) {
      setFormData(prev => ({
        ...prev,
        contractNumber: contractData.contractNumber,
        supplierId: contractData.vendorId,
        supplierName: contractData.vendorName,
        paymentTerms: contractData.paymentTerms,
        termsConditions: 'DELIEVERY AS PER SCHEDULE',
      }));
      toast.success('Contract data loaded successfully');
    }
  }, [contractIdParam, contractData]);

  const loadRFPData = async (id: number) => {
    try {
      setLoadingRFP(true);
      const response = await apiClient.get(`/rfp/${id}`);
      const rfp = response.data;

      const selectedQuotation = rfp.quotations?.find((q: any) => q.isSelected);

      if (!selectedQuotation) {
        toast.error('No selected quotation found for this RFP');
        setCurrentStep('select-rfp');
        return;
      }

      const mappedItems: PurchaseOrderItem[] =
        selectedQuotation.items?.map((item: any) => ({
          itemName: item.itemName || '',
          itemCode: item.itemCode || '',
          description: item.description || '',
          quantity: item.quantity || 0,
          unitOfMeasurement: item.unitOfMeasurement || '',
          unitPrice: item.unitPrice || 0,
          deliveryDate: rfp.deliveryDate || '',
          tax1Type: 'CGST',
          tax1Rate: 9,
          tax2Type: 'SGST',
          tax2Rate: 9,
          tax1Amount: (item.quantity * item.unitPrice * 9) / 100,
          tax2Amount: (item.quantity * item.unitPrice * 9) / 100,
          tax1Value: (item.quantity * item.unitPrice * 9) / 100,
          tax2Value: (item.quantity * item.unitPrice * 9) / 100,
          totalAmount: item.quantity * item.unitPrice,
          grandTotal: item.quantity * item.unitPrice * 1.18,
          remarks: item.remarks || '',
        })) || [];

      setFormData(prev => ({
        ...prev,
        rfpNumber: rfp.rfpNumber || '',
        quotationNumber: selectedQuotation.quotationNumber || '',
        supplierId: selectedQuotation.supplierId || 0,
        supplierName: selectedQuotation.supplierName || '',
        deliveryDate: rfp.deliveryDate || '',
        department: rfp.department || '',
        paymentTerms: selectedQuotation.paymentTerms || '',
        termsConditions:
          selectedQuotation.termsAndConditions || 'DELIEVERY AS PER SCHEDULE',
        items: mappedItems,
      }));

      calculateTotalsForItems(mappedItems);
      setCurrentStep('create-po');
      toast.success('RFP data loaded successfully');
    } catch (error: any) {
      console.error('Error loading RFP data:', error);
      toast.error(error.response?.data?.message || 'Failed to load RFP data');
    } finally {
      setLoadingRFP(false);
    }
  };

  const calculateTotalsForItems = (items: PurchaseOrderItem[]) => {
    const subTotal = items.reduce(
      (sum, item) => sum + (item.totalAmount || 0),
      0
    );
    const taxAmount = items.reduce(
      (sum, item) => sum + (item.tax1Amount || 0) + (item.tax2Amount || 0),
      0
    );
    const grandTotal = subTotal + taxAmount;
    setFormData(prev => ({ ...prev, subTotal, taxAmount, grandTotal }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Next button click - validate and load RFP data
  const handleNext = () => {
    if (!selectedRfpId) {
      toast.error('Please select an RFP');
      return;
    }
    loadRFPData(parseInt(selectedRfpId));
    // Update URL
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('rfpId', selectedRfpId);
    window.history.pushState({}, '', newUrl.toString());
  };

  // Handle Back button - go back to RFP selection
  const handleBackToSelection = () => {
    setCurrentStep('select-rfp');
    setFormData(prev => ({
      ...prev,
      rfpNumber: '',
      quotationNumber: '',
      supplierId: 0,
      supplierName: '',
      items: [],
    }));
    // Clear URL param
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('rfpId');
    window.history.pushState({}, '', newUrl.toString());
  };

  const handleSubmit = async (shouldSubmitForApproval: boolean = false) => {
    try {
      setLoading(true);

      if (!formData.poNumber) {
        toast.error('PO Number is required');
        return;
      }
      if (!formData.supplierName) {
        toast.error('Supplier is required');
        return;
      }
      if (!formData.items || formData.items.length === 0) {
        toast.error('At least one item is required');
        return;
      }

      const poData = { ...formData, status: POStatus.DRAFT };
      let createdPO: any;

      if (selectedRfpId) {
        createdPO = await createPOFromRFP.mutateAsync({
          rfpId: parseInt(selectedRfpId),
          data: poData,
        });
      } else {
        createdPO = await createPO.mutateAsync(poData);
      }

      if (shouldSubmitForApproval && createdPO?.id) {
        await submitForApproval.mutateAsync(createdPO.id);
      }

      navigate('/purchase-orders');
    } catch (error: any) {
      console.error('Error saving PO:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading states
  if (loadingRFP || (contractIdParam && isLoadingContract)) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] flex items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='w-12 h-12 animate-spin text-violet-600 mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>
            {loadingRFP ? 'Loading RFP data...' : 'Loading Contract data...'}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // STEP 1: RFP SELECTION (only RFP dropdown + Next button)
  // =====================================================
  if (currentStep === 'select-rfp' && !contractIdParam) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        {/* Page Header */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/purchase-orders')}
              className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors'
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                Create Purchase Order
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                Select an approved RFP to create a purchase order
              </p>
            </div>
          </div>
          <button
            onClick={handleNext}
            disabled={!selectedRfpId}
            className='inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Next
            <ArrowRight size={16} />
          </button>
        </div>

        {/* RFP Selection Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <FileSearch size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Select RFP
                </h2>
                <p className='text-xs text-gray-500'>
                  Choose an approved RFP with a selected quotation
                </p>
              </div>
            </div>
          </div>

          <div className='p-6'>
            {isLoadingRFPs ? (
              <div className='flex items-center justify-center py-8'>
                <Loader2 className='w-6 h-6 animate-spin text-violet-600' />
                <span className='ml-3 text-gray-500'>
                  Loading approved RFPs...
                </span>
              </div>
            ) : approvedRFPs.length === 0 ? (
              <div className='text-center py-12'>
                <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <FileText className='w-8 h-8 text-gray-400' />
                </div>
                <h3 className='text-lg font-medium text-gray-600 mb-2'>
                  No Approved RFPs Available
                </h3>
                <p className='text-sm text-gray-500 mb-4'>
                  There are no approved RFPs with selected quotations ready for
                  PO creation.
                </p>
                <button
                  onClick={() => navigate('/rfp')}
                  className='inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors'
                >
                  Go to RFP List
                </button>
              </div>
            ) : (
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> RFP Number
                </label>
                <div className='relative'>
                  <select
                    value={selectedRfpId}
                    onChange={e => setSelectedRfpId(e.target.value)}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select RFP</option>
                    {approvedRFPs.map((rfp: any) => (
                      <option key={rfp.id} value={rfp.id}>
                        {rfp.rfpNumber}{' '}
                        {rfp.supplierName ? `- ${rfp.supplierName}` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>

                {/* Info Banner */}
                <div className='mt-6 bg-violet-50 border border-violet-200 rounded-lg p-4'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 bg-violet-100 rounded-lg'>
                      <FileText size={18} className='text-violet-600' />
                    </div>
                    <div>
                      <h3 className='text-sm font-semibold text-violet-900'>
                        Create PO from RFP
                      </h3>
                      <p className='text-sm text-violet-700'>
                        Select an approved RFP and click "Next" to create a
                        Purchase Order. Item details and pricing will be
                        pre-filled from the selected quotation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =====================================================
  // STEP 2: CREATE PO FORM (with pre-populated data from RFP)
  // =====================================================
  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <button
            onClick={handleBackToSelection}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200 transition-colors'
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              Create Purchase Order from RFP
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              RFP: {formData.rfpNumber}
            </p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading || !formData.items?.length}
            className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading || !formData.items?.length}
            className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Submit
          </button>
        </div>
      </div>

      <form className='space-y-6'>
        {/* RFP Info Banner */}
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <AlertCircle className='w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0' />
            <div className='flex-1'>
              <h4 className='text-sm font-medium text-blue-900 mb-1'>
                Creating PO from RFP
              </h4>
              <div className='text-sm text-blue-700 space-y-1'>
                <p>
                  <strong>RFP Number:</strong> {formData.rfpNumber}
                  {formData.quotationNumber && (
                    <span className='ml-3'>
                      <strong>Quotation:</strong> {formData.quotationNumber}
                    </span>
                  )}
                </p>
                <p>
                  <strong>Supplier:</strong> {formData.supplierName}
                </p>
                <p className='text-xs mt-2'>
                  Item details and pricing have been pre-filled from the
                  selected quotation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <FileText size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  PO Details
                </h2>
                <p className='text-xs text-gray-500'>
                  Review and complete the purchase order details
                </p>
              </div>
            </div>
          </div>

          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Raised By
                </label>
                <div className='relative'>
                  <select
                    name='raisedBy'
                    value={formData.raisedBy}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select</option>
                    <option value='Wei'>Wei</option>
                    <option value='Admin'>Admin</option>
                    <option value='Manager'>Manager</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Supplier
                </label>
                <input
                  type='text'
                  value={formData.supplierName || ''}
                  disabled
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600'
                />
                <p className='text-xs text-blue-600 mt-1'>
                  Pre-selected from RFP
                </p>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> PO Date
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    name='poDate'
                    value={formData.poDate}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  />
                  <Calendar className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Delivery Date
                </label>
                <div className='relative'>
                  <input
                    type='date'
                    name='deliveryDate'
                    value={formData.deliveryDate}
                    onChange={handleInputChange}
                    min={formData.poDate}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  />
                  <Calendar className='absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Terms & Conditions
                </label>
                <div className='relative'>
                  <select
                    name='termsConditions'
                    value={formData.termsConditions}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value='DELIEVERY AS PER SCHEDULE'>
                      DELIVERY AS PER SCHEDULE
                    </option>
                    <option value='IMMEDIATE DELIVERY'>
                      IMMEDIATE DELIVERY
                    </option>
                    <option value='PARTIAL DELIVERY ALLOWED'>
                      PARTIAL DELIVERY ALLOWED
                    </option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Payment Terms
                </label>
                <div className='relative'>
                  <select
                    name='paymentTerms'
                    value={formData.paymentTerms}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select</option>
                    <option value='NETT 30 DAYS'>NETT 30 DAYS</option>
                    <option value='NETT 45 DAYS'>NETT 45 DAYS</option>
                    <option value='NETT 60 DAYS'>NETT 60 DAYS</option>
                    <option value='IMMEDIATE'>IMMEDIATE</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Approval Group
                </label>
                <div className='relative'>
                  <select
                    name='approvalGroup'
                    value={formData.approvalGroup}
                    onChange={handleInputChange}
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select</option>
                    <option value='HOD/CTO/COO/CEO'>HOD/CTO/COO/CEO</option>
                    <option value='MANAGER/DIRECTOR'>MANAGER/DIRECTOR</option>
                    <option value='FINANCE/CFO'>FINANCE/CFO</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Ship To
                </label>
                <textarea
                  name='shipToAddress'
                  value={formData.shipToAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                  placeholder='Enter shipping address...'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Bill To
                </label>
                <textarea
                  name='billToAddress'
                  value={formData.billToAddress}
                  onChange={handleInputChange}
                  rows={3}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                  placeholder='Enter billing address...'
                />
              </div>
            </div>

            <div className='mt-6'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Remarks
              </label>
              <textarea
                name='remarks'
                value={formData.remarks}
                onChange={handleInputChange}
                rows={2}
                className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                placeholder='Enter any additional remarks...'
              />
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <h2 className='text-sm font-semibold text-gray-800'>
              Item Details
            </h2>
            <p className='text-xs text-gray-500'>
              Items populated from selected RFP quotation
            </p>
          </div>

          <div className='p-6'>
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-800'>
              Items are populated from the selected RFP and cannot be modified
              here.
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead>
                  <tr className='bg-[#fafbfc]'>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Item Name
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Remarks
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Delivery Date
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Quantity
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Unit Price
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Tax-1
                    </th>
                    <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                      Tax-2
                    </th>
                    <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600'>
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {formData.items?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className='px-4 py-8 text-center text-gray-500'
                      >
                        No items found in the selected RFP quotation.
                      </td>
                    </tr>
                  ) : (
                    formData.items?.map((item, index) => (
                      <tr key={index} className='hover:bg-gray-50'>
                        <td className='px-4 py-3 text-sm text-gray-900 font-medium'>
                          {item.itemName}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-500'>
                          {item.remarks || '-'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {item.deliveryDate
                            ? format(new Date(item.deliveryDate), 'dd MMM yyyy')
                            : '-'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {item.quantity}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          ₹{item.unitPrice.toFixed(2)}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {item.tax1Type} ({item.tax1Rate}%)
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-600'>
                          {item.tax2Type} ({item.tax2Rate}%)
                        </td>
                        <td className='px-4 py-3 text-sm font-semibold text-gray-900 text-right'>
                          ₹{item.grandTotal?.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {formData.items && formData.items.length > 0 && (
                  <tfoot className='bg-[#fafbfc] border-t border-gray-200'>
                    <tr>
                      <td
                        colSpan={7}
                        className='px-4 py-4 text-right text-sm font-semibold text-gray-700'
                      >
                        Grand Total:
                      </td>
                      <td className='px-4 py-4 text-right text-lg font-bold text-violet-600'>
                        ₹
                        {formData.items
                          .reduce(
                            (sum, item) => sum + (item.grandTotal || 0),
                            0
                          )
                          .toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>

        {/* Total Amount Footer */}
        <div className='flex justify-end'>
          <div className='bg-white rounded-lg border border-gray-200 px-6 py-4'>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-gray-600'>
                Total Amount:
              </span>
              <span className='text-xl font-bold text-violet-600'>
                ₹
                {(formData.grandTotal || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePurchaseOrderPage;
