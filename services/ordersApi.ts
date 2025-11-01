// Orders API Service
// Handles order creation, management, and tracking

import apiClient, { ApiResponse } from './apiClient';

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  product: {
    id: string;
    name: string;
    description: string;
    images: Array<{
      url: string;
      alt: string;
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
    attributes: Record<string, any>;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  _id: string; // MongoDB ID from backend
  id: string;
  orderNumber: string;
  userId: string;
  status: 'placed' | 'confirmed' | 'preparing' | 'ready' | 'dispatched' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded' | 'pending' | 'processing' | 'shipped';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  items: OrderItem[];
  createdAt: string; // Order creation timestamp
  updatedAt: string; // Last update timestamp
  totals: {
    subtotal: number;
    tax: number;
    delivery: number;
    discount: number;
    cashback: number;
    total: number;
    paidAmount: number;
    refundAmount: number;
  };
  summary?: { // Deprecated - use totals instead
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  payment: {
    method: 'cod' | 'wallet' | 'card' | 'upi' | 'netbanking';
    status: 'pending' | 'paid' | 'failed' | 'refunded';
  };
  delivery: {
    method: 'standard' | 'express' | 'pickup';
    status: 'pending' | 'confirmed' | 'dispatched' | 'delivered';
    address: {
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      pincode: string;
      country?: string;
      landmark?: string;
      addressType?: 'home' | 'work' | 'other';
    };
    deliveryFee: number;
    attempts: any[];
  };
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
    _id?: string;
    details?: Record<string, any>;
  }>;
  couponCode?: string;
  specialInstructions?: string;
  cancellation?: {
    reason: string;
    cancelledAt: string;
  };
  cancelReason?: string;
  cancelledAt?: string;
  shippingAddress?: { // Deprecated - use delivery.address instead
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
  };
  coupon?: {
    code: string;
    discountAmount: number;
  };
  tracking?: {
    number: string;
    carrier: string;
    url: string;
    status: string;
    estimatedDelivery?: string;
  };
  notes?: string;
}

export interface CreateOrderRequest {
  deliveryAddress: {
    name: string;
    phone: string;
    email?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
    country?: string;
    landmark?: string;
    addressType?: 'home' | 'work' | 'other';
  };
  paymentMethod: 'wallet' | 'card' | 'upi' | 'cod' | 'netbanking';
  specialInstructions?: string;
  couponCode?: string;
}

export interface OrdersQuery {
  page?: number;
  limit?: number;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sort?: 'newest' | 'oldest' | 'total_asc' | 'total_desc';
}

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  summary: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
}

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface RefundRequest {
  orderId: string;
  amount?: number;
  reason: string;
  items?: Array<{
    itemId: string;
    quantity?: number;
  }>;
}

class OrdersService {
  // Create new order from cart
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {

    return apiClient.post('/orders', data);
  }

  // Get user orders with filtering
  async getOrders(query: OrdersQuery = {}): Promise<ApiResponse<OrdersResponse>> {

    return apiClient.get('/orders', query);
  }

  // Get single order by ID
  async getOrderById(orderId: string): Promise<ApiResponse<Order>> {

    return apiClient.get(`/orders/${orderId}`);
  }

  // Get order tracking
  async getOrderTracking(orderId: string): Promise<ApiResponse<any>> {

    return apiClient.get(`/orders/${orderId}/tracking`);
  }

  // Cancel order
  async cancelOrder(
    orderId: string,
    reason?: string
  ): Promise<ApiResponse<Order>> {

    return apiClient.patch(`/orders/${orderId}/cancel`, { reason });
  }

  // Rate order
  async rateOrder(
    orderId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<Order>> {

    return apiClient.post(`/orders/${orderId}/rate`, { rating, review });
  }

  // Get order statistics
  async getOrderStats(): Promise<ApiResponse<any>> {

    return apiClient.get('/orders/stats');
  }

  // Update order status (admin/store owner)
  async updateOrderStatus(
    orderId: string,
    status: Order['status'],
    estimatedDeliveryTime?: string,
    trackingInfo?: any
  ): Promise<ApiResponse<Order>> {

    return apiClient.patch(`/orders/${orderId}/status`, {
      status,
      estimatedDeliveryTime,
      trackingInfo
    });
  }

}

// Create singleton instance
const ordersService = new OrdersService();

export default ordersService;