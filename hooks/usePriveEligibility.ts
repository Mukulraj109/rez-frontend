/**
 * usePriveEligibility Hook
 *
 * Provides Privé eligibility status based on the 6-pillar reputation system.
 * Integrates with SubscriptionContext for tier data and can fetch from backend.
 *
 * 6 Pillars (weighted):
 * - Engagement (25%): How deeply you use ReZ
 * - Trust & Integrity (20%): Your reliability for brands
 * - Influence (20%): Your real social influence
 * - Economic Value (15%): Value to ecosystem
 * - Brand Affinity (10%): How brands perceive you
 * - Network & Community (10%): Ecosystem expansion impact
 *
 * Thresholds:
 * - Entry Tier: Score >= 70
 * - Elite Tier: Score >= 85
 * - Trust Minimum: 60 (hard block if below)
 */

import { useState, useEffect, useCallback } from 'react';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  PriveEligibility,
  PillarScore,
  PriveTier,
  TrendDirection,
  DEFAULT_PRIVE_ELIGIBILITY,
  ELIGIBILITY_THRESHOLDS,
} from '@/types/mode.types';
import priveApi from '@/services/priveApi';

// Pillar weights and colors
const PILLAR_CONFIG = {
  engagement: {
    weight: 0.25,
    color: '#4CAF50',
    icon: '📊',
    name: 'Engagement',
    description: 'How deeply you use ReZ',
  },
  trust: {
    weight: 0.20,
    color: '#2196F3',
    icon: '🛡️',
    name: 'Trust & Integrity',
    description: 'Your reliability for brands',
  },
  influence: {
    weight: 0.20,
    color: '#E91E63',
    icon: '📢',
    name: 'Influence',
    description: 'Your real social influence',
  },
  economic: {
    weight: 0.15,
    color: '#9C27B0',
    icon: '💰',
    name: 'Economic Value',
    description: 'Value you bring to ecosystem',
  },
  brand_affinity: {
    weight: 0.10,
    color: '#FF9800',
    icon: '🎯',
    name: 'Brand Affinity',
    description: 'How brands perceive you',
  },
  network: {
    weight: 0.10,
    color: '#00BCD4',
    icon: '🔗',
    name: 'Network & Community',
    description: 'Ecosystem expansion impact',
  },
};

// Improvement tips for each pillar
const IMPROVEMENT_TIPS: Record<string, string[]> = {
  engagement: [
    'Complete 2 more purchases this week',
    'Explore a new category',
    'Redeem some ReZ coins',
    'Maintain your login streak',
  ],
  trust: [
    'Ensure all bills are genuine',
    'Complete purchases without disputes',
    'Write authentic reviews',
  ],
  influence: [
    'Connect your social accounts',
    'Grow your follower count organically',
    'Maintain consistent content',
    'Complete brand campaigns successfully',
  ],
  economic: [
    'Increase your monthly spending',
    'Shop at premium categories',
    'Visit more merchants',
  ],
  brand_affinity: [
    'Accept brand campaign invitations',
    'Complete campaigns on time',
    'Maintain high brand ratings',
  ],
  network: [
    'Refer friends to ReZ',
    'Participate in community events',
    'Share content regularly',
  ],
};

interface UsePriveEligibilityReturn {
  eligibility: PriveEligibility;
  isLoading: boolean;
  error: string | null;
  isEligible: boolean;
  isPrive: boolean;
  tier: PriveTier;
  refresh: () => Promise<void>;
  markGlowSeen: () => void;
}

// Generate immediate mock eligibility for instant loading
const generateImmediateMockEligibility = (): PriveEligibility => {
  const mockScores = {
    engagement: 78,
    trust: 85,
    influence: 65,
    economic: 72,
    brand_affinity: 60,
    network: 58,
  };

  const pillars: PillarScore[] = Object.entries(mockScores).map(([id, score]) => {
    const config = PILLAR_CONFIG[id as keyof typeof PILLAR_CONFIG];
    return {
      id,
      name: config.name,
      score,
      weight: config.weight,
      weightedScore: score * config.weight,
      trend: 'stable' as TrendDirection,
      icon: config.icon,
      color: config.color,
      description: config.description,
      improvementTips: IMPROVEMENT_TIPS[id] || [],
    };
  });

  const totalScore = pillars.reduce((sum, p) => sum + p.weightedScore, 0);

  return {
    isEligible: true,
    score: Math.round(totalScore),
    tier: 'entry',
    pillars,
    trustScore: 85,
    hasSeenGlowThisSession: false,
  };
};

export const usePriveEligibility = (): UsePriveEligibilityReturn => {
  const { state: authState } = useAuth();
  const { computed } = useSubscription();

  // Start with mock data immediately - no loading state
  const [eligibility, setEligibility] = useState<PriveEligibility>(generateImmediateMockEligibility);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine tier based on score
  const determineTier = (score: number, trustScore: number): PriveTier => {
    // Hard block if trust is below minimum
    if (trustScore < ELIGIBILITY_THRESHOLDS.TRUST_MINIMUM) return 'none';

    if (score >= ELIGIBILITY_THRESHOLDS.ELITE_TIER) return 'elite';
    if (score >= ELIGIBILITY_THRESHOLDS.ENTRY_TIER) return 'entry';
    return 'none';
  };

  // Build pillar score from raw score
  const buildPillarScore = (
    id: string,
    rawScore: number,
    trend: TrendDirection = 'stable'
  ): PillarScore => {
    const config = PILLAR_CONFIG[id as keyof typeof PILLAR_CONFIG];
    return {
      id,
      name: config.name,
      score: rawScore,
      weight: config.weight,
      weightedScore: rawScore * config.weight,
      trend,
      icon: config.icon,
      color: config.color,
      description: config.description,
      improvementTips: IMPROVEMENT_TIPS[id] || [],
    };
  };

  // Fetch eligibility from backend API using priveApi service
  const fetchEligibilityFromBackend = async (): Promise<PriveEligibility | null> => {
    try {
      const response = await priveApi.getEligibility();

      if (response.success && response.data) {
        const backendData = response.data;

        // Transform backend pillars to frontend format
        const pillars: PillarScore[] = backendData.pillars.map((p: any) => {
          const config = PILLAR_CONFIG[p.id as keyof typeof PILLAR_CONFIG] || PILLAR_CONFIG.engagement;
          return {
            id: p.id,
            name: p.label || p.name || config.name,
            score: p.score,
            weight: p.weight,
            weightedScore: p.weightedScore,
            trend: (p.trend || 'stable') as TrendDirection,
            icon: p.icon || config.icon,
            color: p.color || config.color,
            description: p.description || config.description,
            improvementTips: p.improvementTips || IMPROVEMENT_TIPS[p.id] || [],
          };
        });

        return {
          isEligible: backendData.isEligible,
          score: backendData.score,
          tier: backendData.tier as PriveTier,
          pillars,
          trustScore: backendData.trustScore,
          reason: backendData.reason || (!backendData.isEligible
            ? backendData.trustScore < ELIGIBILITY_THRESHOLDS.TRUST_MINIMUM
              ? 'Trust score below minimum threshold'
              : 'Score below entry threshold'
            : undefined),
          accessState: backendData.accessState,
          gracePeriodEnds: backendData.gracePeriodEnds,
          hasSeenGlowThisSession: eligibility.hasSeenGlowThisSession,
        };
      }
      return null;
    } catch (error) {
      console.warn('[usePriveEligibility] Backend fetch failed, using mock data:', error);
      return null;
    }
  };

  // Calculate eligibility from backend data or fallback to mock
  const calculateEligibility = useCallback(async (): Promise<PriveEligibility> => {
    // Check if user is authenticated
    if (!authState.isAuthenticated || !authState.user) {
      return DEFAULT_PRIVE_ELIGIBILITY;
    }

    // Try to fetch from backend first
    const backendEligibility = await fetchEligibilityFromBackend();
    if (backendEligibility) {
      return backendEligibility;
    }

    // Fallback to mock data if backend fails
    const isPremiumOrVIP = computed.isPremium || computed.isVIP;

    // Mock pillar scores based on subscription status
    const mockScores = isPremiumOrVIP
      ? {
          engagement: 75 + Math.random() * 15,
          trust: 80 + Math.random() * 15,
          influence: 60 + Math.random() * 25,
          economic: 70 + Math.random() * 20,
          brand_affinity: 65 + Math.random() * 20,
          network: 55 + Math.random() * 30,
        }
      : {
          engagement: 30 + Math.random() * 30,
          trust: 70 + Math.random() * 20,
          influence: 20 + Math.random() * 30,
          economic: 25 + Math.random() * 25,
          brand_affinity: 15 + Math.random() * 25,
          network: 20 + Math.random() * 25,
        };

    // Build pillars
    const pillars: PillarScore[] = [
      buildPillarScore('engagement', mockScores.engagement, 'up'),
      buildPillarScore('trust', mockScores.trust, 'stable'),
      buildPillarScore('influence', mockScores.influence, 'up'),
      buildPillarScore('economic', mockScores.economic, 'stable'),
      buildPillarScore('brand_affinity', mockScores.brand_affinity, 'up'),
      buildPillarScore('network', mockScores.network, 'stable'),
    ];

    // Calculate total score
    const totalScore = pillars.reduce((sum, p) => sum + p.weightedScore, 0);
    const trustScore = mockScores.trust;

    // Determine tier
    const tier = determineTier(totalScore, trustScore);
    const isEligible = tier !== 'none';

    return {
      isEligible,
      score: Math.round(totalScore),
      tier,
      pillars,
      trustScore: Math.round(trustScore),
      reason: !isEligible
        ? trustScore < ELIGIBILITY_THRESHOLDS.TRUST_MINIMUM
          ? 'Trust score below minimum threshold'
          : 'Score below entry threshold'
        : undefined,
      hasSeenGlowThisSession: eligibility.hasSeenGlowThisSession, // Preserve session state
    };
  }, [authState.isAuthenticated, authState.user, authState.token, computed.isPremium, computed.isVIP, eligibility.hasSeenGlowThisSession]);

  // Refresh eligibility data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const newEligibility = await calculateEligibility();
      setEligibility(newEligibility);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate eligibility');
    } finally {
      setIsLoading(false);
    }
  }, [calculateEligibility]);

  // Mark glow animation as seen for this session
  const markGlowSeen = useCallback(() => {
    setEligibility((prev) => ({
      ...prev,
      hasSeenGlowThisSession: true,
    }));
  }, []);

  // Background update when auth changes - doesn't block UI
  useEffect(() => {
    // Only fetch in background if authenticated, don't block initial render
    if (authState.isAuthenticated && authState.user) {
      // Run in background without setting loading state
      calculateEligibility().then(newEligibility => {
        setEligibility(newEligibility);
      }).catch(err => {
        console.warn('[usePriveEligibility] Background fetch failed:', err);
        // Keep existing mock data on error
      });
    }
  }, [authState.isAuthenticated, computed.isPremium, computed.isVIP]);

  return {
    eligibility,
    isLoading,
    error,
    isEligible: eligibility.isEligible,
    isPrive: eligibility.tier !== 'none',
    tier: eligibility.tier,
    refresh,
    markGlowSeen,
  };
};

/**
 * Get human-readable eligibility status
 */
export const getEligibilityStatus = (eligibility: PriveEligibility): {
  headline: string;
  subtext: string;
  showProgress: boolean;
} => {
  if (eligibility.trustScore < ELIGIBILITY_THRESHOLDS.TRUST_MINIMUM) {
    return {
      headline: 'Privé Access Unavailable',
      subtext: 'Your account is under review',
      showProgress: false,
    };
  }

  if (eligibility.tier === 'elite') {
    return {
      headline: "You're Privé Elite",
      subtext: 'Top-tier access unlocked',
      showProgress: false,
    };
  }

  if (eligibility.tier === 'entry') {
    return {
      headline: "You're Privé Eligible",
      subtext: 'Welcome to the inner circle',
      showProgress: true,
    };
  }

  const pointsToEntry = ELIGIBILITY_THRESHOLDS.ENTRY_TIER - eligibility.score;
  if (pointsToEntry <= 10) {
    return {
      headline: "You're Almost There",
      subtext: 'Just a few more steps to Privé',
      showProgress: true,
    };
  }

  return {
    headline: 'Building Your Privé Profile',
    subtext: 'Keep engaging to unlock access',
    showProgress: true,
  };
};

/**
 * Get quick wins for improving eligibility
 */
export const getQuickWins = (pillars: PillarScore[]): string[] => {
  // Find the pillars with the most improvement potential
  const sorted = [...pillars].sort((a, b) => {
    // Prioritize by weighted potential gain
    const potentialA = (100 - a.score) * a.weight;
    const potentialB = (100 - b.score) * b.weight;
    return potentialB - potentialA;
  });

  // Get tips from top 2 improvable pillars
  const quickWins: string[] = [];
  for (const pillar of sorted.slice(0, 2)) {
    if (pillar.improvementTips.length > 0) {
      quickWins.push(pillar.improvementTips[0]);
    }
  }

  return quickWins;
};

export default usePriveEligibility;
