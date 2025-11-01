// Cart API Service
// Handles shopping cart operations and management

import apiClient, { ApiResponse } from './apiClient';

export interface CartItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images?: Array<{
      id: string;
      url: string;
      alt: string;
      isMain: boolean;
    }>;
    pricing: {
      currency: string;
    };
    inventory: {
      stock: number;
      isAvailable: boolean;
    };
    isActive: boolean;
  };
  store: {
    _id: string;
    name: string;
    location?: {
      address: string;
      city: string;
      state: string;
    };
  };
  variant?: {
    type?: string;
    value?: string;
  };
  quantity: number;
  price: number;
  originalPrice?: number;
  discount?: number;
  addedAt: string;
}

export interface LockedItem {
  _id?: string;
  product: {
    _id: string;
    name: string;
    images?: Array<{
      id: string;
      url: string;
      alt: string;
      isMain: boolean;
    }>;
    pricing: {
      currency: string;
    };
    inventory: {
      stock: number;
      isAvailable: boolean;
    };
    isActive: boolean;
  };
  store: {
    _id: string;
    name: string;
    location?: {
      address: string;
      city: string;
      state: string;
    };
  };
  variant?: {
    type?: string;
    value?: string;
  };
  quantity: number;
  lockedPrice: number;
  originalPrice?: number;
  lockedAt: string;
  expiresAt: string;
  notes?: string;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  lockedItems: LockedItem[];
  totals: {
    subtotal: number;
    tax: number;
    delivery: number;
    discount: number;
    cashback: number;
    total: number;
    savings: number;
  };
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    appliedAmount: number;
    appliedAt: string;
  };
  itemCount: number;
  storeCount: number;
  isActive: boolean;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
  variant?: {
    type: string;
    value: string;
  };
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface ApplyCouponRequest {
  couponCode: string;
}

export interface ShippingEstimate {
  method: string;
  name: string;
  cost: number;
  estimatedDays: number;
  description?: string;
}

class CartService {
  // Get current user's cart
  async getCart(): Promise<ApiResponse<Cart>> {

    return apiClient.get('/cart');
  }

  // Add item to cart
  async addToCart(data: AddToCartRequest): Promise<ApiResponse<Cart>> {

    return apiClient.post('/cart/add', data);
  }

  // Update cart item quantity
  async updateCartItem(
    productId: string,
    data: UpdateCartItemRequest,
    variant?: { type: string; value: string }
  ): Promise<ApiResponse<Cart>> {

    const url = variant
      ? `/cart/item/${productId}/${encodeURIComponent(JSON.stringify(variant))}`
      : `/cart/item/${productId}`;
    return apiClient.put(url, data);
  }

  // Remove item from cart
  async removeCartItem(productId: string, variant?: { type: string; value: string }): Promise<ApiResponse<Cart>> {

    const url = variant
      ? `/cart/item/${productId}/${encodeURIComponent(JSON.stringify(variant))}`
      : `/cart/item/${productId}`;
    return apiClient.delete(url);
  }

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<{ message: string }>> {

    return apiClient.delete('/cart/clear');
  }

  // Apply coupon to cart
  async applyCoupon(data: ApplyCouponRequest): Promise<ApiResponse<Cart>> {

    return apiClient.post('/cart/coupon', data);
  }

  // Remove coupon from cart
  async removeCoupon(): Promise<ApiResponse<Cart>> {

    return apiClient.delete('/cart/coupon');
  }

  // Get cart summary
  async getCartSummary(): Promise<ApiResponse<Cart>> {

    return apiClient.get('/cart/summary');
  }

  // Validate cart items (check availability, prices)
  async validateCart(): Promise<ApiResponse<{
    valid: boolean;
    issues: Array<{
      itemId: string;
      type: 'out_of_stock' | 'price_change' | 'unavailable';
      message: string;
      currentPrice?: number;
      availableQuantity?: number;
    }>;
  }>> {

    return apiClient.get('/cart/validate');
  }

  // Get shipping estimates (placeholder - not yet implemented in backend)
  async getShippingEstimates(
    zipCode?: string,
    country?: string
  ): Promise<ApiResponse<ShippingEstimate[]>> {

    // This endpoint is not yet implemented in backend
    return Promise.reject(new Error('Shipping estimates not yet implemented'));
  }

  // Move item to wishlist (placeholder - not yet implemented in backend)
  async moveToWishlist(productId: string): Promise<ApiResponse<{ message: string }>> {

    // This endpoint is not yet implemented in backend
    return Promise.reject(new Error('Move to wishlist not yet implemented'));
  }

  // Save cart for later (placeholder - not yet implemented in backend)
  async saveCartForLater(): Promise<ApiResponse<{ message: string }>> {

    // This endpoint is not yet implemented in backend
    return Promise.reject(new Error('Save cart for later not yet implemented'));
  }

  // Merge guest cart with user cart (placeholder - not yet implemented in backend)
  async mergeCart(guestCartId: string): Promise<ApiResponse<Cart>> {

    // This endpoint is not yet implemented in backend
    return Promise.reject(new Error('Cart merge not yet implemented'));
  }

  // Get cart summary for checkout (use existing summary endpoint)
  async getCheckoutSummary(): Promise<ApiResponse<{
    items: CartItem[];
    summary: Cart['totals'];
    shippingRequired: boolean;
    taxCalculated: boolean;
  }>> {

    return this.getCartSummary() as any; // Use cart summary for now
  }

  // Lock item at current price
  async lockItem(data: {
    productId: string;
    quantity?: number;
    variant?: { type: string; value: string };
    lockDurationHours?: number;
  }): Promise<ApiResponse<{ cart: Cart; message: string }>> {

    return apiClient.post('/cart/lock', data);
  }

  // Get locked items
  async getLockedItems(): Promise<ApiResponse<{ lockedItems: any[] }>> {

    return apiClient.get('/cart/locked');
  }

  // Unlock item
  async unlockItem(
    productId: string,
    variant?: { type: string; value: string }
  ): Promise<ApiResponse<Cart>> {

    return apiClient.delete(`/cart/lock/${productId}`, variant ? { variant } : undefined);
  }

  // Move locked item to cart
  async moveLockedToCart(
    productId: string,
    variant?: { type: string; value: string }
  ): Promise<ApiResponse<Cart>> {

    return apiClient.post(`/cart/lock/${productId}/move-to-cart`, variant ? { variant } : {});
  }
}

// Create singleton instance
const cartService = new CartService();

export default cartService;