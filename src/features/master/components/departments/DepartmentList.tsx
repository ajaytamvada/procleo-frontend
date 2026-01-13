import React, { useState } from 'react';
import {
  Download,
  Upload,
  Search,
  X,
  Plus,
  Trash2,
  Building,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import type { Department, MasterEntityFilters } from '../../types';
import departmentAPI from '../../hooks/useDepartmentAPI';

interface DepartmentListProps {
  departments: Department[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (department: Department) => void;
  onDelete: (id: number) => void;
  onCreate: () => void;
  onImport: () => void;
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  onPageChange: (page: number) => void;
  onFiltersChange?: (filters: MasterEntityFilters) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({
  departments,
  isLoading,
  error,
  onEdit,
  onDelete,
  onCreate,
  onImport,
  currentPage,
  totalPages,
  totalElements = 0,
  onPageChange,
  onFiltersChange,
}) => {
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const pageSize = 15;

  const handleSearch = () => {
    if (onFiltersChange) {
      onFiltersChange({
        name: nameFilter || undefined,
        code: codeFilter || undefined,
      });
    }
  };

  const handleClear = () => {
    setNameFilter('');
    setCodeFilter('');
    if (onFiltersChange) {
      onFiltersChange({});
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const filters: MasterEntityFilters = {
        name: nameFilter || undefined,
        code: codeFilter || undefined,
      };
      const blob = await departmentAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `departments_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export departments. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push('...');
      const start = Math.max(1, currentPage - 1);
      const end = Math.min(totalPages - 2, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  const startRecord = totalElements > 0 ? currentPage * pageSize + 1 : 0;
  const endRecord = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Department</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage department master records
          </p>
        </div>
        <button
          onClick={onCreate}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
        >
          <Plus size={15} />
          New Department
        </button>
      </div>

      {/* Filters Card */}
      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='text'
              placeholder='Search by name...'
              value={nameFilter}
              onChange={e => setNameFilter(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
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
              className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500'
            />
          </div>
          <div className='flex gap-2'>
            <button
              onClick={handleSearch}
              className='flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors'
            >
              <Search size={15} />
              Search
            </button>
            <button
              onClick={handleClear}
              className='p-2.5 text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 transition-colors'
            >
              <X size={18} />
            </button>
          </div>
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
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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
              <p className='text-sm text-gray-500 mt-3'>
                Loading departments...
              </p>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3'>
                <X className='w-6 h-6 text-red-600' />
              </div>
              <p className='text-gray-600 font-medium'>
                Error loading departments
              </p>
              <p className='text-gray-400 text-sm mt-1'>{error.message}</p>
            </div>
          ) : departments.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Building className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No departments found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "New Department" to create one
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
                    Department Name
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Department Code
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Remarks
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-24'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {departments.map((department, index) => (
                  <tr
                    key={department.id}
                    onClick={() => onEdit(department)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {currentPage * pageSize + index + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {department.name}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {department.code}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {department.remarks || '-'}
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (department.id) onDelete(department.id);
                        }}
                        className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 0 && !isLoading && !error && departments.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startRecord}</span> to{' '}
              <span className='font-medium'>{endRecord}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((page, idx) => (
                <React.Fragment key={idx}>
                  {page === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-violet-600 text-white border border-violet-600'
                          : 'text-gray-600 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      {(page as number) + 1}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
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

export default DepartmentList;
