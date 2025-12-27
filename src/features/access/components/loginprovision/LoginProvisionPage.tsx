import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import type { LoginProvision } from '../../hooks/useLoginProvisionAPI';
import LoginProvisionList from './LoginProvisionList';
import LoginProvisionForm from './LoginProvisionForm';

const LoginProvisionPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<LoginProvision | null>(null);

  const handleAdd = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleEdit = (user: LoginProvision) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
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
              Login Provision
            </h1>
            <p className='text-sm text-gray-500 mt-0.5'>
              Manage user login accounts
            </p>
          </div>
          <button
            onClick={handleAdd}
            className='inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-md hover:bg-violet-700 transition-colors'
          >
            <Plus size={14} />
            Add User
          </button>
        </div>

        {/* User List */}
        <LoginProvisionList onEdit={handleEdit} />

        {/* Form Modal */}
        {showForm && (
          <LoginProvisionForm
            user={selectedUser}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default LoginProvisionPage;
