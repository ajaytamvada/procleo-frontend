import React, { useState } from 'react';
import { Edit, Trash2, Download } from 'lucide-react';
import type { UserType, UserTypeFilters } from '../../hooks/useUserTypeAPI';
import { usePagedUserTypes, useDeleteUserType } from '../../hooks/useUserTypeAPI';

interface UserTypeListProps {
  onEdit: (userType: UserType) => void;
}

const UserTypeList: React.FC<UserTypeListProps> = ({ onEdit }) => {
  const [page, setPage] = useState(0);
  const [size] = useState(15);
  const [filters, setFilters] = useState<UserTypeFilters>({});

  const { data, isLoading, error } = usePagedUserTypes(page, size, filters);
  const deleteMutation = useDeleteUserType();

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('User type deleted successfully!');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete user type');
      }
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams({
      ...(filters.name && { name: filters.name }),
      ...(filters.status && { status: filters.status }),
    });
    const exportUrl = `/api/master/user-types/export?${params.toString()}`;
    window.open(exportUrl, '_blank');
  };

  if (isLoading) return <div className="p-8 text-center">Loading user types...</div>;
  if (error) return <div className="p-8 text-center text-red-600">Error loading user types</div>;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.name || ''}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data?.content?.map((userType, index) => (
                <tr key={userType.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{page * size + index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userType.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{userType.code || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      userType.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {userType.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <button
                      onClick={() => onEdit(userType)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(userType.id!, userType.name)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {data?.content?.length || 0} of {data?.totalElements || 0} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page + 1} of {data?.totalPages || 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= (data?.totalPages || 1) - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTypeList;
