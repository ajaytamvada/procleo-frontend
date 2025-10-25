import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import UOMList from './UOMList';
import UOMForm from './UOMForm';
import {
  useUOMsPaged,
  useCreateUOM,
  useUpdateUOM,
  useDeleteUOM,
  type UOM,
  type UOMFilters,
} from '../../hooks/useUOMAPI';

const UOMPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUOM, setSelectedUOM] = useState<UOM | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<UOMFilters>({});

  const { data, isLoading, error } = useUOMsPaged(page, 15, filters);
  const uoms = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateUOM();
  const updateMutation = useUpdateUOM();
  const deleteMutation = useDeleteUOM();

  const handleCreate = () => {
    setSelectedUOM(undefined);
    setShowForm(true);
  };

  const handleEdit = (uom: UOM) => {
    setSelectedUOM(uom);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedUOM(undefined);
  };

  const handleSubmit = async (data: Omit<UOM, 'id'>) => {
    try {
      if (selectedUOM?.id) {
        // Update existing UOM
        await updateMutation.mutateAsync({
          id: selectedUOM.id,
          data,
        });
        toast.success('UOM updated successfully');
      } else {
        // Create new UOM
        await createMutation.mutateAsync(data);
        toast.success('UOM created successfully');
      }
      setShowForm(false);
      setSelectedUOM(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the UOM';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('UOM deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the UOM';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading UOMs: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <UOMForm
        uom={selectedUOM}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <UOMList
      uoms={uoms}
      onEdit={handleEdit}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
      page={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={setPage}
      onFiltersChange={setFilters}
    />
  );
};

export default UOMPage;
