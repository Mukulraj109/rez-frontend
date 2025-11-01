import apiClient from './apiClient';
import {
  ReferralStats,
  ReferralProgress,
  ReferralReward,
  LeaderboardEntry,
  ReferralMilestone
} from '../types/referral.types';

export const referralTierApi = {
  /**
   * Get current tier and progress
   */
  async getTier(): Promise<{
    currentTier: string;
    tierData: any;
    progress: ReferralProgress;
    stats: ReferralStats;
    upcomingMilestones: ReferralMilestone[];
  }> {
    const response = await apiClient.get('/api/referral/tier');
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Get claimable and claimed rewards
   */
  async getRewards(): Promise<{
    claimable: ReferralReward[];
    claimed: ReferralReward[];
    totalClaimableValue: number;
  }> {
    const response = await apiClient.get('/api/referral/rewards');
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Claim specific reward
   */
  async claimReward(referralId: string, rewardIndex: number): Promise<any> {
    const response = await apiClient.post('/api/referral/claim-reward', {
      referralId,
      rewardIndex
    });
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Get referral leaderboard
   */
  async getLeaderboard(limit: number = 100): Promise<{
    leaderboard: LeaderboardEntry[];
    userRank: {
      rank: number;
      totalReferrals: number;
    };
  }> {
    const response = await apiClient.get('/api/referral/leaderboard', {
      params: { limit }
    });
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Generate QR code for referral
   */
  async generateQR(): Promise<{
    qrCode: string;
    referralLink: string;
    referralCode: string;
  }> {
    const response = await apiClient.post('/api/referral/generate-qr');
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Get milestone progress
   */
  async getMilestones(): Promise<{
    current: ReferralProgress;
    upcoming: ReferralMilestone[];
  }> {
    const response = await apiClient.get('/api/referral/milestones');
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Check tier upgrade eligibility
   */
  async checkUpgrade(): Promise<{
    upgraded: boolean;
    oldTier?: string;
    newTier?: string;
    currentTier?: string;
    rewards?: ReferralReward[];
    celebrate?: boolean;
    qualifiedReferrals?: number;
  }> {
    const response = await apiClient.get('/api/referral/check-upgrade');
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Validate referral code
   */
  async validateCode(code: string): Promise<{
    valid: boolean;
    referrerName: string;
    referrerId: string;
  }> {
    const response = await apiClient.post('/api/referral/validate-code', { code });
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Apply referral code during registration
   */
  async applyCode(code: string, metadata?: any): Promise<{
    success: boolean;
    referralId: string;
    welcomeBonus: number;
    message: string;
  }> {
    const response = await apiClient.post('/api/referral/apply-code', {
      code,
      metadata
    });
    const data = (response.data as any)?.data;
    return data;
  },

  /**
   * Get referral analytics (admin)
   */
  async getAnalytics(startDate?: Date, endDate?: Date): Promise<any> {
    const response = await apiClient.get('/api/referral/analytics', {
      params: {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString()
      }
    });
    const data = (response.data as any)?.data;
    return data;
  }
};

export default referralTierApi;
