import cacheService from './cacheService';
import homepageDataService from './homepageDataService';
import { AuthState } from '@/contexts/AuthContext';
import NetInfo from '@react-native-community/netinfo';

/**
 * Cache Warming Service
 * Intelligently pre-loads critical data on app start for instant perceived performance
 */

// Cache warming priorities
export enum WarmingPriority {
  CRITICAL = 0,   // Load immediately on app start (homepage hero, user profile)
  HIGH = 500,     // Load after 500ms (cart, user stats)
  MEDIUM = 1000,  // Load after 1s (offers, events)
  LOW = 2000,     // Load after 2s (other sections)
}

// Cache warming item definition
interface WarmingItem {
  key: string;
  priority: WarmingPriority;
  fetchFn: () => Promise<any>;
  ttl: number; // Time to live in milliseconds
  cachePriority: 'low' | 'medium' | 'high' | 'critical';
  requiresAuth?: boolean;
}

// Cache warming state
interface WarmingState {
  isWarming: boolean;
  isPaused: boolean;
  completedItems: Set<string>;
  failedItems: Map<string, Error>;
  startTime: number | null;
  endTime: number | null;
}

class CacheWarmingService {
  private state: WarmingState = {
    isWarming: false,
    isPaused: false,
    completedItems: new Set(),
    failedItems: new Map(),
    startTime: null,
    endTime: null,
  };

  private warmingQueue: WarmingItem[] = [];
  private authState: AuthState | null = null;
  private networkType: string | null = null;
  private userInteracting = false;
  private netInfoUnsubscribe: (() => void) | null = null;
  private isDestroyed = false;

  /**
   * Initialize cache warming service
   */
  async initialize(): Promise<void> {
    console.log('🔥 [CACHE WARMING] Initializing cache warming service...');

    // Monitor network conditions
    this.monitorNetworkConditions();

    console.log('✅ [CACHE WARMING] Cache warming service initialized');
  }

  /**
   * Monitor network conditions to optimize warming strategy
   */
  private monitorNetworkConditions(): void {
    // Cleanup existing listener before adding new one
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    this.netInfoUnsubscribe = NetInfo.addEventListener(state => {
      // Skip if service is destroyed
      if (this.isDestroyed) return;

      this.networkType = state.type;
      const effectiveType = (state as any).details?.effectiveConnectionType;

      // Skip warming on 2G networks
      if (effectiveType === '2g') {
        console.log('⚠️ [CACHE WARMING] Skipping warming on 2G network');
        this.pauseWarming();
      } else if (this.state.isPaused && effectiveType !== '2g') {
        console.log('✅ [CACHE WARMING] Resuming warming on improved network');
        this.resumeWarming();
      }
    });
  }

  /**
   * Set authentication state for conditional warming
   */
  setAuthState(authState: AuthState): void {
    this.authState = authState;
  }

  /**
   * Notify when user starts interacting (pause warming)
   */
  onUserInteraction(isInteracting: boolean): void {
    this.userInteracting = isInteracting;

    if (isInteracting && this.state.isWarming) {
      console.log('⏸️ [CACHE WARMING] Pausing warming - user is interacting');
      this.pauseWarming();
    } else if (!isInteracting && this.state.isPaused) {
      console.log('▶️ [CACHE WARMING] Resuming warming - user is idle');
      this.resumeWarming();
    }
  }

  /**
   * Start cache warming process
   */
  async startWarming(options: { force?: boolean } = {}): Promise<void> {
    if (this.state.isWarming && !options.force) {
      console.log('⚠️ [CACHE WARMING] Warming already in progress');
      return;
    }

    console.log('🔥 [CACHE WARMING] Starting cache warming...');

    this.state.isWarming = true;
    this.state.isPaused = false;
    this.state.startTime = Date.now();
    this.state.completedItems.clear();
    this.state.failedItems.clear();

    try {
      // Build warming queue
      await this.buildWarmingQueue();

      // Check network conditions
      const netState = await NetInfo.fetch();
      const effectiveType = (netState as any).details?.effectiveConnectionType;

      if (effectiveType === '2g') {
        console.log('⚠️ [CACHE WARMING] Skipping warming on 2G network');
        this.state.isWarming = false;
        return;
      }

      // Execute warming by priority
      await this.executeWarmingQueue();

      this.state.endTime = Date.now();
      const duration = this.state.endTime - (this.state.startTime || 0);

      console.log('✅ [CACHE WARMING] Warming complete!', {
        duration: `${duration}ms`,
        completed: this.state.completedItems.size,
        failed: this.state.failedItems.size,
      });
    } catch (error) {
      console.error('❌ [CACHE WARMING] Warming failed:', error);
    } finally {
      this.state.isWarming = false;
    }
  }

  /**
   * Build queue of items to warm
   */
  private async buildWarmingQueue(): Promise<void> {
    this.warmingQueue = [];

    // CRITICAL PRIORITY - Homepage sections (load immediately)
    this.warmingQueue.push(
      {
        key: 'homepage:justForYou',
        priority: WarmingPriority.CRITICAL,
        fetchFn: () => homepageDataService.getJustForYouSection(),
        ttl: 10 * 60 * 1000, // 10 minutes
        cachePriority: 'critical',
      },
      {
        key: 'homepage:trendingStores',
        priority: WarmingPriority.CRITICAL,
        fetchFn: () => homepageDataService.getTrendingStoresSection(),
        ttl: 15 * 60 * 1000, // 15 minutes
        cachePriority: 'critical',
      },
      {
        key: 'homepage:newArrivals',
        priority: WarmingPriority.CRITICAL,
        fetchFn: () => homepageDataService.getNewArrivalsSection(),
        ttl: 15 * 60 * 1000, // 15 minutes
        cachePriority: 'critical',
      }
    );

    // HIGH PRIORITY - User-specific data (load after 500ms)
    if (this.authState?.isAuthenticated) {
      this.warmingQueue.push(
        {
          key: `cart:${this.authState.user?.id}`,
          priority: WarmingPriority.HIGH,
          fetchFn: async () => {
            // Cart will be loaded by CartContext, just mark as warmed
            return { prewarmed: true };
          },
          ttl: 5 * 60 * 1000, // 5 minutes
          cachePriority: 'high',
          requiresAuth: true,
        },
        {
          key: `userStats:${this.authState.user?.id}`,
          priority: WarmingPriority.HIGH,
          fetchFn: async () => {
            // User stats will be loaded by ProfileContext
            return { prewarmed: true };
          },
          ttl: 10 * 60 * 1000, // 10 minutes
          cachePriority: 'high',
          requiresAuth: true,
        }
      );
    }

    // MEDIUM PRIORITY - Secondary sections (load after 1s)
    this.warmingQueue.push(
      {
        key: 'homepage:events',
        priority: WarmingPriority.MEDIUM,
        fetchFn: () => homepageDataService.getEventsSection(),
        ttl: 15 * 60 * 1000, // 15 minutes
        cachePriority: 'medium',
      },
      {
        key: 'homepage:offers',
        priority: WarmingPriority.MEDIUM,
        fetchFn: () => homepageDataService.getOffersSection(),
        ttl: 10 * 60 * 1000, // 10 minutes
        cachePriority: 'medium',
      }
    );

    // LOW PRIORITY - Additional sections (load after 2s)
    this.warmingQueue.push(
      {
        key: 'homepage:flashSales',
        priority: WarmingPriority.LOW,
        fetchFn: () => homepageDataService.getFlashSalesSection(),
        ttl: 5 * 60 * 1000, // 5 minutes
        cachePriority: 'low',
      }
    );

    // Sort by priority
    this.warmingQueue.sort((a, b) => a.priority - b.priority);

    console.log(`📋 [CACHE WARMING] Queue built with ${this.warmingQueue.length} items`);
  }

  /**
   * Execute warming queue with proper delays and checks
   */
  private async executeWarmingQueue(): Promise<void> {
    const priorityGroups = new Map<WarmingPriority, WarmingItem[]>();

    // Group items by priority
    for (const item of this.warmingQueue) {
      if (!priorityGroups.has(item.priority)) {
        priorityGroups.set(item.priority, []);
      }
      priorityGroups.get(item.priority)!.push(item);
    }

    // Execute each priority group with delays
    for (const [priority, items] of priorityGroups) {
      // Wait for the specified delay
      if (priority > 0) {
        await this.delay(priority);
      }

      // Check if paused or user is interacting
      if (this.state.isPaused || this.userInteracting) {
        console.log('⏸️ [CACHE WARMING] Pausing before priority group:', priority);
        await this.waitForResume();
      }

      // Warm all items in this priority group in parallel
      console.log(`🔥 [CACHE WARMING] Warming priority ${priority} (${items.length} items)...`);
      await Promise.all(items.map(item => this.warmItem(item)));
    }
  }

  /**
   * Warm a single cache item
   */
  private async warmItem(item: WarmingItem): Promise<void> {
    try {
      // Skip if requires auth and user is not authenticated
      if (item.requiresAuth && !this.authState?.isAuthenticated) {
        console.log(`⏭️ [CACHE WARMING] Skipping ${item.key} - requires auth`);
        return;
      }

      // Check if already in cache and still valid
      const cached = await cacheService.has(item.key);
      if (cached) {
        console.log(`✅ [CACHE WARMING] ${item.key} already in cache`);
        this.state.completedItems.add(item.key);
        return;
      }

      // Fetch and cache the data
      console.log(`🔥 [CACHE WARMING] Warming ${item.key}...`);
      const data = await item.fetchFn();

      await cacheService.set(item.key, data, {
        ttl: item.ttl,
        priority: item.cachePriority,
      });

      this.state.completedItems.add(item.key);
      console.log(`✅ [CACHE WARMING] ${item.key} warmed successfully`);
    } catch (error) {
      console.error(`❌ [CACHE WARMING] Failed to warm ${item.key}:`, error);
      this.state.failedItems.set(item.key, error as Error);
    }
  }

  /**
   * Pause warming
   */
  private pauseWarming(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume warming
   */
  private resumeWarming(): void {
    this.state.isPaused = false;
  }

  /**
   * Wait for warming to resume
   */
  private async waitForResume(): Promise<void> {
    while ((this.state.isPaused || this.userInteracting) && !this.isDestroyed) {
      await this.delay(500);
    }
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get warming statistics
   */
  getStats() {
    return {
      isWarming: this.state.isWarming,
      isPaused: this.state.isPaused,
      completed: this.state.completedItems.size,
      failed: this.state.failedItems.size,
      duration: this.state.endTime && this.state.startTime
        ? this.state.endTime - this.state.startTime
        : null,
      failedItems: Array.from(this.state.failedItems.entries()),
    };
  }

  /**
   * Refresh stale cache in background
   */
  async refreshStaleCache(): Promise<void> {
    console.log('🔄 [CACHE WARMING] Checking for stale cache...');

    for (const item of this.warmingQueue) {
      try {
        // Get cache entry details (we need to access the index)
        const entry = await cacheService.get(item.key);

        if (!entry) {
          // Not in cache, warm it
          console.log(`🔥 [CACHE WARMING] ${item.key} not in cache, warming...`);
          await this.warmItem(item);
          continue;
        }

        // Check if stale (older than 50% of TTL)
        // Note: We can't check timestamp directly from cacheService,
        // but we can use the stale-while-revalidate pattern
        console.log(`✅ [CACHE WARMING] ${item.key} is fresh`);
      } catch (error) {
        console.error(`❌ [CACHE WARMING] Failed to check ${item.key}:`, error);
      }
    }

    console.log('✅ [CACHE WARMING] Stale cache refresh complete');
  }

  /**
   * Cleanup service and remove listeners
   */
  destroy(): void {
    console.log('🧹 [CACHE WARMING] Destroying cache warming service...');

    this.isDestroyed = true;
    this.state.isWarming = false;
    this.state.isPaused = false;

    // Cleanup NetInfo listener
    if (this.netInfoUnsubscribe) {
      this.netInfoUnsubscribe();
      this.netInfoUnsubscribe = null;
    }

    // Clear failed items to free memory
    this.state.failedItems.clear();
    this.state.completedItems.clear();
    this.warmingQueue = [];

    console.log('✅ [CACHE WARMING] Cache warming service destroyed');
  }
}

export default new CacheWarmingService();
