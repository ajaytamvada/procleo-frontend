import React, { useState } from 'react';
import BudgetForm from './BudgetForm';
import BudgetList from './BudgetList';
import {
  useBudgets,
  useCreateBudget,
  useUpdateBudget,
  useDeleteBudget,
} from '../../hooks/useBudgetAPI';
import type { Budget } from '../../types';

const BudgetPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | undefined>(undefined);
  const [page, setPage] = useState(0);
  const [financialYearFilter, setFinancialYearFilter] = useState<number | undefined>(undefined);

  // Fetch budgets with pagination
  const { data, isLoading, error, refetch } = useBudgets(page, 20, financialYearFilter);
  const budgets = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Mutations
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();

  const handleCreate = () => {
    setSelectedBudget(undefined);
    setShowForm(true);
  };

  const handleEdit = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleSubmit = (data: Partial<Budget>) => {
    if (selectedBudget?.id) {
      updateMutation.mutate(
        { id: selectedBudget.id, budget: data },
        {
          onSuccess: () => {
            refetch();
            setShowForm(false);
            setSelectedBudget(undefined);
          },
        }
      );
    } else {
      createMutation.mutate(data as Omit<Budget, 'id'>, {
        onSuccess: () => {
          refetch();
          setShowForm(false);
          setSelectedBudget(undefined);
        },
      });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedBudget(undefined);
  };

  const handleFilterChange = (financialYearId?: number) => {
    setFinancialYearFilter(financialYearId);
    setPage(0); // Reset to first page when filter changes
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6">
        <BudgetForm
          budget={selectedBudget}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={createMutation.isPending || updateMutation.isPending}
          mode={selectedBudget ? 'edit' : 'create'}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <BudgetList
        budgets={budgets}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default BudgetPage;
