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
  id: string;
  orderNumber: string;
  userId: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded';
  items: OrderItem[];
  summary: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  shippingAddress: {
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
  timeline: Array<{
    status: string;
    message: string;
    timestamp: string;
    details?: Record<string, any>;
  }>;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    variantId?: string;
    quantity: number;
  }>;
  shippingAddress: Order['shippingAddress'];
  billingAddress: Order['billingAddress'];
  paymentMethod: {
    type: 'card' | 'wallet' | 'cod' | 'bank_transfer';
    details: Record<string, any>;
  };
  couponCode?: string;
  notes?: string;
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
  // Create new order
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

  // Get order by order number
  async getOrderByNumber(orderNumber: string): Promise<ApiResponse<Order>> {
    return apiClient.get(`/orders/number/${orderNumber}`);
  }

  // Cancel order
  async cancelOrder(
    orderId: string, 
    reason?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch(`/orders/${orderId}/cancel`, { reason });
  }

  // Update order status (admin/store owner)
  async updateOrderStatus(
    orderId: string, 
    status: Order['status'],
    notes?: string
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch(`/orders/${orderId}/status`, { status, notes });
  }

  // Add tracking information
  async addTracking(
    orderId: string, 
    tracking: {
      number: string;
      carrier: string;
      url?: string;
    }
  ): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/tracking`, tracking);
  }

  // Update tracking information
  async updateTracking(
    orderId: string, 
    tracking: {
      status?: string;
      estimatedDelivery?: string;
      location?: string;
    }
  ): Promise<ApiResponse<Order>> {
    return apiClient.patch(`/orders/${orderId}/tracking`, tracking);
  }

  // Create payment intent
  async createPaymentIntent(
    orderId: string,
    paymentMethod: string
  ): Promise<ApiResponse<PaymentIntent>> {
    return apiClient.post(`/orders/${orderId}/payment-intent`, {
      paymentMethod
    });
  }

  // Confirm payment
  async confirmPayment(
    orderId: string,
    paymentIntentId: string,
    paymentDetails?: Record<string, any>
  ): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/confirm-payment`, {
      paymentIntentId,
      paymentDetails
    });
  }

  // Request refund
  async requestRefund(data: RefundRequest): Promise<ApiResponse<{
    refundId: string;
    amount: number;
    status: string;
    estimatedDate: string;
  }>> {
    return apiClient.post('/orders/refund', data);
  }

  // Get order invoice
  async getOrderInvoice(orderId: string): Promise<ApiResponse<{
    invoiceUrl: string;
    invoiceNumber: string;
  }>> {
    return apiClient.get(`/orders/${orderId}/invoice`);
  }

  // Download order invoice
  async downloadInvoice(orderId: string): Promise<ApiResponse<Blob>> {
    return apiClient.get(`/orders/${orderId}/invoice/download`);
  }

  // Reorder (create new order from existing order)
  async reorder(orderId: string): Promise<ApiResponse<Order>> {
    return apiClient.post(`/orders/${orderId}/reorder`);
  }

  // Get order statistics
  async getOrderStatistics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    topProducts: Array<{
      productId: string;
      productName: string;
      quantity: number;
      revenue: number;
    }>;
    statusBreakdown: Record<Order['status'], number>;
  }>> {
    return apiClient.get('/orders/statistics', {
      dateFrom,
      dateTo
    });
  }

  // Track order by order number (public endpoint)
  async trackOrder(orderNumber: string): Promise<ApiResponse<{
    orderNumber: string;
    status: Order['status'];
    tracking?: Order['tracking'];
    timeline: Order['timeline'];
    estimatedDelivery?: string;
  }>> {
    return apiClient.get(`/orders/track/${orderNumber}`);
  }

  // Get delivery estimates
  async getDeliveryEstimates(
    items: Array<{ productId: string; quantity: number }>,
    shippingAddress: Partial<Order['shippingAddress']>
  ): Promise<ApiResponse<Array<{
    method: string;
    name: string;
    cost: number;
    estimatedDays: number;
    description?: string;
  }>>> {
    return apiClient.post('/orders/delivery-estimates', {
      items,
      shippingAddress
    });
  }
}

// Create singleton instance
const ordersService = new OrdersService();

export default ordersService;