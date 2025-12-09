import React, { useRef } from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import type { PurchaseRequest } from '../types';

interface PurchaseRequestPreviewProps {
  purchaseRequest: PurchaseRequest;
  onBack: () => void;
}

const PurchaseRequestPreview: React.FC<PurchaseRequestPreviewProps> = ({
  purchaseRequest,
  onBack,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = printRef.current?.innerHTML || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Print - ${purchaseRequest.requestNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              background-color: white;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
            }
            .info-section {
              margin: 20px 0;
            }
            .info-row {
              display: flex;
              margin: 10px 0;
            }
            .info-label {
              font-weight: bold;
              width: 150px;
            }
            @media print {
              body {
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = function () {
      printWindow.print();
    };
  };

  const calculateLineTotal = (quantity: number, unitPrice: number) => {
    return (quantity * unitPrice).toFixed(2);
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header Actions */}
      <div className='bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between py-4'>
            <div className='flex items-center gap-4'>
              <button
                onClick={onBack}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <ArrowLeft size={20} />
              </button>
              <span className='text-gray-400'>|</span>
              <h1 className='text-xl font-semibold text-gray-800'>
                Print Preview
              </h1>
            </div>
            <button
              onClick={handlePrint}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors'
            >
              <Printer size={18} />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* Print Content */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div ref={printRef} className='bg-white rounded-lg shadow-lg p-8'>
          {/* Header */}
          <div className='header text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-2'>
              PURCHASE REQUEST
            </h1>
            <p className='text-gray-600'>RiditStack Pvt Ltd</p>
          </div>

          {/* Request Information */}
          <div className='info-section border-t border-b border-gray-300 py-6 mb-6'>
            <div className='grid grid-cols-2 gap-6'>
              <div>
                <div className='mb-3'>
                  <span className='font-semibold text-gray-700'>
                    PR Number:
                  </span>
                  <span className='ml-2 text-gray-900'>
                    {purchaseRequest.requestNumber}
                  </span>
                </div>
                <div className='mb-3'>
                  <span className='font-semibold text-gray-700'>
                    Request Date:
                  </span>
                  <span className='ml-2 text-gray-900'>
                    {new Date(purchaseRequest.requestDate).toLocaleDateString(
                      'en-GB'
                    )}
                  </span>
                </div>
                <div className='mb-3'>
                  <span className='font-semibold text-gray-700'>
                    Requested By:
                  </span>
                  <span className='ml-2 text-gray-900'>
                    {purchaseRequest.requestedBy}
                  </span>
                </div>
              </div>
              <div>
                <div className='mb-3'>
                  <span className='font-semibold text-gray-700'>Status:</span>
                  <span className='ml-2 text-gray-900 uppercase'>
                    {purchaseRequest.status}
                  </span>
                </div>
                <div className='mb-3'>
                  <span className='font-semibold text-gray-700'>
                    Grand Total:
                  </span>
                  <span className='ml-2 text-gray-900 font-bold'>
                    ₹{purchaseRequest.grandTotal?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
            {purchaseRequest.remarks && (
              <div className='mt-4'>
                <span className='font-semibold text-gray-700'>
                  Justification:
                </span>
                <p className='mt-1 text-gray-900 whitespace-pre-wrap'>
                  {purchaseRequest.remarks}
                </p>
              </div>
            )}
          </div>

          {/* Line Items Table */}
          <div className='mb-6'>
            <h2 className='text-lg font-semibold text-gray-800 mb-4'>
              Line Items
            </h2>
            <table className='w-full border-collapse border border-gray-300'>
              <thead>
                <tr className='bg-gray-100'>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    S.No
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Model
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Make
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold'>
                    Description
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-center text-sm font-semibold'>
                    Quantity
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-right text-sm font-semibold'>
                    Unit Price
                  </th>
                  <th className='border border-gray-300 px-4 py-2 text-right text-sm font-semibold'>
                    Sub Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {purchaseRequest.items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className='border border-gray-300 px-4 py-2 text-sm'>
                      {index + 1}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-sm'>
                      {item.modelName || '-'}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-sm'>
                      {item.make || '-'}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-sm'>
                      {item.description || '-'}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-center text-sm'>
                      {item.quantity}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-right text-sm'>
                      ₹{item.unitPrice?.toFixed(2) || '0.00'}
                    </td>
                    <td className='border border-gray-300 px-4 py-2 text-right text-sm font-medium'>
                      ₹{calculateLineTotal(item.quantity, item.unitPrice || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-gray-100 font-bold'>
                  <td
                    colSpan={6}
                    className='border border-gray-300 px-4 py-3 text-right text-sm'
                  >
                    Grand Total:
                  </td>
                  <td className='border border-gray-300 px-4 py-3 text-right text-base'>
                    ₹{purchaseRequest.grandTotal?.toFixed(2) || '0.00'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer */}
          <div className='mt-8 pt-6 border-t border-gray-300 text-center text-sm text-gray-600'>
            <p>
              This is a computer-generated document. No signature is required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseRequestPreview;
