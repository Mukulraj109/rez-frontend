// data/earnSocialData.ts - Mock data and configurations for Earn From Social Media feature

import { 
  EarnSocialState, 
  CashbackCard, 
  StepCard, 
  EarningsInfo,
  SocialMediaPost 
} from '@/types/earn-social.types';

export const EarnSocialData = {
  // Initial state for the earn social media page
  initialState: {
    currentStep: 'overview',
    instagramUrl: '',
    isValidUrl: false,
    loading: false,
    error: null,
    success: false,
    earnings: {
      pendingAmount: 85,
      totalEarned: 420,
      cashbackRate: 5,
      currentBalance: 1660,
      estimatedCrediting: '48 hours'
    },
    uploadProgress: 0,
    posts: []
  } as EarnSocialState,

  // Cashback information cards
  cashbackCards: [
    {
      id: 'cashback-main',
      title: 'CASH BACK',
      description: 'Buy anything and share it on Instagram. We\'ll give you 5% cash back in the form of coins.',
      percentage: 5,
      icon: '💰',
      backgroundColor: '#8B5CF6',
      textColor: '#FFFFFF'
    },
    {
      id: 'share-coins',
      title: 'Share to get coins',
      description: 'We\'ll credit your account within 48 hours. Use your coins to buy more things.',
      percentage: 5,
      icon: '💎',
      backgroundColor: '#F3F4F6',
      textColor: '#111827'
    }
  ] as CashbackCard[],

  // Step-by-step process cards
  stepCards: [
    {
      stepNumber: 1,
      title: 'Share a post on Instagram',
      description: 'Take a photo of your purchase and share it on your Instagram story or feed',
      illustration: '📱',
      isCompleted: false,
      isActive: true
    },
    {
      stepNumber: 2,
      title: 'Submit your post',
      description: 'Copy and paste the Instagram post URL to get your cashback',
      illustration: '🔗',
      isCompleted: false,
      isActive: false
    }
  ] as StepCard[],

  // Mock existing posts
  mockPosts: [
    {
      id: 'post_001',
      url: 'https://instagram.com/p/abc123',
      status: 'approved',
      submittedAt: new Date('2024-01-15'),
      cashbackAmount: 25,
      platform: 'instagram',
      thumbnailUrl: 'https://picsum.photos/200/200?random=1'
    },
    {
      id: 'post_002', 
      url: 'https://instagram.com/p/def456',
      status: 'pending',
      submittedAt: new Date('2024-01-20'),
      cashbackAmount: 15,
      platform: 'instagram',
      thumbnailUrl: 'https://picsum.photos/200/200?random=2'
    }
  ] as SocialMediaPost[],

  // API endpoints and configurations
  api: {
    // Simulate API calls with promises
    validateInstagramUrl: async (url: string): Promise<{ isValid: boolean; error?: string }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Basic Instagram URL validation
      const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?/;
      const isValid = instagramUrlPattern.test(url);
      
      return {
        isValid,
        error: isValid ? undefined : 'Please enter a valid Instagram post URL'
      };
    },

    submitPost: async (url: string): Promise<{ success: boolean; data?: any; error?: string }> => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate 90% success rate
      const success = Math.random() > 0.1;
      
      if (success) {
        return {
          success: true,
          data: {
            postId: `post_${Date.now()}`,
            cashbackAmount: 25,
            status: 'pending',
            estimatedCrediting: '48 hours'
          }
        };
      } else {
        return {
          success: false,
          error: 'Failed to process your post. Please try again.'
        };
      }
    },

    getEarnings: async (): Promise<EarningsInfo> => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        pendingAmount: 85,
        totalEarned: 420,
        cashbackRate: 5,
        currentBalance: 1660,
        estimatedCrediting: '48 hours'
      };
    },

    getUserPosts: async (): Promise<SocialMediaPost[]> => {
      await new Promise(resolve => setTimeout(resolve, 600));
      return EarnSocialData.mockPosts;
    }
  },

  // Helper functions
  helpers: {
    validateInstagramUrl: (url: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      const pattern = /^https?:\/\/(www\.)?instagram\.com\/p\/[a-zA-Z0-9_-]+\/?$/;
      return pattern.test(url.trim());
    },

    extractPostId: (url: string): string | null => {
      const match = url.match(/instagram\.com\/p\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    },

    formatCurrency: (amount: number): string => {
      return `₹${amount.toLocaleString('en-IN')}`;
    },

    getStatusColor: (status: SocialMediaPost['status']): string => {
      const colors = {
        pending: '#F59E0B',
        approved: '#10B981', 
        rejected: '#EF4444',
        credited: '#8B5CF6'
      };
      return colors[status] || '#6B7280';
    },

    getStatusText: (status: SocialMediaPost['status']): string => {
      const texts = {
        pending: 'Under Review',
        approved: 'Approved',
        rejected: 'Rejected', 
        credited: 'Credited'
      };
      return texts[status] || 'Unknown';
    }
  },

  // UI Configuration
  ui: {
    colors: {
      primary: '#8B5CF6',
      primaryDark: '#7C3AED',
      secondary: '#F3F4F6',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      text: '#111827',
      textSecondary: '#6B7280',
      background: '#FFFFFF',
      border: '#E5E7EB'
    },
    
    gradients: {
      primary: ['#8B5CF6', '#7C3AED'],
      card: ['#F9FAFB', '#F3F4F6'],
      success: ['#10B981', '#059669']
    },

    animations: {
      uploadDuration: 2000,
      successDelay: 500,
      fadeInDuration: 300
    }
  }
};

export default EarnSocialData;