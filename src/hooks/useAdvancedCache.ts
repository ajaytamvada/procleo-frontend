// Advanced caching hooks
import { useEffect, useCallback, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CacheManager } from '@/lib/cache-manager';
import type { CacheMetrics } from '@/lib/cache-manager';
import { dbManager } from '@/lib/indexeddb';
import { useAppActions } from '@/store/appStore';

// Global cache manager instance
let globalCacheManager: CacheManager | null = null;

export function useCacheManager() {
  const queryClient = useQueryClient();

  if (!globalCacheManager) {
    globalCacheManager = new CacheManager(queryClient);
  }

  return globalCacheManager;
}

export function useAdvancedCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number;
    priority?: 'low' | 'medium' | 'high';
    fallbackData?: T;
    backgroundRefresh?: boolean;
    refreshInterval?: number;
  } = {}
) {
  const cacheManager = useCacheManager();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(
    async (useCache = true) => {
      try {
        setIsLoading(true);
        setError(null);

        // Try cache first if enabled
        if (useCache) {
          const cached = await cacheManager.get<T>(key);
          if (cached) {
            setData(cached);
            setLastFetch(Date.now());

            // Background refresh if enabled
            if (options.backgroundRefresh) {
              fetcher()
                .then(freshData => {
                  cacheManager.set(key, freshData, options);
                  setData(freshData);
                })
                .catch(console.warn);
            }

            setIsLoading(false);
            return cached;
          }
        }

        // Fetch fresh data
        const freshData = await fetcher();

        // Cache the result
        await cacheManager.set(key, freshData, options);

        setData(freshData);
        setLastFetch(Date.now());
        setIsLoading(false);

        return freshData;
      } catch (err) {
        const error = err as Error;
        setError(error);
        setIsLoading(false);

        // Try fallback data
        if (options.fallbackData) {
          setData(options.fallbackData);
          return options.fallbackData;
        }

        throw error;
      }
    },
    [key, fetcher, cacheManager, options]
  );

  const refresh = useCallback(() => {
    return fetchData(false);
  }, [fetchData]);

  const invalidate = useCallback(async () => {
    await cacheManager.invalidate(key);
    return fetchData(false);
  }, [key, cacheManager, fetchData]);

  // Setup refresh interval
  useEffect(() => {
    if (options.refreshInterval) {
      refreshIntervalRef.current = setInterval(() => {
        fetchData(true);
      }, options.refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [options.refreshInterval, fetchData]);

  // Initial fetch
  useEffect(() => {
    fetchData(true);
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastFetch,
    refresh,
    invalidate,
  };
}

export function useCacheMetrics() {
  const cacheManager = useCacheManager();
  const [metrics, setMetrics] = useState<CacheMetrics>(
    cacheManager.getMetrics()
  );

  const refreshMetrics = useCallback(() => {
    setMetrics(cacheManager.getMetrics());
  }, [cacheManager]);

  useEffect(() => {
    const interval = setInterval(refreshMetrics, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return {
    metrics,
    refreshMetrics,
  };
}

export function useCacheManagement() {
  const cacheManager = useCacheManager();
  const { addNotification } = useAppActions();

  const clearCache = useCallback(async () => {
    try {
      await cacheManager.clear();
      addNotification({
        type: 'success',
        title: 'Cache Cleared',
        message: 'All cached data has been removed.',
        read: false,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Cache Clear Failed',
        message: 'Failed to clear cache data.',
        read: false,
      });
    }
  }, [cacheManager, addNotification]);

  const performCleanup = useCallback(async () => {
    try {
      await cacheManager.performCleanup();
      addNotification({
        type: 'success',
        title: 'Cache Cleanup Complete',
        message: 'Expired and old cache data has been removed.',
        read: false,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Cache Cleanup Failed',
        message: 'Failed to perform cache cleanup.',
        read: false,
      });
    }
  }, [cacheManager, addNotification]);

  const warmCache = useCallback(
    async (keys: string[]) => {
      try {
        await cacheManager.warmCache(keys);
        addNotification({
          type: 'success',
          title: 'Cache Warmed',
          message: `Pre-loaded ${keys.length} cache entries.`,
          read: false,
        });
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Cache Warm Failed',
          message: 'Failed to warm cache.',
          read: false,
        });
      }
    },
    [cacheManager, addNotification]
  );

  const getDatabaseSize = useCallback(async () => {
    try {
      return await dbManager.getDatabaseSize();
    } catch (error) {
      console.error('Failed to get database size:', error);
      return [];
    }
  }, []);

  const exportData = useCallback(async () => {
    try {
      const data = await dbManager.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autovitica-cache-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Cache data has been exported successfully.',
        read: false,
      });
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export cache data.',
        read: false,
      });
    }
  }, [addNotification]);

  return {
    clearCache,
    performCleanup,
    warmCache,
    getDatabaseSize,
    exportData,
    cacheManager,
  };
}

export function useDataSync() {
  const cacheManager = useCacheManager();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<number>(0);

  const syncData = useCallback(async () => {
    try {
      setIsSyncing(true);

      // Sync React Query cache with IndexedDB
      await cacheManager.syncWithReactQuery();

      // Process offline mutations
      const mutations = await dbManager.getMutationQueue();

      for (const mutation of mutations) {
        try {
          const response = await fetch(mutation.url, {
            method: mutation.method,
            headers: mutation.headers,
            body: mutation.body,
          });

          if (response.ok) {
            await dbManager.removeMutation(mutation.id);

            // Update sync status
            if (mutation.entityType && mutation.entityId) {
              await dbManager.updateSyncStatus(
                mutation.entityType,
                mutation.entityId,
                1 // version - would typically come from response
              );
            }
          } else {
            // Increment retry count
            await dbManager.incrementMutationRetry(mutation.id);
          }
        } catch (error) {
          console.warn(`Failed to sync mutation ${mutation.id}:`, error);
          await dbManager.incrementMutationRetry(mutation.id);
        }
      }

      setLastSync(Date.now());
    } catch (error) {
      console.error('Data sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [cacheManager]);

  const getStaleData = useCallback(async (maxAge: number = 60 * 60 * 1000) => {
    return dbManager.getStaleEntities(maxAge);
  }, []);

  const getPendingMutations = useCallback(async () => {
    return dbManager.getMutationQueue();
  }, []);

  return {
    isSyncing,
    lastSync,
    syncData,
    getStaleData,
    getPendingMutations,
  };
}

export function useSmartCache<T>(
  queryKey: string[],
  fetcher: () => Promise<T>,
  options: {
    staleTime?: number;
    cacheTime?: number;
    backgroundSync?: boolean;
    optimisticUpdates?: boolean;
  } = {}
) {
  const cacheManager = useCacheManager();
  const key = queryKey.join('/');

  const { data, isLoading, error, refresh, invalidate } = useAdvancedCache(
    key,
    fetcher,
    {
      ttl: options.cacheTime,
      backgroundRefresh: options.backgroundSync,
    }
  );

  const optimisticUpdate = useCallback(
    async (updater: (data: T) => T) => {
      if (!options.optimisticUpdates || !data) return;

      try {
        const updatedData = updater(data);

        // Apply optimistic update to cache
        await cacheManager.set(key, updatedData);

        // Queue mutation for later sync if needed
        // This would typically be handled by the mutation hooks
      } catch (error) {
        console.error('Optimistic update failed:', error);
      }
    },
    [data, cacheManager, key, options.optimisticUpdates]
  );

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
    optimisticUpdate,
  };
}

// Auto-cleanup hook
export function useAutoCleanup() {
  const cacheManager = useCacheManager();

  useEffect(() => {
    // Cleanup on app close/reload
    const handleBeforeUnload = () => {
      cacheManager.destroy();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      cacheManager.destroy();
    };
  }, [cacheManager]);
}
