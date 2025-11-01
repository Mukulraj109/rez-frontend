// useScratchCard Hook
// Custom hook for managing scratch card functionality

import { useState, useCallback } from 'react';
import scratchCardApi, { ScratchCard, EligibilityStatus } from '@/services/scratchCardApi';

interface UseScratchCardReturn {
  scratchCards: ScratchCard[];
  eligibility: EligibilityStatus | null;
  isLoading: boolean;
  error: string | null;
  checkEligibility: () => Promise<void>;
  createScratchCard: () => Promise<ScratchCard | null>;
  scratchCard: (cardId: string) => Promise<ScratchCard | null>;
  claimPrize: (cardId: string) => Promise<any>;
  refreshScratchCards: () => Promise<void>;
}

export const useScratchCard = (): UseScratchCardReturn => {
  const [scratchCards, setScratchCards] = useState<ScratchCard[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check eligibility
  const checkEligibility = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scratchCardApi.checkEligibility();
      if (response.success && response.data) {
        setEligibility(response.data);
      } else {
        throw new Error(response.error || 'Failed to check eligibility');
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setError(err instanceof Error ? err.message : 'Failed to check eligibility');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create scratch card
  const createScratchCard = useCallback(async (): Promise<ScratchCard | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scratchCardApi.createScratchCard();
      if (response.success && response.data) {
        setScratchCards(prev => [response.data!, ...prev]);
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to create scratch card');
      }
    } catch (err) {
      console.error('Error creating scratch card:', err);
      setError(err instanceof Error ? err.message : 'Failed to create scratch card');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Scratch card
  const scratchCard = useCallback(async (cardId: string): Promise<ScratchCard | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scratchCardApi.scratchCard(cardId);
      if (response.success && response.data) {
        setScratchCards(prev => 
          prev.map(card => 
            card.id === cardId ? response.data! : card
          )
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to scratch card');
      }
    } catch (err) {
      console.error('Error scratching card:', err);
      setError(err instanceof Error ? err.message : 'Failed to scratch card');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Claim prize
  const claimPrize = useCallback(async (cardId: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scratchCardApi.claimPrize(cardId);
      if (response.success && response.data) {
        setScratchCards(prev => 
          prev.map(card => 
            card.id === cardId ? { ...card, isClaimed: true, claimedAt: response.data!.claimedAt } : card
          )
        );
        return response.data;
      } else {
        throw new Error(response.error || 'Failed to claim prize');
      }
    } catch (err) {
      console.error('Error claiming prize:', err);
      setError(err instanceof Error ? err.message : 'Failed to claim prize');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh scratch cards
  const refreshScratchCards = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await scratchCardApi.getScratchCards();
      if (response.success && response.data) {
        setScratchCards(response.data);
      } else {
        throw new Error(response.error || 'Failed to fetch scratch cards');
      }
    } catch (err) {
      console.error('Error refreshing scratch cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh scratch cards');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    scratchCards,
    eligibility,
    isLoading,
    error,
    checkEligibility,
    createScratchCard,
    scratchCard,
    claimPrize,
    refreshScratchCards,
  };
};

export default useScratchCard;
