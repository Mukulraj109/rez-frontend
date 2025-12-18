import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Switch,
  Dimensions,
  Animated,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartValidation } from '@/hooks/useCartValidation';
import StockWarningBanner from '@/components/cart/StockWarningBanner';
import CartValidation from '@/components/cart/CartValidation';
import CardOffersSection from '@/components/cart/CardOffersSection';
import { showToast } from '@/components/common/ToastManager';

const { width } = Dimensions.get('window');

export default function CheckoutPage() {
  const router = useRouter();
  // Destructure checkout hook return values
  const { state, handlers } = useCheckout();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [customCoinAmount, setCustomCoinAmount] = useState('');

  // Check if cart has service items (services require upfront payment, no COD)
  const serviceItems = state.items?.filter((item: any) => item.itemType === 'service') || [];
  const hasServiceItems = serviceItems.length > 0;
  const productItems = state.items?.filter((item: any) => item.itemType !== 'service') || [];

  // Cart validation state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);
  const [coinSectionExpanded, setCoinSectionExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);

  // Order confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cod' | 'wallet' | 'razorpay' | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  // Use cart validation hook with real-time validation
  const {
    validationState,
    hasInvalidItems,
    canCheckout,
    invalidItemCount,
    warningCount,
    errorCount,
    validateCart,
    clearValidation,
    removeInvalidItems,
  } = useCartValidation({
    autoValidate: true, // Enable auto-validation on checkout page
    validationInterval: 30000, // Re-validate every 30 seconds
    showToastNotifications: true, // Show toast for stock changes
  });

  // Calculate total wallet balance from coin system
  const totalWalletBalance = state.coinSystem.rezCoin.available + state.coinSystem.promoCoin.available;

  // Validate cart on page load
  useEffect(() => {

    validateCart();
  }, []);

  // Show validation modal if critical issues found
  useEffect(() => {
    if (validationState.validationResult && errorCount > 0) {

      setShowValidationModal(true);
    }
  }, [errorCount, validationState.validationResult]);

  // Add slider thumb styling for web (client-side only)
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'slider-thumb-styles';
      
      // Check if styles already exist
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          input[type="range"] {
            cursor: pointer;
            touch-action: none;
            user-select: none;
          }
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
            cursor: grab;
            box-shadow: 0 3px 12px rgba(139, 92, 246, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.5);
            transition: all 0.2s ease;
            border: 3px solid rgba(255, 255, 255, 0.95);
            position: relative;
            z-index: 10;
          }
          input[type="range"]::-webkit-slider-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.6);
            cursor: grab;
          }
          input[type="range"]::-webkit-slider-thumb:active {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.7);
            cursor: grabbing;
          }
          input[type="range"]::-moz-range-thumb {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            background: linear-gradient(135deg, #FFFFFF 0%, #F9FAFB 100%);
            cursor: grab;
            border: 3px solid rgba(255, 255, 255, 0.95);
            box-shadow: 0 3px 12px rgba(139, 92, 246, 0.4), 0 0 0 3px rgba(255, 255, 255, 0.5);
            transition: all 0.2s ease;
            z-index: 10;
          }
          input[type="range"]::-moz-range-thumb:hover {
            transform: scale(1.15);
            box-shadow: 0 4px 16px rgba(139, 92, 246, 0.5), 0 0 0 4px rgba(255, 255, 255, 0.6);
            cursor: grab;
          }
          input[type="range"]::-moz-range-thumb:active {
            transform: scale(1.05);
            box-shadow: 0 2px 8px rgba(139, 92, 246, 0.5), 0 0 0 3px rgba(255, 255, 255, 0.7);
            cursor: grabbing;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  const handleContinueToCheckout = () => {

    setShowValidationModal(false);
  };

  const handleRemoveInvalidItems = async () => {

    await removeInvalidItems();
    setShowValidationModal(false);
  };

  const handleRefreshValidation = async () => {

    await validateCart();
  };

  const [applyingPromo, setApplyingPromo] = useState(false);

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    const previousPromo = state.appliedPromoCode;
    const codeToApply = promoCode.trim().toUpperCase();

    setApplyingPromo(true);

    try {
      const result = await handlers.handlePromoCodeApply(codeToApply);

      setPromoCode('');
      setShowPromoModal(false);

      if (result.success) {
        const message = previousPromo
          ? `${previousPromo.code} replaced with ${codeToApply}!`
          : result.message;
        showToast({
          message: message,
          type: 'success',
          duration: 3000,
        });
      } else {
        showToast({
          message: result.message,
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Failed to apply promo code',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  // Payment confirmation handlers
  const handlePaymentSelect = (method: 'cod' | 'wallet' | 'razorpay') => {
    // Validate before showing modal
    if (method === 'cod' && hasServiceItems) {
      Alert.alert('COD Not Available', 'Cash on Delivery is not available for service bookings.');
      return;
    }
    if (method === 'wallet' && totalWalletBalance < (state.billSummary?.totalPayable || 0)) {
      Alert.alert('Insufficient Balance', `Your wallet balance (${totalWalletBalance} RC) is less than the order total.`);
      return;
    }

    setSelectedPaymentMethod(method);
    setShowConfirmModal(true);
    setPaymentExpanded(false);
  };

  const handleConfirmOrder = async () => {
    if (!selectedPaymentMethod) return;

    setShowConfirmModal(false);
    setProcessingPayment(true);

    // Set processing message based on payment method
    const messages: Record<string, string> = {
      cod: 'Placing your order...',
      wallet: 'Deducting from wallet...',
      razorpay: 'Redirecting to payment...',
    };
    setProcessingMessage(messages[selectedPaymentMethod] || 'Processing...');

    try {
      switch (selectedPaymentMethod) {
        case 'cod':
          await handlers.handleCODPayment();
          break;
        case 'wallet':
          await handlers.handleWalletPayment();
          break;
        case 'razorpay':
          await handlers.handleRazorpayPayment();
          break;
      }
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setProcessingPayment(false);
      setProcessingMessage('');
    }
  };

  const getPaymentMethodLabel = (method: string | null) => {
    const labels: Record<string, string> = {
      cod: 'Cash on Delivery',
      wallet: 'Wallet (ReZ Coins)',
      razorpay: 'Online Payment',
    };
    return labels[method || ''] || '';
  };

  const handleQuickPromoSelect = async (selectedPromoCode: string) => {
    const previousPromo = state.appliedPromoCode;

    setApplyingPromo(true);

    try {
      const result = await handlers.handlePromoCodeApply(selectedPromoCode);

      setShowPromoModal(false);

      if (result.success) {
        const message = previousPromo
          ? `${previousPromo.code} replaced with ${selectedPromoCode}!`
          : result.message;
        showToast({
          message: message,
          type: 'success',
          duration: 3000,
        });
      } else {
        showToast({
          message: result.message,
          type: 'error',
          duration: 4000,
        });
      }
    } catch (error) {
      showToast({
        message: 'Failed to apply promo code',
        type: 'error',
        duration: 4000,
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
      
      {/* Header with Amount Display */}
      <LinearGradient 
        colors={['#00C06A', '#00796B']} 
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {

              handlers.handleBackNavigation();
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            accessibilityLabel="Go back to cart"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to shopping cart"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          <ThemedText style={styles.headerTitle}>Checkout</ThemedText>
          
          <View style={styles.coinsDisplay}>
            <Ionicons name="diamond" size={16} color="#FFD700" />
            <ThemedText style={styles.coinsText}>{totalWalletBalance}</ThemedText>
          </View>
        </View>
        
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <ThemedText style={styles.amountText}>₹{(state.billSummary?.totalPayable || 0).toFixed(0)}</ThemedText>
          <View style={styles.cashbackBadge}>
            <ThemedText style={styles.cashbackText}>Cash back 10 %</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stock Warning Banner */}
        {showWarningBanner && validationState.validationResult && validationState.validationResult.issues.length > 0 && (
          <StockWarningBanner
            issues={validationState.validationResult.issues}
            onDismiss={() => setShowWarningBanner(false)}
            onViewDetails={() => setShowValidationModal(true)}
            autoHide={false}
          />
        )}

        {/* Store Confirmation */}
        <View style={styles.storeConfirmation}>
          <ThemedText style={styles.storeWarning}>
            The selected store is 3 km away from your current location. Please confirm.
          </ThemedText>
        </View>

        {/* Card Offers Section */}
        {state.billSummary?.totalPayable && state.billSummary.totalPayable > 0 && (
          <CardOffersSection
            storeId={state.selectedStore?.id || state.selectedStore?._id}
            orderValue={state.billSummary.totalPayable}
            compact={true}
            onOfferApplied={(offer) => {
              // Offer applied - will be handled at payment
              console.log('Card offer applied at checkout:', offer);
            }}
          />
        )}

        {/* Order Items Preview */}
        {productItems.length > 0 && (
          <View style={styles.orderItemsSection}>
            <View style={styles.orderItemsHeader}>
              <ThemedText style={styles.orderItemsTitle}>
                Order Items ({productItems.length})
              </ThemedText>
              <TouchableOpacity onPress={() => router.push('/CartPage')}>
                <ThemedText style={styles.editCartText}>Edit Cart</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.orderItemsScroll}
            >
              {productItems.slice(0, 5).map((item: any, index: number) => (
                <View key={item.id || index} style={styles.orderItemCard}>
                  <View style={styles.orderItemImageContainer}>
                    {item.image ? (
                      <View style={styles.orderItemImagePlaceholder}>
                        <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
                      </View>
                    ) : (
                      <View style={styles.orderItemImagePlaceholder}>
                        <Ionicons name="cube-outline" size={24} color="#9CA3AF" />
                      </View>
                    )}
                    <View style={styles.orderItemQtyBadge}>
                      <ThemedText style={styles.orderItemQtyText}>×{item.quantity}</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.orderItemName} numberOfLines={2}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.orderItemPrice}>
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </ThemedText>
                </View>
              ))}
              {productItems.length > 5 && (
                <TouchableOpacity
                  style={styles.moreItemsCard}
                  onPress={() => router.push('/CartPage')}
                >
                  <ThemedText style={styles.moreItemsText}>
                    +{productItems.length - 5} more
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}

        {/* Apply Promocode Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Apply Promocode</ThemedText>
          
          {state.appliedPromoCode ? (
            <View style={styles.appliedPromoCard}>
              <View style={styles.appliedPromoContent}>
                <Ionicons name="pricetag" size={20} color="#22C55E" />
                <View style={styles.appliedPromoText}>
                  <ThemedText style={styles.appliedPromoTitle}>
                    {state.appliedPromoCode.code} Applied
                  </ThemedText>
                  <ThemedText style={styles.appliedPromoSubtitle}>
                    You saved ₹{(state.billSummary?.promoDiscount || 0).toFixed(0)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.appliedPromoActions}>
                <TouchableOpacity
                  onPress={() => setShowPromoModal(true)}
                  style={styles.changePromoButton}
                >
                  <ThemedText style={styles.changePromoText}>Change</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const removedCode = state.appliedPromoCode?.code;
                    handlers.removePromoCode?.();
                    setTimeout(() => {
                      Alert.alert('Removed!', `${removedCode} promo code removed`);
                    }, 100);
                  }}
                  style={styles.removePromoButton}
                >
                  <Ionicons name="close" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.promoCodeCard}
              onPress={() => setShowPromoModal(true)}
              activeOpacity={0.7}
              accessibilityLabel={`Apply coupon. ${state.availablePromoCodes.length > 0 ? `${state.availablePromoCodes.length} coupons available` : 'Browse available coupons'}`}
              accessibilityRole="button"
              accessibilityHint="Double tap to view and apply discount coupons"
            >
              <View style={styles.promoCodeContent}>
                <View>
                  <ThemedText style={styles.promoCodeTitle}>Apply Coupon</ThemedText>
                  <ThemedText style={styles.promoCodeSubtitle}>
                    {state.availablePromoCodes.length > 0
                      ? `${state.availablePromoCodes.length} coupons available`
                      : 'Browse coupons'
                    }
                  </ThemedText>
                </View>
                <Ionicons name="pricetag" size={20} color="#00C06A" />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Coin Toggles Section - Collapsible */}
          <View style={styles.coinToggles}>
            {/* Collapsible Header */}
            <TouchableOpacity
              style={styles.coinSectionHeader}
              onPress={() => setCoinSectionExpanded(!coinSectionExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.coinSectionHeaderLeft}>
                <Ionicons name="diamond" size={20} color="#00C06A" />
                <View style={styles.coinSectionHeaderText}>
                  <ThemedText style={styles.coinSectionTitle}>Use Your Coins</ThemedText>
                  <ThemedText style={styles.coinSectionSubtitle}>
                    {totalWalletBalance} coins available
                  </ThemedText>
                </View>
              </View>
              <Ionicons
                name={coinSectionExpanded ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#6B7280"
              />
            </TouchableOpacity>

            {/* Coin Options - Only show when expanded */}
            {coinSectionExpanded && (
              <>
            {/* REZ Coin with Slider */}
            <View style={styles.coinSliderCard}>
              <LinearGradient
                colors={['#00C06A', '#00796B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.coinSliderGradient}
              >
                <View style={styles.coinSliderHeader}>
                  <View style={styles.coinHeaderLeft}>
                    <View style={styles.coinTitleRow}>
                      <Ionicons name="diamond" size={20} color="#FFD700" />
                      <ThemedText style={styles.coinTitleWhite}>REZ Coins</ThemedText>
                    </View>
                    <View style={styles.coinAvailableRow}>
                      <ThemedText style={styles.coinAvailableTextWhite}>
                        {state.coinSystem.rezCoin.available} available
                      </ThemedText>
                    </View>
                  </View>
                  {state.coinSystem.rezCoin.used > 0 && (
                    <View style={styles.coinUsedBadgeWhite}>
                      <ThemedText style={styles.coinUsedTextPurple}>
                        {state.coinSystem.rezCoin.used}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.sliderContainerEnhanced}>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, Math.min(
                      state.coinSystem.rezCoin.available,
                      Math.floor(state.billSummary?.totalPayable || 0)
                    ))}
                    value={state.coinSystem.rezCoin.used}
                    onChange={(e) => {
                      const amount = parseInt(e.target.value);
                      if (amount === 0) {
                        handlers.handleCoinToggle('rez', false);
                      } else {
                        handlers.handleCustomCoinAmount('rez', amount);
                      }
                    }}
                    onInput={(e: any) => {
                      const amount = parseInt(e.target.value);
                      if (amount === 0) {
                        handlers.handleCoinToggle('rez', false);
                      } else {
                        handlers.handleCustomCoinAmount('rez', amount);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '12px',
                      borderRadius: '6px',
                      outline: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none',
                      cursor: 'pointer',
                      touchAction: 'none',
                      pointerEvents: 'auto',
                      background: `linear-gradient(to right, #FFFFFF 0%, #FFFFFF ${(state.coinSystem.rezCoin.used / Math.max(1, Math.min(state.coinSystem.rezCoin.available, Math.floor(state.billSummary?.totalPayable || 0)))) * 100}%, rgba(255,255,255,0.3) ${(state.coinSystem.rezCoin.used / Math.max(1, Math.min(state.coinSystem.rezCoin.available, Math.floor(state.billSummary?.totalPayable || 0)))) * 100}%, rgba(255,255,255,0.3) 100%)`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                </View>

                <View style={styles.sliderLabels}>
                  <ThemedText style={styles.sliderLabelTextWhite}>₹0</ThemedText>
                  <ThemedText style={styles.sliderLabelTextWhite}>
                    ₹{Math.min(
                      state.coinSystem.rezCoin.available,
                      Math.floor(state.billSummary?.totalPayable || 0)
                    )}
                  </ThemedText>
                </View>

                {state.coinSystem.rezCoin.used > 0 && (
                  <View style={styles.coinSavingContainerEnhanced}>
                    <View style={styles.savingBadge}>
                      <Ionicons name="gift" size={16} color="#10B981" />
                      <ThemedText style={styles.coinSavingTextEnhanced}>
                        You'll save ₹{state.coinSystem.rezCoin.used} on this order!
                      </ThemedText>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>

            {/* Promo Coin */}
            <View style={styles.coinToggleCard}>
              <View style={styles.coinToggleContent}>
                <View>
                  <ThemedText style={styles.coinToggleTitle}>Promo coin</ThemedText>
                  <ThemedText style={styles.coinToggleSubtitle}>
                    The promo code can be applied for up to 20% off
                  </ThemedText>
                </View>
                <View style={styles.coinToggleRight}>
                  <Switch
                    value={state.coinSystem.promoCoin.used > 0}
                    onValueChange={(value) => handlers.handleCoinToggle('promo', value)}
                    trackColor={{ false: '#E5E7EB', true: '#00C06A' }}
                    thumbColor={'white'}
                    accessibilityLabel="Use promo coins"
                    accessibilityRole="switch"
                    accessibilityHint={`Toggle to ${state.coinSystem.promoCoin.used > 0 ? 'disable' : 'enable'} promo coin discount. ${state.coinSystem.promoCoin.available} coins available`}
                    accessibilityState={{ checked: state.coinSystem.promoCoin.used > 0 }}
                  />
                  <ThemedText style={styles.promoCoinValue}>
                    {state.coinSystem.promoCoin.available}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Store Promo Coin with Slider - Only show if user has coins from this store */}
            {state.coinSystem.storePromoCoin.available > 0 && (
              <View style={styles.coinSliderCard}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.coinSliderGradient}
                >
                  <View style={styles.coinSliderHeader}>
                    <View style={styles.coinHeaderLeft}>
                      <View style={styles.coinTitleRow}>
                        <Ionicons name="storefront" size={20} color="#FFD700" />
                        <ThemedText style={styles.coinTitleWhite}>Store Promo Coins</ThemedText>
                      </View>
                      <View style={styles.coinAvailableRow}>
                        <ThemedText style={styles.coinAvailableTextWhite}>
                          {state.coinSystem.storePromoCoin.available} available • Up to 30%
                        </ThemedText>
                      </View>
                    </View>
                    {state.coinSystem.storePromoCoin.used > 0 && (
                      <View style={styles.coinUsedBadgeWhite}>
                        <ThemedText style={styles.coinUsedTextGreen}>
                          {state.coinSystem.storePromoCoin.used}
                        </ThemedText>
                      </View>
                    )}
                  </View>

                  <View style={styles.sliderContainerEnhanced}>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(1, Math.min(
                        state.coinSystem.storePromoCoin.available,
                        Math.floor((state.billSummary?.totalPayable || 0) * 0.3) // Max 30% of order
                      ))}
                      value={state.coinSystem.storePromoCoin.used}
                      onChange={(e) => {
                        const amount = parseInt(e.target.value);
                        if (amount === 0) {
                          handlers.handleCoinToggle('storePromo', false);
                        } else {
                          handlers.handleCustomCoinAmount('storePromo', amount);
                        }
                      }}
                      onInput={(e: any) => {
                        const amount = parseInt(e.target.value);
                        if (amount === 0) {
                          handlers.handleCoinToggle('storePromo', false);
                        } else {
                          handlers.handleCustomCoinAmount('storePromo', amount);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '12px',
                        borderRadius: '6px',
                        outline: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        appearance: 'none',
                        cursor: 'pointer',
                        touchAction: 'none',
                        pointerEvents: 'auto',
                        background: `linear-gradient(to right, #FFFFFF 0%, #FFFFFF ${(state.coinSystem.storePromoCoin.used / Math.max(1, Math.min(state.coinSystem.storePromoCoin.available, Math.floor((state.billSummary?.totalPayable || 0) * 0.3)))) * 100}%, rgba(255,255,255,0.3) ${(state.coinSystem.storePromoCoin.used / Math.max(1, Math.min(state.coinSystem.storePromoCoin.available, Math.floor((state.billSummary?.totalPayable || 0) * 0.3)))) * 100}%, rgba(255,255,255,0.3) 100%)`,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    />
                  </View>

                  <View style={styles.sliderLabels}>
                    <ThemedText style={styles.sliderLabelTextWhite}>₹0</ThemedText>
                    <ThemedText style={styles.sliderLabelTextWhite}>
                      ₹{Math.min(
                        state.coinSystem.storePromoCoin.available,
                        Math.floor((state.billSummary?.totalPayable || 0) * 0.3)
                      )}
                    </ThemedText>
                  </View>

                  {state.coinSystem.storePromoCoin.used > 0 && (
                    <View style={styles.coinSavingContainerEnhanced}>
                      <View style={styles.savingBadge}>
                        <Ionicons name="gift" size={16} color="#10B981" />
                        <ThemedText style={styles.coinSavingTextEnhanced}>
                          Store exclusive: You'll save ₹{state.coinSystem.storePromoCoin.used}!
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </LinearGradient>
              </View>
            )}
              </>
            )}
          </View>
        </View>

        {/* Services Summary - Only show if there are service items */}
        {hasServiceItems && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Services Booked</ThemedText>
            {serviceItems.map((item: any) => {
              const bookingDetails = item.serviceBookingDetails || {};
              const bookingDate = bookingDetails.bookingDate
                ? new Date(bookingDetails.bookingDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })
                : '';
              const formatTime = (timeStr: string) => {
                if (!timeStr) return '';
                const [hours, minutes] = timeStr.split(':').map(Number);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHour = hours % 12 || 12;
                return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
              };
              const timeSlot = bookingDetails.timeSlot?.start
                ? `${formatTime(bookingDetails.timeSlot.start)}${bookingDetails.timeSlot.end ? ` - ${formatTime(bookingDetails.timeSlot.end)}` : ''}`
                : '';

              return (
                <View key={item.id || item._id} style={styles.serviceCard}>
                  <View style={styles.serviceCardHeader}>
                    <Ionicons name="cut" size={20} color="#00C06A" />
                    <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
                  </View>
                  <View style={styles.serviceDetails}>
                    <View style={styles.serviceDetailRow}>
                      <ThemedText style={styles.serviceDetailIcon}>📅</ThemedText>
                      <ThemedText style={styles.serviceDetailText}>{bookingDate}</ThemedText>
                    </View>
                    <View style={styles.serviceDetailRow}>
                      <ThemedText style={styles.serviceDetailIcon}>🕐</ThemedText>
                      <ThemedText style={styles.serviceDetailText}>{timeSlot}</ThemedText>
                    </View>
                    {bookingDetails.duration && (
                      <View style={styles.serviceDetailRow}>
                        <ThemedText style={styles.serviceDetailIcon}>⏱️</ThemedText>
                        <ThemedText style={styles.serviceDetailText}>{bookingDetails.duration} min</ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.servicePrice}>
                    <ThemedText style={styles.servicePriceText}>₹{(item.price || 0).toLocaleString()}</ThemedText>
                  </View>
                </View>
              );
            })}
            {/* Service payment notice */}
            <View style={styles.serviceNotice}>
              <Ionicons name="information-circle" size={16} color="#F59E0B" />
              <ThemedText style={styles.serviceNoticeText}>
                Service bookings require online payment. Cash on Delivery is not available.
              </ThemedText>
            </View>
          </View>
        )}

        {/* Bill Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bill Summary</ThemedText>
          
          <View style={styles.billSummaryCard}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Item Total</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{(state.billSummary?.itemTotal || 0).toFixed(0)}
              </ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Get & item Total</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{(state.billSummary?.getAndItemTotal || 0).toFixed(0)}
              </ThemedText>
            </View>

            {(state.billSummary?.platformFee || 0) > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Platform Fee</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ₹{(state.billSummary?.platformFee || 0).toFixed(0)}
                </ThemedText>
              </View>
            )}

            {(state.billSummary?.taxes || 0) > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Taxes</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ₹{(state.billSummary?.taxes || 0).toFixed(0)}
                </ThemedText>
              </View>
            )}

            {(state.billSummary?.promoDiscount || 0) > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#22C55E' }]}>
                  Promo Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>
                  -₹{(state.billSummary?.promoDiscount || 0).toFixed(0)}
                </ThemedText>
              </View>
            )}

            {/* Card Offer Discount */}
            {((state as any).appliedCardOffer || (state.billSummary as any)?.cardOfferDiscount) && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#00C06A' }]}>
                  Card Offer Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#00C06A' }]}>
                  -₹{((state.billSummary as any)?.cardOfferDiscount || 0).toFixed(0)}
                </ThemedText>
              </View>
            )}

            {(state.billSummary?.coinDiscount || 0) > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#00C06A' }]}>
                  REZ Coin Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#00C06A' }]}>
                  -₹{(state.billSummary?.coinDiscount || 0).toFixed(0)}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Round off</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{Math.abs(state.billSummary?.roundOff || 0).toFixed(2)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.totalPayableCard}>
            <ThemedText style={styles.totalPayableLabel}>Total payable</ThemedText>
            <ThemedText style={styles.totalPayableValue}>
              ₹{(state.billSummary?.totalPayable || 0).toFixed(0)}
            </ThemedText>
          </View>

          {(state.billSummary?.savings || 0) > 0 && (
            <View style={styles.savingsCard}>
              <ThemedText style={styles.savingsText}>
                🎉 You saved ₹{(state.billSummary?.savings || 0).toFixed(0)} on this order!
              </ThemedText>
            </View>
          )}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Collapsible Payment Section */}
      <View style={styles.paymentBottomSheet}>
        {/* Main Pay Button - Always Visible */}
        <TouchableOpacity
          style={styles.payNowBar}
          onPress={() => setPaymentExpanded(!paymentExpanded)}
          activeOpacity={0.9}
        >
          <View style={styles.payNowLeft}>
            <ThemedText style={styles.payNowAmount}>₹{(state.billSummary?.totalPayable || 0).toFixed(0)}</ThemedText>
            <ThemedText style={styles.payNowLabel}>Total Amount</ThemedText>
          </View>
          <View style={styles.payNowRight}>
            <LinearGradient
              colors={['#00C06A', '#00A05A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.payNowButton}
            >
              <ThemedText style={styles.payNowButtonText}>
                {paymentExpanded ? 'Close' : 'Pay Now'}
              </ThemedText>
              <Ionicons
                name={paymentExpanded ? 'chevron-down' : 'chevron-up'}
                size={18}
                color="white"
              />
            </LinearGradient>
          </View>
        </TouchableOpacity>

        {/* Expandable Payment Options */}
        {paymentExpanded && (
          <View style={styles.paymentOptionsContainer}>
            <View style={styles.paymentDragIndicator} />

            <ThemedText style={styles.paymentOptionsTitle}>Choose Payment Method</ThemedText>

            {/* Quick Pay Options */}
            <View style={styles.quickPayOptions}>
              {/* Wallet */}
              <TouchableOpacity
                style={[
                  styles.quickPayCard,
                  (totalWalletBalance < (state.billSummary?.totalPayable || 0) || !canCheckout) && styles.quickPayDisabled
                ]}
                onPress={() => handlePaymentSelect('wallet')}
                disabled={state.loading || totalWalletBalance < (state.billSummary?.totalPayable || 0) || !canCheckout}
              >
                <View style={[styles.quickPayIcon, { backgroundColor: '#8B5CF6' }]}>
                  <Ionicons name="diamond" size={20} color="white" />
                </View>
                <ThemedText style={styles.quickPayLabel}>Wallet</ThemedText>
                <ThemedText style={styles.quickPayBalance}>{totalWalletBalance} RC</ThemedText>
              </TouchableOpacity>

              {/* COD */}
              <TouchableOpacity
                style={[
                  styles.quickPayCard,
                  (hasServiceItems || !canCheckout) && styles.quickPayDisabled
                ]}
                onPress={() => handlePaymentSelect('cod')}
                disabled={state.loading || !canCheckout || hasServiceItems}
              >
                <View style={[styles.quickPayIcon, { backgroundColor: hasServiceItems ? '#9CA3AF' : '#F59E0B' }]}>
                  <Ionicons name="cash" size={20} color="white" />
                </View>
                <ThemedText style={styles.quickPayLabel}>COD</ThemedText>
                <ThemedText style={styles.quickPayBalance}>{hasServiceItems ? 'N/A' : 'Pay Later'}</ThemedText>
              </TouchableOpacity>
            </View>

            {/* Other Payment Button */}
            <TouchableOpacity
              style={styles.otherPaymentOption}
              onPress={() => handlePaymentSelect('razorpay')}
              activeOpacity={0.7}
            >
              <View style={styles.otherPaymentLeft}>
                <Ionicons name="card-outline" size={22} color="#374151" />
                <View style={styles.otherPaymentText}>
                  <ThemedText style={styles.otherPaymentTitle}>Other Payment Methods</ThemedText>
                  <ThemedText style={styles.otherPaymentSubtitle}>UPI, Credit/Debit Card, Net Banking</ThemedText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#10B981" />
              <ThemedText style={styles.securityText}>100% Secure Payments</ThemedText>
            </View>
          </View>
        )}
      </View>

      {/* Validation Modal */}
      <CartValidation
        visible={showValidationModal}
        validationResult={validationState.validationResult}
        loading={validationState.isValidating}
        onClose={() => setShowValidationModal(false)}
        onContinueToCheckout={handleContinueToCheckout}
        onRemoveInvalidItems={handleRemoveInvalidItems}
        onRefresh={handleRefreshValidation}
      />

      {/* Promo Code Modal */}
      <Modal
        visible={showPromoModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPromoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Apply Promo Code</ThemedText>
              <TouchableOpacity onPress={() => setShowPromoModal(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <TextInput
                style={styles.promoInput}
                placeholder="Enter promo code"
                value={promoCode}
                onChangeText={setPromoCode}
                autoCapitalize="characters"
                autoFocus={true}
              />
              
              <View style={styles.availablePromos}>
                <View style={styles.promoHeaderRow}>
                  <ThemedText style={styles.availablePromosTitle}>Available Coupons:</ThemedText>
                  <TouchableOpacity onPress={() => {
                    setShowPromoModal(false);
                    router.push('/account/coupons');
                  }}>
                    <ThemedText style={styles.viewAllLink}>View All →</ThemedText>
                  </TouchableOpacity>
                </View>
                {state.availablePromoCodes.length === 0 ? (
                  <View style={styles.noCouponsContainer}>
                    <Ionicons name="pricetag-outline" size={48} color="#999" />
                    <ThemedText style={styles.noCouponsText}>No coupons available</ThemedText>
                    <TouchableOpacity
                      style={styles.browseCouponsButton}
                      onPress={() => {
                        setShowPromoModal(false);
                        router.push('/account/coupons');
                      }}
                    >
                      <ThemedText style={styles.browseCouponsText}>Browse Coupons</ThemedText>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <ScrollView 
                    style={styles.promoScrollView}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                  >
                    {state.availablePromoCodes.map((promo) => {
                    const isCurrentlyApplied = state.appliedPromoCode?.code === promo.code;
                    const itemTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
                    const minOrderEligible = itemTotal >= promo.minOrderValue;
                    
                    // Check tier restrictions
                    const requiresTier = promo.title?.toLowerCase().includes('gold') || 
                                        promo.title?.toLowerCase().includes('silver') ||
                                        promo.title?.toLowerCase().includes('platinum');
                    const tierName = promo.title?.match(/(gold|silver|platinum)/i)?.[0] || 'premium';
                    
                    const isEligible = minOrderEligible && !requiresTier; // For now, tier-restricted coupons are not eligible

                    // Calculate discount display
                    const discountDisplay = promo.discountType === 'PERCENTAGE'
                      ? `${promo.discountValue}% OFF`
                      : `₹${promo.discountValue} OFF`;

                    return (
                      <TouchableOpacity
                        key={promo.id}
                        style={[
                          styles.promoOption,
                          isCurrentlyApplied && styles.currentPromoOption,
                          !isEligible && styles.ineligiblePromoOption,
                          applyingPromo && styles.promoOptionDisabled
                        ]}
                        onPress={() => {
                          if (applyingPromo) return; // Prevent multiple clicks
                          if (isEligible) {
                            handleQuickPromoSelect(promo.code);
                          } else if (requiresTier) {
                            showToast({
                              message: `🔒 ${tierName.toUpperCase()} MEMBERS ONLY - Upgrade your membership to unlock this ${promo.discountValue}${promo.discountType === 'PERCENTAGE' ? '%' : '₹'} discount!`,
                              type: 'warning',
                              duration: 4000,
                            });
                          } else {
                            showToast({
                              message: `⚠️ Minimum order value of ₹${promo.minOrderValue} required for this coupon`,
                              type: 'warning',
                              duration: 3000,
                            });
                          }
                        }}
                        activeOpacity={0.7}
                        disabled={applyingPromo}
                      >
                        <View style={styles.promoOptionContent}>
                          <View style={styles.promoDiscountBadge}>
                            <ThemedText style={styles.promoDiscountText}>{discountDisplay}</ThemedText>
                          </View>
                          <View style={styles.promoOptionText}>
                            <ThemedText style={[
                              styles.promoOptionCode,
                              isCurrentlyApplied && styles.currentPromoCode,
                              !isEligible && styles.ineligibleText
                            ]}>
                              {promo.code}
                            </ThemedText>
                            <ThemedText style={[
                              styles.promoOptionDesc,
                              !isEligible && styles.ineligibleText
                            ]}>
                              {promo.description}
                            </ThemedText>
                            {requiresTier && (
                              <View style={styles.tierBadge}>
                                <Ionicons name="lock-closed" size={10} color="#F59E0B" />
                                <ThemedText style={styles.tierBadgeText}>
                                  {tierName.toUpperCase()} MEMBERS ONLY
                                </ThemedText>
                              </View>
                            )}
                            {promo.minOrderValue > 0 && (
                              <ThemedText style={[styles.minOrderText, minOrderEligible && styles.eligibleMinOrder]}>
                                Min order: ₹{promo.minOrderValue}
                              </ThemedText>
                            )}
                          </View>
                          {isCurrentlyApplied && (
                            <View style={styles.appliedBadge}>
                              <Ionicons name="checkmark" size={14} color="white" />
                            </View>
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                  </ScrollView>
                )}
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.applyPromoButton, applyingPromo && styles.applyPromoButtonDisabled]}
                onPress={handleApplyPromoCode}
                activeOpacity={0.8}
                disabled={applyingPromo}
              >
                {applyingPromo ? (
                  <View style={styles.applyPromoLoading}>
                    <ActivityIndicator size="small" color="white" />
                    <ThemedText style={styles.applyPromoText}>Applying...</ThemedText>
                  </View>
                ) : (
                  <ThemedText style={styles.applyPromoText}>Apply Code</ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Order Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContent}>
            {/* Header */}
            <LinearGradient
              colors={['#00C06A', '#00A05A']}
              style={styles.confirmModalHeader}
            >
              <View style={styles.confirmModalHeaderContent}>
                <Ionicons name="checkmark-circle" size={32} color="white" />
                <ThemedText style={styles.confirmModalTitle}>Confirm Order</ThemedText>
              </View>
            </LinearGradient>

            {/* Body */}
            <View style={styles.confirmModalBody}>
              {/* Order Summary */}
              <View style={styles.confirmSummaryCard}>
                <View style={styles.confirmSummaryRow}>
                  <ThemedText style={styles.confirmSummaryLabel}>Items</ThemedText>
                  <ThemedText style={styles.confirmSummaryValue}>
                    {state.items?.length || 0} item{(state.items?.length || 0) !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
                <View style={styles.confirmSummaryRow}>
                  <ThemedText style={styles.confirmSummaryLabel}>Subtotal</ThemedText>
                  <ThemedText style={styles.confirmSummaryValue}>
                    ₹{(state.billSummary?.itemTotal || 0).toFixed(0)}
                  </ThemedText>
                </View>
                {(state.billSummary?.promoDiscount || 0) > 0 && (
                  <View style={styles.confirmSummaryRow}>
                    <ThemedText style={[styles.confirmSummaryLabel, { color: '#22C55E' }]}>
                      Promo Discount
                    </ThemedText>
                    <ThemedText style={[styles.confirmSummaryValue, { color: '#22C55E' }]}>
                      -₹{(state.billSummary?.promoDiscount || 0).toFixed(0)}
                    </ThemedText>
                  </View>
                )}
                {(state.billSummary?.coinDiscount || 0) > 0 && (
                  <View style={styles.confirmSummaryRow}>
                    <ThemedText style={[styles.confirmSummaryLabel, { color: '#00C06A' }]}>
                      Coin Discount
                    </ThemedText>
                    <ThemedText style={[styles.confirmSummaryValue, { color: '#00C06A' }]}>
                      -₹{(state.billSummary?.coinDiscount || 0).toFixed(0)}
                    </ThemedText>
                  </View>
                )}
                <View style={[styles.confirmSummaryRow, styles.confirmTotalRow]}>
                  <ThemedText style={styles.confirmTotalLabel}>Total Amount</ThemedText>
                  <ThemedText style={styles.confirmTotalValue}>
                    ₹{(state.billSummary?.totalPayable || 0).toFixed(0)}
                  </ThemedText>
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.confirmPaymentMethod}>
                <ThemedText style={styles.confirmPaymentLabel}>Payment Method</ThemedText>
                <View style={styles.confirmPaymentBadge}>
                  <Ionicons
                    name={
                      selectedPaymentMethod === 'cod' ? 'cash' :
                      selectedPaymentMethod === 'wallet' ? 'diamond' : 'card'
                    }
                    size={18}
                    color="#00C06A"
                  />
                  <ThemedText style={styles.confirmPaymentValue}>
                    {getPaymentMethodLabel(selectedPaymentMethod)}
                  </ThemedText>
                </View>
              </View>

              {/* Trust Badge */}
              <View style={styles.confirmTrustBadge}>
                <Ionicons name="lock-closed" size={14} color="#6B7280" />
                <ThemedText style={styles.confirmTrustText}>
                  Your payment is secured with 256-bit encryption
                </ThemedText>
              </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.confirmModalFooter}>
              <TouchableOpacity
                style={styles.confirmCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText style={styles.confirmCancelText}>Review Cart</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmPayButton}
                onPress={handleConfirmOrder}
              >
                <LinearGradient
                  colors={['#00C06A', '#00A05A']}
                  style={styles.confirmPayGradient}
                >
                  <ThemedText style={styles.confirmPayText}>
                    Confirm & Pay ₹{(state.billSummary?.totalPayable || 0).toFixed(0)}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Processing Overlay */}
      {processingPayment && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContent}>
            <View style={styles.processingSpinner}>
              <Ionicons name="sync" size={48} color="#00C06A" />
            </View>
            <ThemedText style={styles.processingMessage}>{processingMessage}</ThemedText>
            <ThemedText style={styles.processingWarning}>Please don't close the app</ThemedText>
          </View>
        </View>
      )}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
    minHeight: 40,
    padding: 0,
    position: 'relative',
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
    marginLeft: -40,
  },
  coinsDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  
  // Amount Display
  amountContainer: {
    alignItems: 'center',
  },
  amountText: {
    fontSize: 42,
    fontWeight: '800',
    color: 'white',
    marginBottom: 10,
    letterSpacing: -1,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cashbackText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Store Confirmation
  storeConfirmation: {
    backgroundColor: '#FEF3E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  storeWarning: {
    fontSize: 13,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 18,
  },
  
  // Sections
  section: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  
  // Promo Code Card
  promoCodeCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  promoCodeContent: {
    flex: 1,
  },
  promoCodeTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  promoCodeSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  
  // Coin Toggles
  coinToggles: {
    gap: 12,
  },
  coinSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  coinSectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coinSectionHeaderText: {
    gap: 2,
  },
  coinSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  coinSectionSubtitle: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '500',
  },
  coinToggleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  coinToggleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coinToggleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  customCoinInput: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  coinAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  coinInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  changeAmountButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  changeAmountText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  coinSavingText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  coinToggleSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    maxWidth: width * 0.6,
  },
  coinToggleRight: {
    alignItems: 'center',
    gap: 8,
  },
  coinValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinValueText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  promoCoinValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  // Enhanced Slider Styles
  coinSliderCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  coinSliderGradient: {
    padding: 14,
    borderRadius: 12,
  },
  coinSliderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  coinHeaderLeft: {
    flex: 1,
  },
  coinTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  coinTitleWhite: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  coinAvailableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinAvailableText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  coinAvailableTextWhite: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  coinUsedBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  coinUsedText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  coinUsedBadgeWhite: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  coinUsedTextPurple: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  coinUsedTextGreen: {
    fontSize: 14,
    fontWeight: '700',
    color: '#10B981',
  },
  sliderContainer: {
    marginBottom: 8,
  },
  sliderContainerEnhanced: {
    marginBottom: 10,
    paddingVertical: 6,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  sliderLabelText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  sliderLabelTextWhite: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  coinSavingContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  coinSavingContainerEnhanced: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.25)',
  },
  savingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  coinSavingTextEnhanced: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    flex: 1,
  },
  
  // Bill Summary
  billSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },

  // Total Payable
  totalPayableCard: {
    backgroundColor: '#00C06A',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  totalPayableLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  totalPayableValue: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  
  // Bottom Buttons
  bottomSpace: {
    height: 100, // Reduced since payment is now collapsible
  },

  // Collapsible Payment Bottom Sheet
  paymentBottomSheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
    paddingBottom: 80, // Account for bottom navigation
  },
  payNowBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  payNowLeft: {
    flex: 1,
  },
  payNowAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  payNowLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  payNowRight: {},
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  payNowButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  paymentOptionsContainer: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  paymentDragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  paymentOptionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  quickPayOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  quickPayCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickPayDisabled: {
    opacity: 0.5,
  },
  quickPayIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickPayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  quickPayBalance: {
    fontSize: 11,
    color: '#6B7280',
  },
  otherPaymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  otherPaymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  otherPaymentText: {},
  otherPaymentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  otherPaymentSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  disabledButton: {
    opacity: 0.5,
  },

  // Applied Promo Code
  appliedPromoCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#22C55E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appliedPromoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedPromoText: {
    marginLeft: 12,
    flex: 1,
  },
  appliedPromoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#22C55E',
    marginBottom: 2,
  },
  appliedPromoSubtitle: {
    fontSize: 12,
    color: '#16A34A',
  },
  appliedPromoActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  changePromoButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  changePromoText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  removePromoButton: {
    padding: 4,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  promoInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#111827',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  availablePromos: {
    marginTop: 10,
  },
  promoScrollView: {
    maxHeight: 400,
    marginTop: 12,
  },
  promoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availablePromosTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00C06A',
  },
  noCouponsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCouponsText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 16,
  },
  browseCouponsButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseCouponsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  promoOption: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currentPromoOption: {
    backgroundColor: '#F0FDF4',
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  ineligiblePromoOption: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  promoOptionDisabled: {
    opacity: 0.5,
  },
  promoOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoDiscountBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 70,
    alignItems: 'center',
  },
  promoDiscountText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'white',
  },
  promoOptionText: {
    flex: 1,
  },
  promoOptionCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
    marginBottom: 2,
  },
  currentPromoCode: {
    color: '#22C55E',
  },
  ineligibleText: {
    color: '#9CA3AF',
  },
  promoOptionDesc: {
    fontSize: 12,
    color: '#6B7280',
  },
  minOrderText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
    marginTop: 2,
  },
  eligibleMinOrder: {
    color: '#22C55E',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
    alignSelf: 'flex-start',
    gap: 4,
  },
  tierBadgeText: {
    fontSize: 10,
    color: '#F59E0B',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  appliedBadge: {
    backgroundColor: '#22C55E',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  applyPromoButton: {
    backgroundColor: '#00C06A',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyPromoButtonDisabled: {
    backgroundColor: '#86EFAC',
  },
  applyPromoLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  applyPromoText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Savings Card
  savingsCard: {
    backgroundColor: '#FEF3E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  savingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706',
    textAlign: 'center',
  },

  // Service Card Styles
  serviceCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  serviceCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  serviceDetails: {
    gap: 6,
    marginBottom: 12,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  serviceDetailIcon: {
    fontSize: 14,
    width: 20,
  },
  serviceDetailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  servicePrice: {
    borderTopWidth: 1,
    borderTopColor: '#BBF7D0',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  servicePriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
  },
  serviceNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3E2',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  serviceNoticeText: {
    fontSize: 13,
    color: '#92400E',
    flex: 1,
    lineHeight: 18,
  },

  // Disabled states for COD
  disabledText: {
    color: '#9CA3AF',
  },
  disabledBadge: {
    backgroundColor: '#E5E7EB',
  },
  disabledBadgeText: {
    color: '#9CA3AF',
  },

  // Order Items Preview Section
  orderItemsSection: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 8,
  },
  orderItemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  orderItemsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  editCartText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00C06A',
  },
  orderItemsScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  orderItemCard: {
    width: 100,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
  },
  orderItemImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  orderItemImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderItemQtyBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#00C06A',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  orderItemQtyText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  orderItemName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 14,
  },
  orderItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#00C06A',
  },
  moreItemsCard: {
    width: 80,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderStyle: 'dashed',
  },
  moreItemsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },

  // Order Confirmation Modal Styles
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  confirmModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  confirmModalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  confirmModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confirmModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  confirmModalBody: {
    padding: 20,
  },
  confirmSummaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  confirmSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  confirmSummaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmSummaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  confirmTotalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
  },
  confirmTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  confirmTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#00C06A',
  },
  confirmPaymentMethod: {
    marginBottom: 16,
  },
  confirmPaymentLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  confirmPaymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  confirmPaymentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#00C06A',
  },
  confirmTrustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  confirmTrustText: {
    fontSize: 12,
    color: '#6B7280',
  },
  confirmModalFooter: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  confirmCancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  confirmCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmPayButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmPayGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmPayText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },

  // Processing Overlay Styles
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  processingContent: {
    alignItems: 'center',
    padding: 32,
  },
  processingSpinner: {
    marginBottom: 24,
  },
  processingMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  processingWarning: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});