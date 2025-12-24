import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload, Search, X } from 'lucide-react';
import type { Location, LocationFilters } from '../../hooks/useLocationAPI';

interface LocationListProps {
  locations: Location[];
  onEdit: (location: Location) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  isLoading?: boolean;
  page?: number;
  totalPages?: number;
  totalElements?: number;
  onPageChange?: (page: number) => void;
  onFiltersChange?: (filters: LocationFilters) => void;
}

const LocationList: React.FC<LocationListProps> = ({
  locations,
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
  const [countryNameFilter, setCountryNameFilter] = useState('');

  const handleSearch = () => {
    if (onFiltersChange) {
      onFiltersChange({
        name: nameFilter || undefined,
        code: codeFilter || undefined,
        countryName: countryNameFilter || undefined,
      });
    }
  };

  const handleClear = () => {
    setNameFilter('');
    setCodeFilter('');
    setCountryNameFilter('');
    if (onFiltersChange) {
      onFiltersChange({});
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
          <h2 className='text-2xl font-bold text-gray-800'>Location Master</h2>
          <div className='flex gap-2'>
            <button
              onClick={onImport}
              className='flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            >
              <Upload size={20} />
              <span>Import</span>
            </button>
            <button
              onClick={onCreate}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Plus size={20} />
              <span>New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className='p-6 bg-gray-50 border-b'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
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
          <input
            type='text'
            placeholder='Search by country...'
            value={countryNameFilter}
            onChange={e => setCountryNameFilter(e.target.value)}
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
                Location Name
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Location Code
              </th>
              <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Country
              </th>
              <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                Actions
              </th>
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {locations.length === 0 ? (
              <tr>
                <td colSpan={5} className='px-6 py-8 text-center text-gray-500'>
                  No locations found. Click "New" to create one.
                </td>
              </tr>
            ) : (
              locations.map((location, index) => (
                <tr
                  key={location.id}
                  onClick={() => onEdit(location)}
                  className='hover:bg-gray-50 cursor-pointer transition-colors'
                >
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {page * 15 + index + 1}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm font-medium text-gray-900'>
                      {location.name}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-700'>{location.code}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-700'>
                      {location.countryName}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onEdit(location);
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
                          location.id &&
                          window.confirm(
                            `Are you sure you want to delete "${location.name}"?`
                          )
                        ) {
                          onDelete(location.id);
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

export default LocationList;
