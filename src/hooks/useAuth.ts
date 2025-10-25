import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import type { User, LoginCredentials, RegisterData, UpdateProfileData, UpdatePasswordData } from '@/services/auth';
import { AuthService } from '@/services/auth';
import { queryKeys, queryUtils } from '@/lib/query-client';

// Auth query hooks
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: AuthService.getCurrentUser,
    enabled: AuthService.isAuthenticated(),
    staleTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      // Don't retry if user is not authenticated
      if (error?.status === 401) return false;
      return failureCount < 2;
    },
    initialData: AuthService.getStoredUser(),
  });
}

export function useUserPermissions() {
  return useQuery({
    queryKey: queryKeys.auth.permissions(),
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      return user.permissions;
    },
    enabled: AuthService.isAuthenticated(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

// Auth mutation hooks
export function useLogin() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.login,
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.auth.user(), data.userInfo);
      
      // Show success message
      toast.success(`Welcome back, ${data.userInfo.employeeName || data.userInfo.username}!`);
      
      // Navigate to dashboard
      navigate('/dashboard');
      
      // Prefetch dashboard data
      queryUtils.prefetch(
        queryKeys.dashboard.metrics(),
        () => fetch('/api/dashboard/metrics').then(res => res.json())
      );
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed. Please try again.');
    },
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: AuthService.register,
    onSuccess: () => {
      toast.success('Registration successful! Please check your email to verify your account.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed. Please try again.');
    },
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      
      // Navigate to login page
      navigate('/login');
      
      // Show success message
      toast.success('Logged out successfully');
    },
    onError: (error: any) => {
      // Even if logout fails on server, still clear local data
      queryClient.clear();
      navigate('/login');
      toast.error(error.message || 'Logout failed');
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: AuthService.updateProfile,
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.auth.user() });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>(queryKeys.auth.user());

      // Optimistically update to the new value
      if (previousUser) {
        queryClient.setQueryData(queryKeys.auth.user(), {
          ...previousUser,
          ...newData,
        });
      }

      return { previousUser };
    },
    onError: (error: any, newData, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.auth.user(), context.previousUser);
      }
      toast.error(error.message || 'Failed to update profile');
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(queryKeys.auth.user(), data);
      toast.success('Profile updated successfully');
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
    },
  });
}

export function useUpdatePassword() {
  return useMutation({
    mutationFn: AuthService.updatePassword,
    onSuccess: () => {
      toast.success('Password updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update password');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: AuthService.requestPasswordReset,
    onSuccess: () => {
      toast.success('Password reset email sent. Please check your inbox.');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send password reset email');
    },
  });
}

export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      AuthService.resetPassword(token, password),
    onSuccess: () => {
      toast.success('Password reset successful. Please log in with your new password.');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password');
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: AuthService.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Email verification failed');
    },
  });
}

// Combined auth hook with all functionality
export function useAuth() {
  // DEVELOPMENT MODE: Skip authentication
  const DEV_MODE = false; // Set to false to enable real authentication
  
  const { data: user, isLoading: isLoadingUser } = useCurrentUser();
  const { data: permissions } = useUserPermissions();
  
  const loginMutation = useLogin();
  const logoutMutation = useLogout();
  const updateProfileMutation = useUpdateProfile();

  // Mock user for development
  const mockUser = {
    id: '1',
    email: 'admin@autovitica.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    permissions: ['*'], // All permissions
    department: 'IT',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const isAuthenticated = DEV_MODE ? true : AuthService.isAuthenticated();
  const isLoading = DEV_MODE ? false : (isLoadingUser || loginMutation.isPending || logoutMutation.isPending);
  const currentUser = DEV_MODE ? mockUser : user;

  // Helper functions
  const hasPermission = (permission: string): boolean => {
    if (DEV_MODE) return true; // Grant all permissions in dev mode
    return permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    if (DEV_MODE) return true; // Match any role in dev mode
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (DEV_MODE) return true; // Match any role in dev mode
    return roles.some(role => user?.roles?.includes(role)) || false;
  };

  const login = async (credentials: LoginCredentials) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  const updateProfile = async (data: UpdateProfileData) => {
    return updateProfileMutation.mutateAsync(data);
  };

  return {
    // State
    user: currentUser,
    permissions: DEV_MODE ? ['*'] : permissions,
    isAuthenticated,
    isLoading,
    
    // Actions
    login,
    logout,
    updateProfile,
    
    // Helpers
    hasPermission,
    hasRole,
    hasAnyRole,
    
    // Mutation states
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
    
    // Errors
    loginError: loginMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
}