import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import achievementApi, { Achievement, AchievementProgress } from '@/services/achievementApi';
import pointsApi, { PointsBalance, PointTransaction } from '@/services/pointsApi';
import gamificationAPI from '@/services/gamificationApi';
import walletApi from '@/services/walletApi';
import coinSyncService from '@/services/coinSyncService';
import { useAuth } from './AuthContext';

// Feature flags for gradual rollout
const GAMIFICATION_FLAGS = {
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_COINS: true,
  ENABLE_CHALLENGES: true,
  ENABLE_LEADERBOARD: true,
  ENABLE_NOTIFICATIONS: true,
};

// Types - Use PointsBalance from API but SOURCE from Wallet API
export type CoinBalance = PointsBalance;

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  progress: number;
  target: number;
  reward: number;
  expiresAt: string;
  completed: boolean;
}

export interface AchievementUnlock {
  achievement: Achievement;
  timestamp: string;
  shown: boolean;
}

interface GamificationState {
  achievements: Achievement[];
  achievementProgress: AchievementProgress | null;
  coinBalance: CoinBalance;
  challenges: Challenge[];
  achievementQueue: AchievementUnlock[];
  dailyStreak: number;
  lastLoginDate: string | null;
  isLoading: boolean;
  error: string | null;
  featureFlags: typeof GAMIFICATION_FLAGS;
}

type GamificationAction =
  | { type: 'GAMIFICATION_LOADING'; payload: boolean }
  | { type: 'ACHIEVEMENTS_LOADED'; payload: { achievements: Achievement[]; progress: AchievementProgress } }
  | { type: 'COINS_LOADED'; payload: CoinBalance }
  | { type: 'CHALLENGES_LOADED'; payload: Challenge[] }
  | { type: 'ACHIEVEMENT_UNLOCKED'; payload: Achievement }
  | { type: 'ACHIEVEMENT_SHOWN'; payload: string }
  | { type: 'COINS_EARNED'; payload: number }
  | { type: 'COINS_SPENT'; payload: number }
  | { type: 'STREAK_UPDATED'; payload: { streak: number; loginDate: string } }
  | { type: 'CHALLENGE_PROGRESS'; payload: { challengeId: string; progress: number } }
  | { type: 'GAMIFICATION_ERROR'; payload: string }
  | { type: 'CLEAR_GAMIFICATION' }
  | { type: 'CLEAR_ERROR' };

// Storage keys
const STORAGE_KEYS = {
  ACHIEVEMENTS: 'gamification_achievements',
  COINS: 'gamification_coins',
  CHALLENGES: 'gamification_challenges',
  STREAK: 'gamification_streak',
  LAST_LOGIN: 'gamification_last_login',
  CACHE_TIME: 'gamification_cache_time',
};

// Cache duration (10 minutes)
const CACHE_DURATION = 10 * 60 * 1000;

// Initial state
const initialState: GamificationState = {
  achievements: [],
  achievementProgress: null,
  coinBalance: { total: 0, earned: 0, spent: 0, pending: 0, lifetimeEarned: 0, lifetimeSpent: 0 },
  challenges: [],
  achievementQueue: [],
  dailyStreak: 0,
  lastLoginDate: null,
  isLoading: false,
  error: null,
  featureFlags: GAMIFICATION_FLAGS,
};

// Reducer
function gamificationReducer(state: GamificationState, action: GamificationAction): GamificationState {
  switch (action.type) {
    case 'GAMIFICATION_LOADING':
      return { ...state, isLoading: action.payload, error: null };

    case 'ACHIEVEMENTS_LOADED':
      return {
        ...state,
        achievements: action.payload.achievements,
        achievementProgress: action.payload.progress,
        isLoading: false,
        error: null,
      };

    case 'COINS_LOADED':
      return {
        ...state,
        coinBalance: action.payload,
      };

    case 'CHALLENGES_LOADED':
      return {
        ...state,
        challenges: action.payload,
      };

    case 'ACHIEVEMENT_UNLOCKED':
      return {
        ...state,
        achievements: state.achievements.map((a) =>
          a.id === action.payload.id ? action.payload : a
        ),
        achievementQueue: [
          ...state.achievementQueue,
          {
            achievement: action.payload,
            timestamp: new Date().toISOString(),
            shown: false,
          },
        ],
      };

    case 'ACHIEVEMENT_SHOWN':
      return {
        ...state,
        achievementQueue: state.achievementQueue.map((item) =>
          item.achievement.id === action.payload ? { ...item, shown: true } : item
        ),
      };

    case 'COINS_EARNED':
      return {
        ...state,
        coinBalance: {
          ...state.coinBalance,
          total: state.coinBalance.total + action.payload,
          earned: state.coinBalance.earned + action.payload,
        },
      };

    case 'COINS_SPENT':
      return {
        ...state,
        coinBalance: {
          ...state.coinBalance,
          total: state.coinBalance.total - action.payload,
          spent: state.coinBalance.spent + action.payload,
        },
      };

    case 'STREAK_UPDATED':
      return {
        ...state,
        dailyStreak: action.payload.streak,
        lastLoginDate: action.payload.loginDate,
      };

    case 'CHALLENGE_PROGRESS':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === action.payload.challengeId
            ? { ...c, progress: action.payload.progress, completed: action.payload.progress >= c.target }
            : c
        ),
      };

    case 'GAMIFICATION_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'CLEAR_GAMIFICATION':
      return { ...initialState, featureFlags: state.featureFlags };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// Context
interface GamificationContextType {
  state: GamificationState;
  actions: {
    loadGamificationData: (forceRefresh?: boolean) => Promise<void>;
    syncCoinsFromWallet: () => Promise<void>;
    triggerAchievementCheck: (eventType: string, data?: any) => Promise<Achievement[]>;
    awardCoins: (amount: number, reason: string) => Promise<void>;
    spendCoins: (amount: number, reason: string) => Promise<void>;
    updateDailyStreak: () => Promise<void>;
    markAchievementAsShown: (achievementId: string) => void;
    refreshAchievements: () => Promise<void>;
    clearError: () => void;
  };
  computed: {
    unlockedCount: number;
    completionPercentage: number;
    pendingAchievements: AchievementUnlock[];
    hasUnshownAchievements: boolean;
    canEarnCoins: boolean;
  };
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

// Provider
interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  const [state, dispatch] = useReducer(gamificationReducer, initialState);
  const { state: authState } = useAuth();

  // CRITICAL: Queue for coin operations to prevent race conditions
  const coinOperationQueue = useRef<Array<() => Promise<void>>>([]);
  const isProcessingCoins = useRef(false);

  // Helper Functions - Define before useEffects
  // Check cache validity
  const isCacheValid = useCallback(async (): Promise<boolean> => {
    try {
      const cacheTime = await AsyncStorage.getItem(STORAGE_KEYS.CACHE_TIME);
      if (!cacheTime) return false;

      const timeDiff = Date.now() - parseInt(cacheTime, 10);
      return timeDiff < CACHE_DURATION;
    } catch {
      return false;
    }
  }, []);

  // Save to cache
  const saveToCache = useCallback(async () => {
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(state.achievements)],
        [STORAGE_KEYS.COINS, JSON.stringify(state.coinBalance)],
        [STORAGE_KEYS.CHALLENGES, JSON.stringify(state.challenges)],
        [STORAGE_KEYS.STREAK, state.dailyStreak.toString()],
        [STORAGE_KEYS.LAST_LOGIN, state.lastLoginDate || ''],
        [STORAGE_KEYS.CACHE_TIME, Date.now().toString()],
      ]);
    } catch (error) {
      console.error('[GAMIFICATION] Error saving to cache:', error);
    }
  }, [state.achievements, state.coinBalance, state.challenges, state.dailyStreak, state.lastLoginDate]);

  // CRITICAL: Queue processing function for atomic coin operations
  const processCoinQueue = useCallback(async () => {
    if (isProcessingCoins.current) return;
    isProcessingCoins.current = true;

    while (coinOperationQueue.current.length > 0) {
      const operation = coinOperationQueue.current.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('[GAMIFICATION] Coin operation failed:', error);
        }
      }
    }

    isProcessingCoins.current = false;
  }, []);

  const queueCoinOperation = useCallback((operation: () => Promise<void>): Promise<void> => {
    return new Promise((resolve, reject) => {
      coinOperationQueue.current.push(async () => {
        try {
          await operation();
          resolve();
        } catch (error) {
          reject(error);
        }
      });

      if (!isProcessingCoins.current) {
        processCoinQueue();
      }
    });
  }, [processCoinQueue]);

  // NEW: Sync coins from wallet (SINGLE SOURCE OF TRUTH)
  const syncCoinsFromWallet = useCallback(async () => {
    try {
      console.log('🔄 [GAMIFICATION] Syncing coins from wallet (source of truth)...');

      // Fetch wallet balance
      const walletResponse = await walletApi.getBalance();

      if (walletResponse.success && walletResponse.data) {
        // Extract wasil coin from wallet
        const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
        const walletCoins = wasilCoin?.amount || 0;

        // Update coin balance with wallet data
        const coinBalance: CoinBalance = {
          total: walletCoins,
          earned: walletResponse.data.statistics?.totalEarned || 0,
          spent: walletResponse.data.statistics?.totalSpent || 0,
          pending: walletResponse.data.balance.pending || 0,
          lifetimeEarned: walletResponse.data.statistics?.totalEarned || 0,
          lifetimeSpent: walletResponse.data.statistics?.totalSpent || 0,
        };

        dispatch({ type: 'COINS_LOADED', payload: coinBalance });
        console.log(`✅ [GAMIFICATION] Coins synced from wallet: ${walletCoins}`);
      }
    } catch (error) {
      console.error('❌ [GAMIFICATION] Error syncing coins from wallet:', error);
      // Fallback to points API if wallet fails
      try {
        const coinsResponse = await pointsApi.getBalance();
        if (coinsResponse.success && coinsResponse.data) {
          dispatch({ type: 'COINS_LOADED', payload: coinsResponse.data });
        }
      } catch (fallbackError) {
        console.error('[GAMIFICATION] Fallback to points API also failed:', fallbackError);
      }
    }
  }, []);

  // Load gamification data
  const loadGamificationData = useCallback(async (forceRefresh = false) => {
    if (!authState.isAuthenticated) {

      return;
    }

    try {
      dispatch({ type: 'GAMIFICATION_LOADING', payload: true });

      // Try cache first (unless force refresh)
      if (!forceRefresh && (await isCacheValid())) {
        const cachedData = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACHIEVEMENTS,
          STORAGE_KEYS.COINS,
          STORAGE_KEYS.CHALLENGES,
          STORAGE_KEYS.STREAK,
          STORAGE_KEYS.LAST_LOGIN,
        ]);

        const [achievementsData, coinsData, challengesData, streakData, lastLoginData] = cachedData;

        if (achievementsData[1]) {

          // Load from cache - simplified version
          dispatch({ type: 'GAMIFICATION_LOADING', payload: false });
          return;
        }
      }

      // Fetch fresh data

      // Fetch achievements
      if (state.featureFlags.ENABLE_ACHIEVEMENTS) {
        const progressResponse = await achievementApi.getAchievementProgress();
        if (progressResponse.data) {
          dispatch({
            type: 'ACHIEVEMENTS_LOADED',
            payload: {
              achievements: progressResponse.data.achievements,
              progress: progressResponse.data,
            },
          });
        }
      }

      // ✅ UPDATED: Fetch coins from WALLET API (single source of truth)
      if (state.featureFlags.ENABLE_COINS) {
        await syncCoinsFromWallet();
      }

      // Fetch active challenges
      if (state.featureFlags.ENABLE_CHALLENGES) {
        try {
          const challengesResponse = await gamificationAPI.getChallenges();
          if (challengesResponse.success && challengesResponse.data) {
            // Map backend challenges to context challenges
            const mappedChallenges: Challenge[] = challengesResponse.data.map((ch) => ({
              id: ch.id,
              title: ch.title,
              description: ch.description,
              type: ch.type as 'daily' | 'weekly' | 'monthly' | 'special',
              progress: ch.progress.current,
              target: ch.progress.target,
              reward: ch.rewards.coins,
              expiresAt: ch.endDate.toString(),
              completed: ch.status === 'completed',
            }));
            dispatch({ type: 'CHALLENGES_LOADED', payload: mappedChallenges });
          }
        } catch (error) {
          console.error('[GAMIFICATION] Error fetching challenges:', error);
        }
      }

      dispatch({ type: 'GAMIFICATION_LOADING', payload: false });
    } catch (error) {
      console.error('[GAMIFICATION] Error loading gamification data:', error);
      dispatch({
        type: 'GAMIFICATION_ERROR',
        payload: error instanceof Error ? error.message : 'Failed to load gamification data',
      });
    }
  }, [authState.isAuthenticated, isCacheValid, state.featureFlags.ENABLE_ACHIEVEMENTS, state.featureFlags.ENABLE_COINS, state.featureFlags.ENABLE_CHALLENGES]);

  // Trigger achievement check
  const triggerAchievementCheck = useCallback(async (eventType: string, data?: any): Promise<Achievement[]> => {
    if (!state.featureFlags.ENABLE_ACHIEVEMENTS) return [];

    try {

      // Recalculate achievements based on new data
      const response = await achievementApi.recalculateAchievements();

      if (response.data) {
        // Find newly unlocked achievements
        const newlyUnlocked = response.data.filter(
          (achievement) =>
            achievement.unlocked &&
            !state.achievements.find((a) => a.id === achievement.id && a.unlocked)
        );
        
        // Dispatch each newly unlocked achievement
        newlyUnlocked.forEach((achievement) => {
          dispatch({ type: 'ACHIEVEMENT_UNLOCKED', payload: achievement });
        });

        // Refresh achievements list
        const progressResponse = await achievementApi.getAchievementProgress();
        if (progressResponse.data) {
          dispatch({
            type: 'ACHIEVEMENTS_LOADED',
            payload: {
              achievements: progressResponse.data.achievements,
              progress: progressResponse.data,
            },
          });
        }

        return newlyUnlocked;
      }

      return [];
    } catch (error) {
      console.error('[GAMIFICATION] Error checking achievements:', error);
      return [];
    }
  }, [state.featureFlags.ENABLE_ACHIEVEMENTS, state.achievements]);

  // ✅ UPDATED: Award coins via operation queue (prevents race conditions)
  const awardCoins = useCallback(async (amount: number, reason: string) => {
    if (!state.featureFlags.ENABLE_COINS) return;

    return queueCoinOperation(async () => {
      try {
        console.log(`💰 [GAMIFICATION] Awarding ${amount} coins: ${reason}`);

        // Use coin sync service to award coins (syncs to wallet automatically)
        const syncResult = await coinSyncService.syncGamificationReward(
          amount,
          'bonus',
          { reason, timestamp: new Date().toISOString() }
        );

        if (syncResult.success) {
          // Update local state
          dispatch({ type: 'COINS_EARNED', payload: amount });

          // Refresh from wallet (single source of truth)
          await syncCoinsFromWallet();

          // Also check for coin-related achievements
          await triggerAchievementCheck('COINS_EARNED', { amount, reason });

          console.log(`✅ [GAMIFICATION] Coins awarded and synced to wallet: ${syncResult.newWalletBalance}`);
        } else {
          throw new Error(syncResult.error || 'Failed to sync coins to wallet');
        }
      } catch (error) {
        console.error('[GAMIFICATION] Error awarding coins:', error);
        throw error;
      }
    });
  }, [state.featureFlags.ENABLE_COINS, queueCoinOperation, syncCoinsFromWallet, triggerAchievementCheck]);

  // ✅ UPDATED: Spend coins via operation queue (prevents race conditions)
  const spendCoins = useCallback(async (amount: number, reason: string) => {
    if (!state.featureFlags.ENABLE_COINS) return;

    return queueCoinOperation(async () => {
      try {
        console.log(`💸 [GAMIFICATION] Spending ${amount} coins: ${reason}`);

        if (state.coinBalance.total < amount) {
          throw new Error('Insufficient coin balance');
        }

        // Use coin sync service to spend coins (syncs to wallet automatically)
        const syncResult = await coinSyncService.spendCoins(amount, reason, {
          timestamp: new Date().toISOString(),
        });

        if (syncResult.success) {
          // Update local state
          dispatch({ type: 'COINS_SPENT', payload: amount });

          // Refresh from wallet (single source of truth)
          await syncCoinsFromWallet();

          console.log(`✅ [GAMIFICATION] Coins spent and synced to wallet: ${syncResult.newWalletBalance}`);
        } else {
          throw new Error(syncResult.error || 'Failed to sync coin spending to wallet');
        }
      } catch (error) {
        console.error('[GAMIFICATION] Error spending coins:', error);
        throw error;
      }
    });
  }, [state.featureFlags.ENABLE_COINS, state.coinBalance.total, queueCoinOperation, syncCoinsFromWallet]);

  // Update daily streak
  const updateDailyStreak = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastLogin = state.lastLoginDate?.split('T')[0];

      if (lastLogin === today) {
        // Already logged in today
        return;
      }

      // Check daily check-in status from API
      try {
        const checkInStatusResponse = await pointsApi.getDailyCheckIn();

        if (checkInStatusResponse.success && checkInStatusResponse.data?.canCheckIn) {
          // Perform daily check-in
          const checkInResponse = await pointsApi.performDailyCheckIn();

          if (checkInResponse.success && checkInResponse.data) {
            const { pointsEarned, streak } = checkInResponse.data;

            dispatch({
              type: 'STREAK_UPDATED',
              payload: { streak, loginDate: new Date().toISOString() },
            });

            // ✅ UPDATED: Update coin balance from wallet (single source of truth)
            await syncCoinsFromWallet();

            // Check for streak achievements
            await triggerAchievementCheck('DAILY_LOGIN', { streak, pointsEarned });

          }
        } else if (checkInStatusResponse.data) {
          // Already checked in, just update local state
          dispatch({
            type: 'STREAK_UPDATED',
            payload: {
              streak: checkInStatusResponse.data.currentStreak,
              loginDate: checkInStatusResponse.data.lastCheckInDate || new Date().toISOString(),
            },
          });
        }
      } catch (checkInError) {
        // Silently handle check-in API errors (endpoint may not exist yet)
        console.debug('[GAMIFICATION] Daily check-in endpoint not available:', checkInError);
      }
    } catch (error) {
      console.error('[GAMIFICATION] Error updating daily streak:', error);
    }
  }, [state.lastLoginDate, triggerAchievementCheck]);

  // Mark achievement as shown
  const markAchievementAsShown = useCallback((achievementId: string) => {
    dispatch({ type: 'ACHIEVEMENT_SHOWN', payload: achievementId });
  }, []);

  // Refresh achievements
  const refreshAchievements = useCallback(async () => {
    await loadGamificationData(true);
  }, [loadGamificationData]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Effects - Run after function definitions
  // Load gamification data on mount and when auth changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadGamificationData();
      updateDailyStreak();
    } else {
      dispatch({ type: 'CLEAR_GAMIFICATION' });
    }
  }, [authState.isAuthenticated, loadGamificationData, updateDailyStreak]);

  // Save data to cache periodically
  useEffect(() => {
    if (authState.isAuthenticated) {
      saveToCache();
    }
  }, [authState.isAuthenticated, state.achievements, state.coinBalance, state.challenges, state.dailyStreak, saveToCache]);

  // Computed values
  const unlockedCount = state.achievementProgress?.summary.unlocked || 0;
  const completionPercentage = state.achievementProgress?.summary.completionPercentage || 0;
  const pendingAchievements = state.achievementQueue.filter((item) => !item.shown);
  const hasUnshownAchievements = pendingAchievements.length > 0;
  const canEarnCoins = state.featureFlags.ENABLE_COINS;

  // OPTIMIZED: Memoize context value to prevent unnecessary re-renders
  const contextValue: GamificationContextType = useMemo(() => ({
    state,
    actions: {
      loadGamificationData,
      syncCoinsFromWallet,
      triggerAchievementCheck,
      awardCoins,
      spendCoins,
      updateDailyStreak,
      markAchievementAsShown,
      refreshAchievements,
      clearError,
    },
    computed: {
      unlockedCount,
      completionPercentage,
      pendingAchievements,
      hasUnshownAchievements,
      canEarnCoins,
    },
  }), [
    state,
    loadGamificationData,
    syncCoinsFromWallet,
    triggerAchievementCheck,
    awardCoins,
    spendCoins,
    updateDailyStreak,
    markAchievementAsShown,
    refreshAchievements,
    clearError,
    unlockedCount,
    completionPercentage,
    pendingAchievements,
    hasUnshownAchievements,
    canEarnCoins,
  ]);

  return (
    <GamificationContext.Provider value={contextValue}>
      {children}
    </GamificationContext.Provider>
  );
}

// Hook
export function useGamification() {
  const context = useContext(GamificationContext);
  if (context === undefined) {
    throw new Error('useGamification must be used within a GamificationProvider');
  }
  return context;
}

export { GamificationContext };
export type { GamificationState, GamificationContextType };
