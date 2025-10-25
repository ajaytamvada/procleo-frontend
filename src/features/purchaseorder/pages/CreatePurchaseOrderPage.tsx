import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Send, Calendar, Loader2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';
import { POType, POStatus } from '../types';
import {
  useGeneratePONumber,
  useCreatePOFromRFP,
  useCreatePurchaseOrder,
  useSubmitPOForApproval
} from '../hooks/usePurchaseOrders';
import { apiClient } from '@/lib/api';

const CreatePurchaseOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rfpId = searchParams.get('rfpId');

  const [loading, setLoading] = useState(false);
  const [loadingRFP, setLoadingRFP] = useState(false);
  const [activeTab, setActiveTab] = useState('itemDetails');
  const [formData, setFormData] = useState<Partial<PurchaseOrder>>({
    poNumber: '',
    rfpNumber: '',
    quotationNumber: '',
    poDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: '',
    supplierId: 0,
    supplierName: '',
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
    grandTotal: 0
  });

  // React Query hooks
  const { data: generatedPONumber, isLoading: isGeneratingPO } = useGeneratePONumber();
  const createPOFromRFP = useCreatePOFromRFP();
  const createPO = useCreatePurchaseOrder();
  const submitForApproval = useSubmitPOForApproval();

  const [newItem, setNewItem] = useState<Partial<PurchaseOrderItem>>({
    itemName: '',
    itemCode: '',
    quantity: 1,
    unitOfMeasurement: '',
    unitPrice: 0,
    deliveryDate: '',
    tax1Type: 'CGST',
    tax1Rate: 9,
    tax2Type: 'SGST',
    tax2Rate: 9,
    totalAmount: 0,
    grandTotal: 0
  });

  // Load RFP data when rfpId is present
  useEffect(() => {
    if (rfpId) {
      loadRFPData(parseInt(rfpId));
    }
  }, [rfpId]);

  // Set generated PO number when available
  useEffect(() => {
    if (generatedPONumber && !formData.poNumber) {
      setFormData(prev => ({ ...prev, poNumber: generatedPONumber }));
    }
  }, [generatedPONumber]);

  const loadRFPData = async (id: number) => {
    try {
      setLoadingRFP(true);
      const response = await apiClient.get(`/rfp/${id}`);
      const rfp = response.data;

      // Find selected quotation
      const selectedQuotation = rfp.quotations?.find((q: any) => q.isSelected);

      if (!selectedQuotation) {
        toast.error('No selected quotation found for this RFP');
        return;
      }

      // Map RFP data to PO form
      const mappedItems: PurchaseOrderItem[] = selectedQuotation.items?.map((item: any) => ({
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
        grandTotal: item.quantity * item.unitPrice * 1.18, // Including 18% tax
        remarks: item.remarks || ''
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
        termsConditions: selectedQuotation.termsAndConditions || 'DELIEVERY AS PER SCHEDULE',
        items: mappedItems
      }));

      // Calculate totals
      calculateTotalsForItems(mappedItems);
      toast.success('RFP data loaded successfully');
    } catch (error: any) {
      console.error('Error loading RFP data:', error);
      toast.error(error.response?.data?.message || 'Failed to load RFP data');
    } finally {
      setLoadingRFP(false);
    }
  };

  const calculateTotalsForItems = (items: PurchaseOrderItem[]) => {
    const subTotal = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
    const taxAmount = items.reduce((sum, item) =>
      sum + (item.tax1Amount || 0) + (item.tax2Amount || 0), 0);
    const grandTotal = subTotal + taxAmount;

    setFormData(prev => ({
      ...prev,
      subTotal,
      taxAmount,
      grandTotal
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const numValue = ['quantity', 'unitPrice', 'tax1Rate', 'tax2Rate'].includes(name)
      ? parseFloat(value) || 0
      : value;

    setNewItem(prev => {
      const updated = { ...prev, [name]: numValue };
      
      if (name === 'quantity' || name === 'unitPrice' || name === 'tax1Rate' || name === 'tax2Rate') {
        const quantity = updated.quantity || 0;
        const unitPrice = updated.unitPrice || 0;
        const totalAmount = quantity * unitPrice;
        
        const tax1Amount = (totalAmount * (updated.tax1Rate || 0)) / 100;
        const tax2Amount = (totalAmount * (updated.tax2Rate || 0)) / 100;
        
        updated.totalAmount = totalAmount;
        updated.tax1Amount = tax1Amount;
        updated.tax2Amount = tax2Amount;
        updated.tax1Value = tax1Amount;
        updated.tax2Value = tax2Amount;
        updated.grandTotal = totalAmount + tax1Amount + tax2Amount;
      }
      
      return updated;
    });
  };

  const addItem = () => {
    if (newItem.itemName && newItem.quantity && newItem.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        items: [...(prev.items || []), newItem as PurchaseOrderItem]
      }));
      
      // Reset new item form
      setNewItem({
        itemName: '',
        itemCode: '',
        quantity: 1,
        unitOfMeasurement: '',
        unitPrice: 0,
        deliveryDate: formData.deliveryDate,
        tax1Type: 'Central GST (CGST) 12%',
        tax1Rate: 12,
        tax2Type: 'State GST (SGST) 12%',
        tax2Rate: 12,
        totalAmount: 0,
        grandTotal: 0
      });
      
      calculateTotals();
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index) || []
    }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    calculateTotalsForItems(items);
  };

  const handleSubmit = async (shouldSubmitForApproval: boolean = false) => {
    try {
      setLoading(true);

      // Validate required fields
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

      // Prepare PO data
      const poData = {
        ...formData,
        status: POStatus.DRAFT // Always create as draft first
      };

      let createdPO: any;

      // Create PO from RFP if rfpId is present, otherwise create regular PO
      if (rfpId) {
        createdPO = await createPOFromRFP.mutateAsync({
          rfpId: parseInt(rfpId),
          data: poData
        });
      } else {
        createdPO = await createPO.mutateAsync(poData);
      }

      // If user clicked "Submit PO", also submit for approval
      if (shouldSubmitForApproval && createdPO?.id) {
        await submitForApproval.mutateAsync(createdPO.id);
      }

      navigate('/purchase-orders');
    } catch (error: any) {
      console.error('Error saving PO:', error);
      // Error toast already handled by the hooks
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while loading RFP or generating PO number
  if (loadingRFP || (isGeneratingPO && !formData.poNumber)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {loadingRFP ? 'Loading RFP data...' : 'Generating PO number...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(rfpId ? '/purchase-orders/create-from-rfp' : '/purchase-orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {rfpId ? 'Create Purchase Order from RFP' : 'New Purchase Order'}
              </h1>
              {rfpId && formData.rfpNumber && (
                <p className="text-sm text-gray-600 mt-1">RFP: {formData.rfpNumber}</p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !formData.items?.length}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading || !formData.items?.length}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Submit for Approval
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* RFP Info Banner */}
        {rfpId && formData.rfpNumber && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Creating PO from RFP</h4>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>
                    <strong>RFP Number:</strong> {formData.rfpNumber}
                    {formData.quotationNumber && <span className="ml-3"><strong>Quotation:</strong> {formData.quotationNumber}</span>}
                  </p>
                  <p><strong>Supplier:</strong> {formData.supplierName}</p>
                  <p className="text-xs mt-2">Item details and pricing have been pre-filled from the selected quotation. You can review and modify them before creating the PO.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Raised By
              </label>
              <select
                name="raisedBy"
                value={formData.raisedBy}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="Wei">Wei</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> PR Number
              </label>
              <input
                type="text"
                name="prNumber"
                value={formData.prNumber}
                onChange={handleInputChange}
                placeholder="REQ/2024-2025/2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Supplier info - Read-only when from RFP */}
            <div className="row-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Supplier
              </label>
              {rfpId ? (
                <div className="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <div className="font-medium">{formData.supplierName || 'Loading...'}</div>
                  {formData.supplierId && formData.supplierId > 0 && (
                    <div className="text-xs text-gray-500 mt-1">Supplier ID: {formData.supplierId}</div>
                  )}
                  <div className="text-xs text-blue-600 mt-2">
                    Supplier is pre-selected from RFP quotation
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleInputChange}
                  placeholder="Enter supplier name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> PO Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="poDate"
                  value={formData.poDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Delivery Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="deliveryDate"
                  value={formData.deliveryDate}
                  onChange={handleInputChange}
                  min={formData.poDate}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Terms & Conditions
              </label>
              <select
                name="termsConditions"
                value={formData.termsConditions}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="DELIEVERY AS PER SCHEDULE">DELIEVERY AS PER SCHEDULE</option>
                <option value="IMMEDIATE DELIVERY">IMMEDIATE DELIVERY</option>
                <option value="PARTIAL DELIVERY ALLOWED">PARTIAL DELIVERY ALLOWED</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Payment Terms
              </label>
              <select
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="NETT 30 DAYS">NETT 30 DAYS</option>
                <option value="NETT 45 DAYS">NETT 45 DAYS</option>
                <option value="NETT 60 DAYS">NETT 60 DAYS</option>
                <option value="IMMEDIATE">IMMEDIATE</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Approval Group
              </label>
              <select
                name="approvalGroup"
                value={formData.approvalGroup}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="HOD/CTO/COO/CEO">HOD/CTO/COO/CEO</option>
                <option value="MANAGER/DIRECTOR">MANAGER/DIRECTOR</option>
                <option value="FINANCE/CFO">FINANCE/CFO</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="text-red-500">*</span> Ship To
              </label>
              <textarea
                name="shipToAddress"
                value={formData.shipToAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter shipping address..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill To <input type="checkbox" className="ml-2" /> Bill To address same as Ship To address.
              </label>
              <textarea
                name="billToAddress"
                value={formData.billToAddress}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter billing address..."
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Remarks
            </label>
            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (T&C)
            </label>
            <textarea
              name="descriptionTC"
              value={formData.descriptionTC}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Item Details Tab */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('itemDetails')}
                className={`py-3 px-6 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'itemDetails'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Item Details
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Add Item Form */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    name="itemName"
                    value={newItem.itemName}
                    onChange={handleItemChange}
                    placeholder="Enter item name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={newItem.deliveryDate}
                    onChange={handleItemChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleItemChange}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={newItem.unitPrice}
                    onChange={handleItemChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addItem}
                    disabled={!newItem.itemName || !newItem.quantity}
                    className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Item
                  </button>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivery Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-1
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-2
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-1 Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tax-2 Value
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grand Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.items?.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                        No items added yet. Add items using the form above.
                      </td>
                    </tr>
                  ) : (
                    formData.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.itemName}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{item.remarks || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.deliveryDate ? format(new Date(item.deliveryDate), 'dd/MM/yyyy') : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <select className="px-2 py-1 border border-gray-300 rounded text-xs">
                            <option>{item.tax1Type}</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <select className="px-2 py-1 border border-gray-300 rounded text-xs">
                            <option>{item.tax2Type}</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.tax1Value?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.tax2Value?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.grandTotal?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {formData.items && formData.items.length > 0 && (
                  <tfoot className="bg-gray-50 border-t border-gray-200">
                    <tr>
                      <td colSpan={9} className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Grand Total:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">
                        {formData.items.reduce((sum, item) => sum + (item.grandTotal || 0), 0).toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePurchaseOrderPage;