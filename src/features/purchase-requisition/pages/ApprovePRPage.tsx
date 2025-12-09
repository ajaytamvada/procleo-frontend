import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { usePRsPendingApproval } from '../hooks/useApproval';
import { PRApprovalDetailDialog } from '../components/PRApprovalDetailDialog';

export const ApprovePRPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPrId, setSelectedPrId] = useState<number | null>(null);

  const itemsPerPage = 15;

  // Fetch PRs pending approval
  const { data: pendingPRs = [], isLoading, error } = usePRsPendingApproval();

  // Filter PRs based on search
  const filteredPRs = pendingPRs.filter(
    pr =>
      !searchTerm ||
      pr.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pr.department.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleView = (prId: number) => {
    setSelectedPrId(prId);
  };

  const handleCloseDialog = () => {
    setSelectedPrId(null);
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
          Failed to load pending approvals. Please try again.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-gray-900'>
          Pending For Approval
        </h1>
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
      {pendingPRs.length === 0 ? (
        <div className='text-center py-12'>
          <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
            <Search className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No Data Found
          </h3>
          <p className='text-gray-500'>
            No purchase requisitions pending for approval.
          </p>
        </div>
      ) : (
        <>
          <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16'>
                      S.No
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Request Number
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Request Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Requested By
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Department
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created By
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Created Date
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Purchase Type
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Project Code
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Project Name
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {paginatedPRs.map((pr, index) => (
                    <tr key={pr.prId} className='hover:bg-gray-50'>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-center'>
                        {startIndex + index + 1}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <button
                          onClick={() => handleView(pr.prId)}
                          className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                        >
                          {pr.requestNumber}
                        </button>
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {new Date(pr.requestDate).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.requestedBy}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.department}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.createdBy}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {new Date(pr.createdDate).toLocaleDateString()}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.purchaseType || '-'}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.projectCode || '-'}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {pr.projectName || '-'}
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
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
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

          {filteredPRs.length === 0 && pendingPRs.length > 0 && (
            <div className='text-center py-8'>
              <p className='text-gray-500'>
                No results match your search criteria
              </p>
            </div>
          )}
        </>
      )}

      {/* Approval Detail Dialog */}
      {selectedPrId && (
        <PRApprovalDetailDialog
          prId={selectedPrId}
          onClose={handleCloseDialog}
        />
      )}
    </div>
  );
};
