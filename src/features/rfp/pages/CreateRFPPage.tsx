import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import type { RFPFormData, RFPItem } from '../types';
import { rfpApi } from '../services/rfpApi';
// import { format } from 'date-fns';

const CreateRFPPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('itemDetails');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RFPFormData>({
    rfpNumber: '',
    prNumber: '',
    requestDate: new Date().toISOString().split('T')[0],
    closingDate: '',
    requestedBy: '',
    department: '',
    approvalGroup: '',
    paymentTerms: '',
    remarks: '',
    items: [],
  });

  const [newItem, setNewItem] = useState<RFPItem>({
    itemName: '',
    itemCode: '',
    remarks: '',
    prNumber: '',
    quantity: 1,
    unitOfMeasurement: '',
    category: '',
    subCategory: '',
    indicativePrice: 0,
    unitPrice: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    generateRFPNumber();
  }, []);

  const generateRFPNumber = async () => {
    try {
      const rfpNumber = await rfpApi.generateRFPNumber();
      setFormData(prev => ({ ...prev, rfpNumber }));
    } catch (error) {
      console.error('Error generating RFP number:', error);
      // Fallback to manual generation
      const date = new Date();
      const rfpNumber = `RFP${date.getFullYear()}/${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`;
      setFormData(prev => ({ ...prev, rfpNumber }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const numValue =
      name === 'quantity' || name === 'indicativePrice' || name === 'unitPrice'
        ? parseFloat(value) || 0
        : value;

    setNewItem(prev => {
      const updated = { ...prev, [name]: numValue };
      if (name === 'quantity' || name === 'unitPrice') {
        updated.grandTotal = (updated.quantity || 0) * (updated.unitPrice || 0);
      }
      return updated;
    });
  };

  const addItem = () => {
    if (newItem.itemName && newItem.quantity > 0) {
      setFormData(prev => ({
        ...prev,
        items: [
          ...prev.items,
          {
            ...newItem,
            grandTotal: newItem.quantity * (newItem.unitPrice || 0),
          },
        ],
      }));
      setNewItem({
        itemName: '',
        itemCode: '',
        remarks: '',
        prNumber: formData.prNumber || '',
        quantity: 1,
        unitOfMeasurement: '',
        category: '',
        subCategory: '',
        indicativePrice: 0,
        unitPrice: 0,
        grandTotal: 0,
      });
    }
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (isDraft: boolean = true) => {
    try {
      setLoading(true);
      const response = await rfpApi.createRFP(formData);

      if (!isDraft && response.id) {
        // If not draft, navigate to float RFP page
        navigate(`/rfp/${response.id}/float`);
      } else {
        navigate('/rfp');
      }
    } catch (error) {
      console.error('Error creating RFP:', error);
      alert('Failed to create RFP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce(
      (sum, item) => sum + (item.grandTotal || 0),
      0
    );
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/rfp')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600' />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Create RFP</h1>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
            >
              <Save className='w-4 h-4 inline mr-2' />
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || formData.items.length === 0}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50'
            >
              <Send className='w-4 h-4 inline mr-2' />
              Create RFP
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='max-w-7xl mx-auto px-6 py-6'>
        {/* Basic Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> RFP Number
              </label>
              <input
                type='text'
                name='rfpNumber'
                value={formData.rfpNumber}
                readOnly
                className='w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> RFP Date
              </label>
              <div className='relative'>
                <input
                  type='date'
                  name='requestDate'
                  value={formData.requestDate}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
                <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                PR Number
              </label>
              <input
                type='text'
                name='prNumber'
                value={formData.prNumber}
                onChange={handleInputChange}
                placeholder='REQ/2024-2025/5'
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                <span className='text-red-500'>*</span> Closing Date
              </label>
              <div className='relative'>
                <input
                  type='date'
                  name='closingDate'
                  value={formData.closingDate}
                  onChange={handleInputChange}
                  min={formData.requestDate}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                />
                <Calendar className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
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
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none'
                >
                  <option value=''>Select</option>
                  <option value='Developer'>Developer</option>
                  <option value='Manager'>Manager</option>
                  <option value='Director'>Director</option>
                  <option value='Executive'>Executive</option>
                </select>
                <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Payment Terms
              </label>
              <div className='relative'>
                <select
                  name='paymentTerms'
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none'
                >
                  <option value=''>Select</option>
                  <option value='NETT 30 DAYS'>NETT 30 DAYS</option>
                  <option value='NETT 45 DAYS'>NETT 45 DAYS</option>
                  <option value='NETT 60 DAYS'>NETT 60 DAYS</option>
                  <option value='IMMEDIATE'>IMMEDIATE</option>
                  <option value='ON DELIVERY'>ON DELIVERY</option>
                </select>
                <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none' />
              </div>
            </div>

            <div className='md:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Remarks
              </label>
              <textarea
                name='remarks'
                value={formData.remarks}
                onChange={handleInputChange}
                rows={3}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                placeholder='Enter any additional remarks...'
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 mb-6'>
          <div className='border-b border-gray-200'>
            <nav className='flex -mb-px'>
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

          {/* Item Details Tab */}
          {activeTab === 'itemDetails' && (
            <div className='p-6'>
              {/* Add Item Form */}
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Item Name
                    </label>
                    <input
                      type='text'
                      name='itemName'
                      value={newItem.itemName}
                      onChange={handleItemChange}
                      placeholder='Enter item name'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Item Code
                    </label>
                    <input
                      type='text'
                      name='itemCode'
                      value={newItem.itemCode}
                      onChange={handleItemChange}
                      placeholder='Item code'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Quantity
                    </label>
                    <input
                      type='number'
                      name='quantity'
                      value={newItem.quantity}
                      onChange={handleItemChange}
                      min='1'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Unit Price
                    </label>
                    <input
                      type='number'
                      name='unitPrice'
                      value={newItem.unitPrice}
                      onChange={handleItemChange}
                      min='0'
                      step='0.01'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Category
                    </label>
                    <select
                      name='category'
                      value={newItem.category}
                      onChange={e => handleItemChange(e as any)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    >
                      <option value=''>Select Category</option>
                      <option value='OFFICE EQUIPMENT'>OFFICE EQUIPMENT</option>
                      <option value='IT EQUIPMENT'>IT EQUIPMENT</option>
                      <option value='FURNITURE'>FURNITURE</option>
                      <option value='CONSUMABLES'>CONSUMABLES</option>
                      <option value='SERVICES'>SERVICES</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Sub Category
                    </label>
                    <select
                      name='subCategory'
                      value={newItem.subCategory}
                      onChange={e => handleItemChange(e as any)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    >
                      <option value=''>Select Sub Category</option>
                      <option value='AIR CONDITIONER'>AIR CONDITIONER</option>
                      <option value='COMPUTER'>COMPUTER</option>
                      <option value='PRINTER'>PRINTER</option>
                      <option value='DESK'>DESK</option>
                      <option value='CHAIR'>CHAIR</option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Indicative Price
                    </label>
                    <input
                      type='number'
                      name='indicativePrice'
                      value={newItem.indicativePrice}
                      onChange={handleItemChange}
                      min='0'
                      step='0.01'
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                    />
                  </div>
                </div>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    Remarks
                  </label>
                  <input
                    type='text'
                    name='remarks'
                    value={newItem.remarks}
                    onChange={handleItemChange}
                    placeholder='Enter remarks'
                    className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                  />
                </div>
                <button
                  onClick={addItem}
                  disabled={!newItem.itemName || newItem.quantity <= 0}
                  className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  <Plus className='w-4 h-4 inline mr-2' />
                  Add Item
                </button>
              </div>

              {/* Items Table */}
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead className='bg-gray-50 border-y border-gray-200'>
                    <tr>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Item
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Remarks
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        PR Number
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Quantity
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Indicative Price
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Unit Price
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Grand Total
                      </th>
                      <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {formData.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='px-4 py-8 text-center text-gray-500'
                        >
                          No items added yet. Add items using the form above.
                        </td>
                      </tr>
                    ) : (
                      formData.items.map((item, index) => (
                        <tr key={index} className='hover:bg-gray-50'>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            {item.itemName}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-500'>
                            {item.remarks || '-'}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-500'>
                            {item.prNumber || formData.prNumber || '-'}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            {item.quantity}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            {item.indicativePrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            {item.unitPrice?.toFixed(2) || '0.00'}
                          </td>
                          <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                            {item.grandTotal?.toFixed(2) || '0.00'}
                          </td>
                          <td className='px-4 py-3 text-sm'>
                            <button
                              onClick={() => removeItem(index)}
                              className='text-red-600 hover:text-red-800 transition-colors'
                            >
                              <Trash2 className='w-4 h-4' />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {formData.items.length > 0 && (
                    <tfoot className='bg-gray-50 border-t border-gray-200'>
                      <tr>
                        <td
                          colSpan={6}
                          className='px-4 py-3 text-right text-sm font-medium text-gray-900'
                        >
                          Total Amount:
                        </td>
                        <td className='px-4 py-3 text-sm font-bold text-gray-900'>
                          {calculateTotalAmount().toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRFPPage;
