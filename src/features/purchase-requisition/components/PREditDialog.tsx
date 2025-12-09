/**
 * Dialog component for editing Purchase Requests
 */

import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
    usePurchaseRequest,
    useUpdatePurchaseRequest,
} from '@/features/purchase/hooks/usePurchaseRequestAPI';
import PurchaseRequestForm from '@/features/purchase/components/PurchaseRequestForm';
import toast from 'react-hot-toast';

interface PREditDialogProps {
    prId: number;
    onClose: () => void;
}

export const PREditDialog: React.FC<PREditDialogProps> = ({
    prId,
    onClose,
}) => {
    // Fetch PR details
    const { data: prDetails, isLoading, error } = usePurchaseRequest(prId);

    // Update mutation
    const updateMutation = useUpdatePurchaseRequest();

    // Handle form submission
    const handleSubmit = async (data: any, sendForApproval: boolean) => {
        try {
            await updateMutation.mutateAsync({
                id: prId,
                data,
                sendForApproval,
            });

            if (sendForApproval) {
                toast.success('Purchase request updated and submitted successfully');
            } else {
                toast.success('Purchase request updated successfully');
            }

            // Close dialog on success
            onClose();
        } catch (error) {
            console.error('Update failed:', error);
            toast.error('Failed to update purchase request. Please try again.');
        }
    };

    if (isLoading) {
        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-8'>
                    <div className='flex items-center justify-center'>
                        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !prDetails) {
        return (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
                <div className='bg-white rounded-lg p-8 max-w-md'>
                    <div className='text-center'>
                        <div className='inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4'>
                            <span className='text-2xl'>⚠️</span>
                        </div>
                        <h3 className='text-lg font-medium text-gray-900 mb-2'>
                            Error Loading PR Details
                        </h3>
                        <p className='text-gray-500 mb-4'>
                            Failed to load purchase request details. Please try again.
                        </p>
                        <Button onClick={onClose}>Close</Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg shadow-xl max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col'>
                {/* Header */}
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50'>
                    <div>
                        <h2 className='text-2xl font-bold text-gray-900'>Edit Purchase Request</h2>
                        <p className='text-sm text-gray-500 mt-1'>
                            Request Number: {prDetails.requestNumber || 'N/A'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-600 transition-colors'
                    >
                        <X className='h-6 w-6' />
                    </button>
                </div>

                {/* Content */}
                <div className='flex-1 overflow-y-auto'>
                    <PurchaseRequestForm
                        purchaseRequest={prDetails}
                        onSubmit={handleSubmit}
                        onCancel={onClose}
                        isSubmitting={updateMutation.isPending}
                    />
                </div>
            </div>
        </div>
    );
};
