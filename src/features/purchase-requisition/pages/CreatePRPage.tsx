import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PurchaseRequestForm from '@/features/purchase/components/PurchaseRequestForm';
import {
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  usePurchaseRequest,
} from '@/features/purchase/hooks/usePurchaseRequestAPI';
import toast from 'react-hot-toast';

export const CreatePRPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prId = searchParams.get('id');

  // Fetch PR data if editing
  const { data: existingPR, isLoading: isLoadingPR } = usePurchaseRequest(
    prId ? parseInt(prId, 10) : 0
  );

  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();

  const isEditMode = !!prId;

  const handleSubmit = async (data: any, sendForApproval: boolean) => {
    try {
      if (isEditMode && prId) {
        // Update existing PR
        await updateMutation.mutateAsync({
          id: parseInt(prId, 10),
          data,
          sendForApproval,
        });

        if (sendForApproval) {
          toast.success('Purchase request updated and submitted successfully');
        } else {
          toast.success('Purchase request updated successfully');
        }
      } else {
        // Create new PR
        await createMutation.mutateAsync({
          data,
          sendForApproval,
        });

        if (sendForApproval) {
          toast.success('Purchase request submitted successfully');
        } else {
          toast.success('Purchase request saved as draft');
        }
      }

      // Redirect to PR Preview page after successful submission
      navigate('/purchase-requisition/preview');
    } catch (error) {
      console.error('Failed to submit PR:', error);
      toast.error('Failed to submit purchase request. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/purchase-requisition/manage');
  };

  // Show loading state while fetching PR data
  if (isEditMode && isLoadingPR) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='max-w-full mx-auto bg-gray-50 min-h-screen'>
      <PurchaseRequestForm
        purchaseRequest={isEditMode ? existingPR : undefined}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
};
