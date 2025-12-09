import React, { useState, useMemo } from 'react';
import { Shield, Edit, Download, Search } from 'lucide-react';
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

  if (isLoading) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12'>
        <div className='text-center text-gray-500'>Loading user types...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-12'>
        <div className='text-center text-red-500'>
          Failed to load user types
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='relative'>
            <Search
              className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
              size={20}
            />
            <input
              type='text'
              placeholder='Search by name or code...'
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setPage(0);
              }}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </select>
          <button
            onClick={handleExport}
            className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2'
          >
            <Download size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  S.No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Accessible Modules
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredAndPaginatedData.content.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    No user types found
                  </td>
                </tr>
              ) : (
                filteredAndPaginatedData.content.map((userType, index) => {
                  const permissions = parsePermissions(
                    userType.permissionClass ?? null
                  );
                  const globalIndex = page * pageSize + index + 1;

                  return (
                    <tr key={userType.id} className='hover:bg-gray-50'>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                        {globalIndex}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex items-center'>
                          <Shield className='h-5 w-5 text-blue-500 mr-2' />
                          <span className='text-sm font-medium text-gray-900'>
                            {userType.name}
                          </span>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        {userType.moduleCodes && userType.moduleCodes.length > 0 ? (
                          <div className='flex flex-wrap gap-1.5 max-w-md'>
                            {userType.moduleCodes.map(code => (
                              <span
                                key={code}
                                className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'
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
                                className='inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800'
                              >
                                {getPermissionName(perm)}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${userType.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}
                        >
                          {userType.status === 'Active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <button
                          onClick={() => onEditPermissions(userType)}
                          className='inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
                        >
                          <Edit size={16} className='mr-1' />
                          Edit Permissions
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className='bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200'>
          <div className='text-sm text-gray-700'>
            Showing {filteredAndPaginatedData.content.length} of{' '}
            {filteredAndPaginatedData.totalElements} results
          </div>
          <div className='flex gap-2'>
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'
            >
              Previous
            </button>
            <span className='px-4 py-2 text-gray-700'>
              Page {page + 1} of {filteredAndPaginatedData.totalPages || 1}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={
                page >= filteredAndPaginatedData.totalPages - 1 ||
                filteredAndPaginatedData.totalPages === 0
              }
              className='px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors'
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermissionList;
