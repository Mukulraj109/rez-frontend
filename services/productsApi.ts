// Products API Service
// Handles product catalog, search, and recommendations

import apiClient, { ApiResponse } from './apiClient';

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    inventory: {
      quantity: number;
      trackQuantity: boolean;
      allowBackorder: boolean;
    };
    attributes: Record<string, any>;
  }>;
  images: Array<{
    id: string;
    url: string;
    alt: string;
    isMain: boolean;
  }>;
  tags: string[];
  status: 'active' | 'draft' | 'archived';
  seo: {
    title: string;
    description: string;
    slug: string;
  };
  visibility: 'public' | 'private' | 'hidden';
  pricing: {
    basePrice: number;
    salePrice?: number;
    cost?: number;
    taxable: boolean;
  };
  ratings: {
    average: number;
    count: number;
    breakdown: Record<number, number>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  category?: string;
  store?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  sort?: 'name' | 'price' | 'rating' | 'popularity' | 'newest' | 'oldest';
  order?: 'asc' | 'desc';
  status?: 'active' | 'draft' | 'archived';
  visibility?: 'public' | 'private' | 'hidden';
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  filters: {
    categories: Array<{ id: string; name: string; count: number }>;
    stores: Array<{ id: string; name: string; count: number }>;
    priceRange: { min: number; max: number };
    tags: Array<{ name: string; count: number }>;
  };
}

export interface SearchQuery {
  q: string;
  page?: number;
  limit?: number;
  category?: string;
  store?: string;
  filters?: Record<string, any>;
}

export interface SearchResponse {
  products: Product[];
  suggestions: string[];
  filters: Array<{
    name: string;
    type: 'category' | 'brand' | 'price' | 'rating';
    options: Array<{ value: string; label: string; count: number }>;
  }>;
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  query: string;
  searchTime: number;
}

class ProductsService {
  // Get products with filtering and pagination
  async getProducts(query: ProductsQuery = {}): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get('/products', query);
  }

  // Get single product by ID
  async getProductById(id: string): Promise<ApiResponse<Product>> {
    return apiClient.get(`/products/${id}`);
  }

  // Get featured products
  async getFeaturedProducts(limit: number = 10): Promise<ApiResponse<Product[]>> {
    return apiClient.get('/products/featured', { limit });
  }

  // Search products
  async searchProducts(query: SearchQuery): Promise<ApiResponse<SearchResponse>> {
    return apiClient.get('/products/search', query);
  }

  // Get products by category
  async getProductsByCategory(
    categorySlug: string, 
    query: Omit<ProductsQuery, 'category'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get(`/products/category/${categorySlug}`, query);
  }

  // Get products by store
  async getProductsByStore(
    storeId: string, 
    query: Omit<ProductsQuery, 'store'> = {}
  ): Promise<ApiResponse<ProductsResponse>> {
    return apiClient.get(`/products/store/${storeId}`, query);
  }

  // Get product recommendations
  async getRecommendations(
    productId: string, 
    limit: number = 5
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`/products/${productId}/recommendations`, { limit });
  }

  // Get related products
  async getRelatedProducts(
    productId: string, 
    limit: number = 5
  ): Promise<ApiResponse<Product[]>> {
    return apiClient.get(`/products/${productId}/related`, { limit });
  }

  // Get search suggestions
  async getSearchSuggestions(query: string): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/suggestions', { q: query });
  }

  // Get popular search terms
  async getPopularSearches(limit: number = 10): Promise<ApiResponse<string[]>> {
    return apiClient.get('/products/popular-searches', { limit });
  }

  // Track product view
  async trackProductView(productId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`/products/${productId}/view`);
  }

  // Get product availability
  async checkAvailability(
    productId: string, 
    variantId?: string, 
    quantity: number = 1
  ): Promise<ApiResponse<{ available: boolean; maxQuantity: number }>> {
    return apiClient.get(`/products/${productId}/availability`, {
      variantId,
      quantity
    });
  }
}

// Create singleton instance
const productsService = new ProductsService();

export default productsService;