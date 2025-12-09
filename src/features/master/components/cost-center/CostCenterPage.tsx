import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import CostCenterList from './CostCenterList';
import CostCenterForm from './CostCenterForm';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import {
  useCostCentersPaged,
  useCreateCostCenter,
  useUpdateCostCenter,
  useDeleteCostCenter,
  type CostCenter,
  type CostCenterFilters,
} from '../../hooks/useCostCenterAPI';

const CostCenterPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<
    CostCenter | undefined
  >();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CostCenterFilters>({});

  const { data, isLoading, error, refetch } = useCostCentersPaged(
    page,
    15,
    filters
  );
  const costCenters = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const createMutation = useCreateCostCenter();
  const updateMutation = useUpdateCostCenter();
  const deleteMutation = useDeleteCostCenter();

  const handleCreate = () => {
    setSelectedCostCenter(undefined);
    setShowForm(true);
  };

  const handleEdit = (costCenter: CostCenter) => {
    setSelectedCostCenter(costCenter);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCostCenter(undefined);
  };

  const handleSubmit = async (data: Omit<CostCenter, 'id'>) => {
    try {
      if (selectedCostCenter?.id) {
        // Update existing cost center
        await updateMutation.mutateAsync({
          id: selectedCostCenter.id,
          data,
        });
        toast.success('Cost center updated successfully');
      } else {
        // Create new cost center
        await createMutation.mutateAsync(data);
        toast.success('Cost center created successfully');
      }
      setShowForm(false);
      setSelectedCostCenter(undefined);
    } catch (error: any) {
      // Error toast is handled by global mutation error handler in query-client.ts
      console.error('Error saving cost center:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Cost center deleted successfully');
    } catch (error: any) {
      // Error toast is handled by global mutation error handler in query-client.ts
      console.error('Error deleting cost center:', error);
    }
  };

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          Error loading cost centers: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CostCenterForm
        costCenter={selectedCostCenter}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <>
      <CostCenterList
        costCenters={costCenters}
        onEdit={handleEdit}
        onCreate={handleCreate}
        onDelete={handleDelete}
        onImport={() => setShowImportDialog(true)}
        isLoading={isLoading}
        error={error}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onFiltersChange={setFilters}
      />
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        entityName='Cost Center'
        importEndpoint='/master/cost-centers/import'
        templateEndpoint='/master/cost-centers/import/template'
        onImportSuccess={() => setPage(0)}
      />
    </>
  );
};

export default CostCenterPage;
