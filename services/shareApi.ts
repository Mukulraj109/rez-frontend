// Share API Service
// Handles all share-related API calls

import apiClient from './apiClient';

export interface ShareableContent {
  products: Array<{
    id: string;
    name: string;
    image: string;
    reward: { baseCoins: number; clickBonus: number; conversionBonus: number };
  }>;
  offers: Array<{
    id: string;
    title: string;
    image: string;
    reward: { baseCoins: number; clickBonus: number; conversionBonus: number };
  }>;
  stores: Array<{
    id: string;
    name: string;
    image: string;
    reward: { baseCoins: number; clickBonus: number; conversionBonus: number };
  }>;
  referral: {
    code: string;
    reward: { baseCoins: number; clickBonus: number; conversionBonus: number };
    message: string;
  };
}

export interface Share {
  _id: string;
  contentType: 'product' | 'store' | 'offer' | 'referral' | 'video' | 'article';
  contentId: string;
  platform: string;
  shareUrl: string;
  trackingCode: string;
  clicks: number;
  conversions: number;
  coinsEarned: number;
  status: 'pending' | 'verified' | 'rewarded' | 'expired';
  createdAt: string;
  expiresAt: string;
}

export interface ShareStats {
  totalShares: number;
  totalClicks: number;
  totalConversions: number;
  totalCoinsEarned: number;
  byType: {
    [key: string]: {
      shares: number;
      clicks: number;
      conversions: number;
      coins: number;
    };
  };
}

export interface DailyShareLimits {
  [contentType: string]: {
    used: number;
    limit: number;
    remaining: number;
  };
}

class ShareApi {
  // Get shareable content
  async getShareableContent() {
    return apiClient.get<ShareableContent>('/share/content');
  }

  // Create share tracking
  async createShare(
    contentType: 'product' | 'store' | 'offer' | 'referral' | 'video' | 'article',
    contentId: string,
    platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'copy_link' | 'other'
  ) {
    return apiClient.post<{
      shareUrl: string;
      trackingCode: string;
      expiresAt: string;
    }>('/share/track', { contentType, contentId, platform });
  }

  // Get share history
  async getShareHistory(contentType?: string, limit: number = 20, offset: number = 0) {
    return apiClient.get<Share[]>('/share/history', { contentType, limit, offset });
  }

  // Get share statistics
  async getShareStats() {
    return apiClient.get<ShareStats>('/share/stats');
  }

  // Get daily share limits
  async getDailyLimits() {
    return apiClient.get<DailyShareLimits>('/share/daily-limits');
  }
}

export default new ShareApi();
