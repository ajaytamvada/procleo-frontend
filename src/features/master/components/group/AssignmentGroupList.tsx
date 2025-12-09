import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from 'lucide-react';
import type {
  AssignmentGroup,
  AssignmentGroupFilters,
} from '../../hooks/useAssignmentGroupAPI';
import {
  useAssignmentGroupsPaged,
  useDeleteAssignmentGroup,
  assignmentGroupAPI,
  useGroupMembers,
} from '../../hooks/useAssignmentGroupAPI';

interface AssignmentGroupListProps {
  onEdit: (group: AssignmentGroup) => void;
}

const AssignmentGroupList: React.FC<AssignmentGroupListProps> = ({
  onEdit,
}) => {
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [filters, setFilters] = useState<AssignmentGroupFilters>({
    name: '',
  });

  const [nameFilter, setNameFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [viewMembersGroupId, setViewMembersGroupId] = useState<number | null>(
    null
  );

  const { data, isLoading, error } = useAssignmentGroupsPaged(
    page,
    pageSize,
    filters
  );
  const deleteMutation = useDeleteAssignmentGroup();

  const { data: members = [], isLoading: loadingMembers } = useGroupMembers(
    viewMembersGroupId!
  );

  const handleSearch = () => {
    setFilters({
      name: nameFilter.trim() || undefined,
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setFilters({});
    setPage(0);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          'Failed to delete group';
        alert(errorMessage);
      }
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await assignmentGroupAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `assignment_groups_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert('Failed to export assignment groups');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
        Error loading assignment groups: {error.message}
      </div>
    );
  }

  const groups = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className='space-y-4'>
      {/* Search Filters */}
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <div className='flex gap-4 mb-4'>
          <input
            type='text'
            placeholder='Search by name...'
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            className='flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
        </div>
        <div className='flex gap-2'>
          <button
            onClick={handleSearch}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Search size={18} />
            <span>Search</span>
          </button>
          <button
            onClick={handleClearFilters}
            className='px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
          >
            Clear Filters
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className='flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ml-auto'
          >
            <Download size={18} />
            <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  S.No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Group Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Members
                </th>
                <th className='px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    Loading assignment groups...
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    No assignment groups found
                  </td>
                </tr>
              ) : (
                groups.map((group, index) => (
                  <tr key={group.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {page * pageSize + index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium'>
                      {group.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {group.email || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <button
                        onClick={() => setViewMembersGroupId(group.id!)}
                        className='inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm'
                      >
                        <Users size={16} />
                        <span>View</span>
                      </button>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => onEdit(group)}
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                          title='Edit'
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(group.id!, group.name)}
                          className='text-red-600 hover:text-red-800 transition-colors'
                          title='Delete'
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <div className='bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {page * pageSize + 1} to{' '}
              {Math.min((page + 1) * pageSize, totalElements)} of{' '}
              {totalElements} groups
            </div>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className='p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronLeft size={18} />
              </button>
              <span className='text-sm text-gray-700'>
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className='p-2 border border-gray-300 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Members Modal */}
      {viewMembersGroupId && (
        <div
          className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
          onClick={() => setViewMembersGroupId(null)}
        >
          <div
            className='bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto'
            onClick={e => e.stopPropagation()}
          >
            <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
              <h3 className='text-lg font-semibold text-gray-800'>
                Group Members
              </h3>
              <button
                onClick={() => setViewMembersGroupId(null)}
                className='text-gray-400 hover:text-gray-600'
              >
                <X size={20} />
              </button>
            </div>
            <div className='p-6'>
              {loadingMembers ? (
                <div className='text-center text-gray-500'>
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className='text-center text-gray-500'>
                  No members in this group
                </div>
              ) : (
                <div className='space-y-2'>
                  {members.map(member => (
                    <div
                      key={member.id}
                      className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50'
                    >
                      <div className='font-medium text-gray-900'>
                        {member.employeeName}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Code: {member.employeeCode}
                      </div>
                      <div className='text-sm text-gray-600'>
                        Email: {member.employeeEmail}
                      </div>
                      {member.contactNumber && (
                        <div className='text-sm text-gray-600'>
                          Phone: {member.contactNumber}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentGroupList;
