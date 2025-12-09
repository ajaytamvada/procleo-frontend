import React from 'react';
import { Plus, Search, User, Mail, Shield } from 'lucide-react';

const Users: React.FC = () => {
  const users = [
    {
      id: 'USR-001',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Administrator',
      department: 'IT',
      status: 'active',
      lastLogin: '2024-01-15 09:30',
    },
    {
      id: 'USR-002',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'Procurement Manager',
      department: 'Procurement',
      status: 'active',
      lastLogin: '2024-01-15 08:45',
    },
    {
      id: 'USR-003',
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com',
      role: 'Finance Approver',
      department: 'Finance',
      status: 'active',
      lastLogin: '2024-01-14 16:20',
    },
    {
      id: 'USR-004',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@company.com',
      role: 'Requestor',
      department: 'Marketing',
      status: 'inactive',
      lastLogin: '2024-01-10 14:15',
    },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-red-100 text-red-800';
      case 'Procurement Manager':
        return 'bg-blue-100 text-blue-800';
      case 'Finance Approver':
        return 'bg-green-100 text-green-800';
      case 'Requestor':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>User Management</h1>
          <p className='text-gray-600'>Manage user accounts and permissions</p>
        </div>
        <button className='btn btn-primary btn-md'>
          <Plus className='w-4 h-4 mr-2' />
          Add User
        </button>
      </div>

      {/* Search */}
      <div className='bg-white rounded-lg border border-gray-200 p-6'>
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
          <input
            type='text'
            placeholder='Search users...'
            className='input pl-10'
          />
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-lg border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  User
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Role
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Department
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Last Login
                </th>
                <th className='relative px-6 py-3'>
                  <span className='sr-only'>Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map(user => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='flex-shrink-0 h-10 w-10'>
                        <div className='h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center'>
                          <User className='w-5 h-5 text-gray-600' />
                        </div>
                      </div>
                      <div className='ml-4'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.name}
                        </div>
                        <div className='text-sm text-gray-500 flex items-center'>
                          <Mail className='w-3 h-3 mr-1' />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}
                    >
                      <Shield className='w-3 h-3 mr-1' />
                      {user.role}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                    {user.department}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {user.lastLogin}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                    <button className='text-blue-600 hover:text-blue-900 mr-3'>
                      Edit
                    </button>
                    <button className='text-red-600 hover:text-red-900'>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
