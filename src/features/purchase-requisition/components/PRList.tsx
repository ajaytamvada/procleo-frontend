import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Search, Filter } from 'lucide-react';

interface PRListItem {
  requestNumber: string;
  requestDate: string;
  requestedBy: string;
  department: string;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'waiting';
  purchaseType?: string;
  projectCode?: string;
  projectName?: string;
}

interface PRListProps {
  items: PRListItem[];
  onDelete?: (requestNumber: string) => void;
  onView?: (requestNumber: string) => void;
  showActions?: boolean;
  title?: string;
  emptyMessage?: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'waiting':
      return 'bg-blue-100 text-blue-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const PRList: React.FC<PRListProps> = ({
  items,
  onDelete,
  onView,
  showActions = true,
  title,
  emptyMessage = 'No purchase requisitions found',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filteredItems = items.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const uniqueStatuses = Array.from(new Set(items.map(item => item.status)));

  if (items.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4'>
          <Search className='h-6 w-6 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No Data Found
        </h3>
        <p className='text-gray-500'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {title && (
        <div className='flex items-center justify-between'>
          <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
          {showActions && onDelete && (
            <Button
              variant='outline'
              size='sm'
              className='flex items-center space-x-2'
            >
              <Trash2 className='h-4 w-4' />
              <span>Delete</span>
            </Button>
          )}
        </div>
      )}

      {/* Search and Filter */}
      <div className='flex flex-col sm:flex-row gap-4 mb-4'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
          <Input
            type='text'
            placeholder='Search by request number, requestor, or department...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className='pl-10'
          />
        </div>

        <div className='flex items-center space-x-2'>
          <Filter className='h-4 w-4 text-gray-400' />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value=''>All Status</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                {showActions && (
                  <th className='px-4 py-3 text-left'>
                    <input
                      type='checkbox'
                      className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                  </th>
                )}
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Request Number
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Request Date
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Requested By
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Purchase Type
                </th>
                {/* <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Project Code
                </th> */}
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Project Name
                </th>
                <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {filteredItems.map(item => (
                <tr key={item.requestNumber} className='hover:bg-gray-50'>
                  {showActions && (
                    <td className='px-4 py-4'>
                      <input
                        type='checkbox'
                        className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                      />
                    </td>
                  )}
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <button
                      onClick={() => onView?.(item.requestNumber)}
                      className='text-blue-600 hover:text-blue-800 hover:underline font-medium'
                    >
                      {item.requestNumber}
                    </button>
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {new Date(item.requestDate).toLocaleDateString()}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.requestedBy}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.department}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.purchaseType || '-'}
                  </td>
                  {/* <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.projectCode || '-'}
                  </td> */}
                  <td className='px-4 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {item.projectName || '-'}
                  </td>
                  <td className='px-4 py-4 whitespace-nowrap'>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredItems.length === 0 && items.length > 0 && (
        <div className='text-center py-8'>
          <p className='text-gray-500'>No results match your search criteria</p>
        </div>
      )}
    </div>
  );
};
