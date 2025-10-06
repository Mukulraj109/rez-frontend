import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

/**
 * AsyncStorage Service
 * Centralized service for all AsyncStorage operations
 */

// Check if we're running in a browser environment (SSR safe)
const isClient = typeof window !== 'undefined';

// Storage keys
export const STORAGE_KEYS = {
  CART: 'shopping_cart',
  CART_OFFLINE_QUEUE: 'cart_offline_queue',
  WISHLIST: 'wishlist',
  RECENTLY_VIEWED: 'recently_viewed',
  SEARCH_HISTORY: 'search_history',
  USER_PREFERENCES: 'user_preferences',
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  CART_LAST_SYNC: 'cart_last_sync',
  OFFLINE_MODE: 'offline_mode',
} as const;

class AsyncStorageService {
  /**
   * Save data to AsyncStorage
   */
  async save<T>(key: string, data: T): Promise<void> {
    if (!isClient) {
      console.warn('💾 [STORAGE] Skipping save during SSR:', key);
      return;
    }
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
      console.log('💾 [STORAGE] Saved data to:', key);
    } catch (error) {
      console.error('💾 [STORAGE] Failed to save data:', key, error);
      throw new Error(`Failed to save data to ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get data from AsyncStorage
   */
  async get<T>(key: string): Promise<T | null> {
    if (!isClient) {
      console.warn('💾 [STORAGE] Skipping get during SSR:', key);
      return null;
    }
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      if (jsonValue === null) {
        return null;
      }
      const data = JSON.parse(jsonValue) as T;
      console.log('💾 [STORAGE] Retrieved data from:', key);
      return data;
    } catch (error) {
      console.error('💾 [STORAGE] Failed to get data:', key, error);
      return null;
    }
  }

  /**
   * Remove data from AsyncStorage
   */
  async remove(key: string): Promise<void> {
    if (!isClient) {
      console.warn('💾 [STORAGE] Skipping remove during SSR:', key);
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
      console.log('💾 [STORAGE] Removed data from:', key);
    } catch (error) {
      console.error('💾 [STORAGE] Failed to remove data:', key, error);
      throw new Error(`Failed to remove data from ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clear all AsyncStorage data
   */
  async clear(): Promise<void> {
    if (!isClient) {
      console.warn('💾 [STORAGE] Skipping clear during SSR');
      return;
    }
    try {
      await AsyncStorage.clear();
      console.log('💾 [STORAGE] Cleared all storage');
    } catch (error) {
      console.error('💾 [STORAGE] Failed to clear storage:', error);
      throw new Error(`Failed to clear storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get all keys in AsyncStorage
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys;
    } catch (error) {
      console.error('💾 [STORAGE] Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Get multiple items at once
   */
  async multiGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const result = await AsyncStorage.multiGet(keys);
      const data: Record<string, T | null> = {};

      result.forEach(([key, value]) => {
        if (value !== null) {
          try {
            data[key] = JSON.parse(value) as T;
          } catch {
            data[key] = null;
          }
        } else {
          data[key] = null;
        }
      });

      return data;
    } catch (error) {
      console.error('💾 [STORAGE] Failed to get multiple items:', error);
      return {};
    }
  }

  /**
   * Save multiple items at once
   */
  async multiSave(items: Array<[string, any]>): Promise<void> {
    try {
      const stringifiedItems = items.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]) as Array<[string, string]>;

      await AsyncStorage.multiSet(stringifiedItems);
      console.log('💾 [STORAGE] Saved multiple items:', items.map(([key]) => key));
    } catch (error) {
      console.error('💾 [STORAGE] Failed to save multiple items:', error);
      throw new Error(`Failed to save multiple items: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      console.error('💾 [STORAGE] Failed to check if key exists:', key, error);
      return false;
    }
  }

  // Specialized methods for common operations

  /**
   * Save cart data
   */
  async saveCart(cart: any): Promise<void> {
    await this.save(STORAGE_KEYS.CART, cart);
    await this.save(STORAGE_KEYS.CART_LAST_SYNC, new Date().toISOString());
  }

  /**
   * Get cart data
   */
  async getCart(): Promise<any | null> {
    return this.get(STORAGE_KEYS.CART);
  }

  /**
   * Get last cart sync time
   */
  async getCartLastSync(): Promise<string | null> {
    return this.get(STORAGE_KEYS.CART_LAST_SYNC);
  }

  /**
   * Save offline queue
   */
  async saveOfflineQueue(queue: any[]): Promise<void> {
    await this.save(STORAGE_KEYS.CART_OFFLINE_QUEUE, queue);
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue(): Promise<any[]> {
    const queue = await this.get<any[]>(STORAGE_KEYS.CART_OFFLINE_QUEUE);
    return queue || [];
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue(): Promise<void> {
    await this.remove(STORAGE_KEYS.CART_OFFLINE_QUEUE);
  }

  /**
   * Save user preferences
   */
  async saveUserPreferences(preferences: any): Promise<void> {
    await this.save(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  /**
   * Get user preferences
   */
  async getUserPreferences(): Promise<any | null> {
    return this.get(STORAGE_KEYS.USER_PREFERENCES);
  }

  /**
   * Save recently viewed products
   */
  async saveRecentlyViewed(products: any[]): Promise<void> {
    // Keep only last 20 items
    const limited = products.slice(0, 20);
    await this.save(STORAGE_KEYS.RECENTLY_VIEWED, limited);
  }

  /**
   * Get recently viewed products
   */
  async getRecentlyViewed(): Promise<any[]> {
    const items = await this.get<any[]>(STORAGE_KEYS.RECENTLY_VIEWED);
    return items || [];
  }

  /**
   * Add to recently viewed
   */
  async addRecentlyViewed(product: any): Promise<void> {
    const current = await this.getRecentlyViewed();
    // Remove if already exists
    const filtered = current.filter(p => p.id !== product.id);
    // Add to beginning
    const updated = [product, ...filtered].slice(0, 20);
    await this.saveRecentlyViewed(updated);
  }

  /**
   * Save search history
   */
  async saveSearchHistory(searches: string[]): Promise<void> {
    // Keep only last 10 searches
    const limited = searches.slice(0, 10);
    await this.save(STORAGE_KEYS.SEARCH_HISTORY, limited);
  }

  /**
   * Get search history
   */
  async getSearchHistory(): Promise<string[]> {
    const history = await this.get<string[]>(STORAGE_KEYS.SEARCH_HISTORY);
    return history || [];
  }

  /**
   * Add to search history
   */
  async addSearchHistory(query: string): Promise<void> {
    const current = await this.getSearchHistory();
    // Remove if already exists
    const filtered = current.filter(q => q !== query);
    // Add to beginning
    const updated = [query, ...filtered].slice(0, 10);
    await this.saveSearchHistory(updated);
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    await this.remove(STORAGE_KEYS.SEARCH_HISTORY);
  }

  /**
   * Save wishlist
   */
  async saveWishlist(wishlist: any[]): Promise<void> {
    await this.save(STORAGE_KEYS.WISHLIST, wishlist);
  }

  /**
   * Get wishlist
   */
  async getWishlist(): Promise<any[]> {
    const wishlist = await this.get<any[]>(STORAGE_KEYS.WISHLIST);
    return wishlist || [];
  }

  /**
   * Set offline mode status
   */
  async setOfflineMode(isOffline: boolean): Promise<void> {
    await this.save(STORAGE_KEYS.OFFLINE_MODE, isOffline);
  }

  /**
   * Get offline mode status
   */
  async getOfflineMode(): Promise<boolean> {
    const mode = await this.get<boolean>(STORAGE_KEYS.OFFLINE_MODE);
    return mode || false;
  }

  /**
   * Clear all user-specific data (for logout)
   */
  async clearUserData(): Promise<void> {
    try {
      await this.multiSave([
        [STORAGE_KEYS.CART, []],
        [STORAGE_KEYS.CART_OFFLINE_QUEUE, []],
        [STORAGE_KEYS.WISHLIST, []],
        [STORAGE_KEYS.USER_DATA, null],
        [STORAGE_KEYS.AUTH_TOKEN, null],
      ]);
      console.log('💾 [STORAGE] Cleared user data');
    } catch (error) {
      console.error('💾 [STORAGE] Failed to clear user data:', error);
    }
  }

  /**
   * Get storage size estimate (for debugging)
   */
  async getStorageSize(): Promise<{ totalKeys: number; estimatedSize: string }> {
    try {
      const keys = await this.getAllKeys();
      const values = await AsyncStorage.multiGet(keys);

      let totalSize = 0;
      values.forEach(([_, value]) => {
        if (value) {
          totalSize += value.length;
        }
      });

      const sizeInKB = (totalSize / 1024).toFixed(2);
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);

      return {
        totalKeys: keys.length,
        estimatedSize: totalSize < 1024 * 1024
          ? `${sizeInKB} KB`
          : `${sizeInMB} MB`
      };
    } catch (error) {
      console.error('💾 [STORAGE] Failed to get storage size:', error);
      return { totalKeys: 0, estimatedSize: '0 KB' };
    }
  }
}

export default new AsyncStorageService();
