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
import { storePromoCoinApi } from '@/services/storePromoCoinApi';
import { createRazorpayPayment } from '@/services/razorpayApi';
import { mapBackendCartToFrontend, mapFrontendCheckoutToBackendOrder } from '@/utils/dataMappers';
import { showToast } from '@/components/common/ToastManager';
import { useCart } from '@/contexts/CartContext';

export const useCheckout = (): UseCheckoutReturn => {
  const { actions: cartActions } = useCart();
  const [state, setState] = useState<CheckoutPageState>(CheckoutData.initialState);

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
          // Calculate itemTotal from actual cart items to ensure consistency with Order Items Preview
          const itemTotal = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);
          const getAndItemTotal = Math.round(itemTotal * 0.05); // 5% get & item charge
          const deliveryFee = mappedCart.totals.delivery || mappedCart.totals.shipping || 0;
          const platformFee = 2; // Fixed platform fee
          // Calculate taxes based on correct itemTotal (5% of item total)
          const taxes = mappedCart.totals.tax || Math.round(itemTotal * 0.05);
          const promoDiscount = mappedCart.totals.discount || 0;
          const coinDiscount = 0; // Will be calculated when coins are toggled
          
          // Always calculate total payable from our values to ensure consistency
          let totalPayable = itemTotal + getAndItemTotal + deliveryFee + platformFee + taxes - promoDiscount - coinDiscount;
          
          // Calculate round off to nearest rupee
          const roundOff = Math.round(totalPayable) - totalPayable;
          totalPayable = Math.max(0, Math.round(totalPayable));
          
          // Calculate savings from actual cart items (originalPrice - price) * quantity
          const calculatedSavings = checkoutItems.reduce((total, item) => {
            const originalPrice = item.originalPrice || item.price;
            const savings = (originalPrice - item.price) * item.quantity;
            return total + Math.max(0, savings);
          }, 0);

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
            savings: calculatedSavings || promoDiscount,
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
            rezCoin: { 
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
              const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
              const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

              realCoinSystem = {
                ...realCoinSystem,
                rezCoin: {
                  available: rezCoin?.amount || 0,
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
        rezCoin: { 
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
          const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
          const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

          realCoinSystem = {
            ...realCoinSystem,
            rezCoin: {
              available: rezCoin?.amount || 0,
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
            rez: realCoinSystem.rezCoin.available,
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
      rez: state.coinSystem.rezCoin.used,
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

  const applyPromoCode = useCallback(async (code: PromoCode): Promise<{ success: boolean; message: string; discount?: number }> => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      // Prepare cart data for validation - only include non-empty fields
      const cartData = {
        items: state.items.map(item => {
          const cartItem: any = {
            product: item.id,
            quantity: item.quantity,
            price: item.price,
          };
          // Only include category and store if they have values
          if (item.category && item.category.trim() !== '') {
            cartItem.category = item.category;
          }
          if (item.storeId && item.storeId.trim() !== '') {
            cartItem.store = item.storeId;
          }
          return cartItem;
        }),
        subtotal: state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
      };

      console.log('🎟️ [Checkout] Validating coupon:', code.code, 'with cart data:', cartData);

      const response = await couponService.validateCoupon(code.code, cartData);

      console.log('🎟️ [Checkout] Coupon validation response:', response);

      if (response.success && response.data) {
        // Calculate new bill summary with coupon discount
        const coinUsage = {
          rez: state.coinSystem.rezCoin.used,
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
        const totalAfterDiscount = totalBeforeDiscount - response.data.discount - coinUsage.rez - coinUsage.promo;
        newBillSummary.totalPayable = Math.max(0, Math.round(totalAfterDiscount));

        console.log('🎟️ [Checkout] New bill summary after coupon:', newBillSummary);
        console.log('🎟️ [Checkout] Setting state with appliedPromoCode:', code);
        console.log('🎟️ [Checkout] Setting state with billSummary:', newBillSummary);

        setState(prev => {
          console.log('🎟️ [Checkout] Previous state:', { appliedPromoCode: prev.appliedPromoCode, billSummary: prev.billSummary });
          const newState = {
            ...prev,
            appliedPromoCode: code,
            billSummary: newBillSummary,
            loading: false,
            showPromoCodeSection: false,
            error: null,
          };
          console.log('🎟️ [Checkout] New state:', { appliedPromoCode: newState.appliedPromoCode, billSummary: newState.billSummary });
          return newState;
        });

        return { success: true, message: `${code.code} applied! You save ₹${response.data.discount}`, discount: response.data.discount };
      } else {
        console.error('💳 [Checkout] Coupon invalid:', response.message);
        const errorMsg = response.message || 'Invalid coupon code';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        return { success: false, message: errorMsg };
      }
    } catch (error) {
      console.error('💳 [Checkout] Coupon validation error:', error);
      const errorMsg = 'Failed to validate coupon';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMsg,
      }));
      return { success: false, message: errorMsg };
    }
  }, [state.items, state.store, state.coinSystem]);

  const removePromoCode = useCallback(() => {
    setState(prev => {
      const coinUsage = {
        rez: prev.coinSystem.rezCoin.used,
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

  const toggleRezCoin = useCallback((enabled: boolean) => {
    setState(prev => {
      // Check if user has any coins
      if (enabled && prev.coinSystem.rezCoin.available === 0) {

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
      const coinsToUse = enabled ? Math.min(Number(prev.coinSystem.rezCoin.available) || 0, subtotalBeforeCoins) : 0;

      const newCoinSystem = {
        ...prev.coinSystem,
        rezCoin: {
          ...prev.coinSystem.rezCoin,
          used: coinsToUse,
        },
      };
      
      const coinUsage = {
        rez: coinsToUse,
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

      const subtotalAfterREZCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount - prev.coinSystem.rezCoin.used;

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
        rez: prev.coinSystem.rezCoin.used,
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
      const subtotalAfterOtherCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount - prev.coinSystem.rezCoin.used - prev.coinSystem.promoCoin.used;

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
        rez: prev.coinSystem.rezCoin.used,
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

  const handleCustomCoinAmount = useCallback((coinType: 'rez' | 'promo' | 'storePromo', amount: number) => {
    setState(prev => {

      const coinSystem = prev.coinSystem;
      const isRez = coinType === 'rez';
      const isStorePromo = coinType === 'storePromo';
      const coin = isRez ? coinSystem.rezCoin : (isStorePromo ? coinSystem.storePromoCoin : coinSystem.promoCoin);
      
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
      
      if (!isRez) {
        // For promo/store promo coins, subtract rez coins already used
        maxAllowed -= coinSystem.rezCoin.used;
        
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
        [isRez ? 'rezCoin' : (isStorePromo ? 'storePromoCoin' : 'promoCoin')]: {
          ...coin,
          used: finalAmount,
        },
      };
      
      const coinUsage = {
        rez: isRez ? finalAmount : coinSystem.rezCoin.used,
        promo: (isRez || isStorePromo) ? coinSystem.promoCoin.used : finalAmount,
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

      // Add coinsUsed to order data
      const coinsUsed = {
        rezCoins: state.coinSystem.rezCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.rezCoin.used || 0) +
          (state.coinSystem.promoCoin.used || 0) +
          (state.coinSystem.storePromoCoin.used || 0)
      };
      (orderData as any).coinsUsed = coinsUsed;

      // Create order via API
      const response = await ordersService.createOrder(orderData);

      if (response.success && response.data) {

        // Clear cart after successful order (both API and context state)
        try {
          await cartService.clearCart();
          await cartActions.clearCart();
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
  }, [state.selectedPaymentMethod, state.billSummary, state.items, state.store, state.appliedPromoCode, cartActions]);

  /**
   * Handle wallet payment
   * Process payment using wallet coins and create order
   */
  const handleWalletPayment = useCallback(async () => {

    const totalPayable = state.billSummary.totalPayable;

    // Calculate total available balance
    const totalAvailableBalance = state.coinSystem.rezCoin.available + state.coinSystem.promoCoin.available;

    // Calculate coins that will be used (use toggled amounts, or calculate if not toggled)
    const rezCoinsUsed = state.coinSystem.rezCoin.used > 0
      ? state.coinSystem.rezCoin.used
      : Math.min(state.coinSystem.rezCoin.available, totalPayable);

    const remainingAfterWasil = Math.max(0, totalPayable - rezCoinsUsed);
    const promoCoinsUsed = state.coinSystem.promoCoin.used > 0
      ? state.coinSystem.promoCoin.used
      : Math.min(state.coinSystem.promoCoin.available, remainingAfterWasil);

    const totalCoinsToUse = rezCoinsUsed + promoCoinsUsed;

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

      // Add coinsUsed to order data
      const coinsUsedData = {
        rezCoins: state.coinSystem.rezCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.rezCoin.used || 0) +
          (state.coinSystem.promoCoin.used || 0) +
          (state.coinSystem.storePromoCoin.used || 0)
      };
      (orderData as any).coinsUsed = coinsUsedData;

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

      // Step 3: Clear cart (both API and context state)
      try {
        await cartService.clearCart();
        await cartActions.clearCart();
      } catch (clearError) {
        console.error('💳 [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 4: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = walletResponse.data.transaction.transactionId;

      router.replace(`/payment-success?orderId=${orderId}&transactionId=${transactionId}&paymentMethod=wallet`);

    } catch (error) {
      console.error('💳 [Checkout] Wallet payment error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Wallet payment failed',
        currentStep: 'checkout'
      }));
    }
  }, [state.coinSystem, state.billSummary, state.items, state.store, state.appliedPromoCode, cartActions]);

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
        rezCoins: state.coinSystem.rezCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.rezCoin.used || 0) + 
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

      // Step 2: Clear cart (both API and context state)
      try {
        await cartService.clearCart();
        await cartActions.clearCart();
      } catch (clearError) {
        console.error('💵 [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 3: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = `COD_${Date.now()}`;

      router.replace(`/payment-success?orderId=${orderId}&transactionId=${transactionId}&paymentMethod=cod`);

    } catch (error) {
      console.error('💵 [Checkout] COD payment error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'COD order creation failed',
        currentStep: 'checkout'
      }));
    }
  }, [state.items, state.store, state.appliedPromoCode, state.coinSystem, router, cartActions]);

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
        rezCoins: state.coinSystem.rezCoin.used || 0,
        promoCoins: state.coinSystem.promoCoin.used || 0,
        storePromoCoins: state.coinSystem.storePromoCoin.used || 0,
        totalCoinsValue: (state.coinSystem.rezCoin.used || 0) + 
                         (state.coinSystem.promoCoin.used || 0) + 
                         (state.coinSystem.storePromoCoin.used || 0),
      };

      // Auto-apply card offer if available (will be validated when card is entered in Razorpay)
      // The offer will be applied via the CardOffersSection component or when card is validated
      const appliedCardOffer = (state as any).appliedCardOffer;

      // Create Razorpay payment
      await createRazorpayPayment({
        amount: totalPayable,
        notes: {
          storeId: state.store.id,
          storeName: state.store.name,
          itemCount: state.items.length,
          couponCode: state.appliedPromoCode?.code || '',
          coinsUsed: JSON.stringify(coinsUsed),
          cardOfferId: appliedCardOffer?._id || '',
        },
        userInfo,
        onSuccess: async (paymentResponse) => {

          try {
            // Auto-apply card offer if card payment was used
            let appliedCardOffer = null;
            if (paymentResponse.paymentMethod === 'card' || paymentResponse.paymentMethod?.includes('card')) {
              try {
                const discountsApi = await import('@/services/discountsApi');
                const storeId = state.store.id;
                const orderValue = state.billSummary.totalPayable;
                
                // Get best card offer for this store
                const cardOffersResponse = await discountsApi.getCardOffers({
                  storeId,
                  orderValue,
                  page: 1,
                  limit: 1,
                });
                
                if (cardOffersResponse.success && cardOffersResponse.data?.discounts?.[0]) {
                  const bestOffer = cardOffersResponse.data.discounts[0];
                  
                  // Validate eligibility
                  if (orderValue >= bestOffer.minOrderValue) {
                    // Apply the offer
                    const applyResponse = await discountsApi.applyCardOffer({
                      discountId: bestOffer._id,
                    });
                    
                    if (applyResponse.success) {
                      appliedCardOffer = bestOffer;
                      console.log('✅ [Checkout] Card offer auto-applied:', bestOffer.name);
                    }
                  }
                }
              } catch (err) {
                console.error('⚠️ [Checkout] Error auto-applying card offer:', err);
                // Non-critical error, continue with order
              }
            }

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
            
            // Attach card offer if applied
            if (appliedCardOffer) {
              (orderData as any).cardOfferId = appliedCardOffer._id;
              const discountAmount = appliedCardOffer.type === 'percentage'
                ? Math.round((orderValue * appliedCardOffer.value) / 100)
                : appliedCardOffer.value;
              (orderData as any).cardOfferDiscount = Math.min(
                discountAmount,
                appliedCardOffer.maxDiscountAmount || discountAmount
              );
            }

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

            // Clear cart (both API and context state)
            try {
              await cartService.clearCart();
              await cartActions.clearCart();
            } catch (clearError) {
              console.error('⚠️ [Checkout] Failed to clear cart:', clearError);
              // Non-critical error
            }

            // Navigate to success page
            setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

            const orderId = orderResponse.data.id || orderResponse.data._id;
            showToast({ message: 'Payment successful! Order placed', type: 'success' });

            router.replace(
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
  }, [state.billSummary, state.items, state.store, state.appliedPromoCode, state.coinSystem, router, cartActions]);

  // Handler functions for components
  const handlePromoCodeApply = useCallback(async (code: string): Promise<{ success: boolean; message: string }> => {
    // First try to find in available promo codes
    const existingPromo = state.availablePromoCodes.find(p => p.code === code && p.isActive);

    const itemTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    if (existingPromo) {
      // Check minimum order value
      if (itemTotal < existingPromo.minOrderValue) {
        const errorMsg = `Minimum order value ₹${existingPromo.minOrderValue} required for ${code}`;
        setState(prev => ({ ...prev, error: errorMsg }));
        return { success: false, message: errorMsg };
      }

      // Apply the promo code and return its result
      const result = await applyPromoCode(existingPromo);
      return result;
    } else {
      // Code not in available list - try to validate with backend anyway
      // Create a temporary promo code object
      const tempPromoCode: PromoCode = {
        id: code,
        code: code,
        title: code,
        description: 'Promo code',
        discountType: 'PERCENTAGE', // Will be updated from backend response
        discountValue: 0, // Will be updated from backend response
        maxDiscount: 0,
        minOrderValue: 0,
        validUntil: '',
        isActive: true,
        termsAndConditions: [],
      };

      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        // Prepare cart data for validation - only include non-empty fields
        const cartData = {
          items: state.items.map(item => {
            const cartItem: any = {
              product: item.id,
              quantity: item.quantity,
              price: item.price,
            };
            // Only include category and store if they have values
            if (item.category && item.category.trim() !== '') {
              cartItem.category = item.category;
            }
            if (item.storeId && item.storeId.trim() !== '') {
              cartItem.store = item.storeId;
            }
            return cartItem;
          }),
          subtotal: itemTotal,
        };

        const response = await couponService.validateCoupon(code, cartData);

        if (response.success && response.data) {
          // Update promo code with backend values
          tempPromoCode.discountType = response.data.coupon.type;
          tempPromoCode.discountValue = response.data.coupon.value;

          // Calculate new bill summary with coupon discount
          const coinUsage = {
            rez: state.coinSystem.rezCoin.used,
            promo: state.coinSystem.promoCoin.used,
          };

          const newBillSummary = CheckoutData.helpers.calculateBillSummary(
            state.items,
            state.store,
            tempPromoCode,
            coinUsage
          );

          // Override promo discount with actual backend value
          newBillSummary.promoDiscount = response.data.discount;
          newBillSummary.savings = (newBillSummary.savings || 0) + response.data.discount;

          // Recalculate totalPayable with promo discount
          const subtotal = newBillSummary.itemTotal + newBillSummary.getAndItemTotal;
          const totalBeforeDiscount = subtotal + newBillSummary.platformFee + newBillSummary.deliveryFee + newBillSummary.taxes;
          const totalAfterDiscount = totalBeforeDiscount - response.data.discount - coinUsage.rez - coinUsage.promo;
          newBillSummary.totalPayable = Math.max(0, Math.round(totalAfterDiscount));

          setState(prev => ({
            ...prev,
            appliedPromoCode: tempPromoCode,
            billSummary: newBillSummary,
            loading: false,
            showPromoCodeSection: false,
            error: null,
          }));

          return { success: true, message: `${code} applied successfully!` };
        } else {
          const errorMsg = response.message || 'Invalid promo code';
          setState(prev => ({
            ...prev,
            loading: false,
            error: errorMsg,
          }));
          return { success: false, message: errorMsg };
        }
      } catch (error) {
        const errorMsg = 'Failed to validate promo code';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMsg,
        }));
        return { success: false, message: errorMsg };
      }
    }
  }, [state.availablePromoCodes, state.items, state.store, state.coinSystem, applyPromoCode]);

  const handleCoinToggle = useCallback((coinType: 'rez' | 'promo' | 'storePromo', enabled: boolean) => {
    if (coinType === 'rez') {
      toggleRezCoin(enabled);
    } else if (coinType === 'promo') {
      togglePromoCoin(enabled);
    } else if (coinType === 'storePromo') {
      toggleStorePromoCoin(enabled);
    }
  }, [toggleRezCoin, togglePromoCoin, toggleStorePromoCoin]);

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
    actions: {
      applyPromoCode,
      removePromoCode,
      toggleRezCoin,
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
      handleCODPayment,
      handleRazorpayPayment,
      removePromoCode,
      navigateToOtherPaymentMethods,
    },
  };
};