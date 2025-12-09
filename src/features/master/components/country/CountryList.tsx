import React, { useState } from 'react';
import { Plus, Edit, Trash2, Download, Upload, Search, X } from 'lucide-react';
import type { Country, CountryFilters } from '../../hooks/useCountryAPI';
import { countryAPI } from '../../hooks/useCountryAPI';

interface CountryListProps {
  countries: Country[];
  onEdit: (country: Country) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: CountryFilters) => void;
}

const CountryList: React.FC<CountryListProps> = ({
  countries,
  onEdit,
  onCreate,
  onDelete,
  onImport,
  isLoading = false,
  page = 0,
  totalPages = 1,
  totalElements = 0,
  onPageChange,
  onFiltersChange,
}) => {
  const [nameFilter, setNameFilter] = useState('');
  const [codeFilter, setCodeFilter] = useState('');
  const [isExporting, setIsExporting] = useState(false);

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
      const filters: CountryFilters = {
        name: nameFilter || undefined,
        code: codeFilter || undefined,
      };
      const blob = await countryAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `countries_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export countries. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  const startRecord = totalElements > 0 ? page * 15 + 1 : 0;
  const endRecord = Math.min((page + 1) * 15, totalElements);

  return (
    <div className='bg-white rounded-lg shadow-md'>
      <div className='border-b border-gray-200 p-6'>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-800'>Country Master</h2>
          <button
            onClick={onCreate}
            className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
          >
            <Plus size={20} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className='p-6 bg-gray-50 border-b'>
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <input
            type='text'
            placeholder='Search by name...'
            value={nameFilter}
            onChange={e => setNameFilter(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <input
            type='text'
            placeholder='Search by code...'
            value={codeFilter}
            onChange={e => setCodeFilter(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <div className='flex gap-2'>
            <button
              onClick={handleSearch}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex-1'
            >
              <Search size={18} />
              <span>Search</span>
            </button>
            <button
              onClick={handleClear}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={onImport}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
          >
            <Upload size={18} />
            <span>Import</span>
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download size={18} />
            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
          </button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead className='bg-gray-50 border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                S.No
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Country Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Country Code
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {countries.length === 0 ? (
              <tr>
                <td colSpan={4} className='px-6 py-8 text-center text-gray-500'>
                  No countries found. Click "New" to create one.
                </td>
              </tr>
            ) : (
              countries.map((country, index) => (
                <tr
                  key={country.id}
                  onClick={() => onEdit(country)}
                  className='hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {page * 15 + index + 1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {country.name}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-700'>{country.code}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(country);
                      }}
                      className='text-blue-600 hover:text-blue-900 mr-4'
                      title='Edit'
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (
                          country.id &&
                          window.confirm(
                            `Are you sure you want to delete "${country.name}"?`
                          )
                        ) {
                          onDelete(country.id);
                        }
                      }}
                      className='text-red-600 hover:text-red-900'
                      title='Delete'
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Section */}
      {totalPages > 0 && (
        <div className='p-4 border-t flex justify-between items-center'>
          <div className='text-sm text-gray-600'>
            Showing {startRecord}-{endRecord} of {totalElements} records
          </div>
          <div className='flex gap-2 items-center'>
            <button
              onClick={() => onPageChange && onPageChange(page - 1)}
              disabled={page === 0}
              className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Previous
            </button>
            <span className='text-sm text-gray-700'>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange && onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryList;
