import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGRNReport } from '../hooks/useReports';
import { exportGRNReportToExcel } from '../utils/excelExport';

const GRNReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading } = useGRNReport(startDate, endDate);

  const filteredData = reportData?.filter(
    item =>
      searchTerm === '' ||
      item.grnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportGRNReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>GRN Report</h1>
        <p className='text-sm text-gray-500 mt-1'>
          View and analyze Goods Receipt Note data
        </p>
      </div>

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
              placeholder='Search by GRN, PO, Invoice, Vendor...'
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
                    GRN Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    GRN Date
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Number
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Vendor
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Status
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Total Value
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Received By
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    QC Status
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-center text-sm'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span className='text-sm font-medium text-blue-600'>
                        {item.grnNumber}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.grnDate}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.poNumber}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <div className='text-sm text-gray-900'>
                        {item.invoiceNumber}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.invoiceDate}
                      </div>
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm text-gray-900'>
                        {item.vendorName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.vendorCode}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-center'>
                      <span className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'>
                        {item.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-gray-900'>
                      ₹{item.totalReceivedValue.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.receivedByName || item.receivedBy}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.qualityCheckStatus || '--'}
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

export default GRNReportPage;
