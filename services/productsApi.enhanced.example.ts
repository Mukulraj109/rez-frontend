/**
 * Products API Service - Enhanced Example
 *
 * This file demonstrates how to use the enhanced API client with:
 * - Request deduplication
 * - Automatic retry with exponential backoff
 * - Request caching
 * - Timeout handling
 * - Offline queue support
 *
 * Copy patterns from this file to update your existing productsApi.ts
 */

import apiClient, { ApiResponse } from './apiClient';
import enhancedApiClient from '@/utils/enhancedApiClient';
import { ProductItem, RecommendationItem } from '@/types/homepage.types';
import { validateProduct, validateProductArray } from '@/utils/responseValidators';
import {
  Product as UnifiedProduct,
  toProduct,
  validateProduct as validateUnifiedProduct,
} from '@/types/unified';
import { AGGRESSIVE_RETRY_CONFIG, FAST_RETRY_CONFIG } from '@/utils/requestRetry';

// ============================================================================
// Example 1: Simple GET with Deduplication and Retry (Default)
// ============================================================================

/**
 * Get featured products with default enhanced features
 * - Automatic deduplication (prevents duplicate concurrent requests)
 * - Automatic retry on failure (3 attempts with exponential backoff)
 * - Request timeout (30 seconds)
 */
export async function getFeaturedProductsBasic(limit: number = 10): Promise<ApiResponse<ProductItem[]>> {
  // Using enhancedApiClient automatically gets:
  // ✅ Deduplication (multiple calls → single request)
  // ✅ Retry (network errors → auto retry)
  // ✅ Timeout (30s default)
  return enhancedApiClient.get<ProductItem[]>('/products/featured', { limit });
}

// ============================================================================
// Example 2: GET with Caching
// ============================================================================

/**
 * Get featured products with caching
 * Cache successful responses for 5 minutes
 */
export async function getFeaturedProductsCached(limit: number = 10): Promise<ApiResponse<ProductItem[]>> {
  return enhancedApiClient.get<ProductItem[]>(
    '/products/featured',
    { limit },
    {
      cache: true,              // ✅ Enable response caching
      cacheDuration: 300000,    // 5 minutes
    }
  );
}

// ============================================================================
// Example 3: GET with Custom Retry Configuration
// ============================================================================

/**
 * Get product by ID with aggressive retry
 * For critical operations that need more retry attempts
 */
export async function getProductByIdAggressive(id: string): Promise<ApiResponse<ProductItem>> {
  return enhancedApiClient.get<ProductItem>(
    `/products/${id}`,
    undefined,
    {
      retry: true,
      retryConfig: AGGRESSIVE_RETRY_CONFIG, // 5 retries, longer delays
      timeout: 60000,                       // 60 second timeout
    }
  );
}

// ============================================================================
// Example 4: POST without Retry (for mutations)
// ============================================================================

/**
 * Track product view - no retry needed
 * One-time tracking, don't retry on failure
 */
export async function trackProductViewNoRetry(productId: string): Promise<ApiResponse<any>> {
  return enhancedApiClient.post(
    `/products/${productId}/track-view`,
    undefined,
    {
      retry: false,              // ❌ Disable retry for tracking
      timeout: 10000,            // Short timeout
      logging: false,            // Disable logging for analytics
    }
  );
}

// ============================================================================
// Example 5: POST with Retry (for important mutations)
// ============================================================================

/**
 * Add product to wishlist - with retry
 * Important operation, retry on network errors
 */
export async function addToWishlistWithRetry(productId: string): Promise<ApiResponse<any>> {
  return enhancedApiClient.post(
    '/wishlist/add',
    { productId },
    {
      retry: true,
      retryConfig: FAST_RETRY_CONFIG,  // Quick retries (2 attempts)
      timeout: 15000,
    }
  );
}

// ============================================================================
// Example 6: Search with Deduplication (prevents duplicate searches)
// ============================================================================

/**
 * Search products with deduplication
 * Prevents duplicate searches while user is typing
 */
export async function searchProductsDeduplicated(
  query: string,
  filters?: Record<string, any>
): Promise<ApiResponse<ProductItem[]>> {
  return enhancedApiClient.get<ProductItem[]>(
    '/products/search',
    { q: query, ...filters },
    {
      deduplicate: true,         // ✅ Deduplicate identical searches
      cache: true,               // ✅ Cache search results
      cacheDuration: 60000,      // 1 minute cache
      timeout: 10000,            // Quick timeout for searches
    }
  );
}

// ============================================================================
// Example 7: Cancellable Request
// ============================================================================

/**
 * Get products by category with cancellation support
 * Useful for cancelling previous requests when user navigates away
 */
export async function getProductsByCategoryCancellable(
  categorySlug: string,
  controller: AbortController
): Promise<ApiResponse<ProductItem[]>> {
  return enhancedApiClient.get<ProductItem[]>(
    `/products/category/${categorySlug}`,
    undefined,
    {
      controller,               // ✅ Pass AbortController for cancellation
      deduplicate: true,
      cache: true,
      cacheDuration: 180000,    // 3 minutes
    }
  );
}

// Usage example:
// const controller = new AbortController();
// const promise = getProductsByCategoryCancellable('electronics', controller);
// controller.abort(); // Cancel the request

// ============================================================================
// Example 8: Complete Enhanced Implementation
// ============================================================================

/**
 * Full-featured product fetch with all enhancements
 */
export async function getProductByIdEnhanced(productId: string): Promise<ApiResponse<UnifiedProduct>> {
  try {
    // Validate ID format first (fail fast)
    if (!productId || productId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(productId)) {
      return {
        success: false,
        error: 'Invalid product ID format',
      };
    }

    // Make enhanced API call with all features
    const response = await enhancedApiClient.get<any>(
      `/products/${productId}`,
      undefined,
      {
        deduplicate: true,         // ✅ Deduplicate concurrent requests
        retry: true,               // ✅ Retry on failure
        retryConfig: {
          maxRetries: 3,
          initialDelay: 1000,
          maxDelay: 5000,
          shouldRetry: (error, attempt) => {
            // Custom retry logic
            // Don't retry on 404 (product not found)
            if (error?.status === 404) return false;
            // Use default retry logic for other errors
            return true;
          },
        },
        cache: true,               // ✅ Cache successful responses
        cacheDuration: 600000,     // 10 minutes
        timeout: 30000,            // 30 second timeout
        logging: __DEV__,          // Log in development only
      }
    );

    // Validate and transform response
    if (response.success && response.data) {
      try {
        const unifiedProduct = toProduct(response.data);
        const validation = validateUnifiedProduct(unifiedProduct);

        if (validation.valid) {
          return {
            ...response,
            data: unifiedProduct,
          };
        } else {
          return {
            success: false,
            error: 'Product validation failed',
            message: `Invalid product data: ${validation.errors.map(e => e.message).join(', ')}`,
          };
        }
      } catch (conversionError: any) {
        return {
          success: false,
          error: 'Product conversion failed',
          message: conversionError?.message || 'Failed to convert product data',
        };
      }
    }

    return response;

  } catch (error: any) {
    return {
      success: false,
      error: error?.message || 'Failed to fetch product',
      message: error?.message || 'Failed to fetch product',
    };
  }
}

// ============================================================================
// Example 9: Batch Requests with Individual Deduplication
// ============================================================================

/**
 * Fetch multiple products concurrently
 * Each request is deduplicated individually
 */
export async function getMultipleProducts(
  productIds: string[]
): Promise<Array<ApiResponse<UnifiedProduct>>> {
  // All requests run in parallel, but identical IDs are deduplicated
  return Promise.all(
    productIds.map(id => getProductByIdEnhanced(id))
  );
}

// ============================================================================
// Example 10: Statistics and Monitoring
// ============================================================================

/**
 * Get API client statistics
 * Useful for debugging and monitoring
 */
export function getApiStatistics() {
  const cacheStats = enhancedApiClient.getCacheStats();

  return {
    cache: cacheStats,
  };
}

/**
 * Print detailed statistics to console
 * For development/debugging
 */
export function printApiStatistics() {
  if (__DEV__) {
    enhancedApiClient.printStats();
  }
}

// ============================================================================
// Migration Guide from Old API
// ============================================================================

/*
MIGRATION GUIDE:

1. Simple GET request:
   OLD: apiClient.get('/products/featured', { limit: 10 })
   NEW: enhancedApiClient.get('/products/featured', { limit: 10 })
   Benefits: Auto deduplication + retry + timeout

2. GET with caching:
   OLD: apiClient.get('/products/featured', { limit: 10 })
   NEW: enhancedApiClient.get('/products/featured', { limit: 10 }, { cache: true })
   Benefits: Cached responses for faster loads

3. POST without retry:
   OLD: apiClient.post('/analytics/track', data)
   NEW: enhancedApiClient.post('/analytics/track', data, { retry: false })
   Benefits: Explicit control over retry behavior

4. Critical POST with aggressive retry:
   OLD: apiClient.post('/orders/create', orderData)
   NEW: enhancedApiClient.post('/orders/create', orderData, {
         retry: true,
         retryConfig: AGGRESSIVE_RETRY_CONFIG
       })
   Benefits: More reliable order creation

5. Search with deduplication:
   OLD: apiClient.get('/products/search', { q: searchTerm })
   NEW: enhancedApiClient.get('/products/search', { q: searchTerm }, {
         deduplicate: true,
         cache: true,
         cacheDuration: 60000
       })
   Benefits: No duplicate searches, faster results

BACKWARD COMPATIBILITY:
- All old apiClient methods still work
- enhancedApiClient is a wrapper, not a replacement
- Gradually migrate critical endpoints first
- Test in development before production

RECOMMENDED MIGRATION ORDER:
1. GET endpoints (products, categories, stores) - Add caching
2. Search endpoints - Add deduplication
3. POST endpoints (non-critical) - Add retry
4. POST endpoints (critical) - Add aggressive retry
5. Analytics endpoints - Disable retry
*/

// ============================================================================
// Export Everything
// ============================================================================

export default {
  // Basic examples
  getFeaturedProductsBasic,
  getFeaturedProductsCached,

  // Retry examples
  getProductByIdAggressive,
  trackProductViewNoRetry,
  addToWishlistWithRetry,

  // Deduplication examples
  searchProductsDeduplicated,

  // Cancellation example
  getProductsByCategoryCancellable,

  // Complete example
  getProductByIdEnhanced,

  // Batch example
  getMultipleProducts,

  // Utilities
  getApiStatistics,
  printApiStatistics,
};
