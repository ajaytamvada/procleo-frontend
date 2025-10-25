import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import DepartmentForm from './DepartmentForm';
import DepartmentList from './DepartmentList';
import { useDepartments } from '../../hooks/useDepartmentAPI';
import type { Department, MasterEntityFilters } from '../../types';
import { apiClient } from '@/lib/api';

const DepartmentPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<MasterEntityFilters>({});
  const queryClient = useQueryClient();

  // Fetch departments with pagination
  const { data, isLoading, error, refetch } = useDepartments(page, 15, filters);
  const departments = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Department>) => {
      if (selectedDepartment?.id) {
        const response = await apiClient.put<Department>(
          `/master/departments/${selectedDepartment.id}`,
          data
        );
        return response.data;
      } else {
        const response = await apiClient.post<Department>('/master/departments', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      refetch();
      setShowForm(false);
      setSelectedDepartment(undefined);
      alert(selectedDepartment?.id ? 'Department updated successfully!' : 'Department created successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to save department';
      alert(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/master/departments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      refetch();
      alert('Department deleted successfully!');
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to delete department';
      alert(message);
    },
  });

  const handleCreate = () => {
    setSelectedDepartment(undefined);
    setShowForm(true);
  };

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this department?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: Partial<Department>) => {
    saveMutation.mutate(data);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedDepartment(undefined);
  };

  if (showForm) {
    return (
      <DepartmentForm
        department={selectedDepartment}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={saveMutation.isPending}
        mode={selectedDepartment ? 'edit' : 'create'}
      />
    );
  }

  return (
    <DepartmentList
      departments={departments}
      isLoading={isLoading}
      error={error}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreate={handleCreate}
      currentPage={page}
      totalPages={totalPages}
      totalElements={totalElements}
      onPageChange={setPage}
      onFiltersChange={setFilters}
    />
  );
};

export default DepartmentPage;