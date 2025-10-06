// Referral API Service
// Handles all referral-related API calls

import apiClient from './apiClient';

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  milestoneEarnings: number;
  referralBonus: number;
  referralCode: string;
}

export interface ReferralHistoryItem {
  _id: string;
  referee: {
    _id: string;
    name: string;
    phone: string;
  };
  status: 'pending' | 'active' | 'completed' | 'expired';
  rewards: {
    referrerAmount: number;
    milestoneBonus?: number;
  };
  referrerRewarded: boolean;
  milestoneRewarded: boolean;
  createdAt: string;
  completedAt?: string;
  metadata: {
    shareMethod?: string;
    signupSource?: string;
    refereeFirstOrder?: {
      orderId: string;
      amount: number;
      completedAt: string;
    };
    milestoneOrders?: {
      count: number;
      totalAmount: number;
      lastOrderAt?: string;
    };
  };
}

export interface ReferralCodeInfo {
  referralCode: string;
  referralLink: string;
  shareMessage: string;
}

/**
 * Get user's referral statistics
 */
export const getReferralStats = async (): Promise<ReferralStats> => {
  try {
    const response = await apiClient.get('/referral/stats');
    console.log('✅ [REFERRAL API] Stats fetched:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ [REFERRAL API] Error fetching stats:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch referral stats');
  }
};

/**
 * Get user's referral history
 */
export const getReferralHistory = async (): Promise<ReferralHistoryItem[]> => {
  try {
    const response = await apiClient.get('/referral/history');
    console.log('✅ [REFERRAL API] History fetched:', response.data.data.referrals.length, 'referrals');
    return response.data.data.referrals;
  } catch (error: any) {
    console.error('❌ [REFERRAL API] Error fetching history:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch referral history');
  }
};

/**
 * Validate a referral code
 */
export const validateReferralCode = async (code: string): Promise<{
  valid: boolean;
  referrer?: {
    _id: string;
    name: string;
    referralCode: string;
  };
}> => {
  try {
    const response = await apiClient.post('/referral/validate-code', { code });
    console.log('✅ [REFERRAL API] Code validated:', response.data);
    return {
      valid: response.data.success,
      referrer: response.data.data,
    };
  } catch (error: any) {
    console.error('❌ [REFERRAL API] Invalid code:', error);
    return { valid: false };
  }
};

/**
 * Track referral share event
 */
export const trackShare = async (shareMethod: string): Promise<void> => {
  try {
    await apiClient.post('/referral/track-share', { shareMethod });
    console.log('✅ [REFERRAL API] Share tracked:', shareMethod);
  } catch (error: any) {
    console.error('❌ [REFERRAL API] Error tracking share:', error);
    // Don't throw - share tracking is not critical
  }
};

/**
 * Get user's referral code and share info
 */
export const getReferralCode = async (): Promise<ReferralCodeInfo> => {
  try {
    const response = await apiClient.get('/referral/code');
    console.log('✅ [REFERRAL API] Referral code fetched:', response.data.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ [REFERRAL API] Error fetching referral code:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch referral code');
  }
};
