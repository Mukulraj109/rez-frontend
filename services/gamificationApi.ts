// Gamification API Service
// Handles daily check-in, spin wheel, and other gamification features

import apiClient, { ApiResponse } from './apiClient';

// ============================================
// TYPES
// ============================================

export interface CheckInReward {
  day: number;
  coins: number;
  claimed: boolean;
  today?: boolean;
  bonus?: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  hasCheckedInToday: boolean;
  lastCheckInDate?: string;
  weeklyEarnings: number;
  totalEarned: number;
  checkInHistory: {
    date: string;
    coinsEarned: number;
    bonusEarned: number;
    streak: number;
  }[];
}

export interface CheckInResult {
  success: boolean;
  streak: number;
  coinsEarned: number;
  bonusEarned: number;
  totalEarned: number;
  message: string;
}

export interface SpinWheelSegment {
  id: string;
  label: string;
  value: number;
  color: string;
  type: 'coins' | 'discount' | 'voucher' | 'nothing';
  icon: string;
  probability?: number;
}

export interface SpinWheelData {
  segments: SpinWheelSegment[];
  isActive: boolean;
  rulesPerDay: {
    maxSpins: number;
    spinResetHour: number;
  };
  cooldownMinutes: number;
}

export interface SpinEligibility {
  canSpin: boolean;
  spinsRemaining: number;
  spinsUsedToday: number;
  nextSpinEligibleAt?: string;
  totalCoinsEarned: number;
  lastSpinAt?: string;
}

export interface SpinResult {
  success: boolean;
  segmentId: string;
  segmentLabel: string;
  rewardType: 'coins' | 'discount' | 'voucher' | 'nothing';
  rewardValue: number;
  spinsRemaining: number;
  message: string;
  newBalance?: number; // Updated wallet balance after spin
  coinsAdded?: number; // Coins added from this spin
}

export interface GamificationStats {
  coins: {
    balance: number;
    lifetimeEarned: number;
  };
  streak: StreakData;
  spinWheel: SpinEligibility;
  achievements: number;
  level: number;
}

export interface AffiliateStats {
  totalShares: number;
  appDownloads: number;
  purchases: number;
  commissionEarned: number;
}

export interface PromotionalPoster {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  colors: [string, string];
  shareBonus: number;
  isActive?: boolean;
}

export interface ShareSubmission {
  id: string;
  posterTitle: string;
  posterId?: string;
  postUrl: string;
  platform: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  approvedAt?: string;
  shareBonus: number;
  rejectionReason?: string;
}

export interface StreakBonus {
  days: number;
  reward: number;
  achieved: boolean;
}

export interface ReviewableItem {
  id: string;
  type: 'store' | 'product';
  name: string;
  image: string | null;
  category: string;
  visitDate?: string;
  purchaseDate?: string;
  coins: number;
  hasReceipt?: boolean;
  brand?: string | null;
}

export interface BonusOpportunity {
  id: string;
  title: string;
  description: string;
  reward: string;
  timeLeft: string;
  icon: string;
  type: 'challenge' | 'coin_drop' | 'campaign' | 'event';
  path?: string;
  urgent?: boolean;
}

// ============================================
// GAMIFICATION API SERVICE
// ============================================

class GamificationApiService {
  // ========================================
  // DAILY CHECK-IN / STREAK ENDPOINTS
  // ========================================

  /**
   * Get current user's streak and check-in status
   */
  async getStreakStatus(): Promise<ApiResponse<StreakData>> {
    try {
      const response = await apiClient.get<any>('/gamification/streaks');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            currentStreak: data.currentStreak || data.streak || 0,
            longestStreak: data.longestStreak || data.bestStreak || 0,
            hasCheckedInToday: data.hasCheckedInToday ?? data.checkedInToday ?? false,
            lastCheckInDate: data.lastCheckInDate || data.lastCheckIn,
            weeklyEarnings: data.weeklyEarnings || 0,
            totalEarned: data.totalEarned || 0,
            checkInHistory: data.checkInHistory || data.history || [],
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching streak:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Perform daily check-in
   */
  async performCheckIn(): Promise<ApiResponse<CheckInResult>> {
    try {
      const response = await apiClient.post<any>('/gamification/streak/checkin');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            success: true,
            streak: data.streak || data.currentStreak || 1,
            coinsEarned: data.coinsEarned || data.coins || 10,
            bonusEarned: data.bonusEarned || data.bonus || 0,
            totalEarned: data.totalEarned || (data.coinsEarned + data.bonusEarned) || 10,
            message: data.message || 'Check-in successful!',
          },
        };
      }

      return {
        success: false,
        error: response.error || 'Check-in failed',
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error performing check-in:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get weekly check-in calendar data
   */
  async getWeeklyCalendar(): Promise<ApiResponse<CheckInReward[]>> {
    try {
      const streakResponse = await this.getStreakStatus();

      if (streakResponse.success && streakResponse.data) {
        const { currentStreak, hasCheckedInToday } = streakResponse.data;

        // Build 7-day calendar
        const calendar: CheckInReward[] = [];
        const baseCoins = [10, 15, 20, 25, 30, 40, 100]; // Day 1-7 rewards

        for (let day = 1; day <= 7; day++) {
          const isClaimed = day <= currentStreak && (day < 7 || hasCheckedInToday);
          const isToday = day === currentStreak + 1 && !hasCheckedInToday;

          calendar.push({
            day,
            coins: baseCoins[day - 1],
            claimed: isClaimed,
            today: isToday,
            bonus: day === 7,
          });
        }

        return { success: true, data: calendar };
      }

      // Return default calendar if API fails
      return {
        success: true,
        data: [
          { day: 1, coins: 10, claimed: false },
          { day: 2, coins: 15, claimed: false },
          { day: 3, coins: 20, claimed: false },
          { day: 4, coins: 25, claimed: false, today: true },
          { day: 5, coins: 30, claimed: false },
          { day: 6, coins: 40, claimed: false },
          { day: 7, coins: 100, claimed: false, bonus: true },
        ],
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching calendar:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // SPIN WHEEL ENDPOINTS
  // ========================================

  /**
   * Get spin wheel configuration (prizes/segments)
   */
  async getSpinWheelData(): Promise<ApiResponse<SpinWheelData>> {
    try {
      const response = await apiClient.get<any>('/gamification/spin-wheel/data');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            segments: data.segments || data.prizes || [],
            isActive: data.isActive ?? true,
            rulesPerDay: data.rulesPerDay || { maxSpins: 3, spinResetHour: 0 },
            cooldownMinutes: data.cooldownMinutes || 0,
          },
        };
      }

      // Return default wheel if API fails
      return {
        success: true,
        data: {
          segments: [
            { id: '1', label: '₹10', value: 10, color: '#10B981', type: 'coins', icon: 'cash', probability: 30 },
            { id: '2', label: '₹25', value: 25, color: '#3B82F6', type: 'coins', icon: 'cash', probability: 25 },
            { id: '3', label: '₹50', value: 50, color: '#8B5CF6', type: 'coins', icon: 'cash', probability: 20 },
            { id: '4', label: '₹5', value: 5, color: '#F59E0B', type: 'coins', icon: 'cash', probability: 15 },
            { id: '5', label: '₹100', value: 100, color: '#EC4899', type: 'coins', icon: 'cash', probability: 5 },
            { id: '6', label: '₹15', value: 15, color: '#F97316', type: 'coins', icon: 'cash', probability: 5 },
          ],
          isActive: true,
          rulesPerDay: { maxSpins: 3, spinResetHour: 0 },
          cooldownMinutes: 0,
        },
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching spin wheel data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get spin wheel eligibility (can spin, spins remaining)
   */
  async getSpinEligibility(): Promise<ApiResponse<SpinEligibility>> {
    try {
      const response = await apiClient.get<any>('/gamification/spin-wheel/eligibility');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            canSpin: data.canSpin ?? data.eligible ?? (data.spinsRemaining > 0),
            spinsRemaining: data.spinsRemaining ?? data.remaining ?? 3,
            spinsUsedToday: data.spinsUsedToday ?? data.used ?? 0,
            nextSpinEligibleAt: data.nextSpinEligibleAt || data.nextSpinAt,
            totalCoinsEarned: data.totalCoinsEarned ?? data.totalWon ?? 0,
            lastSpinAt: data.lastSpinAt || data.lastSpin,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching spin eligibility:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute a spin
   */
  async executeSpin(): Promise<ApiResponse<SpinResult>> {
    try {
      const response = await apiClient.post<any>('/gamification/spin-wheel/spin');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            success: true,
            segmentId: data.segmentId || data.segment?.id || data.result?.segment?.id || '1',
            segmentLabel: data.segmentLabel || data.segment?.label || data.result?.prize?.label || data.prize?.label || '',
            rewardType: data.rewardType || data.result?.prize?.type || data.type || 'coins',
            rewardValue: data.rewardValue || data.result?.prize?.value || data.value || data.amount || data.coinsAdded || 0,
            spinsRemaining: data.spinsRemaining ?? data.remaining ?? 0,
            message: data.message || `You won ${data.rewardValue || data.value}!`,
            newBalance: data.newBalance, // Backend returns updated wallet balance
            coinsAdded: data.coinsAdded || data.result?.prize?.value || 0, // Actual coins added
          },
        };
      }

      return {
        success: false,
        error: response.error || 'Spin failed',
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error executing spin:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get spin history
   */
  async getSpinHistory(params?: { limit?: number }): Promise<ApiResponse<SpinResult[]>> {
    try {
      const response = await apiClient.get<any>('/gamification/spin-wheel/history', params);

      if (response.success && response.data) {
        const spins = (response.data.spins || response.data || []).map((spin: any) => ({
          success: true,
          segmentId: spin.segmentId,
          segmentLabel: spin.segmentLabel,
          rewardType: spin.rewardType,
          rewardValue: spin.rewardValue,
          spinsRemaining: 0,
          message: spin.message || '',
        }));

        return { success: true, data: spins };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching spin history:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // GAMIFICATION STATS
  // ========================================

  /**
   * Get overall gamification stats
   */
  async getGamificationStats(): Promise<ApiResponse<GamificationStats>> {
    try {
      const response = await apiClient.get<any>('/gamification/stats');

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching stats:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get coin balance
   */
  async getCoinBalance(): Promise<ApiResponse<{ balance: number; lifetimeEarned: number }>> {
    try {
      const response = await apiClient.get<any>('/gamification/coins/balance');

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            balance: response.data.balance || response.data.coins || 0,
            lifetimeEarned: response.data.lifetimeEarned || response.data.total || 0,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching coin balance:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // AFFILIATE / SHARE ENDPOINTS
  // ========================================

  /**
   * Get affiliate performance stats
   */
  async getAffiliateStats(): Promise<ApiResponse<AffiliateStats>> {
    try {
      const response = await apiClient.get<any>('/gamification/affiliate/stats');

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            totalShares: response.data.totalShares || 0,
            appDownloads: response.data.appDownloads || response.data.downloads || 0,
            purchases: response.data.purchases || 0,
            commissionEarned: response.data.commissionEarned || response.data.commission || 0,
          },
        };
      }

      // Return zeros if API fails (graceful degradation)
      return {
        success: true,
        data: {
          totalShares: 0,
          appDownloads: 0,
          purchases: 0,
          commissionEarned: 0,
        },
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching affiliate stats:', error);
      return {
        success: true,
        data: {
          totalShares: 0,
          appDownloads: 0,
          purchases: 0,
          commissionEarned: 0,
        },
      };
    }
  }

  /**
   * Get promotional posters for sharing
   */
  async getPromotionalPosters(): Promise<ApiResponse<PromotionalPoster[]>> {
    try {
      const response = await apiClient.get<any>('/gamification/promotional-posters');

      if (response.success && response.data) {
        // Backend returns { posters: [...] }
        const postersArray = response.data.posters || response.data || [];
        const posters = postersArray.map((poster: any) => ({
          id: poster._id || poster.id,
          title: poster.title,
          subtitle: poster.subtitle || poster.description,
          image: poster.image || poster.imageUrl,
          colors: Array.isArray(poster.colors) ? poster.colors : ['#F97316', '#EF4444'],
          shareBonus: poster.shareBonus || poster.bonus || 50,
          isActive: poster.isActive ?? true,
        }));

        return { success: true, data: posters };
      }

      // Return default posters if API fails
      return {
        success: true,
        data: [
          { id: '1', title: 'Mega Sale', subtitle: 'Up to 70% off + Extra Cashback', image: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=500', colors: ['#F97316', '#EF4444'], shareBonus: 50 },
          { id: '2', title: 'Weekend Bonanza', subtitle: '3X Coins on All Purchases', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=500', colors: ['#A855F7', '#EC4899'], shareBonus: 30 },
          { id: '3', title: 'New User Special', subtitle: 'Get Rs.500 Welcome Bonus', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=500', colors: ['#3B82F6', '#06B6D4'], shareBonus: 100 },
          { id: '4', title: 'Flash Sale Today', subtitle: 'Limited Time Mega Deals', image: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w=500', colors: ['#22C55E', '#14B8A6'], shareBonus: 40 },
        ],
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching promotional posters:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user's share submissions history
   */
  async getShareSubmissions(): Promise<ApiResponse<ShareSubmission[]>> {
    try {
      const response = await apiClient.get<any>('/gamification/affiliate/submissions');

      if (response.success && response.data) {
        // Backend returns { submissions: [...] }
        const submissionsArray = response.data.submissions || response.data || [];
        const submissions = submissionsArray.map((sub: any) => ({
          id: sub._id || sub.id,
          posterTitle: sub.posterTitle || sub.poster?.title || 'Promotional Poster',
          posterId: sub.posterId || sub.poster?._id,
          postUrl: sub.postUrl || sub.url,
          platform: sub.platform,
          status: sub.status || 'pending',
          submittedAt: sub.submittedAt || sub.createdAt,
          approvedAt: sub.approvedAt,
          shareBonus: sub.shareBonus || sub.bonus || 0,
          rejectionReason: sub.rejectionReason,
        }));

        return { success: true, data: submissions };
      }

      return { success: true, data: [] };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching submissions:', error);
      return { success: true, data: [] };
    }
  }

  /**
   * Submit a shared post for review
   */
  async submitSharePost(data: {
    posterId: string;
    posterTitle: string;
    postUrl: string;
    platform: string;
    shareBonus: number;
  }): Promise<ApiResponse<ShareSubmission>> {
    try {
      const response = await apiClient.post<any>('/gamification/affiliate/submit', data);

      if (response.success && response.data) {
        // Backend returns { submission: {...} }
        const sub = response.data.submission || response.data;
        return {
          success: true,
          data: {
            id: sub._id || sub.id || String(Date.now()),
            posterTitle: sub.posterTitle || data.posterTitle,
            posterId: sub.posterId || data.posterId,
            postUrl: sub.postUrl || data.postUrl,
            platform: sub.platform || data.platform,
            status: sub.status || 'pending',
            submittedAt: sub.submittedAt || new Date().toISOString(),
            shareBonus: sub.shareBonus || data.shareBonus,
          },
        };
      }

      return {
        success: false,
        error: response.error || 'Failed to submit post',
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error submitting post:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get streak bonus milestones
   */
  async getStreakBonuses(): Promise<ApiResponse<StreakBonus[]>> {
    try {
      const response = await apiClient.get<any>('/gamification/streak/bonuses');

      if (response.success && response.data) {
        // Backend returns { bonuses: [...] }
        const bonusesArray = response.data.bonuses || response.data || [];
        const bonuses = bonusesArray.map((b: any) => ({
          days: b.days || b.day,
          reward: b.reward || b.coinsReward || 0,
          achieved: b.achieved ?? false,
        }));

        if (bonuses.length > 0) {
          return { success: true, data: bonuses };
        }
      }

      // Return default bonuses if API fails or returns empty
      return {
        success: true,
        data: [
          { days: 7, reward: 100, achieved: false },
          { days: 30, reward: 500, achieved: false },
          { days: 100, reward: 2000, achieved: false },
        ],
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching streak bonuses:', error);
      return {
        success: true,
        data: [
          { days: 7, reward: 100, achieved: false },
          { days: 30, reward: 500, achieved: false },
          { days: 100, reward: 2000, achieved: false },
        ],
      };
    }
  }

  /**
   * Get reviewable items (stores/products user can review)
   */
  async getReviewableItems(): Promise<ApiResponse<{
    items: ReviewableItem[];
    totalPending: number;
    potentialEarnings: number;
  }>> {
    try {
      const response = await apiClient.get<any>('/gamification/reviewable-items');

      if (response.success && response.data) {
        return {
          success: true,
          data: {
            items: response.data.items || [],
            totalPending: response.data.totalPending || 0,
            potentialEarnings: response.data.potentialEarnings || 0,
          },
        };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching reviewable items:', error);
      return { success: false, error: error.message };
    }
  }

  // ========================================
  // BONUS OPPORTUNITIES (for Play & Earn)
  // ========================================

  /**
   * Get time-limited bonus opportunities (challenges, coin drops, campaigns ending soon)
   */
  async getBonusOpportunities(): Promise<ApiResponse<{
    opportunities: BonusOpportunity[];
    total: number;
  }>> {
    try {
      const response = await apiClient.get<any>('/gamification/bonus-opportunities');

      if (response.success && response.data) {
        const data = response.data;
        return {
          success: true,
          data: {
            opportunities: (data.opportunities || []).map((opp: any) => ({
              id: opp.id || opp._id,
              title: opp.title,
              description: opp.description,
              reward: opp.reward,
              timeLeft: opp.timeLeft,
              icon: opp.icon || '🎁',
              type: opp.type || 'challenge',
              path: opp.path,
              urgent: opp.urgent ?? false,
            })) as BonusOpportunity[],
            total: data.total || data.opportunities?.length || 0,
          },
        };
      }

      // Return default opportunities if API fails (graceful degradation)
      return {
        success: true,
        data: {
          opportunities: [
            { id: '1', title: 'Complete Your Profile', description: 'Fill in all details', reward: '50 coins', timeLeft: '2h left', icon: '👤', type: 'challenge' as const, path: '/profile/edit' },
            { id: '2', title: 'First Purchase Bonus', description: 'Get extra cashback', reward: '2x cashback', timeLeft: '24h left', icon: '🛒', type: 'campaign' as const, path: '/products' },
            { id: '3', title: 'Share & Earn', description: 'Share app with friends', reward: '100 coins', timeLeft: '3d left', icon: '📣', type: 'challenge' as const, path: '/share-and-earn' },
          ],
          total: 3,
        },
      };
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching bonus opportunities:', error);
      return {
        success: true,
        data: {
          opportunities: [],
          total: 0,
        },
      };
    }
  }

  /**
   * Get play and earn hub data (comprehensive data for Play & Earn page)
   */
  async getPlayAndEarnData(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get<any>('/gamification/play-and-earn');

      if (response.success && response.data) {
        return { success: true, data: response.data };
      }

      return response;
    } catch (error: any) {
      console.error('[GAMIFICATION API] Error fetching play and earn data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const gamificationApi = new GamificationApiService();

export default gamificationApi;
export { gamificationApi };
