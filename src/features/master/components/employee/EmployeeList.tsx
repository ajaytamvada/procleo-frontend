import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Employee, EmployeeFilters } from '../../hooks/useEmployeeAPI';
import {
  useEmployeesPaged,
  useDeleteEmployee,
  employeeAPI,
} from '../../hooks/useEmployeeAPI';

interface EmployeeListProps {
  onEdit: (employee: Employee) => void;
  onImport: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ onEdit, onImport }) => {
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [filters, setFilters] = useState<EmployeeFilters>({});

  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading, error } = useEmployeesPaged(page, pageSize, filters);
  const deleteMutation = useDeleteEmployee();

  const handleSearch = () => {
    setFilters({
      name: nameFilter.trim() || undefined,
      code: codeFilter.trim() || undefined,
      email: emailFilter.trim() || undefined,
      designationName: designationFilter.trim() || undefined,
      departmentName: departmentFilter.trim() || undefined,
      status: statusFilter || undefined,
    });
    setPage(0);
  };

  const handleClearFilters = () => {
    setNameFilter('');
    setCodeFilter('');
    setEmailFilter('');
    setDesignationFilter('');
    setDepartmentFilter('');
    setStatusFilter('');
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
          'Failed to delete employee';
        alert(errorMessage);
      }
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await employeeAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `employees_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Export failed:', error);
      alert('Failed to export employees');
    } finally {
      setIsExporting(false);
    }
  };

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 text-red-700'>
        Error loading employees: {error.message}
      </div>
    );
  }

  const employees = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className='space-y-4'>
      {/* Search Filters */}
      <div className='bg-white rounded-lg border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <input
            type='text'
            placeholder='Search by name...'
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <input
            type='text'
            placeholder='Search by code...'
            value={codeFilter}
            onChange={e => setCodeFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <input
            type='text'
            placeholder='Search by email...'
            value={emailFilter}
            onChange={e => setEmailFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <input
            type='text'
            placeholder='Search by designation...'
            value={designationFilter}
            onChange={e => setDesignationFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <input
            type='text'
            placeholder='Search by department...'
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
          >
            <option value=''>All Status</option>
            <option value='Working'>Working</option>
            <option value='Non Working'>Non Working</option>
          </select>
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
            onClick={onImport}
            className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            <Upload size={18} />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className='flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ml-auto'
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
                  Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Designation
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Type
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
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
                    colSpan={9}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    Loading employees...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-6 py-8 text-center text-gray-500'
                  >
                    No employees found
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr key={employee.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {page * pageSize + index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {employee.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {employee.code}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {employee.email}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {employee.designationName || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {employee.departmentName || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {employee.employeeType}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          employee.status === 'Working'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-center'>
                      <div className='flex items-center justify-center gap-2'>
                        <button
                          onClick={() => onEdit(employee)}
                          className='text-blue-600 hover:text-blue-800 transition-colors'
                          title='Edit'
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(employee.id!, employee.name)
                          }
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
              {totalElements} employees
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
    </div>
  );
};

export default EmployeeList;
