import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import LocationList from './LocationList';
import LocationForm from './LocationForm';
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
  type Location,
} from '../../hooks/useLocationAPI';

const LocationPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>();

  const { data: locations = [], isLoading, error } = useLocations();
  const createMutation = useCreateLocation();
  const updateMutation = useUpdateLocation();
  const deleteMutation = useDeleteLocation();

  const handleCreate = () => {
    setSelectedLocation(undefined);
    setShowForm(true);
  };

  const handleEdit = (location: Location) => {
    setSelectedLocation(location);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedLocation(undefined);
  };

  const handleSubmit = async (data: Omit<Location, 'id'>) => {
    try {
      if (selectedLocation?.id) {
        // Update existing location
        await updateMutation.mutateAsync({
          id: selectedLocation.id,
          data,
        });
        toast.success('Location updated successfully');
      } else {
        // Create new location
        await createMutation.mutateAsync(data);
        toast.success('Location created successfully');
      }
      setShowForm(false);
      setSelectedLocation(undefined);
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
      <LocationForm
        location={selectedLocation}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <LocationList
      locations={locations}
      onEdit={handleEdit}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
};

export default LocationPage;
