import asyncStorageService from './asyncStorageService';
import pako from 'pako';

/**
 * Cache Service
 * Generic caching service with TTL, compression, and intelligent eviction
 */

export interface CacheEntry<T = any> {
  key: string;
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  size: number; // Estimated size in bytes
  priority: 'low' | 'medium' | 'high' | 'critical';
  compressed: boolean;
  version: string; // For cache migration
  accessCount: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 1 hour)
  priority?: 'low' | 'medium' | 'high' | 'critical';
  compress?: boolean; // Compress large data (default: true for data > 10KB)
  version?: string; // Cache version for migration
}

export interface CacheStats {
  totalEntries: number;
  totalSize: string;
  hitRate: number;
  oldestEntry: string | null;
  newestEntry: string | null;
  entriesByPriority: Record<string, number>;
}

const CACHE_PREFIX = 'cache_';
const CACHE_INDEX_KEY = 'cache_index';
const DEFAULT_TTL = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_SIZE = 10 * 1024 * 1024; // 10MB
const COMPRESSION_THRESHOLD = 10 * 1024; // 10KB
const CURRENT_CACHE_VERSION = '1.0.0';

class CacheService {
  private cacheIndex: Map<string, CacheEntry> = new Map();
  private hits = 0;
  private misses = 0;
  private initialized = false;
  private initializing = false; // Prevent multiple initialization attempts

  constructor() {
    this.initialize();
  }

  /**
   * Initialize cache service
   */
  private async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;
    
    this.initializing = true;

    try {
      console.log('💾 [CACHE] Initializing cache service...');

      // Load cache index
      const index = await asyncStorageService.get<Record<string, CacheEntry>>(CACHE_INDEX_KEY);

      if (index) {
        this.cacheIndex = new Map(Object.entries(index));
        console.log(`💾 [CACHE] Loaded ${this.cacheIndex.size} entries from cache index`);

        // Clean up expired entries
        await this.cleanupExpired();

        // Check cache size and evict if necessary
        await this.evictIfNeeded();
      }

      this.initialized = true;
      this.initializing = false;
      console.log('✅ [CACHE] Cache service initialized');
    } catch (error) {
      console.error('❌ [CACHE] Failed to initialize cache service:', error);
      this.cacheIndex = new Map();
      this.initialized = true;
      this.initializing = false;
    }
  }

  /**
   * Wait for initialization
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Generate cache key
   */
  private getCacheKey(key: string): string {
    return `${CACHE_PREFIX}${key}`;
  }

  /**
   * Save cache index to storage
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const indexObject = Object.fromEntries(this.cacheIndex.entries());
      await asyncStorageService.save(CACHE_INDEX_KEY, indexObject);
    } catch (error) {
      console.error('❌ [CACHE] Failed to save cache index:', error);
    }
  }

  /**
   * Compress data using pako
   */
  private compress(data: any): string {
    try {
      const jsonString = JSON.stringify(data);
      const compressed = pako.deflate(jsonString, { level: 6 });
      return Buffer.from(compressed).toString('base64');
    } catch (error) {
      console.error('❌ [CACHE] Compression failed:', error);
      return JSON.stringify(data);
    }
  }

  /**
   * Decompress data using pako
   */
  private decompress(compressedData: string): any {
    try {
      const buffer = Buffer.from(compressedData, 'base64');
      const decompressed = pako.inflate(buffer, { to: 'string' });
      return JSON.parse(decompressed);
    } catch (error) {
      console.error('❌ [CACHE] Decompression failed:', error);
      return JSON.parse(compressedData);
    }
  }

  /**
   * Estimate data size in bytes
   */
  private estimateSize(data: any): number {
    const jsonString = JSON.stringify(data);
    return new Blob([jsonString]).size;
  }

  /**
   * Get total cache size
   */
  private getTotalCacheSize(): number {
    let total = 0;
    this.cacheIndex.forEach(entry => {
      total += entry.size;
    });
    return total;
  }

  /**
   * Check if entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    return now - entry.timestamp > entry.ttl;
  }

  /**
   * Clean up expired entries
   */
  private async cleanupExpired(): Promise<number> {
    const expiredKeys: string[] = [];

    this.cacheIndex.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expiredKeys.push(key);
      }
    });

    if (expiredKeys.length > 0) {
      console.log(`💾 [CACHE] Cleaning up ${expiredKeys.length} expired entries`);

      for (const key of expiredKeys) {
        await this.remove(key);
      }
    }

    return expiredKeys.length;
  }

  /**
   * Evict entries if cache size exceeds limit
   */
  private async evictIfNeeded(): Promise<void> {
    const totalSize = this.getTotalCacheSize();

    if (totalSize <= MAX_CACHE_SIZE) {
      return;
    }

    console.log(`💾 [CACHE] Cache size (${this.formatSize(totalSize)}) exceeds limit, evicting entries...`);

    // Sort entries by priority and last accessed time
    const entries = Array.from(this.cacheIndex.entries()).sort((a, b) => {
      const [, entryA] = a;
      const [, entryB] = b;

      // Priority order: low < medium < high < critical
      const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
      const priorityDiff = priorityOrder[entryA.priority] - priorityOrder[entryB.priority];

      if (priorityDiff !== 0) {
        return priorityDiff; // Lower priority first
      }

      // If same priority, evict least recently accessed
      return entryA.lastAccessed - entryB.lastAccessed;
    });

    // Evict entries until we're under 80% of max size
    const targetSize = MAX_CACHE_SIZE * 0.8;
    let currentSize = totalSize;
    let evicted = 0;

    for (const [key, entry] of entries) {
      if (currentSize <= targetSize) {
        break;
      }

      // Don't evict critical entries
      if (entry.priority === 'critical') {
        continue;
      }

      await this.remove(key);
      currentSize -= entry.size;
      evicted++;
    }

    console.log(`💾 [CACHE] Evicted ${evicted} entries, new size: ${this.formatSize(currentSize)}`);
  }

  /**
   * Format size in human-readable format
   */
  private formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  /**
   * Set cache entry
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    await this.ensureInitialized();

    try {
      const {
        ttl = DEFAULT_TTL,
        priority = 'medium',
        compress,
        version = CURRENT_CACHE_VERSION
      } = options;

      const estimatedSize = this.estimateSize(data);
      const shouldCompress = compress !== undefined ? compress : estimatedSize > COMPRESSION_THRESHOLD;

      let dataToStore: any;
      let actualSize: number;

      if (shouldCompress) {
        dataToStore = this.compress(data);
        actualSize = new Blob([dataToStore]).size;
      } else {
        dataToStore = data;
        actualSize = estimatedSize;
      }

      const cacheEntry: CacheEntry<T> = {
        key,
        data: dataToStore,
        timestamp: Date.now(),
        ttl,
        size: actualSize,
        priority,
        compressed: shouldCompress,
        version,
        accessCount: 0,
        lastAccessed: Date.now()
      };

      // Save to storage
      const cacheKey = this.getCacheKey(key);
      await asyncStorageService.save(cacheKey, cacheEntry);

      // Update index
      this.cacheIndex.set(key, cacheEntry);
      await this.saveCacheIndex();

      // Check if we need to evict
      await this.evictIfNeeded();

      console.log(`💾 [CACHE] Set entry: ${key} (${this.formatSize(actualSize)}, ${shouldCompress ? 'compressed' : 'uncompressed'})`);
    } catch (error) {
      console.error(`❌ [CACHE] Failed to set entry: ${key}`, error);
    }
  }

  /**
   * Get cache entry
   */
  async get<T>(key: string): Promise<T | null> {
    await this.ensureInitialized();

    try {
      // Check if entry exists in index
      const indexEntry = this.cacheIndex.get(key);

      if (!indexEntry) {
        this.misses++;
        console.log(`💾 [CACHE] Cache miss: ${key}`);
        return null;
      }

      // Check if expired
      if (this.isExpired(indexEntry)) {
        this.misses++;
        console.log(`💾 [CACHE] Entry expired: ${key}`);
        await this.remove(key);
        return null;
      }

      // Load from storage
      const cacheKey = this.getCacheKey(key);
      const cacheEntry = await asyncStorageService.get<CacheEntry<T>>(cacheKey);

      if (!cacheEntry) {
        this.misses++;
        console.log(`💾 [CACHE] Entry not found in storage: ${key}`);
        this.cacheIndex.delete(key);
        await this.saveCacheIndex();
        return null;
      }

      // Check version compatibility
      if (cacheEntry.version !== CURRENT_CACHE_VERSION) {
        console.log(`💾 [CACHE] Version mismatch: ${key}, removing`);
        await this.remove(key);
        return null;
      }

      // Update access stats
      cacheEntry.accessCount++;
      cacheEntry.lastAccessed = Date.now();
      this.cacheIndex.set(key, cacheEntry);
      await this.saveCacheIndex();

      // Decompress if needed
      let data: T;
      if (cacheEntry.compressed) {
        data = this.decompress(cacheEntry.data as string) as T;
      } else {
        data = cacheEntry.data as T;
      }

      this.hits++;
      console.log(`💾 [CACHE] Cache hit: ${key} (accessed ${cacheEntry.accessCount} times)`);

      return data;
    } catch (error) {
      this.misses++;
      console.error(`❌ [CACHE] Failed to get entry: ${key}`, error);
      return null;
    }
  }

  /**
   * Check if cache has entry
   */
  async has(key: string): Promise<boolean> {
    await this.ensureInitialized();

    const indexEntry = this.cacheIndex.get(key);

    if (!indexEntry) {
      return false;
    }

    if (this.isExpired(indexEntry)) {
      await this.remove(key);
      return false;
    }

    return true;
  }

  /**
   * Remove cache entry
   */
  async remove(key: string): Promise<void> {
    await this.ensureInitialized();

    try {
      const cacheKey = this.getCacheKey(key);
      await asyncStorageService.remove(cacheKey);
      this.cacheIndex.delete(key);
      await this.saveCacheIndex();
      console.log(`💾 [CACHE] Removed entry: ${key}`);
    } catch (error) {
      console.error(`❌ [CACHE] Failed to remove entry: ${key}`, error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.ensureInitialized();

    try {
      console.log('💾 [CACHE] Clearing all cache entries...');

      // Remove all cache entries from storage
      const keys = Array.from(this.cacheIndex.keys());
      for (const key of keys) {
        const cacheKey = this.getCacheKey(key);
        await asyncStorageService.remove(cacheKey);
      }

      // Clear index
      this.cacheIndex.clear();
      await asyncStorageService.remove(CACHE_INDEX_KEY);

      // Reset stats
      this.hits = 0;
      this.misses = 0;

      console.log('✅ [CACHE] Cache cleared');
    } catch (error) {
      console.error('❌ [CACHE] Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired entries
   */
  async clearExpired(): Promise<number> {
    await this.ensureInitialized();
    return await this.cleanupExpired();
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<CacheStats> {
    await this.ensureInitialized();

    const entries = Array.from(this.cacheIndex.values());
    const totalSize = this.getTotalCacheSize();

    const entriesByPriority = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    let oldestTimestamp = Infinity;
    let newestTimestamp = 0;
    let oldestKey: string | null = null;
    let newestKey: string | null = null;

    entries.forEach(entry => {
      entriesByPriority[entry.priority]++;

      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = entry.key;
      }

      if (entry.timestamp > newestTimestamp) {
        newestTimestamp = entry.timestamp;
        newestKey = entry.key;
      }
    });

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      totalEntries: this.cacheIndex.size,
      totalSize: this.formatSize(totalSize),
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry: oldestKey,
      newestEntry: newestKey,
      entriesByPriority
    };
  }

  /**
   * Get all cache keys
   */
  async getKeys(): Promise<string[]> {
    await this.ensureInitialized();
    return Array.from(this.cacheIndex.keys());
  }

  /**
   * Stale-while-revalidate pattern
   * Returns cached data immediately and optionally revalidates in background
   */
  async getWithRevalidation<T>(
    key: string,
    fetchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    await this.ensureInitialized();

    // Try to get cached data
    const cachedData = await this.get<T>(key);

    if (cachedData) {
      // Return cached data immediately
      console.log(`💾 [CACHE] Returning cached data for: ${key}`);

      // Check if cache is stale (older than 50% of TTL)
      const indexEntry = this.cacheIndex.get(key);
      if (indexEntry) {
        const age = Date.now() - indexEntry.timestamp;
        const isStale = age > (indexEntry.ttl * 0.5);

        if (isStale) {
          // Revalidate in background
          console.log(`💾 [CACHE] Revalidating stale data for: ${key}`);
          fetchFn()
            .then(freshData => {
              this.set(key, freshData, options);
            })
            .catch(error => {
              console.error(`❌ [CACHE] Revalidation failed for: ${key}`, error);
            });
        }
      }

      return cachedData;
    }

    // No cached data, fetch fresh
    console.log(`💾 [CACHE] No cached data, fetching fresh for: ${key}`);
    const freshData = await fetchFn();
    await this.set(key, freshData, options);
    return freshData;
  }

  /**
   * Batch set multiple entries
   */
  async setMany(entries: Array<{ key: string; data: any; options?: CacheOptions }>): Promise<void> {
    await this.ensureInitialized();

    console.log(`💾 [CACHE] Setting ${entries.length} entries in batch`);

    for (const entry of entries) {
      await this.set(entry.key, entry.data, entry.options);
    }
  }

  /**
   * Batch get multiple entries
   */
  async getMany<T>(keys: string[]): Promise<Record<string, T | null>> {
    await this.ensureInitialized();

    const results: Record<string, T | null> = {};

    for (const key of keys) {
      results[key] = await this.get<T>(key);
    }

    return results;
  }

  /**
   * Get entries by priority
   */
  async getByPriority(priority: CacheEntry['priority']): Promise<string[]> {
    await this.ensureInitialized();

    const keys: string[] = [];

    this.cacheIndex.forEach((entry, key) => {
      if (entry.priority === priority) {
        keys.push(key);
      }
    });

    return keys;
  }

  /**
   * Update entry TTL
   */
  async updateTTL(key: string, newTTL: number): Promise<boolean> {
    await this.ensureInitialized();

    const indexEntry = this.cacheIndex.get(key);

    if (!indexEntry) {
      return false;
    }

    indexEntry.ttl = newTTL;
    this.cacheIndex.set(key, indexEntry);
    await this.saveCacheIndex();

    console.log(`💾 [CACHE] Updated TTL for ${key}: ${newTTL}ms`);
    return true;
  }

  /**
   * Migrate cache to new version
   */
  async migrate(migrationFn: (oldData: any) => any): Promise<void> {
    await this.ensureInitialized();

    console.log('💾 [CACHE] Starting cache migration...');

    const keys = Array.from(this.cacheIndex.keys());
    let migrated = 0;

    for (const key of keys) {
      const data = await this.get(key);

      if (data) {
        try {
          const migratedData = migrationFn(data);
          await this.set(key, migratedData, {
            version: CURRENT_CACHE_VERSION
          });
          migrated++;
        } catch (error) {
          console.error(`❌ [CACHE] Failed to migrate entry: ${key}`, error);
        }
      }
    }

    console.log(`✅ [CACHE] Migration complete: ${migrated}/${keys.length} entries migrated`);
  }
}

export default new CacheService();
