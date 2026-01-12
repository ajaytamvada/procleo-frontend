import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, AlertCircle } from 'lucide-react';
import { rfpApi } from '../services/rfpApi';
import toast from 'react-hot-toast';

interface ExtendRFPDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rfpId: number;
  currentClosingDate: string;
}

export const ExtendRFPDialog: React.FC<ExtendRFPDialogProps> = ({
  isOpen,
  onClose,
  rfpId,
  currentClosingDate,
}) => {
  const queryClient = useQueryClient();
  const [newDate, setNewDate] = useState('');
  const [reason, setReason] = useState('');

  const extendMutation = useMutation({
    mutationFn: (data: { newClosingDate: string; reason: string }) =>
      rfpApi.extendRFP(rfpId, data.newClosingDate, data.reason),
    onSuccess: () => {
      toast.success('RFP closing date extended successfully');
      queryClient.invalidateQueries({ queryKey: ['rfp', 'comparison', rfpId] });
      queryClient.invalidateQueries({ queryKey: ['rfps', 'for-evaluation'] });
      onClose();
      setNewDate('');
      setReason('');
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || 'Failed to extend RFP closing date'
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDate) {
      toast.error('Please select a new closing date');
      return;
    }

    if (new Date(newDate) <= new Date(currentClosingDate)) {
      toast.error('New date must be after the current closing date');
      return;
    }

    extendMutation.mutate({ newClosingDate: newDate, reason });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto'>
      <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
        <div className='fixed inset-0 transition-opacity' aria-hidden='true'>
          <div className='absolute inset-0 bg-gray-500 opacity-75'></div>
        </div>

        <span
          className='hidden sm:inline-block sm:align-middle sm:h-screen'
          aria-hidden='true'
        >
          &#8203;
        </span>

        <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
          <form onSubmit={handleSubmit}>
            <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
              <div className='sm:flex sm:items-start'>
                <div className='mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10'>
                  <Calendar className='h-6 w-6 text-blue-600' />
                </div>
                <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full'>
                  <h3 className='text-lg leading-6 font-medium text-gray-900'>
                    Extend RFP Closing Date
                  </h3>
                  <div className='mt-2'>
                    <div className='bg-blue-50 border-l-4 border-blue-400 p-3 mb-4'>
                      <div className='flex'>
                        <div className='flex-shrink-0'>
                          <AlertCircle className='h-5 w-5 text-blue-400' />
                        </div>
                        <div className='ml-3'>
                          <p className='text-sm text-blue-700'>
                            Current Closing Date:{' '}
                            <span className='font-bold'>
                              {new Date(
                                currentClosingDate
                              ).toLocaleDateString()}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          New Closing Date
                        </label>
                        <input
                          type='date'
                          required
                          min={
                            new Date(currentClosingDate)
                              .toISOString()
                              .split('T')[0]
                          }
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                        />
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-1'>
                          Reason for Extension (Optional)
                        </label>
                        <textarea
                          rows={3}
                          value={reason}
                          onChange={e => setReason(e.target.value)}
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
                          placeholder='Explain why the date is being extended...'
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
              <button
                type='submit'
                disabled={extendMutation.isPending}
                className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
              >
                {extendMutation.isPending ? 'Extending...' : 'Extend Date'}
              </button>
              <button
                type='button'
                onClick={onClose}
                className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm'
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
