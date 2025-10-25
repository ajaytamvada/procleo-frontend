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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Login Provision</h1>
          <p className="text-gray-600 mt-1">Manage user login accounts</p>
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
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
  );
};

export default LoginProvisionPage;
