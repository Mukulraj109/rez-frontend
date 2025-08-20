import { 
  HomepageApiResponse, 
  SectionApiResponse, 
  HomepageSection, 
  HomepageAnalytics 
} from '@/types/homepage.types';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.rez-app.com';
const API_VERSION = 'v1';

// Request timeout configuration
const REQUEST_TIMEOUT = 10000; // 10 seconds

// API endpoints
const ENDPOINTS = {
  HOMEPAGE: `${API_BASE_URL}/${API_VERSION}/homepage`,
  SECTION: (id: string) => `${API_BASE_URL}/${API_VERSION}/homepage/sections/${id}`,
  ANALYTICS: `${API_BASE_URL}/${API_VERSION}/analytics/homepage`,
  USER_PREFERENCES: `${API_BASE_URL}/${API_VERSION}/users/preferences`,
} as const;

// HTTP Client with timeout and error handling
class ApiClient {
  private static async request<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // TODO: Add authentication headers when available
          // 'Authorization': `Bearer ${getAuthToken()}`,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          response.status,
          `HTTP ${response.status}: ${response.statusText}`,
          await response.text()
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(408, 'Request timeout', 'The request took too long to complete');
      }
      
      throw new ApiError(
        0, 
        'Network error', 
        error instanceof Error ? error.message : 'Unknown network error'
      );
    }
  }

  static get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  static post<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static put<T>(url: string, data: any, options?: RequestInit): Promise<T> {
    return this.request<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }
}

// Custom API Error class
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }

  get isTimeout(): boolean {
    return this.status === 408;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }
}

// Homepage API Service
export class HomepageApiService {
  /**
   * Fetch complete homepage data including all sections
   */
  static async fetchHomepageData(userId?: string): Promise<HomepageApiResponse> {
    try {
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await ApiClient.get<HomepageApiResponse>(`${ENDPOINTS.HOMEPAGE}${params}`);
    } catch (error) {
      console.error('Failed to fetch homepage data:', error);
      throw error;
    }
  }

  /**
   * Fetch data for a specific section
   */
  static async fetchSectionData(
    sectionId: string, 
    userId?: string,
    filters?: Record<string, any>
  ): Promise<SectionApiResponse> {
    try {
      const searchParams = new URLSearchParams();
      
      if (userId) searchParams.append('userId', userId);
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
          }
        });
      }

      const queryString = searchParams.toString();
      const url = `${ENDPOINTS.SECTION(sectionId)}${queryString ? `?${queryString}` : ''}`;
      
      return await ApiClient.get<SectionApiResponse>(url);
    } catch (error) {
      console.error(`Failed to fetch section data for ${sectionId}:`, error);
      throw error;
    }
  }

  /**
   * Send analytics data to backend
   */
  static async trackAnalytics(analytics: Partial<HomepageAnalytics>): Promise<void> {
    try {
      await ApiClient.post(ENDPOINTS.ANALYTICS, {
        ...analytics,
        timestamp: new Date().toISOString(),
        // TODO: Add user context when available
        // userId: getUserId(),
        // sessionId: getSessionId(),
      });
    } catch (error) {
      // Analytics failures shouldn't block the app
      console.warn('Failed to send analytics:', error);
    }
  }

  /**
   * Track section view
   */
  static async trackSectionView(sectionId: string, userId?: string): Promise<void> {
    return this.trackAnalytics({
      sectionViews: { [sectionId]: 1 }
    });
  }

  /**
   * Track item click
   */
  static async trackItemClick(
    sectionId: string, 
    itemId: string, 
    userId?: string
  ): Promise<void> {
    return this.trackAnalytics({
      itemClicks: { [`${sectionId}:${itemId}`]: 1 }
    });
  }

  /**
   * Update user preferences
   */
  static async updateUserPreferences(
    userId: string,
    preferences: string[]
  ): Promise<void> {
    try {
      await ApiClient.put(ENDPOINTS.USER_PREFERENCES, {
        userId,
        preferences,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update user preferences:', error);
      throw error;
    }
  }

  /**
   * Refresh section with retry logic
   */
  static async refreshSectionWithRetry(
    sectionId: string,
    maxRetries: number = 3,
    retryDelay: number = 1000
  ): Promise<SectionApiResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.fetchSectionData(sectionId);
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof ApiError && error.isClientError) {
          // Don't retry client errors (4xx)
          throw error;
        }

        if (attempt < maxRetries) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    throw lastError!;
  }

  /**
   * Batch refresh multiple sections
   */
  static async refreshMultipleSections(
    sectionIds: string[],
    userId?: string
  ): Promise<Record<string, SectionApiResponse | Error>> {
    const results: Record<string, SectionApiResponse | Error> = {};

    await Promise.allSettled(
      sectionIds.map(async (sectionId) => {
        try {
          const result = await this.fetchSectionData(sectionId, userId);
          results[sectionId] = result;
        } catch (error) {
          results[sectionId] = error as Error;
        }
      })
    );

    return results;
  }
}

// Cache manager for API responses
export class HomepageCacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  private static readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 50;

  /**
   * Get cached data if still valid
   */
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    const now = Date.now();
    if (now > cached.timestamp + cached.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  /**
   * Set data in cache
   */
  static set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    // Implement simple LRU eviction
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear specific cache entry
   */
  static clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  static clearAll(): void {
    this.cache.clear();
  }

  /**
   * Generate cache key for section
   */
  static getSectionKey(sectionId: string, userId?: string, filters?: Record<string, any>): string {
    const parts = [sectionId];
    if (userId) parts.push(`user:${userId}`);
    if (filters) parts.push(`filters:${JSON.stringify(filters)}`);
    return parts.join('|');
  }
}

// Higher-order function to add caching to API calls
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl?: number
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    
    // Try to get from cache first
    const cached = HomepageCacheManager.get<R>(key);
    if (cached) return cached;
    
    // Fetch from API and cache the result
    const result = await fn(...args);
    HomepageCacheManager.set(key, result, ttl);
    
    return result;
  };
}

// Cached API methods
export const CachedHomepageApi = {
  fetchHomepageData: withCache(
    HomepageApiService.fetchHomepageData,
    (userId?: string) => `homepage:${userId || 'anonymous'}`
  ),
  
  fetchSectionData: withCache(
    HomepageApiService.fetchSectionData,
    (sectionId: string, userId?: string, filters?: Record<string, any>) => 
      HomepageCacheManager.getSectionKey(sectionId, userId, filters)
  ),
};

export default HomepageApiService;