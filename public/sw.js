// Service Worker for offline support and caching
const CACHE_NAME = 'autovitica-p2p-v1';
const API_CACHE_NAME = 'autovitica-api-cache-v1';

// Resources to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  // Add other static resources as needed
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /\/api\/dashboard\/metrics/,
  /\/api\/purchase-orders/,
  /\/api\/assets/,
  /\/api\/vendors/,
  /\/api\/users/,
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      }),
      caches.open(API_CACHE_NAME)
    ])
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static resources
  event.respondWith(handleStaticRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const isReadOnlyApi = request.method === 'GET' && 
    API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
  
  if (!isReadOnlyApi) {
    // For non-cacheable APIs, just try network
    try {
      return await fetch(request);
    } catch (error) {
      // Return offline response for write operations
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Operation failed: You are offline',
          offline: true,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }
  
  // Network-first strategy for cacheable GET requests
  try {
    console.log('[SW] Trying network for:', request.url);
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      
      // Add timestamp to response headers for cache validation
      const response = networkResponse.clone();
      response.headers.set('sw-cached-at', Date.now().toString());
      
      return response;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    
    // Try to get from cache
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Add offline indicator to cached responses
      const response = cachedResponse.clone();
      response.headers.set('sw-from-cache', 'true');
      response.headers.set('sw-offline', 'true');
      
      return response;
    }
    
    // Return offline error response
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Data unavailable offline',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// Handle static requests with cache-first strategy
async function handleStaticRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Try network if not in cache
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses for static resources
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) {
        return offlineResponse;
      }
    }
    
    throw error;
  }
}

// Background sync for offline mutations
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-mutations') {
    event.waitUntil(syncMutations());
  }
});

// Sync queued mutations when back online
async function syncMutations() {
  try {
    // Get stored offline mutations from IndexedDB
    const mutations = await getStoredMutations();
    
    for (const mutation of mutations) {
      try {
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: mutation.headers,
          body: mutation.body,
        });
        
        if (response.ok) {
          // Remove successful mutation from storage
          await removeMutation(mutation.id);
          
          // Notify client about successful sync
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'MUTATION_SYNCED',
                mutation: mutation,
                response: response.clone(),
              });
            });
          });
        }
      } catch (error) {
        console.log('[SW] Failed to sync mutation:', mutation.id, error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// IndexedDB helpers for storing offline mutations
async function getStoredMutations() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineMutations', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['mutations'], 'readonly');
      const store = transaction.objectStore('mutations');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('mutations')) {
        db.createObjectStore('mutations', { keyPath: 'id' });
      }
    };
  });
}

async function removeMutation(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineMutations', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['mutations'], 'readwrite');
      const store = transaction.objectStore('mutations');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
}

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  const { type, data } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'QUEUE_MUTATION':
      queueMutation(data);
      break;
      
    case 'CLEAR_CACHE':
      clearAllCaches();
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Queue mutation for later sync
async function queueMutation(mutation) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('OfflineMutations', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['mutations'], 'readwrite');
      const store = transaction.objectStore('mutations');
      
      const mutationWithId = {
        ...mutation,
        id: Date.now() + Math.random(),
        timestamp: Date.now(),
      };
      
      const addRequest = store.add(mutationWithId);
      addRequest.onsuccess = () => resolve(mutationWithId.id);
      addRequest.onerror = () => reject(addRequest.error);
    };
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('mutations')) {
        db.createObjectStore('mutations', { keyPath: 'id' });
      }
    };
  });
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

// Periodic cache cleanup
setInterval(async () => {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const cachedAt = response.headers.get('sw-cached-at');
      
      if (cachedAt) {
        const age = Date.now() - parseInt(cachedAt);
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        if (age > maxAge) {
          await cache.delete(request);
          console.log('[SW] Removed expired cache:', request.url);
        }
      }
    }
  } catch (error) {
    console.log('[SW] Cache cleanup failed:', error);
  }
}, 5 * 60 * 1000); // Run every 5 minutes