import { useState, useEffect, useCallback } from 'react';
import asyncStorageService from '@/services/asyncStorageService';
import offlineQueueService from '@/services/offlineQueueService';
import useNetworkStatus from './useNetworkStatus';

/**
 * Hook for offline cart functionality
 */
export function useOfflineCart() {
  const { isOnline, wasOffline, resetWasOffline } = useNetworkStatus();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [pendingOperations, setPendingOperations] = useState(0);

  // Load last sync time on mount
  useEffect(() => {
    loadLastSyncTime();
    updatePendingCount();
  }, []);

  // Auto-sync when coming back online
  useEffect(() => {
    if (wasOffline && isOnline) {
      console.log('🔄 [OFFLINE CART] Connection restored, auto-syncing...');
      syncCart();
      resetWasOffline();
    }
  }, [wasOffline, isOnline]);

  // Update pending operations count
  const updatePendingCount = useCallback(() => {
    const count = offlineQueueService.getPendingCount();
    setPendingOperations(count);
  }, []);

  // Subscribe to queue changes
  useEffect(() => {
    const interval = setInterval(() => {
      updatePendingCount();
    }, 1000);

    return () => clearInterval(interval);
  }, [updatePendingCount]);

  /**
   * Load last sync time from storage
   */
  const loadLastSyncTime = async () => {
    try {
      const syncTime = await asyncStorageService.getCartLastSync();
      setLastSyncTime(syncTime);
    } catch (error) {
      console.error('🔄 [OFFLINE CART] Failed to load last sync time:', error);
    }
  };

  /**
   * Sync cart with server
   */
  const syncCart = async (): Promise<boolean> => {
    if (isSyncing) {
      console.log('🔄 [OFFLINE CART] Already syncing');
      return false;
    }

    if (!isOnline) {
      console.log('🔄 [OFFLINE CART] Cannot sync while offline');
      setSyncError('No internet connection');
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log('🔄 [OFFLINE CART] Starting sync...');

      // Process offline queue
      const result = await offlineQueueService.processQueue();

      if (result.success) {
        console.log('🔄 [OFFLINE CART] Sync successful');
        const now = new Date().toISOString();
        setLastSyncTime(now);
        await asyncStorageService.save('cart_last_sync', now);
        updatePendingCount();
        return true;
      } else {
        console.error('🔄 [OFFLINE CART] Sync failed:', result);
        setSyncError(`Failed to sync ${result.failed} operations`);
        updatePendingCount();
        return false;
      }
    } catch (error) {
      console.error('🔄 [OFFLINE CART] Sync error:', error);
      setSyncError(error instanceof Error ? error.message : 'Sync failed');
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Get queue status
   */
  const getQueueStatus = useCallback(() => {
    return offlineQueueService.getQueueStatus();
  }, []);

  /**
   * Clear sync error
   */
  const clearSyncError = useCallback(() => {
    setSyncError(null);
  }, []);

  /**
   * Retry failed operations
   */
  const retryFailedOperations = async (): Promise<void> => {
    if (!isOnline) {
      setSyncError('No internet connection');
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      await offlineQueueService.retryFailedOperations();
      updatePendingCount();
    } catch (error) {
      console.error('🔄 [OFFLINE CART] Retry failed:', error);
      setSyncError(error instanceof Error ? error.message : 'Retry failed');
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * Get time since last sync in human-readable format
   */
  const getTimeSinceSync = useCallback((): string | null => {
    if (!lastSyncTime) {
      return null;
    }

    const now = new Date();
    const lastSync = new Date(lastSyncTime);
    const diffMs = now.getTime() - lastSync.getTime();

    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
    }
  }, [lastSyncTime]);

  /**
   * Check if sync is needed
   */
  const needsSync = useCallback((): boolean => {
    return pendingOperations > 0;
  }, [pendingOperations]);

  /**
   * Get sync status message
   */
  const getSyncStatusMessage = useCallback((): string => {
    if (isSyncing) {
      return 'Syncing...';
    }

    if (syncError) {
      return `Sync error: ${syncError}`;
    }

    if (!isOnline) {
      return 'Offline';
    }

    if (pendingOperations > 0) {
      return `${pendingOperations} pending operation${pendingOperations > 1 ? 's' : ''}`;
    }

    const timeSince = getTimeSinceSync();
    if (timeSince) {
      return `Last synced ${timeSince}`;
    }

    return 'Not synced yet';
  }, [isSyncing, syncError, isOnline, pendingOperations, getTimeSinceSync]);

  return {
    // Sync state
    isSyncing,
    syncError,
    lastSyncTime,
    pendingOperations,

    // Computed states
    needsSync: needsSync(),
    timeSinceSync: getTimeSinceSync(),
    syncStatusMessage: getSyncStatusMessage(),

    // Actions
    syncCart,
    retryFailedOperations,
    clearSyncError,
    getQueueStatus,
    updatePendingCount
  };
}

export default useOfflineCart;
