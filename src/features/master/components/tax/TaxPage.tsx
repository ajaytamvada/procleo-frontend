import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import TaxList from './TaxList';
import TaxForm from './TaxForm';
import {
  useTaxes,
  useCreateTax,
  useUpdateTax,
  useDeleteTax,
  type Tax,
} from '../../hooks/useTaxAPI';

const TaxPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTax, setSelectedTax] = useState<Tax | undefined>();

  const { data: taxes = [], isLoading, error } = useTaxes();
  const createMutation = useCreateTax();
  const updateMutation = useUpdateTax();
  const deleteMutation = useDeleteTax();

  const handleCreate = () => {
    setSelectedTax(undefined);
    setShowForm(true);
  };

  const handleEdit = (tax: Tax) => {
    setSelectedTax(tax);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedTax(undefined);
  };

  const handleSubmit = async (data: Omit<Tax, 'id'>) => {
    try {
      if (selectedTax?.id) {
        // Update existing tax
        await updateMutation.mutateAsync({
          id: selectedTax.id,
          data,
        });
        toast.success('Tax updated successfully');
      } else {
        // Create new tax
        await createMutation.mutateAsync(data);
        toast.success('Tax created successfully');
      }
      setShowForm(false);
      setSelectedTax(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the tax';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Tax deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the tax';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading taxes: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <TaxForm
        tax={selectedTax}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <TaxList
      taxes={taxes}
      onEdit={handleEdit}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
};

export default TaxPage;
