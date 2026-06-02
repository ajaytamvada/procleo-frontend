import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaymentEligibility, useCreatePayment } from '../hooks/usePayment';
import { PaymentMethod } from '../types';

export default function CreatePaymentPage() {
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const navigate = useNavigate();
  const numericInvoiceId = Number(invoiceId);
  const { data: eligibility, isLoading } =
    usePaymentEligibility(numericInvoiceId);
  const createPayment = useCreatePayment();

  const [form, setForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    paymentAmount: '',
    paymentMethod: '',
    paymentReference: '',
    tdsAmount: '',
    remarks: '',
  });

  const handleSubmit = async (isDraft: boolean) => {
    if (!eligibility?.eligible) return;

    await createPayment.mutateAsync({
      invoiceId: numericInvoiceId,
      paymentDate: form.paymentDate,
      paymentAmount: Number(form.paymentAmount),
      paymentMethod: form.paymentMethod || undefined,
      paymentReference: form.paymentReference || undefined,
      tdsAmount: form.tdsAmount ? Number(form.tdsAmount) : undefined,
      remarks: form.remarks || undefined,
      isDraft,
    });

    navigate('/payment/list');
  };

  if (isLoading) {
    return <div className='p-6'>Loading eligibility...</div>;
  }

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Create Payment</h1>

      {/* Eligibility Card */}
      <div
        className={`rounded-lg border p-4 mb-6 ${eligibility?.eligible ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}
      >
        <h2 className='font-semibold mb-2'>
          {eligibility?.eligible ? '✓ Eligible for Payment' : '✗ Not Eligible'}
        </h2>
        {!eligibility?.eligible && (
          <p className='text-red-700'>{eligibility?.reason}</p>
        )}
        <div className='grid grid-cols-2 gap-4 mt-3 text-sm'>
          <div>
            Invoice: <strong>{eligibility?.invoiceNumber}</strong>
          </div>
          <div>
            Invoice Status: <strong>{eligibility?.invoiceStatus}</strong>
          </div>
          <div>
            GRN Status:{' '}
            <strong>
              {eligibility?.grnStatus ||
                (eligibility?.grnExists ? 'Exists' : 'None')}
            </strong>
          </div>
          <div>
            Max Payable:{' '}
            <strong>₹{eligibility?.maxPayableAmount?.toLocaleString()}</strong>
          </div>
          <div>
            Already Paid:{' '}
            <strong>₹{eligibility?.alreadyPaid?.toLocaleString()}</strong>
          </div>
          <div>
            Remaining:{' '}
            <strong>₹{eligibility?.remainingPayable?.toLocaleString()}</strong>
          </div>
        </div>
      </div>

      {eligibility?.eligible && (
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Payment Date *
              </label>
              <input
                type='date'
                className='w-full border rounded px-3 py-2'
                value={form.paymentDate}
                onChange={e =>
                  setForm({ ...form, paymentDate: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Payment Amount * (Max: ₹
                {eligibility.remainingPayable?.toLocaleString()})
              </label>
              <input
                type='number'
                className='w-full border rounded px-3 py-2'
                value={form.paymentAmount}
                onChange={e =>
                  setForm({ ...form, paymentAmount: e.target.value })
                }
                max={eligibility.remainingPayable}
                step='0.01'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Payment Method
              </label>
              <select
                className='w-full border rounded px-3 py-2'
                value={form.paymentMethod}
                onChange={e =>
                  setForm({ ...form, paymentMethod: e.target.value })
                }
              >
                <option value=''>Select Method</option>
                {Object.values(PaymentMethod).map(method => (
                  <option key={method} value={method}>
                    {method.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                Payment Reference (UTR/Cheque No.)
              </label>
              <input
                type='text'
                className='w-full border rounded px-3 py-2'
                value={form.paymentReference}
                onChange={e =>
                  setForm({ ...form, paymentReference: e.target.value })
                }
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>
                TDS Amount
              </label>
              <input
                type='number'
                className='w-full border rounded px-3 py-2'
                value={form.tdsAmount}
                onChange={e => setForm({ ...form, tdsAmount: e.target.value })}
                step='0.01'
              />
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium mb-1'>Remarks</label>
            <textarea
              className='w-full border rounded px-3 py-2'
              rows={3}
              value={form.remarks}
              onChange={e => setForm({ ...form, remarks: e.target.value })}
            />
          </div>

          <div className='flex gap-3 pt-4'>
            <button
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'
              onClick={() => handleSubmit(false)}
              disabled={createPayment.isPending || !form.paymentAmount}
            >
              {createPayment.isPending ? 'Creating...' : 'Submit for Approval'}
            </button>
            <button
              className='px-4 py-2 border rounded hover:bg-gray-50'
              onClick={() => handleSubmit(true)}
              disabled={createPayment.isPending || !form.paymentAmount}
            >
              Save as Draft
            </button>
            <button
              className='px-4 py-2 border rounded hover:bg-gray-50'
              onClick={() => navigate(-1)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
