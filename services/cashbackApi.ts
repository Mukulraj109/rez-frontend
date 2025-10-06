import apiClient, { ApiResponse } from './apiClient';

// ============================================================================
// CASHBACK API SERVICE
// ============================================================================

/**
 * Cashback Metadata
 */
export interface CashbackMetadata {
  orderAmount: number;
  productCategories: string[];
  storeId?: string;
  storeName?: string;
  campaignId?: string;
  campaignName?: string;
  bonusMultiplier?: number;
}

/**
 * User Cashback
 */
export interface UserCashback {
  _id: string;
  user: string;
  order?: {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
  };
  amount: number;
  cashbackRate: number;
  source: 'order' | 'referral' | 'promotion' | 'special_offer' | 'bonus' | 'signup';
  status: 'pending' | 'credited' | 'expired' | 'cancelled';
  earnedDate: string;
  creditedDate?: string;
  expiryDate: string;
  description: string;
  transaction?: string;
  metadata: CashbackMetadata;
  pendingDays: number;
  isRedeemed: boolean;
  redeemedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Cashback Summary
 */
export interface CashbackSummary {
  totalEarned: number;
  pending: number;
  credited: number;
  expired: number;
  cancelled: number;
  pendingCount: number;
  creditedCount: number;
  expiredCount: number;
  cancelledCount: number;
}

/**
 * Cashback Campaign
 */
export interface CashbackCampaign {
  id: string;
  name: string;
  description: string;
  cashbackRate: number;
  validFrom: string;
  validTo: string;
  categories: string[];
  isActive: boolean;
  daysOfWeek?: number[];
}

/**
 * Cashback History Filters
 */
export interface CashbackHistoryFilters {
  status?: 'pending' | 'credited' | 'expired' | 'cancelled';
  source?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * Cashback History Response
 */
export interface CashbackHistoryResponse {
  cashbacks: UserCashback[];
  total: number;
  pages: number;
}

/**
 * Pending Cashback Response
 */
export interface PendingCashbackResponse {
  cashbacks: UserCashback[];
  totalAmount: number;
  count: number;
}

/**
 * Redeem Response
 */
export interface RedeemCashbackResponse {
  totalAmount: number;
  count: number;
  cashbacks: UserCashback[];
}

/**
 * Forecast Response
 */
export interface ForecastCashbackResponse {
  estimatedCashback: number;
  cashbackRate: number;
  description: string;
}

/**
 * Statistics Response
 */
export interface CashbackStatistics {
  period: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  totalCount: number;
  averagePerTransaction: number;
}

/**
 * Cashback API Service Class
 */
class CashbackService {
  /**
   * Get cashback summary
   */
  async getCashbackSummary(): Promise<ApiResponse<CashbackSummary>> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  CASHBACK API - GET SUMMARY            ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('📞 Method: getCashbackSummary');
    console.log('🌐 Endpoint: /cashback/summary');
    console.log('🔑 Auth token present:', !!apiClient.getAuthToken());
    console.log('----------------------------------------');

    try {
      const response = await apiClient.get('/cashback/summary');

      console.log('\n✅ [CASHBACK API] API Client Response:');
      console.log('Success:', response.success);
      console.log('Has data:', !!response.data);
      console.log('Error:', response.error || 'none');

      if (response.data) {
        console.log('\n📊 [CASHBACK API] Summary data:');
        console.log('Total Earned:', response.data.totalEarned);
        console.log('Pending:', response.data.pending);
        console.log('Credited:', response.data.credited);
      }

      console.log('╚════════════════════════════════════════╝\n');
      return response;
    } catch (error) {
      console.error('\n❌ [CASHBACK API] EXCEPTION IN getCashbackSummary');
      console.error('Error:', error);
      console.error('╚════════════════════════════════════════╝\n');
      throw error;
    }
  }

  /**
   * Get cashback history
   */
  async getCashbackHistory(
    filters?: CashbackHistoryFilters
  ): Promise<ApiResponse<CashbackHistoryResponse>> {
    console.log('📜 [CASHBACK API] Getting cashback history', filters);
    return apiClient.get('/cashback/history', filters);
  }

  /**
   * Get pending cashback
   */
  async getPendingCashback(): Promise<ApiResponse<PendingCashbackResponse>> {
    console.log('⏳ [CASHBACK API] Getting pending cashback');
    return apiClient.get('/cashback/pending');
  }

  /**
   * Get expiring soon cashback
   */
  async getExpiringSoon(days: number = 7): Promise<ApiResponse<PendingCashbackResponse>> {
    console.log('⚠️ [CASHBACK API] Getting expiring soon cashback');
    return apiClient.get('/cashback/expiring-soon', { days });
  }

  /**
   * Redeem pending cashback
   */
  async redeemCashback(): Promise<ApiResponse<RedeemCashbackResponse>> {
    console.log('💰 [CASHBACK API] Redeeming pending cashback');
    return apiClient.post('/cashback/redeem');
  }

  /**
   * Get active campaigns
   */
  async getActiveCampaigns(): Promise<ApiResponse<{ campaigns: CashbackCampaign[] }>> {
    console.log('🎯 [CASHBACK API] Getting active campaigns');
    return apiClient.get('/cashback/campaigns');
  }

  /**
   * Forecast cashback for cart
   */
  async forecastCashback(cartData: {
    items: Array<{
      product: any;
      quantity: number;
      price: number;
    }>;
    subtotal: number;
  }): Promise<ApiResponse<ForecastCashbackResponse>> {
    console.log('🔮 [CASHBACK API] Forecasting cashback for cart');
    return apiClient.post('/cashback/forecast', { cartData });
  }

  /**
   * Get cashback statistics
   */
  async getStatistics(
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ApiResponse<CashbackStatistics>> {
    console.log('📊 [CASHBACK API] Getting cashback statistics', period);
    return apiClient.get('/cashback/statistics', { period });
  }
}

// Export singleton instance
const cashbackService = new CashbackService();
export default cashbackService;
