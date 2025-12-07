import apiClient, { ApiResponse } from './apiClient';

// Product interface for homepage sections
export interface HomepageProduct {
  id: string;
  _id: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  purchases?: number;
  cashbackPercentage?: number;
  category: string;
  categorySlug?: string;
  store: {
    _id: string;
    name: string;
    logo: string;
    deliveryTime?: string;
    deliveryFee?: number;
    city: string;
    distance?: number | null;
  };
}

export interface NearbyProductsParams {
  longitude: number;
  latitude: number;
  radius?: number;
  limit?: number;
}

export interface PopularProductsParams {
  limit?: number;
}

export interface HotDealsParams {
  limit?: number;
}

export interface CategoryProductsParams {
  categorySlug: string;
  limit?: number;
}

class ProductApiService {
  private baseUrl = '/products';

  // Get popular products - FOR "Popular" SECTION
  async getPopularProducts(params: PopularProductsParams = {}): Promise<ApiResponse<HomepageProduct[]>> {
    const query = new URLSearchParams();

    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `${this.baseUrl}/popular?${queryString}` : `${this.baseUrl}/popular`;

    return apiClient.get(url);
  }

  // Get nearby products - FOR "In Your Area" SECTION
  async getNearbyProducts(params: NearbyProductsParams): Promise<ApiResponse<HomepageProduct[]>> {
    const query = new URLSearchParams();

    query.append('longitude', String(params.longitude));
    query.append('latitude', String(params.latitude));

    if (params.radius) {
      query.append('radius', String(params.radius));
    }
    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    return apiClient.get(`${this.baseUrl}/nearby?${query.toString()}`);
  }

  // Get hot deals - FOR "Hot Deals" SECTION
  async getHotDeals(params: HotDealsParams = {}): Promise<ApiResponse<HomepageProduct[]>> {
    const query = new URLSearchParams();

    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const queryString = query.toString();
    const url = queryString ? `${this.baseUrl}/hot-deals?${queryString}` : `${this.baseUrl}/hot-deals`;

    return apiClient.get(url);
  }

  // Get products by category slug - FOR HOMEPAGE CATEGORY SECTIONS
  async getProductsByCategory(params: CategoryProductsParams): Promise<ApiResponse<HomepageProduct[]>> {
    const query = new URLSearchParams();

    if (params.limit) {
      query.append('limit', String(params.limit));
    }

    const queryString = query.toString();
    const url = queryString
      ? `${this.baseUrl}/category-section/${params.categorySlug}?${queryString}`
      : `${this.baseUrl}/category-section/${params.categorySlug}`;

    return apiClient.get(url);
  }
}

// Export singleton instance
export const productApi = new ProductApiService();
export default productApi;
