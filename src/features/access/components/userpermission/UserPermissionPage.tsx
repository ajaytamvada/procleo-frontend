import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { UserType } from '../../hooks/useUserTypeAPI';
import UserPermissionList from './UserPermissionList';
import UserPermissionForm from './UserPermissionForm';
import UserTypeForm from '../usertype/UserTypeForm';

const UserPermissionPage: React.FC = () => {
  const [showPermissionForm, setShowPermissionForm] = useState(false);
  const [showNewUserTypeForm, setShowNewUserTypeForm] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    null
  );

  const handleEditPermissions = (userType: UserType) => {
    setSelectedUserType(userType);
    setShowPermissionForm(true);
  };

  const handleClosePermissionForm = () => {
    setShowPermissionForm(false);
    setSelectedUserType(null);
  };

  const handleAddNew = () => {
    setShowNewUserTypeForm(true);
  };

  const handleCloseNewForm = () => {
    setShowNewUserTypeForm(false);
  };

  const handleSuccess = () => {
    // Refresh happens automatically via React Query invalidation
  };

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='mb-6 flex justify-between items-center'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>
            User Permission Management
          </h1>
          <p className='text-gray-600 mt-1'>
            Assign module permissions to user types
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className='px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
        >
          <Plus size={20} />
          Add User Type
        </button>
      </div>

      {/* User Permission List */}
      <UserPermissionList onEditPermissions={handleEditPermissions} />

      {/* Permission Form Modal */}
      {showPermissionForm && selectedUserType && (
        <UserPermissionForm
          userType={selectedUserType}
          onClose={handleClosePermissionForm}
          onSuccess={handleSuccess}
        />
      )}

      {/* New User Type Form Modal */}
      {showNewUserTypeForm && (
        <UserTypeForm
          userType={null}
          onClose={handleCloseNewForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default UserPermissionPage;
