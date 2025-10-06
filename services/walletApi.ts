import apiClient, { ApiResponse } from './apiClient';

// ============================================================================
// WALLET API SERVICE
// ============================================================================

/**
 * Coin Balance from Backend
 */
export interface BackendCoinBalance {
  type: 'wasil' | 'promotion' | 'cashback' | 'reward';
  amount: number;
  isActive: boolean;
  earnedDate?: string;
  lastUsed?: string;
  expiryDate?: string;
}

/**
 * Wallet Balance Response
 */
export interface WalletBalanceResponse {
  balance: {
    total: number;
    available: number;
    pending: number;
  };
  coins: BackendCoinBalance[];
  currency: string;
  statistics: {
    totalEarned: number;
    totalSpent: number;
    totalCashback: number;
    totalRefunds: number;
    totalTopups: number;
    totalWithdrawals: number;
  };
  limits: {
    maxBalance: number;
    dailySpendLimit: number;
    dailySpentToday: number;
    remainingToday: number;
  };
  status: {
    isActive: boolean;
    isFrozen: boolean;
    frozenReason?: string;
  };
  lastUpdated: string;
}

/**
 * Transaction Response
 */
export interface TransactionResponse {
  id: string;
  transactionId: string;
  user: string;
  type: 'credit' | 'debit';
  category: 'earning' | 'spending' | 'refund' | 'withdrawal' | 'topup' | 'bonus' | 'penalty' | 'cashback';
  amount: number;
  currency: string;
  description: string;
  source: {
    type: string;
    reference: string;
    description?: string;
    metadata?: any;
  };
  status: {
    current: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'reversed';
    history: Array<{
      status: string;
      timestamp: string;
      reason?: string;
    }>;
  };
  balanceBefore: number;
  balanceAfter: number;
  fees?: number;
  tax?: number;
  netAmount?: number;
  processingTime?: number;
  receiptUrl?: string;
  notes?: string;
  isReversible: boolean;
  reversedAt?: string;
  reversalReason?: string;
  reversalTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Transaction List Response
 */
export interface TransactionListResponse {
  transactions: TransactionResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Topup Request
 */
export interface TopupRequest {
  amount: number;
  paymentMethod?: string;
  paymentId?: string;
}

/**
 * Topup Response
 */
export interface TopupResponse {
  transaction: TransactionResponse;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
    };
    currency: string;
  };
}

/**
 * Withdrawal Request
 */
export interface WithdrawalRequest {
  amount: number;
  method: 'bank' | 'upi' | 'paypal';
  accountDetails?: string;
}

/**
 * Withdrawal Response
 */
export interface WithdrawalResponse {
  transaction: TransactionResponse;
  withdrawalId: string;
  netAmount: number;
  fees: number;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
    };
    currency: string;
  };
  estimatedProcessingTime: string;
}

/**
 * Payment Request
 */
export interface PaymentRequest {
  amount: number;
  orderId?: string;
  storeId?: string;
  storeName?: string;
  description?: string;
  items?: any[];
}

/**
 * Payment Response
 */
export interface PaymentResponse {
  transaction: TransactionResponse;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
    };
    currency: string;
  };
  paymentStatus: 'success' | 'failed' | 'pending';
}

/**
 * Transaction Summary Response
 */
export interface TransactionSummaryResponse {
  summary: {
    summary: Array<{
      type: 'credit' | 'debit';
      totalAmount: number;
      count: number;
      avgAmount: number;
    }>;
    totalTransactions: number;
  };
  period: string;
  wallet: {
    balance: {
      total: number;
      available: number;
      pending: number;
    };
    statistics: {
      totalEarned: number;
      totalSpent: number;
      totalCashback: number;
      totalRefunds: number;
      totalTopups: number;
      totalWithdrawals: number;
    };
  } | null;
}

/**
 * Wallet Settings Request
 */
export interface WalletSettingsRequest {
  autoTopup?: boolean;
  autoTopupThreshold?: number;
  autoTopupAmount?: number;
  lowBalanceAlert?: boolean;
  lowBalanceThreshold?: number;
}

/**
 * Categories Breakdown Response
 */
export interface CategoriesBreakdownResponse {
  categories: Array<{
    _id: string;
    totalAmount: number;
    count: number;
    avgAmount: number;
  }>;
  totalCategories: number;
}

/**
 * Transaction Filters
 */
export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: 'credit' | 'debit';
  category?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Wallet API Service Class
 */
class WalletService {
  /**
   * Get wallet balance and status
   */
  async getBalance(): Promise<ApiResponse<WalletBalanceResponse>> {
    console.log('💰 [WALLET API] Getting wallet balance');
    return apiClient.get('/wallet/balance');
  }

  /**
   * Get transaction history with optional filters
   */
  async getTransactions(
    filters?: TransactionFilters
  ): Promise<ApiResponse<TransactionListResponse>> {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  WALLET API - GET TRANSACTIONS         ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('📞 Method: getTransactions');
    console.log('📝 Filters:', JSON.stringify(filters, null, 2));
    console.log('🌐 Endpoint: /wallet/transactions');
    console.log('🔑 Auth token present:', !!apiClient.getAuthToken());
    console.log('🔑 Token preview:', apiClient.getAuthToken()?.substring(0, 30) + '...' || 'NONE');
    console.log('----------------------------------------');

    try {
      const response = await apiClient.get('/wallet/transactions', filters);

      console.log('\n✅ [WALLET API] API Client Response:');
      console.log('Success:', response.success);
      console.log('Has data:', !!response.data);
      console.log('Error:', response.error || 'none');
      console.log('Message:', response.message || 'none');

      if (response.data) {
        console.log('\n📊 [WALLET API] Data received:');
        console.log('Transactions array:', Array.isArray(response.data.transactions));
        console.log('Transactions count:', response.data.transactions?.length || 0);
        console.log('Has pagination:', !!response.data.pagination);
        if (response.data.pagination) {
          console.log('Pagination:', JSON.stringify(response.data.pagination, null, 2));
        }
      }

      console.log('╚════════════════════════════════════════╝\n');
      return response;
    } catch (error) {
      console.error('\n❌❌❌ [WALLET API] EXCEPTION IN getTransactions ❌❌❌');
      console.error('Error:', error);
      console.error('╚════════════════════════════════════════╝\n');
      throw error;
    }
  }

  /**
   * Get single transaction by ID
   */
  async getTransactionById(
    transactionId: string
  ): Promise<ApiResponse<{ transaction: TransactionResponse }>> {
    console.log('🔍 [WALLET API] Getting transaction:', transactionId);
    return apiClient.get(`/wallet/transaction/${transactionId}`);
  }

  /**
   * Topup wallet
   */
  async topup(data: TopupRequest): Promise<ApiResponse<TopupResponse>> {
    console.log('💵 [WALLET API] Topup wallet:', data);
    return apiClient.post('/wallet/topup', data);
  }

  /**
   * Withdraw funds from wallet
   */
  async withdraw(
    data: WithdrawalRequest
  ): Promise<ApiResponse<WithdrawalResponse>> {
    console.log('💸 [WALLET API] Withdraw funds:', data);
    return apiClient.post('/wallet/withdraw', data);
  }

  /**
   * Process payment (deduct from wallet)
   */
  async processPayment(
    data: PaymentRequest
  ): Promise<ApiResponse<PaymentResponse>> {
    console.log('💳 [WALLET API] Processing payment:', data);
    return apiClient.post('/wallet/payment', data);
  }

  /**
   * Get transaction summary/statistics
   */
  async getSummary(
    period: 'day' | 'week' | 'month' | 'year' = 'month'
  ): Promise<ApiResponse<TransactionSummaryResponse>> {
    console.log('📊 [WALLET API] Getting summary:', period);
    return apiClient.get('/wallet/summary', { period });
  }

  /**
   * Update wallet settings
   */
  async updateSettings(
    settings: WalletSettingsRequest
  ): Promise<ApiResponse<{ settings: any }>> {
    console.log('⚙️ [WALLET API] Updating settings:', settings);
    return apiClient.put('/wallet/settings', settings);
  }

  /**
   * Get spending breakdown by categories
   */
  async getCategoriesBreakdown(): Promise<
    ApiResponse<CategoriesBreakdownResponse>
  > {
    console.log('📊 [WALLET API] Getting categories breakdown');
    return apiClient.get('/wallet/categories');
  }
}

// Export singleton instance
const walletService = new WalletService();
export default walletService;