/**
 * usePriveSection Hook
 * Data & state management for Privé section
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePriveEligibility } from './usePriveEligibility';
import { PILLAR_CONFIG } from '@/components/prive/priveTheme';

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

  // Start with loading false - we have mock data ready immediately
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State - initialized with mock data immediately
  const [userData, setUserData] = useState<PriveUserData>(
    generateMockUserData(authState.user?.name || 'Privé Member')
  );
  const [featuredOffers] = useState<PriveOffer[]>(DEFAULT_OFFERS);
  const [highlights] = useState(DEFAULT_HIGHLIGHTS);
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({
    isCheckedIn: false,
    streak: 7,
    weeklyEarnings: 2840,
    loops: DEFAULT_HABIT_LOOPS,
  });

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
        pillars: eligibility.pillars.map(p => ({
          id: p.id,
          score: p.score,
          trend: p.trend,
        })),
      }));
    }
  }, [eligibility]);

  // Refresh function
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshEligibility();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh');
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshEligibility]);

  // Check-in function
  const checkIn = useCallback(async () => {
    try {
      // In production: await fetch('/api/prive/check-in', { method: 'POST' });
      setDailyProgress(prev => ({
        ...prev,
        isCheckedIn: true,
        streak: prev.streak + 1,
      }));
    } catch (err) {
      console.error('Check-in failed:', err);
    }
  }, []);

  // Track offer click
  const trackOfferClick = useCallback((offerId: string) => {
    // In production: analytics.track('prive_offer_click', { offerId });
    console.log('[Privé] Offer clicked:', offerId);
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
