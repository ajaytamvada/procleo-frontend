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
    <div className='min-h-screen bg-[#f8f9fc]'>
      <div className='p-2'>
        {/* Page Header - Cashfree Style */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-xl font-semibold text-gray-900'>
              User Permission Management
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Assign module permissions to user types
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Plus size={14} />
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
    </div>
  );
};

export default UserPermissionPage;
