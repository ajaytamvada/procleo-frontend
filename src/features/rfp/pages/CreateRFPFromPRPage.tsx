/**
 * Create RFP from Approved Purchase Requests
 * Two-phase workflow:
 * 1. Select approved PRs
 * 2. Edit RFP details and item prices
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckSquare, Plus, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useApprovedPRsForRFPCreation,
  useApprovedPRItemsForRFPCreation,
  useCreateRFPFromPRs,
} from '../hooks/useRFPFromPR';
import type {
  ApprovedPRForRFP,
  ApprovedPRItemForRFP,
  RFPItemFromPR,
  CreateRFPFromPRsRequest,
} from '../types/rfpFromPR';

export const CreateRFPFromPRPage = () => {
  const navigate = useNavigate();

  // Phase state: 'select-prs' or 'create-rfp'
  const [phase, setPhase] = useState<'select-prs' | 'create-rfp'>('select-prs');

  // Selected PR IDs (Phase 1)
  const [selectedPRIds, setSelectedPRIds] = useState<number[]>([]);

  // Search state for Phase 1
  const [searchWord, setSearchWord] = useState('');

  // RFP Form State (Phase 2)
  const [rfpNumber, setRfpNumber] = useState('');
  const [rfpDate, setRfpDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [closingDate, setClosingDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [paymentTerms, setPaymentTerms] = useState('');

  // Selected PR items with editable target prices
  const [selectedItems, setSelectedItems] = useState<
    Map<number, ApprovedPRItemForRFP>
  >(new Map());

  // Queries
  const { data: approvedPRs = [], isLoading: loadingPRs } =
    useApprovedPRsForRFPCreation(searchWord);

  const { data: prItems = [], isLoading: loadingItems } =
    useApprovedPRItemsForRFPCreation(selectedPRIds, phase === 'create-rfp');

  const createRFPMutation = useCreateRFPFromPRs();

  // Handle PR selection
  const handlePRSelect = (prId: number) => {
    setSelectedPRIds(prev =>
      prev.includes(prId) ? prev.filter(id => id !== prId) : [...prev, prId]
    );
  };

  // Handle "Select All" toggle
  const handleSelectAll = () => {
    if (selectedPRIds.length === approvedPRs.length) {
      setSelectedPRIds([]);
    } else {
      setSelectedPRIds(approvedPRs.map(pr => pr.prId));
    }
  };

  // Move to Phase 2: Create RFP
  const handleCombinePRs = () => {
    if (selectedPRIds.length === 0) {
      toast.error('Please select at least one PR');
      return;
    }
    setPhase('create-rfp');
  };

  // When PR items load, initialize selected items
  useMemo(() => {
    if (prItems.length > 0 && selectedItems.size === 0) {
      const itemsMap = new Map<number, ApprovedPRItemForRFP>();
      prItems.forEach(item => {
        itemsMap.set(item.itemId, item);
      });
      setSelectedItems(itemsMap);

      // Auto-generate RFP number
      const count = Math.floor(Math.random() * 9999) + 1;
      setRfpNumber(`RFP${String(count).padStart(4, '0')}`);

      // Set default closing date (30 days from now)
      const closingDateObj = new Date();
      closingDateObj.setDate(closingDateObj.getDate() + 30);
      setClosingDate(closingDateObj.toISOString().split('T')[0]);
    }
  }, [prItems]);

  // Handle item selection toggle
  const handleItemSelect = (itemId: number) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      if (newMap.has(itemId)) {
        newMap.delete(itemId);
      } else {
        const item = prItems.find(i => i.itemId === itemId);
        if (item) {
          newMap.set(itemId, item);
        }
      }
      return newMap;
    });
  };

  // Handle "Select All Items" toggle
  const handleSelectAllItems = () => {
    if (selectedItems.size === prItems.length) {
      setSelectedItems(new Map());
    } else {
      const newMap = new Map<number, ApprovedPRItemForRFP>();
      prItems.forEach(item => newMap.set(item.itemId, item));
      setSelectedItems(newMap);
    }
  };

  // Update target unit price for an item
  const handleTargetPriceChange = (itemId: number, newPrice: string) => {
    setSelectedItems(prev => {
      const newMap = new Map(prev);
      const item = newMap.get(itemId);
      if (item) {
        const targetUnitPrice = parseFloat(newPrice) || 0;
        newMap.set(itemId, {
          ...item,
          targetUnitPrice,
          grandTotal: targetUnitPrice * item.quantity,
        });
      }
      return newMap;
    });
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return Array.from(selectedItems.values()).reduce(
      (sum, item) => sum + item.grandTotal,
      0
    );
  }, [selectedItems]);

  // Build RFP request from current form state
  const buildRFPRequest = (isDraft: boolean): CreateRFPFromPRsRequest => {
    const items: RFPItemFromPR[] = Array.from(selectedItems.values()).map(
      item => ({
        prItemId: item.itemId,
        prId: item.prId,
        requestNumber: item.requestNumber,
        itemName: item.itemName,
        itemCode: item.itemCode,
        categoryId: item.categoryId,
        subCategoryId: item.subCategoryId,
        quantity: item.quantity,
        indicativePrice: item.indicativePrice,
        targetUnitPrice: item.targetUnitPrice,
        remarks: item.remarks,
        description: item.description,
      })
    );

    return {
      rfpNumber,
      rfpDate,
      closingDate,
      remarks,
      paymentTerms,
      isDraft,
      selectedItems: items,
    };
  };

  // Handle Save as Draft
  const handleSaveAsDraft = async () => {
    // Minimal validation for draft
    if (!rfpNumber.trim()) {
      toast.error('RFP Number is required');
      return;
    }
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      await createRFPMutation.mutateAsync(buildRFPRequest(true));
      toast.success('RFP saved as draft successfully!');
      navigate('/rfp/manage');
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Handle RFP creation (submit)
  const handleCreateRFP = async () => {
    // Full validation for submission
    if (!rfpNumber.trim()) {
      toast.error('RFP Number is required');
      return;
    }
    if (!rfpDate) {
      toast.error('RFP Date is required');
      return;
    }
    if (!closingDate) {
      toast.error('Closing Date is required');
      return;
    }
    if (selectedItems.size === 0) {
      toast.error('Please select at least one item');
      return;
    }

    try {
      const newRfp = await createRFPMutation.mutateAsync(buildRFPRequest(false));
      if (newRfp && newRfp.id) {
        navigate('/rfp/float');
      } else {
        navigate('/rfp/manage');
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

  // Back button handler
  const handleBack = () => {
    if (phase === 'create-rfp') {
      setPhase('select-prs');
      setSelectedItems(new Map());
    } else {
      navigate('/rfp');
    }
  };

  return (
    <div className='container mx-auto p-6 max-w-7xl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={handleBack}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>
              {phase === 'select-prs' ? 'Select Approved PRs' : 'Create RFP'}
            </h1>
            <p className='text-sm text-gray-600 mt-1'>
              {phase === 'select-prs'
                ? 'Select Purchase Requests to combine into an RFP'
                : 'Review and configure RFP details'}
            </p>
          </div>
        </div>

        {phase === 'select-prs' && (
          <button
            onClick={handleCombinePRs}
            disabled={selectedPRIds.length === 0}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
          >
            <Plus className='w-4 h-4' />
            Combine PR
          </button>
        )}

        {phase === 'create-rfp' && (
          <div className='flex items-center gap-3'>
            <button
              onClick={handleSaveAsDraft}
              disabled={createRFPMutation.isPending || selectedItems.size === 0}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              <Save className='w-4 h-4' />
              Save as Draft
            </button>
            <button
              onClick={handleCreateRFP}
              disabled={createRFPMutation.isPending || selectedItems.size === 0}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
            >
              <FileText className='w-4 h-4' />
              {createRFPMutation.isPending ? 'Creating...' : 'Create RFP'}
            </button>
          </div>
        )}
      </div>

      {/* Phase 1: Select PRs */}
      {phase === 'select-prs' && (
        <div className='bg-white rounded-lg shadow'>
          {/* Search */}
          <div className='p-4 border-b'>
            <input
              type='text'
              placeholder='Search by PR Number, Date, Requested By, or Department...'
              value={searchWord}
              onChange={e => setSearchWord(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          {/* Table */}
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b'>
                <tr>
                  <th className='px-4 py-3 text-left'>
                    <input
                      type='checkbox'
                      checked={
                        approvedPRs.length > 0 &&
                        selectedPRIds.length === approvedPRs.length
                      }
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Request Number
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Request Date
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Requested By
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Department
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Created By
                  </th>
                  <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                    Created Date
                  </th>
                  <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
                    Items
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y'>
                {loadingPRs ? (
                  <tr>
                    <td colSpan={8} className='px-4 py-8 text-center'>
                      <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                      </div>
                    </td>
                  </tr>
                ) : approvedPRs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className='px-4 py-8 text-center text-gray-500'
                    >
                      No approved PRs found for RFP creation
                    </td>
                  </tr>
                ) : (
                  approvedPRs.map(pr => (
                    <tr
                      key={pr.prId}
                      className='hover:bg-gray-50 cursor-pointer'
                      onClick={() => handlePRSelect(pr.prId)}
                    >
                      <td className='px-4 py-3'>
                        <input
                          type='checkbox'
                          checked={selectedPRIds.includes(pr.prId)}
                          onChange={() => handlePRSelect(pr.prId)}
                          onClick={e => e.stopPropagation()}
                          className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                        />
                      </td>
                      <td className='px-4 py-3 text-sm font-medium text-blue-600'>
                        {pr.requestNumber}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {new Date(pr.requestDate).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {pr.requestedByName || pr.requestedBy}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {pr.department}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {pr.createdByName || pr.createdBy}
                      </td>
                      <td className='px-4 py-3 text-sm text-gray-900'>
                        {new Date(pr.createdDate).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-3 text-center'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                          {pr.itemCount}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Phase 2: Create RFP */}
      {phase === 'create-rfp' && (
        <div className='space-y-6'>
          {/* RFP Details Card */}
          <div className='bg-white rounded-lg shadow p-6'>
            <h2 className='text-lg font-semibold text-gray-900 mb-4'>
              RFP Details
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  RFP Number <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={rfpNumber}
                  onChange={e => setRfpNumber(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  readOnly
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  RFP Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  value={rfpDate}
                  onChange={e => setRfpDate(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Closing Date <span className='text-red-500'>*</span>
                </label>
                <input
                  type='date'
                  value={closingDate}
                  onChange={e => setClosingDate(e.target.value)}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Payment Terms
                </label>
                <input
                  type='text'
                  value={paymentTerms}
                  onChange={e => setPaymentTerms(e.target.value)}
                  placeholder='e.g., Net 30 days'
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>

              <div className='md:col-span-2'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  rows={3}
                  className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter any additional remarks...'
                />
              </div>
            </div>
          </div>

          {/* RFP Items Card */}
          <div className='bg-white rounded-lg shadow'>
            <div className='p-4 border-b flex items-center justify-between'>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>
                  Item Details
                </h2>
                <p className='text-sm text-gray-600 mt-1'>
                  {selectedItems.size} of {prItems.length} items selected
                </p>
              </div>
              <div className='text-right'>
                <p className='text-sm text-gray-600'>Total Amount</p>
                <p className='text-xl font-bold text-green-600'>
                  ₹
                  {totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 border-b'>
                  <tr>
                    <th className='px-4 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={
                          prItems.length > 0 &&
                          selectedItems.size === prItems.length
                        }
                        onChange={handleSelectAllItems}
                        className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                      />
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                      Item
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                      Remarks
                    </th>
                    <th className='px-4 py-3 text-left text-sm font-semibold text-gray-700'>
                      PR Number
                    </th>
                    <th className='px-4 py-3 text-center text-sm font-semibold text-gray-700'>
                      Quantity
                    </th>
                    <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                      Indicative Price
                    </th>
                    <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                      Target Unit Price
                    </th>
                    <th className='px-4 py-3 text-right text-sm font-semibold text-gray-700'>
                      Grand Total
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y'>
                  {loadingItems ? (
                    <tr>
                      <td colSpan={8} className='px-4 py-8 text-center'>
                        <div className='flex items-center justify-center'>
                          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                        </div>
                      </td>
                    </tr>
                  ) : prItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className='px-4 py-8 text-center text-gray-500'
                      >
                        No items found
                      </td>
                    </tr>
                  ) : (
                    prItems.map(item => {
                      const isSelected = selectedItems.has(item.itemId);
                      const selectedItem = selectedItems.get(item.itemId);
                      const targetPrice =
                        selectedItem?.targetUnitPrice || item.targetUnitPrice;
                      const grandTotal = targetPrice * item.quantity;

                      return (
                        <tr
                          key={item.itemId}
                          className={`${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
                            }`}
                        >
                          <td className='px-4 py-3'>
                            <input
                              type='checkbox'
                              checked={isSelected}
                              onChange={() => handleItemSelect(item.itemId)}
                              className='w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500'
                            />
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-900'>
                            {item.itemName}
                          </td>
                          <td className='px-4 py-3 text-sm text-gray-600'>
                            {item.remarks}
                          </td>
                          <td className='px-4 py-3 text-sm font-medium text-blue-600'>
                            {item.requestNumber}
                          </td>
                          <td className='px-4 py-3 text-center text-sm text-gray-900'>
                            {item.quantity}
                          </td>
                          <td className='px-4 py-3 text-right text-sm text-gray-900'>
                            ₹
                            {item.indicativePrice.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                          <td className='px-4 py-3 text-right'>
                            <input
                              type='number'
                              step='0.01'
                              value={targetPrice}
                              onChange={e =>
                                handleTargetPriceChange(
                                  item.itemId,
                                  e.target.value
                                )
                              }
                              disabled={!isSelected}
                              className='w-28 px-2 py-1 text-right border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                            />
                          </td>
                          <td className='px-4 py-3 text-right text-sm font-medium text-gray-900'>
                            ₹
                            {grandTotal.toLocaleString('en-IN', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
