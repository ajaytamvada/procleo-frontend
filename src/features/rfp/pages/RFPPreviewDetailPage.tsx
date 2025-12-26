/**
 * RFP Preview Detail/Print Page
 * Shows formatted RFP document for preview and printing
 */

import React, { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer, AlertCircle } from 'lucide-react';
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

  const isLoading = isLoadingRFP || isLoadingCompany || isLoadingVendor;

  if (isLoading) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header Skeleton */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center gap-3'>
              <div className='w-8 h-8 bg-gray-200 rounded-lg animate-pulse'></div>
              <div>
                <div className='w-32 h-5 bg-gray-200 rounded animate-pulse'></div>
                <div className='w-24 h-4 bg-gray-200 rounded animate-pulse mt-1'></div>
              </div>
            </div>
            <div className='w-24 h-10 bg-gray-200 rounded-md animate-pulse'></div>
          </div>

          {/* Content Skeleton */}
          <div className='bg-white rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto'>
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading RFP preview...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (rfpError || !rfp) {
    return (
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button
              onClick={() => navigate('/rfp/preview')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className='text-xl font-semibold text-gray-900'>Print RFP</h1>
          </div>

          {/* Error Card */}
          <div className='bg-white rounded-lg border border-gray-200 p-6 max-w-2xl'>
            <div className='flex items-start gap-3'>
              <div className='w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <AlertCircle className='w-5 h-5 text-red-600' />
              </div>
              <div>
                <h3 className='text-base font-semibold text-gray-900'>
                  Error Loading RFP
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {rfpError instanceof Error
                    ? rfpError.message
                    : 'RFP not found'}
                </p>
                <button
                  onClick={() => navigate('/rfp/preview')}
                  className='mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 rounded-md hover:bg-violet-100 transition-colors'
                >
                  <ArrowLeft size={15} />
                  Return to RFP List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc]'>
      {/* Header - Hidden when printing */}
      <div className=' print:hidden'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <button
              onClick={() => navigate('/rfp/preview')}
              className='p-1.5 text-gray-500 hover:text-gray-700 rounded-lg transition-colors'
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>Print RFP</h1>
              <p className='text-sm text-gray-500 mt-0.5'>{rfp.rfpNumber}</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Printer size={15} />
            Print
          </button>
        </div>

        {/* Print Content */}
        <div
          ref={printRef}
          className='bg-white rounded-lg border border-gray-200 p-8 max-w-5xl mx-auto print:border-0 print:rounded-none print:max-w-none print:p-0'
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
                      <p className='text-xs text-gray-600'>
                        GST: {company.cst}
                      </p>
                    )}
                  </div>
                </td>
                <td className='border border-gray-300 p-4 w-1/3 text-center align-middle'>
                  <p className='text-lg font-bold text-gray-900'>ENQUIRY</p>
                </td>
                <td className='border border-gray-300 p-4 w-1/3 align-top'>
                  <div className='text-sm'>
                    <p className='font-bold text-base mb-1 text-gray-900'>
                      {vendor?.name || 'Supplier Name'}
                    </p>
                    {vendor?.address1 && (
                      <p className='text-xs text-gray-600'>{vendor.address1}</p>
                    )}
                    {vendor?.address2 && (
                      <p className='text-xs text-gray-600'>{vendor.address2}</p>
                    )}
                    {vendor?.pinCode && (
                      <p className='text-xs text-gray-600'>
                        PIN: {vendor.pinCode}
                      </p>
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
                        <td className='py-1.5' colSpan={2}>
                          <span className='text-sm'>
                            <strong className='text-gray-900'>Our Ref:</strong>{' '}
                            <span className='text-violet-600 font-medium'>
                              {rfp.rfpNumber}
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1.5' colSpan={2}>
                          <span className='text-sm'>
                            <strong className='text-gray-900'>PR No:</strong>{' '}
                            <span className='text-gray-700'>
                              {rfp.prNumber || 'N/A'}
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1.5' colSpan={2}>
                          <span className='text-sm'>
                            <strong className='text-gray-900'>Subject:</strong>{' '}
                            <span className='text-gray-700'>
                              Request for Quotation
                            </span>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className='pt-4' colSpan={2}>
                          <p className='text-sm text-gray-700'>
                            <strong className='text-gray-900'>NOTE:</strong>{' '}
                            Please submit your most competitive offer for the
                            supply of the following items furnishing all the
                            required details in the format as under
                          </p>
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
                      <tr className='bg-[#fafbfc]'>
                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide'>
                          Item Name
                        </th>
                        <th className='border border-gray-300 px-4 py-3 text-left text-xs font-semibold text-gray-600 tracking-wide w-32'>
                          Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rfp.items && rfp.items.length > 0 ? (
                        rfp.items.map((item, index) => (
                          <tr key={index} className='hover:bg-gray-50'>
                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-700'>
                              {item.itemName}
                            </td>
                            <td className='border border-gray-300 px-4 py-3 text-sm text-gray-700'>
                              {item.quantity} {item.unitOfMeasurement || ''}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={2}
                            className='border border-gray-300 px-4 py-8 text-center text-gray-400'
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
                <td colSpan={3} className='border border-gray-300 p-4'>
                  <div className='space-y-3 text-sm'>
                    <div className='flex items-center gap-2'>
                      <span className='font-semibold text-gray-900'>
                        Closing Date:
                      </span>
                      <span className='text-gray-700'>
                        {new Date(rfp.closingDate).toLocaleDateString()}
                      </span>
                    </div>
                    {rfp.paymentTerms && (
                      <div className='flex items-center gap-2'>
                        <span className='font-semibold text-gray-900'>
                          Payment Terms:
                        </span>
                        <span className='text-gray-700'>
                          {rfp.paymentTerms}
                        </span>
                      </div>
                    )}
                    {rfp.remarks && (
                      <div>
                        <p className='font-semibold text-gray-900 mb-1'>
                          Remarks:
                        </p>
                        <p className='text-gray-700'>{rfp.remarks}</p>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Additional Information */}
          <div className='mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-600 space-y-1'>
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

      {/* Print-only Content */}
      <div className='hidden print:block p-0'>
        <div ref={printRef} className='bg-white p-8'>
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
                  <p className='py-1'>
                    <strong>Our Ref:</strong> {rfp.rfpNumber}
                  </p>
                  <p className='py-1'>
                    <strong>PR No:</strong> {rfp.prNumber || 'N/A'}
                  </p>
                  <p className='py-1'>
                    <strong>Subject:</strong> Request for Quotation
                  </p>
                  <p className='pt-3'>
                    <strong>NOTE:</strong> Please submit your most competitive
                    offer for the supply of the following items furnishing all
                    the required details in the format as under
                  </p>
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
                            className='border border-gray-300 px-4 py-4 text-center'
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
                    <div className='mt-2'>
                      <p className='font-semibold'>Remarks:</p>
                      <p>{rfp.remarks}</p>
                    </div>
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Company Footer */}
          <div className='mt-4 text-xs space-y-1'>
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
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          @page {
            margin: 1cm;
            size: A4;
          }
        }
      `}</style>
    </div>
  );
};

export default RFPPreviewDetailPage;
