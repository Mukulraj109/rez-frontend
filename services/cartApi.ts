// Cart API Service
// Handles shopping cart operations and management

import apiClient, { ApiResponse } from './apiClient';

export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  product: {
    id: string;
    name: string;
    description: string;
    images: Array<{
      id: string;
      url: string;
      alt: string;
      isMain: boolean;
    }>;
    store: {
      id: string;
      name: string;
    };
  };
  variant?: {
    id: string;
    name: string;
    sku: string;
    price: number;
    comparePrice?: number;
    attributes: Record<string, any>;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  summary: {
    itemsCount: number;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  coupon?: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    appliedAmount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartRequest {
  productId: string;
  variantId?: string;
  quantity: number;
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
    return apiClient.post('/cart/items', data);
  }

  // Update cart item quantity
  async updateCartItem(
    itemId: string, 
    data: UpdateCartItemRequest
  ): Promise<ApiResponse<Cart>> {
    return apiClient.patch(`/cart/items/${itemId}`, data);
  }

  // Remove item from cart
  async removeCartItem(itemId: string): Promise<ApiResponse<Cart>> {
    return apiClient.delete(`/cart/items/${itemId}`);
  }

  // Clear entire cart
  async clearCart(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.delete('/cart');
  }

  // Apply coupon to cart
  async applyCoupon(data: ApplyCouponRequest): Promise<ApiResponse<Cart>> {
    return apiClient.post('/cart/coupon', data);
  }

  // Remove coupon from cart
  async removeCoupon(): Promise<ApiResponse<Cart>> {
    return apiClient.delete('/cart/coupon');
  }

  // Get shipping estimates
  async getShippingEstimates(
    zipCode?: string,
    country?: string
  ): Promise<ApiResponse<ShippingEstimate[]>> {
    return apiClient.get('/cart/shipping-estimates', {
      zipCode,
      country
    });
  }

  // Move item to wishlist
  async moveToWishlist(itemId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(`/cart/items/${itemId}/move-to-wishlist`);
  }

  // Save cart for later (guest to user conversion)
  async saveCartForLater(): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post('/cart/save-for-later');
  }

  // Merge guest cart with user cart
  async mergeCart(guestCartId: string): Promise<ApiResponse<Cart>> {
    return apiClient.post('/cart/merge', { guestCartId });
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
    return apiClient.post('/cart/validate');
  }

  // Get cart summary for checkout
  async getCheckoutSummary(): Promise<ApiResponse<{
    items: CartItem[];
    summary: Cart['summary'];
    shippingRequired: boolean;
    taxCalculated: boolean;
  }>> {
    return apiClient.get('/cart/checkout-summary');
  }
}

// Create singleton instance
const cartService = new CartService();

export default cartService;