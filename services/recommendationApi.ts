// Recommendation API Service
// Handles product recommendations, similar products, and bundles

import apiClient, { ApiResponse } from './apiClient';
import { ProductItem } from '@/types/homepage.types';

export interface ProductRecommendation {
  product: ProductItem;
  score: number;
  reasons: string[];
  confidence: number;
  similarity?: number;
}

export interface BundleItem {
  products: ProductItem[];
  combinedPrice: number;
  savings: number;
  frequency: number;
}

export interface SimilarProductsResponse {
  productId: string;
  similarProducts: ProductRecommendation[];
  total: number;
}

export interface FrequentlyBoughtResponse {
  productId: string;
  bundles: BundleItem[];
  total: number;
}

export interface BundleDealsResponse {
  productId: string;
  bundles: BundleItem[];
  total: number;
}

export interface PersonalizedRecommendationsResponse {
  recommendations: ProductRecommendation[];
  total: number;
  userId: string;
}

class RecommendationService {
  /**
   * Get similar products for a specific product
   */
  async getSimilarProducts(
    productId: string,
    limit: number = 6
  ): Promise<ApiResponse<SimilarProductsResponse>> {
    try {
      console.log('🔍 [RECOMMENDATION API] Fetching similar products for:', productId);
      const response = await apiClient.get(`/recommendations/products/similar/${productId}`, {
        limit
      });

      if (response.success && response.data) {
        console.log('✅ [RECOMMENDATION API] Similar products retrieved:', response.data.total);
        return response;
      }

      throw new Error(response.message || 'Failed to fetch similar products');
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error fetching similar products:', error);
      throw error;
    }
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBoughtTogether(
    productId: string,
    limit: number = 4
  ): Promise<ApiResponse<FrequentlyBoughtResponse>> {
    try {
      console.log('🔍 [RECOMMENDATION API] Fetching frequently bought together for:', productId);
      const response = await apiClient.get(`/recommendations/products/frequently-bought/${productId}`, {
        limit
      });

      if (response.success && response.data) {
        console.log('✅ [RECOMMENDATION API] Frequently bought together retrieved:', response.data.total);
        return response;
      }

      throw new Error(response.message || 'Failed to fetch frequently bought together');
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error fetching frequently bought together:', error);
      throw error;
    }
  }

  /**
   * Get bundle deals for a product
   */
  async getBundleDeals(
    productId: string,
    limit: number = 3
  ): Promise<ApiResponse<BundleDealsResponse>> {
    try {
      console.log('🔍 [RECOMMENDATION API] Fetching bundle deals for:', productId);
      const response = await apiClient.get(`/recommendations/products/bundle/${productId}`, {
        limit
      });

      if (response.success && response.data) {
        console.log('✅ [RECOMMENDATION API] Bundle deals retrieved:', response.data.total);
        return response;
      }

      throw new Error(response.message || 'Failed to fetch bundle deals');
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error fetching bundle deals:', error);
      throw error;
    }
  }

  /**
   * Get personalized product recommendations for the authenticated user
   */
  async getPersonalizedRecommendations(
    limit: number = 10,
    excludeProducts: string[] = []
  ): Promise<ApiResponse<PersonalizedRecommendationsResponse>> {
    try {
      console.log('🔍 [RECOMMENDATION API] Fetching personalized recommendations');
      const response = await apiClient.get('/recommendations/products/personalized', {
        limit,
        excludeProducts: excludeProducts.join(',')
      });

      if (response.success && response.data) {
        console.log('✅ [RECOMMENDATION API] Personalized recommendations retrieved:', response.data.total);
        return response;
      }

      throw new Error(response.message || 'Failed to fetch personalized recommendations');
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error fetching personalized recommendations:', error);
      throw error;
    }
  }

  /**
   * Track product view for analytics
   */
  async trackProductView(productId: string): Promise<ApiResponse<{ productId: string; tracked: boolean }>> {
    try {
      console.log('📊 [RECOMMENDATION API] Tracking product view:', productId);
      const response = await apiClient.post(`/recommendations/products/${productId}/view`);

      if (response.success) {
        console.log('✅ [RECOMMENDATION API] Product view tracked successfully');
        return response;
      }

      throw new Error(response.message || 'Failed to track product view');
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error tracking product view:', error);
      // Don't throw - tracking failures shouldn't break the app
      return {
        success: false,
        data: { productId, tracked: false },
        message: 'Failed to track view'
      };
    }
  }

  /**
   * Get all recommendations for a product (similar, frequently bought, and bundles)
   */
  async getAllRecommendations(productId: string): Promise<{
    similar: ProductRecommendation[];
    frequentlyBought: BundleItem[];
    bundles: BundleItem[];
  }> {
    try {
      console.log('🔍 [RECOMMENDATION API] Fetching all recommendations for:', productId);

      // Fetch all recommendation types in parallel
      const [similarResponse, frequentlyBoughtResponse, bundlesResponse] = await Promise.allSettled([
        this.getSimilarProducts(productId, 6),
        this.getFrequentlyBoughtTogether(productId, 4),
        this.getBundleDeals(productId, 3)
      ]);

      const result = {
        similar: similarResponse.status === 'fulfilled' && similarResponse.value.success
          ? similarResponse.value.data?.similarProducts || []
          : [],
        frequentlyBought: frequentlyBoughtResponse.status === 'fulfilled' && frequentlyBoughtResponse.value.success
          ? frequentlyBoughtResponse.value.data?.bundles || []
          : [],
        bundles: bundlesResponse.status === 'fulfilled' && bundlesResponse.value.success
          ? bundlesResponse.value.data?.bundles || []
          : []
      };

      console.log('✅ [RECOMMENDATION API] All recommendations retrieved:', {
        similar: result.similar.length,
        frequentlyBought: result.frequentlyBought.length,
        bundles: result.bundles.length
      });

      return result;
    } catch (error) {
      console.error('❌ [RECOMMENDATION API] Error fetching all recommendations:', error);
      return {
        similar: [],
        frequentlyBought: [],
        bundles: []
      };
    }
  }

  /**
   * Format recommendation for display
   */
  formatRecommendation(recommendation: ProductRecommendation): ProductItem & { reasons: string[] } {
    return {
      ...recommendation.product,
      reasons: recommendation.reasons
    };
  }

  /**
   * Format bundle for display
   */
  formatBundle(bundle: BundleItem): {
    products: ProductItem[];
    combinedPrice: number;
    originalPrice: number;
    savings: number;
    savingsPercentage: number;
  } {
    const originalPrice = bundle.products.reduce((sum, p) =>
      sum + (p.price?.original || p.price?.current || 0), 0
    );

    return {
      products: bundle.products,
      combinedPrice: bundle.combinedPrice,
      originalPrice,
      savings: bundle.savings,
      savingsPercentage: originalPrice > 0 ? Math.round((bundle.savings / originalPrice) * 100) : 0
    };
  }
}

// Create singleton instance
const recommendationService = new RecommendationService();

export default recommendationService;
