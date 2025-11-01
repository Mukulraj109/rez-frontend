import { useState, useEffect, useCallback } from 'react';
import { router } from 'expo-router';
import {
  CheckoutPageState,
  CheckoutItem,
  PromoCode,
  PaymentMethod,
  BillSummary,
  CoinSystem,
  UseCheckoutReturn,
} from '@/types/checkout.types';
import { CheckoutData } from '@/data/checkoutData';
import cartService from '@/services/cartApi';
import ordersService from '@/services/ordersApi';
import walletApi from '@/services/walletApi';
import couponService from '@/services/couponApi';
import paybillApi from '@/services/paybillApi';
import { storePromoCoinApi } from '@/services/storePromoCoinApi';
import { createRazorpayPayment } from '@/services/razorpayApi';
import { mapBackendCartToFrontend, mapFrontendCheckoutToBackendOrder } from '@/utils/dataMappers';
import { showToast } from '@/components/common/ToastManager';

export const useCheckout = (): UseCheckoutReturn => {
  const [state, setState] = useState<CheckoutPageState>(CheckoutData.initialState);
  const [paybillBalance, setPaybillBalance] = useState<number>(0);

  // Initialize checkout data
  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {

      // Try to load from cart API first
      try {
        const cartResponse = await cartService.getCart();

        if (cartResponse.success && cartResponse.data) {

          const mappedCart = mapBackendCartToFrontend(cartResponse.data);

          // Convert cart items to checkout items format
          const checkoutItems: CheckoutItem[] = mappedCart.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            category: item.category || '',
            storeId: item.store?.id || '',
            storeName: item.store?.name || '',
          }));

          // Get bill summary from cart totals - Map to correct BillSummary structure
          const itemTotal = mappedCart.totals.subtotal || 0;
          const getAndItemTotal = Math.round(itemTotal * 0.05); // 5% get & item charge
          const deliveryFee = mappedCart.totals.delivery || mappedCart.totals.shipping || 0;
          const platformFee = 2; // Fixed platform fee
          const taxes = mappedCart.totals.tax || 0;
          const promoDiscount = mappedCart.totals.discount || 0;
          const coinDiscount = 0; // Will be calculated when coins are toggled
          
          // Calculate total payable (if backend returns 0, calculate it ourselves)
          let totalPayable = mappedCart.totals.total || 0;
          if (totalPayable === 0 && itemTotal > 0) {
            // Recalculate if backend returned 0
            totalPayable = itemTotal + getAndItemTotal + deliveryFee + platformFee + taxes - promoDiscount - coinDiscount;
          }
          
          // Calculate round off to nearest rupee
          const roundOff = Math.round(totalPayable) - totalPayable;
          totalPayable = Math.max(0, Math.round(totalPayable));
          
          const billSummary: BillSummary = {
            itemTotal,
            getAndItemTotal,
            deliveryFee,
            platformFee,
            taxes,
            promoDiscount,
            coinDiscount,
            roundOff,
            totalPayable,
            cashbackEarned: Math.round((mappedCart.totals.cashback || 0)),
            savings: mappedCart.totals.savings || mappedCart.totals.discount || 0,
          };

          // Get promo code from cart
          const appliedPromoCode: PromoCode | undefined = mappedCart.coupon ? {
            id: mappedCart.coupon.code, // Using code as id since we don't have the actual id
            code: mappedCart.coupon.code,
            title: mappedCart.coupon.code,
            description: `${mappedCart.coupon.discountValue}% off`,
            discountType: mappedCart.coupon.discountType || 'PERCENTAGE',
            discountValue: mappedCart.coupon.discountValue,
            maxDiscount: mappedCart.coupon.appliedAmount,
            minOrderValue: 0,
            validUntil: '',
            isActive: true,
            termsAndConditions: [],
          } : undefined;

          // NEW: Fetch real wallet data
          let realCoinSystem: CoinSystem = {
            wasilCoin: { 
              available: 0, 
              used: 0, 
              conversionRate: 1, 
              maxUsagePercentage: 100 
            },
            promoCoin: { 
              available: 0, 
              used: 0, 
              conversionRate: 1, 
              maxUsagePercentage: 20 
            },
            storePromoCoin: {
              available: 0,
              used: 0,
              conversionRate: 1,
              maxUsagePercentage: 30 // Store promo coins limited to 30% of order value
            }
          };

          try {

            const walletResponse = await walletApi.getBalance();

            if (walletResponse.success && walletResponse.data) {
              const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
              const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

              realCoinSystem = {
                ...realCoinSystem,
                wasilCoin: {
                  available: wasilCoin?.amount || 0,
                  used: 0,
                  conversionRate: 1,
                  maxUsagePercentage: 100 // REZ coins can be used up to 100% of order value
                },
                promoCoin: {
                  available: promoCoin?.amount || 0,
                  used: 0,
                  conversionRate: 1,
                  maxUsagePercentage: 20 // Promo coins limited to 20% of order value
                }
              };

            }
          } catch (walletError) {
            console.error('💳 [Checkout] Failed to load wallet, using 0 balance:', walletError);
          }
          
          // Fetch store promo coins for this store
          try {
            const storeId = checkoutItems[0]?.storeId;
            if (storeId) {

              const storeCoinsResponse = await storePromoCoinApi.getStorePromoCoins(storeId);
              
              if (storeCoinsResponse.success && storeCoinsResponse.data) {
                realCoinSystem.storePromoCoin = {
                  available: storeCoinsResponse.data.availableCoins || 0,
                  used: 0,
                  conversionRate: 1,
                  maxUsagePercentage: 30,
                  storeId: storeId
                };

              }
            } else {
              console.warn('⚠️ [Checkout] No store ID found, cannot fetch store promo coins');
            }
          } catch (storeCoinsError) {
            console.error('💎 [Checkout] Failed to load store promo coins:', storeCoinsError);
          }

          // Fetch PayBill balance
          try {

            const paybillResponse = await paybillApi.getBalance();

            if (paybillResponse.success && paybillResponse.data) {
              setPaybillBalance(paybillResponse.data.paybillBalance || 0);

            }
          } catch (paybillError) {
            console.error('🎟️ [Checkout] Failed to load PayBill balance:', paybillError);
            setPaybillBalance(0);
          }

          // Fetch real coupons from API - GET ALL AVAILABLE COUPONS, not just user's claimed ones
          let realAvailableCoupons: PromoCode[] = [];
          try {

            const couponsResponse = await couponService.getAvailableCoupons();

            if (couponsResponse.success && couponsResponse.data) {
              realAvailableCoupons = couponsResponse.data.coupons.map((coupon: any) => ({
                id: coupon._id,
                code: coupon.couponCode,
                title: coupon.title || coupon.couponCode,
                description: coupon.description || `Get discount on your order`,
                discountValue: coupon.discountValue,
                discountType: coupon.discountType,
                minOrderValue: coupon.minOrderValue,
                maxDiscount: coupon.maxDiscountCap || 0,
                isActive: coupon.status === 'active',
                validUntil: coupon.validTo,
                termsAndConditions: coupon.termsAndConditions || [],
              }));

            }
          } catch (couponError) {
            console.error('💳 [Checkout] Failed to load coupons:', couponError);
          }

          // Use mock data for payment methods only
          const mockData = await CheckoutData.api.initializeCheckout();

          setState(prev => ({
            ...prev,
            items: checkoutItems,
            store: mockData.store, // Use mock store for now
            billSummary,
            appliedPromoCode,
            availablePromoCodes: realAvailableCoupons, // Always use real coupons from database
            coinSystem: realCoinSystem, // NEW: Use real wallet data
            availablePaymentMethods: mockData.paymentMethods,
            recentPaymentMethods: mockData.paymentMethods.filter(m => m.isRecent),
            loading: false,
          }));
          return;
        }
      } catch (apiError) {

      }

      // Fallback to mock data + real wallet
      let realCoinSystem: CoinSystem = {
        wasilCoin: { 
          available: 0, 
          used: 0, 
          conversionRate: 1, 
          maxUsagePercentage: 100 
        },
        promoCoin: { 
          available: 0, 
          used: 0, 
          conversionRate: 1, 
          maxUsagePercentage: 20 
        },
        storePromoCoin: {
          available: 0,
          used: 0,
          conversionRate: 1,
          maxUsagePercentage: 30
        }
      };

      try {
        console.log('💳 [Checkout] Loading wallet balance (fallback)...');
        const walletResponse = await walletApi.getBalance();

        if (walletResponse.success && walletResponse.data) {
          const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
          const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

          realCoinSystem = {
            ...realCoinSystem,
            wasilCoin: {
              available: wasilCoin?.amount || 0,
              used: 0,
              conversionRate: 1,
              maxUsagePercentage: 100
            },
            promoCoin: {
              available: promoCoin?.amount || 0,
              used: 0,
              conversionRate: 1,
              maxUsagePercentage: 20
            }
          };

          console.log('💳 [Checkout] Loaded wallet coins:', {
            wasil: realCoinSystem.wasilCoin.available,
            promo: realCoinSystem.promoCoin.available
          });
        }
      } catch (walletError) {
        console.error('💳 [Checkout] Failed to load wallet (fallback), using 0 balance:', walletError);
      }
      
      // Fetch store promo coins for this store (fallback)
      try {
        // For fallback, we might not have checkoutStore, but we can try from state or mock data
        console.log('💎 [Checkout] Skipping store promo coins in fallback mode');
        // Note: In fallback mode, store ID might not be available yet
      } catch (storeCoinsError) {
        console.error('💎 [Checkout] Failed to load store promo coins (fallback):', storeCoinsError);
      }

      // Fetch PayBill balance (fallback)
      try {
        console.log('🎟️ [Checkout] Loading PayBill balance (fallback)...');
        const paybillResponse = await paybillApi.getBalance();

        if (paybillResponse.success && paybillResponse.data) {
          setPaybillBalance(paybillResponse.data.paybillBalance || 0);
          console.log('🎟️ [Checkout] PayBill balance:', paybillResponse.data.paybillBalance);
        }
      } catch (paybillError) {
        console.error('🎟️ [Checkout] Failed to load PayBill balance (fallback):', paybillError);
        setPaybillBalance(0);
      }

      // Fetch real coupons from API (fallback) - GET ALL AVAILABLE COUPONS
      let realAvailableCoupons: PromoCode[] = [];
      try {
        console.log('💳 [Checkout] Loading available coupons (fallback)...');
        const couponsResponse = await couponService.getAvailableCoupons();

        if (couponsResponse.success && couponsResponse.data) {
          realAvailableCoupons = couponsResponse.data.coupons.map((coupon: any) => ({
            id: coupon._id,
            code: coupon.couponCode,
            title: coupon.title || coupon.couponCode,
            description: coupon.description || `Get discount on your order`,
            discountValue: coupon.discountValue,
            discountType: coupon.discountType,
            minOrderValue: coupon.minOrderValue,
            maxDiscount: coupon.maxDiscountCap || 0,
            isActive: coupon.status === 'active',
            validUntil: coupon.validTo,
            termsAndConditions: coupon.termsAndConditions || [],
          }));
          console.log('💳 [Checkout] Loaded coupons (fallback)');
        }
      } catch (couponError) {
        console.error('💳 [Checkout] Failed to load coupons (fallback):', couponError);
      }

      const data = await CheckoutData.api.initializeCheckout();
      setState(prev => ({
        ...prev,
        items: data.items,
        store: data.store,
        billSummary: data.billSummary,
        availablePromoCodes: realAvailableCoupons, // Always use real coupons from database
        coinSystem: realCoinSystem, // NEW: Use real wallet data
        availablePaymentMethods: data.paymentMethods,
        recentPaymentMethods: data.paymentMethods.filter(m => m.isRecent),
        loading: false,
      }));
    } catch (error) {
      console.error('💳 [Checkout] Failed to initialize:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to initialize checkout',
      }));
    }
  }, []);

  const updateBillSummary = useCallback(() => {
    const coinUsage = {
      wasil: state.coinSystem.wasilCoin.used,
      promo: state.coinSystem.promoCoin.used,
    };
    
    const newBillSummary = CheckoutData.helpers.calculateBillSummary(
      state.items,
      state.store,
      state.appliedPromoCode,
      coinUsage
    );
    
    setState(prev => ({ ...prev, billSummary: newBillSummary }));
  }, [state.items, state.store, state.appliedPromoCode, state.coinSystem]);

  const applyPromoCode = useCallback(async (code: PromoCode) => {
    setState(prev => ({ ...prev, loading: true }));

    try {

      // Prepare cart data for validation
      const cartData = {
        items: state.items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          price: item.price,
          category: item.category,
          store: item.storeId,
        })),
        subtotal: state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
      };

      const response = await couponService.validateCoupon(code.code, cartData);

      if (response.success && response.data) {

        // Calculate new bill summary with coupon discount
        const itemTotal = cartData.subtotal;
        const coinUsage = {
          wasil: state.coinSystem.wasilCoin.used,
          promo: state.coinSystem.promoCoin.used,
        };

        const newBillSummary = CheckoutData.helpers.calculateBillSummary(
          state.items,
          state.store,
          code,
          coinUsage
        );

        // Override promo discount with actual backend value and recalculate totalPayable
        newBillSummary.promoDiscount = response.data.discount;
        newBillSummary.savings = (newBillSummary.savings || 0) + response.data.discount;
        
        // Recalculate totalPayable with promo discount
        const subtotal = newBillSummary.itemTotal + newBillSummary.getAndItemTotal;
        const totalBeforeDiscount = subtotal + newBillSummary.platformFee + newBillSummary.deliveryFee + newBillSummary.taxes;
        const totalAfterDiscount = totalBeforeDiscount - response.data.discount - coinUsage.wasil - coinUsage.promo;
        newBillSummary.totalPayable = Math.max(0, Math.round(totalAfterDiscount));

        setState(prev => ({
          ...prev,
          appliedPromoCode: code,
          billSummary: newBillSummary,
          loading: false,
          showPromoCodeSection: false,
          error: null,
        }));
      } else {
        console.error('💳 [Checkout] Coupon invalid:', response.message);
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.message || 'Invalid coupon code',
        }));
      }
    } catch (error) {
      console.error('💳 [Checkout] Coupon validation error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to validate coupon',
      }));
    }
  }, [state.items, state.store, state.coinSystem]);

  const removePromoCode = useCallback(() => {
    setState(prev => {
      const coinUsage = {
        wasil: prev.coinSystem.wasilCoin.used,
        promo: prev.coinSystem.promoCoin.used,
      };
      
      const newBillSummary = CheckoutData.helpers.calculateBillSummary(
        prev.items,
        prev.store,
        undefined,
        coinUsage
      );
      
      return {
        ...prev,
        appliedPromoCode: undefined,
        billSummary: newBillSummary,
        error: null, // Clear any existing errors
      };
    });
  }, []);

  const toggleWasilCoin = useCallback((enabled: boolean) => {
    setState(prev => {
      // Check if user has any coins
      if (enabled && prev.coinSystem.wasilCoin.available === 0) {

        // Don't toggle if no coins
        return prev;
      }

      // Calculate subtotal before coin discounts with safety checks
      const itemTotal = prev.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
      
      const getAndItemTotal = Math.round(itemTotal * 0.05) || 0;
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05) || 0;
      const deliveryFee = Number(prev.store.deliveryFee) || 0;
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'FIXED'
          ? Number(prev.appliedPromoCode.discountValue) || 0
          : Math.min(Math.round((itemTotal * (Number(prev.appliedPromoCode.discountValue) || 0)) / 100), Number(prev.appliedPromoCode.maxDiscount) || Infinity)
      ) : 0;

      const subtotalBeforeCoins = Math.max(0, itemTotal + getAndItemTotal + deliveryFee + platformFee + taxes - promoDiscount);

      // REZ coins have 1:1 conversion (1 coin = 1 rupee) and can be used up to available amount
      const coinsToUse = enabled ? Math.min(Number(prev.coinSystem.wasilCoin.available) || 0, subtotalBeforeCoins) : 0;

      const newCoinSystem = {
        ...prev.coinSystem,
        wasilCoin: {
          ...prev.coinSystem.wasilCoin,
          used: coinsToUse,
        },
      };
      
      const coinUsage = {
        wasil: coinsToUse,
        promo: prev.coinSystem.promoCoin.used,
      };
      
      const newBillSummary = CheckoutData.helpers.calculateBillSummary(
        prev.items,
        prev.store,
        prev.appliedPromoCode,
        coinUsage
      );
      
      return {
        ...prev,
        coinSystem: newCoinSystem,
        billSummary: newBillSummary,
      };
    });
  }, []);

  const togglePromoCoin = useCallback((enabled: boolean) => {
    setState(prev => {
      // Check if user has any promo coins
      if (enabled && prev.coinSystem.promoCoin.available === 0) {

        // Don't toggle if no coins
        return prev;
      }

      // Calculate subtotal before coin discounts
      const itemTotal = prev.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const getAndItemTotal = Math.round(itemTotal * 0.05);
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05);
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'FIXED'
          ? prev.appliedPromoCode.discountValue
          : Math.min(Math.round((itemTotal * prev.appliedPromoCode.discountValue) / 100), prev.appliedPromoCode.maxDiscount || Infinity)
      ) : 0;

      const subtotalAfterREZCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount - prev.coinSystem.wasilCoin.used;

      // Promo coins have 1:1 conversion and can be used up to 20% of remaining amount or available coins
      const maxPromoUsage = Math.floor(subtotalAfterREZCoins * prev.coinSystem.promoCoin.maxUsagePercentage / 100);
      const coinsToUse = enabled ? Math.min(prev.coinSystem.promoCoin.available, maxPromoUsage, subtotalAfterREZCoins) : 0;

      const newCoinSystem = {
        ...prev.coinSystem,
        promoCoin: {
          ...prev.coinSystem.promoCoin,
          used: coinsToUse,
        },
      };
      
      const coinUsage = {
        wasil: prev.coinSystem.wasilCoin.used,
        promo: coinsToUse,
      };
      
      const newBillSummary = CheckoutData.helpers.calculateBillSummary(
        prev.items,
        prev.store,
        prev.appliedPromoCode,
        coinUsage
      );
      
      return {
        ...prev,
        coinSystem: newCoinSystem,
        billSummary: newBillSummary,
      };
    });
  }, []);

  const toggleStorePromoCoin = useCallback((enabled: boolean) => {
    setState(prev => {
      // Check if user has any store promo coins
      if (enabled && prev.coinSystem.storePromoCoin.available === 0) {

        return prev;
      }

      // Calculate subtotal before coin discounts
      const itemTotal = prev.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const getAndItemTotal = Math.round(itemTotal * 0.05);
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05);
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'FIXED'
          ? prev.appliedPromoCode.discountValue
          : Math.min(Math.round((itemTotal * prev.appliedPromoCode.discountValue) / 100), prev.appliedPromoCode.maxDiscount || Infinity)
      ) : 0;

      // Calculate remaining after other coins (REZ and regular promo)
      const subtotalAfterOtherCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount - prev.coinSystem.wasilCoin.used - prev.coinSystem.promoCoin.used;

      // Store promo coins can be used up to 30% of remaining amount or available coins
      const maxStorePromoUsage = Math.floor(subtotalAfterOtherCoins * prev.coinSystem.storePromoCoin.maxUsagePercentage / 100);
      const coinsToUse = enabled ? Math.min(prev.coinSystem.storePromoCoin.available, maxStorePromoUsage, subtotalAfterOtherCoins) : 0;

      const newCoinSystem = {
        ...prev.coinSystem,
        storePromoCoin: {
          ...prev.coinSystem.storePromoCoin,
          used: coinsToUse,
        },
      };
      
      const coinUsage = {
        wasil: prev.coinSystem.wasilCoin.used,
        promo: prev.coinSystem.promoCoin.used,
        storePromo: coinsToUse,
      };
      
      const newBillSummary = CheckoutData.helpers.calculateBillSummary(
        prev.items,
        prev.store,
        prev.appliedPromoCode,
        coinUsage
      );
      
      return {
        ...prev,
        coinSystem: newCoinSystem,
        billSummary: newBillSummary,
      };
    });
  }, []);

  const handleCustomCoinAmount = useCallback((coinType: 'wasil' | 'promo' | 'storePromo', amount: number) => {
    setState(prev => {

      const coinSystem = prev.coinSystem;
      const isWasil = coinType === 'wasil';
      const isStorePromo = coinType === 'storePromo';
      const coin = isWasil ? coinSystem.wasilCoin : (isStorePromo ? coinSystem.storePromoCoin : coinSystem.promoCoin);
      
      // Validate amount
      if (amount <= 0 || amount > coin.available) {
        console.log('💳 [Checkout] Invalid coin amount');
        return prev;
      }
      
      // Calculate maximum allowed for order with safety checks
      const itemTotal = prev.items.reduce((total, item) => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;
        return total + (price * quantity);
      }, 0);
      
      const getAndItemTotal = Math.round(itemTotal * 0.05) || 0;
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05) || 0;
      const deliveryFee = Number(prev.store.deliveryFee) || 0;
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'FIXED'
          ? Number(prev.appliedPromoCode.discountValue) || 0
          : Math.min(Math.round((itemTotal * (Number(prev.appliedPromoCode.discountValue) || 0)) / 100), Number(prev.appliedPromoCode.maxDiscount) || Infinity)
      ) : 0;
      
      let maxAllowed = Math.max(0, itemTotal + getAndItemTotal + deliveryFee + platformFee + taxes - promoDiscount);
      
      if (!isWasil) {
        // For promo/store promo coins, subtract wasil coins already used
        maxAllowed -= coinSystem.wasilCoin.used;
        
        if (isStorePromo) {
          // Store promo coins: also subtract regular promo coins and apply 30% limit
          maxAllowed -= coinSystem.promoCoin.used;
        }
        
        // Apply percentage limit
        maxAllowed = Math.floor(maxAllowed * coin.maxUsagePercentage / 100);
      }
      
      // Ensure amount doesn't exceed order total
      const finalAmount = Math.min(amount, maxAllowed, coin.available);

      const newCoinSystem = {
        ...coinSystem,
        [isWasil ? 'wasilCoin' : (isStorePromo ? 'storePromoCoin' : 'promoCoin')]: {
          ...coin,
          used: finalAmount,
        },
      };
      
      const coinUsage = {
        wasil: isWasil ? finalAmount : coinSystem.wasilCoin.used,
        promo: (isWasil || isStorePromo) ? coinSystem.promoCoin.used : finalAmount,
        storePromo: isStorePromo ? finalAmount : (coinSystem.storePromoCoin?.used || 0),
      };
      
      const newBillSummary = CheckoutData.helpers.calculateBillSummary(
        prev.items,
        prev.store,
        prev.appliedPromoCode,
        coinUsage
      );
      
      // Ensure promo discount is preserved and totalPayable is recalculated correctly
      if (prev.appliedPromoCode && newBillSummary.promoDiscount > 0) {

      }
      
      return {
        ...prev,
        coinSystem: newCoinSystem,
        billSummary: newBillSummary,
      };
    });
  }, []);

  const selectPaymentMethod = useCallback((method: PaymentMethod) => {
    setState(prev => ({ ...prev, selectedPaymentMethod: method }));
  }, []);

  const proceedToPayment = useCallback(async () => {
    setState(prev => ({ ...prev, currentStep: 'payment_methods' }));
    router.push('/payment-methods');
  }, []);

  const navigateToOtherPaymentMethods = useCallback(() => {
    setState(prev => ({ ...prev, currentStep: 'payment_methods' }));
    router.push('/payment-methods');
  }, []);

  const processPayment = useCallback(async () => {
    if (!state.selectedPaymentMethod) {
      setState(prev => ({ ...prev, error: 'Please select a payment method' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, currentStep: 'processing' }));

    try {

      // Map frontend checkout data to backend order format
      const orderData = mapFrontendCheckoutToBackendOrder({
        deliveryAddress: { name: 'Customer', phone: '0000000000', addressLine1: state.store.name, city: 'City', state: 'State', pincode: '000000' },
        paymentMethod: state.selectedPaymentMethod.id as any,
        specialInstructions: '',
        couponCode: state.appliedPromoCode?.code,
      });

      // Create order via API
      const response = await ordersService.createOrder(orderData);

      if (response.success && response.data) {

        // Clear cart after successful order
        try {
          await cartService.clearCart();

        } catch (clearError) {
          console.error('💳 [Checkout] Failed to clear cart:', clearError);
        }

        setState(prev => ({ ...prev, currentStep: 'success', loading: false }));
        router.push(`/payment-success?orderId=${response.data.id || response.data._id}`);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Order creation failed',
          currentStep: 'payment_methods',
        }));
      }
    } catch (error) {
      console.error('💳 [Checkout] Order creation failed:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
        currentStep: 'payment_methods',
      }));
    }
  }, [state.selectedPaymentMethod, state.billSummary, state.items, state.store, state.appliedPromoCode]);

  /**
   * Handle wallet payment
   * Process payment using wallet coins and create order
   */
  const handleWalletPayment = useCallback(async () => {

    const totalPayable = state.billSummary.totalPayable;

    // Calculate total available balance
    const totalAvailableBalance = state.coinSystem.wasilCoin.available + state.coinSystem.promoCoin.available;

    // Calculate coins that will be used (use toggled amounts, or calculate if not toggled)
    const wasilCoinsUsed = state.coinSystem.wasilCoin.used > 0
      ? state.coinSystem.wasilCoin.used
      : Math.min(state.coinSystem.wasilCoin.available, totalPayable);

    const remainingAfterWasil = Math.max(0, totalPayable - wasilCoinsUsed);
    const promoCoinsUsed = state.coinSystem.promoCoin.used > 0
      ? state.coinSystem.promoCoin.used
      : Math.min(state.coinSystem.promoCoin.available, remainingAfterWasil);

    const totalCoinsToUse = wasilCoinsUsed + promoCoinsUsed;

    // Validate sufficient balance (check total available, not just used)
    if (totalPayable > 0 && totalAvailableBalance < totalPayable) {
      const shortfall = totalPayable - totalAvailableBalance;
      console.error('💳 [Checkout] Insufficient balance:', { shortfall, totalPayable, totalAvailableBalance });
      setState(prev => ({
        ...prev,
        error: `Insufficient balance. You need ${shortfall} more RC to complete this purchase.`
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, currentStep: 'processing' }));

    try {
      // Step 1: Process wallet payment

      const paymentData = {
        amount: totalPayable,
        orderId: undefined, // Will be set after order creation
        storeId: state.store.id,
        storeName: state.store.name,
        description: `Purchase of ${state.items.length} item(s) from ${state.store.name}`,
        items: state.items.map(item => ({
          productId: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const walletResponse = await walletApi.processPayment(paymentData);

      if (!walletResponse.success || !walletResponse.data) {
        console.error('💳 [Checkout] Wallet payment failed:', walletResponse.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: walletResponse.error || 'Wallet payment failed',
          currentStep: 'checkout'
        }));
        return;
      }

      // Step 2: Create order with wallet payment method

      const orderData = mapFrontendCheckoutToBackendOrder({
        deliveryAddress: { name: 'Customer', phone: '0000000000', addressLine1: state.store.name, city: 'City', state: 'State', pincode: '000000' },
        paymentMethod: 'wallet',
        specialInstructions: '',
        couponCode: state.appliedPromoCode?.code,
      });

      const orderResponse = await ordersService.createOrder(orderData);

      if (!orderResponse.success || !orderResponse.data) {
        console.error('💳 [Checkout] Order creation failed after payment:', orderResponse.error);
        // Payment succeeded but order failed - this is a critical issue
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Payment processed but order creation failed. Please contact support.',
          currentStep: 'checkout'
        }));
        return;
      }

      // Step 3: Clear cart
      try {
        await cartService.clearCart();

      } catch (clearError) {
        console.error('💳 [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 4: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = walletResponse.data.transaction.transactionId;

      router.push(`/payment-success?orderId=${orderId}&transactionId=${transactionId}&paymentMethod=wallet`);

    } catch (error) {
      console.error('💳 [Checkout] Wallet payment error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Wallet payment failed',
        currentStep: 'checkout'
      }));
    }
  }, [state.coinSystem, state.billSummary, state.items, state.store, state.appliedPromoCode]);

  /**
   * Handle PayBill payment
   * Process payment using PayBill balance and create order
   */
  const handlePayBillPayment = useCallback(async () => {

    const totalPayable = state.billSummary.totalPayable;

    // Validate sufficient PayBill balance
    if (totalPayable > 0 && paybillBalance < totalPayable) {
      const shortfall = totalPayable - paybillBalance;
      console.error('🎟️ [Checkout] Insufficient PayBill balance:', { shortfall, totalPayable, paybillBalance });
      setState(prev => ({
        ...prev,
        error: `Insufficient PayBill balance. You need ₹${shortfall} more. Add money to PayBill to continue.`
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, currentStep: 'processing' }));

    try {
      // Step 1: Use PayBill balance for payment

      const paymentResponse = await paybillApi.useBalance({
        amount: totalPayable,
        orderId: undefined, // Will be set after order creation
        description: `Purchase of ${state.items.length} item(s) from ${state.store.name}`
      });

      if (!paymentResponse.success || !paymentResponse.data) {
        console.error('🎟️ [Checkout] PayBill payment failed:', paymentResponse.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: paymentResponse.error || 'PayBill payment failed',
          currentStep: 'checkout'
        }));
        return;
      }

      // Update local PayBill balance
      setPaybillBalance(paymentResponse.data.paybillBalance || 0);

      // Step 2: Create order with PayBill payment method

      const orderData = mapFrontendCheckoutToBackendOrder({
        deliveryAddress: { name: 'Customer', phone: '0000000000', addressLine1: state.store.name, city: 'City', state: 'State', pincode: '000000' },
        paymentMethod: 'paybill',
        specialInstructions: '',
        couponCode: state.appliedPromoCode?.code,
      });

      const orderResponse = await ordersService.createOrder(orderData);

      if (!orderResponse.success || !orderResponse.data) {
        console.error('🎟️ [Checkout] Order creation failed after payment:', orderResponse.error);
        // Payment succeeded but order failed - this is a critical issue
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Payment processed but order creation failed. Please contact support.',
          currentStep: 'checkout'
        }));
        return;
      }

      // Step 3: Clear cart
      try {
        await cartService.clearCart();

      } catch (clearError) {
        console.error('🎟️ [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 4: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = paymentResponse.data.transaction?.transactionId || `PAYBILL_${Date.now()}`;

      router.push(`/payment-success?orderId=${orderId}&transactionId=${transactionId}&paymentMethod=paybill`);

    } catch (error) {
      console.error('🎟️ [Checkout] PayBill payment error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'PayBill payment failed',
        currentStep: 'checkout'
      }));
    }
  }, [paybillBalance, state.billSummary, state.items, state.store, state.appliedPromoCode]);

  /**
   * Handle Cash on Delivery (COD) payment
   * Simplest payment method - create order directly with COD payment method
   */
  const handleCODPayment = useCallback(async () => {

    setState(prev => ({ ...prev, loading: true, currentStep: 'processing' }));

    try {
      // Step 1: Create order with COD payment method

      const orderData = mapFrontendCheckoutToBackendOrder({
        deliveryAddress: { name: 'Customer', phone: '0000000000', addressLine1: state.store.name, city: 'City', state: 'State', pincode: '000000' },
        paymentMethod: 'cod',
        specialInstructions: '',
        couponCode: state.appliedPromoCode?.code,
      });

      // Add coins used information if any
      const coinsUsed = {
        wasilCoins: state.coinSystem.wasilCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.wasilCoin.used || 0) + 
                         (state.coinSystem.promoCoin.used || 0) + 
                         (state.coinSystem.storePromoCoin.used || 0),
      };

      // Attach coins used to order data
      (orderData as any).coinsUsed = coinsUsed;

      const orderResponse = await ordersService.createOrder(orderData);

      if (!orderResponse.success || !orderResponse.data) {
        console.error('💵 [Checkout] COD order creation failed:', orderResponse.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: orderResponse.error || 'Failed to create COD order',
          currentStep: 'checkout'
        }));
        return;
      }

      // Step 2: Clear cart
      try {
        await cartService.clearCart();

      } catch (clearError) {
        console.error('💵 [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 3: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = `COD_${Date.now()}`;

      router.push(`/payment-success?orderId=${orderId}&transactionId=${transactionId}&paymentMethod=cod`);

    } catch (error) {
      console.error('💵 [Checkout] COD payment error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'COD order creation failed',
        currentStep: 'checkout'
      }));
    }
  }, [state.items, state.store, state.appliedPromoCode, state.coinSystem, router]);

  /**
   * Handle Razorpay payment (UPI, Card, NetBanking, Wallets)
   * Opens Razorpay checkout modal and processes payment
   */
  const handleRazorpayPayment = useCallback(async (userInfo?: { name?: string; email?: string; phone?: string }) => {

    const totalPayable = state.billSummary.totalPayable;

    if (totalPayable <= 0) {
      showToast({ message: 'Invalid order amount', type: 'error' });
      return;
    }

    setState(prev => ({ ...prev, loading: true, currentStep: 'processing' }));

    try {
      // Calculate coins used
      const coinsUsed = {
        wasilCoins: state.coinSystem.wasilCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.wasilCoin.used || 0) + 
                         (state.coinSystem.promoCoin.used || 0) + 
                         (state.coinSystem.storePromoCoin.used || 0),
      };

      // Create Razorpay payment
      await createRazorpayPayment({
        amount: totalPayable,
        notes: {
          storeId: state.store.id,
          storeName: state.store.name,
          itemCount: state.items.length,
          couponCode: state.appliedPromoCode?.code || '',
          coinsUsed: JSON.stringify(coinsUsed),
        },
        userInfo,
        onSuccess: async (paymentResponse) => {

          try {
            // Create order after successful payment
            const orderData = mapFrontendCheckoutToBackendOrder({
              deliveryAddress: { name: 'Customer', phone: '0000000000', addressLine1: state.store.name, city: 'City', state: 'State', pincode: '000000' },
              paymentMethod: 'razorpay',
              specialInstructions: '',
              couponCode: state.appliedPromoCode?.code,
            });

            // Attach payment and coins info
            (orderData as any).razorpayPaymentId = paymentResponse.paymentId;
            (orderData as any).razorpayOrderId = paymentResponse.orderId;
            (orderData as any).transactionId = paymentResponse.transactionId;
            (orderData as any).coinsUsed = coinsUsed;

            const orderResponse = await ordersService.createOrder(orderData);

            if (!orderResponse.success || !orderResponse.data) {
              console.error('❌ [Checkout] Order creation failed after payment:', orderResponse.error);
              showToast({
                message: 'Payment successful but order creation failed. Please contact support.',
                type: 'error',
              });
              setState(prev => ({
                ...prev,
                loading: false,
                error: 'Order creation failed. Please contact support.',
                currentStep: 'checkout',
              }));
              return;
            }

            // Clear cart
            try {
              await cartService.clearCart();

            } catch (clearError) {
              console.error('⚠️ [Checkout] Failed to clear cart:', clearError);
              // Non-critical error
            }

            // Navigate to success page
            setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

            const orderId = orderResponse.data.id || orderResponse.data._id;
            showToast({ message: 'Payment successful! Order placed', type: 'success' });

            router.push(
              `/payment-success?orderId=${orderId}&transactionId=${paymentResponse.transactionId}&paymentMethod=razorpay`
            );
          } catch (error) {
            console.error('❌ [Checkout] Post-payment error:', error);
            showToast({
              message: error instanceof Error ? error.message : 'Order creation failed',
              type: 'error',
            });
            setState(prev => ({
              ...prev,
              loading: false,
              error: error instanceof Error ? error.message : 'Order creation failed',
              currentStep: 'checkout',
            }));
          }
        },
        onError: (error) => {
          console.error('❌ [Checkout] Razorpay payment error:', error);
          showToast({
            message: error.message || 'Payment failed',
            type: 'error',
          });
          setState(prev => ({
            ...prev,
            loading: false,
            error: error.message || 'Payment failed',
            currentStep: 'checkout',
          }));
        },
      });
    } catch (error) {
      console.error('❌ [Checkout] Razorpay initialization error:', error);
      showToast({
        message: error instanceof Error ? error.message : 'Failed to initialize payment',
        type: 'error',
      });
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize payment',
        currentStep: 'checkout',
      }));
    }
  }, [state.billSummary, state.items, state.store, state.appliedPromoCode, state.coinSystem, router]);

  // Handler functions for components
  const handlePromoCodeApply = useCallback((code: string) => {
    const promoCode = state.availablePromoCodes.find(p => p.code === code && p.isActive);
    if (promoCode) {
      const itemTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      if (itemTotal >= promoCode.minOrderValue) {
        applyPromoCode(promoCode);
      } else {
        setState(prev => ({ 
          ...prev, 
          error: `Minimum order value ₹${promoCode.minOrderValue} required for ${code}` 
        }));
      }
    } else {
      setState(prev => ({ ...prev, error: 'Invalid promo code' }));
    }
  }, [state.availablePromoCodes, state.items, applyPromoCode]);

  const handleCoinToggle = useCallback((coinType: 'wasil' | 'promo' | 'storePromo', enabled: boolean) => {
    if (coinType === 'wasil') {
      toggleWasilCoin(enabled);
    } else if (coinType === 'promo') {
      togglePromoCoin(enabled);
    } else if (coinType === 'storePromo') {
      toggleStorePromoCoin(enabled);
    }
  }, [toggleWasilCoin, togglePromoCoin, toggleStorePromoCoin]);

  const handlePaymentMethodSelect = useCallback((method: PaymentMethod) => {
    selectPaymentMethod(method);
  }, [selectPaymentMethod]);

  const handleProceedToPayment = useCallback(() => {
    proceedToPayment();
  }, [proceedToPayment]);

  const handleBackNavigation = useCallback(() => {
    if (state.currentStep === 'payment_methods') {
      setState(prev => ({ ...prev, currentStep: 'checkout' }));
      router.back();
    } else {
      router.back();
    }
  }, [state.currentStep]);

  // Clear error after some time
  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.error]);

  return {
    state,
    paybillBalance,
    actions: {
      applyPromoCode,
      removePromoCode,
      toggleWasilCoin,
      togglePromoCoin,
      selectPaymentMethod,
      updateBillSummary,
      proceedToPayment,
      processPayment,
    },
    handlers: {
      handlePromoCodeApply,
      handleCoinToggle,
      handleCustomCoinAmount,
      handlePaymentMethodSelect,
      handleProceedToPayment,
      handleBackNavigation,
      handleWalletPayment,
      handlePayBillPayment,
      handleCODPayment,
      handleRazorpayPayment,
      removePromoCode,
      navigateToOtherPaymentMethods,
    },
  };
};