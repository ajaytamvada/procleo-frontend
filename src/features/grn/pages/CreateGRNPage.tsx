import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Save, Package, CheckCircle } from 'lucide-react';
import type { GRN, GRNItem, PurchaseOrder, PurchaseOrderItem } from '../../purchaseorder/types';
import { GRNStatus, GRNType } from '../../purchaseorder/types';
import { format } from 'date-fns';

const CreateGRNPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poId = searchParams.get('poId');

  const [formData, setFormData] = useState<Partial<GRN>>({
    grnNumber: '',
    receivedDate: format(new Date(), 'yyyy-MM-dd'),
    grnType: GRNType.STANDARD,
    status: GRNStatus.DRAFT,
    items: []
  });

  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateGRNNumber();
    if (poId) {
      fetchPurchaseOrder(poId);
    }
  }, [poId]);

  const generateGRNNumber = () => {
    const year = new Date().getFullYear();
    const nextYear = year + 1;
    const randomNum = Math.floor(Math.random() * 1000) + 1;
    const grnNumber = `GRN/${year}-${nextYear}/${String(randomNum).padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, grnNumber }));
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
        deliveryDate: '2024-09-15',
        items: [
          {
            id: 1,
            itemName: 'Bitumen Pressure Distributor',
            itemCode: 'BPD-001',
            itemDescription: 'Heavy duty bitumen pressure distributor',
            quantity: 2,
            unitOfMeasurement: 'Units',
            unitPrice: 200000,
            receivedQuantity: 0,
            pendingQuantity: 2
          },
          {
            id: 2,
            itemName: 'Spare Parts Kit',
            itemCode: 'SPK-001',
            itemDescription: 'Comprehensive spare parts kit',
            quantity: 1,
            unitOfMeasurement: 'Set',
            unitPrice: 40000,
            receivedQuantity: 0,
            pendingQuantity: 1
          }
        ],
        grandTotal: 496000
      };

      setPurchaseOrder(mockPO);
      
      // Initialize GRN with PO data
      setFormData(prev => ({
        ...prev,
        poId: mockPO.id,
        poNumber: mockPO.poNumber,
        poDate: mockPO.poDate,
        supplierId: mockPO.supplierId,
        supplierName: mockPO.supplierName,
        supplierCode: mockPO.supplierCode,
        items: mockPO.items?.map(item => ({
          poItemId: item.id,
          itemName: item.itemName,
          itemCode: item.itemCode,
          itemDescription: item.itemDescription,
          poQuantity: item.quantity,
          receivedQuantity: item.pendingQuantity || item.quantity,
          acceptedQuantity: item.pendingQuantity || item.quantity,
          rejectedQuantity: 0,
          pendingQuantity: 0,
          unitOfMeasurement: item.unitOfMeasurement,
          unitPrice: item.unitPrice,
          totalValue: (item.pendingQuantity || item.quantity) * item.unitPrice,
          qualityStatus: 'PENDING',
          storageLocation: '',
          batchNumber: '',
          serialNumber: ''
        })) || []
      }));
    } catch (error) {
      console.error('Error fetching purchase order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index: number, field: keyof GRNItem, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };

    // Recalculate values if quantity or quality status changes
    if (field === 'receivedQuantity' || field === 'acceptedQuantity' || field === 'rejectedQuantity') {
      const item = updatedItems[index];
      const receivedQty = parseFloat(value) || 0;
      
      if (field === 'receivedQuantity') {
        item.receivedQuantity = receivedQty;
        item.acceptedQuantity = receivedQty;
        item.rejectedQuantity = 0;
      } else if (field === 'acceptedQuantity') {
        item.acceptedQuantity = Math.min(receivedQty, parseFloat(value) || 0);
        item.rejectedQuantity = item.receivedQuantity - item.acceptedQuantity;
      } else if (field === 'rejectedQuantity') {
        item.rejectedQuantity = Math.min(receivedQty, parseFloat(value) || 0);
        item.acceptedQuantity = item.receivedQuantity - item.rejectedQuantity;
      }

      item.pendingQuantity = item.poQuantity - (item.acceptedQuantity || 0);
      item.totalValue = (item.acceptedQuantity || 0) * (item.unitPrice || 0);
    }

    setFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const calculateTotalValue = () => {
    return formData.items?.reduce((sum, item) => sum + (item.totalValue || 0), 0) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const grnData = {
        ...formData,
        totalReceivedValue: calculateTotalValue(),
        createdBy: 'Current User',
        createdDate: new Date().toISOString()
      };

      console.log('Submitting GRN:', grnData);
      // API call would go here
      
      navigate('/grn');
    } catch (error) {
      console.error('Error creating GRN:', error);
    }
  };

  const handleSaveAndApprove = async () => {
    setFormData(prev => ({ ...prev, status: GRNStatus.APPROVED }));
    await handleSubmit(new Event('submit') as any);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/grn')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Goods Receipt Note</h1>
            <p className="text-sm text-gray-500 mt-1">Record receipt of goods against purchase order</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => navigate('/grn')}
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
            onClick={handleSaveAndApprove}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Save & Approve
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GRN Number
                </label>
                <input
                  type="text"
                  name="grnNumber"
                  value={formData.grnNumber}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  GRN Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="grnType"
                  value={formData.grnType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {Object.values(GRNType).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Order Information */}
        {purchaseOrder && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Purchase Order Information</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <p className="text-sm text-gray-900">{purchaseOrder.supplierName}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delivery Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice/Challan Number
                </label>
                <input
                  type="text"
                  name="deliveryChallanNumber"
                  value={formData.deliveryChallanNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice/Challan Date
                </label>
                <input
                  type="date"
                  name="deliveryChallanDate"
                  value={formData.deliveryChallanDate || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Received By
                </label>
                <input
                  type="text"
                  name="receivedBy"
                  value={formData.receivedBy || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transporter Name
                </label>
                <input
                  type="text"
                  name="transporterName"
                  value={formData.transporterName || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Warehouse Location
                </label>
                <input
                  type="text"
                  name="warehouseLocation"
                  value={formData.warehouseLocation || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Items Receipt */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Items Receipt</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accepted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rejected</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch/Serial</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {formData.items?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.itemName}</p>
                        <p className="text-xs text-gray-500">{item.itemCode}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">
                        {item.poQuantity} {item.unitOfMeasurement}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.receivedQuantity}
                        onChange={(e) => handleItemChange(index, 'receivedQuantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        min="0"
                        max={item.poQuantity}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.acceptedQuantity}
                        onChange={(e) => handleItemChange(index, 'acceptedQuantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        min="0"
                        max={item.receivedQuantity}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.rejectedQuantity}
                        onChange={(e) => handleItemChange(index, 'rejectedQuantity', e.target.value)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        min="0"
                        max={item.receivedQuantity}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.batchNumber || ''}
                        onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        placeholder="Batch"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.storageLocation || ''}
                        onChange={(e) => handleItemChange(index, 'storageLocation', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                        placeholder="Location"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.qualityStatus || 'PENDING'}
                        onChange={(e) => handleItemChange(index, 'qualityStatus', e.target.value)}
                        className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="PASSED">Passed</option>
                        <option value="FAILED">Failed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total Received Value:</p>
                <p className="text-lg font-bold text-primary-600">
                  ₹ {calculateTotalValue().toLocaleString('en-IN')}
                </p>
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

export default CreateGRNPage;