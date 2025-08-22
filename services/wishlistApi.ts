// Wishlist API Service
// Handles user favorites, bookmarks, and wish lists

import apiClient, { ApiResponse } from './apiClient';

export interface WishlistItem {
  id: string;
  userId: string;
  itemType: 'product' | 'video' | 'store' | 'project';
  itemId: string;
  item: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    price?: number;
    rating?: number;
    availability?: 'available' | 'out_of_stock' | 'discontinued';
    type: WishlistItem['itemType'];
  };
  category?: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  isPublic: boolean;
  addedAt: string;
  updatedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isPublic: boolean;
  items: WishlistItem[];
  itemCount: number;
  totalValue?: number;
  tags: string[];
  sharedWith: Array<{
    userId: string;
    userName: string;
    permissions: 'view' | 'edit';
    sharedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistsQuery {
  page?: number;
  limit?: number;
  userId?: string;
  itemType?: WishlistItem['itemType'];
  category?: string;
  search?: string;
  tags?: string[];
  priority?: WishlistItem['priority'];
  availability?: WishlistItem['item']['availability'];
  sort?: 'newest' | 'oldest' | 'name' | 'price_high' | 'price_low' | 'priority';
  order?: 'asc' | 'desc';
  isPublic?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface WishlistsResponse {
  items: WishlistItem[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalItems: number;
    totalValue: number;
    availableItems: number;
    outOfStockItems: number;
    byType: Record<WishlistItem['itemType'], number>;
    byPriority: Record<WishlistItem['priority'], number>;
  };
  filters: {
    categories: Array<{ name: string; count: number }>;
    tags: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
  };
}

export interface CreateWishlistRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface AddToWishlistRequest {
  itemType: WishlistItem['itemType'];
  itemId: string;
  wishlistId?: string; // if not provided, adds to default wishlist
  notes?: string;
  priority?: WishlistItem['priority'];
  tags?: string[];
}

export interface WishlistAnalytics {
  overview: {
    totalWishlists: number;
    totalItems: number;
    totalValue: number;
    averageItemsPerWishlist: number;
  };
  trends: {
    itemsAddedOverTime: Array<{
      date: string;
      count: number;
    }>;
    popularCategories: Array<{
      category: string;
      count: number;
      growth: number;
    }>;
    priceDistribution: Record<string, number>;
  };
  behavior: {
    addToCartRate: number;
    purchaseRate: number;
    averageTimeToAction: number;
    shareRate: number;
  };
  insights: Array<{
    type: 'trending_item' | 'price_drop' | 'back_in_stock';
    title: string;
    description: string;
    actionable: boolean;
  }>;
}

class WishlistService {
  // Get user's wishlists
  async getWishlists(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    wishlists: Wishlist[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get('/wishlist', { page, limit });
  }

  // Get specific wishlist
  async getWishlistById(wishlistId: string): Promise<ApiResponse<Wishlist>> {
    return apiClient.get(`/wishlist/${wishlistId}`);
  }

  // Get default wishlist
  async getDefaultWishlist(): Promise<ApiResponse<Wishlist>> {
    return apiClient.get('/wishlist/default');
  }

  // Create new wishlist
  async createWishlist(data: CreateWishlistRequest): Promise<ApiResponse<Wishlist>> {
    return apiClient.post('/wishlist', data);
  }

  // Update wishlist
  async updateWishlist(
    wishlistId: string,
    updates: Partial<CreateWishlistRequest>
  ): Promise<ApiResponse<Wishlist>> {
    return apiClient.patch(`/wishlist/${wishlistId}`, updates);
  }

  // Delete wishlist
  async deleteWishlist(wishlistId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/wishlist/${wishlistId}`);
  }

  // Get wishlist items with filtering
  async getWishlistItems(
    wishlistId?: string,
    query: WishlistsQuery = {}
  ): Promise<ApiResponse<WishlistsResponse>> {
    const endpoint = wishlistId ? `/wishlist/${wishlistId}/items` : '/wishlist/items';
    return apiClient.get(endpoint, query);
  }

  // Add item to wishlist
  async addToWishlist(data: AddToWishlistRequest): Promise<ApiResponse<WishlistItem>> {
    return apiClient.post('/wishlist/items', data);
  }

  // Remove item from wishlist
  async removeFromWishlist(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/wishlist/items/${itemId}`);
  }

  // Update wishlist item
  async updateWishlistItem(
    itemId: string,
    updates: Partial<{
      notes: string;
      priority: WishlistItem['priority'];
      tags: string[];
      category: string;
    }>
  ): Promise<ApiResponse<WishlistItem>> {
    return apiClient.patch(`/wishlist/items/${itemId}`, updates);
  }

  // Move item between wishlists
  async moveItem(
    itemId: string,
    targetWishlistId: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.patch(`/wishlist/items/${itemId}/move`, {
      targetWishlistId
    });
  }

  // Bulk operations
  async bulkAddToWishlist(
    items: AddToWishlistRequest[]
  ): Promise<ApiResponse<{
    added: number;
    failed: number;
    items: WishlistItem[];
  }>> {
    return apiClient.post('/wishlist/items/bulk', { items });
  }

  async bulkRemoveFromWishlist(
    itemIds: string[]
  ): Promise<ApiResponse<{
    removed: number;
    failed: number;
  }>> {
    return apiClient.post('/wishlist/items/bulk-remove', { itemIds });
  }

  async bulkMoveItems(
    itemIds: string[],
    targetWishlistId: string
  ): Promise<ApiResponse<{
    moved: number;
    failed: number;
  }>> {
    return apiClient.patch('/wishlist/items/bulk-move', {
      itemIds,
      targetWishlistId
    });
  }

  // Check if item is in wishlist
  async checkWishlistStatus(
    itemType: WishlistItem['itemType'],
    itemId: string
  ): Promise<ApiResponse<{
    inWishlist: boolean;
    wishlistItemId?: string;
    wishlistId?: string;
    addedAt?: string;
  }>> {
    return apiClient.get('/wishlist/check', {
      itemType,
      itemId
    });
  }

  // Get wishlist recommendations
  async getRecommendations(
    wishlistId?: string,
    limit: number = 10
  ): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    rating: number;
    type: WishlistItem['itemType'];
    reason: string;
    similarity: number;
  }>>> {
    return apiClient.get('/wishlist/recommendations', {
      wishlistId,
      limit
    });
  }

  // Share wishlist
  async shareWishlist(
    wishlistId: string,
    shareWith: Array<{
      userId: string;
      permissions: 'view' | 'edit';
    }>
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/wishlist/${wishlistId}/share`, {
      shareWith
    });
  }

  // Get shared wishlists
  async getSharedWishlists(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    wishlists: Array<Wishlist & {
      owner: {
        id: string;
        name: string;
        avatar?: string;
      };
      sharedAt: string;
      permissions: 'view' | 'edit';
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get('/wishlist/shared', { page, limit });
  }

  // Remove sharing
  async unshareWishlist(
    wishlistId: string,
    userId?: string
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/wishlist/${wishlistId}/share${userId ? `/${userId}` : ''}`);
  }

  // Get public wishlists
  async getPublicWishlists(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      userId?: string;
      tags?: string[];
      sort?: 'newest' | 'popular' | 'most_items' | 'highest_value';
    } = {}
  ): Promise<ApiResponse<{
    wishlists: Array<Wishlist & {
      owner: {
        id: string;
        name: string;
        avatar?: string;
      };
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get('/wishlist/public', query);
  }

  // Follow public wishlist
  async followWishlist(wishlistId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/wishlist/${wishlistId}/follow`);
  }

  // Unfollow wishlist
  async unfollowWishlist(wishlistId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/wishlist/${wishlistId}/follow`);
  }

  // Get followed wishlists
  async getFollowedWishlists(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    wishlists: Array<Wishlist & {
      owner: {
        id: string;
        name: string;
        avatar?: string;
      };
      followedAt: string;
    }>;
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  }>> {
    return apiClient.get('/wishlist/following', { page, limit });
  }

  // Export wishlist
  async exportWishlist(
    wishlistId: string,
    format: 'pdf' | 'csv' | 'json' = 'pdf'
  ): Promise<ApiResponse<{
    downloadUrl: string;
    filename: string;
    expiresAt: string;
  }>> {
    return apiClient.get(`/wishlist/${wishlistId}/export`, { format });
  }

  // Import wishlist
  async importWishlist(
    file: File,
    wishlistId?: string
  ): Promise<ApiResponse<{
    imported: number;
    failed: number;
    wishlistId: string;
    errors?: Array<{
      row: number;
      error: string;
    }>;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    if (wishlistId) {
      formData.append('wishlistId', wishlistId);
    }
    return apiClient.uploadFile('/wishlist/import', formData);
  }

  // Get price alerts for wishlist items
  async getPriceAlerts(
    wishlistId?: string
  ): Promise<ApiResponse<Array<{
    itemId: string;
    item: WishlistItem['item'];
    currentPrice: number;
    alertPrice: number;
    priceDrop: number;
    percentage: number;
    triggeredAt: string;
  }>>> {
    const endpoint = wishlistId ? `/wishlist/${wishlistId}/price-alerts` : '/wishlist/price-alerts';
    return apiClient.get(endpoint);
  }

  // Set price alert
  async setPriceAlert(
    itemId: string,
    alertPrice: number
  ): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/wishlist/items/${itemId}/price-alert`, {
      alertPrice
    });
  }

  // Remove price alert
  async removePriceAlert(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete(`/wishlist/items/${itemId}/price-alert`);
  }

  // Get wishlist analytics
  async getWishlistAnalytics(
    wishlistId?: string,
    dateRange?: {
      from: string;
      to: string;
    }
  ): Promise<ApiResponse<WishlistAnalytics>> {
    const endpoint = wishlistId ? `/wishlist/${wishlistId}/analytics` : '/wishlist/analytics';
    return apiClient.get(endpoint, dateRange);
  }

  // Get similar items
  async getSimilarItems(
    itemId: string,
    limit: number = 5
  ): Promise<ApiResponse<Array<{
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    rating: number;
    type: WishlistItem['itemType'];
    similarity: number;
  }>>> {
    return apiClient.get(`/wishlist/items/${itemId}/similar`, { limit });
  }

  // Clear wishlist
  async clearWishlist(wishlistId: string): Promise<ApiResponse<{ message: string; count: number }>> {
    return apiClient.delete(`/wishlist/${wishlistId}/clear`);
  }

  // Duplicate wishlist
  async duplicateWishlist(
    wishlistId: string,
    newName: string
  ): Promise<ApiResponse<Wishlist>> {
    return apiClient.post(`/wishlist/${wishlistId}/duplicate`, {
      name: newName
    });
  }

  // Merge wishlists
  async mergeWishlists(
    sourceWishlistId: string,
    targetWishlistId: string,
    deleteSource: boolean = false
  ): Promise<ApiResponse<{
    message: string;
    merged: number;
    duplicates: number;
  }>> {
    return apiClient.post('/wishlist/merge', {
      sourceWishlistId,
      targetWishlistId,
      deleteSource
    });
  }
}

// Create singleton instance
const wishlistService = new WishlistService();

export default wishlistService;