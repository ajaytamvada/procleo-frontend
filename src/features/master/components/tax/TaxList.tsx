import React from 'react';
import { Plus, Trash2, Upload, Receipt } from 'lucide-react';
import type { Tax } from '../../hooks/useTaxAPI';

interface TaxListProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  isLoading?: boolean;
}

const TaxList: React.FC<TaxListProps> = ({
  taxes,
  onEdit,
  onCreate,
  onDelete,
  onImport,
  isLoading = false,
}) => {
  const getTotalTax = (tax: Tax) =>
    (tax.primaryTaxPercentage || 0) + (tax.secondaryTaxPercentage || 0);

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Tax</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage tax master records
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={onImport}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-md hover:bg-violet-100'
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={onCreate}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700'
          >
            <Plus size={15} />
            New Tax
          </button>
        </div>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>Loading taxes...</p>
            </div>
          ) : taxes.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Receipt className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No taxes found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "New Tax" to create one
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Primary Tax
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Secondary Tax
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Tax Code
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600'>
                    Total %
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 w-24'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {taxes.map((tax, idx) => (
                  <tr
                    key={tax.id}
                    onClick={() => onEdit(tax)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {idx + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {tax.primaryTaxName}
                      </span>
                      {tax.primaryTaxPercentage && (
                        <span className='text-xs text-gray-500 ml-2'>
                          ({tax.primaryTaxPercentage}%)
                        </span>
                      )}
                    </td>
                    <td className='px-4 py-3.5'>
                      {tax.secondaryTaxName ? (
                        <>
                          <span className='text-sm text-gray-700'>
                            {tax.secondaryTaxName}
                          </span>
                          {tax.secondaryTaxPercentage && (
                            <span className='text-xs text-gray-500 ml-2'>
                              ({tax.secondaryTaxPercentage}%)
                            </span>
                          )}
                        </>
                      ) : (
                        <span className='text-sm text-gray-400'>-</span>
                      )}
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {tax.taxCode || '-'}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-semibold text-violet-600'>
                        {getTotalTax(tax)}%
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (
                            tax.id &&
                            window.confirm(`Delete "${tax.primaryTaxName}"?`)
                          )
                            onDelete(tax.id);
                        }}
                        className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaxList;
