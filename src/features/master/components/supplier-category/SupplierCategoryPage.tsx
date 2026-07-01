import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import SupplierCategoryList from './SupplierCategoryList';
import SupplierCategoryForm from './SupplierCategoryForm';
import {
  useSupplierCategoriesPaged,
  useCreateSupplierCategory,
  useUpdateSupplierCategory,
  useDeleteSupplierCategory,
  type SupplierCategory,
  type SupplierCategoryFilters,
} from '../../hooks/useSupplierCategoryAPI';

const SupplierCategoryPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    SupplierCategory | undefined
  >();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<SupplierCategoryFilters>({});

  const { data, isLoading, error } = useSupplierCategoriesPaged(
    page,
    15,
    filters
  );
  const categories = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateSupplierCategory();
  const updateMutation = useUpdateSupplierCategory();
  const deleteMutation = useDeleteSupplierCategory();

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setShowForm(true);
  };

  const handleEdit = (category: SupplierCategory) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCategory(undefined);
  };

  const handleSubmit = async (formData: Omit<SupplierCategory, 'id'>) => {
    try {
      if (selectedCategory?.id) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          data: formData,
        });
        toast.success('Supplier group updated successfully');
      } else {
        await createMutation.mutateAsync(formData);
        toast.success('Supplier group created successfully');
      }
      setShowForm(false);
      setSelectedCategory(undefined);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          'An error occurred while saving the supplier group'
      );
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Supplier group deleted successfully');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          'An error occurred while deleting the supplier group'
      );
    }
  };

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          Error loading supplier groups: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <SupplierCategoryForm
        category={selectedCategory}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <SupplierCategoryList
      categories={categories}
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

export default SupplierCategoryPage;
