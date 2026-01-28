import { api, TokenManager, type ApiResponse, apiClient } from '@/lib/api';
import type { UserModulePermission } from '@/types/permissions';

// Auth types
export interface User {
  id: number;
  loginName: string; // Changed from username to match backend
  email: string;
  employeeId?: string;
  employeeName?: string;
  firstName?: string; // Added for frontend compatibility
  lastName?: string; // Added for frontend compatibility
  departmentName?: string;
  locationName?: string;
  companyName?: string;
  userTypeId?: number;
  userTypeName?: string;
  vendorId?: number; // Vendor ID if this is a vendor user
  vendorName?: string; // Vendor company name
  permissions: string[]; // Deprecated: keeping for backward compatibility
  modules: UserModulePermission[]; // New: module-based permissions
  lastLoginAt?: string;
  // Legacy support for backward compatibility
  username?: string;
  roles?: string[];
  phone?: string;
  designation?: string;
  department?: string;
}

// Helper function to check if user is a vendor
export const isVendorUser = (user: User | null): boolean => {
  return user?.vendorId != null;
};

export interface LoginCredentials {
  username: string; // Can be username or email
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
  phoneNumber?: string;
  company?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  userInfo: User;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface ResetPasswordData {
  email: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  department?: string;
  avatar?: File;
}

// Auth service class
export class AuthService {
  // Login user
  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // Transform credentials to match LoginProvision backend expectation
    const loginData = {
      loginName: credentials.username, // Changed to loginName
      password: credentials.password,
      rememberMe: credentials.rememberMe || false,
    };

    // Use direct axios call to new LoginProvision endpoint
    const response = await apiClient.post(
      '/master/login-provision/authenticate',
      loginData
    );
    const loginResponse: LoginResponse = response.data;

    // Store tokens
    TokenManager.setTokens(
      loginResponse.accessToken,
      loginResponse.refreshToken
    );

    // Store user data
    localStorage.setItem('user_data', JSON.stringify(loginResponse.userInfo));

    // Store user's module permissions in permission store
    const { usePermissionStore } = await import('@/store/permissionStore');
    const modules = loginResponse.userInfo.modules || [];
    usePermissionStore.getState().setModules(modules);

    return loginResponse;
  }

  // Register user
  static async register(data: RegisterData): Promise<ApiResponse<User>> {
    return api.post<User>('/auth/register', data);
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      const accessToken = TokenManager.getAccessToken();
      if (accessToken) {
        // Call new LoginProvision logout endpoint with token in Authorization header
        await apiClient.post(
          '/master/login-provision/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      // Continue with local logout even if server call fails
      console.warn('Server logout failed:', error);
    } finally {
      // Clear local storage
      TokenManager.clearTokens();

      // Clear any cached user data
      localStorage.removeItem('user_data');

      // Clear permission store
      const { usePermissionStore } = await import('@/store/permissionStore');
      usePermissionStore.getState().clearModules();
    }
  }

  // Refresh access token
  static async refreshToken(): Promise<RefreshTokenResponse> {
    const refreshToken = TokenManager.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Use direct axios call to new LoginProvision refresh endpoint
    const response = await apiClient.post('/master/login-provision/refresh', {
      refreshToken,
    });
    const refreshResponse: RefreshTokenResponse = response.data;

    // Update stored tokens
    TokenManager.setTokens(
      refreshResponse.accessToken,
      refreshResponse.refreshToken
    );

    return refreshResponse;
  }

  // Get current user profile
  static async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/auth/me');

    // Update stored user data
    localStorage.setItem('user_data', JSON.stringify(response.data));

    return response.data;
  }

  // Update user profile
  static async updateProfile(data: UpdateProfileData): Promise<User> {
    const requestData: any = { ...data };

    // Handle avatar upload separately if provided
    if (data.avatar) {
      const avatarResponse = await api.uploadFile<{ url: string }>(
        '/auth/upload-avatar',
        data.avatar
      );
      requestData.avatar = avatarResponse.data.url;
      delete requestData.avatar; // Remove the File object
    }

    const response = await api.put<User>('/auth/profile', requestData);

    // Update stored user data
    localStorage.setItem('user_data', JSON.stringify(response.data));

    return response.data;
  }

  // Update password
  static async updatePassword(data: UpdatePasswordData): Promise<void> {
    await api.put('/auth/password', data);
  }

  // Request password reset
  static async requestPasswordReset(data: ResetPasswordData): Promise<void> {
    await api.post('/auth/forgot-password', data);
  }

  // Reset password with token
  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    await api.post('/auth/reset-password', {
      token,
      password: newPassword,
    });
  }

  // Verify email
  static async verifyEmail(token: string): Promise<void> {
    await api.post('/auth/verify-email', { token });
  }

  // Resend verification email
  static async resendVerificationEmail(): Promise<void> {
    await api.post('/auth/resend-verification');
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const token = TokenManager.getAccessToken();
    if (!token) return false;

    try {
      // Check if token is expired (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  // Get stored user data
  static getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Check user permissions
  static hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Check user role
  static hasRole(role: string): boolean {
    const user = this.getStoredUser();
    return user?.roles?.includes(role) || false;
  }

  // Get user's full name
  static getUserFullName(): string {
    const user = this.getStoredUser();
    if (!user) return '';
    // Use employeeName from backend, fallback to firstName + lastName, then loginName
    return (
      user.employeeName ||
      `${(user as any).firstName || ''} ${(user as any).lastName || ''}`.trim() ||
      user.loginName ||
      user.username ||
      ''
    );
  }

  // Enable/Disable two-factor authentication
  static async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    const response = await api.post<{ qrCode: string; secret: string }>(
      '/auth/2fa/enable'
    );
    return response.data;
  }

  static async disableTwoFactor(code: string): Promise<void> {
    await api.post('/auth/2fa/disable', { code });
  }

  static async verifyTwoFactor(code: string): Promise<void> {
    await api.post('/auth/2fa/verify', { code });
  }

  // Get user sessions
  static async getUserSessions(): Promise<
    Array<{
      id: string;
      device: string;
      location: string;
      lastActive: string;
      current: boolean;
    }>
  > {
    const response = await api.get<
      Array<{
        id: string;
        device: string;
        location: string;
        lastActive: string;
        current: boolean;
      }>
    >('/auth/sessions');
    return response.data;
  }

  // Revoke user session
  static async revokeSession(sessionId: string): Promise<void> {
    await api.delete(`/auth/sessions/${sessionId}`);
  }

  // Revoke all other sessions
  static async revokeAllOtherSessions(): Promise<void> {
    await api.post('/auth/sessions/revoke-all');
  }
}

export default AuthService;
