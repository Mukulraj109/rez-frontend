// Leaderboard API Service
// Handles all leaderboard-related API calls
// Backend routes: /api/gamification/leaderboard

import apiClient, { ApiResponse } from './apiClient';

export interface LeaderboardEntry {
  _id: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  rank: number;
  value: number;
  period?: string;
}

export interface RankEntry {
  rank: number;
  total: number;
  value: number;
}

export interface UserRank {
  spending: RankEntry | null;
  reviews: RankEntry | null;
  referrals: RankEntry | null;
  cashback: RankEntry | null;
  streak: RankEntry | null;
}

export interface LeaderboardResponse {
  entries: LeaderboardEntry[];
  myRank?: {
    rank: number;
    value: number;
  };
}

class LeaderboardApi {
  // Backend routes are at /gamification/leaderboard
  private baseUrl = '/gamification/leaderboard';

  /**
   * Generic leaderboard getter - used by playandearn.tsx
   * Backend endpoint: GET /gamification/leaderboard?type=spending&period=weekly&limit=10
   */
  async getLeaderboard(params: {
    type?: 'spending' | 'reviews' | 'referrals' | 'cashback' | 'coins';
    period?: 'daily' | 'weekly' | 'monthly' | 'all-time';
    limit?: number;
  }): Promise<ApiResponse<LeaderboardResponse>> {
    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: params.type || 'spending',
        period: params.period || 'weekly',
        limit: params.limit || 10,
      });

      if (response.success && response.data) {
        // Backend returns array of entries or { entries, myRank }
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || response.data.leaderboard || [];
        const myRank = response.data.myRank || null;

        // Map entries to ensure consistent structure
        const mappedEntries = entries.map((entry: any, index: number) => ({
          _id: entry._id || entry.id || `entry_${index}`,
          user: {
            _id: entry.user?._id || entry.userId || '',
            name: entry.user?.name || entry.userName || entry.name || 'Anonymous',
            avatar: entry.user?.avatar || entry.avatar,
          },
          rank: entry.rank || index + 1,
          value: entry.value || entry.amount || entry.score || 0,
          period: params.period,
        }));

        return {
          success: true,
          data: {
            entries: mappedEntries,
            myRank,
          },
        };
      }

      return {
        success: true,
        data: { entries: [], myRank: undefined },
      };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get spending leaderboard
   * Maps frontend period values to backend format
   */
  async getSpendingLeaderboard(period: 'week' | 'month' | 'all' = 'month', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    // Map frontend period to backend period
    const backendPeriod = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'all-time';

    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: 'spending',
        period: backendPeriod,
        limit,
      });

      if (response.success && response.data) {
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || response.data.leaderboard || [];

        const mappedEntries = entries.map((entry: any, index: number) => ({
          _id: entry._id || entry.id || `entry_${index}`,
          user: {
            _id: entry.user?._id || entry.userId || '',
            name: entry.user?.name || entry.userName || entry.name || 'Anonymous',
            avatar: entry.user?.avatar || entry.avatar,
          },
          rank: entry.rank || index + 1,
          value: entry.value || entry.amount || entry.score || 0,
          period: backendPeriod,
        }));

        return { success: true, data: mappedEntries };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching spending leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get review leaderboard
   */
  async getReviewLeaderboard(period: 'week' | 'month' | 'all' = 'month', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const backendPeriod = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'all-time';

    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: 'reviews',
        period: backendPeriod,
        limit,
      });

      if (response.success && response.data) {
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || [];
        return { success: true, data: entries };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching review leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get referral leaderboard
   */
  async getReferralLeaderboard(period: 'week' | 'month' | 'all' = 'month', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const backendPeriod = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'all-time';

    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: 'referrals',
        period: backendPeriod,
        limit,
      });

      if (response.success && response.data) {
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || [];
        return { success: true, data: entries };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching referral leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get cashback leaderboard
   */
  async getCashbackLeaderboard(period: 'week' | 'month' | 'all' = 'month', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const backendPeriod = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'all-time';

    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: 'cashback',
        period: backendPeriod,
        limit,
      });

      if (response.success && response.data) {
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || [];
        return { success: true, data: entries };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching cashback leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get streak leaderboard
   */
  async getStreakLeaderboard(type: 'login' | 'order' | 'review' = 'login', limit: number = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    try {
      const response = await apiClient.get<any>(this.baseUrl, {
        type: 'streak',
        streakType: type,
        limit,
      });

      if (response.success && response.data) {
        const entries = Array.isArray(response.data) ? response.data : response.data.entries || [];
        return { success: true, data: entries };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching streak leaderboard:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all leaderboards summary
   */
  async getAllLeaderboards(): Promise<ApiResponse<{
    spending: LeaderboardEntry[];
    reviews: LeaderboardEntry[];
    referrals: LeaderboardEntry[];
    cashback: LeaderboardEntry[];
  }>> {
    try {
      // Fetch all leaderboards in parallel
      const [spending, reviews, referrals, cashback] = await Promise.all([
        this.getSpendingLeaderboard('month', 5),
        this.getReviewLeaderboard('month', 5),
        this.getReferralLeaderboard('month', 5),
        this.getCashbackLeaderboard('month', 5),
      ]);

      return {
        success: true,
        data: {
          spending: spending.data || [],
          reviews: reviews.data || [],
          referrals: referrals.data || [],
          cashback: cashback.data || [],
        },
      };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching all leaderboards:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's rank in all categories
   * Note: Backend doesn't have a /my-rank endpoint, uses gamification stats instead
   */
  async getMyRank(period: 'week' | 'month' | 'all' = 'month'): Promise<ApiResponse<UserRank>> {
    try {
      // Try to get rank from gamification stats
      const statsResponse = await apiClient.get<any>('/gamification/stats');

      if (statsResponse.success && statsResponse.data) {
        const stats = statsResponse.data;
        const ranks = stats.ranks || stats.userRanks || {};

        return {
          success: true,
          data: {
            spending: ranks.spending || null,
            reviews: ranks.reviews || null,
            referrals: ranks.referrals || null,
            cashback: ranks.cashback || null,
            streak: ranks.streak || null,
          },
        };
      }

      // Return null ranks if not available
      return {
        success: true,
        data: {
          spending: null,
          reviews: null,
          referrals: null,
          cashback: null,
          streak: null,
        },
      };
    } catch (error: any) {
      console.error('[LEADERBOARD API] Error fetching my rank:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new LeaderboardApi();
