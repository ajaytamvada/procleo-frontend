import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import DesignationList from './DesignationList';
import DesignationForm from './DesignationForm';
import {
  useDesignationsPaged,
  useCreateDesignation,
  useUpdateDesignation,
  useDeleteDesignation,
  type Designation,
  type DesignationFilters,
} from '../../hooks/useDesignationAPI';

const DesignationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<DesignationFilters>({});

  const { data, isLoading, error, refetch } = useDesignationsPaged(page, 15, filters);
  const designations = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const createMutation = useCreateDesignation();
  const updateMutation = useUpdateDesignation();
  const deleteMutation = useDeleteDesignation();

  const handleCreate = () => {
    setSelectedDesignation(undefined);
    setShowForm(true);
  };

  const handleEdit = (designation: Designation) => {
    setSelectedDesignation(designation);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedDesignation(undefined);
  };

  const handleSubmit = async (data: Omit<Designation, 'id'>) => {
    try {
      if (selectedDesignation?.id) {
        // Update existing designation
        await updateMutation.mutateAsync({
          id: selectedDesignation.id,
          data,
        });
        toast.success('Designation updated successfully');
      } else {
        // Create new designation
        await createMutation.mutateAsync(data);
        toast.success('Designation created successfully');
      }
      setShowForm(false);
      setSelectedDesignation(undefined);
    } catch (error: any) {
      // Error toast is handled by global mutation error handler in query-client.ts
      // Just log for debugging
      console.error('Error saving designation:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Designation deleted successfully');
    } catch (error: any) {
      // Error toast is handled by global mutation error handler in query-client.ts
      console.error('Error deleting designation:', error);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading designations: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <DesignationForm
        designation={selectedDesignation}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <DesignationList
      designations={designations}
      onEdit={handleEdit}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
      error={error}
      currentPage={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={setPage}
      onFiltersChange={setFilters}
    />
  );
};

export default DesignationPage;
