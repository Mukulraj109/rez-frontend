// Gamification API Service
// Handles all gamification-related API calls (mini-games, challenges, achievements, leaderboard)

import apiClient, { ApiResponse } from './apiClient';
import type {
  SpinWheelResult,
  ScratchCardData,
  QuizGame,
  QuizQuestion,
  Challenge,
  Achievement,
  LeaderboardData,
  GamificationStats,
  CoinTransaction,
} from '@/types/gamification.types';

/**
 * Gamification API Service Class
 */
class GamificationAPI {
  // ==================== SPIN WHEEL ====================

  /**
   * Spin the wheel to win coins/prizes
   */
  async spinWheel(): Promise<ApiResponse<{
    result: SpinWheelResult;
    coinsAdded: number;
    newBalance: number;
  }>> {
    try {

      const response = await apiClient.post<{
        result: SpinWheelResult;
        coinsAdded: number;
        newBalance: number;
      }>('/gamification/spin-wheel/spin');
      return response;
    } catch (error: any) {
      console.error('Error spinning wheel:', error);
      throw error;
    }
  }

  /**
   * Check if user can spin wheel (cooldown, eligibility)
   */
  async canSpinWheel(): Promise<ApiResponse<{
    canSpin: boolean;
    nextSpinAt?: string;
    remainingCooldown?: number;
  }>> {
    try {
      const response = await apiClient.get<{
        canSpin: boolean;
        nextSpinAt?: string;
        remainingCooldown?: number;
      }>('/gamification/spin-wheel/eligibility');
      return response;
    } catch (error: any) {
      console.error('Error checking spin eligibility:', error);
      throw error;
    }
  }

  /**
   * Get spin wheel configuration and user data
   */
  async getSpinWheelData(): Promise<ApiResponse<{
    segments: any[];
    spinsRemaining: number;
    spinHistory?: any[];
  }>> {
    try {
      const response = await apiClient.get<{
        segments: any[];
        spinsRemaining: number;
        spinHistory?: any[];
      }>('/gamification/spin-wheel/data');
      return response;
    } catch (error: any) {
      console.error('Error getting spin wheel data:', error);
      throw error;
    }
  }

  /**
   * Get spin wheel history
   */
  async getSpinWheelHistory(limit: number = 20): Promise<ApiResponse<{
    history: Array<{
      id: string;
      completedAt: string;
      prize: string;
      segment: number;
      reward: {
        coins?: number;
        cashback?: number;
        discount?: number;
        voucher?: any;
      };
    }>;
    total: number;
  }>> {
    try {
      const response = await apiClient.get<{
        history: any[];
        total: number;
      }>('/gamification/spin-wheel/history', { limit });
      return response;
    } catch (error: any) {
      console.error('Error getting spin wheel history:', error);
      throw error;
    }
  }

  // ==================== SCRATCH CARD ====================

  /**
   * Create a new scratch card
   */
  async createScratchCard(): Promise<ApiResponse<ScratchCardData>> {
    try {

      const response = await apiClient.post<ScratchCardData>('/gamification/scratch-card');
      return response;
    } catch (error: any) {
      console.error('Error creating scratch card:', error);
      throw error;
    }
  }

  /**
   * Scratch and reveal card prize
   */
  async scratchCard(cardId: string): Promise<ApiResponse<{
    card: ScratchCardData;
    prize: any;
    coinsAdded: number;
  }>> {
    try {

      const response = await apiClient.post<{
        card: ScratchCardData;
        prize: any;
        coinsAdded: number;
      }>(`/gamification/scratch-card/${cardId}/scratch`);
      return response;
    } catch (error: any) {
      console.error('Error scratching card:', error);
      throw error;
    }
  }

  /**
   * Check scratch card eligibility
   */
  async canCreateScratchCard(): Promise<ApiResponse<{
    canCreate: boolean;
    reason?: string;
    nextAvailableAt?: string;
  }>> {
    try {
      const response = await apiClient.get<{
        canCreate: boolean;
        reason?: string;
        nextAvailableAt?: string;
      }>('/gamification/scratch-card/eligibility');
      return response;
    } catch (error: any) {
      console.error('Error checking scratch card eligibility:', error);
      throw error;
    }
  }

  // ==================== QUIZ GAME ====================

  /**
   * Start a new quiz game
   */
  async startQuiz(difficulty?: 'easy' | 'medium' | 'hard', category?: string): Promise<ApiResponse<QuizGame>> {
    try {

      const response = await apiClient.post<QuizGame>('/gamification/quiz/start', {
        difficulty,
        category,
      });
      return response;
    } catch (error: any) {
      console.error('Error starting quiz:', error);
      throw error;
    }
  }

  /**
   * Submit quiz answer
   */
  async submitQuizAnswer(
    gameId: string,
    questionId: string,
    answer: number
  ): Promise<ApiResponse<{
    isCorrect: boolean;
    coinsEarned: number;
    currentScore: number;
    nextQuestion?: QuizQuestion;
    gameCompleted: boolean;
    totalCoins?: number;
  }>> {
    try {

      const response = await apiClient.post<{
        isCorrect: boolean;
        coinsEarned: number;
        currentScore: number;
        nextQuestion?: QuizQuestion;
        gameCompleted: boolean;
        totalCoins?: number;
      }>('/gamification/quiz/answer', {
        gameId,
        questionId,
        answer,
      });
      return response;
    } catch (error: any) {
      console.error('Error submitting quiz answer:', error);
      throw error;
    }
  }

  /**
   * Get current quiz game
   */
  async getCurrentQuiz(): Promise<ApiResponse<QuizGame | null>> {
    try {
      const response = await apiClient.get<QuizGame | null>('/gamification/quiz/current');
      return response;
    } catch (error: any) {
      console.error('Error getting current quiz:', error);
      throw error;
    }
  }

  // ==================== CHALLENGES ====================

  /**
   * Get all active challenges
   */
  async getChallenges(): Promise<ApiResponse<Challenge[]>> {
    try {

      const response = await apiClient.get<Challenge[]>('/gamification/challenges');
      return response;
    } catch (error: any) {
      console.error('Error getting challenges:', error);
      throw error;
    }
  }

  /**
   * Get challenge by ID
   */
  async getChallenge(challengeId: string): Promise<ApiResponse<Challenge>> {
    try {
      const response = await apiClient.get<Challenge>(`/gamification/challenges/${challengeId}`);
      return response;
    } catch (error: any) {
      console.error('Error getting challenge:', error);
      throw error;
    }
  }

  /**
   * Claim challenge reward
   */
  async claimChallengeReward(challengeId: string): Promise<ApiResponse<{
    challenge: Challenge;
    rewards: {
      coins: number;
      badges: string[];
      vouchers: any[];
    };
    newBalance: number;
  }>> {
    try {

      const response = await apiClient.post<{
        challenge: Challenge;
        rewards: { coins: number; badges: string[]; vouchers: any[] };
        newBalance: number;
      }>('/gamification/claim-reward', {
        challengeId,
      });
      return response;
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  // ==================== ACHIEVEMENTS ====================

  /**
   * Get all achievements
   */
  async getAchievements(): Promise<ApiResponse<Achievement[]>> {
    try {

      const response = await apiClient.get<Achievement[]>('/gamification/achievements');
      return response;
    } catch (error: any) {
      console.error('Error getting achievements:', error);
      throw error;
    }
  }

  /**
   * Unlock achievement
   */
  async unlockAchievement(achievementId: string): Promise<ApiResponse<{
    achievement: Achievement;
    coinsEarned: number;
    newBalance: number;
  }>> {
    try {
      const response = await apiClient.post<{
        achievement: Achievement;
        coinsEarned: number;
        newBalance: number;
      }>(`/gamification/achievements/${achievementId}/unlock`);
      return response;
    } catch (error: any) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // ==================== LEADERBOARD ====================

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'monthly' | 'all-time' = 'monthly',
    limit: number = 50
  ): Promise<ApiResponse<LeaderboardData>> {
    try {

      const response = await apiClient.get<LeaderboardData>('/gamification/leaderboard', {
        period,
        limit,
      });
      return response;
    } catch (error: any) {
      console.error('Error getting leaderboard:', error);
      throw error;
    }
  }

  // ==================== STATS & COINS ====================

  /**
   * Get user gamification stats
   */
  async getGamificationStats(): Promise<ApiResponse<GamificationStats>> {
    try {

      const response = await apiClient.get<GamificationStats>('/gamification/stats');
      return response;
    } catch (error: any) {
      console.error('Error getting stats:', error);
      throw error;
    }
  }

  /**
   * Get coin balance
   */
  async getCoinBalance(): Promise<ApiResponse<{
    balance: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  }>> {
    try {
      const response = await apiClient.get<{
        balance: number;
        lifetimeEarned: number;
        lifetimeSpent: number;
      }>('/gamification/coins/balance');
      return response;
    } catch (error: any) {
      console.error('Error getting coin balance:', error);
      throw error;
    }
  }

  /**
   * Get coin transaction history
   */
  async getCoinTransactions(
    page: number = 1,
    limit: number = 20
  ): Promise<ApiResponse<{
    transactions: CoinTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>> {
    try {
      const response = await apiClient.get<{
        transactions: CoinTransaction[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/gamification/coins/transactions', {
        page,
        limit,
      });
      return response;
    } catch (error: any) {
      console.error('Error getting coin transactions:', error);
      throw error;
    }
  }

  // ==================== PLAY & EARN HUB ====================

  /**
   * Get all play & earn hub data in one call
   * Includes: daily spin, challenges, streak, surprise drops
   */
  async getPlayAndEarnData(): Promise<ApiResponse<{
    dailySpin: {
      spinsRemaining: number;
      maxSpins: number;
      lastSpinAt: string | null;
      canSpin: boolean;
      nextSpinAt: string | null;
    };
    challenges: {
      active: Array<{
        id: string;
        title: string;
        progress: {
          current: number;
          target: number;
          percentage: number;
        };
        reward: number;
        expiresAt: string;
      }>;
      totalActive: number;
      completedToday: number;
    };
    streak: {
      type: string;
      currentStreak: number;
      longestStreak: number;
      nextMilestone: { day: number; coins: number };
      todayCheckedIn: boolean;
    };
    surpriseDrop: {
      id?: string;
      available: boolean;
      coins: number;
      message: string | null;
      expiresAt: string | null;
      reason?: string;
    };
    coinBalance: number;
  }>> {
    try {
      const response = await apiClient.get<{
        dailySpin: {
          spinsRemaining: number;
          maxSpins: number;
          lastSpinAt: string | null;
          canSpin: boolean;
          nextSpinAt: string | null;
        };
        challenges: {
          active: Array<{
            id: string;
            title: string;
            progress: {
              current: number;
              target: number;
              percentage: number;
            };
            reward: number;
            expiresAt: string;
          }>;
          totalActive: number;
          completedToday: number;
        };
        streak: {
          type: string;
          currentStreak: number;
          longestStreak: number;
          nextMilestone: { day: number; coins: number };
          todayCheckedIn: boolean;
        };
        surpriseDrop: {
          id?: string;
          available: boolean;
          coins: number;
          message: string | null;
          expiresAt: string | null;
          reason?: string;
        };
        coinBalance: number;
      }>('/gamification/play-and-earn');
      return response;
    } catch (error: any) {
      console.error('Error getting play and earn data:', error);
      throw error;
    }
  }

  /**
   * Claim a surprise coin drop
   */
  async claimSurpriseDrop(dropId: string): Promise<ApiResponse<{
    coins: number;
    newBalance: number;
    message: string;
  }>> {
    try {
      const response = await apiClient.post<{
        coins: number;
        newBalance: number;
        message: string;
      }>('/gamification/surprise-drop/claim', { dropId });
      return response;
    } catch (error: any) {
      console.error('Error claiming surprise drop:', error);
      throw error;
    }
  }

  /**
   * Check in for daily streak
   */
  async streakCheckin(): Promise<ApiResponse<{
    streakUpdated: boolean;
    currentStreak: number;
    longestStreak?: number;
    coinsEarned: number;
    milestoneReached: {
      day: number;
      coins: number;
      badge?: string;
    } | null;
    newBalance?: number;
    message: string;
  }>> {
    try {
      const response = await apiClient.post<{
        streakUpdated: boolean;
        currentStreak: number;
        longestStreak?: number;
        coinsEarned: number;
        milestoneReached: {
          day: number;
          coins: number;
          badge?: string;
        } | null;
        newBalance?: number;
        message: string;
      }>('/gamification/streak/checkin');
      return response;
    } catch (error: any) {
      console.error('Error checking in for streak:', error);
      throw error;
    }
  }
}

// Export singleton instance
const gamificationAPI = new GamificationAPI();
export default gamificationAPI;
