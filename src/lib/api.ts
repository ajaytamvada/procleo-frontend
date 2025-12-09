import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse as AxiosResponseType,
  type AxiosError as AxiosErrorType,
} from 'axios';
import { env } from '@/utils/env';

// Extend axios config to support metadata
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime?: number;
      responseTime?: number;
      [key: string]: any;
    };
  }
}

// Types for API responses
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user_data',
} as const;

// Token management
class TokenManager {
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  }
}

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: env.VITE_API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for auth token
  client.interceptors.request.use(
    config => {
      const token = TokenManager.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request timestamp
      config.metadata = { startTime: Date.now() };

      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );

  // Response interceptor for token refresh and error handling
  client.interceptors.response.use(
    (response: AxiosResponseType) => {
      // Add response time to metadata
      const endTime = Date.now();
      const startTime = response.config.metadata?.startTime || endTime;
      if (response.config.metadata) {
        response.config.metadata.responseTime = endTime - startTime;
      }

      return response;
    },
    async (error: AxiosErrorType) => {
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;

      // Handle 401 errors (unauthorized)
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          const refreshToken = TokenManager.getRefreshToken();
          if (refreshToken) {
            const response = await axios.post(
              `${env.VITE_API_BASE_URL}/auth/refresh`,
              {
                refreshToken,
              }
            );

            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;
            TokenManager.setTokens(accessToken, newRefreshToken);

            // Retry original request with new token
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }

            return client.request(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, clear tokens and redirect to login
          TokenManager.clearTokens();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      // Handle other errors
      const responseData: any = error.response?.data || {};
      const apiError: ApiError = {
        message: responseData.message || error.message || 'An error occurred',
        status: error.response?.status || 500,
        code: responseData.code,
        errors: responseData.errors,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Create the main API client
export const apiClient = createApiClient();

// Enhanced API client with additional methods
export class ApiService {
  private client: AxiosInstance;

  constructor(client: AxiosInstance) {
    this.client = client;
  }

  // GET request with type safety
  async get<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // POST request with type safety
  async post<T, D = any>(
    url: string,
    data?: D,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.client.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PUT request with type safety
  async put<T, D = any>(
    url: string,
    data?: D,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.client.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // PATCH request with type safety
  async patch<T, D = any>(
    url: string,
    data?: D,
    config?: any
  ): Promise<ApiResponse<T>> {
    const response = await this.client.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  // DELETE request with type safety
  async delete<T>(url: string, config?: any): Promise<ApiResponse<T>> {
    const response = await this.client.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // GET paginated data
  async getPaginated<T>(
    url: string,
    params?: Record<string, any>
  ): Promise<PaginatedResponse<T>> {
    const response = await this.client.get<PaginatedResponse<T>>(url, {
      params,
    });
    return response.data;
  }

  // Upload file with progress
  async uploadFile<T>(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: any) => void
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.client.post<ApiResponse<T>>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });

    return response.data;
  }

  // Download file
  async downloadFile(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: 'blob',
    });

    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Batch requests
  async batch<T>(requests: Array<() => Promise<any>>): Promise<T[]> {
    const responses = await Promise.allSettled(requests.map(req => req()));
    return responses.map(response => {
      if (response.status === 'fulfilled') {
        return response.value;
      } else {
        throw response.reason;
      }
    });
  }
}

// Create the main API service instance
export const api = new ApiService(apiClient);

// Export token manager for use in other parts of the app
export { TokenManager };

// Network status utilities
export const networkUtils = {
  isOnline: (): boolean => navigator.onLine,

  onOnline: (callback: () => void): (() => void) => {
    window.addEventListener('online', callback);
    return () => window.removeEventListener('online', callback);
  },

  onOffline: (callback: () => void): (() => void) => {
    window.addEventListener('offline', callback);
    return () => window.removeEventListener('offline', callback);
  },
};

// Request retry utility
export const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on client errors (4xx)
      if (error && typeof error === 'object' && 'status' in error) {
        const apiError = error as ApiError;
        if (apiError.status >= 400 && apiError.status < 500) {
          throw error;
        }
      }

      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve =>
          setTimeout(resolve, delay * Math.pow(2, i))
        );
      }
    }
  }

  throw lastError!;
};
