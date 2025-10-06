import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import asyncStorageService from '@/services/asyncStorageService';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOfflineMode: boolean;
}

/**
 * Hook to track network connectivity status
 */
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
    type: null,
    isOfflineMode: false
  });

  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Load offline mode from storage
    const loadOfflineMode = async () => {
      const offlineMode = await asyncStorageService.getOfflineMode();
      setNetworkStatus(prev => ({ ...prev, isOfflineMode: offlineMode }));
    };

    loadOfflineMode();

    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('🌐 [NETWORK] Connection type:', state.type);
      console.log('🌐 [NETWORK] Is connected?', state.isConnected);
      console.log('🌐 [NETWORK] Is internet reachable?', state.isInternetReachable);

      const isConnected = state.isConnected ?? false;
      const isInternetReachable = state.isInternetReachable;

      setNetworkStatus(prev => ({
        ...prev,
        isConnected,
        isInternetReachable,
        type: state.type
      }));

      // Track if we were offline and are now online
      if (!prev.isConnected && isConnected) {
        console.log('🌐 [NETWORK] Back online!');
        setWasOffline(true);
      } else if (prev.isConnected && !isConnected) {
        console.log('🌐 [NETWORK] Gone offline!');
      }
    });

    // Initial check
    NetInfo.fetch().then(state => {
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
        type: state.type
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Reset the wasOffline flag
   */
  const resetWasOffline = () => {
    setWasOffline(false);
  };

  /**
   * Toggle offline mode manually
   */
  const toggleOfflineMode = async (forceOffline?: boolean) => {
    const newOfflineMode = forceOffline ?? !networkStatus.isOfflineMode;
    await asyncStorageService.setOfflineMode(newOfflineMode);
    setNetworkStatus(prev => ({ ...prev, isOfflineMode: newOfflineMode }));
    console.log('🌐 [NETWORK] Offline mode:', newOfflineMode ? 'ON' : 'OFF');
  };

  /**
   * Check if we're effectively offline (no connection or offline mode enabled)
   */
  const isOffline = () => {
    return !networkStatus.isConnected || networkStatus.isOfflineMode;
  };

  /**
   * Check if we're online
   */
  const isOnline = () => {
    return networkStatus.isConnected && !networkStatus.isOfflineMode;
  };

  /**
   * Get connection quality
   */
  const getConnectionQuality = (): 'excellent' | 'good' | 'poor' | 'offline' => {
    if (!networkStatus.isConnected) {
      return 'offline';
    }

    switch (networkStatus.type) {
      case 'wifi':
        return 'excellent';
      case 'cellular':
        // Could be enhanced to check for 4G/5G vs 3G
        return 'good';
      case 'ethernet':
        return 'excellent';
      default:
        return 'poor';
    }
  };

  /**
   * Wait for network to be available
   */
  const waitForNetwork = (timeout: number = 5000): Promise<boolean> => {
    return new Promise((resolve) => {
      if (isOnline()) {
        resolve(true);
        return;
      }

      const timeoutId = setTimeout(() => {
        resolve(false);
      }, timeout);

      const unsubscribe = NetInfo.addEventListener(state => {
        if (state.isConnected) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  };

  return {
    // Network status
    networkStatus,
    isConnected: networkStatus.isConnected,
    isInternetReachable: networkStatus.isInternetReachable,
    connectionType: networkStatus.type,
    isOfflineMode: networkStatus.isOfflineMode,

    // Computed states
    isOffline: isOffline(),
    isOnline: isOnline(),
    wasOffline,
    connectionQuality: getConnectionQuality(),

    // Actions
    resetWasOffline,
    toggleOfflineMode,
    waitForNetwork
  };
}

export default useNetworkStatus;
