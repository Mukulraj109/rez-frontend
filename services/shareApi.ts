// Share API Service
// Handles sharing purchases and awarding 5% coins

import { apiClient } from './apiClient';

export interface SharePurchaseRequest {
  orderId: string;
  platform: 'whatsapp' | 'facebook' | 'twitter' | 'instagram' | 'other';
}

export interface SharePurchaseResponse {
  success: boolean;
  message?: string;
  data?: {
    shareId: string;
    coinsEarned: number;
    orderTotal: number;
    shareUrl: string;
  };
  error?: string;
}

export interface CanShareOrderResponse {
  success: boolean;
  data?: {
    canShare: boolean;
    reason?: string;
    orderTotal?: number;
    potentialCoins?: number;
  };
  error?: string;
}

class ShareApiService {
  /**
   * Share a purchase and earn 5% coins
   * @param orderId - The order ID to share
   * @param platform - The platform being shared to
   */
  async sharePurchase(orderId: string, platform: SharePurchaseRequest['platform']): Promise<SharePurchaseResponse> {
    try {
      console.log('[SHARE API] Sharing purchase:', orderId, 'on', platform);

      const response = await apiClient.post<SharePurchaseResponse['data']>(
        '/shares/purchase',
        { orderId, platform }
      );

      if (response.success && response.data) {
        console.log('[SHARE API] Share successful, coins earned:', response.data.coinsEarned);
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.message || 'Failed to share purchase',
      };
    } catch (error: any) {
      console.error('[SHARE API] Share purchase error:', error);
      return {
        success: false,
        error: error.message || 'Failed to share purchase',
      };
    }
  }

  /**
   * Check if an order can be shared (not already shared)
   * @param orderId - The order ID to check
   */
  async canShareOrder(orderId: string): Promise<CanShareOrderResponse> {
    try {
      console.log('[SHARE API] Checking if order can be shared:', orderId);

      const response = await apiClient.get<CanShareOrderResponse['data']>(
        `/shares/can-share/${orderId}`
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      }

      return {
        success: false,
        error: response.message || 'Failed to check share eligibility',
      };
    } catch (error: any) {
      console.error('[SHARE API] Can share order error:', error);
      return {
        success: false,
        error: error.message || 'Failed to check share eligibility',
      };
    }
  }
}

export const shareApi = new ShareApiService();
export default shareApi;
