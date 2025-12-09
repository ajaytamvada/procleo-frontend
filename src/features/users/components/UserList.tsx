import React from 'react';
import {
  Plus,
  Search,
  User,
  Mail,
  Shield,
  Edit,
  Trash2,
  Eye,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as UserType, UserRole } from '@/types/user';
import { ROLE_PERMISSIONS } from '@/types/user';

interface UserListProps {
  users: UserType[];
  onEditUser: (userId: number) => void;
  onDeleteUser: (userId: number) => void;
  onViewUser: (userId: number) => void;
  isLoading?: boolean;
}

const UserList: React.FC<UserListProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onViewUser,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<UserRole | ''>('');
  const [statusFilter, setStatusFilter] = React.useState<string>('');

  const filteredUsers = React.useMemo(() => {
    if (!users || !Array.isArray(users)) {
      return [];
    }

    return users.filter(user => {
      if (!user) return false;

      const matchesSearch =
        searchQuery === '' ||
        (user.firstName &&
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.lastName &&
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.email &&
          user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.username &&
          user.username.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesRole = roleFilter === '' || user.role === roleFilter;
      const matchesStatus = statusFilter === '' || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_USER':
        return 'badge-danger';
      case 'MANAGER':
        return 'badge-primary';
      case 'HEAD':
        return 'badge-warning';
      case 'BUYER':
        return 'badge-success';
      case 'VENDOR':
        return 'badge-secondary';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'badge-success';
      case 'INACTIVE':
        return 'badge-secondary';
      case 'SUSPENDED':
        return 'badge-danger';
      case 'PENDING_VERIFICATION':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  };

  const formatRoleDisplay = (role: UserRole) => {
    return role
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatStatusDisplay = (status: string) => {
    return status
      .replace('_', ' ')
      .toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className='page-container'>
        <div className='flex-center py-8'>
          <div className='spinner w-6 h-6 text-blue-600'></div>
          <p className='ml-2 text-gray-500'>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='page-container space-y-3'>
      {/* Header */}
      <div className='flex-between'>
        <div className='page-header'>
          <h1 className='page-title'>User Management</h1>
          <p className='page-subtitle'>Manage user accounts and permissions</p>
        </div>
        <button
          onClick={() => navigate('/users/create')}
          className='btn btn-primary'
        >
          <Plus className='w-4 h-4 mr-2' />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className='filter-section'>
        <div className='filter-grid'>
          <div className='relative'>
            <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search users...'
              className='input pl-8'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className='input'
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value as UserRole | '')}
          >
            <option value=''>All Roles</option>
            {Object.keys(ROLE_PERMISSIONS).map(role => (
              <option key={role} value={role}>
                {formatRoleDisplay(role as UserRole)}
              </option>
            ))}
          </select>

          <select
            className='input'
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value=''>All Statuses</option>
            <option value='ACTIVE'>Active</option>
            <option value='INACTIVE'>Inactive</option>
            <option value='SUSPENDED'>Suspended</option>
            <option value='PENDING_VERIFICATION'>Pending Verification</option>
          </select>

          <div className='flex items-center text-sm text-gray-500'>
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='table-container'>
        {filteredUsers.length === 0 ? (
          <div className='flex-center py-8'>
            <User className='w-12 h-12 text-gray-400 mb-4' />
            <p className='text-gray-500'>
              No users found matching your criteria
            </p>
          </div>
        ) : (
          <table className='table'>
            <thead className='table-header'>
              <tr>
                <th className='table-header-cell'>User</th>
                <th className='table-header-cell'>Role</th>
                <th className='table-header-cell'>Department</th>
                <th className='table-header-cell'>Status</th>
                <th className='table-header-cell'>Last Login</th>
                <th className='table-header-cell'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className='table-row'>
                  <td className='table-cell'>
                    <div className='flex items-center'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 flex-center mr-3'>
                        {user.profilePicture ? (
                          <img
                            className='w-8 h-8 rounded-full object-cover'
                            src={user.profilePicture}
                            alt={`${user.firstName} ${user.lastName}`}
                          />
                        ) : (
                          <User className='w-4 h-4 text-gray-600' />
                        )}
                      </div>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.firstName} {user.lastName}
                        </div>
                        <div className='text-xs text-gray-500 flex items-center'>
                          <Mail className='w-3 h-3 mr-1' />
                          {user.email}
                        </div>
                        <div className='text-xs text-gray-400'>
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='table-cell'>
                    <div
                      className={`badge ${getRoleColor(user.role)} flex items-center`}
                    >
                      <Shield className='w-3 h-3 mr-1' />
                      {formatRoleDisplay(user.role)}
                    </div>
                  </td>
                  <td className='table-cell text-sm text-gray-900'>
                    {user.departmentName || 'Not assigned'}
                  </td>
                  <td className='table-cell'>
                    <div className={`badge ${getStatusColor(user.status)}`}>
                      {formatStatusDisplay(user.status)}
                    </div>
                  </td>
                  <td className='table-cell text-sm text-gray-500'>
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className='table-cell'>
                    <div className='flex items-center space-x-1'>
                      <button
                        onClick={() => onViewUser(user.id)}
                        className='btn btn-ghost btn-sm'
                        title='View user'
                      >
                        <Eye className='w-3 h-3' />
                      </button>
                      <button
                        onClick={() => onEditUser(user.id)}
                        className='btn btn-ghost btn-sm'
                        title='Edit user'
                      >
                        <Edit className='w-3 h-3' />
                      </button>
                      <button
                        onClick={() => onDeleteUser(user.id)}
                        className='btn btn-ghost btn-sm text-red-600 hover:text-red-900 hover:bg-red-100'
                        title='Delete user'
                      >
                        <Trash2 className='w-3 h-3' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default UserList;
