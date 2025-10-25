import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import CategoryList from './CategoryList';
import CategoryForm from './CategoryForm';
import {
  useCategoriesPaged,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  type Category,
  type CategoryFilters,
} from '../../hooks/useCategoryAPI';

const CategoryPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CategoryFilters>({});

  const { data, isLoading, error } = useCategoriesPaged(page, 15, filters);
  const categories = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = () => {
    setSelectedCategory(undefined);
    setShowForm(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCategory(undefined);
  };

  const handleSubmit = async (data: Omit<Category, 'id'>) => {
    try {
      if (selectedCategory?.id) {
        await updateMutation.mutateAsync({
          id: selectedCategory.id,
          data,
        });
        toast.success('Category updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Category created successfully');
      }
      setShowForm(false);
      setSelectedCategory(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the category';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Category deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the category';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading categories: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CategoryForm
        category={selectedCategory}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <CategoryList
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

export default CategoryPage;
