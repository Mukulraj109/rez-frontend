import { useState, useEffect, useCallback } from 'react';
import { EarnPageState, EarnPageActions, Notification, Project } from '@/types/earnPage.types';
import { 
  fetchEarnPageData, 
  markNotificationAsRead, 
  startProject, 
  shareReferralLink,
  fetchRecentProjects,
  fetchCategories
} from '@/data/earnPageData';

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
      
      const response = await fetchEarnPageData();
      
      if (response.success) {
        setState(prev => ({
          ...prev,
          ...response.data,
          loading: false,
          lastUpdated: response.timestamp,
        }));
      }
    } catch (error) {
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
      await markNotificationAsRead(notificationId);
      
      setState(prev => ({
        ...prev,
        notifications: prev.notifications.map(notification =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        ),
      }));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Start a project
  const startProjectAction = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      const success = await startProject(projectId);
      
      if (success) {
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
      }
      
      return success;
    } catch (error) {
      console.error('Failed to start project:', error);
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
      const link = await shareReferralLink();
      return link;
    } catch (error) {
      console.error('Failed to share referral link:', error);
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
      const moreProjects = await fetchRecentProjects(5);
      setState(prev => ({
        ...prev,
        recentProjects: [...prev.recentProjects, ...moreProjects],
      }));
    } catch (error) {
      console.error('Failed to load more projects:', error);
    }
  }, []);

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