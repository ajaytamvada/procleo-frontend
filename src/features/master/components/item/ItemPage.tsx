import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ItemList from './ItemList';
import ItemForm from './ItemForm';
import {
  useItemsPaged,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
  type Item,
  type ItemFilters,
} from '../../hooks/useItemAPI';

const ItemPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<ItemFilters>({});

  const { data, isLoading, error } = useItemsPaged(page, 15, filters);
  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateItem();
  const updateMutation = useUpdateItem();
  const deleteMutation = useDeleteItem();

  const handleCreate = () => {
    setSelectedItem(undefined);
    setShowForm(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedItem(undefined);
  };

  const handleSubmit = async (data: Omit<Item, 'id' | 'categoryName' | 'subCategoryName' | 'uomName' | 'displayName'>) => {
    try {
      if (selectedItem?.id) {
        await updateMutation.mutateAsync({
          id: selectedItem.id,
          data,
        });
        toast.success('Item updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Item created successfully');
      }
      setShowForm(false);
      setSelectedItem(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the item';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Item deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the item';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading items: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <ItemForm
        item={selectedItem}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <ItemList
      items={items}
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

export default ItemPage;
