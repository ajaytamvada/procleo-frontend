// IndexedDB wrapper for advanced data persistence
export interface DBSchema {
  [storeName: string]: {
    key: any;
    value: any;
    indexes?: { [indexName: string]: any };
  };
}

export interface CacheItem<T = any> {
  id: string;
  data: T;
  timestamp: number;
  expiry?: number;
  metadata?: Record<string, any>;
}

export interface OfflineMutation {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
  retryCount: number;
  description: string;
  priority: 'low' | 'medium' | 'high';
  entityType?: string;
  entityId?: string;
}

export interface SyncStatus {
  id: string;
  entityType: string;
  entityId: string;
  lastSync: number;
  version: number;
  conflictResolution?: 'client' | 'server' | 'manual';
}

// Database configuration
const DB_NAME = 'AutoviticaP2PDB';
const DB_VERSION = 1;

const STORES: DBSchema = {
  cache: {
    key: 'id',
    value: 'CacheItem',
    indexes: {
      timestamp: 'timestamp',
      expiry: 'expiry',
    },
  },
  mutations: {
    key: 'id',
    value: 'OfflineMutation',
    indexes: {
      timestamp: 'timestamp',
      priority: 'priority',
      entityType: 'entityType',
    },
  },
  syncStatus: {
    key: 'id',
    value: 'SyncStatus',
    indexes: {
      entityType: 'entityType',
      lastSync: 'lastSync',
    },
  },
  userPreferences: {
    key: 'key',
    value: 'any',
  },
  fileCache: {
    key: 'url',
    value: 'Blob',
    indexes: {
      timestamp: 'timestamp',
    },
  },
};

export class IndexedDBManager {
  private db: IDBDatabase | null = null;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        Object.entries(STORES).forEach(([storeName, schema]) => {
          if (!db.objectStoreNames.contains(storeName)) {
            const store = db.createObjectStore(storeName, {
              keyPath: schema.key,
            });

            // Create indexes
            if (schema.indexes) {
              Object.entries(schema.indexes).forEach(([indexName, keyPath]) => {
                store.createIndex(indexName, keyPath);
              });
            }
          }
        });
      };
    });
  }

  private async getDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    return this.dbPromise!;
  }

  // Generic CRUD operations
  async put<T>(storeName: string, data: T): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, key: any): Promise<T | undefined> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, key: any): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Index-based queries
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getByIndexRange<T>(
    storeName: string,
    indexName: string,
    range: IDBKeyRange
  ): Promise<T[]> {
    const db = await this.getDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(range);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Cache-specific operations
  async setCache<T>(
    key: string,
    data: T,
    ttl?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    const cacheItem: CacheItem<T> = {
      id: key,
      data,
      timestamp: Date.now(),
      expiry: ttl ? Date.now() + ttl : undefined,
      metadata,
    };

    await this.put('cache', cacheItem);
  }

  async getCache<T>(key: string): Promise<T | null> {
    const item = await this.get<CacheItem<T>>('cache', key);

    if (!item) return null;

    // Check if expired
    if (item.expiry && Date.now() > item.expiry) {
      await this.delete('cache', key);
      return null;
    }

    return item.data;
  }

  async invalidateCache(pattern?: string): Promise<void> {
    if (!pattern) {
      await this.clear('cache');
      return;
    }

    const allItems = await this.getAll<CacheItem>('cache');
    const toDelete = allItems
      .filter(item => item.id.includes(pattern))
      .map(item => this.delete('cache', item.id));

    await Promise.all(toDelete);
  }

  async cleanExpiredCache(): Promise<number> {
    const now = Date.now();
    const expiredRange = IDBKeyRange.upperBound(now);
    const expiredItems = await this.getByIndexRange<CacheItem>(
      'cache',
      'expiry',
      expiredRange
    );

    const deletePromises = expiredItems.map(item =>
      this.delete('cache', item.id)
    );
    await Promise.all(deletePromises);

    return expiredItems.length;
  }

  // Mutation queue operations
  async queueMutation(
    mutation: Omit<OfflineMutation, 'id' | 'timestamp' | 'retryCount'>
  ): Promise<string> {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fullMutation: OfflineMutation = {
      ...mutation,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await this.put('mutations', fullMutation);
    return id;
  }

  async getMutationQueue(): Promise<OfflineMutation[]> {
    const mutations = await this.getAll<OfflineMutation>('mutations');
    return mutations.sort((a, b) => {
      // Sort by priority (high > medium > low) then by timestamp
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : a.timestamp - b.timestamp;
    });
  }

  async incrementMutationRetry(id: string): Promise<void> {
    const mutation = await this.get<OfflineMutation>('mutations', id);
    if (mutation) {
      mutation.retryCount += 1;
      await this.put('mutations', mutation);
    }
  }

  async removeMutation(id: string): Promise<void> {
    await this.delete('mutations', id);
  }

  // Sync status operations
  async updateSyncStatus(
    entityType: string,
    entityId: string,
    version: number
  ): Promise<void> {
    const syncStatus: SyncStatus = {
      id: `${entityType}:${entityId}`,
      entityType,
      entityId,
      lastSync: Date.now(),
      version,
    };

    await this.put('syncStatus', syncStatus);
  }

  async getSyncStatus(
    entityType: string,
    entityId: string
  ): Promise<SyncStatus | undefined> {
    return this.get<SyncStatus>('syncStatus', `${entityType}:${entityId}`);
  }

  async getStaleEntities(maxAge: number): Promise<SyncStatus[]> {
    const cutoff = Date.now() - maxAge;
    const cutoffRange = IDBKeyRange.upperBound(cutoff);
    return this.getByIndexRange<SyncStatus>(
      'syncStatus',
      'lastSync',
      cutoffRange
    );
  }

  // File cache operations
  async cacheFile(url: string, blob: Blob): Promise<void> {
    const fileItem = {
      url,
      blob,
      timestamp: Date.now(),
    };

    await this.put('fileCache', fileItem);
  }

  async getCachedFile(url: string): Promise<Blob | undefined> {
    const item = await this.get<{ url: string; blob: Blob; timestamp: number }>(
      'fileCache',
      url
    );
    return item?.blob;
  }

  async cleanOldFiles(maxAge: number): Promise<number> {
    const cutoff = Date.now() - maxAge;
    const oldFiles = await this.getByIndexRange<{
      url: string;
      timestamp: number;
    }>('fileCache', 'timestamp', IDBKeyRange.upperBound(cutoff));

    const deletePromises = oldFiles.map(file =>
      this.delete('fileCache', file.url)
    );
    await Promise.all(deletePromises);

    return oldFiles.length;
  }

  // Database management
  async getDatabaseSize(): Promise<
    { store: string; count: number; size: number }[]
  > {
    const results: { store: string; count: number; size: number }[] = [];

    for (const storeName of Object.keys(STORES)) {
      const items = await this.getAll(storeName);
      const size = new Blob([JSON.stringify(items)]).size;
      results.push({
        store: storeName,
        count: items.length,
        size,
      });
    }

    return results;
  }

  async exportData(): Promise<{ [storeName: string]: any[] }> {
    const exported: { [storeName: string]: any[] } = {};

    for (const storeName of Object.keys(STORES)) {
      exported[storeName] = await this.getAll(storeName);
    }

    return exported;
  }

  async importData(data: { [storeName: string]: any[] }): Promise<void> {
    for (const [storeName, items] of Object.entries(data)) {
      if (Object.keys(STORES).includes(storeName)) {
        await this.clear(storeName);
        for (const item of items) {
          await this.put(storeName, item);
        }
      }
    }
  }

  // Close database connection
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.dbPromise = null;
    }
  }
}

// Singleton instance
export const dbManager = new IndexedDBManager();
