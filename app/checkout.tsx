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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartValidation } from '@/hooks/useCartValidation';
import StockWarningBanner from '@/components/cart/StockWarningBanner';
import CartValidation from '@/components/cart/CartValidation';
import { showToast } from '@/components/common/ToastManager';

const { width } = Dimensions.get('window');

export default function CheckoutPage() {
  const router = useRouter();
  // Destructure checkout hook return values
  const { state, handlers, paybillBalance } = useCheckout();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [customCoinAmount, setCustomCoinAmount] = useState('');

  // Cart validation state
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(true);

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
  const totalWalletBalance = state.coinSystem.wasilCoin.available + state.coinSystem.promoCoin.available;

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

  const handleApplyPromoCode = () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }
    
    const previousPromo = state.appliedPromoCode;
    handlers.handlePromoCodeApply(promoCode.trim().toUpperCase());
    setPromoCode('');
    setShowPromoModal(false);
    
    // Show success or error after API call
    setTimeout(() => {
      if (state.error) {
        showToast({
          message: state.error,
          type: 'error',
          duration: 4000,
        });
      } else if (state.appliedPromoCode) {
        const message = previousPromo 
          ? `${previousPromo.code} replaced with ${state.appliedPromoCode.code}!`
          : `${state.appliedPromoCode.code} applied successfully!`;
        showToast({
          message: message,
          type: 'success',
          duration: 3000,
        });
      }
    }, 500);
  };

  const handleQuickPromoSelect = (selectedPromoCode: string) => {
    const previousPromo = state.appliedPromoCode;
    handlers.handlePromoCodeApply(selectedPromoCode);
    setShowPromoModal(false);
    
    setTimeout(() => {
      if (state.error) {
        showToast({
          message: state.error,
          type: 'error',
          duration: 4000,
        });
      } else if (state.appliedPromoCode) {
        const message = previousPromo 
          ? `${previousPromo.code} replaced with ${selectedPromoCode}!`
          : `${selectedPromoCode} applied successfully!`;
        showToast({
          message: message,
          type: 'success',
          duration: 3000,
        });
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header with Amount Display */}
      <LinearGradient 
        colors={['#8B5CF6', '#7C3AED']} 
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
                <Ionicons name="pricetag" size={20} color="#8B5CF6" />
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}

          {/* Coin Toggles */}
          <View style={styles.coinToggles}>
            {/* REZ Coin with Slider */}
            <View style={styles.coinSliderCard}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
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
                        {state.coinSystem.wasilCoin.available} available
                      </ThemedText>
                    </View>
                  </View>
                  {state.coinSystem.wasilCoin.used > 0 && (
                    <View style={styles.coinUsedBadgeWhite}>
                      <ThemedText style={styles.coinUsedTextPurple}>
                        {state.coinSystem.wasilCoin.used}
                      </ThemedText>
                    </View>
                  )}
                </View>

                <View style={styles.sliderContainerEnhanced}>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(1, Math.min(
                      state.coinSystem.wasilCoin.available,
                      Math.floor(state.billSummary?.totalPayable || 0)
                    ))}
                    value={state.coinSystem.wasilCoin.used}
                    onChange={(e) => {
                      const amount = parseInt(e.target.value);
                      if (amount === 0) {
                        handlers.handleCoinToggle('wasil', false);
                      } else {
                        handlers.handleCustomCoinAmount('wasil', amount);
                      }
                    }}
                    onInput={(e: any) => {
                      const amount = parseInt(e.target.value);
                      if (amount === 0) {
                        handlers.handleCoinToggle('wasil', false);
                      } else {
                        handlers.handleCustomCoinAmount('wasil', amount);
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
                      background: `linear-gradient(to right, #FFFFFF 0%, #FFFFFF ${(state.coinSystem.wasilCoin.used / Math.max(1, Math.min(state.coinSystem.wasilCoin.available, Math.floor(state.billSummary?.totalPayable || 0)))) * 100}%, rgba(255,255,255,0.3) ${(state.coinSystem.wasilCoin.used / Math.max(1, Math.min(state.coinSystem.wasilCoin.available, Math.floor(state.billSummary?.totalPayable || 0)))) * 100}%, rgba(255,255,255,0.3) 100%)`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  />
                </View>

                <View style={styles.sliderLabels}>
                  <ThemedText style={styles.sliderLabelTextWhite}>₹0</ThemedText>
                  <ThemedText style={styles.sliderLabelTextWhite}>
                    ₹{Math.min(
                      state.coinSystem.wasilCoin.available,
                      Math.floor(state.billSummary?.totalPayable || 0)
                    )}
                  </ThemedText>
                </View>

                {state.coinSystem.wasilCoin.used > 0 && (
                  <View style={styles.coinSavingContainerEnhanced}>
                    <View style={styles.savingBadge}>
                      <Ionicons name="gift" size={16} color="#10B981" />
                      <ThemedText style={styles.coinSavingTextEnhanced}>
                        You'll save ₹{state.coinSystem.wasilCoin.used} on this order!
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
                    trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
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
          </View>
        </View>

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

            {(state.billSummary?.coinDiscount || 0) > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#8B5CF6' }]}>
                  REZ Coin Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>
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

      {/* Bottom Payment Buttons */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={styles.otherPaymentButton}
          onPress={handlers.navigateToOtherPaymentMethods}
          activeOpacity={0.7}
          accessibilityLabel="Other payment methods"
          accessibilityRole="button"
          accessibilityHint="Double tap to view alternative payment options like credit card, UPI, or net banking"
        >
          <ThemedText style={styles.otherPaymentText}>Other payment mode</ThemedText>
        </TouchableOpacity>

        {/* PayBill Payment Button */}
        <TouchableOpacity
          style={[
            styles.paybillButton,
            (state.loading || paybillBalance < (state.billSummary?.totalPayable || 0) || !canCheckout) && styles.disabledButton
          ]}
          onPress={handlers.handlePayBillPayment}
          activeOpacity={0.7}
          disabled={state.loading || paybillBalance < (state.billSummary?.totalPayable || 0) || !canCheckout}
          accessibilityLabel={state.loading
            ? 'Processing payment'
            : !canCheckout
              ? 'Cannot checkout, cart has issues'
              : paybillBalance < (state.billSummary?.totalPayable || 0)
                ? `Insufficient PayBill balance. You have ₹${paybillBalance} but need ₹${state.billSummary?.totalPayable || 0}`
                : `Pay ₹${state.billSummary?.totalPayable || 0} with PayBill. Your balance is ₹${paybillBalance}`}
          accessibilityRole="button"
          accessibilityHint="Double tap to complete payment using your PayBill wallet"
          accessibilityState={{ disabled: state.loading || paybillBalance < (state.billSummary?.totalPayable || 0) || !canCheckout, busy: state.loading }}
        >
          <View style={styles.paybillButtonContent}>
            <Ionicons name="wallet" size={20} color="white" />
            <ThemedText style={styles.paybillButtonText}>
              {state.loading
                ? 'Processing...'
                : !canCheckout
                  ? 'Cart has issues'
                  : paybillBalance < (state.billSummary?.totalPayable || 0)
                    ? 'Insufficient PayBill balance'
                    : 'Pay with PayBill'}
            </ThemedText>
          </View>
          <View style={styles.paybillBalanceChip}>
            <ThemedText style={styles.paybillBalanceText}>₹{paybillBalance}</ThemedText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.loadWalletButton,
            (state.loading || totalWalletBalance < (state.billSummary?.totalPayable || 0) || !canCheckout) && styles.disabledButton
          ]}
          onPress={handlers.handleWalletPayment}
          activeOpacity={0.7}
          disabled={state.loading || totalWalletBalance < (state.billSummary?.totalPayable || 0) || !canCheckout}
          accessibilityLabel={state.loading
            ? 'Processing payment'
            : !canCheckout
              ? 'Cannot checkout, cart has issues'
              : totalWalletBalance < (state.billSummary?.totalPayable || 0)
                ? `Insufficient wallet balance. You have ${totalWalletBalance} coins but need ₹${state.billSummary?.totalPayable || 0}`
                : `Load wallet and pay ₹${state.billSummary?.totalPayable || 0}. You have ${totalWalletBalance} REZ coins`}
          accessibilityRole="button"
          accessibilityHint="Double tap to load your wallet and complete payment"
          accessibilityState={{ disabled: state.loading || totalWalletBalance < (state.billSummary?.totalPayable || 0) || !canCheckout, busy: state.loading }}
        >
          <ThemedText style={styles.loadWalletText}>
            {state.loading ? 'Processing...' : !canCheckout ? 'Cart has issues' : 'Load wallet & pay'}
          </ThemedText>
          <View style={styles.walletBalanceChip}>
            <Ionicons name="diamond" size={12} color="#FFD700" />
            <ThemedText style={styles.walletBalanceText}>Bal RC {totalWalletBalance}</ThemedText>
          </View>
        </TouchableOpacity>

        {/* Cash on Delivery (COD) Button */}
        <TouchableOpacity
          style={[
            styles.codButton,
            (state.loading || !canCheckout) && styles.disabledButton
          ]}
          onPress={handlers.handleCODPayment}
          activeOpacity={0.7}
          disabled={state.loading || !canCheckout}
          accessibilityLabel={state.loading
            ? 'Processing order'
            : !canCheckout
              ? 'Cannot checkout, cart has issues'
              : `Place order with Cash on Delivery for ₹${state.billSummary?.totalPayable || 0}. Pay at home when your order arrives`}
          accessibilityRole="button"
          accessibilityHint="Double tap to place order and pay cash upon delivery"
          accessibilityState={{ disabled: state.loading || !canCheckout, busy: state.loading }}
        >
          <View style={styles.codButtonContent}>
            <Ionicons name="cash-outline" size={20} color="#10B981" />
            <ThemedText style={styles.codButtonText}>
              {state.loading ? 'Processing...' : !canCheckout ? 'Cart has issues' : 'Cash on Delivery'}
            </ThemedText>
          </View>
          <View style={styles.codBadge}>
            <ThemedText style={styles.codBadgeText}>Pay at home</ThemedText>
          </View>
        </TouchableOpacity>
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
                          !isEligible && styles.ineligiblePromoOption
                        ]}
                        onPress={() => {
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
                style={styles.applyPromoButton}
                onPress={handleApplyPromoCode}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.applyPromoText}>Apply Code</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
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
    fontSize: 48,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cashbackText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
    backgroundColor: '#8B5CF6',
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
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  coinSliderGradient: {
    padding: 16,
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
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  
  // Total Payable
  totalPayableCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalPayableLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  totalPayableValue: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  
  // Bottom Buttons
  bottomSpace: {
    height: 120,
  },
  bottomButtonsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 12,
  },
  otherPaymentButton: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  otherPaymentText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  loadWalletButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  loadWalletText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  walletBalanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  walletBalanceText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  
  // COD Button
  codButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#10B981',
    marginTop: 12,
  },
  codButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  codBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  codBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#10B981',
  },
  
  disabledButton: {
    opacity: 0.5,
  },

  // PayBill Button
  paybillButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paybillButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  paybillButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flexShrink: 1,
  },
  paybillBalanceChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  paybillBalanceText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
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
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
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
  promoOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promoDiscountBadge: {
    backgroundColor: '#8B5CF6',
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
    color: '#8B5CF6',
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
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
});