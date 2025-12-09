// Cache management debug component
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  useCacheMetrics,
  useCacheManagement,
  useDataSync,
  useAdvancedCache,
} from '@/hooks/useAdvancedCache';
import { useOfflineSupport } from '@/hooks/useOffline';

interface DatabaseSizeInfo {
  store: string;
  count: number;
  size: number;
}

export function CacheManagerDebug() {
  const { metrics, refreshMetrics } = useCacheMetrics();
  const { clearCache, performCleanup, warmCache, getDatabaseSize, exportData } =
    useCacheManagement();
  const { isSyncing, lastSync, syncData, getStaleData, getPendingMutations } =
    useDataSync();
  const { isOnline, queuedMutations } = useOfflineSupport();

  const [dbSize, setDbSize] = useState<DatabaseSizeInfo[]>([]);
  const [pendingMutations, setPendingMutations] = useState<any[]>([]);
  const [staleData, setStaleData] = useState<any[]>([]);

  // Test cache functionality
  const {
    data: testData,
    isLoading: testLoading,
    refresh: refreshTest,
    invalidate: invalidateTest,
  } = useAdvancedCache(
    'test-cache-key',
    async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        timestamp: Date.now(),
        data: `Test data loaded at ${new Date().toLocaleTimeString()}`,
        random: Math.random(),
      };
    },
    {
      ttl: 30000, // 30 seconds
      priority: 'medium',
      backgroundRefresh: true,
    }
  );

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [size, pending, stale] = await Promise.all([
          getDatabaseSize(),
          getPendingMutations(),
          getStaleData(60 * 60 * 1000), // 1 hour
        ]);

        setDbSize(size);
        setPendingMutations(pending);
        setStaleData(stale);
      } catch (error) {
        console.error('Failed to load cache stats:', error);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [getDatabaseSize, getPendingMutations, getStaleData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const totalDbSize = dbSize.reduce((sum, store) => sum + store.size, 0);

  return (
    <div className='space-y-6 p-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-2xl font-bold'>Cache & Data Management</h2>
        <div className='flex items-center gap-2'>
          <Badge variant={isOnline ? 'success' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
          {isSyncing && <Badge variant='warning'>Syncing...</Badge>}
        </div>
      </div>

      {/* Cache Metrics */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Cache Metrics</h3>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {formatPercentage(metrics.hitRate)}
              </div>
              <div className='text-sm text-gray-600'>Hit Rate</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {metrics.totalRequests}
              </div>
              <div className='text-sm text-gray-600'>Total Requests</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-purple-600'>
                {formatBytes(metrics.cacheSize)}
              </div>
              <div className='text-sm text-gray-600'>Cache Size</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {metrics.lastCleanup
                  ? new Date(metrics.lastCleanup).toLocaleTimeString()
                  : 'Never'}
              </div>
              <div className='text-sm text-gray-600'>Last Cleanup</div>
            </div>
          </div>

          <div className='flex gap-2 flex-wrap'>
            <Button onClick={refreshMetrics} size='sm' variant='outline'>
              Refresh Metrics
            </Button>
            <Button onClick={performCleanup} size='sm' variant='outline'>
              Run Cleanup
            </Button>
            <Button onClick={clearCache} size='sm' variant='destructive'>
              Clear All Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Database Storage */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Database Storage</h3>
          <p className='text-sm text-gray-600'>
            Total Size: {formatBytes(totalDbSize)}
          </p>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {dbSize.map(store => (
              <div
                key={store.store}
                className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
              >
                <div>
                  <div className='font-medium capitalize'>
                    {store.store.replace(/([A-Z])/g, ' $1')}
                  </div>
                  <div className='text-sm text-gray-600'>
                    {store.count} items
                  </div>
                </div>
                <div className='text-right'>
                  <div className='font-medium'>{formatBytes(store.size)}</div>
                  <div className='text-sm text-gray-600'>
                    {totalDbSize > 0
                      ? formatPercentage(store.size / totalDbSize)
                      : '0%'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-4 flex gap-2'>
            <Button onClick={exportData} size='sm' variant='outline'>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Offline Operations */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Offline Operations</h3>
          <p className='text-sm text-gray-600'>
            {pendingMutations.length} pending mutations, {staleData.length}{' '}
            stale entities
          </p>
        </CardHeader>
        <CardContent className='space-y-4'>
          {/* Pending Mutations */}
          <div>
            <h4 className='font-medium mb-2'>
              Queued Mutations ({queuedMutations.length})
            </h4>
            <div className='space-y-2 max-h-40 overflow-y-auto'>
              {queuedMutations.slice(0, 5).map(mutation => (
                <div
                  key={mutation.id}
                  className='p-2 bg-yellow-50 rounded border-l-4 border-yellow-400'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <div className='font-medium text-sm'>
                        {mutation.description}
                      </div>
                      <div className='text-xs text-gray-600'>
                        {mutation.method} {mutation.url}
                      </div>
                    </div>
                    <Badge variant='warning' size='sm'>
                      Retry: {(mutation as any).retryCount || 0}
                    </Badge>
                  </div>
                </div>
              ))}
              {queuedMutations.length > 5 && (
                <div className='text-sm text-gray-600 text-center py-2'>
                  ... and {queuedMutations.length - 5} more
                </div>
              )}
            </div>
          </div>

          {/* Sync Controls */}
          <div className='flex gap-2 flex-wrap'>
            <Button
              onClick={syncData}
              disabled={!isOnline || isSyncing}
              size='sm'
            >
              {isSyncing ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              onClick={() =>
                warmCache(['dashboard', 'purchase-orders', 'user'])
              }
              size='sm'
              variant='outline'
            >
              Warm Cache
            </Button>
            {lastSync > 0 && (
              <div className='text-sm text-gray-600 flex items-center'>
                Last sync: {new Date(lastSync).toLocaleTimeString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Test Cache */}
      <Card>
        <CardHeader>
          <h3 className='text-lg font-semibold'>Cache Testing</h3>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <h4 className='font-medium mb-2'>Test Data</h4>
            {testLoading ? (
              <div className='p-4 bg-gray-50 rounded'>Loading...</div>
            ) : testData ? (
              <div className='p-4 bg-green-50 rounded'>
                <pre className='text-sm'>
                  {JSON.stringify(testData, null, 2)}
                </pre>
              </div>
            ) : (
              <div className='p-4 bg-red-50 rounded'>No data</div>
            )}
          </div>

          <div className='flex gap-2'>
            <Button onClick={refreshTest} size='sm' disabled={testLoading}>
              Refresh (Network)
            </Button>
            <Button onClick={invalidateTest} size='sm' variant='outline'>
              Invalidate Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CacheManagerDebug;
