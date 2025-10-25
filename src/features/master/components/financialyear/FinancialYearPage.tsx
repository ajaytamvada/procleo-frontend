import React, { useState } from 'react';
import FinancialYearForm from './FinancialYearForm';
import FinancialYearList from './FinancialYearList';
import {
  useFinancialYears,
  useCreateFinancialYear,
  useUpdateFinancialYear,
  useDeleteFinancialYear,
  useMakeCurrentYear,
} from '../../hooks/useFinancialYearAPI';
import type { FinancialYear } from '../../types';

const FinancialYearPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState<FinancialYear | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [activeYearFilter, setActiveYearFilter] = useState<number | undefined>(undefined);

  // Fetch financial years with pagination
  const { data, isLoading, error, refetch } = useFinancialYears(page, 15, activeYearFilter);
  const financialYears = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Mutations
  const createMutation = useCreateFinancialYear();
  const updateMutation = useUpdateFinancialYear();
  const deleteMutation = useDeleteFinancialYear();
  const makeCurrentMutation = useMakeCurrentYear();

  const handleCreate = () => {
    setSelectedFinancialYear(undefined);
    setShowForm(true);
  };

  const handleEdit = (financialYear: FinancialYear) => {
    setSelectedFinancialYear(financialYear);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleMakeCurrent = (id: number) => {
    makeCurrentMutation.mutate(id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleSubmit = (data: Partial<FinancialYear>) => {
    if (selectedFinancialYear?.id) {
      updateMutation.mutate(
        { id: selectedFinancialYear.id, financialYear: data },
        {
          onSuccess: () => {
            refetch();
            setShowForm(false);
            setSelectedFinancialYear(undefined);
          },
        }
      );
    } else {
      createMutation.mutate(data as Omit<FinancialYear, 'id'>, {
        onSuccess: () => {
          refetch();
          setShowForm(false);
          setSelectedFinancialYear(undefined);
        },
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedFinancialYear(undefined);
  };

  const handleFilterChange = (activeYear?: number) => {
    setActiveYearFilter(activeYear);
    setPage(0); // Reset to first page when filter changes
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <FinancialYearForm
          financialYear={selectedFinancialYear}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
          mode={selectedFinancialYear ? 'edit' : 'create'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <FinancialYearList
        financialYears={financialYears}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onMakeCurrent={handleMakeCurrent}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default FinancialYearPage;
