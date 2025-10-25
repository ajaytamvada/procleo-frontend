import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import StateList from './StateList';
import StateForm from './StateForm';
import {
  useStatesPaged,
  useCreateState,
  useUpdateState,
  useDeleteState,
  type State,
  type StateFilters,
} from '../../hooks/useStateAPI';

const StatePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedState, setSelectedState] = useState<State | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<StateFilters>({});

  const { data, isLoading, error } = useStatesPaged(page, 15, filters);
  const states = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateState();
  const updateMutation = useUpdateState();
  const deleteMutation = useDeleteState();

  const handleCreate = () => {
    setSelectedState(undefined);
    setShowForm(true);
  };

  const handleEdit = (state: State) => {
    setSelectedState(state);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedState(undefined);
  };

  const handleSubmit = async (data: Omit<State, 'id'>) => {
    try {
      if (selectedState?.id) {
        await updateMutation.mutateAsync({
          id: selectedState.id,
          data,
        });
        toast.success('State updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('State created successfully');
      }
      setShowForm(false);
      setSelectedState(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the state';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('State deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the state';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading states: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <StateForm
        state={selectedState}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <StateList
      states={states}
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

export default StatePage;
