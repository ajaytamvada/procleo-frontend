import React, { useState } from 'react';
import {
  Edit2,
  Trash2,
  Search,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
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

  const employees = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (page < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  const startRecord = totalElements > 0 ? page * pageSize + 1 : 0;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  const inputClassName =
    'w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  const selectClassName =
    'w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500';

  return (
    <div className='space-y-6'>
      {/* Filters Card */}
      <div className='bg-white rounded-lg border border-gray-200 p-5'>
        <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by name...'
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className={inputClassName}
            />
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by code...'
              value={codeFilter}
              onChange={e => setCodeFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className={inputClassName}
            />
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by email...'
              value={emailFilter}
              onChange={e => setEmailFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className={inputClassName}
            />
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by designation...'
              value={designationFilter}
              onChange={e => setDesignationFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className={inputClassName}
            />
          </div>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by department...'
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className={inputClassName}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className={selectClassName}
          >
            <option value=''>All Status</option>
            <option value='Working'>Working</option>
            <option value='Non Working'>Non Working</option>
          </select>
        </div>
        <div className='flex flex-wrap gap-2'>
          <button
            onClick={handleSearch}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors'
          >
            <Search size={15} />
            Search
          </button>
          <button
            onClick={handleClearFilters}
            className='p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors'
          >
            <X size={18} />
          </button>
          <button
            onClick={onImport}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors'
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto'
          >
            <Download size={15} />
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>Loading employees...</p>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3'>
                <X className='w-6 h-6 text-red-600' />
              </div>
              <p className='text-gray-600 font-medium'>
                Error loading employees
              </p>
              <p className='text-gray-400 text-sm mt-1'>{error.message}</p>
            </div>
          ) : employees.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Users className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No employees found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "Add Employee" to create one
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Name
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Code
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Email
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Designation
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Department
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Type
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Status
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-24'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    onClick={() => onEdit(employee)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {page * pageSize + index + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {employee.name}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {employee.code}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-600'>
                      {employee.email}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-600'>
                      {employee.designationName || '-'}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-600'>
                      {employee.departmentName || '-'}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-600'>
                      {employee.employeeType}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                          employee.status === 'Working'
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-gray-50 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            onEdit(employee);
                          }}
                          className='p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors'
                          title='Edit'
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleDelete(employee.id!, employee.name);
                          }}
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                          title='Delete'
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && !isLoading && !error && employees.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startRecord}</span> to{' '}
              <span className='font-medium'>{endRecord}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((pageNum, idx) => (
                <React.Fragment key={idx}>
                  {pageNum === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => setPage(pageNum as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        page === pageNum
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {(pageNum as number) + 1}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
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

export default EmployeeList;
