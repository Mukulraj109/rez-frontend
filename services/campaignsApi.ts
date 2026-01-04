/**
 * Campaigns API Service
 * Handles campaigns for homepage exciting deals section
 */

import apiClient, { ApiResponse } from './apiClient';

// Campaign Deal interface
export interface CampaignDeal {
  store?: string;
  storeId?: string;
  image: string;
  cashback?: string;
  coins?: string;
  bonus?: string;
  drop?: string;
  discount?: string;
  endsIn?: string;
}

// Campaign interface
export interface Campaign {
  _id: string;
  campaignId: string;
  title: string;
  subtitle: string;
  description?: string;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  gradientColors: string[];
  type: 'cashback' | 'coins' | 'bank' | 'bill' | 'drop' | 'new-user' | 'flash' | 'general';
  deals: CampaignDeal[];
  startTime: string;
  endTime: string;
  isActive: boolean;
  priority: number;
  isRunning?: boolean;
}

// Deal Category interface (for ExcitingDealsSection)
export interface DealCategory {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradientColors: string[];
  badgeBg?: string;
  badgeColor?: string;
  deals: CampaignDeal[];
}

class CampaignsService {
  /**
   * Get active campaigns
   */
  async getActiveCampaigns(params?: {
    type?: string;
    limit?: number;
  }): Promise<ApiResponse<{
    campaigns: Campaign[];
    total: number;
  }>> {
    try {
      console.log('📢 [CAMPAIGNS API] Fetching active campaigns...');

      const response = await apiClient.get<{
        campaigns: Campaign[];
        total: number;
      }>('/campaigns/active', {
        ...(params?.type && { type: params.type }),
        limit: params?.limit || 10,
      });

      if (response.success && response.data) {
        console.log(`✅ [CAMPAIGNS API] Got ${response.data.campaigns?.length || 0} active campaigns`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [CAMPAIGNS API] Error fetching active campaigns:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch campaigns',
        message: error?.message || 'Failed to fetch campaigns',
      };
    }
  }

  /**
   * Get exciting deals for homepage section
   */
  async getExcitingDeals(limit: number = 6): Promise<ApiResponse<{
    dealCategories: DealCategory[];
    total: number;
  }>> {
    try {
      console.log('📢 [CAMPAIGNS API] Fetching exciting deals...');

      const response = await apiClient.get<{
        dealCategories: DealCategory[];
        total: number;
      }>('/campaigns/exciting-deals', { limit });

      if (response.success && response.data) {
        console.log(`✅ [CAMPAIGNS API] Got ${response.data.dealCategories?.length || 0} deal categories`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [CAMPAIGNS API] Error fetching exciting deals:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch exciting deals',
        message: error?.message || 'Failed to fetch exciting deals',
      };
    }
  }

  /**
   * Get campaigns by type
   */
  async getCampaignsByType(type: string, limit: number = 10): Promise<ApiResponse<{
    campaigns: Campaign[];
    total: number;
  }>> {
    try {
      console.log(`📢 [CAMPAIGNS API] Fetching ${type} campaigns...`);

      const response = await apiClient.get<{
        campaigns: Campaign[];
        total: number;
      }>(`/campaigns/type/${type}`, { limit });

      if (response.success && response.data) {
        console.log(`✅ [CAMPAIGNS API] Got ${response.data.campaigns?.length || 0} ${type} campaigns`);
      }

      return response;
    } catch (error: any) {
      console.error(`❌ [CAMPAIGNS API] Error fetching ${type} campaigns:`, error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch campaigns',
        message: error?.message || 'Failed to fetch campaigns',
      };
    }
  }

  /**
   * Get single campaign by ID or slug
   */
  async getCampaignById(campaignId: string): Promise<ApiResponse<Campaign>> {
    try {
      console.log(`📢 [CAMPAIGNS API] Fetching campaign: ${campaignId}...`);

      const response = await apiClient.get<Campaign>(`/campaigns/${campaignId}`);

      if (response.success && response.data) {
        console.log(`✅ [CAMPAIGNS API] Got campaign: ${response.data.title}`);
      }

      return response;
    } catch (error: any) {
      console.error('❌ [CAMPAIGNS API] Error fetching campaign:', error);
      return {
        success: false,
        error: error?.message || 'Failed to fetch campaign',
        message: error?.message || 'Failed to fetch campaign',
      };
    }
  }
}

// Create singleton instance
const campaignsService = new CampaignsService();

// Named export for compatibility
export { campaignsService as campaignsApi };

export default campaignsService;
