import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, ChevronDown } from 'lucide-react';
import type { RFPFormData, RFPItem } from '../types';
import { rfpApi } from '../services/rfpApi';

const CreateRFPPage: React.FC = () => {
  const navigate = useNavigate();
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
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Create RFP</h1>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Save as Draft
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || formData.items.length === 0}
              className='px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Create RFP
            </button>
          </div>
        </div>

        {/* Basic Information Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-6'>
          <div className='p-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> RFP Number
                </label>
                <input
                  type='text'
                  name='rfpNumber'
                  value={formData.rfpNumber}
                  readOnly
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> RFP Date
                </label>
                <input
                  type='date'
                  name='requestDate'
                  value={formData.requestDate}
                  onChange={handleInputChange}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  <span className='text-red-500'>*</span> Closing Date
                </label>
                <input
                  type='date'
                  name='closingDate'
                  value={formData.closingDate}
                  onChange={handleInputChange}
                  min={formData.requestDate}
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
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
                    <option value='Developer'>Developer</option>
                    <option value='Manager'>Manager</option>
                    <option value='Director'>Director</option>
                    <option value='Executive'>Executive</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
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
                    className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select</option>
                    <option value='NETT 30 DAYS'>NETT 30 DAYS</option>
                    <option value='NETT 45 DAYS'>NETT 45 DAYS</option>
                    <option value='NETT 60 DAYS'>NETT 60 DAYS</option>
                    <option value='IMMEDIATE'>IMMEDIATE</option>
                    <option value='ON DELIVERY'>ON DELIVERY</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
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
                  className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                  placeholder='Enter any additional remarks...'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Item Details Section Header */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-base font-semibold text-gray-900'>
            Item Details
          </h2>
          <div className='bg-white rounded-lg border border-gray-200 px-4 py-3'>
            <p className='text-xs text-gray-500'>Total Amount</p>
            <p className='text-lg font-bold text-violet-600'>
              ₹
              {calculateTotalAmount().toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Add Item Form Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden mb-4'>
          <div className='p-5 border-b border-gray-100 bg-gray-50'>
            <p className='text-sm font-medium text-gray-700'>Add New Item</p>
          </div>
          <div className='p-5'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Item Name
                </label>
                <input
                  type='text'
                  name='itemName'
                  value={newItem.itemName}
                  onChange={handleItemChange}
                  placeholder='Enter item name'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Item Code
                </label>
                <input
                  type='text'
                  name='itemCode'
                  value={newItem.itemCode}
                  onChange={handleItemChange}
                  placeholder='Item code'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Quantity
                </label>
                <input
                  type='number'
                  name='quantity'
                  value={newItem.quantity}
                  onChange={handleItemChange}
                  min='1'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Unit Price
                </label>
                <input
                  type='number'
                  name='unitPrice'
                  value={newItem.unitPrice}
                  onChange={handleItemChange}
                  min='0'
                  step='0.01'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Category
                </label>
                <div className='relative'>
                  <select
                    name='category'
                    value={newItem.category}
                    onChange={handleItemChange}
                    className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select Category</option>
                    <option value='OFFICE EQUIPMENT'>OFFICE EQUIPMENT</option>
                    <option value='IT EQUIPMENT'>IT EQUIPMENT</option>
                    <option value='FURNITURE'>FURNITURE</option>
                    <option value='CONSUMABLES'>CONSUMABLES</option>
                    <option value='SERVICES'>SERVICES</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Sub Category
                </label>
                <div className='relative'>
                  <select
                    name='subCategory'
                    value={newItem.subCategory}
                    onChange={handleItemChange}
                    className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white appearance-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                  >
                    <option value=''>Select Sub Category</option>
                    <option value='AIR CONDITIONER'>AIR CONDITIONER</option>
                    <option value='COMPUTER'>COMPUTER</option>
                    <option value='PRINTER'>PRINTER</option>
                    <option value='DESK'>DESK</option>
                    <option value='CHAIR'>CHAIR</option>
                  </select>
                  <ChevronDown className='absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                </div>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Remarks
                </label>
                <input
                  type='text'
                  name='remarks'
                  value={newItem.remarks}
                  onChange={handleItemChange}
                  placeholder='Enter remarks'
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
            </div>
            <button
              onClick={addItem}
              disabled={!newItem.itemName || newItem.quantity <= 0}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>
        </div>

        {/* Items Table Card */}
        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Item
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    Remarks
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                    PR Number
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                    Quantity
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                    Grand Total
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide w-20'>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {formData.items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='px-4 py-12 text-center'>
                      <div className='flex flex-col items-center justify-center'>
                        <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                          <Plus className='w-6 h-6 text-gray-400' />
                        </div>
                        <p className='text-gray-600 font-medium'>
                          No items added yet
                        </p>
                        <p className='text-gray-400 text-sm mt-1'>
                          Add items using the form above
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => (
                    <tr
                      key={index}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-4 py-3.5 text-sm text-gray-700'>
                        {item.itemName}
                      </td>
                      <td className='px-4 py-3.5 text-sm text-gray-500'>
                        {item.remarks || '-'}
                      </td>
                      <td className='px-4 py-3.5'>
                        <span className='text-sm font-medium text-violet-600'>
                          {item.prNumber || formData.prNumber || '-'}
                        </span>
                      </td>
                      <td className='px-4 py-3.5 text-center text-sm text-gray-700'>
                        {item.quantity}
                      </td>
                      <td className='px-4 py-3.5 text-right text-sm text-gray-700'>
                        ₹
                        {(item.unitPrice || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-4 py-3.5 text-right text-sm font-medium text-gray-900'>
                        ₹
                        {(item.grandTotal || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className='px-4 py-3.5 text-center'>
                        <button
                          onClick={() => removeItem(index)}
                          className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Grand Total Row */}
          {formData.items.length > 0 && (
            <div className='px-6 py-4 bg-white border-t border-gray-200 flex justify-end'>
              <div className='flex items-center gap-8'>
                <span className='text-sm font-semibold text-gray-600'>
                  Grand Total
                </span>
                <span className='text-lg font-bold text-gray-900'>
                  ₹
                  {calculateTotalAmount().toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateRFPPage;
