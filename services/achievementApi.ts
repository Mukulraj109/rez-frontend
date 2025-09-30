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
  private baseUrl = '/achievements';

  // Get all user achievements
  async getUserAchievements(): Promise<ApiResponse<Achievement[]>> {
    return apiClient.get(this.baseUrl);
  }

  // Get only unlocked achievements
  async getUnlockedAchievements(): Promise<ApiResponse<Achievement[]>> {
    return apiClient.get(`${this.baseUrl}/unlocked`);
  }

  // Get achievement progress summary
  async getAchievementProgress(): Promise<ApiResponse<AchievementProgress>> {
    return apiClient.get(`${this.baseUrl}/progress`);
  }

  // Initialize achievements for user (usually done on registration)
  async initializeUserAchievements(): Promise<ApiResponse<Achievement[]>> {
    return apiClient.post(`${this.baseUrl}/initialize`, {});
  }

  // Update achievement progress (typically called by system)
  async updateAchievementProgress(data: AchievementProgressUpdate): Promise<ApiResponse<Achievement>> {
    return apiClient.put(`${this.baseUrl}/update-progress`, data);
  }

  // Recalculate all achievements based on user statistics
  async recalculateAchievements(): Promise<ApiResponse<Achievement[]>> {
    return apiClient.post(`${this.baseUrl}/recalculate`, {});
  }
}

export const achievementApi = new AchievementApiService();
export default achievementApi;