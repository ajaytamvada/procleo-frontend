import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, FileText, Calculator } from 'lucide-react';
import type { Invoice, InvoiceItem, PurchaseOrder, GRN } from '../../purchaseorder/types';
import { InvoiceStatus, InvoiceType } from '../../purchaseorder/types';
import { format, addDays } from 'date-fns';

const CreateInvoicePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get('poId');
  const grnId = searchParams.get('grnId');

  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    invoiceDate: format(new Date(), 'yyyy-MM-dd'),
    invoiceType: InvoiceType.STANDARD,
    status: InvoiceStatus.DRAFT,
    currency: 'INR',
    exchangeRate: 1,
    items: []
  });

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [grn, setGrn] = useState<GRN | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateInvoiceNumber();
    if (poId) fetchPurchaseOrder(poId);
    if (grnId) fetchGRN(grnId);
  }, [poId, grnId]);

  const generateInvoiceNumber = () => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    const invoiceNumber = `INV/${year}-${nextYear}/${String(randomNum).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, invoiceNumber }));
  };

  const fetchPurchaseOrder = async (id: string) => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from API
      const mockPO: PurchaseOrder = {
        id: parseInt(id),
        poNumber: 'PO/2024-2025/001',
        poDate: '2024-09-08',
        supplierId: 1,
        supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
        supplierCode: 'SUP001',
        paymentTerms: 'NETT 30 DAYS',
        billToAddress: '456 Corporate Avenue, City, State 54321',
        shipToAddress: '123 Main Street, City, State 12345',
        items: [
          {
            id: 1,
            itemName: 'Bitumen Pressure Distributor',
            itemCode: 'BPD-001',
            itemDescription: 'Heavy duty bitumen pressure distributor',
            quantity: 2,
            unitOfMeasurement: 'Units',
            unitPrice: 200000,
            tax1Type: 'CGST',
            tax1Rate: 9,
            tax2Type: 'SGST',
            tax2Rate: 9
          }
        ],
        grandTotal: 496000
      };
      setPurchaseOrder(mockPO);
      updateFormWithPOData(mockPO);
    } catch (error) {
      console.error('Error fetching purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGRN = async (id: string) => {
    try {
      setLoading(true);
      // Mock data - in real app, fetch from API
      const mockGRN: GRN = {
        id: parseInt(id),
        grnNumber: 'GRN/2024-2025/001',
        poId: 1,
        poNumber: 'PO/2024-2025/001',
        supplierId: 1,
        supplierName: 'NILANG ASPHALT EQUIPMENTS PRIVATE LIMITED',
        receivedDate: '2024-09-15',
        items: [
          {
            itemName: 'Bitumen Pressure Distributor',
            itemCode: 'BPD-001',
            poQuantity: 2,
            receivedQuantity: 2,
            acceptedQuantity: 2,
            unitPrice: 200000,
            totalValue: 400000
          }
        ]
      };
      setGrn(mockGRN);
      updateFormWithGRNData(mockGRN);
    } catch (error) {
      console.error('Error fetching GRN:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormWithPOData = (po: PurchaseOrder) => {
    setFormData(prev => ({
      ...prev,
      poId: po.id,
      poNumber: po.poNumber,
      supplierId: po.supplierId,
      supplierName: po.supplierName,
      supplierCode: po.supplierCode,
      paymentTerms: po.paymentTerms,
      billToAddress: po.billToAddress,
      shipToAddress: po.shipToAddress,
      dueDate: po.paymentTerms?.includes('30') 
        ? format(addDays(new Date(), 30), 'yyyy-MM-dd')
        : format(addDays(new Date(), 45), 'yyyy-MM-dd'),
      items: po.items?.map(item => ({
        poItemId: item.id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        poQuantity: item.quantity || 0,
        invoiceQuantity: item.quantity || 0,
        unitOfMeasurement: item.unitOfMeasurement,
        unitPrice: item.unitPrice || 0,
        baseAmount: (item.quantity || 0) * (item.unitPrice || 0),
        cgstRate: item.tax1Type === 'CGST' ? (item.tax1Rate || 0) : 0,
        sgstRate: item.tax2Type === 'SGST' ? (item.tax2Rate || 0) : 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalTaxAmount: 0,
        totalAmount: 0
      })) || []
    }));
    calculateTotals();
  };

  const updateFormWithGRNData = (grnData: GRN) => {
    setFormData(prev => ({
      ...prev,
      grnId: grnData.id,
      grnNumber: grnData.grnNumber,
      supplierId: grnData.supplierId,
      supplierName: grnData.supplierName,
      items: grnData.items?.map(item => ({
        grnItemId: item.id,
        itemName: item.itemName,
        itemCode: item.itemCode,
        itemDescription: item.itemDescription,
        grnQuantity: item.acceptedQuantity || 0,
        invoiceQuantity: item.acceptedQuantity || 0,
        unitOfMeasurement: item.unitOfMeasurement,
        unitPrice: item.unitPrice || 0,
        baseAmount: (item.acceptedQuantity || 0) * (item.unitPrice || 0)
      })) || []
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate item totals
    if (field === 'invoiceQuantity' || field === 'unitPrice' || field.includes('Rate') || field === 'discountPercentage') {
      const item = updatedItems[index];
      const quantity = parseFloat(String(item.invoiceQuantity)) || 0;
      const unitPrice = parseFloat(String(item.unitPrice)) || 0;
      const discountPercentage = parseFloat(String(item.discountPercentage)) || 0;
      
      item.baseAmount = quantity * unitPrice;
      item.discountAmount = (item.baseAmount * discountPercentage) / 100;
      item.taxableAmount = item.baseAmount - item.discountAmount;
      
      const cgstRate = parseFloat(String(item.cgstRate)) || 0;
      const sgstRate = parseFloat(String(item.sgstRate)) || 0;
      const igstRate = parseFloat(String(item.igstRate)) || 0;
      
      item.cgstAmount = (item.taxableAmount * cgstRate) / 100;
      item.sgstAmount = (item.taxableAmount * sgstRate) / 100;
      item.igstAmount = (item.taxableAmount * igstRate) / 100;
      
      item.totalTaxAmount = item.cgstAmount + item.sgstAmount + item.igstAmount;
      item.totalAmount = item.taxableAmount + item.totalTaxAmount;
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals();
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      itemName: '',
      invoiceQuantity: 1,
      unitPrice: 0,
      baseAmount: 0,
      cgstRate: 9,
      sgstRate: 9,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTaxAmount: 0,
      totalAmount: 0
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items?.filter((_, i) => i !== index) || [];
    setFormData(prev => ({ ...prev, items: updatedItems }));
    calculateTotals();
  };

  const calculateTotals = () => {
    const items = formData.items || [];
    const subTotal = items.reduce((sum, item) => sum + (item.baseAmount || 0), 0);
    const taxAmount = items.reduce((sum, item) => sum + (item.totalTaxAmount || 0), 0);
    const discountAmount = items.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const grandTotal = subTotal + taxAmount - discountAmount + (formData.freightCharges || 0) + (formData.otherCharges || 0);
    const balanceAmount = grandTotal - (formData.paidAmount || 0);

    setFormData(prev => ({
      ...prev,
      subTotal,
      taxAmount,
      discountAmount,
      grandTotal,
      balanceAmount
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        ...formData,
        createdBy: 'Current User',
        createdDate: new Date().toISOString()
      };

      console.log('Submitting invoice:', invoiceData);
      // API call would go here
      
      navigate('/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
    }
  };

  const handleSaveAndSubmit = async () => {
    setFormData(prev => ({ ...prev, status: InvoiceStatus.SUBMITTED }));
    await handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/invoices')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
            <p className="text-sm text-gray-500 mt-1">Record supplier invoice and process payment</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSaveAndSubmit}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FileText className="w-4 h-4 mr-2" />
            Save & Submit
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="invoiceDate"
                  value={formData.invoiceDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="invoiceType"
                  value={formData.invoiceType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.values(InvoiceType).map(type => (
                    <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Invoice Number
                </label>
                <input
                  type="text"
                  name="supplierInvoiceNumber"
                  value={formData.supplierInvoiceNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Invoice Date
                </label>
                <input
                  type="date"
                  name="supplierInvoiceDate"
                  value={formData.supplierInvoiceDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reference Information */}
        {(purchaseOrder || grn) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Reference Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {purchaseOrder && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PO Number</label>
                      <p className="text-sm text-gray-900">{purchaseOrder.poNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PO Date</label>
                      <p className="text-sm text-gray-900">
                        {purchaseOrder.poDate && format(new Date(purchaseOrder.poDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </>
                )}
                {grn && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">GRN Number</label>
                      <p className="text-sm text-gray-900">{grn.grnNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Receipt Date</label>
                      <p className="text-sm text-gray-900">
                        {grn.receivedDate && format(new Date(grn.receivedDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <p className="text-sm text-gray-900">{formData.supplierName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
                  <p className="text-sm text-gray-900">{formData.paymentTerms || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoice Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Invoice Items</h2>
            {!poId && !grnId && (
              <button
                type="button"
                onClick={addItem}
                className="flex items-center px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CGST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SGST</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  {!poId && !grnId && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div>
                        {poId || grnId ? (
                          <>
                            <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                            <p className="text-xs text-gray-500">{item.itemCode}</p>
                          </>
                        ) : (
                          <input
                            type="text"
                            value={item.itemName}
                            onChange={(e) => handleItemChange(index, 'itemName', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                            placeholder="Item name"
                            required
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.invoiceQuantity}
                        onChange={(e) => handleItemChange(index, 'invoiceQuantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        min="1"
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        min="0"
                        step="0.01"
                        required
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">₹ {(item.baseAmount || 0).toLocaleString('en-IN')}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={item.cgstRate || 0}
                          onChange={(e) => handleItemChange(index, 'cgstRate', e.target.value)}
                          className="w-12 px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 text-xs"
                          min="0"
                          max="100"
                          step="0.5"
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ₹ {(item.cgstAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={item.sgstRate || 0}
                          onChange={(e) => handleItemChange(index, 'sgstRate', e.target.value)}
                          className="w-12 px-1 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 text-xs"
                          min="0"
                          max="100"
                          step="0.5"
                        />
                        <span className="text-xs">%</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        ₹ {(item.sgstAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">
                        ₹ {(item.totalAmount || 0).toLocaleString('en-IN')}
                      </p>
                    </td>
                    {!poId && !grnId && (
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <div className="w-64">
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹ {(formData.subTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-sm text-gray-600">Tax Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹ {(formData.taxAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                {formData.discountAmount && formData.discountAmount > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-sm text-gray-600">Discount:</span>
                    <span className="text-sm font-medium text-red-600">
                      - ₹ {formData.discountAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-gray-300 mt-2">
                  <span className="text-base font-semibold text-gray-900">Grand Total:</span>
                  <span className="text-lg font-bold text-primary-600">
                    ₹ {(formData.grandTotal || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Remarks</h2>
          </div>
          <div className="p-6">
            <textarea
              name="remarks"
              value={formData.remarks || ''}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter any remarks or notes..."
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoicePage;