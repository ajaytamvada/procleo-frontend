import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import SubCategoryList from './SubCategoryList';
import SubCategoryForm from './SubCategoryForm';
import {
  useSubCategoriesPaged,
  useCreateSubCategory,
  useUpdateSubCategory,
  useDeleteSubCategory,
  type SubCategory,
  type SubCategoryFilters,
} from '../../hooks/useSubCategoryAPI';

const SubCategoryPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<SubCategoryFilters>({});

  const { data, isLoading, error } = useSubCategoriesPaged(page, 15, filters);
  const subCategories = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateSubCategory();
  const updateMutation = useUpdateSubCategory();
  const deleteMutation = useDeleteSubCategory();

  const handleCreate = () => {
    setSelectedSubCategory(undefined);
    setShowForm(true);
  };

  const handleEdit = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedSubCategory(undefined);
  };

  const handleSubmit = async (data: Omit<SubCategory, 'id' | 'categoryName'>) => {
    try {
      if (selectedSubCategory?.id) {
        await updateMutation.mutateAsync({
          id: selectedSubCategory.id,
          data,
        });
        toast.success('Sub-category updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Sub-category created successfully');
      }
      setShowForm(false);
      setSelectedSubCategory(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the sub-category';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Sub-category deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the sub-category';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading sub-categories: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <SubCategoryForm
        subCategory={selectedSubCategory}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <SubCategoryList
      subCategories={subCategories}
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

export default SubCategoryPage;
