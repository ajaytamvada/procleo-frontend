import React, { useState } from 'react';
import {
  Edit,
  Trash2,
  Search,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import type { LoginProvision } from '../../hooks/useLoginProvisionAPI';
import {
  useSearchLoginProvisions,
  useDeleteLoginProvision,
} from '../../hooks/useLoginProvisionAPI';

interface LoginProvisionListProps {
  onEdit: (user: LoginProvision) => void;
}

const LoginProvisionList: React.FC<LoginProvisionListProps> = ({ onEdit }) => {
  const [searchWord, setSearchWord] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const { data, isLoading, error } = useSearchLoginProvisions(
    searchWord,
    page,
    size
  );
  const deleteMutation = useDeleteLoginProvision();

  const handleDelete = async (id: number, loginName: string) => {
    if (
      window.confirm(`Are you sure you want to delete user "${loginName}"?`)
    ) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('User deleted successfully!');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const totalPages = data?.totalPages || 1;
  const startIndex = page * size;
  const endIndex = startIndex + (data?.content?.length || 0);
  const totalElements = data?.totalElements || 0;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    const currentPageDisplay = page + 1;

    if (totalPages <= maxVisiblePages + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPageDisplay > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPageDisplay - 1);
      const end = Math.min(totalPages - 1, currentPageDisplay + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPageDisplay < totalPages - 2) {
        pages.push('...');
      }

      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div>
      {/* Search Bar - Outside table card */}
      <div className='flex items-center gap-3 mb-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name, login, or email...'
            value={searchWord}
            onChange={e => {
              setSearchWord(e.target.value);
              setPage(0);
            }}
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>
        <button
          onClick={() => window.location.reload()}
          className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors'
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className='mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0' />
          <div>
            <p className='text-sm font-medium text-red-800'>
              Error loading users
            </p>
            <p className='text-sm text-red-600 mt-0.5'>
              Failed to load user data. Please try again.
            </p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='bg-[#fafbfc]'>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Employee
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Login Name
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Email
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  User Type
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Status
                </th>
                <th className='px-6 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                      <p className='text-sm text-gray-500 mt-3'>
                        Loading users...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : data?.content?.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                        <User className='w-6 h-6 text-gray-400' />
                      </div>
                      <p className='text-gray-600 font-medium'>
                        No users found
                      </p>
                      <p className='text-gray-400 text-sm mt-1'>
                        {searchWord
                          ? 'Try adjusting your search terms'
                          : 'No users have been added yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                data?.content?.map(user => (
                  <tr
                    key={user.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                          <User size={14} className='text-violet-600' />
                        </div>
                        <span className='text-sm font-medium text-gray-700'>
                          {user.employeeName || user.employeeId}
                        </span>
                      </div>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='text-sm font-medium text-violet-600'>
                        {user.loginName}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {user.email || '-'}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {user.userTypeName || '-'}
                    </td>
                    <td className='px-6 py-4'>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.status === 1
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {user.status === 1 ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className='px-6 py-4 text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => onEdit(user)}
                          className='p-1.5 text-violet-600 hover:text-violet-700 hover:bg-violet-50 rounded-lg transition-colors'
                          title='Edit user'
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id!, user.loginName)}
                          className='p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors'
                          title='Delete user'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination - Cashfree Style */}
        {totalPages > 1 && !isLoading && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startIndex + 1}</span> to{' '}
              <span className='font-medium'>{endIndex}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>

            <div className='flex items-center gap-1'>
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>

              {getPageNumbers().map((pageNum, index) => (
                <span key={index}>
                  {pageNum === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => setPage((pageNum as number) - 1)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        page + 1 === pageNum
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )}
                </span>
              ))}

              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:border-gray-200 transition-colors'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginProvisionList;
