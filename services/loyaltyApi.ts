// Loyalty Points & Rewards API Service
// Handles loyalty program operations

import apiClient, { ApiResponse } from './apiClient';

export interface LoyaltyPoints {
  currentPoints: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  nextTier: string;
  pointsToNextTier: number;
  lifetimePoints: number;
  expiringPoints: number;
  expiryDate: string;
}

export interface Reward {
  _id: string;
  title: string;
  description: string;
  points: number;
  value: number;
  icon: string;
  category: 'voucher' | 'discount' | 'cashback' | 'freebie';
  available: boolean;
  expiryDate?: string;
  termsAndConditions?: string[];
}

export interface PointsTransaction {
  _id: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number;
  description: string;
  relatedEntity?: {
    type: 'order' | 'review' | 'referral' | 'reward';
    id: string;
  };
  createdAt: string;
}

export interface LoyaltyStats {
  totalEarned: number;
  totalRedeemed: number;
  currentBalance: number;
  rewardsRedeemed: number;
  tier: string;
  tierBenefits: string[];
}

export interface RedeemRewardRequest {
  rewardId: string;
  points: number;
}

export interface RedeemRewardResponse {
  success: boolean;
  message: string;
  newBalance: number;
  voucher?: {
    code: string;
    expiryDate: string;
    value: number;
  };
}

class LoyaltyApiService {
  private baseUrl = '/loyalty';

  /**
   * Get current loyalty points balance and tier info
   */
  async getPoints(): Promise<ApiResponse<LoyaltyPoints>> {

    return apiClient.get(`${this.baseUrl}/points`);
  }

  /**
   * Get loyalty statistics
   */
  async getStats(): Promise<ApiResponse<LoyaltyStats>> {

    return apiClient.get(`${this.baseUrl}/stats`);
  }

  /**
   * Get available rewards
   */
  async getRewards(category?: string): Promise<ApiResponse<{ rewards: Reward[]; total: number }>> {

    return apiClient.get(`${this.baseUrl}/rewards`, category ? { category } : undefined);
  }

  /**
   * Get reward by ID
   */
  async getRewardById(rewardId: string): Promise<ApiResponse<{ reward: Reward }>> {

    return apiClient.get(`${this.baseUrl}/rewards/${rewardId}`);
  }

  /**
   * Redeem a reward
   */
  async redeemReward(data: RedeemRewardRequest): Promise<ApiResponse<RedeemRewardResponse>> {

    return apiClient.post(`${this.baseUrl}/redeem`, data);
  }

  /**
   * Get points transaction history
   */
  async getTransactions(filters?: {
    type?: 'earned' | 'redeemed' | 'expired' | 'adjusted';
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<{ transactions: PointsTransaction[]; total: number; hasMore: boolean }>> {

    return apiClient.get(`${this.baseUrl}/transactions`, filters);
  }

  /**
   * Get tier information and benefits
   */
  async getTierInfo(): Promise<ApiResponse<{
    currentTier: string;
    nextTier: string;
    pointsToNextTier: number;
    benefits: string[];
    nextTierBenefits: string[];
  }>> {

    return apiClient.get(`${this.baseUrl}/tier`);
  }

  /**
   * Get points earning opportunities
   */
  async getEarningOpportunities(): Promise<ApiResponse<{
    opportunities: Array<{
      id: string;
      title: string;
      description: string;
      points: number;
      icon: string;
      action: string;
    }>;
  }>> {

    return apiClient.get(`${this.baseUrl}/earn-points`);
  }

  /**
   * Check if user can redeem reward
   */
  async canRedeemReward(rewardId: string): Promise<ApiResponse<{
    canRedeem: boolean;
    reason?: string;
    pointsNeeded?: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/rewards/${rewardId}/can-redeem`);
  }

  /**
   * Get user's redeemed rewards/vouchers
   */
  async getRedeemedRewards(status?: 'active' | 'used' | 'expired'): Promise<ApiResponse<{
    vouchers: Array<{
      _id: string;
      reward: Reward;
      code: string;
      value: number;
      status: string;
      redeemedAt: string;
      expiryDate: string;
      usedAt?: string;
    }>;
    total: number;
  }>> {

    return apiClient.get(`${this.baseUrl}/my-rewards`, status ? { status } : undefined);
  }
}

// Export singleton instance
const loyaltyApi = new LoyaltyApiService();
export default loyaltyApi;
