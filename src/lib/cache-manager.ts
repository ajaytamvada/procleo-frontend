// Advanced cache management system
import { QueryClient } from '@tanstack/react-query';
import { dbManager } from './indexeddb';

export interface CacheStrategy {
  name: string;
  shouldCache: (key: string, data: any) => boolean;
  ttl: number;
  priority: 'low' | 'medium' | 'high';
  maxSize?: number;
}

export interface CacheConfig {
  strategies: CacheStrategy[];
  maxTotalSize: number; // in bytes
  cleanupInterval: number; // in milliseconds
  enableCompression: boolean;
  enableEncryption: boolean;
}

export interface CacheMetrics {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  lastCleanup: number;
}

export class CacheManager {
  private config: CacheConfig;
  private metrics: CacheMetrics;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient, config: Partial<CacheConfig> = {}) {
    this.queryClient = queryClient;
    this.config = {
      strategies: [
        {
          name: 'api-data',
          shouldCache: key => key.startsWith('/api/'),
          ttl: 5 * 60 * 1000, // 5 minutes
          priority: 'medium',
        },
        {
          name: 'user-data',
          shouldCache: key => key.includes('user') || key.includes('profile'),
          ttl: 30 * 60 * 1000, // 30 minutes
          priority: 'high',
        },
        {
          name: 'static-content',
          shouldCache: key => key.includes('assets') || key.includes('images'),
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          priority: 'low',
          maxSize: 50 * 1024 * 1024, // 50MB
        },
        {
          name: 'dashboard-metrics',
          shouldCache: key =>
            key.includes('dashboard') || key.includes('metrics'),
          ttl: 2 * 60 * 1000, // 2 minutes
          priority: 'high',
        },
      ],
      maxTotalSize: 100 * 1024 * 1024, // 100MB
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      enableCompression: true,
      enableEncryption: false,
      ...config,
    };

    this.metrics = {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      totalHits: 0,
      totalMisses: 0,
      cacheSize: 0,
      lastCleanup: 0,
    };

    this.startCleanupInterval();
    this.initializeMetrics();
  }

  private async initializeMetrics(): Promise<void> {
    try {
      const stored = await dbManager.get<CacheMetrics>(
        'userPreferences',
        'cache-metrics'
      );
      if (stored) {
        this.metrics = { ...this.metrics, ...stored };
      }
    } catch (error) {
      console.warn('Failed to load cache metrics:', error);
    }
  }

  private async saveMetrics(): Promise<void> {
    try {
      await dbManager.put('userPreferences', {
        key: 'cache-metrics',
        value: this.metrics,
      });
    } catch (error) {
      console.warn('Failed to save cache metrics:', error);
    }
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupInterval);
  }

  private getStrategy(key: string): CacheStrategy | null {
    return (
      this.config.strategies.find(strategy =>
        strategy.shouldCache(key, null)
      ) || null
    );
  }

  private async compressData(data: any): Promise<string> {
    if (!this.config.enableCompression) {
      return JSON.stringify(data);
    }

    try {
      // Simple compression using built-in compression
      const jsonString = JSON.stringify(data);
      const compressed = await this.compress(jsonString);
      return compressed;
    } catch (error) {
      console.warn('Compression failed, storing uncompressed:', error);
      return JSON.stringify(data);
    }
  }

  private async decompressData(compressedData: string): Promise<any> {
    if (!this.config.enableCompression) {
      return JSON.parse(compressedData);
    }

    try {
      const decompressed = await this.decompress(compressedData);
      return JSON.parse(decompressed);
    } catch (error) {
      // Fallback to treating as uncompressed
      return JSON.parse(compressedData);
    }
  }

  private async compress(data: string): Promise<string> {
    // Simple compression using TextEncoder/Decoder with compression stream
    const stream = new CompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    // Start reading
    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    })();

    // Write data
    await writer.write(encoder.encode(data));
    await writer.close();

    await readPromise;

    // Combine chunks and convert to base64
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    return btoa(String.fromCharCode(...combined));
  }

  private async decompress(compressedData: string): Promise<string> {
    // Decode base64 and decompress
    const compressed = Uint8Array.from(atob(compressedData), c =>
      c.charCodeAt(0)
    );

    const stream = new DecompressionStream('gzip');
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    const decoder = new TextDecoder();
    const chunks: string[] = [];

    // Start reading
    const readPromise = (async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(decoder.decode(value, { stream: true }));
      }
    })();

    // Write compressed data
    await writer.write(compressed);
    await writer.close();

    await readPromise;

    return chunks.join('');
  }

  // Public API
  async set<T>(
    key: string,
    data: T,
    options: { ttl?: number; priority?: 'low' | 'medium' | 'high' } = {}
  ): Promise<boolean> {
    try {
      const strategy = this.getStrategy(key);
      if (!strategy && !options.ttl) {
        return false; // No strategy matches and no explicit TTL
      }

      const ttl = options.ttl || strategy?.ttl || 5 * 60 * 1000;
      const priority = options.priority || strategy?.priority || 'medium';

      const compressedData = await this.compressData(data);
      const size = new Blob([compressedData]).size;

      // Check size limits
      if (strategy?.maxSize && size > strategy.maxSize) {
        console.warn(`Data too large for cache strategy: ${strategy.name}`);
        return false;
      }

      await dbManager.setCache(key, compressedData, ttl, {
        strategy: strategy?.name,
        priority,
        size,
        compressed: this.config.enableCompression,
      });

      // Update cache size metric
      this.metrics.cacheSize += size;

      return true;
    } catch (error) {
      console.error('Cache set failed:', error);
      return false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      this.metrics.totalRequests++;

      const cached = await dbManager.getCache<string>(key);

      if (cached === null) {
        this.metrics.totalMisses++;
        this.updateHitRate();
        return null;
      }

      this.metrics.totalHits++;
      this.updateHitRate();

      const data = await this.decompressData(cached);
      return data as T;
    } catch (error) {
      console.error('Cache get failed:', error);
      this.metrics.totalMisses++;
      this.updateHitRate();
      return null;
    }
  }

  async invalidate(pattern: string): Promise<void> {
    try {
      await dbManager.invalidateCache(pattern);

      // Also invalidate React Query cache
      this.queryClient.invalidateQueries({
        predicate: query => {
          const queryKey = query.queryKey.join('/');
          return queryKey.includes(pattern);
        },
      });
    } catch (error) {
      console.error('Cache invalidation failed:', error);
    }
  }

  async clear(): Promise<void> {
    try {
      await dbManager.invalidateCache();
      this.queryClient.clear();
      this.metrics.cacheSize = 0;
    } catch (error) {
      console.error('Cache clear failed:', error);
    }
  }

  async performCleanup(): Promise<void> {
    try {
      // Clean expired cache
      const expiredCount = await dbManager.cleanExpiredCache();

      // Clean old files
      const oldFileCount = await dbManager.cleanOldFiles(
        7 * 24 * 60 * 60 * 1000
      ); // 7 days

      // Check total cache size and evict if necessary
      const dbSize = await dbManager.getDatabaseSize();
      const totalSize = dbSize.reduce((sum, store) => sum + store.size, 0);

      if (totalSize > this.config.maxTotalSize) {
        await this.performEviction(totalSize - this.config.maxTotalSize);
      }

      this.metrics.lastCleanup = Date.now();
      this.metrics.cacheSize = totalSize;

      await this.saveMetrics();

      console.log(
        `Cache cleanup: removed ${expiredCount} expired items, ${oldFileCount} old files`
      );
    } catch (error) {
      console.error('Cache cleanup failed:', error);
    }
  }

  private async performEviction(targetSize: number): Promise<void> {
    // Implement LRU eviction based on priority
    const allCacheItems = await dbManager.getAll<any>('cache');

    // Sort by priority (low first) then by timestamp (oldest first)
    const priorityOrder: Record<string, number> = {
      low: 1,
      medium: 2,
      high: 3,
    };
    const sortedItems = allCacheItems.sort((a: any, b: any) => {
      const aPriority = a.metadata?.priority || 'medium';
      const bPriority = b.metadata?.priority || 'medium';
      const priorityDiff =
        (priorityOrder[aPriority] || 2) - (priorityOrder[bPriority] || 2);
      if (priorityDiff !== 0) return priorityDiff;
      return (a.timestamp || 0) - (b.timestamp || 0);
    });

    let evictedSize = 0;
    for (const item of sortedItems) {
      if (evictedSize >= targetSize) break;

      await dbManager.delete('cache', item.id);
      evictedSize += item.metadata?.size || 0;
    }

    console.log(`Evicted ${evictedSize} bytes from cache`);
  }

  private updateHitRate(): void {
    this.metrics.hitRate =
      this.metrics.totalRequests > 0
        ? this.metrics.totalHits / this.metrics.totalRequests
        : 0;
    this.metrics.missRate = 1 - this.metrics.hitRate;
  }

  // Advanced caching strategies
  async warmCache(keys: string[]): Promise<void> {
    // Pre-populate cache with likely-to-be-requested data
    const promises = keys.map(async key => {
      try {
        // Check if data exists in React Query cache
        const data = this.queryClient.getQueryData<unknown>([key]);
        if (data !== undefined) {
          await this.set(key, data);
        }
      } catch (error) {
        console.warn(`Failed to warm cache for key: ${key}`, error);
      }
    });

    await Promise.all(promises);
  }

  async prefetchData(key: string, fetcher: () => Promise<any>): Promise<void> {
    // Check if data is already cached
    const cached = await this.get(key);
    if (cached) return;

    try {
      const data = await fetcher();
      await this.set(key, data);
    } catch (error) {
      console.warn(`Prefetch failed for key: ${key}`, error);
    }
  }

  async syncWithReactQuery(): Promise<void> {
    // Sync React Query cache with IndexedDB
    const queryCache = this.queryClient.getQueryCache();
    const queries = queryCache.getAll();

    for (const query of queries) {
      try {
        const key = query.queryKey.join('/');
        const data: unknown = query.state.data;

        if (data !== undefined && query.state.status === 'success') {
          await this.set(key, data);
        }
      } catch (error) {
        console.warn('Failed to sync query with IndexedDB:', error);
      }
    }
  }

  // Getters
  getMetrics(): CacheMetrics {
    return { ...this.metrics };
  }

  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Restart cleanup interval if changed
    if (newConfig.cleanupInterval && this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.startCleanupInterval();
    }
  }

  // Cleanup
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Export already handled by class declaration above
