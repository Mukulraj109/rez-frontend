import { useState, useEffect, useCallback } from 'react';

export interface EarningsStats {
  totalEarnings: number;
  monthlyEarnings: number;
  coins: number;
  pendingAmount: number;
  lifetimeEarnings: number;
}

export interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  reward: string;
  category: string;
  isNew: boolean;
  isActive: boolean;
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  reward: number;
  isCompleted: boolean;
  isPending: boolean;
  expiresAt?: string;
}

export interface CashbackOffer {
  id: string;
  title: string;
  cashback: string;
  icon: string;
  colors: [string, string];
  isActive: boolean;
  validUntil?: string;
}

export interface EarningTransaction {
  id: string;
  type: 'earned' | 'withdrawn' | 'pending';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'processing' | 'failed';
}

export interface EarnState {
  stats: EarningsStats;
  opportunities: EarningOpportunity[];
  tasks: DailyTask[];
  offers: CashbackOffer[];
  transactions: EarningTransaction[];
  loading: boolean;
  error: string | null;
}

// Mock data for development
const mockOpportunities: EarningOpportunity[] = [
  {
    id: '1',
    title: 'Shop & Earn',
    description: 'Get cashback on purchases',
    icon: 'bag-handle',
    iconColor: '#8B5CF6',
    reward: 'Up to 10%',
    category: 'Shopping',
    isNew: false,
    isActive: true,
  },
  {
    id: '2',
    title: 'Refer Friends',
    description: 'Invite and get rewards',
    icon: 'people',
    iconColor: '#10B981',
    reward: '₹100 each',
    category: 'Referral',
    isNew: true,
    isActive: true,
  },
  {
    id: '3',
    title: 'Survey Rewards',
    description: 'Complete surveys for money',
    icon: 'document-text',
    iconColor: '#F59E0B',
    reward: '₹50-200',
    category: 'Surveys',
    isNew: true,
    isActive: true,
  },
  {
    id: '4',
    title: 'Video Watching',
    description: 'Watch ads and earn',
    icon: 'play-circle',
    iconColor: '#EF4444',
    reward: '₹5-25',
    category: 'Videos',
    isNew: false,
    isActive: true,
  },
];

const mockTasks: DailyTask[] = [
  {
    id: '1',
    title: 'Daily Check-in',
    description: 'Login daily to earn coins',
    icon: 'checkmark-circle',
    iconColor: '#10B981',
    reward: 10,
    isCompleted: false,
    isPending: false,
    expiresAt: '2025-08-20T23:59:59Z',
  },
  {
    id: '2',
    title: 'Watch Ads',
    description: 'Watch 3 ads to earn coins',
    icon: 'eye',
    iconColor: '#8B5CF6',
    reward: 15,
    isCompleted: false,
    isPending: false,
    expiresAt: '2025-08-20T23:59:59Z',
  },
  {
    id: '3',
    title: 'Rate App',
    description: 'Rate us 5 stars on app store',
    icon: 'star',
    iconColor: '#F59E0B',
    reward: 25,
    isCompleted: false,
    isPending: false,
  },
  {
    id: '4',
    title: 'Share App',
    description: 'Share app with friends',
    icon: 'share-social',
    iconColor: '#06B6D4',
    reward: 20,
    isCompleted: false,
    isPending: false,
    expiresAt: '2025-08-20T23:59:59Z',
  },
];

const mockOffers: CashbackOffer[] = [
  {
    id: '1',
    title: 'Food Delivery',
    cashback: '8% Cashback',
    icon: 'restaurant',
    colors: ['#FF6B6B', '#FF8E8E'],
    isActive: true,
    validUntil: '2025-08-31T23:59:59Z',
  },
  {
    id: '2',
    title: 'Fashion',
    cashback: '12% Cashback',
    icon: 'shirt',
    colors: ['#4ECDC4', '#6DD5ED'],
    isActive: true,
    validUntil: '2025-08-31T23:59:59Z',
  },
  {
    id: '3',
    title: 'Travel',
    cashback: '5% Cashback',
    icon: 'car',
    colors: ['#A8E6CF', '#7FCDCD'],
    isActive: true,
    validUntil: '2025-08-31T23:59:59Z',
  },
  {
    id: '4',
    title: 'Electronics',
    cashback: '6% Cashback',
    icon: 'phone-portrait',
    colors: ['#FFB347', '#FFCC5C'],
    isActive: true,
    validUntil: '2025-08-31T23:59:59Z',
  },
];

const mockTransactions: EarningTransaction[] = [
  // Empty for now - will populate as users earn
];

export function useEarnData() {
  const [state, setState] = useState<EarnState>({
    stats: {
      totalEarnings: 0,
      monthlyEarnings: 0,
      coins: 382,
      pendingAmount: 0,
      lifetimeEarnings: 0,
    },
    opportunities: [],
    tasks: [],
    offers: [],
    transactions: [],
    loading: true,
    error: null,
  });

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, this would fetch from an API
      setState(prev => ({
        ...prev,
        opportunities: mockOpportunities,
        tasks: mockTasks,
        offers: mockOffers,
        transactions: mockTransactions,
        loading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load earn data',
      }));
    }
  }, []);

  // Complete task
  const completeTask = useCallback(async (taskId: string) => {
    const task = state.tasks.find(t => t.id === taskId);
    if (!task || task.isCompleted) return false;

    try {
      // Mark task as pending first
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, isPending: true } : t
        ),
      }));

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Complete task and update earnings
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, isCompleted: true, isPending: false } : t
        ),
        stats: {
          ...prev.stats,
          coins: prev.stats.coins + task.reward,
          totalEarnings: prev.stats.totalEarnings + (task.reward * 0.1), // Convert coins to money
          monthlyEarnings: prev.stats.monthlyEarnings + (task.reward * 0.1),
        },
        transactions: [
          {
            id: Date.now().toString(),
            type: 'earned',
            amount: task.reward * 0.1,
            description: `Task completed: ${task.title}`,
            date: new Date().toISOString(),
            status: 'completed',
          },
          ...prev.transactions,
        ],
      }));

      return true;
    } catch (error) {
      // Revert pending state on error
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t =>
          t.id === taskId ? { ...t, isPending: false } : t
        ),
      }));
      console.error('Failed to complete task:', error);
      return false;
    }
  }, [state.tasks]);

  // Start opportunity
  const startOpportunity = useCallback(async (opportunityId: string) => {
    const opportunity = state.opportunities.find(o => o.id === opportunityId);
    if (!opportunity) return false;

    try {
      // In a real app, this would navigate to the opportunity page or start the task
      console.log(`Starting opportunity: ${opportunity.title}`);
      return true;
    } catch (error) {
      console.error('Failed to start opportunity:', error);
      return false;
    }
  }, [state.opportunities]);

  // Use cashback offer
  const useCashbackOffer = useCallback(async (offerId: string) => {
    const offer = state.offers.find(o => o.id === offerId);
    if (!offer || !offer.isActive) return false;

    try {
      // In a real app, this would navigate to the merchant or start the shopping flow
      console.log(`Using cashback offer: ${offer.title}`);
      return true;
    } catch (error) {
      console.error('Failed to use cashback offer:', error);
      return false;
    }
  }, [state.offers]);

  // Refresh data
  const refresh = useCallback(() => {
    loadData();
  }, [loadData]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    state,
    actions: {
      completeTask,
      startOpportunity,
      useCashbackOffer,
      refresh,
    },
  };
}