import { useState, useCallback, useEffect } from 'react';
import { Store, storeSearchService } from '@/services/storeSearchService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_STORAGE_KEY = 'store_favorites';

interface UseStoreFavoritesReturn {
  favoriteStores: Store[];
  addToFavorites: (store: Store) => Promise<boolean>;
  removeFromFavorites: (storeId: string) => Promise<void>;
  isFavorite: (storeId: string) => boolean;
  toggleFavorite: (store: Store) => Promise<boolean>;
  loadFavoritesFromStorage: () => Promise<void>;
  saveFavoritesToStorage: () => Promise<void>;
  clearAllFavorites: () => Promise<void>;
}

export const useStoreFavorites = (): UseStoreFavoritesReturn => {
  const [favoriteStores, setFavoriteStores] = useState<Store[]>([]);

  const addToFavorites = useCallback(async (store: Store): Promise<boolean> => {
    // Check if store is already in favorites
    if (favoriteStores.some(s => s._id === store._id)) {
      return false; // Already in favorites
    }

    try {
      // Try to add to backend first
      const response = await storeSearchService.addToFavorites(store._id);
      if (response.success) {
        const newFavorites = [...favoriteStores, store];
        setFavoriteStores(newFavorites);
        
        // Save to local storage as backup
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to add to favorites:', error);
      // Fallback to local storage only
      const newFavorites = [...favoriteStores, store];
      setFavoriteStores(newFavorites);
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
      return true;
    }
  }, [favoriteStores]);

  const removeFromFavorites = useCallback(async (storeId: string): Promise<void> => {
    try {
      // Try to remove from backend first
      await storeSearchService.removeFromFavorites(storeId);
    } catch (error) {
      console.error('Failed to remove from favorites:', error);
    }

    const newFavorites = favoriteStores.filter(store => store._id !== storeId);
    setFavoriteStores(newFavorites);
    
    // Save to local storage
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);
    }
  }, [favoriteStores]);

  const isFavorite = useCallback((storeId: string): boolean => {
    return favoriteStores.some(store => store._id === storeId);
  }, [favoriteStores]);

  const toggleFavorite = useCallback(async (store: Store): Promise<boolean> => {
    try {
      const response = await storeSearchService.toggleFavorite(store._id);
      if (response.success) {
        if (response.data.isFavorited) {
          // Added to favorites
          const newFavorites = [...favoriteStores, store];
          setFavoriteStores(newFavorites);
          await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
          return true;
        } else {
          // Removed from favorites
          const newFavorites = favoriteStores.filter(s => s._id !== store._id);
          setFavoriteStores(newFavorites);
          await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(newFavorites));
          return false;
        }
      }
      return isFavorite(store._id);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Fallback to local logic
      if (isFavorite(store._id)) {
        await removeFromFavorites(store._id);
        return false;
      } else {
        const success = await addToFavorites(store);
        return success;
      }
    }
  }, [favoriteStores, isFavorite, addToFavorites, removeFromFavorites]);

  const loadFavoritesFromStorage = useCallback(async (): Promise<void> => {
    try {
      // Try to load from backend first
      const response = await storeSearchService.getUserFavorites();
      if (response.success) {
        const stores = response.data.favorites.map(fav => fav.store);
        setFavoriteStores(stores);
        await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(stores));
        return;
      }
    } catch (error) {
      console.error('Failed to load favorites from backend:', error);
    }

    // Fallback to local storage
    try {
      const storedFavorites = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        const parsedStores = JSON.parse(storedFavorites);
        setFavoriteStores(parsedStores);
      }
    } catch (error) {
      console.error('Failed to load favorites from storage:', error);
    }
  }, []);

  const saveFavoritesToStorage = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteStores));
    } catch (error) {
      console.error('Failed to save favorites to storage:', error);
    }
  }, [favoriteStores]);

  const clearAllFavorites = useCallback(async (): Promise<void> => {
    try {
      // Try to clear from backend first
      await storeSearchService.clearAllFavorites();
    } catch (error) {
      console.error('Failed to clear favorites from backend:', error);
    }

    setFavoriteStores([]);
    
    // Clear from local storage
    try {
      await AsyncStorage.removeItem(FAVORITES_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear favorites from storage:', error);
    }
  }, []);

  // Load favorites on mount
  useEffect(() => {
    loadFavoritesFromStorage();
  }, [loadFavoritesFromStorage]);

  return {
    favoriteStores,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleFavorite,
    loadFavoritesFromStorage,
    saveFavoritesToStorage,
    clearAllFavorites,
  };
};

export default useStoreFavorites;
