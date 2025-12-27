import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { UserType } from '../../hooks/useUserTypeAPI';
import UserTypeList from './UserTypeList';
import UserTypeForm from './UserTypeForm';
import ExcelImportDialog from '@/components/ExcelImportDialog';

const UserTypePage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(
    null
  );

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
    <>
      <div className='min-h-screen bg-[#f8f9fc]'>
        <div className='p-2'>
          {/* Page Header - Cashfree Style */}
          <div className='flex items-center justify-between mb-6'>
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                User Type Management
              </h1>
              <p className='text-sm text-gray-500 mt-0.5'>
                Manage user types for access control
              </p>
            </div>
            <button
              onClick={handleAdd}
              className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
            >
              <Plus size={14} />
              Add User Type
            </button>
          </div>

          {/* User Type List */}
          <UserTypeList
            onEdit={handleEdit}
            onImport={() => setShowImportDialog(true)}
          />

          {/* Form Modal */}
          {showForm && (
            <UserTypeForm
              userType={selectedUserType}
              onClose={handleCloseForm}
              onSuccess={handleSuccess}
            />
          )}
        </div>
      </div>
      <ExcelImportDialog
        isOpen={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        entityName='User Type'
        importEndpoint='/master/user-types/import'
        templateEndpoint='/master/user-types/template'
        onImportSuccess={() => {}}
      />
    </>
  );
};

export default UserTypePage;
