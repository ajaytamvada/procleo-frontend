import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Edit2,
  Trash2,
  Download,
  X,
  Plus,
  ArrowLeft,
  Save,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  usePaymentTerms,
  useCreatePaymentTerm,
  useUpdatePaymentTerm,
  useDeletePaymentTerm,
} from '../../hooks/usePaymentTermAPI';
import type { PaymentTerm } from '../../types';

const paymentTermSchema = z.object({
  name: z
    .string()
    .min(1, 'Payment term is required')
    .max(255, 'Cannot exceed 255 characters'),
});

type PaymentTermFormData = z.infer<typeof paymentTermSchema>;

const PaymentTermPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedPaymentTerm, setSelectedPaymentTerm] = useState<
    PaymentTerm | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const pageSize = 20;

  const { data, isLoading, error, refetch } = usePaymentTerms(
    page,
    pageSize,
    nameFilter
  );
  const paymentTerms = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const createMutation = useCreatePaymentTerm();
  const updateMutation = useUpdatePaymentTerm();
  const deleteMutation = useDeletePaymentTerm();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<PaymentTermFormData>({
    resolver: zodResolver(paymentTermSchema),
    defaultValues: selectedPaymentTerm || { name: '' },
    mode: 'onChange',
  });

  React.useEffect(() => {
    reset(selectedPaymentTerm || { name: '' });
  }, [selectedPaymentTerm, reset]);

  const handleCreate = () => {
    setSelectedPaymentTerm(undefined);
    setShowForm(true);
  };
  const handleEdit = (pt: PaymentTerm) => {
    setSelectedPaymentTerm(pt);
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('Delete this payment term?'))
      deleteMutation.mutate(id, { onSuccess: () => refetch() });
  };

  const onSubmit = (data: PaymentTermFormData) => {
    if (selectedPaymentTerm?.id) {
      updateMutation.mutate(
        { id: selectedPaymentTerm.id, paymentTerm: data },
        {
          onSuccess: () => {
            refetch();
            setShowForm(false);
            setSelectedPaymentTerm(undefined);
          },
        }
      );
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          refetch();
          setShowForm(false);
          setSelectedPaymentTerm(undefined);
        },
      });
    }
  };

  const handleExport = () => {
    const csv = [
      ['S.No', 'Payment Term'],
      ...paymentTerms.map((pt, i) => [i + 1, pt.name]),
    ]
      .map(r => r.join(','))
      .join('\n');
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `payment_terms_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push('...');
      for (
        let i = Math.max(1, page - 1);
        i <= Math.min(totalPages - 2, page + 1);
        i++
      )
        if (!pages.includes(i)) pages.push(i);
      if (page < totalPages - 3) pages.push('...');
      if (!pages.includes(totalPages - 1)) pages.push(totalPages - 1);
    }
    return pages;
  };

  const startRecord = totalElements > 0 ? page * pageSize + 1 : 0;
  const endRecord = Math.min((page + 1) * pageSize, totalElements);

  if (showForm) {
    return (
      <div className='min-h-screen bg-[#f8f9fc] p-2'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <button
              onClick={() => {
                setShowForm(false);
                setSelectedPaymentTerm(undefined);
              }}
              className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200'
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                {selectedPaymentTerm
                  ? 'Edit Payment Term'
                  : 'Create Payment Term'}
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                {selectedPaymentTerm
                  ? 'Update payment term details'
                  : 'Create a new payment term'}
              </p>
            </div>
          </div>
          <button
            type='submit'
            form='pt-form'
            disabled={
              createMutation.isPending || updateMutation.isPending || !isValid
            }
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
          >
            <Save size={15} />
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : 'Save'}
          </button>
        </div>

        <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
          <form id='pt-form' onSubmit={handleSubmit(onSubmit)}>
            <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-violet-100 rounded-lg'>
                  <CreditCard size={18} className='text-violet-600' />
                </div>
                <div>
                  <h2 className='text-sm font-semibold text-gray-800'>
                    Payment Term Information
                  </h2>
                  <p className='text-xs text-gray-500'>
                    Fill in the payment term details
                  </p>
                </div>
              </div>
            </div>
            <div className='p-6'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Payment Term <span className='text-red-500'>*</span>
                </label>
                <input
                  {...register('name')}
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                  placeholder='e.g., NET 30, NET 60'
                />
                {errors.name && (
                  <p className='mt-1.5 text-sm text-red-500'>
                    {errors.name.message}
                  </p>
                )}
              </div>
            </div>
            <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
              <button
                type='button'
                onClick={() => {
                  setShowForm(false);
                  setSelectedPaymentTerm(undefined);
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                type='submit'
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !isValid
                }
                className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-400'
              >
                <Save size={15} />
                {selectedPaymentTerm ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Payment Terms</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage payment terms for purchase orders and invoices
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={handleExport}
            disabled={paymentTerms.length === 0}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50'
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={handleCreate}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700'
          >
            <Plus size={15} />
            New Payment Term
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 p-5 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='relative'>
            <input
              type='text'
              value={nameFilter}
              onChange={e => {
                setNameFilter(e.target.value);
                setPage(0);
              }}
              placeholder='Search payment terms...'
              className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
            />
          </div>
          <button
            onClick={() => {
              setNameFilter('');
              setPage(0);
            }}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50'
          >
            <X size={15} />
            Clear
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>
                Loading payment terms...
              </p>
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <p className='text-red-600 font-medium'>Error: {error.message}</p>
            </div>
          ) : paymentTerms.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <CreditCard className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>
                No payment terms found
              </p>
              <p className='text-gray-400 text-sm mt-1'>
                Create your first payment term to get started
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Payment Term
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-24'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {paymentTerms.map((pt, idx) => (
                  <tr
                    key={pt.id}
                    className='hover:bg-gray-50 transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {page * pageSize + idx + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {pt.name}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        <button
                          onClick={() => handleEdit(pt)}
                          className='p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg'
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => pt.id && handleDelete(pt.id)}
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && !isLoading && paymentTerms.length > 0 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <p className='text-sm text-gray-600'>
              Showing <span className='font-medium'>{startRecord}</span> to{' '}
              <span className='font-medium'>{endRecord}</span> of{' '}
              <span className='font-medium'>{totalElements}</span> results
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40'
              >
                <ChevronLeft className='w-4 h-4' />
              </button>
              {getPageNumbers().map((p, i) => (
                <React.Fragment key={i}>
                  {p === '...' ? (
                    <span className='px-3 py-2 text-sm text-gray-400'>...</span>
                  ) : (
                    <button
                      onClick={() => setPage(p as number)}
                      className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium ${page === p ? 'bg-violet-600 text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                      {(p as number) + 1}
                    </button>
                  )}
                </React.Fragment>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages - 1}
                className='p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40'
              >
                <ChevronRight className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentTermPage;
