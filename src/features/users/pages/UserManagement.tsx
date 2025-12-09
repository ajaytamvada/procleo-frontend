import React from 'react';
import { toast } from 'react-hot-toast';
import UserList from '../components/UserList';
import type { User, UserRole } from '@/types/user';

const UserManagement: React.FC = () => {
  const [users, setUsers] = React.useState<User[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Mock data - replace with actual API call
  React.useEffect(() => {
    const mockUsers: User[] = [
      {
        id: 1,
        version: 1,
        createdAt: '2024-01-01T10:00:00Z',
        createdBy: 'system',
        updatedAt: '2024-01-01T10:00:00Z',
        updatedBy: 'system',
        username: 'john.doe',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001',
        phoneNumber: '+1234567890',
        role: 'SUPER_USER' as UserRole,
        departmentId: 1,
        departmentName: 'Information Technology',
        companyId: 1,
        companyName: 'Autovitica Corp',
        designation: 'System Administrator',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-01-15T09:30:00Z',
        failedLoginAttempts: 0,
        passwordLastChangedAt: '2024-01-01T10:00:00Z',
        preferences: {
          theme: 'LIGHT',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: true,
            push: true,
            desktop: true,
          },
        },
      },
      {
        id: 2,
        version: 1,
        createdAt: '2024-01-02T10:00:00Z',
        createdBy: 'admin',
        updatedAt: '2024-01-02T10:00:00Z',
        updatedBy: 'admin',
        username: 'jane.smith',
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        employeeId: 'EMP002',
        phoneNumber: '+1234567891',
        role: 'MANAGER' as UserRole,
        departmentId: 2,
        departmentName: 'Procurement',
        companyId: 1,
        companyName: 'Autovitica Corp',
        designation: 'Procurement Manager',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-01-15T08:45:00Z',
        failedLoginAttempts: 0,
        passwordLastChangedAt: '2024-01-02T10:00:00Z',
        preferences: {
          theme: 'DARK',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            push: false,
            desktop: true,
          },
        },
      },
      {
        id: 3,
        version: 1,
        createdAt: '2024-01-03T10:00:00Z',
        createdBy: 'admin',
        updatedAt: '2024-01-03T10:00:00Z',
        updatedBy: 'admin',
        username: 'mike.johnson',
        email: 'mike.johnson@company.com',
        firstName: 'Mike',
        lastName: 'Johnson',
        employeeId: 'EMP003',
        role: 'HEAD' as UserRole,
        departmentId: 3,
        departmentName: 'Finance',
        companyId: 1,
        companyName: 'Autovitica Corp',
        designation: 'Finance Head',
        status: 'ACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-01-14T16:20:00Z',
        failedLoginAttempts: 0,
        passwordLastChangedAt: '2024-01-03T10:00:00Z',
        preferences: {
          theme: 'SYSTEM',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: true,
            push: true,
            desktop: false,
          },
        },
      },
      {
        id: 4,
        version: 1,
        createdAt: '2024-01-04T10:00:00Z',
        createdBy: 'admin',
        updatedAt: '2024-01-04T10:00:00Z',
        updatedBy: 'admin',
        username: 'sarah.wilson',
        email: 'sarah.wilson@company.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        employeeId: 'EMP004',
        phoneNumber: '+1234567892',
        role: 'BUYER' as UserRole,
        departmentId: 6,
        departmentName: 'Marketing',
        companyId: 1,
        companyName: 'Autovitica Corp',
        designation: 'Marketing Specialist',
        status: 'INACTIVE',
        emailVerified: true,
        lastLoginAt: '2024-01-10T14:15:00Z',
        failedLoginAttempts: 0,
        passwordLastChangedAt: '2024-01-04T10:00:00Z',
        preferences: {
          theme: 'LIGHT',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'DD/MM/YYYY',
          notifications: {
            email: false,
            push: false,
            desktop: false,
          },
        },
      },
      {
        id: 5,
        version: 1,
        createdAt: '2024-01-05T10:00:00Z',
        createdBy: 'admin',
        updatedAt: '2024-01-05T10:00:00Z',
        updatedBy: 'admin',
        username: 'vendor.abc',
        email: 'contact@vendorabc.com',
        firstName: 'ABC',
        lastName: 'Vendor',
        role: 'VENDOR' as UserRole,
        companyId: 2,
        companyName: 'ABC Vendor Ltd',
        designation: 'Account Manager',
        status: 'PENDING_VERIFICATION',
        emailVerified: false,
        failedLoginAttempts: 0,
        passwordLastChangedAt: '2024-01-05T10:00:00Z',
        preferences: {
          theme: 'LIGHT',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'MM/DD/YYYY',
          notifications: {
            email: true,
            push: false,
            desktop: false,
          },
        },
      },
    ];

    // Simulate API loading
    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleEditUser = (userId: number) => {
    console.log('Edit user:', userId);
    // TODO: Navigate to edit user page
    toast('Edit user functionality coming soon');
  };

  const handleDeleteUser = (userId: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`
      );

      if (confirmDelete) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        toast.success('User deleted successfully');
      }
    }
  };

  const handleViewUser = (userId: number) => {
    console.log('View user:', userId);
    // TODO: Navigate to user detail page
    toast('User details view coming soon');
  };

  return (
    <UserList
      users={users || []}
      onEditUser={handleEditUser}
      onDeleteUser={handleDeleteUser}
      onViewUser={handleViewUser}
      isLoading={isLoading}
    />
  );
};

export default UserManagement;
