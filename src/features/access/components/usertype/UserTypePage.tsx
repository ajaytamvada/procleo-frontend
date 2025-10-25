import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { UserType } from '../../hooks/useUserTypeAPI';
import UserTypeList from './UserTypeList';
import UserTypeForm from './UserTypeForm';

const UserTypePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);

  const handleAdd = () => {
    setSelectedUserType(null);
    setShowForm(true);
  };

  const handleEdit = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUserType(null);
  };

  const handleSuccess = () => {
    // Refresh happens automatically via React Query invalidation
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Type Management</h1>
          <p className="text-gray-600 mt-1">Manage user types for access control</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add User Type
        </button>
      </div>

      {/* User Type List */}
      <UserTypeList onEdit={handleEdit} />

      {/* Form Modal */}
      {showForm && (
        <UserTypeForm
          userType={selectedUserType}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default UserTypePage;
