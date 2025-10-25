import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import CityList from './CityList';
import CityForm from './CityForm';
import {
  useCitiesPaged,
  useCreateCity,
  useUpdateCity,
  useDeleteCity,
  type City,
  type CityFilters,
} from '../../hooks/useCityAPI';

const CityPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CityFilters>({});

  const { data, isLoading, error } = useCitiesPaged(page, 15, filters);
  const cities = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;
  const createMutation = useCreateCity();
  const updateMutation = useUpdateCity();
  const deleteMutation = useDeleteCity();

  const handleCreate = () => {
    setSelectedCity(undefined);
    setShowForm(true);
  };

  const handleEdit = (city: City) => {
    setSelectedCity(city);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCity(undefined);
  };

  const handleSubmit = async (data: Omit<City, 'id'>) => {
    try {
      if (selectedCity?.id) {
        await updateMutation.mutateAsync({
          id: selectedCity.id,
          data,
        });
        toast.success('City updated successfully');
      } else {
        await createMutation.mutateAsync(data);
        toast.success('City created successfully');
      }
      setShowForm(false);
      setSelectedCity(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the city';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('City deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the city';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading cities: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CityForm
        city={selectedCity}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <CityList
      cities={cities}
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

export default CityPage;
