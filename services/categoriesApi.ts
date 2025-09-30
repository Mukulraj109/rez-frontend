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

  // Get featured categories
  async getFeaturedCategories(type?: string): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('featured', 'true');
    params.append('isActive', 'true');
    if (type) params.append('type', type);
    
    return apiClient.get(`${this.baseUrl}?${params.toString()}`);
  }

  // Get root categories (no parent)
  async getRootCategories(type?: string): Promise<ApiResponse<Category[]>> {
    const params = new URLSearchParams();
    params.append('parent', 'null');
    params.append('isActive', 'true');
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
}

export default new CategoriesService();