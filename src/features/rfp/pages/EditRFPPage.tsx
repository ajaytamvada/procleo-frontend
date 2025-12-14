/**
 * Edit RFP Page - Edit existing draft RFP
 * Loads RFP data by ID and displays editable form
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Send, Calendar, ChevronDown } from 'lucide-react';
import { rfpApi } from '../services/rfpApi';
import type { RFPFormData } from '../types';
import toast from 'react-hot-toast';

const EditRFPPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<RFPFormData>({
    rfpNumber: '',
    prNumber: '',
    requestDate: '',
    closingDate: '',
    requestedBy: '',
    department: '',
    approvalGroup: '',
    paymentTerms: '',
    remarks: '',
    items: [],
  });

  // Fetch existing RFP data
  const {
    data: rfp,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['rfp', id],
    queryFn: () => rfpApi.getRFPById(Number(id)),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: RFPFormData) => rfpApi.updateRFP(Number(id), data),
    onSuccess: () => {
      toast.success('RFP updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['rfps', 'drafts'] });
      queryClient.invalidateQueries({ queryKey: ['rfp', id] });
      navigate('/rfp/manage');
    },
    onError: () => {
      toast.error('Failed to update RFP');
    },
  });

  // Populate form when RFP data loads
  useEffect(() => {
    if (rfp) {
      setFormData({
        rfpNumber: rfp.rfpNumber || '',
        prNumber: rfp.prNumber || '',
        requestDate: rfp.requestDate
          ? rfp.requestDate.toString().split('T')[0]
          : '',
        closingDate: rfp.closingDate
          ? rfp.closingDate.toString().split('T')[0]
          : '',
        requestedBy: rfp.requestedBy || '',
        department: rfp.department || '',
        approvalGroup: rfp.approvalGroup || '',
        paymentTerms: rfp.paymentTerms || '',
        remarks: rfp.remarks || '',
        items: rfp.items || [],
      });
    }
  }, [rfp]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.rfpNumber) {
      toast.error('RFP Number is required');
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleFloatRFP = () => {
    // Save first, then navigate to float page
    updateMutation.mutate(formData, {
      onSuccess: () => {
        navigate(`/rfp/${id}/float`);
      },
    });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600'></div>
      </div>
    );
  }

  if (error || !rfp) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-red-600 text-lg'>Failed to load RFP</p>
          <button
            onClick={() => navigate('/rfp/manage')}
            className='mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700'
          >
            Back to Manage RFP
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={() => navigate('/rfp/manage')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft className='w-5 h-5 text-gray-600' />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>
              Edit RFP - {rfp?.rfpNumber}
            </h1>
          </div>
          <div className='flex items-center space-x-3'>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50'
            >
              <Save className='w-4 h-4 inline mr-2' />
              Save Changes
            </button>
            <button
              onClick={handleFloatRFP}
              disabled={updateMutation.isPending}
              className='px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50'
            >
              <Send className='w-4 h-4 inline mr-2' />
              Float RFP
            </button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className='max-w-7xl mx-auto px-6 py-6'>
        {/* Basic Information */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            RFP Details
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                RFP Number
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
                RFP Date
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
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Closing Date
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

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Approval Group
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

        {/* Items Section */}
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            RFP Items ({formData.items?.length || 0})
          </h2>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-y border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Item
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
                    Target Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                    Grand Total
                  </th>
                </tr>
              </thead>
              <tbody className='bg-white divide-y divide-gray-200'>
                {!formData.items || formData.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className='px-4 py-8 text-center text-gray-500'
                    >
                      No items in this RFP
                    </td>
                  </tr>
                ) : (
                  formData.items.map((item, index) => (
                    <tr key={index} className='hover:bg-gray-50'>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {item.itemName}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-500'>
                        {item.prNumber || '-'}
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditRFPPage;
