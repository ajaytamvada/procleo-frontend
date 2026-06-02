import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAllPayments } from '../hooks/usePayment';
import { PaymentStatus } from '../types';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  PROCESSED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function PaymentListPage() {
  const { data: payments = [], isLoading } = useAllPayments();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('');

  const filtered = statusFilter
    ? payments.filter(p => p.status === statusFilter)
    : payments;

  if (isLoading) {
    return <div className='p-6'>Loading payments...</div>;
  }

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6'>
        <h1 className='text-2xl font-bold'>Payments</h1>
        <select
          className='border rounded px-3 py-2'
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value=''>All Statuses</option>
          {Object.values(PaymentStatus).map(s => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className='border rounded-lg overflow-hidden'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50'>
            <tr>
              <th className='px-4 py-3 text-left font-medium'>Payment #</th>
              <th className='px-4 py-3 text-left font-medium'>Invoice #</th>
              <th className='px-4 py-3 text-left font-medium'>Supplier</th>
              <th className='px-4 py-3 text-left font-medium'>Date</th>
              <th className='px-4 py-3 text-right font-medium'>Amount</th>
              <th className='px-4 py-3 text-left font-medium'>Method</th>
              <th className='px-4 py-3 text-left font-medium'>Status</th>
              <th className='px-4 py-3 text-left font-medium'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y'>
            {filtered.map(payment => (
              <tr key={payment.id} className='hover:bg-gray-50'>
                <td className='px-4 py-3 font-medium'>
                  {payment.paymentNumber}
                </td>
                <td className='px-4 py-3'>{payment.invoiceNumber}</td>
                <td className='px-4 py-3'>{payment.supplierName}</td>
                <td className='px-4 py-3'>{payment.paymentDate}</td>
                <td className='px-4 py-3 text-right'>
                  ₹{payment.paymentAmount?.toLocaleString()}
                </td>
                <td className='px-4 py-3'>
                  {payment.paymentMethod?.replace('_', ' ') || '-'}
                </td>
                <td className='px-4 py-3'>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[payment.status] || 'bg-gray-100'}`}
                  >
                    {payment.status.replace('_', ' ')}
                  </span>
                </td>
                <td className='px-4 py-3'>
                  <button
                    className='text-blue-600 hover:underline'
                    onClick={() => navigate(`/payment/preview/${payment.id}`)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className='px-4 py-8 text-center text-gray-500'>
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
