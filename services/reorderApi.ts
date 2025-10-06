// Reorder API Service
// Handles re-ordering from past orders

import apiClient, { ApiResponse } from './apiClient';

export interface ReorderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  currentPrice: number;
  originalPrice: number;
  priceDifference: number;
  isAvailable: boolean;
  hasStockIssue: boolean;
  availableStock: number;
  hasVariantIssue: boolean;
  replacementSuggestion?: {
    productId: string;
    name: string;
    price: number;
    image: string;
  };
}

export interface ReorderValidation {
  canReorder: boolean;
  items: ReorderItem[];
  unavailableItems: Array<{
    productId: string;
    name: string;
    reason: string;
    originalPrice: number;
    quantity: number;
    variant?: any;
  }>;
  priceChanges: Array<{
    productId: string;
    name: string;
    originalPrice: number;
    currentPrice: number;
    difference: number;
    percentChange: string;
  }>;
  totalOriginal: number;
  totalCurrent: number;
  totalDifference: number;
  warnings: string[];
}

export interface ReorderResult {
  cart: any;
  addedItems: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  skippedItems: Array<{
    productId: string;
    reason: string;
  }>;
  validation: ReorderValidation;
}

export interface FrequentlyOrderedItem {
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  orderCount: number;
  lastOrderDate: string;
  averageQuantity: number;
  totalSpent: number;
  currentPrice: number;
  isAvailable: boolean;
}

export interface ReorderSuggestion {
  type: 'frequent' | 'consumable' | 'subscription';
  productId: string;
  productName: string;
  productImage: string;
  storeId: string;
  storeName: string;
  reason: string;
  lastOrderDate?: string;
  orderFrequency?: number; // days between orders
  suggestedQuantity: number;
  currentPrice: number;
  isAvailable: boolean;
}

class ReorderService {
  // Validate if an order can be reordered
  async validateReorder(
    orderId: string,
    itemIds?: string[]
  ): Promise<ApiResponse<ReorderValidation>> {
    console.log('🔍 [REORDER API] Validating reorder:', orderId, itemIds);

    const params: any = {};
    if (itemIds && itemIds.length > 0) {
      params.itemIds = itemIds;
    }

    return apiClient.get(`/orders/${orderId}/reorder/validate`, params);
  }

  // Re-order full order
  async reorderFullOrder(orderId: string): Promise<ApiResponse<ReorderResult>> {
    console.log('🔄 [REORDER API] Re-ordering full order:', orderId);
    return apiClient.post(`/orders/${orderId}/reorder`, {});
  }

  // Re-order selected items
  async reorderSelectedItems(
    orderId: string,
    itemIds: string[]
  ): Promise<ApiResponse<ReorderResult>> {
    console.log('🔄 [REORDER API] Re-ordering selected items:', orderId, itemIds);
    return apiClient.post(`/orders/${orderId}/reorder/items`, { itemIds });
  }

  // Get frequently ordered items
  async getFrequentlyOrdered(
    limit: number = 10
  ): Promise<ApiResponse<FrequentlyOrderedItem[]>> {
    console.log('📊 [REORDER API] Getting frequently ordered items');
    return apiClient.get('/orders/reorder/frequently-ordered', { limit });
  }

  // Get reorder suggestions
  async getReorderSuggestions(): Promise<ApiResponse<ReorderSuggestion[]>> {
    console.log('💡 [REORDER API] Getting reorder suggestions');
    return apiClient.get('/orders/reorder/suggestions');
  }
}

// Create singleton instance
const reorderService = new ReorderService();

export default reorderService;
