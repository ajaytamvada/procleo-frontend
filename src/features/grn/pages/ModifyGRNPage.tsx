import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Send, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDraftGRNs, useDeleteGRN, useSubmitGRN } from '../hooks/useGRN';
import { GRN_STATUS_COLORS, GRN_STATUS_LABELS } from '../types';

const ModifyGRNPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedGRNs, setSelectedGRNs] = useState<number[]>([]);

  const { data: draftGRNs, isLoading } = useDraftGRNs();
  const deleteMutation = useDeleteGRN();
  const submitMutation = useSubmitGRN();

  // Filter GRNs by search term and date range
  const filteredGRNs = draftGRNs?.filter(grn => {
    const matchesSearch =
      searchTerm === '' ||
      grn.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grn.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDateRange =
      (dateFrom === '' || grn.receivedDate >= dateFrom) &&
      (dateTo === '' || grn.receivedDate <= dateTo);

    return matchesSearch && matchesDateRange;
  });

  const handleSelectGRN = (id: number) => {
    setSelectedGRNs(prev =>
      prev.includes(id) ? prev.filter(grnId => grnId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGRNs.length === filteredGRNs?.length) {
      setSelectedGRNs([]);
    } else {
      setSelectedGRNs(filteredGRNs?.map(grn => grn.id) || []);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this GRN?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedGRNs.length === 0) {
      toast.error('Please select GRNs to delete');
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedGRNs.length} GRN(s)?`
      )
    ) {
      for (const id of selectedGRNs) {
        await deleteMutation.mutateAsync(id);
      }
      setSelectedGRNs([]);
    }
  };

  const handleSubmit = async (id: number) => {
    if (
      window.confirm('Are you sure you want to submit this GRN for approval?')
    ) {
      await submitMutation.mutateAsync(id);
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Modify GRN</h1>
          <p className='text-sm text-gray-500 mt-1'>
            View and edit draft Goods Receipt Notes
          </p>
        </div>
        <button
          onClick={() => navigate('/grn/create')}
          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
        >
          Create New GRN
        </button>
      </div>

      {/* Search and Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='md:col-span-2'>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by GRN, PO, Invoice number or Supplier...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <input
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              placeholder='From Date'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <input
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              placeholder='To Date'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        {selectedGRNs.length > 0 && (
          <div className='mt-4 flex gap-2'>
            <button
              onClick={handleBatchDelete}
              className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors'
            >
              <div className='flex items-center gap-2'>
                <Trash2 className='w-4 h-4' />
                Delete Selected ({selectedGRNs.length})
              </div>
            </button>
          </div>
        )}
      </div>

      {/* GRNs Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : filteredGRNs && filteredGRNs.length > 0 ? (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-left'>
                    <input
                      type='checkbox'
                      checked={
                        selectedGRNs.length === filteredGRNs.length &&
                        filteredGRNs.length > 0
                      }
                      onChange={handleSelectAll}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                    />
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    GRN Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Date
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Supplier
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredGRNs.map(grn => (
                  <tr key={grn.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3'>
                      <input
                        type='checkbox'
                        checked={selectedGRNs.includes(grn.id)}
                        onChange={() => handleSelectGRN(grn.id)}
                        className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500'
                      />
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <div className='font-medium text-blue-600 cursor-pointer hover:underline'>
                        {grn.grnNumber}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.poNumber}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.poDate}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.invoiceNumber}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {grn.invoiceDate}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm text-gray-900'>
                        {grn.supplierName}
                      </div>
                      {grn.supplierCode && (
                        <div className='text-xs text-gray-500'>
                          {grn.supplierCode}
                        </div>
                      )}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          GRN_STATUS_COLORS[
                            grn.status as keyof typeof GRN_STATUS_COLORS
                          ]
                        }`}
                      >
                        {
                          GRN_STATUS_LABELS[
                            grn.status as keyof typeof GRN_STATUS_LABELS
                          ]
                        }
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => navigate(`/grn/${grn.id}`)}
                          className='p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                          title='View Details'
                        >
                          <Eye className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => navigate(`/grn/${grn.id}/edit`)}
                          className='p-1 text-green-600 hover:bg-green-50 rounded transition-colors'
                          title='Edit'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleSubmit(grn.id)}
                          disabled={submitMutation.isPending}
                          className='p-1 text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50'
                          title='Submit for Approval'
                        >
                          <Send className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDelete(grn.id)}
                          disabled={deleteMutation.isPending}
                          className='p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50'
                          title='Delete'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='p-12 text-center text-gray-500'>
              <p className='text-lg font-medium'>No draft GRNs found</p>
              <p className='text-sm mt-1'>
                {searchTerm || dateFrom || dateTo
                  ? 'Try adjusting your search criteria or date range'
                  : 'Create a new GRN to get started'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModifyGRNPage;
