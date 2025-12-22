import apiClient, { ApiResponse } from './apiClient';

// Category interfaces (matching backend)
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  bannerImage?: string;
  type: 'going_out' | 'home_delivery' | 'earn' | 'play' | 'general';
  parentCategory?: string;
  childCategories?: string[];
  isActive: boolean;
  sortOrder: number;
  metadata: {
    color?: string;
    tags?: string[];
    description?: string;
    featured?: boolean;
  };
  productCount: number;
  storeCount: number;
  isBestDiscount?: boolean;
  isBestSeller?: boolean;
  maxCashback?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryFilters {
  type?: string;
  featured?: boolean;
  parent?: string;
  search?: string;
  isActive?: boolean;
}

export interface CategoryQuery extends CategoryFilters {
  page?: number;
  limit?: number;
  sort?: string;
  populate?: string[];
}

class CategoriesService {
  private baseUrl = '/categories';

  // Get all categories with optional filters
  async getCategories(params: CategoryQuery = {}): Promise<ApiResponse<Category[]>> {
    const query = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query.append(key, value.join(','));
        } else {
          query.append(key, String(value));
        }
      }
    });

    return apiClient.get(`${this.baseUrl}?${query.toString()}`);
  }

  // Get category by ID
  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return apiClient.get(`${this.baseUrl}/${id}`);
  }

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return apiClient.get(`${this.baseUrl}/${slug}`);
  }

  // Get category tree structure
  async getCategoryTree(type?: string): Promise<ApiResponse<Category[]>> {
    const query = type ? `?type=${type}` : '';
    return apiClient.get(`${this.baseUrl}/tree${query}`);
  }

  // Get featured categories - uses dedicated /featured endpoint
  async getFeaturedCategories(type?: string, limit: number = 20): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('limit', String(limit));
    if (type) params.append('type', type);

    return apiClient.get(`${this.baseUrl}/featured?${params.toString()}`);
  }

  // Get root categories (no parent)
  // Note: Backend validates query params - only parent, type, featured are allowed
  async getRootCategories(type?: string): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('parent', 'null');
    if (type) params.append('type', type);

    return apiClient.get(`${this.baseUrl}?${params.toString()}`);
  }

  // Search categories
  async searchCategories(query: string, type?: string): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('search', query);
    params.append('isActive', 'true');
    if (type) params.append('type', type);
    
    return apiClient.get(`${this.baseUrl}?${params.toString()}`);
  }

  // Get categories with product counts
  async getCategoriesWithCounts(type?: string): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('includeCounts', 'true');
    params.append('isActive', 'true');
    if (type) params.append('type', type);

    return apiClient.get(`${this.baseUrl}?${params.toString()}`);
  }

  // Get best discount categories
  async getBestDiscountCategories(limit: number = 10): Promise<ApiResponse<Category[]>> {
    return apiClient.get(`${this.baseUrl}/best-discount?limit=${limit}`);
  }

  // Get best seller categories
  async getBestSellerCategories(limit: number = 10): Promise<ApiResponse<Category[]>> {
    return apiClient.get(`${this.baseUrl}/best-seller?limit=${limit}`);
  }
}

// Singleton pattern using globalThis to persist across SSR module re-evaluations
const CATEGORIES_SERVICE_KEY = '__rezCategoriesService__';

function getCategoriesService(): CategoriesService {
  if (typeof globalThis !== 'undefined') {
    if (!(globalThis as any)[CATEGORIES_SERVICE_KEY]) {
      (globalThis as any)[CATEGORIES_SERVICE_KEY] = new CategoriesService();
    }
    return (globalThis as any)[CATEGORIES_SERVICE_KEY];
  }
  return new CategoriesService();
}

export default getCategoriesService();