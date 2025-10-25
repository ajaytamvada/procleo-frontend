import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import BuildingList from './BuildingList';
import BuildingForm from './BuildingForm';
import {
  useBuildings,
  useCreateBuilding,
  useUpdateBuilding,
  useDeleteBuilding,
  type Building,
} from '../../hooks/useBuildingAPI';

const BuildingPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | undefined>();

  const { data: buildings = [], isLoading, error } = useBuildings();
  const createMutation = useCreateBuilding();
  const updateMutation = useUpdateBuilding();
  const deleteMutation = useDeleteBuilding();

  const handleCreate = () => {
    setSelectedBuilding(undefined);
    setShowForm(true);
  };

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedBuilding(undefined);
  };

  const handleSubmit = async (data: Omit<Building, 'id'>) => {
    try {
      if (selectedBuilding?.id) {
        // Update existing building
        await updateMutation.mutateAsync({
          id: selectedBuilding.id,
          data,
        });
        toast.success('Building updated successfully');
      } else {
        // Create new building
        await createMutation.mutateAsync(data);
        toast.success('Building created successfully');
      }
      setShowForm(false);
      setSelectedBuilding(undefined);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while saving the building';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Building deleted successfully');
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'An error occurred while deleting the building';
      toast.error(errorMessage);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading buildings: {(error as Error).message}
        </div>
      </div>
    );
  }

  if (showForm) {
    return (
      <BuildingForm
        building={selectedBuilding}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    );
  }

  return (
    <BuildingList
      buildings={buildings}
      onEdit={handleEdit}
      onCreate={handleCreate}
      onDelete={handleDelete}
      isLoading={isLoading}
    />
  );
};

export default BuildingPage;
