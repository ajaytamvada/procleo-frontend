/**
 * Float RFP Page
 * Allows floating an RFP to selected suppliers/vendors
 */

import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  ChevronRight,
  ChevronLeft,
  Search,
  Loader2,
  Package,
  Calendar,
  AlertCircle,
  Mail,
  Plus,
  X,
} from 'lucide-react';
import { useRFPById, useAllVendors, useFloatRFP } from '../hooks/useFloatRFP';

export const FloatRFPPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rfpId = id ? parseInt(id, 10) : 0;

  // Fetch RFP and vendors data
  const {
    data: rfp,
    isLoading: isLoadingRFP,
    error: rfpError,
  } = useRFPById(rfpId);
  const { data: allVendors = [], isLoading: isLoadingVendors } =
    useAllVendors();
  const floatRFPMutation = useFloatRFP();

  // State for supplier selection
  const [selectedSuppliers, setSelectedSuppliers] = useState<Set<number>>(
    new Set()
  );
  const [availableSearch, setAvailableSearch] = useState('');
  const [selectedSearch, setSelectedSearch] = useState('');
  const [availableSelected, setAvailableSelected] = useState<Set<number>>(
    new Set()
  );
  const [selectedListSelected, setSelectedListSelected] = useState<Set<number>>(
    new Set()
  );

  // State for unregistered vendor emails
  const [unregisteredEmails, setUnregisteredEmails] = useState<
    { email: string; name?: string }[]
  >([]);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [emailError, setEmailError] = useState('');

  // Filter vendors based on search
  const availableVendors = useMemo(() => {
    const selectedIds = Array.from(selectedSuppliers);
    return allVendors
      .filter(v => !selectedIds.includes(v.id))
      .filter(
        v =>
          !availableSearch ||
          v.name.toLowerCase().includes(availableSearch.toLowerCase()) ||
          v.code?.toLowerCase().includes(availableSearch.toLowerCase()) ||
          v.email?.toLowerCase().includes(availableSearch.toLowerCase())
      );
  }, [allVendors, selectedSuppliers, availableSearch]);

  const selectedVendors = useMemo(() => {
    const selectedIds = Array.from(selectedSuppliers);
    return allVendors
      .filter(v => selectedIds.includes(v.id))
      .filter(
        v =>
          !selectedSearch ||
          v.name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
          v.code?.toLowerCase().includes(selectedSearch.toLowerCase()) ||
          v.email?.toLowerCase().includes(selectedSearch.toLowerCase())
      );
  }, [allVendors, selectedSuppliers, selectedSearch]);

  // Handle moving suppliers from available to selected
  const moveToSelected = () => {
    const newSelected = new Set(selectedSuppliers);
    availableSelected.forEach(id => newSelected.add(id));
    setSelectedSuppliers(newSelected);
    setAvailableSelected(new Set());
  };

  // Handle moving suppliers from selected to available
  const moveToAvailable = () => {
    const newSelected = new Set(selectedSuppliers);
    selectedListSelected.forEach(id => newSelected.delete(id));
    setSelectedSuppliers(newSelected);
    setSelectedListSelected(new Set());
  };

  // Handle float RFP submission
  const handleFloatRFP = () => {
    if (selectedSuppliers.size === 0 && unregisteredEmails.length === 0) {
      return;
    }

    floatRFPMutation.mutate(
      {
        rfpId,
        supplierIds:
          selectedSuppliers.size > 0
            ? Array.from(selectedSuppliers)
            : undefined,
        unregisteredVendors:
          unregisteredEmails.length > 0 ? unregisteredEmails : undefined,
      },
      {
        onSuccess: () => {
          navigate('/rfp/manage');
        },
      }
    );
  };

  // Validate and add unregistered vendor email
  const handleAddEmail = () => {
    if (!newEmail.trim()) {
      setEmailError('Email is required');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setEmailError('Invalid email format');
      return;
    }

    if (
      unregisteredEmails.some(
        e => e.email.toLowerCase() === newEmail.trim().toLowerCase()
      )
    ) {
      setEmailError('Email already added');
      return;
    }

    setUnregisteredEmails(prev => [
      ...prev,
      { email: newEmail.trim(), name: newName.trim() || undefined },
    ]);
    setNewEmail('');
    setNewName('');
    setEmailError('');
  };

  // Remove unregistered vendor email
  const handleRemoveEmail = (email: string) => {
    setUnregisteredEmails(prev => prev.filter(e => e.email !== email));
  };

  // Toggle vendor selection in available list
  const toggleAvailableSelection = (vendorId: number) => {
    const newSelection = new Set(availableSelected);
    if (newSelection.has(vendorId)) {
      newSelection.delete(vendorId);
    } else {
      newSelection.add(vendorId);
    }
    setAvailableSelected(newSelection);
  };

  // Toggle vendor selection in selected list
  const toggleSelectedListSelection = (vendorId: number) => {
    const newSelection = new Set(selectedListSelected);
    if (newSelection.has(vendorId)) {
      newSelection.delete(vendorId);
    } else {
      newSelection.add(vendorId);
    }
    setSelectedListSelected(newSelection);
  };

  if (isLoadingRFP || isLoadingVendors) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>Loading RFP details...</span>
      </div>
    );
  }

  if (rfpError || !rfp) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>Error Loading RFP</h3>
            <p className='text-red-600 text-sm mt-1'>
              {rfpError instanceof Error ? rfpError.message : 'RFP not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/manage')}
              className='mt-3 text-sm text-red-700 hover:text-red-800 underline'
            >
              Return to RFP List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate('/rfp/manage')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Float RFP</h1>
              <p className='text-sm text-gray-600'>
                Select suppliers to send this RFP for quotations
              </p>
            </div>
          </div>
          <button
            onClick={handleFloatRFP}
            disabled={
              (selectedSuppliers.size === 0 &&
                unregisteredEmails.length === 0) ||
              floatRFPMutation.isPending
            }
            className='px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {floatRFPMutation.isPending ? (
              <>
                <Loader2 size={16} className='animate-spin' />
                <span>Floating RFP...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>
                  Float RFP (
                  {selectedSuppliers.size + unregisteredEmails.length})
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unregistered Vendor Emails Section */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <h3 className='text-sm font-medium text-gray-700 mb-3'>
          <Mail size={16} className='inline mr-2' />
          Invite Unregistered Vendors (via Email)
        </h3>
        <div className='flex flex-wrap gap-3 items-start'>
          <div className='flex-1 min-w-0'>
            <input
              type='email'
              placeholder='Vendor Email *'
              value={newEmail}
              onChange={e => {
                setNewEmail(e.target.value);
                setEmailError('');
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                emailError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {emailError && (
              <p className='text-red-500 text-xs mt-1'>{emailError}</p>
            )}
          </div>
          <input
            type='text'
            placeholder='Company Name (Optional)'
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className='flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
          />
          <button
            onClick={handleAddEmail}
            className='px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors flex items-center'
          >
            <Plus size={16} className='mr-1' />
            Add
          </button>
        </div>
        {unregisteredEmails.length > 0 && (
          <div className='mt-3 flex flex-wrap gap-2'>
            {unregisteredEmails.map(vendor => (
              <div
                key={vendor.email}
                className='flex items-center bg-purple-50 border border-purple-200 rounded-full px-3 py-1 text-sm'
              >
                <span className='text-purple-800'>
                  {vendor.name
                    ? `${vendor.name} (${vendor.email})`
                    : vendor.email}
                </span>
                <button
                  onClick={() => handleRemoveEmail(vendor.email)}
                  className='ml-2 text-purple-600 hover:text-purple-800'
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RFP Details Summary */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <p className='text-sm text-gray-600'>RFP Number</p>
            <p className='font-semibold text-gray-900'>{rfp.rfpNumber}</p>
          </div>
          <div>
            <p className='text-sm text-gray-600'>Request Date</p>
            <div className='flex items-center space-x-2'>
              <Calendar size={14} className='text-gray-400' />
              <p className='font-semibold text-gray-900'>
                {new Date(rfp.requestDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className='text-sm text-gray-600'>Closing Date</p>
            <div className='flex items-center space-x-2'>
              <Calendar size={14} className='text-gray-400' />
              <p className='font-semibold text-gray-900'>
                {new Date(rfp.closingDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className='text-sm text-gray-600'>Total Items</p>
            <div className='flex items-center space-x-2'>
              <Package size={14} className='text-gray-400' />
              <p className='font-semibold text-gray-900'>
                {rfp.items?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supplier Selection */}
      <div className='flex-1 overflow-hidden p-6'>
        <div className='bg-white rounded-lg border border-gray-200 p-6 h-full flex flex-col'>
          <h2 className='text-lg font-semibold text-gray-900 mb-4'>
            Supplier Selection
          </h2>

          <div className='flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0'>
            {/* Available Suppliers */}
            <div className='lg:col-span-5 flex flex-col min-h-0'>
              <div className='flex items-center justify-between mb-3'>
                <label className='text-sm font-medium text-gray-700'>
                  Available Suppliers ({availableVendors.length})
                </label>
              </div>
              <div className='relative mb-3'>
                <Search
                  size={16}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                />
                <input
                  type='text'
                  placeholder='Search suppliers...'
                  value={availableSearch}
                  onChange={e => setAvailableSearch(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
              </div>
              <div className='flex-1 border border-gray-300 rounded-lg overflow-y-auto min-h-0 bg-gray-50'>
                {availableVendors.length === 0 ? (
                  <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
                    {availableSearch
                      ? 'No suppliers match your search'
                      : 'All suppliers selected'}
                  </div>
                ) : (
                  <div className='divide-y divide-gray-200'>
                    {availableVendors.map(vendor => (
                      <div
                        key={vendor.id}
                        onClick={() => toggleAvailableSelection(vendor.id)}
                        className={`p-3 cursor-pointer transition-colors ${
                          availableSelected.has(vendor.id)
                            ? 'bg-purple-50 border-l-4 border-purple-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-start'>
                          <input
                            type='checkbox'
                            checked={availableSelected.has(vendor.id)}
                            onChange={() => {}}
                            className='mt-1 mr-3'
                          />
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>
                              {vendor.name}
                            </p>
                            {vendor.code && (
                              <p className='text-xs text-gray-600'>
                                {vendor.code}
                              </p>
                            )}
                            {vendor.email && (
                              <p className='text-xs text-gray-500 truncate'>
                                {vendor.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Transfer Buttons */}
            <div className='lg:col-span-2 flex lg:flex-col items-center justify-center space-x-2 lg:space-x-0 lg:space-y-2'>
              <button
                onClick={moveToSelected}
                disabled={availableSelected.size === 0}
                className='p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                title='Add selected suppliers'
              >
                <ChevronRight size={20} />
              </button>
              <button
                onClick={moveToAvailable}
                disabled={selectedListSelected.size === 0}
                className='p-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                title='Remove selected suppliers'
              >
                <ChevronLeft size={20} />
              </button>
            </div>

            {/* Selected Suppliers */}
            <div className='lg:col-span-5 flex flex-col min-h-0'>
              <div className='flex items-center justify-between mb-3'>
                <label className='text-sm font-medium text-gray-700'>
                  Selected Suppliers ({selectedVendors.length})
                </label>
              </div>
              <div className='relative mb-3'>
                <Search
                  size={16}
                  className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                />
                <input
                  type='text'
                  placeholder='Search selected...'
                  value={selectedSearch}
                  onChange={e => setSelectedSearch(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500'
                />
              </div>
              <div className='flex-1 border border-gray-300 rounded-lg overflow-y-auto min-h-0 bg-gray-50'>
                {selectedVendors.length === 0 ? (
                  <div className='flex items-center justify-center h-full text-gray-500 text-sm'>
                    {selectedSearch
                      ? 'No suppliers match your search'
                      : 'No suppliers selected'}
                  </div>
                ) : (
                  <div className='divide-y divide-gray-200'>
                    {selectedVendors.map(vendor => (
                      <div
                        key={vendor.id}
                        onClick={() => toggleSelectedListSelection(vendor.id)}
                        className={`p-3 cursor-pointer transition-colors ${
                          selectedListSelected.has(vendor.id)
                            ? 'bg-purple-50 border-l-4 border-purple-500'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className='flex items-start'>
                          <input
                            type='checkbox'
                            checked={selectedListSelected.has(vendor.id)}
                            onChange={() => {}}
                            className='mt-1 mr-3'
                          />
                          <div className='flex-1 min-w-0'>
                            <p className='font-medium text-gray-900 truncate'>
                              {vendor.name}
                            </p>
                            {vendor.code && (
                              <p className='text-xs text-gray-600'>
                                {vendor.code}
                              </p>
                            )}
                            {vendor.email && (
                              <p className='text-xs text-gray-500 truncate'>
                                {vendor.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatRFPPage;
