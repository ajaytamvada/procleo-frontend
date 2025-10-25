import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
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
  const [departmentId, setDepartmentId] = useState<number | ''>(costCenter?.departmentId || '');

  const { data: departments = [], isLoading: loadingDepartments } = useDepartmentsList();

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
    <div className="bg-white rounded-lg shadow-md">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              type="button"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {costCenter ? 'Edit Cost Center' : 'New Cost Center'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {costCenter ? 'Update cost center information' : 'Create a new cost center record'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cost Center Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Cost Center Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter cost center name"
              required
            />
          </div>

          {/* Department */}
          <div>
            <label htmlFor="departmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              id="departmentId"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              disabled={loadingDepartments}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Cost Center Code */}
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
              Cost Center Code
            </label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter cost center code (optional)"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : costCenter ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CostCenterForm;
