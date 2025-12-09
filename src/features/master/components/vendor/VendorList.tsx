import React, { useState } from 'react';
import { Trash2, Edit, Plus, Search, Download, X } from 'lucide-react';
import type { Vendor, VendorFilters } from '../../hooks/useVendorAPI';
import vendorAPI from '../../hooks/useVendorAPI';

interface VendorListProps {
  vendors: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: VendorFilters) => void;
}

const VendorList: React.FC<VendorListProps> = ({
  vendors,
  onEdit,
  onCreate,
  onDelete,
  isLoading,
  page,
  totalPages,
  totalElements,
  onPageChange,
  onFiltersChange,
}) => {
  const [filters, setFilters] = useState<VendorFilters>({});
  const [isExporting, setIsExporting] = useState(false);

  const handleSearch = () => {
    onFiltersChange(filters);
    onPageChange(0);
  };

  const handleClearFilters = () => {
    setFilters({});
    onFiltersChange({});
    onPageChange(0);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await vendorAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `suppliers_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export suppliers. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete supplier "${name}"?`)) {
      onDelete(id);
    }
  };

  return (
    <div className='bg-white rounded-lg shadow-md'>
      {/* Header */}
      <div className='border-b border-gray-200 p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Vendor</h2>
            <p className='text-sm text-gray-600 mt-1'>
              Manage vendor master records
            </p>
          </div>
          <button
            onClick={onCreate}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2'
          >
            <Plus size={20} />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className='p-6 bg-gray-50 border-b'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
          <input
            type='text'
            placeholder='Search by name...'
            value={filters.name || ''}
            onChange={e => setFilters({ ...filters, name: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <input
            type='text'
            placeholder='Search by code...'
            value={filters.code || ''}
            onChange={e => setFilters({ ...filters, code: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <input
            type='text'
            placeholder='Search by GST...'
            value={filters.gst || ''}
            onChange={e => setFilters({ ...filters, gst: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <input
            type='text'
            placeholder='Search by email...'
            value={filters.email || ''}
            onChange={e => setFilters({ ...filters, email: e.target.value })}
            onKeyPress={e => e.key === 'Enter' && handleSearch()}
            className='px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <input
            type='text'
            placeholder='Search by industry...'
            value={filters.industry || ''}
            onChange={e => setFilters({ ...filters, industry: e.target.value })}
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
              onClick={handleClearFilters}
              className='flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
            >
              <X size={18} />
            </button>
          </div>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className='flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download size={18} />
            <span>{isExporting ? 'Exporting...' : 'Export to Excel'}</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-lg'>Loading vendors...</div>
          </div>
        ) : (
          <table className='w-full'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  S.No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Vendor Name
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Code
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  GST
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Industry
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Phone
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Contact Person
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {vendors.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    No vendors found. Click "New" to create one.
                  </td>
                </tr>
              ) : (
                vendors.map((vendor, index) => (
                  <tr
                    key={vendor.id}
                    onClick={() => onEdit(vendor)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {page * 15 + index + 1}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900'>
                      {vendor.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.code || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.email || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.gst || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.industry || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.phone || '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-600'>
                      {vendor.contactFirstName
                        ? `${vendor.contactFirstName} ${vendor.contactLastName || ''}`.trim()
                        : '-'}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(vendor.id, vendor.name);
                        }}
                        className='text-red-600 hover:text-red-900 ml-4'
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 0 && (
        <div className='p-4 border-t flex justify-between items-center'>
          <div className='text-sm text-gray-600'>
            Showing {page * 15 + 1}-{Math.min((page + 1) * 15, totalElements)}{' '}
            of {totalElements} records
          </div>
          <div className='flex gap-2 items-center'>
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className='px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              Previous
            </button>
            <span className='text-sm text-gray-700'>
              Page {page + 1} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
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

export default VendorList;
