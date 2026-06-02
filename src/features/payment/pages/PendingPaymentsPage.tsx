import { useState } from 'react';
import {
  usePendingPayments,
  useApprovePayment,
  useRejectPayment,
} from '../hooks/usePayment';

export default function PendingPaymentsPage() {
  const { data: payments = [], isLoading } = usePendingPayments();
  const approve = useApprovePayment();
  const reject = useRejectPayment();
  const [rejectRemarks, setRejectRemarks] = useState<Record<number, string>>(
    {}
  );
  const [showRejectInput, setShowRejectInput] = useState<number | null>(null);

  if (isLoading) {
    return <div className='p-6'>Loading pending payments...</div>;
  }

  return (
    <div className='p-6'>
      <h1 className='text-2xl font-bold mb-6'>Pending Payment Approvals</h1>

      {payments.length === 0 ? (
        <div className='text-center py-12 text-gray-500 border rounded-lg'>
          No payments pending approval
        </div>
      ) : (
        <div className='space-y-4'>
          {payments.map(payment => (
            <div key={payment.id} className='border rounded-lg p-4'>
              <div className='grid grid-cols-4 gap-4 mb-3'>
                <div>
                  <div className='text-xs text-gray-500'>Payment #</div>
                  <div className='font-medium'>{payment.paymentNumber}</div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Invoice</div>
                  <div>{payment.invoiceNumber}</div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Supplier</div>
                  <div>{payment.supplierName}</div>
                </div>
                <div>
                  <div className='text-xs text-gray-500'>Amount</div>
                  <div className='font-semibold'>
                    ₹{payment.paymentAmount?.toLocaleString()}
                  </div>
                </div>
              </div>
              <div className='grid grid-cols-4 gap-4 mb-3 text-sm'>
                <div>
                  <span className='text-gray-500'>Date:</span>{' '}
                  {payment.paymentDate}
                </div>
                <div>
                  <span className='text-gray-500'>Method:</span>{' '}
                  {payment.paymentMethod?.replace('_', ' ') || '-'}
                </div>
                <div>
                  <span className='text-gray-500'>Reference:</span>{' '}
                  {payment.paymentReference || '-'}
                </div>
                <div>
                  <span className='text-gray-500'>Net Amount:</span> ₹
                  {payment.netAmount?.toLocaleString()}
                </div>
              </div>

              {showRejectInput === payment.id ? (
                <div className='flex gap-2 items-center'>
                  <input
                    type='text'
                    className='flex-1 border rounded px-3 py-2 text-sm'
                    placeholder='Rejection reason...'
                    value={rejectRemarks[payment.id] || ''}
                    onChange={e =>
                      setRejectRemarks({
                        ...rejectRemarks,
                        [payment.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    className='px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700'
                    onClick={() => {
                      reject.mutate({
                        id: payment.id,
                        remarks: rejectRemarks[payment.id],
                      });
                      setShowRejectInput(null);
                    }}
                  >
                    Confirm Reject
                  </button>
                  <button
                    className='px-3 py-2 border rounded text-sm hover:bg-gray-50'
                    onClick={() => setShowRejectInput(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className='flex gap-2'>
                  <button
                    className='px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700'
                    onClick={() => approve.mutate(payment.id)}
                    disabled={approve.isPending}
                  >
                    Approve & Process
                  </button>
                  <button
                    className='px-4 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200'
                    onClick={() => setShowRejectInput(payment.id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
