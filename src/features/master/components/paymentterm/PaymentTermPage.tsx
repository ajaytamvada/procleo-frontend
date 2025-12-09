import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit2, Trash2, Download, X } from 'lucide-react';
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

  // Fetch payment terms
  const { data, isLoading, error, refetch } = usePaymentTerms(
    page,
    20,
    nameFilter
  );
  const paymentTerms = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Mutations
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
    if (selectedPaymentTerm) {
      reset(selectedPaymentTerm);
    } else {
      reset({ name: '' });
    }
  }, [selectedPaymentTerm, reset]);

  const handleCreate = () => {
    setSelectedPaymentTerm(undefined);
    setShowForm(true);
  };

  const handleEdit = (paymentTerm: PaymentTerm) => {
    setSelectedPaymentTerm(paymentTerm);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this payment term?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => refetch(),
      });
    }
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
    const headers = ['S.No', 'Payment Term'];
    const rows = paymentTerms.map((pt, index) => [index + 1, pt.name]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment_terms_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (showForm) {
    return (
      <div className='container mx-auto p-6'>
        <div className='bg-white rounded-lg shadow-md p-6'>
          <div className='mb-6'>
            <h2 className='text-2xl font-bold text-gray-900'>
              {selectedPaymentTerm
                ? 'Edit Payment Term'
                : 'Create Payment Term'}
            </h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Payment Term <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                {...register('name')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder='Enter payment term (e.g., NET 30, NET 60)'
              />
              {errors.name && (
                <p className='mt-1 text-sm text-red-600'>
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className='border-t pt-6 flex justify-end space-x-4'>
              <button
                type='button'
                onClick={() => {
                  setShowForm(false);
                  setSelectedPaymentTerm(undefined);
                }}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>

              <button
                type='submit'
                className='px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50'
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending ||
                  !isValid
                }
              >
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : selectedPaymentTerm
                    ? 'Update'
                    : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6 space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Payment Terms</h1>
          <p className='text-sm text-gray-600 mt-1'>
            Manage payment terms for purchase orders and invoices
          </p>
        </div>
        <div className='flex space-x-3'>
          <button
            onClick={handleExport}
            disabled={paymentTerms.length === 0}
            className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
          >
            <Download size={16} className='mr-2' />
            Export
          </button>
          <button
            onClick={handleCreate}
            className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700'
          >
            + New Payment Term
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Search
            </label>
            <input
              type='text'
              value={nameFilter}
              onChange={e => {
                setNameFilter(e.target.value);
                setPage(0);
              }}
              placeholder='Search payment terms...'
              className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>
          <div className='flex items-end'>
            <button
              onClick={() => {
                setNameFilter('');
                setPage(0);
              }}
              className='inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50'
            >
              <X size={16} className='mr-2' />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
        <p className='text-sm text-blue-800'>
          Showing <span className='font-semibold'>{paymentTerms.length}</span>{' '}
          of <span className='font-semibold'>{totalElements}</span> payment
          terms
        </p>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg shadow overflow-hidden'>
        {isLoading ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-lg'>Loading payment terms...</div>
          </div>
        ) : error ? (
          <div className='flex items-center justify-center h-64'>
            <div className='text-lg text-red-600'>Error: {error.message}</div>
          </div>
        ) : (
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  S.No
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Payment Term
                </th>
                <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {paymentTerms.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className='px-6 py-12 text-center text-gray-500'
                  >
                    <div className='flex flex-col items-center'>
                      <p className='text-lg mb-2'>No payment terms found</p>
                      <p className='text-sm'>
                        Create your first payment term to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paymentTerms.map((paymentTerm, index) => (
                  <tr key={paymentTerm.id} className='hover:bg-gray-50'>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                      {page * 20 + index + 1}
                    </td>
                    <td className='px-6 py-4 text-sm font-medium text-gray-900'>
                      {paymentTerm.name}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={() => handleEdit(paymentTerm)}
                          className='text-blue-600 hover:text-blue-900 p-1'
                          title='Edit'
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() =>
                            paymentTerm.id && handleDelete(paymentTerm.id)
                          }
                          className='text-red-600 hover:text-red-900 p-1'
                          title='Delete'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow'>
          <div>
            <p className='text-sm text-gray-700'>
              Page <span className='font-medium'>{page + 1}</span> of{' '}
              <span className='font-medium'>{totalPages}</span>
            </p>
          </div>
          <div>
            <nav className='isolate inline-flex -space-x-px rounded-md shadow-sm'>
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 0}
                className='relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50'
              >
                Previous
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages - 1}
                className='relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:opacity-50'
              >
                Next
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentTermPage;
