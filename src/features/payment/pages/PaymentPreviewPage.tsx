import { useParams, useNavigate } from 'react-router-dom';
import { usePaymentById } from '../hooks/usePayment';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PROCESSED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function PaymentPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: payment, isLoading } = usePaymentById(Number(id));

  if (isLoading) {
    return <div className='p-6'>Loading payment details...</div>;
  }

  if (!payment) {
    return <div className='p-6'>Payment not found</div>;
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Payment Details</h1>
        <button
          className='px-4 py-2 border rounded hover:bg-gray-50'
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>

      <div className='border rounded-lg p-6 space-y-6'>
        {/* Header */}
        <div className='flex justify-between items-start'>
          <div>
            <h2 className='text-xl font-semibold'>{payment.paymentNumber}</h2>
            <p className='text-gray-500 text-sm'>
              Created: {payment.createdDate}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[payment.status] || 'bg-gray-100'}`}
          >
            {payment.status.replace('_', ' ')}
          </span>
        </div>

        {/* Details Grid */}
        <div className='grid grid-cols-2 gap-y-4 gap-x-8 text-sm'>
          <div>
            <span className='text-gray-500'>Invoice:</span>{' '}
            <strong>{payment.invoiceNumber}</strong>
          </div>
          <div>
            <span className='text-gray-500'>PO:</span>{' '}
            <strong>{payment.poNumber || '-'}</strong>
          </div>
          <div>
            <span className='text-gray-500'>GRN:</span>{' '}
            <strong>{payment.grnNumber || '-'}</strong>
          </div>
          <div>
            <span className='text-gray-500'>Supplier:</span>{' '}
            <strong>{payment.supplierName}</strong>
          </div>
          <div>
            <span className='text-gray-500'>Payment Date:</span>{' '}
            <strong>{payment.paymentDate}</strong>
          </div>
          <div>
            <span className='text-gray-500'>Method:</span>{' '}
            <strong>{payment.paymentMethod?.replace('_', ' ') || '-'}</strong>
          </div>
          <div>
            <span className='text-gray-500'>Reference:</span>{' '}
            <strong>{payment.paymentReference || '-'}</strong>
          </div>
          <div>
            <span className='text-gray-500'>Created By:</span>{' '}
            <strong>{payment.createdByName || payment.createdBy}</strong>
          </div>
        </div>

        {/* Financial */}
        <div className='border-t pt-4'>
          <h3 className='font-semibold mb-3'>Financial Details</h3>
          <div className='grid grid-cols-3 gap-4 text-sm'>
            <div className='border rounded p-3 text-center'>
              <div className='text-gray-500'>Payment Amount</div>
              <div className='text-xl font-bold'>
                ₹{payment.paymentAmount?.toLocaleString()}
              </div>
            </div>
            <div className='border rounded p-3 text-center'>
              <div className='text-gray-500'>TDS Deducted</div>
              <div className='text-xl font-bold'>
                ₹{payment.tdsAmount?.toLocaleString() || '0'}
              </div>
            </div>
            <div className='border rounded p-3 text-center'>
              <div className='text-gray-500'>Net Amount</div>
              <div className='text-xl font-bold text-green-700'>
                ₹{payment.netAmount?.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Approval info */}
        {payment.approvedBy && (
          <div className='border-t pt-4'>
            <h3 className='font-semibold mb-2'>Approval</h3>
            <div className='text-sm'>
              <span className='text-gray-500'>Approved By:</span>{' '}
              {payment.approvedByName || payment.approvedBy} on{' '}
              {payment.approvedDate}
            </div>
          </div>
        )}

        {/* Remarks */}
        {payment.remarks && (
          <div className='border-t pt-4'>
            <h3 className='font-semibold mb-2'>Remarks</h3>
            <p className='text-sm text-gray-700'>{payment.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}
