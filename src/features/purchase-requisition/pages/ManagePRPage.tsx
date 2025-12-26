import React, { useState } from 'react';
import { Search, Edit, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAllDrafts, useDeletePR, useDeletePRs } from '../hooks/usePR';
import { PREditDialog } from '../components/PREditDialog';

export const ManagePRPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [editingPrId, setEditingPrId] = useState<number | null>(null);

  const itemsPerPage = 15;

  // Fetch draft PRs
  const { data: draftPRs = [], isLoading, error } = useAllDrafts();

  // Delete mutations
  const deleteMutation = useDeletePR();
  const deleteManyMutation = useDeletePRs();

  // Filter PRs based on search
  const filteredPRs = draftPRs.filter(
    pr =>
      !searchTerm ||
      pr.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pr.requestedByName || pr.requestedBy)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (pr.departmentName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredPRs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPRs = filteredPRs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle select/deselect PR
  const handleTogglePR = (prId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(prId)) {
        newSet.delete(prId);
      } else {
        newSet.add(prId);
      }
      return newSet;
    });
  };

  // Handle select all on current page
  const handleSelectAll = () => {
    if (selectedItems.size === paginatedPRs.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedPRs.map(pr => pr.id)));
    }
  };

  // Handle edit - navigate to create page which will load the PR for editing
  const handleEdit = (id: number) => {
    setEditingPrId(id);
  };

  // Handle delete single PR
  const handleDelete = (prId: number) => {
    if (
      window.confirm(
        'Are you sure you want to delete this purchase requisition?'
      )
    ) {
      deleteMutation.mutate(prId, {
        onSuccess: () => {
          setSelectedItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(prId);
            return newSet;
          });
        },
      });
    }
  };

  // Handle delete multiple PRs
  const handleDeleteSelected = () => {
    if (selectedItems.size === 0) {
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItems.size} purchase requisition(s)?`
      )
    ) {
      deleteManyMutation.mutate(Array.from(selectedItems), {
        onSuccess: () => {
          setSelectedItems(new Set());
        },
      });
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const lowerStatus = status?.toLowerCase() || '';
    switch (lowerStatus) {
      case 'approved':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'waiting':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border border-gray-200';
      case 'partially approved':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
          <span className='text-2xl'>⚠️</span>
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          Error Loading Data
        </h3>
        <p className='text-gray-500'>
          Failed to load purchase requisitions. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-semibold text-gray-800'>Manage PR</h1>
          <p className='text-sm text-gray-500 mt-1'>
            View and manage your purchase requisitions
          </p>
        </div>
        {selectedItems.size > 0 && (
          <Button
            variant='outline'
            onClick={handleDeleteSelected}
            disabled={deleteManyMutation.isPending}
            className='flex items-center space-x-2 border-red-300 text-red-600 hover:bg-red-50'
          >
            <Trash2 className='h-4 w-4' />
            <span>Delete Selected ({selectedItems.size})</span>
          </Button>
        )}
      </div>

      {/* Search */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by request number, requestor, or department...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>
      </div>

      {/* Table */}
      {draftPRs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Search className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Data Found
          </h3>
          <p className='text-gray-500'>
            No purchase requisitions found. Create your first PR to get started.
          </p>
        </div>
      ) : (
        <>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-[#F7F8FA]'>
                  <tr>
                    <th className='px-6 py-4 text-center w-16'>
                      <input
                        type='checkbox'
                        checked={
                          paginatedPRs.length > 0 &&
                          selectedItems.size === paginatedPRs.length
                        }
                        onChange={handleSelectAll}
                        className='rounded border-gray-300 text-violet-600 focus:ring-violet-500'
                      />
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Request Number
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Request Date
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Requested By
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Department
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Project Name
                    </th>
                    <th className='px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Status
                    </th>
                    <th className='px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wide'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {paginatedPRs.map(pr => (
                    <tr
                      key={pr.id}
                      className='hover:bg-gray-50 transition-colors border-b border-gray-200 last:border-b-0'
                    >
                      <td className='px-6 py-4 text-center'>
                        <input
                          type='checkbox'
                          checked={selectedItems.has(pr.id)}
                          onChange={() => handleTogglePR(pr.id)}
                          className='rounded border-gray-300 text-violet-600 focus:ring-violet-500'
                        />
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => handleEdit(pr.id)}
                          className='text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline'
                        >
                          {pr.requestNumber}
                        </button>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {new Date(pr.requestDate).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {pr.requestedByName || pr.requestedBy}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {pr.departmentName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700'>
                        {pr.projectName || '-'}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <Badge className={getStatusColor(pr.status)}>
                          {pr.status.charAt(0).toUpperCase() +
                            pr.status.slice(1)}
                        </Badge>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-center'>
                        <div className='flex items-center justify-center space-x-2'>
                          <button
                            onClick={() => handleEdit(pr.id)}
                            className='text-violet-600 hover:text-violet-700 p-1'
                            title='Edit'
                          >
                            <Edit className='h-4 w-4' />
                          </button>
                          <button
                            onClick={() => handleDelete(pr.id)}
                            className='text-red-600 hover:text-red-700 p-1'
                            title='Delete'
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6'>
              {/* Mobile view */}
              <div className='flex-1 flex justify-between sm:hidden'>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className='relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage(prev => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className='ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Next
                </button>
              </div>

              {/* Desktop view */}
              <div className='hidden sm:flex-1 sm:flex sm:items-center sm:justify-between'>
                <div>
                  <p className='text-sm text-gray-700'>
                    Showing{' '}
                    <span className='font-medium'>{startIndex + 1}</span> to{' '}
                    <span className='font-medium'>
                      {Math.min(endIndex, filteredPRs.length)}
                    </span>{' '}
                    of <span className='font-medium'>{filteredPRs.length}</span>{' '}
                    results
                  </p>
                </div>
                <div>
                  <nav className='relative z-0 inline-flex rounded-md shadow-sm -space-x-px'>
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className='relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() =>
                        setCurrentPage(prev => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className='relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}

          {filteredPRs.length === 0 && draftPRs.length > 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>
                No results match your search criteria
              </p>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingPrId && (
        <PREditDialog prId={editingPrId} onClose={() => setEditingPrId(null)} />
      )}
    </div>
  );
};
