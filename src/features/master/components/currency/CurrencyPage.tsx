import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import CurrencyForm from './CurrencyForm';
import CurrencyList from './CurrencyList';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import { useCurrencies } from '../../hooks/useCurrencyAPI';
import type { Currency, MasterEntityFilters } from '../../types';
import { apiClient } from '@/lib/api';

const CurrencyPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<
    Currency | undefined
  >(undefined);
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<MasterEntityFilters>({});
  const queryClient = useQueryClient();

  // Fetch currencies with pagination
  const { data, isLoading, error, refetch } = useCurrencies(page, 15, filters);
  const currencies = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<Currency>) => {
      if (selectedCurrency?.id) {
        const response = await apiClient.put<Currency>(
          `/master/currencies/${selectedCurrency.id}`,
          data
        );
        return response.data;
      } else {
        const response = await apiClient.post<Currency>(
          '/master/currencies',
          data
        );
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      refetch();
      setShowForm(false);
      setSelectedCurrency(undefined);
      alert(
        selectedCurrency?.id
          ? 'Currency updated successfully!'
          : 'Currency created successfully!'
      );
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to save currency';
      alert(message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/master/currencies/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      refetch();
      alert('Currency deleted successfully!');
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || 'Failed to delete currency';
      alert(message);
    },
  });

  const handleCreate = () => {
    setSelectedCurrency(undefined);
    setShowForm(true);
  };

  const handleEdit = (currency: Currency) => {
    setSelectedCurrency(currency);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (data: Partial<Currency>) => {
    saveMutation.mutate(data);
  };

  const handleCancel = () => {
    setShowForm(false);
    setSelectedCurrency(undefined);
  };

  if (showForm) {
    return (
      <div className='container mx-auto p-6'>
        <CurrencyForm
          currency={selectedCurrency}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={saveMutation.isPending}
          mode={selectedCurrency ? 'edit' : 'create'}
        />
      </div>
    );
  }

  return (
    <div className='container mx-auto p-6'>
      <CurrencyList
        currencies={currencies}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        onImport={() => setShowImportDialog(true)}
        currentPage={page}
        totalPages={totalPages}
        totalElements={totalElements}
        onPageChange={setPage}
        onFiltersChange={setFilters}
      />
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        entityName='Currency'
        importEndpoint='/master/currencies/import'
        templateEndpoint='/master/currencies/template'
        onImportSuccess={() => setPage(0)}
      />
    </div>
  );
};

export default CurrencyPage;
