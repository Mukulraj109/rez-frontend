// Flash Sale API Service
// Handles flash sales data fetching for homepage and flash sale pages

import apiClient, { ApiResponse } from './apiClient';

// Flash sale product item from backend
export interface FlashSaleItem {
  _id: string;
  title: string;
  description: string;
  image: string;
  banner?: string;
  discountPercentage: number;
  discountAmount?: number;
  originalPrice?: number;
  flashSalePrice?: number;
  startTime: string;
  endTime: string;
  maxQuantity: number;
  soldQuantity: number;
  limitPerUser: number;
  status: 'scheduled' | 'active' | 'ending_soon' | 'ended' | 'sold_out';
  enabled: boolean;
  products?: Array<{
    _id: string;
    name: string;
    images?: Array<{ url: string }>;
    pricing?: {
      original: number;
      selling: number;
    };
  }>;
  category?: {
    _id: string;
    name: string;
  };
  viewCount?: number;
  clickCount?: number;
  purchaseCount?: number;
}

// Response structure from backend
export interface FlashSalesResponse {
  success: boolean;
  data: FlashSaleItem[];
  count: number;
}

class FlashSaleApiService {
  /**
   * Get all active flash sales
   * Endpoint: GET /api/offers/flash-sales (from offers with metadata.flashSale.isActive)
   */
  async getActiveFlashSales(): Promise<ApiResponse<FlashSaleItem[]>> {
    try {
      console.log('⚡ [FLASH SALE API] Fetching active flash sales');

      const response = await apiClient.get<FlashSalesResponse>('/offers/flash-sales');

      if (response.success && response.data) {
        // Handle both array response and object with data property
        const flashSales = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || response.data;

        console.log(`✅ [FLASH SALE API] Got ${Array.isArray(flashSales) ? flashSales.length : 0} active flash sales`);

        return {
          success: true,
          data: Array.isArray(flashSales) ? flashSales : [],
        };
      }

      return {
        success: false,
        error: 'No flash sales found',
        message: 'Failed to fetch active flash sales',
      };
    } catch (error: any) {
      console.error('❌ [FLASH SALE API] Error fetching active flash sales:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch flash sales',
        message: error?.message || 'Failed to fetch flash sales',
      };
    }
  }

  /**
   * Get upcoming flash sales
   * Endpoint: GET /api/flash-sales/upcoming
   */
  async getUpcomingFlashSales(): Promise<ApiResponse<FlashSaleItem[]>> {
    try {
      console.log('⚡ [FLASH SALE API] Fetching upcoming flash sales');

      const response = await apiClient.get<FlashSalesResponse>('/flash-sales/upcoming');

      if (response.success && response.data) {
        const flashSales = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || response.data;

        console.log(`✅ [FLASH SALE API] Got ${Array.isArray(flashSales) ? flashSales.length : 0} upcoming flash sales`);

        return {
          success: true,
          data: Array.isArray(flashSales) ? flashSales : [],
        };
      }

      return {
        success: false,
        error: 'No upcoming flash sales found',
        message: 'Failed to fetch upcoming flash sales',
      };
    } catch (error: any) {
      console.error('❌ [FLASH SALE API] Error fetching upcoming flash sales:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch flash sales',
        message: error?.message || 'Failed to fetch flash sales',
      };
    }
  }

  /**
   * Get flash sales expiring soon
   * Endpoint: GET /api/flash-sales/expiring-soon?minutes=30
   */
  async getExpiringSoonFlashSales(minutes: number = 30): Promise<ApiResponse<FlashSaleItem[]>> {
    try {
      console.log(`⚡ [FLASH SALE API] Fetching flash sales expiring in ${minutes} minutes`);

      const response = await apiClient.get<FlashSalesResponse>('/flash-sales/expiring-soon', { minutes });

      if (response.success && response.data) {
        const flashSales = Array.isArray(response.data)
          ? response.data
          : (response.data as any).data || response.data;

        console.log(`✅ [FLASH SALE API] Got ${Array.isArray(flashSales) ? flashSales.length : 0} expiring flash sales`);

        return {
          success: true,
          data: Array.isArray(flashSales) ? flashSales : [],
        };
      }

      return {
        success: false,
        error: 'No expiring flash sales found',
        message: 'Failed to fetch expiring flash sales',
      };
    } catch (error: any) {
      console.error('❌ [FLASH SALE API] Error fetching expiring flash sales:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch flash sales',
        message: error?.message || 'Failed to fetch flash sales',
      };
    }
  }

  /**
   * Get flash sale by ID
   * Endpoint: GET /api/flash-sales/:id
   */
  async getFlashSaleById(id: string): Promise<ApiResponse<FlashSaleItem>> {
    try {
      console.log(`⚡ [FLASH SALE API] Fetching flash sale: ${id}`);

      const response = await apiClient.get<{ success: boolean; data: FlashSaleItem }>(`/flash-sales/${id}`);

      if (response.success && response.data) {
        console.log(`✅ [FLASH SALE API] Got flash sale: ${id}`);
        return {
          success: true,
          data: (response.data as any).data || response.data,
        };
      }

      return {
        success: false,
        error: 'Flash sale not found',
        message: 'Failed to fetch flash sale',
      };
    } catch (error: any) {
      console.error('❌ [FLASH SALE API] Error fetching flash sale:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch flash sale',
        message: error?.message || 'Failed to fetch flash sale',
      };
    }
  }

  /**
   * Track click on flash sale
   * Endpoint: POST /api/flash-sales/:id/track-click
   */
  async trackClick(id: string): Promise<void> {
    try {
      await apiClient.post(`/flash-sales/${id}/track-click`);
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.warn('⚠️ [FLASH SALE API] Failed to track click:', error);
    }
  }
}

// Create singleton instance
const flashSaleApi = new FlashSaleApiService();

export { flashSaleApi };
export default flashSaleApi;
