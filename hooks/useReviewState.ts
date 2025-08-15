import { useState, useCallback } from 'react';

export interface ReviewData {
  id?: string;
  productId: string;
  userId: string;
  rating: number;
  text: string;
  cashbackEarned: number;
  createdAt: Date;
}

export interface CashbackEarning {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  amount: number;
  productId: string;
  createdAt: Date;
}

export const useReviewState = () => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateReview = useCallback((): boolean => {
    if (!reviewText.trim()) {
      setError('Please write a review before submitting.');
      return false;
    }
    if (reviewText.trim().length < 10) {
      setError('Review must be at least 10 characters long.');
      return false;
    }
    if (rating < 1) {
      setError('Please provide a star rating.');
      return false;
    }
    setError(null);
    return true;
  }, [reviewText, rating]);

  const submitReview = useCallback(async (
    productId: string,
    onSuccess?: (cashbackAmount: number) => void,
    onError?: (error: string) => void
  ): Promise<void> => {
    if (!validateReview()) {
      onError?.(error || 'Validation failed');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Mock successful response
      const mockCashbackAmount = 219.90; // 10% of ₹2,199
      
      // Reset form
      setReviewText('');
      setRating(0);
      
      onSuccess?.(mockCashbackAmount);
    } catch (err) {
      const errorMessage = 'Failed to submit review. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [validateReview, error]);

  const resetForm = useCallback(() => {
    setReviewText('');
    setRating(0);
    setError(null);
    setIsSubmitting(false);
  }, []);

  return {
    reviewText,
    setReviewText,
    rating,
    setRating,
    isSubmitting,
    error,
    validateReview,
    submitReview,
    resetForm,
  };
};