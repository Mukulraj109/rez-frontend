/**
 * usePaymentFlow Hook
 * 
 * Manages the complete payment flow state including:
 * - Store info and membership
 * - Coin selection and auto-optimization
 * - Payment method selection
 * - Offers and savings calculations
 * - Payment processing
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import storePaymentApi from '@/services/storePaymentApi';
import externalWalletApi from '@/services/externalWalletApi';
import apiClient from '@/services/apiClient';
import {
  StorePaymentInfo,
  AppliedCoins,
  EnhancedPaymentMethod,
  StoreMembership,
  SavingsSummary,
  RewardsPreview,
  StorePaymentOffer,
  ExternalWallet,
  StorePaymentInitResponse,
} from '@/types/storePayment.types';

// ==================== TYPES ====================

interface PaymentFlowState {
  // Store info
  store: StorePaymentInfo | null;
  membership: StoreMembership | null;
  
  // Bill
  billAmount: number;
  taxesAndFees: number;
  
  // Coins
  appliedCoins: AppliedCoins;
  isAutoOptimized: boolean;
  maxCoinRedemptionPercent: number;
  
  // Offers
  selectedOffers: StorePaymentOffer[];
  discountAmount: number;
  
  // Payment
  paymentMethods: EnhancedPaymentMethod[];
  selectedPaymentMethod: EnhancedPaymentMethod | null;
  externalWallets: ExternalWallet[];
  
  // Calculations
  totalDiscount: number;
  amountToPay: number;
  savingsSummary: SavingsSummary;
  rewardsPreview: RewardsPreview;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

interface UsePaymentFlowParams {
  storeId: string;
  storeName: string;
  amount: number;
  selectedOfferIds?: string[];
}

interface UsePaymentFlowReturn extends PaymentFlowState {
  // Actions
  loadPaymentData: () => Promise<void>;
  autoOptimize: () => Promise<void>;
  toggleCoin: (coinType: 'rez' | 'promo' | 'branded', enabled: boolean) => void;
  setCoinAmount: (coinType: 'rez' | 'promo' | 'branded', amount: number) => void;
  selectPaymentMethod: (method: EnhancedPaymentMethod) => void;
  initiatePayment: () => Promise<StorePaymentInitResponse | null>;
  reset: () => void;
  clearError: () => void;
}

// ==================== DEFAULT VALUES ====================

const DEFAULT_APPLIED_COINS: AppliedCoins = {
  rezCoins: { available: 0, using: 0, enabled: true },
  promoCoins: { available: 0, using: 0, enabled: true, expiringToday: false },
  brandedCoins: null,
  totalApplied: 0,
};

const DEFAULT_SAVINGS_SUMMARY: SavingsSummary = {
  coinsUsed: 0,
  bankOffers: 0,
  loyaltyBenefit: 0,
  totalSaved: 0,
};

const DEFAULT_REWARDS_PREVIEW: RewardsPreview = {
  cashback: 0,
  coinsToEarn: 0,
};

// ==================== HOOK ====================

export function usePaymentFlow(params: UsePaymentFlowParams): UsePaymentFlowReturn {
  const { storeId, storeName, amount, selectedOfferIds = [] } = params;

  // Refs to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const selectedOfferIdsRef = useRef(selectedOfferIds);
  
  // Update ref when selectedOfferIds changes
  selectedOfferIdsRef.current = selectedOfferIds;

  // State
  const [store, setStore] = useState<StorePaymentInfo | null>(null);
  const [membership, setMembership] = useState<StoreMembership | null>(null);
  const [appliedCoins, setAppliedCoins] = useState<AppliedCoins>(DEFAULT_APPLIED_COINS);
  const [isAutoOptimized, setIsAutoOptimized] = useState(false);
  const [maxCoinRedemptionPercent, setMaxCoinRedemptionPercent] = useState(100);
  const [selectedOffers, setSelectedOffers] = useState<StorePaymentOffer[]>([]);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState<EnhancedPaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<EnhancedPaymentMethod | null>(null);
  const [externalWallets, setExternalWallets] = useState<ExternalWallet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const billAmount = amount;
  const taxesAndFees = 0; // Can be passed from params if needed

  // ==================== CALCULATIONS ====================

  const totalDiscount = useMemo(() => discountAmount, [discountAmount]);

  const amountToPay = useMemo(() => {
    const afterDiscount = billAmount - totalDiscount;
    const afterCoins = afterDiscount - appliedCoins.totalApplied;
    return Math.max(0, afterCoins);
  }, [billAmount, totalDiscount, appliedCoins.totalApplied]);

  const savingsSummary = useMemo<SavingsSummary>(() => {
    const loyaltyBenefit = membership?.benefits.cashbackBonus
      ? Math.floor((billAmount * membership.benefits.cashbackBonus) / 100)
      : 0;

    return {
      coinsUsed: appliedCoins.totalApplied,
      bankOffers: 0, // Would come from selected offers
      loyaltyBenefit,
      totalSaved: appliedCoins.totalApplied + totalDiscount + loyaltyBenefit,
    };
  }, [appliedCoins.totalApplied, totalDiscount, membership, billAmount]);

  const rewardsPreview = useMemo<RewardsPreview>(() => {
    // Base cashback from store reward rules
    const baseCashbackPercent = store?.rewardRules?.baseCashbackPercent || 5;
    const memberBonus = membership?.benefits.cashbackBonus || 0;
    const effectiveCashbackPercent = baseCashbackPercent + memberBonus;

    const cashback = Math.floor((billAmount * effectiveCashbackPercent) / 100);
    const coinsToEarn = Math.floor(billAmount / 10); // 1 coin per ₹10

    return { cashback, coinsToEarn };
  }, [billAmount, store, membership]);

  // ==================== ACTIONS ====================

  // Manual reload function (for retry scenarios)
  const loadPaymentData = useCallback(async () => {
    hasLoadedRef.current = false;
    
    try {
      setIsLoading(true);
      setError(null);

      const [
        coinsData,
        paymentMethodsData,
        membershipData,
        storeResponse,
        walletsData,
      ] = await Promise.all([
        storePaymentApi.getCoinsForStore(storeId),
        storePaymentApi.getEnhancedPaymentMethods(storeId, billAmount),
        storePaymentApi.getStoreMembership(storeId),
        apiClient.get(`/stores/${storeId}`),
        externalWalletApi.getLinkedWallets(),
      ]);

      setAppliedCoins(coinsData);
      setPaymentMethods(paymentMethodsData);
      if (paymentMethodsData.length > 0) {
        setSelectedPaymentMethod(paymentMethodsData[0]);
      }
      setMembership(membershipData);

      if (storeResponse.success && storeResponse.data) {
        setStore(storeResponse.data);
        setMaxCoinRedemptionPercent(
          storeResponse.data.paymentSettings?.maxCoinRedemptionPercent || 100
        );
      }

      setExternalWallets(walletsData);
      hasLoadedRef.current = true;
    } catch (err: any) {
      console.error('Failed to load payment data:', err);
      setError('Failed to load payment information');
    } finally {
      setIsLoading(false);
    }
  }, [storeId, billAmount]);

  const autoOptimize = useCallback(async () => {
    try {
      const optimizedCoins = await storePaymentApi.autoOptimizeCoins(storeId, billAmount);
      setAppliedCoins({
        rezCoins: optimizedCoins.rezCoins,
        promoCoins: optimizedCoins.promoCoins,
        brandedCoins: optimizedCoins.brandedCoins,
        totalApplied: optimizedCoins.totalApplied,
      });
      setIsAutoOptimized(true);
    } catch (err: any) {
      console.error('Failed to auto-optimize coins:', err);
    }
  }, [storeId, billAmount]);

  const toggleCoin = useCallback((coinType: 'rez' | 'promo' | 'branded', enabled: boolean) => {
    setAppliedCoins(prev => {
      const maxAllowed = Math.floor((billAmount * maxCoinRedemptionPercent) / 100);
      
      const newCoins = { ...prev };
      
      if (coinType === 'rez') {
        newCoins.rezCoins = {
          ...prev.rezCoins,
          enabled,
          using: enabled ? Math.min(prev.rezCoins.available, maxAllowed) : 0,
        };
      } else if (coinType === 'promo') {
        newCoins.promoCoins = {
          ...prev.promoCoins,
          enabled,
          using: enabled ? Math.min(prev.promoCoins.available, maxAllowed) : 0,
        };
      } else if (coinType === 'branded' && prev.brandedCoins) {
        newCoins.brandedCoins = {
          ...prev.brandedCoins,
          enabled,
          using: enabled ? Math.min(prev.brandedCoins.available, maxAllowed) : 0,
        };
      }

      // Recalculate total
      newCoins.totalApplied =
        newCoins.rezCoins.using +
        newCoins.promoCoins.using +
        (newCoins.brandedCoins?.using || 0);

      return newCoins;
    });
    setIsAutoOptimized(false);
  }, [billAmount, maxCoinRedemptionPercent]);

  const setCoinAmount = useCallback((coinType: 'rez' | 'promo' | 'branded', amount: number) => {
    setAppliedCoins(prev => {
      const newCoins = { ...prev };
      
      if (coinType === 'rez') {
        newCoins.rezCoins = { ...prev.rezCoins, using: Math.floor(amount) };
      } else if (coinType === 'promo') {
        newCoins.promoCoins = { ...prev.promoCoins, using: Math.floor(amount) };
      } else if (coinType === 'branded' && prev.brandedCoins) {
        newCoins.brandedCoins = { ...prev.brandedCoins, using: Math.floor(amount) };
      }

      // Recalculate total
      newCoins.totalApplied =
        newCoins.rezCoins.using +
        newCoins.promoCoins.using +
        (newCoins.brandedCoins?.using || 0);

      return newCoins;
    });
    setIsAutoOptimized(false);
  }, []);

  const selectPaymentMethod = useCallback((method: EnhancedPaymentMethod) => {
    setSelectedPaymentMethod(method);
  }, []);

  const initiatePayment = useCallback(async (): Promise<StorePaymentInitResponse | null> => {
    if (amountToPay > 0 && !selectedPaymentMethod) {
      setError('Please select a payment method');
      return null;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const response = await apiClient.post('/store-payment/initiate', {
        storeId,
        amount: billAmount,
        paymentMethod: amountToPay > 0 ? selectedPaymentMethod?.type : 'coins_only',
        coinsToRedeem: {
          rezCoins: appliedCoins.rezCoins.using,
          promoCoins: appliedCoins.promoCoins.using,
          totalAmount: appliedCoins.totalApplied,
        },
        offersApplied: selectedOfferIdsRef.current,
      });

      if (response.success && response.data) {
        return response.data;
      } else {
        setError(response.error || 'Failed to initiate payment');
        return null;
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.error || err.message || 'Payment failed. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [storeId, billAmount, amountToPay, selectedPaymentMethod, appliedCoins]);

  const reset = useCallback(() => {
    setAppliedCoins(DEFAULT_APPLIED_COINS);
    setIsAutoOptimized(false);
    setSelectedPaymentMethod(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== EFFECTS ====================

  // Load payment data only once when component mounts
  useEffect(() => {
    let isMounted = true;

    const initializePayment = async () => {
      if (!storeId || hasLoadedRef.current) return;
      
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          coinsData,
          paymentMethodsData,
          membershipData,
          storeResponse,
          walletsData,
        ] = await Promise.all([
          storePaymentApi.getCoinsForStore(storeId),
          storePaymentApi.getEnhancedPaymentMethods(storeId, billAmount),
          storePaymentApi.getStoreMembership(storeId),
          apiClient.get(`/stores/${storeId}`),
          externalWalletApi.getLinkedWallets(),
        ]);

        if (!isMounted) return;

        // Set coins
        setAppliedCoins(coinsData);

        // Set payment methods
        setPaymentMethods(paymentMethodsData);
        if (paymentMethodsData.length > 0) {
          setSelectedPaymentMethod(paymentMethodsData[0]);
        }

        // Set membership
        setMembership(membershipData);

        // Set store
        if (storeResponse.success && storeResponse.data) {
          setStore(storeResponse.data);
          setMaxCoinRedemptionPercent(
            storeResponse.data.paymentSettings?.maxCoinRedemptionPercent || 100
          );
        }

        // Set external wallets
        setExternalWallets(walletsData);

        // Calculate discount from selected offers
        const currentOfferIds = selectedOfferIdsRef.current;
        if (currentOfferIds.length > 0) {
          const offersResponse = await apiClient.get(`/store-payment/offers/${storeId}`, {
            params: { amount: billAmount },
          });

          if (isMounted && offersResponse.success && offersResponse.data) {
            const allOffers = [
              ...(offersResponse.data.storeOffers || []),
              ...(offersResponse.data.bankOffers || []),
              ...(offersResponse.data.rezOffers || []),
            ];
            const selectedOffersList = allOffers.filter((o: any) =>
              currentOfferIds.includes(o.id)
            );
            setSelectedOffers(selectedOffersList);

            const totalDiscount = selectedOffersList.reduce((sum: number, offer: any) => {
              if (offer.valueType === 'PERCENTAGE') {
                const discount = (billAmount * offer.value) / 100;
                return sum + (offer.maxDiscount ? Math.min(discount, offer.maxDiscount) : discount);
              }
              return sum + offer.value;
            }, 0);

            setDiscountAmount(totalDiscount);
          }
        }

        hasLoadedRef.current = true;
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load payment data:', err);
          setError('Failed to load payment information');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializePayment();

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // ==================== RETURN ====================

  return {
    // State
    store,
    membership,
    billAmount,
    taxesAndFees,
    appliedCoins,
    isAutoOptimized,
    maxCoinRedemptionPercent,
    selectedOffers,
    discountAmount,
    paymentMethods,
    selectedPaymentMethod,
    externalWallets,
    totalDiscount,
    amountToPay,
    savingsSummary,
    rewardsPreview,
    isLoading,
    isProcessing,
    error,
    
    // Actions
    loadPaymentData,
    autoOptimize,
    toggleCoin,
    setCoinAmount,
    selectPaymentMethod,
    initiatePayment,
    reset,
    clearError,
  };
}

export default usePaymentFlow;
