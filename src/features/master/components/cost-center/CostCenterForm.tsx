import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Target } from 'lucide-react';
import type { CostCenter } from '../../hooks/useCostCenterAPI';
import { useDepartmentsList } from '../../hooks/useDepartmentAPI';

interface CostCenterFormProps {
  costCenter?: CostCenter;
  onSubmit: (data: Omit<CostCenter, 'id'>) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CostCenterForm: React.FC<CostCenterFormProps> = ({
  costCenter,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [name, setName] = useState(costCenter?.name || '');
  const [code, setCode] = useState(costCenter?.code || '');
  const [departmentId, setDepartmentId] = useState<number | ''>(
    costCenter?.departmentId || ''
  );
  const { data: departments = [], isLoading: loadingDepartments } =
    useDepartmentsList();

  useEffect(() => {
    if (costCenter) {
      setName(costCenter.name);
      setCode(costCenter.code || '');
      setDepartmentId(costCenter.departmentId);
    }
  }, [costCenter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !departmentId) {
      alert('Please fill in all required fields');
      return;
    }
    onSubmit({
      name: name.trim(),
      code: code.trim() || undefined,
      departmentId: Number(departmentId),
    });
  };

  return (
    <div className='min-h-screen bg-[#f8f9fc] p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onCancel}
            className='p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg border border-gray-200'
            disabled={isSubmitting}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              {costCenter ? 'Edit Cost Center' : 'New Cost Center'}
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              {costCenter
                ? 'Update cost center information'
                : 'Create a new cost center record'}
            </p>
          </div>
        </div>
        <button
          type='submit'
          form='costcenter-form'
          disabled={isSubmitting}
          className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400'
        >
          <Save size={15} />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <form id='costcenter-form' onSubmit={handleSubmit}>
          <div className='px-6 py-4 border-b border-gray-100 bg-[#fafbfc]'>
            <div className='flex items-center gap-3'>
              <div className='p-2 bg-violet-100 rounded-lg'>
                <Target size={18} className='text-violet-600' />
              </div>
              <div>
                <h2 className='text-sm font-semibold text-gray-800'>
                  Cost Center Information
                </h2>
                <p className='text-xs text-gray-500'>
                  Fill in the cost center details below
                </p>
              </div>
            </div>
          </div>

          <div className='p-6 space-y-5'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Cost Center Name <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter cost center name'
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Department <span className='text-red-500'>*</span>
                </label>
                <select
                  value={departmentId}
                  onChange={e =>
                    setDepartmentId(
                      e.target.value ? Number(e.target.value) : ''
                    )
                  }
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  required
                  disabled={loadingDepartments || isSubmitting}
                >
                  <option value=''>Select Department</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                  Cost Center Code
                </label>
                <input
                  type='text'
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  className='w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500'
                  placeholder='Enter cost center code (optional)'
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 bg-[#fafbfc] flex items-center justify-end gap-3'>
            <button
              type='button'
              onClick={onCancel}
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 disabled:bg-gray-400'
            >
              <Save size={15} />
              {isSubmitting ? 'Saving...' : costCenter ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CostCenterForm;
