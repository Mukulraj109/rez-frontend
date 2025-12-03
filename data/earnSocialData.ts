// data/earnSocialData.ts - Production-ready data and configurations for Earn From Social Media feature

import {
  EarnSocialState,
  CashbackCard,
  StepCard,
  EarningsInfo,
  SocialMediaPost
} from '@/types/earn-social.types';
import socialMediaApi from '@/services/socialMediaApi';

export const EarnSocialData = {
  // Initial state for the earn social media page
  // NOTE: All values are initialized to 0/empty - real data is fetched from backend
  initialState: {
    currentStep: 'overview',
    instagramUrl: '',
    isValidUrl: false,
    loading: false,
    error: null,
    success: false,
    earnings: {
      pendingAmount: 0,
      totalEarned: 0,
      cashbackRate: 5, // Fixed 5% rate
      currentBalance: 0,
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

  // Mock posts removed - all data fetched from backend
  mockPosts: [] as SocialMediaPost[],

  // API endpoints connected to real backend
  api: {
    // Validate Instagram URL (client-side validation only, backend validates too)
    validateInstagramUrl: async (url: string): Promise<{ isValid: boolean; error?: string }> => {
      try {
        // Instagram URL validation - supports posts (/p/), reels (/reel/ and /reels/) with optional username
        const instagramUrlPattern = /^https?:\/\/(www\.)?instagram\.com\/([\w.]+\/)?(p|reel|reels|instagramreel)\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
        const isValid = instagramUrlPattern.test(url);

        if (!isValid) {
          return {
            isValid: false,
            error: 'Please enter a valid Instagram URL (e.g., https://instagram.com/p/ABC123 or https://instagram.com/username/p/ABC123)'
          };
        }

        return { isValid: true };
      } catch (error) {
        return {
          isValid: false,
          error: 'Failed to validate URL. Please try again.'
        };
      }
    },

    // Submit post to backend
    submitPost: async (url: string, orderId?: string): Promise<{ success: boolean; data?: any; error?: string }> => {
      try {
        console.log('📤 [EarnSocialData] Submitting post to backend:', { url, orderId });

        const response = await socialMediaApi.submitPost({
          platform: 'instagram',
          postUrl: url,
          orderId
        });

        console.log('✅ [EarnSocialData] Post submitted successfully:', response);

        return {
          success: true,
          data: {
            postId: response.post.id,
            cashbackAmount: response.post.cashbackAmount,
            status: response.post.status,
            estimatedCrediting: response.post.estimatedReview
          }
        };
      } catch (error: any) {
        console.error('❌ [EarnSocialData] Failed to submit post:', error);
        return {
          success: false,
          error: error.response?.data?.message || error.message || 'Failed to submit post. Please try again.'
        };
      }
    },

    // Get earnings from backend
    getEarnings: async (): Promise<EarningsInfo> => {
      try {
        console.log('📤 [EarnSocialData] Fetching earnings from backend...');
        const data = await socialMediaApi.getUserEarnings();

        console.log('✅ [EarnSocialData] Earnings fetched:', data);

        return {
          pendingAmount: data.pendingAmount || 0,
          totalEarned: data.totalEarned || 0,
          cashbackRate: 5, // Fixed rate
          currentBalance: data.creditedAmount || 0,
          estimatedCrediting: '48 hours'
        };
      } catch (error: any) {
        console.error('❌ [EarnSocialData] Failed to fetch earnings:', error);
        // Return default values on error
        return {
          pendingAmount: 0,
          totalEarned: 0,
          cashbackRate: 5,
          currentBalance: 0,
          estimatedCrediting: '48 hours'
        };
      }
    },

    // Get user posts from backend
    getUserPosts: async (): Promise<SocialMediaPost[]> => {
      try {
        console.log('📤 [EarnSocialData] Fetching user posts from backend...');
        const response = await socialMediaApi.getUserPosts({ limit: 20 });

        console.log('✅ [EarnSocialData] Posts fetched:', response.posts?.length || 0);

        // Transform backend posts to frontend format
        const posts: SocialMediaPost[] = response.posts.map(post => ({
          id: post._id,
          url: post.postUrl,
          status: post.status,
          submittedAt: new Date(post.submittedAt),
          cashbackAmount: post.cashbackAmount,
          platform: post.platform,
          thumbnailUrl: post.metadata?.thumbnailUrl
        }));

        return posts;
      } catch (error: any) {
        console.error('❌ [EarnSocialData] Failed to fetch posts:', error);
        return []; // Return empty array on error
      }
    }
  },

  // Helper functions
  helpers: {
    validateInstagramUrl: (url: string): boolean => {
      if (!url || typeof url !== 'string') return false;
      // Supports /p/, /reel/, and /reels/ URLs
      const pattern = /^https?:\/\/(www\.)?instagram\.com\/([\w.]+\/)?(p|reel|reels|instagramreel)\/[a-zA-Z0-9_-]+\/?(\?.*)?$/;
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