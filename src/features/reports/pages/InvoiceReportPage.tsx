import React, { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useInvoiceReport } from '../hooks/useReports';
import { exportInvoiceReportToExcel } from '../utils/excelExport';

const InvoiceReportPage: React.FC = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading } = useInvoiceReport(startDate, endDate);

  const filteredData = reportData?.filter(
    item =>
      searchTerm === '' ||
      item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportInvoiceReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Invoice Details Report
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          View and analyze invoice data
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
              placeholder='Search by Invoice, PO, Vendor, Asset...'
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
                    Invoice No.
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Date
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO No.
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    PO Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Asset Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Manufacturer
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Vendor Name
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Quantity
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Total Cost
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    File
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
                        {item.invoiceNumber}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.invoiceDate}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.poNumber}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.poDate}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.assetName}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.manufacturer}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.vendorName}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.quantity}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-gray-900'>
                      ₹{item.totalCost.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center'>
                      {item.attachmentPath ? (
                        <FileText className='w-4 h-4 text-blue-600 mx-auto' />
                      ) : (
                        <span className='text-xs text-gray-400'>--</span>
                      )}
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

export default InvoiceReportPage;
