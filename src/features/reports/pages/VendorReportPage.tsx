import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useVendorReport } from '../hooks/useReports';
import { exportVendorReportToExcel } from '../utils/excelExport';

const VendorReportPage: React.FC = () => {
  const [legalForm, setLegalForm] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading } = useVendorReport(legalForm);

  const filteredData = reportData?.filter(
    item =>
      searchTerm === '' ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.contactName &&
        item.contactName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportVendorReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>Vendor Report</h1>
        <p className='text-sm text-gray-500 mt-1'>
          View vendor details and financial summary
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Legal Form
            </label>
            <select
              value={legalForm}
              onChange={e => setLegalForm(e.target.value)}
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>All</option>
              <option value='PROPRIETORSHIP'>Proprietorship</option>
              <option value='PARTNERSHIP'>Partnership</option>
              <option value='PRIVATE_LIMITED'>Private Limited</option>
              <option value='PUBLIC_LIMITED'>Public Limited</option>
              <option value='LLP'>LLP</option>
            </select>
          </div>
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Search
            </label>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by Vendor Name, Code, Contact...'
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
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Vendor Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Address
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    URL
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Phone
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    PAN
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Contact
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Invoice Amt
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Payment Amt
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Remaining
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredData.map((item, index) => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-4 py-3 text-center text-sm'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3'>
                      <div className='text-sm font-medium text-blue-600'>
                        {item.vendorName}
                      </div>
                      <div className='text-xs text-gray-500'>
                        {item.vendorCode}
                      </div>
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.address || '--'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.url || '--'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.phoneNumber || '--'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.panNumber || '--'}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.contactName || '--'}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.totalInvoiceAmount.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.totalPaymentAmount.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-orange-600'>
                      ₹{item.remainingAmount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className='p-12 text-center text-gray-500'>
              <p className='text-lg font-medium'>No data found</p>
              <p className='text-sm mt-1'>
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'No vendors available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorReportPage;
