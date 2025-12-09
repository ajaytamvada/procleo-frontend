import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import VendorList from './VendorList';
import VendorForm from './VendorForm';
import {
  useVendorsPaged,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  type Vendor,
  type VendorFilters,
} from '../../hooks/useVendorAPI';

const VendorPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<VendorFilters>({});

  const { data, isLoading, error } = useVendorsPaged(page, 15, filters);
  const vendors = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();

  const handleCreate = () => {
    setSelectedVendor(undefined);
    setShowForm(true);
  };

  const handleEdit = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedVendor(undefined);
  };

  const handleSubmit = async (data: Omit<Vendor, 'id'>) => {
    try {
      if (selectedVendor?.id) {
        await updateMutation.mutateAsync({
          id: selectedVendor.id,
          data,
        });
        toast.success('Supplier updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('Supplier created successfully');
      }
      setShowForm(false);
      setSelectedVendor(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the supplier';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Supplier deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the supplier';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded'>
          Error loading suppliers: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <VendorForm
        vendor={selectedVendor}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <VendorList
      vendors={vendors}
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

export default VendorPage;
