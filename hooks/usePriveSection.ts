/**
 * usePriveSection Hook
 * Data & state management for Privé section
 * Integrates with backend Privé APIs for real-time data
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePriveEligibility } from './usePriveEligibility';
import { PILLAR_CONFIG } from '@/components/prive/priveTheme';
import priveApi, {
  PriveOffer as ApiPriveOffer,
  HighlightItem as ApiHighlightItem,
  Highlights as ApiHighlights,
  HabitLoop as ApiHabitLoop,
  CheckInResponse,
  PriveDashboard,
} from '@/services/priveApi';

// Types
interface PriveOffer {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  reward: string;
  expiresIn: string;
  isExclusive: boolean;
}

interface HighlightItem {
  id: string;
  type: 'offer' | 'store' | 'campaign';
  icon: string;
  title: string;
  subtitle: string;
  badge: string;
  badgeColor: string;
}

interface HabitLoop {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
  progress: number;
}

interface PillarData {
  id: string;
  score: number;
  trend: 'up' | 'down' | 'stable';
}

interface PriveUserData {
  name: string;
  tier: string;
  tierProgress: number;
  nextTier: string;
  pointsToNext: number;
  totalCoins: number;
  rezCoins: number;
  priveCoins: number;
  brandedCoins: number;
  monthlyEarnings: number;
  activeCampaigns: number;
  completedCampaigns: number;
  memberId: string;
  memberSince: string;
  validThru: string;
  totalScore: number;
  accessState: 'active' | 'paused' | 'building';
  pillars: PillarData[];
}

interface DailyProgress {
  isCheckedIn: boolean;
  streak: number;
  weeklyEarnings: number;
  loops: HabitLoop[];
}

interface UsePriveSectionReturn {
  // User data
  userData: PriveUserData;
  eligibility: ReturnType<typeof usePriveEligibility>['eligibility'];

  // Offers
  featuredOffers: PriveOffer[];

  // Highlights
  highlights: {
    curatedOffer: HighlightItem;
    nearbyStore: HighlightItem;
    opportunity: HighlightItem;
  };

  // Habits
  dailyProgress: DailyProgress;

  // States
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  checkIn: () => Promise<void>;
  trackOfferClick: (offerId: string) => void;
}

// Mock data generator
const generateMockUserData = (userName: string): PriveUserData => ({
  name: userName || 'Privé Member',
  tier: 'Signature',
  tierProgress: 0.72,
  nextTier: 'Elite',
  pointsToNext: 2800,
  totalCoins: 12450,
  rezCoins: 8200,
  priveCoins: 3150,
  brandedCoins: 1100,
  monthlyEarnings: 2840,
  activeCampaigns: 3,
  completedCampaigns: 47,
  memberId: '4829 7156 3842 0917',
  memberSince: '12/23',
  validThru: '12/28',
  totalScore: 74.5,
  accessState: 'active',
  pillars: [
    { id: 'engagement', score: 78, trend: 'up' },
    { id: 'trust', score: 92, trend: 'stable' },
    { id: 'influence', score: 65, trend: 'up' },
    { id: 'economic', score: 70, trend: 'stable' },
    { id: 'brand_affinity', score: 60, trend: 'down' },
    { id: 'network', score: 55, trend: 'stable' },
  ],
});

const DEFAULT_OFFERS: PriveOffer[] = [
  {
    id: '1',
    brand: 'Artisan Watch Co',
    title: 'Private Preview Event',
    subtitle: 'Exclusive collection launch',
    reward: '500 Privé Coins',
    expiresIn: '2 days',
    isExclusive: true,
  },
  {
    id: '2',
    brand: 'Luxury Café',
    title: 'Weekend Dining Experience',
    subtitle: 'Complimentary tasting menu',
    reward: '300 ReZ Coins',
    expiresIn: '5 days',
    isExclusive: false,
  },
  {
    id: '3',
    brand: 'Premium Spa',
    title: 'Wellness Retreat',
    subtitle: 'Full day spa package',
    reward: '750 Privé Coins',
    expiresIn: '7 days',
    isExclusive: true,
  },
];

const DEFAULT_HIGHLIGHTS = {
  curatedOffer: {
    id: 'offer1',
    type: 'offer' as const,
    icon: '🎁',
    title: 'Up to 40% at StyleHub',
    subtitle: 'Privé members only',
    badge: 'Limited',
    badgeColor: '#E91E63',
  },
  nearbyStore: {
    id: 'store1',
    type: 'store' as const,
    icon: '📍',
    title: 'Café Artisan - 0.5km',
    subtitle: '25% Privé bonus today',
    badge: 'Nearby',
    badgeColor: '#4CAF50',
  },
  opportunity: {
    id: 'campaign1',
    type: 'campaign' as const,
    icon: '📢',
    title: 'Brand Campaign',
    subtitle: 'Earn 500 Privé Coins',
    badge: 'New',
    badgeColor: '#FF9800',
  },
};

const DEFAULT_HABIT_LOOPS: HabitLoop[] = [
  { id: 'smart_spend', name: 'Smart Spend', icon: '💰', completed: true, progress: 100 },
  { id: 'influence', name: 'Influence', icon: '📢', completed: false, progress: 60 },
  { id: 'redemption_pride', name: 'Redemption', icon: '🎁', completed: false, progress: 30 },
  { id: 'network', name: 'Network', icon: '🔗', completed: true, progress: 100 },
];

export const usePriveSection = (): UsePriveSectionReturn => {
  const { state: authState } = useAuth();
  const {
    eligibility,
    refresh: refreshEligibility,
  } = usePriveEligibility();

  // Track if initial fetch has been done
  const hasFetchedRef = useRef(false);

  // Start with loading false - we have mock data ready immediately
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State - initialized with mock data immediately
  const [userData, setUserData] = useState<PriveUserData>(
    generateMockUserData(authState.user?.name || 'Privé Member')
  );
  const [featuredOffers, setFeaturedOffers] = useState<PriveOffer[]>(DEFAULT_OFFERS);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    isCheckedIn: false,
    streak: 7,
    weeklyEarnings: 2840,
    loops: DEFAULT_HABIT_LOOPS,
  });

  // Transform API offer to local format
  const transformOffer = (offer: ApiPriveOffer): PriveOffer => ({
    id: offer.id,
    brand: offer.brand,
    title: offer.title,
    subtitle: offer.subtitle,
    reward: offer.reward,
    expiresIn: offer.expiresIn,
    isExclusive: offer.isExclusive,
  });

  // Transform API highlight to local format
  const transformHighlight = (highlight: ApiHighlightItem): HighlightItem => ({
    id: highlight.id,
    type: highlight.type,
    icon: highlight.icon,
    title: highlight.title,
    subtitle: highlight.subtitle,
    badge: highlight.badge,
    badgeColor: highlight.badgeColor,
  });

  // Fetch dashboard data from backend
  const fetchDashboardData = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const response = await priveApi.getDashboard();

      if (response.success && response.data) {
        const dashboard = response.data;

        // Update user data
        if (dashboard.user) {
          setUserData(prev => ({
            ...prev,
            name: dashboard.user.name || prev.name,
            memberId: dashboard.user.memberId || prev.memberId,
            memberSince: dashboard.user.memberSince || prev.memberSince,
            validThru: dashboard.user.validThru || prev.validThru,
            tierProgress: dashboard.user.tierProgress || prev.tierProgress,
            pointsToNext: dashboard.user.pointsToNext || prev.pointsToNext,
            nextTier: dashboard.user.nextTier || prev.nextTier,
          }));
        }

        // Update coins
        if (dashboard.coins) {
          setUserData(prev => ({
            ...prev,
            totalCoins: dashboard.coins.total,
            rezCoins: dashboard.coins.rez,
            priveCoins: dashboard.coins.prive,
            brandedCoins: dashboard.coins.branded,
          }));
        }

        // Update stats
        if (dashboard.stats) {
          setUserData(prev => ({
            ...prev,
            activeCampaigns: dashboard.stats.activeCampaigns,
            completedCampaigns: dashboard.stats.completedCampaigns,
          }));
        }

        // Update featured offers
        if (dashboard.featuredOffers && dashboard.featuredOffers.length > 0) {
          setFeaturedOffers(dashboard.featuredOffers.map(transformOffer));
        }

        // Update highlights
        if (dashboard.highlights) {
          setHighlights({
            curatedOffer: transformHighlight(dashboard.highlights.curatedOffer),
            nearbyStore: transformHighlight(dashboard.highlights.nearbyStore),
            opportunity: transformHighlight(dashboard.highlights.opportunity),
          });
        }

        // Update daily progress
        if (dashboard.dailyProgress) {
          setDailyProgress({
            isCheckedIn: dashboard.dailyProgress.isCheckedIn,
            streak: dashboard.dailyProgress.streak,
            weeklyEarnings: dashboard.dailyProgress.weeklyEarnings,
            loops: dashboard.dailyProgress.loops.map(loop => ({
              id: loop.id,
              name: loop.name,
              icon: loop.icon,
              completed: loop.completed,
              progress: loop.progress,
            })),
          });
        }
      }
    } catch (err) {
      console.warn('[usePriveSection] Failed to fetch dashboard:', err);
      // Keep mock data on error
    }
  }, [authState.isAuthenticated]);

  // Update user name when auth changes
  useEffect(() => {
    if (authState.user?.name) {
      setUserData(prev => ({
        ...prev,
        name: authState.user?.name || 'Privé Member',
      }));
    }
  }, [authState.user?.name]);

  // Update pillars when eligibility changes (in background)
  useEffect(() => {
    if (eligibility.pillars && eligibility.pillars.length > 0) {
      setUserData(prev => ({
        ...prev,
        totalScore: eligibility.score,
        tier: eligibility.tier === 'elite' ? 'Elite' :
              eligibility.tier === 'signature' ? 'Signature' :
              eligibility.tier === 'entry' ? 'Entry' : 'Building',
        pillars: eligibility.pillars.map(p => ({
          id: p.id,
          score: p.score,
          trend: p.trend,
        })),
      }));
    }
  }, [eligibility]);

  // Initial fetch - runs once when authenticated
  useEffect(() => {
    if (authState.isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      // Fetch in background without blocking UI
      fetchDashboardData();
    }
  }, [authState.isAuthenticated, fetchDashboardData]);

  // Refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      await Promise.all([
        refreshEligibility(),
        fetchDashboardData(),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEligibility, fetchDashboardData]);

  // Check-in function - now uses real API
  const checkIn = useCallback(async () => {
    try {
      const response = await priveApi.checkIn();

      if (response.success && response.data) {
        const { streak, coinsEarned, bonusEarned, totalEarned, message } = response.data;

        // Update daily progress
        setDailyProgress(prev => ({
          ...prev,
          isCheckedIn: true,
          streak: streak,
        }));

        // Update coins earned
        setUserData(prev => ({
          ...prev,
          rezCoins: prev.rezCoins + totalEarned,
          totalCoins: prev.totalCoins + totalEarned,
          monthlyEarnings: prev.monthlyEarnings + totalEarned,
        }));

        console.log(`[Privé] Check-in successful: ${message}`);
      }
    } catch (err) {
      console.error('[Privé] Check-in failed:', err);
      // Fallback to local update if API fails
      setDailyProgress(prev => ({
        ...prev,
        isCheckedIn: true,
        streak: prev.streak + 1,
      }));
    }
  }, []);

  // Track offer click - now uses real API
  const trackOfferClick = useCallback(async (offerId: string) => {
    try {
      await priveApi.trackOfferClick(offerId);
      console.log('[Privé] Offer click tracked:', offerId);
    } catch (err) {
      console.warn('[Privé] Failed to track offer click:', err);
    }
  }, []);

  return {
    userData,
    eligibility,
    featuredOffers,
    highlights,
    dailyProgress,
    isLoading,
    isRefreshing,
    error,
    refresh,
    checkIn,
    trackOfferClick,
  };
};

export default usePriveSection;
