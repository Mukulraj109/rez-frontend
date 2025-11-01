// ScratchCard API Service
// API service for scratch card functionality

import apiClient, { ApiResponse } from './apiClient';

export interface ScratchCardPrize {
  id: string;
  type: 'discount' | 'cashback' | 'coin' | 'voucher';
  value: number;
  title: string;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

export interface ScratchCard {
  id: string;
  prize: ScratchCardPrize;
  isScratched: boolean;
  isClaimed: boolean;
  claimedAt?: string;
  expiresAt: string;
  createdAt: string;
}

export interface EligibilityStatus {
  isEligible: boolean;
  completionPercentage: number;
  requiredPercentage: number;
  message: string;
}

export interface ClaimResult {
  type: string;
  value: number;
  message: string;
}

class ScratchCardApiService {
  private baseUrl = '/scratch-cards';

  /**
   * Check if user is eligible for scratch card
   */
  async checkEligibility(): Promise<ApiResponse<EligibilityStatus>> {
    try {
      return await apiClient.get(`${this.baseUrl}/eligibility`);
    } catch (error) {
      console.error('❌ [SCRATCH CARD API] Check eligibility failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check eligibility',
        data: undefined,
      };
    }
  }

  /**
   * Get user's scratch cards
   */
  async getScratchCards(): Promise<ApiResponse<ScratchCard[]>> {
    try {
      return await apiClient.get(this.baseUrl);
    } catch (error) {
      console.error('❌ [SCRATCH CARD API] Get scratch cards failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch scratch cards',
        data: undefined,
      };
    }
  }

  /**
   * Create a new scratch card
   */
  async createScratchCard(): Promise<ApiResponse<ScratchCard>> {
    try {
      return await apiClient.post(this.baseUrl);
    } catch (error) {
      console.error('❌ [SCRATCH CARD API] Create scratch card failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create scratch card',
        data: undefined,
      };
    }
  }

  /**
   * Scratch a card to reveal prize
   */
  async scratchCard(cardId: string): Promise<ApiResponse<ScratchCard>> {
    try {
      return await apiClient.post(`${this.baseUrl}/${cardId}/scratch`);
    } catch (error) {
      console.error('❌ [SCRATCH CARD API] Scratch card failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scratch card',
        data: undefined,
      };
    }
  }

  /**
   * Claim prize from scratch card
   */
  async claimPrize(cardId: string): Promise<ApiResponse<{
    prize: ScratchCardPrize;
    claimResult: ClaimResult;
    claimedAt: string;
  }>> {
    try {
      return await apiClient.post(`${this.baseUrl}/${cardId}/claim`);
    } catch (error) {
      console.error('❌ [SCRATCH CARD API] Claim prize failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to claim prize',
        data: undefined,
      };
    }
  }
}

export default new ScratchCardApiService();
