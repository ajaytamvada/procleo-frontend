/**
 * RFP Preview Detail/Print Page
 * Shows formatted RFP document for preview and printing
 */

import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, Loader2, AlertCircle } from 'lucide-react';
import { useRFPForPreview, useCompanyInfo } from '../hooks/useRFPPreview';
import { vendorApi } from '@/services/vendorApi';
import { useQuery } from '@tanstack/react-query';

export const RFPPreviewDetailPage: React.FC = () => {
  const { rfpId, supplierId } = useParams<{
    rfpId: string;
    supplierId: string;
  }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const rfpIdNum = rfpId ? parseInt(rfpId, 10) : 0;
  const supplierIdNum = supplierId ? parseInt(supplierId, 10) : 0;

  // Fetch data
  const {
    data: rfp,
    isLoading: isLoadingRFP,
    error: rfpError,
  } = useRFPForPreview(rfpIdNum);
  const { data: company, isLoading: isLoadingCompany } = useCompanyInfo();
  const { data: vendor, isLoading: isLoadingVendor } = useQuery({
    queryKey: ['vendor', supplierIdNum],
    queryFn: () => vendorApi.getVendorById(supplierIdNum),
    enabled: !!supplierIdNum,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingRFP || isLoadingCompany || isLoadingVendor) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-purple-600' />
        <span className='ml-2 text-gray-600'>Loading RFP preview...</span>
      </div>
    );
  }

  if (rfpError || !rfp) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4 flex items-start'>
          <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-3' />
          <div>
            <h3 className='text-red-800 font-medium'>Error Loading RFP</h3>
            <p className='text-red-600 text-sm mt-1'>
              {rfpError instanceof Error ? rfpError.message : 'RFP not found'}
            </p>
            <button
              onClick={() => navigate('/rfp/preview')}
              className='mt-3 text-sm text-red-700 hover:text-red-800 underline'
            >
              Return to RFP List
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-full flex flex-col bg-gray-50'>
      {/* Header - Hidden when printing */}
      <div className='bg-white border-b border-gray-200 px-6 py-4 print:hidden'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => navigate('/rfp/preview')}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-2xl font-bold text-gray-900'>Print RFP</h1>
              <p className='text-sm text-gray-600'>{rfp.rfpNumber}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2'
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className='flex-1 overflow-auto p-6 print:p-0'>
        <div
          ref={printRef}
          className='bg-white rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto print:border-0 print:rounded-none print:max-w-none'
        >
          {/* Document Header */}
          <table className='w-full border-collapse border border-gray-300'>
            <tbody>
              {/* Company Header Row */}
              <tr>
                <td className='border border-gray-300 p-4 w-1/3 align-top'>
                  {company?.fileName && (
                    <img
                      src={`${import.meta.env.VITE_API_BASE_URL}/files/${company.fileName}`}
                      alt={company.name}
                      className='w-32 h-auto mb-2'
                      onError={e => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <div className='text-sm'>
                    <p className='font-bold text-base mb-1'>
                      {company?.name || 'Company Name'}
                    </p>
                    {company?.cst && (
                      <p className='text-xs'>GST: {company.cst}</p>
                    )}
                  </div>
                </td>
                <td className='border border-gray-300 p-4 w-1/3 text-center align-middle'>
                  <p className='text-lg font-bold'>ENQUIRY</p>
                </td>
                <td className='border border-gray-300 p-4 w-1/3 align-top'>
                  <div className='text-sm'>
                    <p className='font-bold text-base mb-1'>
                      {vendor?.name || 'Supplier Name'}
                    </p>
                    {vendor?.address1 && (
                      <p className='text-xs'>{vendor.address1}</p>
                    )}
                    {vendor?.address2 && (
                      <p className='text-xs'>{vendor.address2}</p>
                    )}
                    {vendor?.pinCode && (
                      <p className='text-xs'>PIN: {vendor.pinCode}</p>
                    )}
                  </div>
                </td>
              </tr>

              {/* Reference Information */}
              <tr>
                <td colSpan={3} className='border border-gray-300 p-4'>
                  <table className='w-full'>
                    <tbody>
                      <tr>
                        <td className='py-1' colSpan={2}>
                          <strong>Our Ref: {rfp.rfpNumber}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1' colSpan={2}>
                          <strong>PR No: {rfp.prNumber || 'N/A'}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1' colSpan={2}>
                          <strong>Subject: Request for Quotation</strong>
                        </td>
                      </tr>
                      <tr>
                        <td className='pt-3' colSpan={2}>
                          <strong>NOTE:</strong> Please submit your most
                          competitive offer for the supply of the following
                          items furnishing all the required details in the
                          format as under
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Items Table */}
              <tr>
                <td colSpan={3} className='border border-gray-300 p-0'>
                  <table className='w-full border-collapse'>
                    <thead>
                      <tr className='bg-gray-50'>
                        <th className='border border-gray-300 px-4 py-2 text-left font-semibold'>
                          Item Name
                        </th>
                        <th className='border border-gray-300 px-4 py-2 text-left font-semibold w-32'>
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfp.items && rfp.items.length > 0 ? (
                        rfp.items.map((item, index) => (
                          <tr key={index}>
                            <td className='border border-gray-300 px-4 py-2'>
                              {item.itemName}
                            </td>
                            <td className='border border-gray-300 px-4 py-2'>
                              {item.quantity} {item.unitOfMeasurement || ''}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className='border border-gray-300 px-4 py-4 text-center text-gray-500'
                          >
                            No items found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td colSpan={3} className='border border-gray-300 p-4 text-sm'>
                  <div className='space-y-2'>
                    <p>
                      <strong>Closing Date:</strong>{' '}
                      {new Date(rfp.closingDate).toLocaleDateString()}
                    </p>
                    {rfp.paymentTerms && (
                      <p>
                        <strong>Payment Terms:</strong> {rfp.paymentTerms}
                      </p>
                    )}
                    {rfp.remarks && (
                      <div>
                        <p className='font-semibold'>Remarks:</p>
                        <p className='mt-1'>{rfp.remarks}</p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Additional Information */}
          <div className='mt-6 text-xs text-gray-600 space-y-1'>
            {company?.address1 && <p>{company.address1}</p>}
            {company?.address2 && <p>{company.address2}</p>}
            {company?.city && company?.state && company?.pinCode && (
              <p>
                {company.city}, {company.state} - {company.pinCode}
              </p>
            )}
            {company?.phone && <p>Phone: {company.phone}</p>}
            {company?.email && <p>Email: {company.email}</p>}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-0 {
            padding: 0 !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:max-w-none {
            max-width: none !important;
          }
          @page {
            margin: 1cm;
          }
        }
      `}</style>
    </div>
  );
};

export default RFPPreviewDetailPage;
