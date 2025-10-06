import apiClient, { ApiResponse } from './apiClient';

// ============================================================================
// COUPON API SERVICE
// ============================================================================

/**
 * Coupon Type
 */
export interface Coupon {
  _id: string;
  couponCode: string;
  title: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue: number;
  maxDiscountCap: number;
  validFrom: string;
  validTo: string;
  usageLimit: {
    totalUsage: number;
    perUser: number;
    usedCount: number;
  };
  applicableTo: {
    categories: string[];
    products: string[];
    stores: string[];
    userTiers: string[];
  };
  autoApply: boolean;
  autoApplyPriority: number;
  status: 'active' | 'inactive' | 'expired';
  termsAndConditions: string[];
  createdBy: string;
  tags: string[];
  imageUrl?: string;
  isNewlyAdded: boolean;
  isFeatured: boolean;
  viewCount: number;
  claimCount: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * User Coupon Type
 */
export interface UserCoupon {
  _id: string;
  user: string;
  coupon: Coupon;
  claimedDate: string;
  expiryDate: string;
  usedDate: string | null;
  usedInOrder: string | null;
  status: 'available' | 'used' | 'expired';
  notifications: {
    expiryReminder: boolean;
    expiryReminderSent: string | null;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Get Coupons Filters
 */
export interface GetCouponsFilters {
  category?: string;
  tag?: string;
  featured?: boolean;
}

/**
 * Get Coupons Response
 */
export interface GetCouponsResponse {
  coupons: Coupon[];
  total: number;
}

/**
 * Get My Coupons Filters
 */
export interface GetMyCouponsFilters {
  status?: 'available' | 'used' | 'expired';
}

/**
 * Get My Coupons Response
 */
export interface GetMyCouponsResponse {
  coupons: UserCoupon[];
  summary: {
    total: number;
    available: number;
    used: number;
    expired: number;
  };
}

/**
 * Cart Item for Validation
 */
export interface CartItem {
  product: string;
  quantity: number;
  price: number;
  category?: string;
  store?: string;
}

/**
 * Cart Data for Validation
 */
export interface CartData {
  items: CartItem[];
  subtotal: number;
}

/**
 * Validate Coupon Request
 */
export interface ValidateCouponRequest {
  couponCode: string;
  cartData: CartData;
}

/**
 * Validate Coupon Response
 */
export interface ValidateCouponResponse {
  discount: number;
  coupon: {
    code: string;
    type: 'PERCENTAGE' | 'FIXED';
    value: number;
  };
}

/**
 * Best Offer Response
 */
export interface BestOfferResponse {
  coupon: Coupon;
  discount: number;
}

/**
 * Search Coupons Filters
 */
export interface SearchCouponsFilters {
  q: string;
  category?: string;
  tag?: string;
}

/**
 * Search Coupons Response
 */
export interface SearchCouponsResponse {
  coupons: Coupon[];
  total: number;
}

/**
 * Coupon API Service Class
 */
class CouponService {
  /**
   * Get all available coupons with optional filters
   */
  async getAvailableCoupons(
    filters?: GetCouponsFilters
  ): Promise<ApiResponse<GetCouponsResponse>> {
    console.log('🎫 [COUPON API] Getting available coupons', filters);
    return apiClient.get('/coupons', filters);
  }

  /**
   * Get featured coupons
   */
  async getFeaturedCoupons(): Promise<ApiResponse<GetCouponsResponse>> {
    console.log('⭐ [COUPON API] Getting featured coupons');
    return apiClient.get('/coupons/featured');
  }

  /**
   * Get user's claimed coupons
   */
  async getMyCoupons(
    filters?: GetMyCouponsFilters
  ): Promise<ApiResponse<GetMyCouponsResponse>> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  COUPON API - GET MY COUPONS           ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('📞 Method: getMyCoupons');
    console.log('📝 Filters:', JSON.stringify(filters, null, 2));
    console.log('🌐 Endpoint: /coupons/my-coupons');
    console.log('🔑 Auth token present:', !!apiClient.getAuthToken());
    console.log('----------------------------------------');

    try {
      const response = await apiClient.get('/coupons/my-coupons', filters);

      console.log('\n✅ [COUPON API] API Client Response:');
      console.log('Success:', response.success);
      console.log('Has data:', !!response.data);
      console.log('Error:', response.error || 'none');

      if (response.data) {
        console.log('\n📊 [COUPON API] Data received:');
        console.log('Coupons array:', Array.isArray(response.data.coupons));
        console.log('Coupons count:', response.data.coupons?.length || 0);
        console.log('Summary:', response.data.summary);
      }

      console.log('╚════════════════════════════════════════╝\n');
      return response;
    } catch (error) {
      console.error('\n❌ [COUPON API] EXCEPTION IN getMyCoupons');
      console.error('Error:', error);
      console.error('╚════════════════════════════════════════╝\n');
      throw error;
    }
  }

  /**
   * Claim a coupon
   */
  async claimCoupon(couponId: string): Promise<ApiResponse<{ userCoupon: UserCoupon }>> {
    console.log('✋ [COUPON API] Claiming coupon:', couponId);
    return apiClient.post(`/coupons/${couponId}/claim`);
  }

  /**
   * Validate coupon for cart
   */
  async validateCoupon(
    data: ValidateCouponRequest
  ): Promise<ApiResponse<ValidateCouponResponse>> {
    console.log('✔️ [COUPON API] Validating coupon:', data.couponCode);
    return apiClient.post('/coupons/validate', data);
  }

  /**
   * Get best coupon offer for cart
   */
  async getBestOffer(
    cartData: CartData
  ): Promise<ApiResponse<BestOfferResponse | null>> {
    console.log('🎁 [COUPON API] Getting best offer for cart');
    return apiClient.post('/coupons/best-offer', { cartData });
  }

  /**
   * Remove claimed coupon
   */
  async removeCoupon(couponId: string): Promise<ApiResponse<{ message: string }>> {
    console.log('🗑️ [COUPON API] Removing coupon:', couponId);
    return apiClient.delete(`/coupons/${couponId}`);
  }

  /**
   * Search coupons
   */
  async searchCoupons(
    filters: SearchCouponsFilters
  ): Promise<ApiResponse<SearchCouponsResponse>> {
    console.log('🔍 [COUPON API] Searching coupons:', filters.q);
    return apiClient.get('/coupons/search', filters);
  }

  /**
   * Get coupon details
   */
  async getCouponDetails(couponId: string): Promise<ApiResponse<Coupon>> {
    console.log('📄 [COUPON API] Getting coupon details:', couponId);
    return apiClient.get(`/coupons/${couponId}`);
  }
}

// Export singleton instance
const couponService = new CouponService();
export default couponService;
