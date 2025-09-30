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
import { mapBackendCartToFrontend, mapFrontendCheckoutToBackendOrder } from '@/utils/dataMappers';

export const useCheckout = (): UseCheckoutReturn => {
  const [state, setState] = useState<CheckoutPageState>(CheckoutData.initialState);

  // Initialize checkout data
  useEffect(() => {
    initializeCheckout();
  }, []);

  const initializeCheckout = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      console.log('💳 [Checkout] Initializing checkout with real cart data...');

      // Try to load from cart API first
      try {
        const cartResponse = await cartService.getCart();

        if (cartResponse.success && cartResponse.data) {
          console.log('💳 [Checkout] Cart loaded from API');
          const mappedCart = mapBackendCartToFrontend(cartResponse.data);

          // Convert cart items to checkout items format
          const checkoutItems: CheckoutItem[] = mappedCart.items.map((item: any) => ({
            id: item.id,
            productId: item.productId,
            name: item.name,
            image: item.image,
            price: item.price,
            originalPrice: item.originalPrice,
            quantity: item.quantity,
            variant: item.variant,
            store: item.store,
          }));

          // Get bill summary from cart totals
          const billSummary: BillSummary = {
            itemTotal: mappedCart.totals.subtotal,
            deliveryFee: mappedCart.totals.shipping,
            tax: mappedCart.totals.tax,
            discount: mappedCart.totals.discount,
            wasilCoinDiscount: 0,
            promoCoinDiscount: 0,
            totalSavings: mappedCart.totals.savings || mappedCart.totals.discount,
            grandTotal: mappedCart.totals.total,
          };

          // Get promo code from cart
          const appliedPromoCode = mappedCart.coupon ? {
            code: mappedCart.coupon.code,
            description: `${mappedCart.coupon.discountValue}% off`,
            discount: mappedCart.coupon.appliedAmount,
            minimumOrder: 0,
            maxDiscount: mappedCart.coupon.appliedAmount,
          } : null;

          // NEW: Fetch real wallet data
          let realCoinSystem = {
            wasilCoin: { available: 0, used: 0, conversionRate: 1 },
            promoCoin: { available: 0, used: 0, maxUsagePercentage: 20 }
          };

          try {
            console.log('💳 [Checkout] Fetching wallet balance...');
            const walletResponse = await walletApi.getBalance();

            if (walletResponse.success && walletResponse.data) {
              const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
              const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

              realCoinSystem = {
                wasilCoin: {
                  available: wasilCoin?.amount || 0,
                  used: 0,
                  conversionRate: 1
                },
                promoCoin: {
                  available: promoCoin?.amount || 0,
                  used: 0,
                  maxUsagePercentage: 20
                }
              };

              console.log('💳 [Checkout] Wallet loaded:', {
                wasil: realCoinSystem.wasilCoin.available,
                promo: realCoinSystem.promoCoin.available
              });
            }
          } catch (walletError) {
            console.error('💳 [Checkout] Failed to load wallet, using 0 balance:', walletError);
          }

          // Use mock data for payment methods only
          const mockData = await CheckoutData.api.initializeCheckout();

          setState(prev => ({
            ...prev,
            items: checkoutItems,
            store: mockData.store, // Use mock store for now
            billSummary,
            appliedPromoCode,
            availablePromoCodes: mockData.availablePromoCodes,
            coinSystem: realCoinSystem, // NEW: Use real wallet data
            availablePaymentMethods: mockData.paymentMethods,
            recentPaymentMethods: mockData.paymentMethods.filter(m => m.isRecent),
            loading: false,
          }));
          return;
        }
      } catch (apiError) {
        console.log('💳 [Checkout] API failed, using mock data:', apiError);
      }

      // Fallback to mock data + real wallet
      let realCoinSystem = {
        wasilCoin: { available: 0, used: 0, conversionRate: 1 },
        promoCoin: { available: 0, used: 0, maxUsagePercentage: 20 }
      };

      try {
        console.log('💳 [Checkout] Fetching wallet balance (fallback)...');
        const walletResponse = await walletApi.getBalance();

        if (walletResponse.success && walletResponse.data) {
          const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
          const promoCoin = walletResponse.data.coins.find((c: any) => c.type === 'promotion');

          realCoinSystem = {
            wasilCoin: {
              available: wasilCoin?.amount || 0,
              used: 0,
              conversionRate: 1
            },
            promoCoin: {
              available: promoCoin?.amount || 0,
              used: 0,
              maxUsagePercentage: 20
            }
          };

          console.log('💳 [Checkout] Wallet loaded (fallback):', {
            wasil: realCoinSystem.wasilCoin.available,
            promo: realCoinSystem.promoCoin.available
          });
        }
      } catch (walletError) {
        console.error('💳 [Checkout] Failed to load wallet (fallback), using 0 balance:', walletError);
      }

      const data = await CheckoutData.api.initializeCheckout();
      setState(prev => ({
        ...prev,
        items: data.items,
        store: data.store,
        billSummary: data.billSummary,
        availablePromoCodes: data.availablePromoCodes,
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
      const response = await CheckoutData.api.validatePromoCode(
        code.code,
        state.items,
        state.store
      );
      
      if (response.isValid && response.promoCode) {
        setState(prev => ({
          ...prev,
          appliedPromoCode: response.promoCode,
          billSummary: response.updatedBillSummary,
          loading: false,
          showPromoCodeSection: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: response.error || 'Invalid promo code',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to apply promo code',
      }));
    }
  }, [state.items, state.store]);

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
        console.log('💳 [Checkout] No REZ coins available');
        // Don't toggle if no coins
        return prev;
      }

      // Calculate subtotal before coin discounts
      const itemTotal = prev.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const getAndItemTotal = Math.round(itemTotal * 0.05);
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05);
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'fixed'
          ? prev.appliedPromoCode.discountValue
          : Math.min(Math.round((itemTotal * prev.appliedPromoCode.discountValue) / 100), prev.appliedPromoCode.maxDiscount || Infinity)
      ) : 0;

      const subtotalBeforeCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount;

      // REZ coins have 1:1 conversion (1 coin = 1 rupee) and can be used up to available amount
      const coinsToUse = enabled ? Math.min(prev.coinSystem.wasilCoin.available, subtotalBeforeCoins) : 0;

      console.log('💳 [Checkout] Wasil coin toggle:', {
        enabled,
        available: prev.coinSystem.wasilCoin.available,
        using: coinsToUse
      });
      
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
        console.log('💳 [Checkout] No promo coins available');
        // Don't toggle if no coins
        return prev;
      }

      // Calculate subtotal before coin discounts
      const itemTotal = prev.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      const getAndItemTotal = Math.round(itemTotal * 0.05);
      const platformFee = 2;
      const taxes = Math.round(itemTotal * 0.05);
      const promoDiscount = prev.appliedPromoCode ? (
        prev.appliedPromoCode.discountType === 'fixed'
          ? prev.appliedPromoCode.discountValue
          : Math.min(Math.round((itemTotal * prev.appliedPromoCode.discountValue) / 100), prev.appliedPromoCode.maxDiscount || Infinity)
      ) : 0;

      const subtotalAfterREZCoins = itemTotal + getAndItemTotal + prev.store.deliveryFee + platformFee + taxes - promoDiscount - prev.coinSystem.wasilCoin.used;

      // Promo coins have 1:1 conversion and can be used up to 20% of remaining amount or available coins
      const maxPromoUsage = Math.floor(subtotalAfterREZCoins * prev.coinSystem.promoCoin.maxUsagePercentage / 100);
      const coinsToUse = enabled ? Math.min(prev.coinSystem.promoCoin.available, maxPromoUsage, subtotalAfterREZCoins) : 0;

      console.log('💳 [Checkout] Promo coin toggle:', {
        enabled,
        available: prev.coinSystem.promoCoin.available,
        maxUsage: maxPromoUsage,
        using: coinsToUse
      });
      
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
      console.log('💳 [Checkout] Creating order via API...');

      // Map frontend checkout data to backend order format
      const orderData = mapFrontendCheckoutToBackendOrder({
        items: state.items,
        deliveryAddress: state.store.address, // Using store address for now
        paymentMethod: state.selectedPaymentMethod.id as any,
        specialInstructions: '',
        couponCode: state.appliedPromoCode?.code,
      });

      // Create order via API
      const response = await ordersService.createOrder(orderData);

      if (response.success && response.data) {
        console.log('💳 [Checkout] Order created successfully:', response.data.orderNumber);

        // Clear cart after successful order
        try {
          await cartService.clearCart();
          console.log('💳 [Checkout] Cart cleared after order');
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
    console.log('💳 [Checkout] Starting wallet payment...');

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

    console.log('💳 [Checkout] Payment details:', {
      totalPayable,
      wasilCoinsUsed,
      promoCoinsUsed,
      totalCoinsToUse,
      totalAvailableBalance,
      wasilAvailable: state.coinSystem.wasilCoin.available,
      promoAvailable: state.coinSystem.promoCoin.available
    });

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
      console.log('💳 [Checkout] Processing wallet payment API call...');

      const paymentData = {
        amount: totalPayable,
        orderId: undefined, // Will be set after order creation
        storeId: state.store.id,
        storeName: state.store.name,
        description: `Purchase of ${state.items.length} item(s) from ${state.store.name}`,
        items: state.items.map(item => ({
          productId: item.productId,
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

      console.log('💳 [Checkout] Wallet payment successful:', {
        transactionId: walletResponse.data.transaction.transactionId,
        balanceAfter: walletResponse.data.wallet.balance.available
      });

      // Step 2: Create order with wallet payment method
      console.log('💳 [Checkout] Creating order...');

      const orderData = mapFrontendCheckoutToBackendOrder({
        items: state.items,
        deliveryAddress: state.store.address,
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

      console.log('💳 [Checkout] Order created successfully:', {
        orderId: orderResponse.data.id || orderResponse.data._id,
        orderNumber: orderResponse.data.orderNumber
      });

      // Step 3: Clear cart
      try {
        await cartService.clearCart();
        console.log('💳 [Checkout] Cart cleared');
      } catch (clearError) {
        console.error('💳 [Checkout] Failed to clear cart:', clearError);
        // Non-critical error, continue
      }

      // Step 4: Navigate to success page
      setState(prev => ({ ...prev, currentStep: 'success', loading: false }));

      const orderId = orderResponse.data.id || orderResponse.data._id;
      const transactionId = walletResponse.data.transaction.transactionId;

      console.log('💳 [Checkout] Wallet payment flow complete!');
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

  const handleCoinToggle = useCallback((coinType: 'wasil' | 'promo', enabled: boolean) => {
    if (coinType === 'wasil') {
      toggleWasilCoin(enabled);
    } else {
      togglePromoCoin(enabled);
    }
  }, [toggleWasilCoin, togglePromoCoin]);

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
      handlePaymentMethodSelect,
      handleProceedToPayment,
      handleBackNavigation,
      handleWalletPayment,
      removePromoCode,
      navigateToOtherPaymentMethods,
    },
  };
};