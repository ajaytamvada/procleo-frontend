import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useAppActions } from '@/store/appStore';
import { dbManager } from '@/lib/indexeddb';
import { useCacheManager } from './useAdvancedCache';

interface OfflineMutation {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  description: string;
}

interface ServiceWorkerRegistration {
  installing?: ServiceWorker;
  waiting?: ServiceWorker;
  active?: ServiceWorker;
  sync?: {
    register: (tag: string) => Promise<void>;
  };
}

export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [queuedMutations, setQueuedMutations] = useState<OfflineMutation[]>([]);
  const [isInstalling, setIsInstalling] = useState(false);

  const queryClient = useQueryClient();
  const cacheManager = useCacheManager();
  const { setOnlineStatus, addNotification } = useAppActions();

  // Register service worker and load queued mutations
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Load existing queued mutations from IndexedDB
    dbManager.getMutationQueue().then(setQueuedMutations).catch(console.error);
  }, []);

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setOnlineStatus(true);
      toast.success('Back online! Syncing data...');

      // Trigger background sync if available
      if (swRegistration?.sync) {
        swRegistration.sync.register('sync-mutations').catch(console.error);
      }

      // Refetch stale queries
      queryClient.refetchQueries({
        stale: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      setOnlineStatus(false);
      toast.error('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus, queryClient, swRegistration]);

  const registerServiceWorker = async () => {
    try {
      setIsInstalling(true);
      const registration = await navigator.serviceWorker.register('/sw.js');
      setSwRegistration(registration as ServiceWorkerRegistration);

      // Listen for service worker updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // New version available
              addNotification({
                type: 'info',
                title: 'Update Available',
                message: 'A new version of the app is available.',
                read: false,
                actions: [
                  {
                    label: 'Update Now',
                    action: () => {
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                      window.location.reload();
                    },
                  },
                ],
              });
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener(
        'message',
        handleServiceWorkerMessage
      );

      console.log('Service Worker registered successfully');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, mutation, response } = event.data;

    switch (type) {
      case 'MUTATION_SYNCED':
        // Remove synced mutation from queue
        setQueuedMutations(prev => prev.filter(m => m.id !== mutation.id));

        // Invalidate related queries
        queryClient.invalidateQueries();

        toast.success(`Synced: ${mutation.description}`);
        break;

      default:
        console.log('Unknown service worker message:', type);
    }
  };

  // Queue mutation for offline sync
  const queueMutation = useCallback(
    async (
      url: string,
      options: RequestInit,
      description: string,
      priority: 'low' | 'medium' | 'high' = 'medium'
    ): Promise<string> => {
      const mutationId = await dbManager.queueMutation({
        url,
        method: options.method || 'GET',
        headers: (options.headers as Record<string, string>) || {},
        body: options.body as string,
        description,
        priority,
      });

      // Update local state
      const mutations = await dbManager.getMutationQueue();
      setQueuedMutations(mutations);

      // Send to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'QUEUE_MUTATION',
          data: {
            id: mutationId,
            url,
            method: options.method,
            headers: options.headers,
            body: options.body,
            description,
          },
        });
      }

      // Register for background sync if available
      if (swRegistration?.sync) {
        try {
          await swRegistration.sync.register('sync-mutations');
        } catch (error) {
          console.error('Background sync registration failed:', error);
        }
      }

      toast(`Queued for sync: ${description}`);
      return mutationId;
    },
    [swRegistration]
  );

  // Remove mutation from queue
  const removeMutationFromQueue = useCallback(async (id: string) => {
    await dbManager.removeMutation(id);
    const mutations = await dbManager.getMutationQueue();
    setQueuedMutations(mutations);
  }, []);

  // Clear all caches
  const clearCache = useCallback(async () => {
    try {
      // Clear IndexedDB cache
      await cacheManager.clear();

      // Clear service worker cache
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
        });
      }

      // Clear React Query cache
      queryClient.clear();

      toast.success('All caches cleared successfully');
    } catch (error) {
      toast.error('Failed to clear caches');
      console.error('Cache clear error:', error);
    }
  }, [queryClient, cacheManager]);

  // Force sync queued mutations
  const forceSyncMutations = useCallback(async () => {
    if (!isOnline) {
      toast.error('Cannot sync while offline');
      return;
    }

    if (swRegistration?.sync) {
      try {
        await swRegistration.sync.register('sync-mutations');
        toast('Sync triggered manually');
      } catch (error) {
        toast.error('Failed to trigger sync');
      }
    }
  }, [isOnline, swRegistration]);

  // Get offline-capable mutation function
  const createOfflineMutation = useCallback(
    (
      mutationFn: (variables: any) => Promise<any>,
      description: (variables: any) => string
    ) => {
      return async (variables: any) => {
        if (isOnline) {
          // Execute normally when online
          return mutationFn(variables);
        } else {
          // Queue for later when offline
          // This is a simplified example - in practice, you'd need to
          // serialize the mutation details for the service worker
          const mutationId = await queueMutation(
            '/api/offline-mutation',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(variables),
            },
            description(variables)
          );

          // Return a promise that resolves with a temporary ID
          return {
            id: mutationId,
            offline: true,
            ...variables,
          };
        }
      };
    },
    [isOnline, queueMutation]
  );

  return {
    isOnline,
    isInstalling,
    queuedMutations,
    swRegistration,
    queueMutation,
    removeMutationFromQueue,
    clearCache,
    forceSyncMutations,
    createOfflineMutation,
  };
}

// Hook for offline-aware queries
export function useOfflineQuery<T>(
  queryKey: any[],
  queryFn: () => Promise<T>,
  options: {
    fallbackData?: T;
    offlineMessage?: string;
  } = {}
) {
  const { isOnline } = useOfflineSupport();

  return {
    ...useQuery({
      queryKey,
      queryFn: async () => {
        if (!isOnline && !options.fallbackData) {
          throw new Error(
            options.offlineMessage || 'Data not available offline'
          );
        }
        return queryFn();
      },
      // Enable background refetch when coming back online
      refetchOnReconnect: true,
      // Use stale data when offline
      staleTime: isOnline ? 5 * 60 * 1000 : Infinity,
    }),
    isOnline,
  };
}

// Hook for managing cached data persistence
export function useDataPersistence() {
  const queryClient = useQueryClient();

  const persistData = useCallback(async (key: string, data: any) => {
    try {
      const item = {
        data,
        timestamp: Date.now(),
        version: '1.0',
      };
      localStorage.setItem(`persist_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to persist data:', error);
    }
  }, []);

  const restoreData = useCallback(
    (key: string, maxAge: number = 24 * 60 * 60 * 1000) => {
      try {
        const stored = localStorage.getItem(`persist_${key}`);
        if (!stored) return null;

        const item = JSON.parse(stored);
        const age = Date.now() - item.timestamp;

        if (age > maxAge) {
          localStorage.removeItem(`persist_${key}`);
          return null;
        }

        return item.data;
      } catch (error) {
        console.error('Failed to restore data:', error);
        return null;
      }
    },
    []
  );

  const clearPersistedData = useCallback((key?: string) => {
    if (key) {
      localStorage.removeItem(`persist_${key}`);
    } else {
      // Clear all persisted data
      Object.keys(localStorage)
        .filter(k => k.startsWith('persist_'))
        .forEach(k => localStorage.removeItem(k));
    }
  }, []);

  return {
    persistData,
    restoreData,
    clearPersistedData,
  };
}
