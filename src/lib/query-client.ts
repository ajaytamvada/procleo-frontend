import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Local type definitions for React Query compatibility
type QueryKey = readonly unknown[];
type UseQueryOptions = any;

// Local ApiError type definition
interface ApiError {
  message: string;
  code?: string;
  status: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Default query options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: any) => {
    // Don't retry on client errors (4xx)
    if (error?.status >= 400 && error?.status < 500) {
      return false;
    }
    // Retry up to 3 times for server errors
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Create query client with global error handling
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...defaultQueryOptions,
      throwOnError: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      throwOnError: false,
      onError: (error: unknown) => {
        // Global error handling for mutations
        const apiError = error as ApiError;
        const message = apiError.message || 'An error occurred';
        toast.error(message);

        // Log detailed error for debugging
        console.error('Mutation error:', error);
      },
    },
  },
});

// Query key factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    all: ['auth'] as const,
    user: () => ['auth', 'user'] as const,
    permissions: () => ['auth', 'permissions'] as const,
  },

  // Purchase Orders
  purchaseOrders: {
    all: ['purchaseOrders'] as const,
    lists: () => [...queryKeys.purchaseOrders.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.purchaseOrders.lists(), filters] as const,
    details: () => [...queryKeys.purchaseOrders.all, 'detail'] as const,
    detail: (id: string) =>
      [...queryKeys.purchaseOrders.details(), id] as const,
    statistics: () => [...queryKeys.purchaseOrders.all, 'statistics'] as const,
  },

  // Assets
  assets: {
    all: ['assets'] as const,
    lists: () => [...queryKeys.assets.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.assets.lists(), filters] as const,
    details: () => [...queryKeys.assets.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assets.details(), id] as const,
    categories: () => [...queryKeys.assets.all, 'categories'] as const,
  },

  // Vendors
  vendors: {
    all: ['vendors'] as const,
    lists: () => [...queryKeys.vendors.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.vendors.lists(), filters] as const,
    details: () => [...queryKeys.vendors.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.vendors.details(), id] as const,
    ratings: (id: string) =>
      [...queryKeys.vendors.detail(id), 'ratings'] as const,
  },

  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    roles: () => [...queryKeys.users.all, 'roles'] as const,
  },

  // Dashboard
  dashboard: {
    all: ['dashboard'] as const,
    metrics: () => [...queryKeys.dashboard.all, 'metrics'] as const,
    analytics: (period: string) =>
      [...queryKeys.dashboard.all, 'analytics', period] as const,
    notifications: () => [...queryKeys.dashboard.all, 'notifications'] as const,
  },

  // Reports
  reports: {
    all: ['reports'] as const,
    list: () => [...queryKeys.reports.all, 'list'] as const,
    generate: (type: string, params: Record<string, any>) =>
      [...queryKeys.reports.all, 'generate', type, params] as const,
  },
} as const;

// Utility functions for query management
export const queryUtils = {
  // Invalidate all queries for a specific entity
  invalidateEntity: async (entity: keyof typeof queryKeys) => {
    const entityKeys = queryKeys[entity] as any;
    const allKey = entityKeys.all as readonly unknown[];
    await queryClient.invalidateQueries({
      queryKey: allKey,
    });
  },

  // Prefetch data
  prefetch: async <T>(
    queryKey: QueryKey,
    queryFn: () => Promise<T>,
    options?: Partial<UseQueryOptions>
  ) => {
    await queryClient.prefetchQuery({
      queryKey,
      queryFn,
      ...options,
    });
  },

  // Set query data optimistically
  setOptimisticData: <T>(
    queryKey: QueryKey,
    data: T | ((old: T | undefined) => T)
  ) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Cancel outgoing queries
  cancelQueries: async (queryKey: QueryKey) => {
    await queryClient.cancelQueries({ queryKey });
  },

  // Remove queries from cache
  removeQueries: (queryKey: QueryKey) => {
    queryClient.removeQueries({ queryKey });
  },

  // Get cached data
  getQueryData: <T>(queryKey: QueryKey): T | undefined => {
    return queryClient.getQueryData<T>(queryKey);
  },

  // Invalidate and refetch
  invalidateAndRefetch: async (queryKey: QueryKey) => {
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
  },
};

// Background sync utilities
export const backgroundSync = {
  // Sync data when coming back online
  syncOnOnline: () => {
    const handleOnline = () => {
      queryClient.resumePausedMutations();
      queryClient.invalidateQueries();
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  },

  // Pause mutations when offline
  pauseOnOffline: () => {
    const handleOffline = () => {
      // Mutations will be automatically paused by React Query
      // when network is detected as offline
    };

    window.addEventListener('offline', handleOffline);
    return () => window.removeEventListener('offline', handleOffline);
  },
};

// Persistence layer integration
export const persistenceUtils = {
  // Persist query results to localStorage
  persistQuery: <T>(
    queryKey: QueryKey,
    data: T,
    ttl: number = 24 * 60 * 60 * 1000
  ) => {
    const item = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(
      `query_${JSON.stringify(queryKey)}`,
      JSON.stringify(item)
    );
  },

  // Restore query from localStorage
  restoreQuery: <T>(queryKey: QueryKey): T | null => {
    try {
      const stored = localStorage.getItem(`query_${JSON.stringify(queryKey)}`);
      if (!stored) return null;

      const item = JSON.parse(stored);
      const isExpired = Date.now() - item.timestamp > item.ttl;

      if (isExpired) {
        localStorage.removeItem(`query_${JSON.stringify(queryKey)}`);
        return null;
      }

      return item.data;
    } catch {
      return null;
    }
  },

  // Clear expired cached queries
  clearExpiredQueries: () => {
    const keys = Object.keys(localStorage).filter(key =>
      key.startsWith('query_')
    );

    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '');
        const isExpired = Date.now() - item.timestamp > item.ttl;

        if (isExpired) {
          localStorage.removeItem(key);
        }
      } catch {
        localStorage.removeItem(key);
      }
    });
  },
};
