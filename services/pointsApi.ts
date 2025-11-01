/**
 * Points/Coins API Service
 * Centralized service for managing user points, coins, and rewards
 */

import apiClient, { ApiResponse } from './apiClient';

export interface PointsBalance {
  total: number;
  earned: number;
  spent: number;
  pending: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface PointTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'expired' | 'refunded' | 'bonus';
  amount: number;
  source:
    | 'purchase'
    | 'review'
    | 'referral'
    | 'daily_login'
    | 'achievement'
    | 'challenge'
    | 'spin_wheel'
    | 'scratch_card'
    | 'quiz'
    | 'bill_upload'
    | 'video_upload'
    | 'social_share'
    | 'bonus'
    | 'admin';
  description: string;
  metadata?: {
    orderId?: string;
    reviewId?: string;
    referralId?: string;
    achievementId?: string;
    challengeId?: string;
    productId?: string;
    storeId?: string;
    [key: string]: any;
  };
  status: 'pending' | 'completed' | 'cancelled' | 'expired';
  expiresAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface PointsStats {
  totalEarned: number;
  totalSpent: number;
  currentBalance: number;
  pendingBalance: number;
  todayEarned: number;
  weekEarned: number;
  monthEarned: number;
  averagePerDay: number;
  topSource: string;
  transactionCount: number;
  recentTransactions: PointTransaction[];
}

export interface EarnPointsRequest {
  amount: number;
  source: PointTransaction['source'];
  description: string;
  metadata?: PointTransaction['metadata'];
}

export interface SpendPointsRequest {
  amount: number;
  purpose: string;
  description: string;
  metadata?: PointTransaction['metadata'];
}

export interface PointsReward {
  points: number;
  multiplier?: number;
  bonus?: number;
  reason: string;
  unlocked?: {
    achievements: string[];
    badges: string[];
    tier?: string;
  };
}

class PointsApiService {
  private baseUrl = '/points';

  /**
   * Get user's current points balance
   */
  async getBalance(): Promise<ApiResponse<PointsBalance>> {
    try {

      return await apiClient.get(`${this.baseUrl}/balance`);
    } catch (error) {
      console.error('[POINTS API] Error fetching balance:', error);
      throw error;
    }
  }

  /**
   * Get points transaction history with pagination
   */
  async getTransactions(
    page: number = 1,
    limit: number = 20,
    filters?: {
      type?: PointTransaction['type'];
      source?: PointTransaction['source'];
      status?: PointTransaction['status'];
      startDate?: string;
      endDate?: string;
    }
  ): Promise<
    ApiResponse<{
      transactions: PointTransaction[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/transactions`, {
        page,
        limit,
        ...filters,
      });
    } catch (error) {
      console.error('[POINTS API] Error fetching transactions:', error);
      throw error;
    }
  }

  /**
   * Get points statistics and analytics
   */
  async getStats(): Promise<ApiResponse<PointsStats>> {
    try {

      return await apiClient.get(`${this.baseUrl}/stats`);
    } catch (error) {
      console.error('[POINTS API] Error fetching stats:', error);
      throw error;
    }
  }

  /**
   * Award points to user (called by system/triggers)
   */
  async earnPoints(data: EarnPointsRequest): Promise<ApiResponse<PointsReward>> {
    try {

      return await apiClient.post(`${this.baseUrl}/earn`, data);
    } catch (error) {
      console.error('[POINTS API] Error earning points:', error);
      throw error;
    }
  }

  /**
   * Spend points (for redemptions, purchases, etc.)
   */
  async spendPoints(data: SpendPointsRequest): Promise<
    ApiResponse<{
      success: boolean;
      pointsSpent: number;
      newBalance: number;
      transaction: PointTransaction;
    }>
  > {
    try {

      return await apiClient.post(`${this.baseUrl}/spend`, data);
    } catch (error) {
      console.error('[POINTS API] Error spending points:', error);
      throw error;
    }
  }

  /**
   * Calculate potential points for an action
   */
  async calculatePoints(
    source: PointTransaction['source'],
    metadata?: any
  ): Promise<ApiResponse<{ estimatedPoints: number; multiplier: number; breakdown: any }>> {
    try {

      return await apiClient.post(`${this.baseUrl}/calculate`, {
        source,
        metadata,
      });
    } catch (error) {
      console.error('[POINTS API] Error calculating points:', error);
      throw error;
    }
  }

  /**
   * Claim pending points
   */
  async claimPendingPoints(transactionIds?: string[]): Promise<
    ApiResponse<{
      claimedAmount: number;
      claimedTransactions: PointTransaction[];
      newBalance: number;
    }>
  > {
    try {

      return await apiClient.post(`${this.baseUrl}/claim`, {
        transactionIds,
      });
    } catch (error) {
      console.error('[POINTS API] Error claiming points:', error);
      throw error;
    }
  }

  /**
   * Get points earning opportunities
   */
  async getEarningOpportunities(): Promise<
    ApiResponse<
      Array<{
        id: string;
        title: string;
        description: string;
        points: number;
        action: string;
        icon: string;
        category: string;
        difficulty: 'easy' | 'medium' | 'hard';
        estimatedTime: string;
      }>
    >
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/opportunities`);
    } catch (error) {
      console.error('[POINTS API] Error fetching opportunities:', error);
      throw error;
    }
  }

  /**
   * Get points leaderboard
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'monthly',
    limit: number = 50
  ): Promise<
    ApiResponse<{
      entries: Array<{
        rank: number;
        userId: string;
        username: string;
        fullName: string;
        avatar?: string;
        points: number;
        level: number;
        isCurrentUser?: boolean;
      }>;
      userRank?: number;
      totalUsers: number;
    }>
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/leaderboard`, {
        period,
        limit,
      });
    } catch (error) {
      console.error('[POINTS API] Error fetching leaderboard:', error);
      throw error;
    }
  }

  /**
   * Get daily check-in status
   */
  async getDailyCheckIn(): Promise<
    ApiResponse<{
      canCheckIn: boolean;
      lastCheckInDate: string | null;
      currentStreak: number;
      longestStreak: number;
      checkInCount: number;
      todayReward: number;
      streakBonus: number;
      nextReward: number;
    }>
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/daily-checkin/status`);
    } catch (error) {
      console.error('[POINTS API] Error getting check-in status:', error);
      throw error;
    }
  }

  /**
   * Perform daily check-in
   */
  async performDailyCheckIn(): Promise<
    ApiResponse<{
      success: boolean;
      pointsEarned: number;
      streak: number;
      bonus: number;
      nextReward: number;
      message: string;
    }>
  > {
    try {

      return await apiClient.post(`${this.baseUrl}/daily-checkin`);
    } catch (error) {
      console.error('[POINTS API] Error performing check-in:', error);
      throw error;
    }
  }

  /**
   * Get points multiplier info (based on tier, events, etc.)
   */
  async getMultiplier(): Promise<
    ApiResponse<{
      baseMultiplier: number;
      tierMultiplier: number;
      eventMultiplier: number;
      totalMultiplier: number;
      activeEvents: Array<{
        name: string;
        multiplier: number;
        endsAt: string;
      }>;
    }>
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/multiplier`);
    } catch (error) {
      console.error('[POINTS API] Error getting multiplier:', error);
      throw error;
    }
  }

  /**
   * Transfer points to another user (if feature enabled)
   */
  async transferPoints(
    recipientId: string,
    amount: number,
    message?: string
  ): Promise<
    ApiResponse<{
      success: boolean;
      transaction: PointTransaction;
      newBalance: number;
    }>
  > {
    try {

      return await apiClient.post(`${this.baseUrl}/transfer`, {
        recipientId,
        amount,
        message,
      });
    } catch (error) {
      console.error('[POINTS API] Error transferring points:', error);
      throw error;
    }
  }

  /**
   * Redeem points for rewards
   */
  async redeemPoints(
    rewardId: string,
    pointsCost: number
  ): Promise<
    ApiResponse<{
      success: boolean;
      reward: any;
      pointsSpent: number;
      newBalance: number;
    }>
  > {
    try {

      return await apiClient.post(`${this.baseUrl}/redeem`, {
        rewardId,
        pointsCost,
      });
    } catch (error) {
      console.error('[POINTS API] Error redeeming points:', error);
      throw error;
    }
  }

  /**
   * Get available rewards that can be redeemed with points
   */
  async getRedeemableRewards(): Promise<
    ApiResponse<
      Array<{
        id: string;
        title: string;
        description: string;
        pointsCost: number;
        category: string;
        icon: string;
        availability: number;
        expiresAt?: string;
      }>
    >
  > {
    try {

      return await apiClient.get(`${this.baseUrl}/rewards`);
    } catch (error) {
      console.error('[POINTS API] Error fetching rewards:', error);
      throw error;
    }
  }
}

export const pointsApi = new PointsApiService();
export default pointsApi;
