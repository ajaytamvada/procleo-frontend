import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Tax } from '../../hooks/useTaxAPI';

interface TaxListProps {
  taxes: Tax[];
  onEdit: (tax: Tax) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  isLoading?: boolean;
}

const TaxList: React.FC<TaxListProps> = ({
  taxes,
  onEdit,
  onCreate,
  onDelete,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getTotalTax = (tax: Tax): number => {
    const primary = tax.primaryTaxPercentage || 0;
    const secondary = tax.secondaryTaxPercentage || 0;
    return primary + secondary;
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Tax Master</h2>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>New</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                S.No
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Primary Tax
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secondary Tax
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tax Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total %
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {taxes.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No taxes found. Click "New" to create one.
                </td>
              </tr>
            ) : (
              taxes.map((tax, index) => (
                <tr
                  key={tax.id}
                  onClick={() => onEdit(tax)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tax.primaryTaxName}</div>
                    {tax.primaryTaxPercentage && (
                      <div className="text-xs text-gray-500">{tax.primaryTaxPercentage}%</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {tax.secondaryTaxName ? (
                      <>
                        <div className="text-sm text-gray-700">{tax.secondaryTaxName}</div>
                        {tax.secondaryTaxPercentage && (
                          <div className="text-xs text-gray-500">{tax.secondaryTaxPercentage}%</div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{tax.taxCode || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-blue-600">{getTotalTax(tax)}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(tax);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          tax.id &&
                          window.confirm(
                            `Are you sure you want to delete "${tax.primaryTaxName}"?`
                          )
                        ) {
                          onDelete(tax.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaxList;
