import React, { useState } from 'react';
import { Plus, Download, Edit, Trash2, Eye } from 'lucide-react';
import PurchaseRequestForm from './PurchaseRequestForm';
import PurchaseRequestList from './PurchaseRequestList';
import PurchaseRequestPreview from './PurchaseRequestPreview';
import type { PurchaseRequest, PurchaseRequestFilters } from '../types';
import {
  useCreatePurchaseRequest,
  useUpdatePurchaseRequest,
  useDeletePurchaseRequest,
  usePurchaseRequestsPaged,
} from '../hooks/usePurchaseRequestAPI';
import purchaseRequestAPI from '../hooks/usePurchaseRequestAPI';

type ViewMode = 'list' | 'create' | 'edit' | 'view' | 'preview';

const PurchaseRequestPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedPR, setSelectedPR] = useState<PurchaseRequest | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<PurchaseRequestFilters>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingPR, setIsLoadingPR] = useState(false);

  const { data: pagedData, isLoading } = usePurchaseRequestsPaged(page, 15, filters);
  const createMutation = useCreatePurchaseRequest();
  const updateMutation = useUpdatePurchaseRequest();
  const deleteMutation = useDeletePurchaseRequest();

  const handleCreate = () => {
    setSelectedPR(undefined);
    setViewMode('create');
  };

  const handleEdit = (pr: PurchaseRequest) => {
    setSelectedPR(pr);
    setViewMode('edit');
  };

  const handleView = async (pr: PurchaseRequest) => {
    try {
      setIsLoadingPR(true);
      // Fetch full PR details with items
      const fullPR = await purchaseRequestAPI.getById(pr.id!);
      console.log('Fetched full PR with items:', fullPR);
      setSelectedPR(fullPR);
      setViewMode('view');
    } catch (error) {
      console.error('Failed to fetch PR details:', error);
      alert('Failed to load purchase request details. Please try again.');
    } finally {
      setIsLoadingPR(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this purchase request?')) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Purchase request deleted successfully');
      } catch (error) {
        console.error('Delete failed:', error);
        alert('Failed to delete purchase request. Please try again.');
      }
    }
  };

  const handleSubmit = async (data: any, sendForApproval: boolean) => {
    try {
      let savedPR: PurchaseRequest;

      if (viewMode === 'edit' && selectedPR?.id) {
        savedPR = await updateMutation.mutateAsync({
          id: selectedPR.id,
          data,
          sendForApproval,
        });
        console.log('Updated PR:', savedPR);
      } else {
        savedPR = await createMutation.mutateAsync({
          data,
          sendForApproval,
        });
        console.log('Created PR:', savedPR);
      }

      // Show success message
      alert(
        sendForApproval
          ? 'Purchase request submitted successfully'
          : 'Purchase request saved as draft'
      );

      // Redirect to preview page after successful submission
      if (sendForApproval) {
        console.log('Redirecting to preview with PR:', savedPR);
        setSelectedPR(savedPR);
        setViewMode('preview');
      } else {
        // For draft, go back to list
        setViewMode('list');
        setSelectedPR(undefined);
      }
    } catch (error) {
      console.error('Submit failed:', error);
      alert('Failed to save purchase request. Please try again.');
    }
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPR(undefined);
  };

  const handleFiltersChange = (newFilters: PurchaseRequestFilters) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await purchaseRequestAPI.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `purchase_requests_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export purchase requests. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <PurchaseRequestForm
        purchaseRequest={selectedPR}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  if (viewMode === 'preview' && selectedPR) {
    return (
      <PurchaseRequestPreview
        purchaseRequest={selectedPR}
        onBack={handleCancel}
      />
    );
  }

  if (viewMode === 'view') {
    if (isLoadingPR) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading purchase request details...</p>
          </div>
        </div>
      );
    }

    if (selectedPR) {
      // View mode shows the preview component
      return (
        <PurchaseRequestPreview
          purchaseRequest={selectedPR}
          onBack={handleCancel}
        />
      );
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:bg-gray-400"
          >
            <Download size={20} />
            {isExporting ? 'Exporting...' : 'Export to Excel'}
          </button>
          <button
            onClick={handleCreate}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Create Purchase Request
          </button>
        </div>
      </div>

      <PurchaseRequestList
        purchaseRequests={pagedData?.content || []}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        isLoading={isLoading}
        page={page}
        totalPages={pagedData?.totalPages || 0}
        totalElements={pagedData?.totalElements || 0}
        onPageChange={setPage}
        onFiltersChange={handleFiltersChange}
      />
    </div>
  );
};

export default PurchaseRequestPage;
