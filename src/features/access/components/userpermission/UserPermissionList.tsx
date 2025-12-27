import React, { useState, useMemo } from 'react';
import {
  Shield,
  Edit,
  Download,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { useActiveUserTypes } from '../../hooks/useUserTypeAPI';
import type { UserType } from '../../hooks/useUserTypeAPI';
import {
  getPermissionName,
  parsePermissions,
} from '../../constants/permissions';

interface UserPermissionListProps {
  onEditPermissions: (userType: UserType) => void;
}

const UserPermissionList: React.FC<UserPermissionListProps> = ({
  onEditPermissions,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(0);
  const [pageSize] = useState(15);

  const { data: userTypes, isLoading, error } = useActiveUserTypes();

  // Filter and paginate data
  const filteredAndPaginatedData = useMemo(() => {
    if (!userTypes) return { content: [], totalElements: 0, totalPages: 0 };

    let filtered = userTypes;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        ut =>
          ut.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ut.code && ut.code.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter) {
      const statusValue = statusFilter === 'Active' ? '1' : '0';
      filtered = filtered.filter(ut => ut.status === statusValue);
    }

    // Calculate pagination
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / pageSize);
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize;
    const content = filtered.slice(startIndex, endIndex);

    return { content, totalElements, totalPages };
  }, [userTypes, searchTerm, statusFilter, page, pageSize]);

  const handleExport = () => {
    // Export functionality - could be implemented to generate Excel
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user-permissions.csv';
    link.click();
  };

  const generateCSV = () => {
    const headers = ['S.No', 'User Type', 'Accessible Modules', 'Status'];
    const rows = filteredAndPaginatedData.content.map((ut, index) => {
      const permissions = parsePermissions(ut.permissionClass ?? null);
      const permissionNames = permissions
        .map(p => getPermissionName(p))
        .join('; ');
      return [
        index + 1,
        ut.name,
        permissionNames || 'None',
        ut.status === '1' ? 'Active' : 'Inactive',
      ];
    });
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const totalPages = filteredAndPaginatedData.totalPages || 1;
  const startIndex = page * pageSize;
  const endIndex = startIndex + filteredAndPaginatedData.content.length;
  const totalElements = filteredAndPaginatedData.totalElements;

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
      {/* Search and Filters Bar - Outside table card */}
      <div className='flex items-center gap-3 mb-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search by name or code...'
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
            className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          className='px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
        >
          <option value=''>All Status</option>
          <option value='Active'>Active</option>
          <option value='Inactive'>Inactive</option>
        </select>
        <button
          onClick={handleExport}
          className='inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors'
        >
          <Download size={15} />
          Export
        </button>
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
              Error loading user types
            </p>
            <p className='text-sm text-red-600 mt-0.5'>
              Failed to load user type data. Please try again.
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
                  S.No
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  User Type
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Accessible Modules
                </th>
                <th className='px-6 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                  Status
                </th>
                <th className='px-6 py-3.5 text-right text-xs font-semibold text-gray-600 tracking-wide'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
                      <p className='text-sm text-gray-500 mt-3'>
                        Loading user types...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredAndPaginatedData.content.length === 0 ? (
                <tr>
                  <td colSpan={5} className='px-6 py-12 text-center'>
                    <div className='flex flex-col items-center justify-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                        <Shield className='w-6 h-6 text-gray-400' />
                      </div>
                      <p className='text-gray-600 font-medium'>
                        No user types found
                      </p>
                      <p className='text-gray-400 text-sm mt-1'>
                        {searchTerm
                          ? 'Try adjusting your search terms'
                          : 'No user types have been added yet'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAndPaginatedData.content.map((userType, index) => {
                  const permissions = parsePermissions(
                    userType.permissionClass ?? null
                  );
                  const globalIndex = page * pageSize + index + 1;

                  return (
                    <tr
                      key={userType.id}
                      className='hover:bg-gray-50 transition-colors'
                    >
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {globalIndex}
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <div className='w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0'>
                            <Shield size={14} className='text-violet-600' />
                          </div>
                          <span className='text-sm font-medium text-gray-700'>
                            {userType.name}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {userType.moduleCodes &&
                        userType.moduleCodes.length > 0 ? (
                          <div className='flex flex-wrap gap-1.5 max-w-md'>
                            {userType.moduleCodes.map(code => (
                              <span
                                key={code}
                                className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700'
                              >
                                {code.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        ) : permissions.length === 0 ? (
                          <span className='text-sm text-gray-500 italic'>
                            No modules assigned
                          </span>
                        ) : (
                          <div className='flex flex-wrap gap-1.5 max-w-md'>
                            {permissions.map(perm => (
                              <span
                                key={perm}
                                className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700'
                              >
                                {getPermissionName(perm)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            userType.status === 'Active'
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-gray-50 text-gray-600 border border-gray-200'
                          }`}
                        >
                          {userType.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 text-right'>
                        <button
                          onClick={() => onEditPermissions(userType)}
                          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })
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

export default UserPermissionList;
