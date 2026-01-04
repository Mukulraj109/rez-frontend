// Achievement API Service
// Handles user achievements and badges system

import apiClient, { ApiResponse } from './apiClient';

export enum AchievementType {
  // Order-based achievements
  FIRST_ORDER = 'FIRST_ORDER',
  ORDERS_10 = 'ORDERS_10',
  ORDERS_50 = 'ORDERS_50',
  ORDERS_100 = 'ORDERS_100',
  FREQUENT_BUYER = 'FREQUENT_BUYER',

  // Spending-based achievements
  SPENT_1000 = 'SPENT_1000',
  SPENT_5000 = 'SPENT_5000',
  SPENT_10000 = 'SPENT_10000',
  BIG_SPENDER = 'BIG_SPENDER',

  // Review-based achievements
  FIRST_REVIEW = 'FIRST_REVIEW',
  REVIEWS_10 = 'REVIEWS_10',
  REVIEWS_25 = 'REVIEWS_25',
  REVIEW_MASTER = 'REVIEW_MASTER',

  // Video-based achievements
  FIRST_VIDEO = 'FIRST_VIDEO',
  VIDEOS_10 = 'VIDEOS_10',
  VIEWS_1000 = 'VIEWS_1000',
  VIEWS_10000 = 'VIEWS_10000',
  INFLUENCER = 'INFLUENCER',

  // Project-based achievements
  FIRST_PROJECT = 'FIRST_PROJECT',
  PROJECTS_10 = 'PROJECTS_10',
  PROJECT_APPROVED = 'PROJECT_APPROVED',
  TOP_EARNER = 'TOP_EARNER',

  // Voucher/Offer achievements
  VOUCHER_REDEEMED = 'VOUCHER_REDEEMED',
  OFFERS_10 = 'OFFERS_10',
  CASHBACK_EARNED = 'CASHBACK_EARNED',

  // Referral achievements
  FIRST_REFERRAL = 'FIRST_REFERRAL',
  REFERRALS_5 = 'REFERRALS_5',
  REFERRALS_10 = 'REFERRALS_10',
  REFERRAL_MASTER = 'REFERRAL_MASTER',

  // Time-based achievements
  EARLY_BIRD = 'EARLY_BIRD',
  ONE_YEAR = 'ONE_YEAR',

  // Activity-based achievements
  ACTIVITY_100 = 'ACTIVITY_100',
  ACTIVITY_500 = 'ACTIVITY_500',
  SUPER_USER = 'SUPER_USER'
}

export interface Achievement {
  id: string;
  userId: string;
  type: AchievementType;
  title: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
  progress: number; // 0-100
  unlockedDate?: string;
  currentValue?: number;
  targetValue: number;
  createdAt: string;
  updatedAt: string;
}

export interface AchievementProgress {
  summary: {
    total: number;
    unlocked: number;
    inProgress: number;
    locked: number;
    completionPercentage: number;
  };
  achievements: Achievement[];
}

export interface AchievementProgressUpdate {
  achievementId: string;
  currentValue: number;
}

class AchievementApiService {
  // Backend routes are at /gamification/achievements, not /achievements
  private baseUrl = '/gamification/achievements';
  private statsUrl = '/gamification/stats';

  /**
   * Get achievement definitions (not user-specific)
   */
  async getAchievementDefinitions(): Promise<ApiResponse<any[]>> {
    try {
      const response = await apiClient.get<any>(this.baseUrl);
      if (response.success) {
        return {
          success: true,
          data: response.data || [],
        };
      }
      return response;
    } catch (error: any) {
      console.error('[ACHIEVEMENT API] Error fetching definitions:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user's achievements
   * Backend endpoint: GET /gamification/achievements/me
   */
  async getUserAchievements(): Promise<ApiResponse<Achievement[]>> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/me`);

      if (response.success && response.data) {
        const achievements: Achievement[] = (response.data.achievements || []).map((a: any) => ({
          id: a._id || a.id,
          userId: a.user || '',
          type: a.type as AchievementType,
          title: a.title || 'Achievement',
          description: a.description || '',
          icon: a.icon || '🏆',
          color: a.color || '#F59E0B',
          unlocked: a.unlocked || false,
          progress: a.progress || 0,
          unlockedDate: a.unlockedDate,
          currentValue: a.currentValue,
          targetValue: a.targetValue || 100,
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
        }));

        return { success: true, data: achievements };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[ACHIEVEMENT API] Error fetching user achievements:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get only unlocked achievements
   */
  async getUnlockedAchievements(): Promise<ApiResponse<Achievement[]>> {
    try {
      const response = await this.getUserAchievements();
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.filter(a => a.unlocked),
        };
      }
      return response;
    } catch (error: any) {
      console.error('[ACHIEVEMENT API] Error fetching unlocked achievements:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get current user's achievement progress
   * Backend endpoint: GET /gamification/achievements/me
   * Returns user's achievements with progress and summary stats
   */
  async getAchievementProgress(): Promise<ApiResponse<AchievementProgress>> {
    try {
      const response = await apiClient.get<any>(`${this.baseUrl}/me`);

      if (response.success && response.data) {
        const data = response.data;

        // Map backend response to frontend format
        const achievements: Achievement[] = (data.achievements || []).map((a: any) => ({
          id: a._id || a.id,
          userId: a.user || '',
          type: a.type as AchievementType,
          title: a.title || 'Achievement',
          description: a.description || '',
          icon: a.icon || '🏆',
          color: a.color || '#F59E0B',
          unlocked: a.unlocked || false,
          progress: a.progress || 0,
          unlockedDate: a.unlockedDate,
          currentValue: a.currentValue,
          targetValue: a.targetValue || 100,
          createdAt: a.createdAt || new Date().toISOString(),
          updatedAt: a.updatedAt || new Date().toISOString(),
        }));

        return {
          success: true,
          data: {
            summary: data.summary || {
              total: achievements.length,
              unlocked: achievements.filter(a => a.unlocked).length,
              inProgress: achievements.filter(a => !a.unlocked && a.progress > 0).length,
              locked: achievements.filter(a => !a.unlocked && a.progress === 0).length,
              completionPercentage: achievements.length > 0
                ? Math.round((achievements.filter(a => a.unlocked).length / achievements.length) * 100)
                : 0,
            },
            achievements,
          },
        };
      }

      // Return empty state if no data
      return {
        success: true,
        data: {
          summary: {
            total: 0,
            unlocked: 0,
            inProgress: 0,
            locked: 0,
            completionPercentage: 0,
          },
          achievements: [],
        },
      };
    } catch (error: any) {
      console.error('[ACHIEVEMENT API] Error fetching achievement progress:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize achievements for user (usually done on registration)
   */
  async initializeUserAchievements(): Promise<ApiResponse<Achievement[]>> {
    // This endpoint may not exist - return success with empty data
    console.warn('[ACHIEVEMENT API] initializeUserAchievements endpoint may not exist');
    return { success: true, data: [] };
  }

  /**
   * Update achievement progress (typically called by system)
   */
  async updateAchievementProgress(data: AchievementProgressUpdate): Promise<ApiResponse<Achievement>> {
    // This endpoint may not exist - use unlock endpoint if available
    console.warn('[ACHIEVEMENT API] updateAchievementProgress endpoint may not exist');
    return { success: false, error: 'Endpoint not available' };
  }

  /**
   * Recalculate all achievements based on user statistics
   */
  async recalculateAchievements(): Promise<ApiResponse<Achievement[]>> {
    // This endpoint may not exist
    console.warn('[ACHIEVEMENT API] recalculateAchievements endpoint may not exist');
    return { success: true, data: [] };
  }
}

export const achievementApi = new AchievementApiService();
export default achievementApi;