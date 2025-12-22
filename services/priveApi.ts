/**
 * Privé API Service
 *
 * Handles all API calls for the Privé section
 */

import apiClient, { ApiResponse } from './apiClient';

// Types
export interface PillarScore {
  id: string;
  name: string;
  score: number;
  weight: number;
  weightedScore: number;
  trend: 'up' | 'down' | 'stable';
  icon: string;
  color: string;
  description?: string;
  improvementTips?: string[];
}

export interface PriveEligibility {
  isEligible: boolean;
  score: number;
  tier: 'none' | 'building' | 'entry' | 'signature' | 'elite';
  trustScore: number;
  pillars: PillarScore[];
  reason?: string;
  accessState?: 'active' | 'grace_period' | 'paused' | 'suspended' | 'revoked';
  gracePeriodEnds?: string;
}

export interface CoinBalance {
  total: number;
  rez: number;
  prive: number;
  branded: number;
  brandedBreakdown?: Array<{
    brandId: string;
    brandName: string;
    amount: number;
    expiresAt?: string;
  }>;
}

export interface HabitLoop {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  progress: number;
}

export interface DailyProgress {
  isCheckedIn: boolean;
  streak: number;
  weeklyEarnings: number;
  loops: HabitLoop[];
}

export interface HighlightItem {
  id: string;
  type: 'offer' | 'store' | 'campaign';
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
}

export interface Highlights {
  curatedOffer: HighlightItem;
  nearbyStore: HighlightItem;
  opportunity: HighlightItem;
}

export interface PriveOffer {
  id: string;
  brand: string;
  brandLogo?: string;
  title: string;
  subtitle: string;
  description?: string;
  reward: string;
  rewardValue?: number;
  rewardType?: 'percentage' | 'fixed' | 'coins';
  coinType?: 'rez' | 'prive' | 'branded';
  expiresIn: string;
  expiresAt?: string;
  isExclusive: boolean;
  tierRequired?: 'building' | 'entry' | 'signature' | 'elite';
  images?: string[];
  terms?: string[];
  redemptions?: number;
}

export interface PriveStats {
  activeCampaigns: number;
  completedCampaigns: number;
  avgRating?: number;
}

export interface PriveDashboard {
  eligibility: PriveEligibility;
  coins: CoinBalance;
  dailyProgress: DailyProgress;
  highlights: Highlights;
  featuredOffers: PriveOffer[];
  stats: PriveStats;
  user: {
    name: string;
    memberId: string;
    memberSince: string;
    validThru: string;
    tierProgress: number;
    pointsToNext: number;
    nextTier: string;
  };
}

export interface CheckInResponse {
  streak: number;
  coinsEarned: number;
  bonusEarned: number;
  totalEarned: number;
  message: string;
}

export interface ImprovementTip {
  pillar: string;
  tip: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PriveHistory {
  history: Array<{
    date: string;
    score: number;
    tier: string;
    pillars: Record<string, number>;
    trigger?: string;
  }>;
  currentScore: number;
  currentTier: string;
}

// API Endpoints
const ENDPOINTS = {
  ELIGIBILITY: '/prive/eligibility',
  PILLARS: '/prive/pillars',
  REFRESH: '/prive/refresh',
  HISTORY: '/prive/history',
  TIPS: '/prive/tips',
  CHECK_IN: '/prive/check-in',
  HABIT_LOOPS: '/prive/habit-loops',
  DASHBOARD: '/prive/dashboard',
  OFFERS: '/prive/offers',
  HIGHLIGHTS: '/prive/highlights',
};

class PriveApi {
  /**
   * Get user's Privé eligibility status
   */
  async getEligibility(): Promise<ApiResponse<PriveEligibility>> {
    return apiClient.get<PriveEligibility>(ENDPOINTS.ELIGIBILITY);
  }

  /**
   * Get detailed pillar breakdown
   */
  async getPillars(): Promise<ApiResponse<{ pillars: PillarScore[]; factors: any }>> {
    return apiClient.get(ENDPOINTS.PILLARS);
  }

  /**
   * Force recalculation of reputation score
   */
  async refreshScore(): Promise<ApiResponse<PriveEligibility>> {
    return apiClient.post<PriveEligibility>(ENDPOINTS.REFRESH);
  }

  /**
   * Get reputation score history
   */
  async getHistory(): Promise<ApiResponse<PriveHistory>> {
    return apiClient.get<PriveHistory>(ENDPOINTS.HISTORY);
  }

  /**
   * Get personalized improvement tips
   */
  async getTips(): Promise<ApiResponse<{
    tips: ImprovementTip[];
    lowestPillar: PillarScore;
    highestPillar: PillarScore;
  }>> {
    return apiClient.get(ENDPOINTS.TIPS);
  }

  /**
   * Daily check-in
   */
  async checkIn(): Promise<ApiResponse<CheckInResponse>> {
    return apiClient.post<CheckInResponse>(ENDPOINTS.CHECK_IN);
  }

  /**
   * Get daily habit loops with progress
   */
  async getHabitLoops(): Promise<ApiResponse<{ loops: HabitLoop[]; weeklyEarnings: number }>> {
    return apiClient.get(ENDPOINTS.HABIT_LOOPS);
  }

  /**
   * Get combined dashboard data (recommended for initial load)
   */
  async getDashboard(): Promise<ApiResponse<PriveDashboard>> {
    return apiClient.get<PriveDashboard>(ENDPOINTS.DASHBOARD);
  }

  /**
   * Get Privé exclusive offers
   */
  async getOffers(params?: {
    page?: number;
    limit?: number;
    category?: string;
    tier?: string;
  }): Promise<ApiResponse<{
    offers: PriveOffer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    return apiClient.get(ENDPOINTS.OFFERS, params);
  }

  /**
   * Get single offer by ID
   */
  async getOfferById(id: string): Promise<ApiResponse<PriveOffer>> {
    return apiClient.get(`${ENDPOINTS.OFFERS}/${id}`);
  }

  /**
   * Get today's personalized highlights
   */
  async getHighlights(): Promise<ApiResponse<Highlights>> {
    return apiClient.get<Highlights>(ENDPOINTS.HIGHLIGHTS);
  }

  /**
   * Track offer click for analytics
   */
  async trackOfferClick(offerId: string): Promise<ApiResponse<void>> {
    return apiClient.post(`${ENDPOINTS.OFFERS}/${offerId}/click`);
  }
}

// Export singleton instance
const priveApi = new PriveApi();
export default priveApi;
