import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { AssignmentGroup } from '../../hooks/useAssignmentGroupAPI';
import {
  useCreateAssignmentGroup,
  useUpdateAssignmentGroup,
} from '../../hooks/useAssignmentGroupAPI';
import { useWorkingEmployees } from '../../hooks/useEmployeeAPI';

interface AssignmentGroupFormProps {
  group?: AssignmentGroup | null;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignmentGroupForm: React.FC<AssignmentGroupFormProps> = ({
  group,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);

  const createMutation = useCreateAssignmentGroup();
  const updateMutation = useUpdateAssignmentGroup();

  const { data: employees = [], isLoading: loadingEmployees } =
    useWorkingEmployees();

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setEmail(group.email || '');
      setSelectedEmployees(group.memberIds || []);
    }
  }, [group]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Group name is required');
      return;
    }

    const groupData: AssignmentGroup = {
      name: name.trim(),
      email: email.trim() || undefined,
      memberIds: selectedEmployees,
    };

    try {
      if (group?.id) {
        await updateMutation.mutateAsync({ id: group.id, group: groupData });
        alert('Assignment group updated successfully!');
      } else {
        await createMutation.mutateAsync(groupData);
        alert('Assignment group created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || error.message || 'An error occurred';
      alert(errorMessage);
    }
  };

  const handleEmployeeToggle = (employeeId: number) => {
    setSelectedEmployees(prev =>
      prev.includes(employeeId)
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const isLoading =
    createMutation.isPending || updateMutation.isPending || loadingEmployees;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center'>
          <h2 className='text-xl font-semibold text-gray-800'>
            {group ? 'Edit Assignment Group' : 'Add New Assignment Group'}
          </h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600 transition-colors'
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='p-6'>
          <div className='space-y-6'>
            {/* Group Name */}
            <div>
              <label
                htmlFor='name'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Group Name <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                id='name'
                value={name}
                onChange={e => setName(e.target.value.toUpperCase())}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                required
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            {/* Group Email */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Group Email
              </label>
              <input
                type='email'
                id='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={100}
                disabled={isLoading}
              />
            </div>

            {/* Group Members */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Group Members ({selectedEmployees.length} selected)
              </label>
              <div className='border border-gray-300 rounded-lg max-h-64 overflow-y-auto'>
                {loadingEmployees ? (
                  <div className='p-4 text-center text-gray-500'>
                    Loading employees...
                  </div>
                ) : employees.length === 0 ? (
                  <div className='p-4 text-center text-gray-500'>
                    No employees available
                  </div>
                ) : (
                  <div className='divide-y divide-gray-200'>
                    {employees.map(employee => (
                      <label
                        key={employee.id}
                        className='flex items-center p-3 hover:bg-gray-50 cursor-pointer'
                      >
                        <input
                          type='checkbox'
                          checked={selectedEmployees.includes(employee.id!)}
                          onChange={() => handleEmployeeToggle(employee.id!)}
                          className='h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded'
                          disabled={isLoading}
                        />
                        <span className='ml-3 text-sm text-gray-900'>
                          {employee.name} - {employee.code}
                        </span>
                        {employee.email && (
                          <span className='ml-2 text-xs text-gray-500'>
                            ({employee.email})
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-end gap-3'>
            <button
              type='button'
              onClick={onClose}
              className='px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed'
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : group ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentGroupForm;
