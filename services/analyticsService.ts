/**
 * Analytics Service
 *
 * Comprehensive analytics and event tracking system
 * Features:
 * - User behavior tracking
 * - Product interaction events
 * - Purchase funnel tracking
 * - Session management
 * - Error tracking
 * - Performance metrics
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

export interface ProductViewEvent {
  productId: string;
  productName: string;
  productPrice: number;
  category: string;
  brand: string;
  variantId?: string;
  referrer?: string;
  timeSpent?: number;
}

export interface AddToCartEvent {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  variantId?: string;
  variantDetails?: string;
  totalValue: number;
}

export interface PurchaseEvent {
  orderId: string;
  products: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  paymentMethod: string;
  currency: string;
}

export interface ShareEvent {
  productId: string;
  platform: string;
  referralCode?: string;
}

class AnalyticsService {
  private sessionId: string;
  private userId: string | null = null;
  private sessionStartTime: Date;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
    console.log('📊 [Analytics] Service initialized with session:', this.sessionId);
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
    console.log('👤 [Analytics] User ID set:', userId);
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    console.log(`📊 [Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  track(eventName: string, properties?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    console.log('📊 [Analytics] Event tracked:', eventName, properties);
  }

  trackPageView(pageName: string, properties?: Record<string, any>) {
    this.track('page_view', { page: pageName, ...properties });
  }

  trackProductView(data: ProductViewEvent) {
    this.track('product_view', {
      product_id: data.productId,
      product_name: data.productName,
      product_price: data.productPrice,
      category: data.category,
      brand: data.brand,
      variant_id: data.variantId,
      referrer: data.referrer,
      time_spent: data.timeSpent,
    });
  }

  trackAddToCart(data: AddToCartEvent) {
    this.track('add_to_cart', {
      product_id: data.productId,
      product_name: data.productName,
      price: data.price,
      quantity: data.quantity,
      variant_id: data.variantId,
      variant_details: data.variantDetails,
      total_value: data.totalValue,
      currency: 'INR',
    });
  }

  trackRemoveFromCart(productId: string, productName: string, quantity: number) {
    this.track('remove_from_cart', { product_id: productId, product_name: productName, quantity });
  }

  trackPurchase(data: PurchaseEvent) {
    this.track('purchase', {
      order_id: data.orderId,
      products: data.products,
      total_amount: data.totalAmount,
      payment_method: data.paymentMethod,
      currency: data.currency,
    });
  }

  trackWishlist(action: 'add' | 'remove', productId: string, productName: string) {
    this.track(`wishlist_${action}`, { product_id: productId, product_name: productName });
  }

  trackShare(data: ShareEvent) {
    this.track('product_share', {
      product_id: data.productId,
      platform: data.platform,
      referral_code: data.referralCode,
    });
  }

  trackVariantSelection(productId: string, variantId: string, attributes: Record<string, string>) {
    this.track('variant_selected', { product_id: productId, variant_id: variantId, attributes });
  }

  trackSizeGuideView(productId: string, tab?: string) {
    this.track('size_guide_view', { product_id: productId, tab });
  }

  trackQAInteraction(action: 'view' | 'ask' | 'answer' | 'vote', productId: string, questionId?: string) {
    this.track('qa_interaction', { action, product_id: productId, question_id: questionId });
  }

  trackReviewInteraction(
    action: 'view' | 'write' | 'helpful' | 'filter' | 'sort',
    productId: string,
    reviewId?: string,
    rating?: number
  ) {
    this.track('review_interaction', { action, product_id: productId, review_id: reviewId, rating });
  }

  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>) {
    this.track('search', { query, results_count: resultsCount, filters });
  }

  trackImageInteraction(action: 'view' | 'zoom' | 'swipe', productId: string, imageIndex: number) {
    this.track('image_interaction', { action, product_id: productId, image_index: imageIndex });
  }

  trackVideoInteraction(
    action: 'play' | 'pause' | 'complete' | 'skip',
    productId: string,
    videoId?: string,
    duration?: number
  ) {
    this.track('video_interaction', { action, product_id: productId, video_id: videoId, duration });
  }

  trackDeliveryCheck(productId: string, pinCode: string, isAvailable: boolean) {
    this.track('delivery_check', { product_id: productId, pin_code: pinCode, is_available: isAvailable });
  }

  trackStockNotification(productId: string, variantId?: string, notificationMethod?: string) {
    this.track('stock_notification_request', {
      product_id: productId,
      variant_id: variantId,
      notification_method: notificationMethod,
    });
  }

  trackError(error: Error, context?: Record<string, any>) {
    this.track('error', { error_message: error.message, error_stack: error.stack, ...context });
  }

  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance', { metric, value, unit });
  }

  trackSessionEnd() {
    const sessionDuration = Date.now() - this.sessionStartTime.getTime();
    this.track('session_end', { duration: sessionDuration, events_count: this.eventQueue.length });
  }

  getSessionStats() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.sessionStartTime,
      duration: Date.now() - this.sessionStartTime.getTime(),
      eventsCount: this.eventQueue.length,
    };
  }

  async flush() {
    if (this.eventQueue.length === 0) return;
    console.log(`📊 [Analytics] Flushing ${this.eventQueue.length} events`);
    this.eventQueue = [];
  }
}

const analyticsService = new AnalyticsService();
export default analyticsService;
