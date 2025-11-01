import { useState, useEffect, useCallback } from 'react';
import { EarnPageState, EarnPageActions, Notification, Project } from '@/types/earnPage.types';
import earningProjectsApi from '@/services/earningProjectsApi';
import { Alert } from 'react-native';

const initialState: EarnPageState = {
  notifications: [],
  projectStatus: {
    completeNow: 0,
    inReview: 0,
    completed: 0,
  },
  earnings: {
    totalEarned: 0,
    breakdown: {
      projects: 0,
      referrals: 0,
      shareAndEarn: 0,
      spin: 0,
    },
    currency: '₹',
  },
  recentProjects: [],
  categories: [],
  referralData: {
    totalReferrals: 0,
    totalEarningsFromReferrals: 0,
    pendingReferrals: 0,
    referralBonus: 0,
    referralLink: '',
  },
  walletInfo: {
    balance: 0,
    pendingBalance: 0,
    totalWithdrawn: 0,
  },
  loading: false,
  error: null,
  lastUpdated: '',
};

export function useEarnPageData() {
  const [state, setState] = useState<EarnPageState>(initialState);

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Fetch all data in parallel for better performance
      const [
        projectsResponse,
        earningsResponse,
        statsResponse,
        notificationsResponse,
        categoriesResponse,
        referralResponse
      ] = await Promise.all([
        earningProjectsApi.getProjects({ status: 'available', limit: 10 }),
        earningProjectsApi.getUserEarnings(),
        earningProjectsApi.getProjectStats(),
        earningProjectsApi.getNotifications({ unreadOnly: false, limit: 5 }),
        earningProjectsApi.getCategories(),
        earningProjectsApi.getReferralInfo()
      ]);

      // Transform API data to match component expectations
      const transformedProjects: Project[] = projectsResponse.data?.projects?.map(p => ({
        id: p._id,
        title: p.title,
        description: p.description,
        payment: p.payment,
        duration: p.duration,
        status: (p.status === 'expired' ? 'available' : p.status) as 'available' | 'in_progress' | 'in_review' | 'completed',
        category: p.category,
        difficulty: p.difficulty,
        requirements: p.requirements || [],
        createdAt: p.createdAt
      })) || [];

      const transformedNotifications: Notification[] = notificationsResponse.data?.map(n => ({
        id: n._id,
        title: n.title,
        description: n.description,
        type: n.type,
        isRead: n.isRead,
        createdAt: n.createdAt,
        priority: n.priority
      })) || [];

      setState(prev => ({
        ...prev,
        notifications: transformedNotifications,
        projectStatus: statsResponse.data || {
          completeNow: 0,
          inReview: 0,
          completed: 0
        },
        earnings: earningsResponse.data ? {
          totalEarned: earningsResponse.data.totalEarned,
          breakdown: {
            ...earningsResponse.data.breakdown,
            spin: (earningsResponse.data.breakdown as any).spin || 0,
          },
          currency: earningsResponse.data.currency
        } : prev.earnings,
        recentProjects: transformedProjects,
        categories: categoriesResponse.data?.map(c => ({
          id: c._id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          color: c.color as any,
          projectCount: c.projectCount,
          averagePayment: c.averagePayment,
          isActive: c.isActive !== undefined ? c.isActive : true
        })) || [],
        referralData: referralResponse.data ? {
          totalReferrals: referralResponse.data.totalReferrals,
          totalEarningsFromReferrals: referralResponse.data.totalEarningsFromReferrals,
          pendingReferrals: referralResponse.data.pendingReferrals,
          referralBonus: referralResponse.data.referralBonus,
          referralLink: referralResponse.data.referralLink
        } : prev.referralData,
        walletInfo: earningsResponse.data ? {
          balance: earningsResponse.data.availableBalance,
          pendingBalance: earningsResponse.data.pendingEarnings,
          totalWithdrawn: 0 // This would come from a separate API
        } : prev.walletInfo,
        loading: false,
        lastUpdated: new Date().toISOString()
      }));
    } catch (error) {
      console.error('[EARN PAGE] Error loading data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load data',
      }));
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // Mark notification as read
  const markNotificationAsReadAction = useCallback(async (notificationId: string) => {
    try {
      const response = await earningProjectsApi.markNotificationAsRead(notificationId);

      if (response.success) {
        setState(prev => ({
          ...prev,
          notifications: prev.notifications.map(notification =>
            notification.id === notificationId
              ? { ...notification, isRead: true }
              : notification
          ),
        }));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Start a project
  const startProjectAction = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const response = await earningProjectsApi.startProject(projectId);

      if (response.success) {
        setState(prev => ({
          ...prev,
          recentProjects: prev.recentProjects.map(project =>
            project.id === projectId
              ? { ...project, status: 'in_progress' }
              : project
          ),
          projectStatus: {
            ...prev.projectStatus,
            completeNow: prev.projectStatus.completeNow + 1,
          },
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to start project:', error);
      Alert.alert('Error', 'Failed to start project. Please try again.');
      return false;
    }
  }, []);

  // Complete a project
  const completeProjectAction = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const project = state.recentProjects.find(p => p.id === projectId);
      if (!project) return false;

      // Simulate project completion
      setState(prev => ({
        ...prev,
        recentProjects: prev.recentProjects.map(p =>
          p.id === projectId
            ? { ...p, status: 'in_review' }
            : p
        ),
        projectStatus: {
          ...prev.projectStatus,
          completeNow: prev.projectStatus.completeNow - 1,
          inReview: prev.projectStatus.inReview + 1,
        },
        earnings: {
          ...prev.earnings,
          totalEarned: prev.earnings.totalEarned + project.payment,
          breakdown: {
            ...prev.earnings.breakdown,
            projects: prev.earnings.breakdown.projects + project.payment,
          },
        },
        walletInfo: {
          ...prev.walletInfo,
          pendingBalance: prev.walletInfo.pendingBalance + project.payment,
        },
      }));

      return true;
    } catch (error) {
      console.error('Failed to complete project:', error);
      return false;
    }
  }, [state.recentProjects]);

  // Share referral link
  const shareReferralLinkAction = useCallback(async (): Promise<string> => {
    try {
      const response = await earningProjectsApi.getReferralInfo();
      if (response.success && response.data) {
        return response.data.referralLink;
      }
      return '';
    } catch (error) {
      console.error('Failed to get referral link:', error);
      return '';
    }
  }, []);

  // Withdraw earnings
  const withdrawEarnings = useCallback(async (amount: number): Promise<boolean> => {
    try {
      if (amount > state.walletInfo.balance) {
        throw new Error('Insufficient balance');
      }

      // Simulate withdrawal
      setState(prev => ({
        ...prev,
        walletInfo: {
          ...prev.walletInfo,
          balance: prev.walletInfo.balance - amount,
          totalWithdrawn: prev.walletInfo.totalWithdrawn + amount,
          lastTransaction: {
            id: `tx_${Date.now()}`,
            amount: -amount,
            type: 'withdrawn',
            date: new Date().toISOString(),
            description: 'Withdrawal to bank account',
          },
        },
      }));

      return true;
    } catch (error) {
      console.error('Failed to withdraw earnings:', error);
      return false;
    }
  }, [state.walletInfo.balance]);

  // Load more projects
  const loadMoreProjects = useCallback(async () => {
    try {
      const response = await earningProjectsApi.getProjects({
        status: 'available',
        page: Math.floor(state.recentProjects.length / 5) + 1,
        limit: 5
      });

      if (response.success && response.data) {
        const transformedProjects: Project[] = response.data.projects.map(p => ({
          id: p._id,
          title: p.title,
          description: p.description,
          payment: p.payment,
          duration: p.duration,
          status: (p.status === 'expired' ? 'available' : p.status) as 'available' | 'in_progress' | 'in_review' | 'completed',
          category: p.category,
          difficulty: p.difficulty,
          requirements: p.requirements || [],
          createdAt: p.createdAt
        }));

        setState(prev => ({
          ...prev,
          recentProjects: [...prev.recentProjects, ...transformedProjects],
        }));
      }
    } catch (error) {
      console.error('Failed to load more projects:', error);
    }
  }, [state.recentProjects.length]);

  // Filter projects by category
  const filterProjectsByCategory = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      recentProjects: prev.recentProjects.filter(project => 
        project.category === categoryId
      ),
    }));
  }, []);

  // Search projects
  const searchProjects = useCallback((query: string) => {
    if (!query.trim()) {
      // Reset to all projects if empty search
      loadData();
      return;
    }

    setState(prev => ({
      ...prev,
      recentProjects: prev.recentProjects.filter(project =>
        project.title.toLowerCase().includes(query.toLowerCase()) ||
        project.description.toLowerCase().includes(query.toLowerCase())
      ),
    }));
  }, [loadData]);

  // Actions object
  const actions: EarnPageActions = {
    refreshData,
    markNotificationAsRead: markNotificationAsReadAction,
    startProject: startProjectAction,
    completeProject: completeProjectAction,
    shareReferralLink: shareReferralLinkAction,
    withdrawEarnings,
    loadMoreProjects,
    filterProjectsByCategory,
    searchProjects,
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    state,
    actions,
  };
}

// Helper hooks for specific data
export function useNotifications() {
  const { state, actions } = useEarnPageData();
  
  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.isRead).length,
    markAsRead: actions.markNotificationAsRead,
  };
}

export function useProjects() {
  const { state, actions } = useEarnPageData();
  
  return {
    projects: state.recentProjects,
    projectStatus: state.projectStatus,
    startProject: actions.startProject,
    completeProject: actions.completeProject,
    loadMore: actions.loadMoreProjects,
    filter: actions.filterProjectsByCategory,
    search: actions.searchProjects,
  };
}

export function useEarnings() {
  const { state, actions } = useEarnPageData();
  
  return {
    earnings: state.earnings,
    walletInfo: state.walletInfo,
    withdraw: actions.withdrawEarnings,
  };
}

export function useReferrals() {
  const { state, actions } = useEarnPageData();
  
  return {
    referralData: state.referralData,
    shareLink: actions.shareReferralLink,
  };
}