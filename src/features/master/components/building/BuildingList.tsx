import React from 'react';
import { Plus, Trash2, Upload, Building2 } from 'lucide-react';
import type { Building } from '../../hooks/useBuildingAPI';

interface BuildingListProps {
  buildings: Building[];
  onEdit: (building: Building) => void;
  onCreate: () => void;
  onDelete: (id: number) => void;
  onImport: () => void;
  isLoading?: boolean;
}

const BuildingList: React.FC<BuildingListProps> = ({
  buildings,
  onEdit,
  onCreate,
  onDelete,
  onImport,
  isLoading = false,
}) => {
  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      {/* Page Header */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Building</h1>
          <p className='text-sm text-gray-500 mt-0.5'>
            Manage building master records
          </p>
        </div>
        <div className='flex items-center gap-3'>
          <button
            onClick={onImport}
            className='inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-md hover:bg-violet-100 transition-colors'
          >
            <Upload size={15} />
            Import
          </button>
          <button
            onClick={onCreate}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Plus size={15} />
            New Building
          </button>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          {isLoading ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-violet-600 border-t-transparent'></div>
              <p className='text-sm text-gray-500 mt-3'>Loading buildings...</p>
            </div>
          ) : buildings.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16'>
              <div className='w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3'>
                <Building2 className='w-6 h-6 text-gray-400' />
              </div>
              <p className='text-gray-600 font-medium'>No buildings found</p>
              <p className='text-gray-400 text-sm mt-1'>
                Click "New Building" to create one
              </p>
            </div>
          ) : (
            <table className='w-full'>
              <thead>
                <tr className='bg-[#fafbfc]'>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-16'>
                    S.No
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Building Name
                  </th>
                  <th className='px-4 py-3.5 text-left text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap'>
                    Building Code
                  </th>
                  <th className='px-4 py-3.5 text-center text-xs font-semibold text-gray-600 tracking-wide whitespace-nowrap w-24'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {buildings.map((building, index) => (
                  <tr
                    key={building.id}
                    onClick={() => onEdit(building)}
                    className='hover:bg-gray-50 cursor-pointer transition-colors'
                  >
                    <td className='px-4 py-3.5 text-center text-sm text-gray-600'>
                      {index + 1}
                    </td>
                    <td className='px-4 py-3.5'>
                      <span className='text-sm font-medium text-violet-600'>
                        {building.name}
                      </span>
                    </td>
                    <td className='px-4 py-3.5 text-sm text-gray-700'>
                      {building.code}
                    </td>
                    <td className='px-4 py-3.5 text-center'>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          if (
                            building.id &&
                            window.confirm(
                              `Are you sure you want to delete "${building.name}"?`
                            )
                          ) {
                            onDelete(building.id);
                          }
                        }}
                        className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        title='Delete'
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

export default BuildingList;
