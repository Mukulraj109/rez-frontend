// User Loyalty API Service
// Handles user streak, missions, and coins for loyalty/gamification

import apiClient, { ApiResponse } from './apiClient';

export interface Streak {
  current: number;
  target: number;
  lastCheckin: string | null;
  history: string[];
}

export interface BrandLoyalty {
  brandId: string;
  brandName: string;
  purchaseCount: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  progress: number;
  nextTierAt: number;
}

export interface Mission {
  missionId: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  reward: number;
  icon: string;
  completedAt: string | null;
}

export interface CoinHistory {
  amount: number;
  type: 'earned' | 'spent' | 'expired';
  description: string;
  date: string;
}

export interface Coins {
  available: number;
  expiring: number;
  expiryDate: string | null;
  history: CoinHistory[];
}

export interface UserLoyalty {
  _id: string;
  userId: string;
  streak: Streak;
  brandLoyalty: BrandLoyalty[];
  missions: Mission[];
  coins: Coins;
}

class UserLoyaltyApiService {
  private baseUrl = '/loyalty';

  /**
   * Get user's loyalty data
   */
  async getLoyalty(): Promise<ApiResponse<{ loyalty: UserLoyalty }>> {
    return apiClient.get(this.baseUrl);
  }

  /**
   * Daily check-in
   */
  async checkIn(): Promise<ApiResponse<{ loyalty: UserLoyalty; message: string; streak: number }>> {
    return apiClient.post(`${this.baseUrl}/checkin`);
  }

  /**
   * Complete a mission
   */
  async completeMission(missionId: string): Promise<ApiResponse<{ loyalty: UserLoyalty; reward: number; message: string }>> {
    return apiClient.post(`${this.baseUrl}/missions/${missionId}/complete`);
  }

  /**
   * Get coin balance
   */
  async getCoinBalance(): Promise<ApiResponse<{ coins: Coins }>> {
    return apiClient.get(`${this.baseUrl}/coins`);
  }
}

// Export singleton instance
const userLoyaltyApi = new UserLoyaltyApiService();
export default userLoyaltyApi;
