import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import CountryList from './CountryList';
import CountryForm from './CountryForm';
import {
  useCountriesPaged,
  useCreateCountry,
  useUpdateCountry,
  useDeleteCountry,
  type Country,
  type CountryFilters,
} from '../../hooks/useCountryAPI';

const CountryPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CountryFilters>({});

  const { data, isLoading, error } = useCountriesPaged(page, 15, filters);
  const countries = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateCountry();
  const updateMutation = useUpdateCountry();
  const deleteMutation = useDeleteCountry();

  const handleCreate = () => {
    setSelectedCountry(undefined);
    setShowForm(true);
  };

  const handleEdit = (country: Country) => {
    setSelectedCountry(country);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCountry(undefined);
  };

  const handleSubmit = async (data: Omit<Country, 'id'>) => {
    try {
      if (selectedCountry?.id) {
        // Update existing country
        await updateMutation.mutateAsync({
          id: selectedCountry.id,
          data,
        });
        toast.success('Country updated successfully');
      } else {
        // Create new country
        await createMutation.mutateAsync(data);
        toast.success('Country created successfully');
      }
      setShowForm(false);
      setSelectedCountry(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the country';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Country deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the country';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading countries: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CountryForm
        country={selectedCountry}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <CountryList
      countries={countries}
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

export default CountryPage;
