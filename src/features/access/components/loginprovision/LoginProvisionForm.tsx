import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import type { LoginProvision } from '../../hooks/useLoginProvisionAPI';
import { useCreateLoginProvision, useUpdateLoginProvision } from '../../hooks/useLoginProvisionAPI';
import { useActiveUserTypes } from '../../hooks/useUserTypeAPI';
import { useWorkingEmployees } from '@/features/master/hooks/useEmployeeAPI';

interface LoginProvisionFormProps {
  user?: LoginProvision | null;
  onClose: () => void;
  onSuccess: () => void;
}

const LoginProvisionForm: React.FC<LoginProvisionFormProps> = ({ user, onClose, onSuccess }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [loginName, setLoginName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userTypeId, setUserTypeId] = useState<number | null>(null);
  const [status, setStatus] = useState<number>(1);
  const [disableDate, setDisableDate] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: employees, isLoading: loadingEmployees } = useWorkingEmployees();
  const { data: userTypes, isLoading: loadingUserTypes } = useActiveUserTypes();
  const createMutation = useCreateLoginProvision();
  const updateMutation = useUpdateLoginProvision();

  useEffect(() => {
    if (user) {
      setEmployeeId(user.employeeId || '');
      setLoginName(user.loginName || '');
      setEmail(user.email || '');
      setUserTypeId(user.userTypeId || null);
      setStatus(user.status || 1);
      setDisableDate(user.disableDate || '');
      // Don't set password for edit mode
    }
  }, [user]);

  // Auto-generate login name from employee
  const handleEmployeeChange = (empId: string) => {
    setEmployeeId(empId);
    if (!user && empId) {
      const employee = employees?.find(e => e.id?.toString() === empId);
      if (employee) {
        // Generate login name from employee name or email
        const generatedLogin = (employee.email || employee.name || '').replace(/@.*$/, '').toUpperCase();
        setLoginName(generatedLogin);
        setEmail(employee.email?.toUpperCase() || '');
      }
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string): boolean => {
    // Minimum 8 characters, at least one uppercase, one lowercase, and one digit
    const passwordRegex = /^((?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,})$/;
    return passwordRegex.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!employeeId) {
      alert('Employee is required');
      return;
    }

    if (!loginName || loginName.length < 3) {
      alert('Login name must be at least 3 characters');
      return;
    }

    if (email && !validateEmail(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!user) {
      // Create mode - password required
      if (!password) {
        alert('Password is required');
        return;
      }

      if (!validatePassword(password)) {
        alert('Password must be at least 8 characters with mix of uppercase, lowercase and digits');
        return;
      }

      if (password !== confirmPassword) {
        alert('Password and confirm password must match');
        return;
      }
    } else {
      // Update mode - password optional, but if provided, must match
      if (password || confirmPassword) {
        if (!validatePassword(password)) {
          alert('Password must be at least 8 characters with mix of uppercase, lowercase and digits');
          return;
        }

        if (password !== confirmPassword) {
          alert('Password and confirm password must match');
          return;
        }
      }
    }

    if (!userTypeId) {
      alert('User type is required');
      return;
    }

    if (status === 0 && !disableDate) {
      alert('Disable date is required when status is Disabled');
      return;
    }

    const userData: LoginProvision = {
      employeeId,
      loginName: loginName.toUpperCase(),
      email: email.toUpperCase(),
      userTypeId,
      status,
      disableDate: status === 0 ? disableDate : undefined,
    };

    // Only include password if provided
    if (password) {
      userData.password = password;
    }

    try {
      if (user?.id) {
        await updateMutation.mutateAsync({ id: user.id, user: userData });
        alert('User login updated successfully!');
      } else {
        await createMutation.mutateAsync(userData);
        alert('User login created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      alert(errorMessage);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {user ? 'Edit User Login' : 'Add New User Login'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Employee */}
              <div>
                <label htmlFor="employee" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Employee
                </label>
                <select
                  id="employee"
                  value={employeeId}
                  onChange={(e) => handleEmployeeChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading || loadingEmployees}
                >
                  <option value="">Select</option>
                  {employees?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Login Name */}
              <div>
                <label htmlFor="loginName" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Login Name
                </label>
                <input
                  type="text"
                  id="loginName"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  minLength={3}
                  maxLength={100}
                  disabled={isLoading}
                  readOnly
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!user}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Status
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="1"
                      checked={status === 1}
                      onChange={() => {
                        setStatus(1);
                        setDisableDate('');
                      }}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    Enabled
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="0"
                      checked={status === 0}
                      onChange={() => setStatus(0)}
                      className="mr-2"
                      disabled={isLoading}
                    />
                    Disabled
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Email Id
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  maxLength={255}
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={!user}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Min 8 characters with uppercase, lowercase and digits
                </p>
              </div>

              {/* User Type */}
              <div>
                <label htmlFor="userType" className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="text-red-500">*</span> User Type
                </label>
                <select
                  id="userType"
                  value={userTypeId || ''}
                  onChange={(e) => setUserTypeId(Number(e.target.value) || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={isLoading || loadingUserTypes}
                >
                  <option value="">Select</option>
                  {userTypes?.map((ut) => (
                    <option key={ut.id} value={ut.id}>
                      {ut.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Disable Date (conditional) */}
              {status === 0 && (
                <div>
                  <label htmlFor="disableDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="text-red-500">*</span> Disable Date
                  </label>
                  <input
                    type="date"
                    id="disableDate"
                    value={disableDate}
                    onChange={(e) => setDisableDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required={status === 0}
                    disabled={isLoading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : user ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginProvisionForm;
