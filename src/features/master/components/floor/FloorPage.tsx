import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import FloorList from './FloorList';
import FloorForm from './FloorForm';
import {
  useFloorsPaged,
  useCreateFloor,
  useUpdateFloor,
  useDeleteFloor,
  type Floor,
  type FloorFilters,
} from '../../hooks/useFloorAPI';

const FloorPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<Floor | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<FloorFilters>({});

  const { data, isLoading, error } = useFloorsPaged(page, 15, filters);
  const floors = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateFloor();
  const updateMutation = useUpdateFloor();
  const deleteMutation = useDeleteFloor();

  const handleCreate = () => {
    setSelectedFloor(undefined);
    setShowForm(true);
  };

  const handleEdit = (floor: Floor) => {
    setSelectedFloor(floor);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedFloor(undefined);
  };

  const handleSubmit = async (data: Omit<Floor, 'id'>) => {
    try {
      if (selectedFloor?.id) {
        await updateMutation.mutateAsync({
          id: selectedFloor.id,
          data,
        });
        toast.success('Location updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Location created successfully');
      }
      setShowForm(false);
      setSelectedFloor(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the location';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Location deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the location';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading locations: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <FloorForm
        floor={selectedFloor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <FloorList
      floors={floors}
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

export default FloorPage;
