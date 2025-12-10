/**
 * useFavoriteStores Hook
 * Manages favorite stores (bookmarked + most visited) for "Shop at your Favorite" section
 */

import { useState, useEffect, useCallback } from 'react';
import asyncStorageService from '@/services/asyncStorageService';
import { FavoriteStore, FavoriteStoreInput, MIN_VISITS_TO_SHOW } from '@/types/favoriteStore.types';

interface UseFavoriteStoresReturn {
  favoriteStores: FavoriteStore[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (storeId: string) => Promise<boolean>;
  trackVisit: (store: FavoriteStoreInput) => Promise<void>;
  isFavorited: (storeId: string) => boolean;
  refresh: () => Promise<void>;
  clearAll: () => Promise<void>;
}

export function useFavoriteStores(): UseFavoriteStoresReturn {
  const [favoriteStores, setFavoriteStores] = useState<FavoriteStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load favorite stores on mount
  const loadFavoriteStores = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const stores = await asyncStorageService.getFavoriteStores();

      // Filter: show bookmarked stores + stores with minimum visits
      const filteredStores = stores.filter(
        store => store.isFavorited || store.visitCount >= MIN_VISITS_TO_SHOW
      );

      setFavoriteStores(filteredStores);
    } catch (err) {
      console.error('[useFavoriteStores] Failed to load:', err);
      setError('Failed to load favorite stores');
      setFavoriteStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFavoriteStores();
  }, [loadFavoriteStores]);

  // Toggle favorite (bookmark) status
  const toggleFavorite = useCallback(async (storeId: string): Promise<boolean> => {
    try {
      const newStatus = await asyncStorageService.toggleFavoriteStore(storeId);

      // Update local state immediately for optimistic UI
      setFavoriteStores(prev =>
        prev.map(store =>
          store.id === storeId
            ? { ...store, isFavorited: newStatus, addedAt: newStatus ? Date.now() : undefined }
            : store
        ).sort((a, b) => {
          // Re-sort after toggle
          if (a.isFavorited && !b.isFavorited) return -1;
          if (!a.isFavorited && b.isFavorited) return 1;
          if (a.isFavorited && b.isFavorited) {
            return (b.addedAt || 0) - (a.addedAt || 0);
          }
          return b.visitCount - a.visitCount;
        })
      );

      return newStatus;
    } catch (err) {
      console.error('[useFavoriteStores] Failed to toggle favorite:', err);
      return false;
    }
  }, []);

  // Track a store visit
  const trackVisit = useCallback(async (store: FavoriteStoreInput): Promise<void> => {
    try {
      await asyncStorageService.trackStoreVisit(store);
      // Reload to get updated data
      await loadFavoriteStores();
    } catch (err) {
      console.error('[useFavoriteStores] Failed to track visit:', err);
    }
  }, [loadFavoriteStores]);

  // Check if a store is favorited (from local state for performance)
  const isFavorited = useCallback((storeId: string): boolean => {
    const store = favoriteStores.find(s => s.id === storeId);
    return store?.isFavorited || false;
  }, [favoriteStores]);

  // Refresh data
  const refresh = useCallback(async () => {
    await loadFavoriteStores();
  }, [loadFavoriteStores]);

  // Clear all favorites
  const clearAll = useCallback(async () => {
    try {
      await asyncStorageService.clearFavoriteStores();
      setFavoriteStores([]);
    } catch (err) {
      console.error('[useFavoriteStores] Failed to clear:', err);
    }
  }, []);

  return {
    favoriteStores,
    isLoading,
    error,
    toggleFavorite,
    trackVisit,
    isFavorited,
    refresh,
    clearAll,
  };
}

export default useFavoriteStores;
