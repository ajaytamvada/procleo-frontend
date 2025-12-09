import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePRReport } from '../hooks/useReports';
import { exportPRReportToExcel } from '../utils/excelExport';

const PRReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading } = usePRReport(startDate, endDate);

  // Filter data by search term
  const filteredData = reportData?.filter(
    item =>
      searchTerm === '' ||
      item.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportPRReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Purchase Requisition Report
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          View and analyze purchase requisition data
        </p>
      </div>

      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Start Date
            </label>
            <input
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              End Date
            </label>
            <input
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Search
            </label>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by PR Number, Requested By, Item, Department...'
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
        {filteredData && filteredData.length > 0 && (
          <div className='mt-4'>
            <button
              onClick={handleExportToExcel}
              className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
            >
              <Download className='w-4 h-4' />
              Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* Report Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex items-center justify-center h-64'>
              <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
            </div>
          ) : filteredData && filteredData.length > 0 ? (
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    S No.
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PR No.
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PR Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Requested By
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Status of RM
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    QTY
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Approx Unit Price
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Department
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredData.map((item, index) => (
                  <tr key={`${item.id}-${index}`} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-center text-sm'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span className='text-sm font-medium text-blue-600'>
                        {item.prNumber}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.prDate}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.requestedByName || item.requestedBy}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.itemName}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.statusOfRM === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : item.statusOfRM === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {item.statusOfRM}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.quantity}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.approxUnitPrice.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.department}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='p-12 text-center text-gray-500'>
              <p className='text-lg font-medium'>No data found</p>
              <p className='text-sm mt-1'>
                {searchTerm || startDate || endDate
                  ? 'Try adjusting your search criteria or date range'
                  : 'No records found for the selected criteria'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PRReportPage;
