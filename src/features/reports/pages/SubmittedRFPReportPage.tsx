import React, { useState } from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubmittedRFPReport } from '../hooks/useReports';
import { exportSubmittedRFPReportToExcel } from '../utils/excelExport';

const SubmittedRFPReportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: reportData, isLoading } = useSubmittedRFPReport();

  const filteredData = reportData?.filter(
    item =>
      searchTerm === '' ||
      item.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportToExcel = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.error('No data to export');
      return;
    }
    try {
      exportSubmittedRFPReportToExcel(filteredData);
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-2xl font-bold text-gray-900'>
          Submitted RFP Report
        </h1>
        <p className='text-sm text-gray-500 mt-1'>
          View RFPs with submitted quotations from vendors
        </p>
      </div>

      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Search
            </label>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by Quotation Number, Vendor, Item...'
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
                    Quotation No.
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Quotation Date
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Vendor Name
                  </th>
                  <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase'>
                    Item Name
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    QTY
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Unit Price
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Tax 1
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Tax 2
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Tax Value 1
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Tax Value 2
                  </th>
                  <th className='px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase'>
                    Total Price
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
                        {item.quotationNumber}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.quotationDate}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.vendorName}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-900'>
                      {item.itemName}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.quantity}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.unitPrice.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.tax1Name}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      {item.tax2Name}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.tax1Value.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm text-gray-900'>
                      ₹{item.tax2Value.toFixed(2)}
                    </td>
                    <td className='px-4 py-3 text-center text-sm font-semibold text-gray-900'>
                      ₹{item.totalPrice.toFixed(2)}
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
                  : 'No quotations have been submitted'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmittedRFPReportPage;
