/**
 * Data Mappers
 * Transform data between backend API responses and frontend component types
 */

import { Cart as BackendCart, CartItem as BackendCartItem } from '@/services/cartApi';
import { Order as BackendOrder, CreateOrderRequest } from '@/services/ordersApi';

// ============================================
// CART MAPPERS
// ============================================

/**
 * Map backend cart item to frontend cart item format
 */
export function mapBackendCartItemToFrontend(backendItem: BackendCartItem): any {
  // Handle both string array and object array for images
  console.log('🖼️ [MAPPER] Processing cart item:', {
    productId: backendItem.product._id,
    productName: backendItem.product.name,
    hasImages: !!backendItem.product.images,
    imagesLength: backendItem.product.images?.length,
    firstImage: backendItem.product.images?.[0],
    firstImageType: typeof backendItem.product.images?.[0],
    fullProduct: backendItem.product
  });

  const imageUrl = backendItem.product.images?.[0]
    ? (typeof backendItem.product.images[0] === 'string'
        ? backendItem.product.images[0]
        : (backendItem.product.images[0] as any)?.url || '')
    : '';

  console.log('🖼️ [MAPPER] Mapped image URL:', imageUrl);

  return {
    id: backendItem._id,
    productId: backendItem.product._id,
    name: backendItem.product.name,
    image: imageUrl,
    price: backendItem.price,
    originalPrice: backendItem.originalPrice || backendItem.price,
    discount: backendItem.discount || 0,
    quantity: backendItem.quantity,
    store: {
      id: backendItem.store._id,
      name: backendItem.store.name,
      location: backendItem.store.location,
    },
    variant: backendItem.variant,
    addedAt: backendItem.addedAt,
    // Calculated fields
    subtotal: backendItem.price * backendItem.quantity,
    savings: backendItem.originalPrice
      ? (backendItem.originalPrice - backendItem.price) * backendItem.quantity
      : 0,
  };
}

/**
 * Map backend cart to frontend cart format
 */
export function mapBackendCartToFrontend(backendCart: BackendCart): any {
  return {
    id: backendCart._id,
    userId: backendCart.user,
    items: backendCart.items.map(mapBackendCartItemToFrontend),
    totals: {
      subtotal: backendCart.totals.subtotal,
      tax: backendCart.totals.tax,
      shipping: backendCart.totals.delivery, // Map delivery -> shipping
      discount: backendCart.totals.discount,
      cashback: backendCart.totals.cashback,
      total: backendCart.totals.total,
      savings: backendCart.totals.savings,
    },
    coupon: backendCart.coupon ? {
      code: backendCart.coupon.code,
      discountType: backendCart.coupon.discountType,
      discountValue: backendCart.coupon.discountValue,
      appliedAmount: backendCart.coupon.appliedAmount,
      appliedAt: backendCart.coupon.appliedAt,
    } : null,
    itemCount: backendCart.itemCount,
    storeCount: backendCart.storeCount,
    isActive: backendCart.isActive,
    expiresAt: backendCart.expiresAt,
    createdAt: backendCart.createdAt,
    updatedAt: backendCart.updatedAt,
  };
}

// ============================================
// ORDER MAPPERS
// ============================================

/**
 * Map frontend checkout data to backend order request
 */
export function mapFrontendCheckoutToBackendOrder(checkoutData: {
  deliveryAddress: any;
  paymentMethod: string;
  specialInstructions?: string;
  couponCode?: string;
}): CreateOrderRequest {
  return {
    deliveryAddress: {
      name: checkoutData.deliveryAddress.name ||
            `${checkoutData.deliveryAddress.firstName || ''} ${checkoutData.deliveryAddress.lastName || ''}`.trim(),
      phone: checkoutData.deliveryAddress.phone || checkoutData.deliveryAddress.phoneNumber,
      addressLine1: checkoutData.deliveryAddress.addressLine1 || checkoutData.deliveryAddress.address1,
      addressLine2: checkoutData.deliveryAddress.addressLine2 || checkoutData.deliveryAddress.address2,
      city: checkoutData.deliveryAddress.city,
      state: checkoutData.deliveryAddress.state,
      pincode: checkoutData.deliveryAddress.pincode || checkoutData.deliveryAddress.zipCode,
      landmark: checkoutData.deliveryAddress.landmark,
      addressType: checkoutData.deliveryAddress.addressType || 'home',
    },
    paymentMethod: mapPaymentMethod(checkoutData.paymentMethod),
    specialInstructions: checkoutData.specialInstructions,
    couponCode: checkoutData.couponCode,
  };
}

/**
 * Map payment method names
 */
function mapPaymentMethod(method: string): 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking' {
  const methodMap: { [key: string]: 'cod' | 'card' | 'upi' | 'wallet' | 'netbanking' } = {
    'cash': 'cod',
    'cash_on_delivery': 'cod',
    'cod': 'cod',
    'credit_card': 'card',
    'debit_card': 'card',
    'card': 'card',
    'upi': 'upi',
    'wallet': 'wallet',
    'net_banking': 'netbanking',
    'netbanking': 'netbanking',
  };

  const normalized = method.toLowerCase().replace(/\s+/g, '_');
  return methodMap[normalized] || 'cod';
}

/**
 * Map backend order to frontend order format
 */
export function mapBackendOrderToFrontend(backendOrder: BackendOrder): any {
  return {
    id: backendOrder.id || (backendOrder as any)._id,
    orderNumber: backendOrder.orderNumber,
    userId: backendOrder.userId || (backendOrder as any).user,
    status: mapOrderStatus(backendOrder.status),
    items: (backendOrder.items || []).map((item: any) => ({
      id: item._id || item.id,
      productId: item.product?._id || item.product,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      price: item.price,
      originalPrice: item.originalPrice,
      discount: item.discount,
      subtotal: item.subtotal,
      variant: item.variant,
      store: item.store ? {
        id: item.store._id || item.store,
        name: item.store.name,
      } : null,
    })),
    totals: {
      subtotal: backendOrder.summary?.subtotal || (backendOrder as any).totals?.subtotal || 0,
      shipping: backendOrder.summary?.shipping || (backendOrder as any).totals?.delivery || 0,
      tax: backendOrder.summary?.tax || (backendOrder as any).totals?.tax || 0,
      discount: backendOrder.summary?.discount || (backendOrder as any).totals?.discount || 0,
      cashback: (backendOrder as any).totals?.cashback || 0,
      total: backendOrder.summary?.total || (backendOrder as any).totals?.total || 0,
    },
    deliveryAddress: mapBackendAddressToFrontend((backendOrder as any).delivery?.address || backendOrder.shippingAddress),
    payment: {
      method: (backendOrder as any).payment?.method || 'cod',
      status: backendOrder.paymentStatus || (backendOrder as any).payment?.status || 'pending',
    },
    delivery: {
      status: (backendOrder as any).delivery?.status || 'pending',
      estimatedTime: (backendOrder as any).delivery?.estimatedTime,
      deliveredAt: (backendOrder as any).delivery?.deliveredAt,
    },
    timeline: (backendOrder.timeline || []).map((entry: any) => ({
      status: entry.status,
      message: entry.message,
      timestamp: entry.timestamp,
    })),
    couponCode: (backendOrder as any).couponCode || backendOrder.coupon?.code,
    specialInstructions: (backendOrder as any).specialInstructions || backendOrder.notes,
    cancellation: (backendOrder as any).cancellation,
    rating: (backendOrder as any).rating,
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt,
  };
}

/**
 * Map order status from backend to frontend
 */
function mapOrderStatus(backendStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'placed': 'pending',
    'confirmed': 'confirmed',
    'preparing': 'processing',
    'ready': 'processing',
    'dispatched': 'shipped',
    'delivered': 'delivered',
    'cancelled': 'cancelled',
    'returned': 'refunded',
    'refunded': 'refunded',
  };

  return statusMap[backendStatus] || backendStatus;
}

/**
 * Map backend address to frontend address format
 */
function mapBackendAddressToFrontend(backendAddress: any): any {
  if (!backendAddress) return null;

  return {
    name: backendAddress.name,
    firstName: backendAddress.name?.split(' ')[0] || '',
    lastName: backendAddress.name?.split(' ').slice(1).join(' ') || '',
    phone: backendAddress.phone,
    phoneNumber: backendAddress.phone,
    addressLine1: backendAddress.addressLine1 || backendAddress.address1,
    address1: backendAddress.addressLine1 || backendAddress.address1,
    addressLine2: backendAddress.addressLine2 || backendAddress.address2,
    address2: backendAddress.addressLine2 || backendAddress.address2,
    city: backendAddress.city,
    state: backendAddress.state,
    pincode: backendAddress.pincode,
    zipCode: backendAddress.pincode || backendAddress.zipCode,
    country: backendAddress.country || 'India',
    landmark: backendAddress.landmark,
    addressType: backendAddress.addressType || 'home',
  };
}

/**
 * Map orders list response
 */
export function mapBackendOrdersListToFrontend(backendResponse: any): any {
  return {
    orders: (backendResponse.orders || []).map(mapBackendOrderToFrontend),
    pagination: backendResponse.pagination || {
      page: 1,
      limit: 20,
      total: backendResponse.orders?.length || 0,
      totalPages: 1,
    },
    stats: backendResponse.summary || backendResponse.stats,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = '₹'): string {
  return `${currency}${price.toFixed(2)}`;
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate savings percentage
 */
export function calculateSavingsPercentage(original: number, current: number): number {
  if (original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}