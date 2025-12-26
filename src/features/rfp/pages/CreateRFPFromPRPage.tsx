/**
 * Create RFP from Approved Purchase Requests
 * Two-phase workflow:
 * 1. Select approved PRs
 * 2. Edit RFP details and item prices
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Plus,
  Save,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  useApprovedPRsForRFPCreation,
  useApprovedPRItemsForRFPCreation,
  useCreateRFPFromPRs,
} from '../hooks/useRFPFromPR';
import type {
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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  // Pagination calculations
  const totalPages = Math.ceil(approvedPRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPRs = approvedPRs.slice(startIndex, endIndex);

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

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
        unitOfMeasurement: item.unitOfMeasurement,
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
      console.log(error);
    }
  };

  // Handle RFP creation (submit)
  const handleCreateRFP = async () => {
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
      const newRfp = await createRFPMutation.mutateAsync(
        buildRFPRequest(false)
      );
      if (newRfp && newRfp.id) {
        navigate('/rfp/float');
      } else {
        navigate('/rfp/manage');
      }
    } catch (error) {
      console.log(error);
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
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleBack}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                {phase === 'select-prs' ? 'Select Approved PRs' : 'Create RFP'}
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
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
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <Plus size={15} />
              Combine PR
            </button>
          )}

          {phase === 'create-rfp' && (
            <div className='flex items-center gap-3'>
              <button
                onClick={handleSaveAsDraft}
                disabled={
                  createRFPMutation.isPending || selectedItems.size === 0
                }
                className='px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Save as Draft
              </button>
              <button
                onClick={handleCreateRFP}
                disabled={
                  createRFPMutation.isPending || selectedItems.size === 0
                }
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <FileText size={15} />
                {createRFPMutation.isPending ? 'Creating...' : 'Create RFP'}
              </button>
            </div>
          )}
        </div>

        {/* Phase 1: Select PRs */}
        {phase === 'select-prs' && (
          <>
            {/* Search Bar */}
            <div className='mb-4'>
              <div className='relative max-w-md'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by PR Number, Date, or Department...'
                  value={searchWord}
                  onChange={e => setSearchWord(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                />
              </div>
            </div>

            {/* Table Card */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-left w-12'>
                        <input
                          type='checkbox'
                          checked={
                            approvedPRs.length > 0 &&
                            selectedPRIds.length === approvedPRs.length
                          }
                          onChange={handleSelectAll}
                          className='w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-2 focus:ring-violet-500'
                        />
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Request Number
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Request Date
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Requested By
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Department
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Created By
                      </th>
                      <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                        Created Date
                      </th>
                      <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {loadingPRs ? (
                      <tr>
                        <td colSpan={8} className='px-4 py-12 text-center'>
                          <div className='flex flex-col items-center justify-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                            <p className='text-sm text-gray-500 mt-3'>
                              Loading PRs...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : paginatedPRs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className='px-4 py-12 text-center'>
                          <div className='flex flex-col items-center justify-center'>
                            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                              <FileText className='w-6 h-6 text-gray-400' />
                            </div>
                            <p className='text-gray-600 font-medium'>
                              No approved PRs found
                            </p>
                            <p className='text-gray-400 text-sm mt-1'>
                              Approved PRs will appear here for RFP creation
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedPRs.map(pr => (
                        <tr
                          key={pr.prId}
                          className='hover:bg-gray-50 cursor-pointer transition-colors'
                          onClick={() => handlePRSelect(pr.prId)}
                        >
                          <td className='px-4 py-3.5'>
                            <input
                              type='checkbox'
                              checked={selectedPRIds.includes(pr.prId)}
                              onChange={() => handlePRSelect(pr.prId)}
                              onClick={e => e.stopPropagation()}
                              className='w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-2 focus:ring-violet-500'
                            />
                          </td>
                          <td className='px-4 py-3.5'>
                            <span className='text-sm font-medium text-violet-600 hover:text-violet-700'>
                              {pr.requestNumber}
                            </span>
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {new Date(pr.requestDate).toLocaleDateString()}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {pr.requestedByName || pr.requestedBy}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {pr.department}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {pr.createdByName || pr.createdBy}
                          </td>
                          <td className='px-4 py-3.5 text-sm text-gray-600'>
                            {new Date(pr.createdDate).toLocaleDateString()}
                          </td>
                          <td className='px-4 py-3.5 text-center'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-violet-100 text-violet-700'>
                              {pr.itemCount}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination - Cashfree Style */}
              {totalPages > 1 && (
                <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
                  <p className='text-sm text-gray-600'>
                    Showing{' '}
                    <span className='font-medium'>{startIndex + 1}</span> to{' '}
                    <span className='font-medium'>
                      {Math.min(endIndex, approvedPRs.length)}
                    </span>{' '}
                    of <span className='font-medium'>{approvedPRs.length}</span>{' '}
                    results
                  </p>

                  <div className='flex items-center gap-1'>
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
                    >
                      <ChevronLeft className='w-4 h-4' />
                    </button>

                    {getPageNumbers().map((page, index) => (
                      <span key={index}>
                        {page === '...' ? (
                          <span className='px-3 py-2 text-sm text-gray-400'>
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => setCurrentPage(page as number)}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-violet-600 text-white border border-violet-600'
                                : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </span>
                    ))}

                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
                    >
                      <ChevronRight className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Phase 2: Create RFP */}
        {phase === 'create-rfp' && (
          <div className='space-y-6'>
            {/* RFP Details Card */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='p-6'>
                <h2 className='text-base font-semibold text-gray-900 mb-5'>
                  RFP Details
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <span className='text-red-500'>*</span> RFP Number
                    </label>
                    <input
                      type='text'
                      value={rfpNumber}
                      onChange={e => setRfpNumber(e.target.value)}
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                      readOnly
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <span className='text-red-500'>*</span> RFP Date
                    </label>
                    <input
                      type='date'
                      value={rfpDate}
                      onChange={e => setRfpDate(e.target.value)}
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      <span className='text-red-500'>*</span> Closing Date
                    </label>
                    <input
                      type='date'
                      value={closingDate}
                      onChange={e => setClosingDate(e.target.value)}
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Payment Terms
                    </label>
                    <input
                      type='text'
                      value={paymentTerms}
                      onChange={e => setPaymentTerms(e.target.value)}
                      placeholder='e.g., Net 30 days'
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Remarks
                    </label>
                    <textarea
                      value={remarks}
                      onChange={e => setRemarks(e.target.value)}
                      rows={3}
                      className='w-full px-4 py-3 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-violet-500 focus:border-violet-500 resize-none'
                      placeholder='Enter any additional remarks...'
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Item Details Section Header */}
            <div className='flex items-center justify-between'>
              <div>
                <h2 className='text-base font-semibold text-gray-900'>
                  Item Details
                </h2>
                <p className='text-sm text-gray-500 mt-0.5'>
                  {selectedItems.size} of {prItems.length} items selected
                </p>
              </div>
              <div className='bg-white rounded-lg border border-gray-200 px-4 py-3'>
                <p className='text-xs text-gray-500'>Total Amount</p>
                <p className='text-lg font-bold text-violet-600'>
                  ₹
                  {totalAmount.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>

            {/* Items Table Card */}
            <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
              <div className='overflow-x-auto'>
                <table className='w-full'>
                  <thead>
                    <tr className='bg-[#fafbfc]'>
                      <th className='px-4 py-3.5 text-left w-12'>
                        <input
                          type='checkbox'
                          checked={
                            prItems.length > 0 &&
                            selectedItems.size === prItems.length
                          }
                          onChange={handleSelectAllItems}
                          className='w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-2 focus:ring-violet-500'
                        />
                      </th>
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
                        Target Unit Price
                      </th>
                      <th className='px-4 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                        Grand Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-gray-100'>
                    {loadingItems ? (
                      <tr>
                        <td colSpan={7} className='px-4 py-12 text-center'>
                          <div className='flex flex-col items-center justify-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                            <p className='text-sm text-gray-500 mt-3'>
                              Loading items...
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : prItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='px-4 py-12 text-center'>
                          <div className='flex flex-col items-center justify-center'>
                            <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                              <FileText className='w-6 h-6 text-gray-400' />
                            </div>
                            <p className='text-gray-600 font-medium'>
                              No items found
                            </p>
                            <p className='text-gray-400 text-sm mt-1'>
                              Selected PRs don't have any items
                            </p>
                          </div>
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
                            className={`transition-colors ${
                              isSelected ? 'bg-violet-50' : 'hover:bg-gray-50'
                            }`}
                          >
                            <td className='px-4 py-3.5'>
                              <input
                                type='checkbox'
                                checked={isSelected}
                                onChange={() => handleItemSelect(item.itemId)}
                                className='w-4 h-4 text-violet-600 rounded border-gray-300 focus:ring-2 focus:ring-violet-500'
                              />
                            </td>
                            <td className='px-4 py-3.5 text-sm text-gray-700'>
                              {item.itemName}
                            </td>
                            <td className='px-4 py-3.5 text-sm text-gray-500'>
                              {item.remarks || '-'}
                            </td>
                            <td className='px-4 py-3.5'>
                              <span className='text-sm font-medium text-violet-600'>
                                {item.requestNumber}
                              </span>
                            </td>
                            <td className='px-4 py-3.5 text-center text-sm text-gray-700'>
                              {item.quantity}
                            </td>
                            <td className='px-4 py-3.5 text-right'>
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
                                className='w-28 px-3 py-2 text-sm text-right border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 disabled:bg-gray-100 disabled:cursor-not-allowed'
                              />
                            </td>
                            <td className='px-4 py-3.5 text-right text-sm font-medium text-gray-900'>
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

              {/* Grand Total Row */}
              <div className='px-6 py-4 bg-white border-t border-gray-200 flex justify-end'>
                <div className='flex items-center gap-8'>
                  <span className='text-sm font-semibold text-gray-600'>
                    Grand Total
                  </span>
                  <span className='text-lg font-bold text-gray-900'>
                    ₹
                    {totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRFPFromPRPage;
