import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import AssignmentGroupList from './AssignmentGroupList';
import AssignmentGroupForm from './AssignmentGroupForm';
import type { AssignmentGroup } from '../../hooks/useAssignmentGroupAPI';

const AssignmentGroupPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<AssignmentGroup | null>(
    null
  );

  const handleAdd = () => {
    setSelectedGroup(null);
    setShowForm(true);
  };

  const handleEdit = (group: AssignmentGroup) => {
    setSelectedGroup(group);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedGroup(null);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedGroup(null);
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            Assignment Groups
          </h1>
          <p className='text-sm text-gray-600 mt-1'>
            Manage approval and assignment groups
          </p>
        </div>
        <button
          onClick={handleAdd}
          className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm'
        >
          <Plus size={20} />
          <span>Add Group</span>
        </button>
      </div>

      {/* Group List */}
      <AssignmentGroupList onEdit={handleEdit} />

      {/* Group Form Modal */}
      {showForm && (
        <AssignmentGroupForm
          group={selectedGroup}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default AssignmentGroupPage;
