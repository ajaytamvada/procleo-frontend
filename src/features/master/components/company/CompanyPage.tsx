import React, { useState, useEffect } from 'react';
import {
  useCreateCompany,
  useUpdateCompany,
  useCompanies,
} from '../../hooks/useCompanyAPI';
import CompanyForm from './CompanyForm';
import ExcelImportDialog from '@/components/ExcelImportDialog';
import type { Company } from '../../types';

const CompanyPage: React.FC = () => {
  const [company, setCompany] = useState<Company | undefined>();
  const [showImportDialog, setShowImportDialog] = useState(false);

  const { data: companiesData, isLoading, error, refetch } = useCompanies(0, 1);
  const createCompanyMutation = useCreateCompany();
  const updateCompanyMutation = useUpdateCompany();

  useEffect(() => {
    if (companiesData?.content && companiesData.content.length > 0) {
      setCompany(companiesData.content[0]);
    }
  }, [companiesData]);

  const handleSubmit = async (data: Partial<Company>) => {
    try {
      if (company?.id) {
        // Update existing company
        const updatedCompany = await updateCompanyMutation.mutateAsync({
          id: company.id,
          company: data,
        });
        setCompany(updatedCompany);
        // Refetch to ensure we have the latest data
        refetch();
      } else {
        // Create new company
        const newCompany = await createCompanyMutation.mutateAsync(
          data as Omit<Company, 'id'>
        );
        setCompany(newCompany);
        // Refetch to get the saved data
        refetch();
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleCancel = () => {
    // Reset form by reloading the company data
    if (companiesData?.content && companiesData.content.length > 0) {
      setCompany(companiesData.content[0]);
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-gray-500'>Loading company information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6'>
        <div className='bg-red-50 border border-red-200 rounded-md p-4'>
          <div className='text-red-800'>
            Error loading company:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </div>
          <button
            onClick={() => refetch()}
            className='mt-2 px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='p-6'>
        <CompanyForm
          mode={company?.id ? 'edit' : 'create'}
          company={company}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={
            createCompanyMutation.isPending || updateCompanyMutation.isPending
          }
        />
      </div>
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        entityName='Company'
        importEndpoint='/master/companies/import'
        templateEndpoint='/master/companies/template'
        onImportSuccess={() => refetch()}
      />
    </>
  );
};

export default CompanyPage;
