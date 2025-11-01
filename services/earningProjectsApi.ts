// Earning Projects API Service
// Handles earning opportunities, tasks, and user earnings

import apiClient, { ApiResponse } from './apiClient';

export interface EarningProject {
  _id: string;
  title: string;
  description: string;
  payment: number;
  duration: string;
  status: 'available' | 'in_progress' | 'in_review' | 'completed' | 'expired';
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  requirements: string[];
  thumbnail?: string;
  company?: {
    name: string;
    logo?: string;
    verified?: boolean;
  };
  tags?: string[];
  maxParticipants?: number;
  currentParticipants?: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserEarnings {
  totalEarned: number;
  pendingEarnings: number;
  availableBalance: number;
  breakdown: {
    projects: number;
    referrals: number;
    shareAndEarn: number;
    bonuses: number;
  };
  currency: string;
}

export interface ProjectStats {
  completeNow: number;
  inReview: number;
  completed: number;
  totalProjects: number;
}

export interface EarningNotification {
  _id: string;
  title: string;
  description: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  relatedProject?: string;
  createdAt: string;
}

export interface EarningCategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  projectCount: number;
  averagePayment: number;
  isActive: boolean;
}

export interface ReferralInfo {
  totalReferrals: number;
  totalEarningsFromReferrals: number;
  pendingReferrals: number;
  referralBonus: number;
  referralCode: string;
  referralLink: string;
}

class EarningProjectsApi {
  /**
   * Get available earning projects
   */
  async getProjects(params?: {
    status?: string;
    category?: string;
    difficulty?: string;
    minPayment?: number;
    maxPayment?: number;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    projects: EarningProject[];
    total: number;
    page: number;
    pages: number;
  }>> {
    try {
      return await apiClient.get('/earning-projects', params);
    } catch (error) {
      console.error('[EARNING API] Error fetching projects:', error);
      // Return mock data as fallback for now
      return {
        success: true,
        data: {
          projects: this.getMockProjects(),
          total: 10,
          page: 1,
          pages: 1
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get project details
   */
  async getProjectById(projectId: string): Promise<ApiResponse<EarningProject>> {
    try {
      return await apiClient.get(`/earning-projects/${projectId}`);
    } catch (error) {
      console.error('[EARNING API] Error fetching project details:', error);
      throw error;
    }
  }

  /**
   * Start a project
   */
  async startProject(projectId: string): Promise<ApiResponse<{
    message: string;
    projectStatus: string;
  }>> {
    try {
      return await apiClient.post(`/earning-projects/${projectId}/start`);
    } catch (error) {
      console.error('[EARNING API] Error starting project:', error);
      // Simulate success for now
      return {
        success: true,
        data: {
          message: 'Project started successfully',
          projectStatus: 'in_progress'
        },
        message: 'Project started'
      };
    }
  }

  /**
   * Complete a project
   */
  async completeProject(projectId: string, data?: any): Promise<ApiResponse<{
    message: string;
    earnedAmount: number;
  }>> {
    try {
      return await apiClient.post(`/earning-projects/${projectId}/complete`, data);
    } catch (error) {
      console.error('[EARNING API] Error completing project:', error);
      throw error;
    }
  }

  /**
   * Get user's earnings summary
   */
  async getUserEarnings(): Promise<ApiResponse<UserEarnings>> {
    try {
      return await apiClient.get('/earnings/summary');
    } catch (error) {
      console.error('[EARNING API] Error fetching earnings:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          totalEarned: 1250,
          pendingEarnings: 180,
          availableBalance: 1070,
          breakdown: {
            projects: 1000,
            referrals: 200,
            shareAndEarn: 50,
            bonuses: 0
          },
          currency: '₹'
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get user's project statistics
   */
  async getProjectStats(): Promise<ApiResponse<ProjectStats>> {
    try {
      return await apiClient.get('/earnings/project-stats');
    } catch (error) {
      console.error('[EARNING API] Error fetching project stats:', error);
      // Return mock data as fallback
      return {
        success: true,
        data: {
          completeNow: 2,
          inReview: 1,
          completed: 5,
          totalProjects: 8
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get earning notifications
   */
  async getNotifications(params?: {
    unreadOnly?: boolean;
    limit?: number;
  }): Promise<ApiResponse<EarningNotification[]>> {
    try {
      return await apiClient.get('/earnings/notifications', params);
    } catch (error) {
      console.error('[EARNING API] Error fetching notifications:', error);
      // Return mock notifications
      return {
        success: true,
        data: this.getMockNotifications(),
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<{
    message: string;
  }>> {
    try {
      return await apiClient.patch(`/earnings/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('[EARNING API] Error marking notification as read:', error);
      return {
        success: true,
        data: { message: 'Notification marked as read' },
        message: 'Success'
      };
    }
  }

  /**
   * Get earning categories
   */
  async getCategories(): Promise<ApiResponse<EarningCategory[]>> {
    try {
      return await apiClient.get('/earning-projects/categories');
    } catch (error) {
      console.error('[EARNING API] Error fetching categories:', error);
      // Return mock categories
      return {
        success: true,
        data: this.getMockCategories(),
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Get referral information
   */
  async getReferralInfo(): Promise<ApiResponse<ReferralInfo>> {
    try {
      return await apiClient.get('/earnings/referral-info');
    } catch (error) {
      console.error('[EARNING API] Error fetching referral info:', error);
      // Return mock data
      return {
        success: true,
        data: {
          totalReferrals: 3,
          totalEarningsFromReferrals: 150,
          pendingReferrals: 1,
          referralBonus: 50,
          referralCode: 'REZ2025',
          referralLink: 'https://rez.app/ref/REZ2025'
        },
        message: 'Using fallback data'
      };
    }
  }

  /**
   * Withdraw earnings
   */
  async withdrawEarnings(amount: number, method: string): Promise<ApiResponse<{
    message: string;
    transactionId: string;
  }>> {
    try {
      return await apiClient.post('/earnings/withdraw', { amount, method });
    } catch (error) {
      console.error('[EARNING API] Error withdrawing earnings:', error);
      throw error;
    }
  }

  // Mock data helpers (temporary until backend is ready)
  private getMockProjects(): EarningProject[] {
    return [
      {
        _id: '1',
        title: 'Angel One Account Opening',
        description: 'Open a new Angel One trading account and complete KYC verification',
        payment: 250,
        duration: '20 Min',
        status: 'available',
        category: 'finance',
        difficulty: 'easy',
        requirements: ['Valid PAN Card', 'Aadhaar Card', 'Bank Account'],
        company: {
          name: 'Angel One',
          verified: true
        },
        tags: ['trading', 'investment', 'quick'],
        maxParticipants: 100,
        currentParticipants: 45,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Product Review Video',
        description: 'Create a 60-second review video for our new smartphone',
        payment: 500,
        duration: '1 Hour',
        status: 'available',
        category: 'content',
        difficulty: 'medium',
        requirements: ['Smartphone with camera', 'Good lighting', 'Clear audio'],
        company: {
          name: 'TechBrand',
          verified: true
        },
        tags: ['video', 'review', 'creative'],
        maxParticipants: 50,
        currentParticipants: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Social Media Survey',
        description: 'Complete a detailed survey about your social media habits',
        payment: 100,
        duration: '10 Min',
        status: 'available',
        category: 'survey',
        difficulty: 'easy',
        requirements: ['Active social media user'],
        tags: ['survey', 'quick', 'easy'],
        maxParticipants: 500,
        currentParticipants: 234,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private getMockNotifications(): EarningNotification[] {
    return [
      {
        _id: '1',
        title: 'New High-Paying Project',
        description: 'Angel One account opening project is now available',
        type: 'info',
        isRead: false,
        priority: 'high',
        createdAt: new Date().toISOString()
      },
      {
        _id: '2',
        title: 'Project Under Review',
        description: 'Your video review submission is being reviewed',
        type: 'warning',
        isRead: false,
        priority: 'medium',
        createdAt: new Date().toISOString()
      },
      {
        _id: '3',
        title: 'Payment Received',
        description: '₹500 has been credited to your wallet',
        type: 'success',
        isRead: true,
        priority: 'high',
        createdAt: new Date().toISOString()
      }
    ];
  }

  private getMockCategories(): EarningCategory[] {
    return [
      {
        _id: '1',
        name: 'Finance',
        slug: 'finance',
        description: 'Banking and investment related projects',
        icon: '💰',
        color: '#4CAF50',
        projectCount: 12,
        averagePayment: 200,
        isActive: true
      },
      {
        _id: '2',
        name: 'Content Creation',
        slug: 'content',
        description: 'Video, photo, and written content projects',
        icon: '📹',
        color: '#FF6B6B',
        projectCount: 8,
        averagePayment: 350,
        isActive: true
      },
      {
        _id: '3',
        name: 'Surveys',
        slug: 'surveys',
        description: 'Quick surveys and feedback tasks',
        icon: '📋',
        color: '#4ECDC4',
        projectCount: 25,
        averagePayment: 75,
        isActive: true
      },
      {
        _id: '4',
        name: 'App Testing',
        slug: 'testing',
        description: 'Test apps and provide feedback',
        icon: '📱',
        color: '#95E1D3',
        projectCount: 5,
        averagePayment: 150,
        isActive: true
      }
    ];
  }
}

// Create singleton instance
const earningProjectsApi = new EarningProjectsApi();

export default earningProjectsApi;