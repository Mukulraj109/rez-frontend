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

const { width } = Dimensions.get('window');

export default function CheckoutPage() {
  const router = useRouter();
  const { state, handlers } = useCheckout();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCode, setPromoCode] = useState('');

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
    console.log('✅ [CHECKOUT] Page loaded, validating cart...');
    validateCart();
  }, []);

  // Show validation modal if critical issues found
  useEffect(() => {
    if (validationState.validationResult && errorCount > 0) {
      console.log('⚠️ [CHECKOUT] Critical validation issues found, showing modal');
      setShowValidationModal(true);
    }
  }, [errorCount, validationState.validationResult]);

  const handleContinueToCheckout = () => {
    console.log('✅ [CHECKOUT] Continue after validation');
    setShowValidationModal(false);
  };

  const handleRemoveInvalidItems = async () => {
    console.log('🗑️ [CHECKOUT] Removing invalid items');
    await removeInvalidItems();
    setShowValidationModal(false);
  };

  const handleRefreshValidation = async () => {
    console.log('🔄 [CHECKOUT] Refreshing validation');
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
        Alert.alert('Error', state.error);
      } else if (state.appliedPromoCode) {
        const message = previousPromo 
          ? `${previousPromo.code} replaced with ${state.appliedPromoCode.code}!`
          : `${state.appliedPromoCode.code} applied successfully!`;
        Alert.alert('Success!', message);
      }
    }, 500);
  };

  const handleQuickPromoSelect = (selectedPromoCode: string) => {
    const previousPromo = state.appliedPromoCode;
    handlers.handlePromoCodeApply(selectedPromoCode);
    setShowPromoModal(false);
    
    setTimeout(() => {
      if (state.error) {
        Alert.alert('Error', state.error);
      } else if (state.appliedPromoCode) {
        const message = previousPromo 
          ? `${previousPromo.code} replaced with ${selectedPromoCode}!`
          : `${selectedPromoCode} applied successfully!`;
        Alert.alert('Success!', message);
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
              console.log('🔵 Checkout back arrow clicked!');
              handlers.handleBackNavigation();
            }}
            activeOpacity={0.8}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
          <ThemedText style={styles.amountText}>₹100</ThemedText>
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
                    You saved ₹{state.billSummary.promoDiscount}
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
            {/* REZ Coin */}
            <View style={styles.coinToggleCard}>
              <View style={styles.coinToggleContent}>
                <View>
                  <ThemedText style={styles.coinToggleTitle}>REZ coins</ThemedText>
                  <ThemedText style={styles.coinToggleSubtitle}>
                    1 Rupee is equal to 1 REZ Coin
                  </ThemedText>
                </View>
                <View style={styles.coinToggleRight}>
                  <Switch
                    value={state.coinSystem.wasilCoin.used > 0}
                    onValueChange={(value) => handlers.handleCoinToggle('wasil', value)}
                    trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                    thumbColor={'white'}
                  />
                  <View style={styles.coinValue}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                    <ThemedText style={styles.coinValueText}>
                      {state.coinSystem.wasilCoin.available}
                    </ThemedText>
                  </View>
                </View>
              </View>
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
                  />
                  <ThemedText style={styles.promoCoinValue}>
                    {state.coinSystem.promoCoin.available}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Bill Summary */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bill Summary</ThemedText>
          
          <View style={styles.billSummaryCard}>
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Item Total</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{state.billSummary.itemTotal.toFixed(0)}
              </ThemedText>
            </View>
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Get & item Total</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{state.billSummary.getAndItemTotal.toFixed(0)}
              </ThemedText>
            </View>

            {state.billSummary.platformFee > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Platform Fee</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ₹{state.billSummary.platformFee.toFixed(0)}
                </ThemedText>
              </View>
            )}

            {state.billSummary.taxes > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Taxes</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  ₹{state.billSummary.taxes.toFixed(0)}
                </ThemedText>
              </View>
            )}

            {state.billSummary.promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#22C55E' }]}>
                  Promo Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>
                  -₹{state.billSummary.promoDiscount.toFixed(0)}
                </ThemedText>
              </View>
            )}

            {state.billSummary.coinDiscount > 0 && (
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: '#8B5CF6' }]}>
                  REZ Coin Discount
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>
                  -₹{state.billSummary.coinDiscount.toFixed(0)}
                </ThemedText>
              </View>
            )}
            
            <View style={styles.summaryRow}>
              <ThemedText style={styles.summaryLabel}>Round off</ThemedText>
              <ThemedText style={styles.summaryValue}>
                ₹{Math.abs(state.billSummary.roundOff).toFixed(2)}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.totalPayableCard}>
            <ThemedText style={styles.totalPayableLabel}>Total payable</ThemedText>
            <ThemedText style={styles.totalPayableValue}>
              ₹{state.billSummary.totalPayable.toFixed(0)}
            </ThemedText>
          </View>

          {state.billSummary.savings > 0 && (
            <View style={styles.savingsCard}>
              <ThemedText style={styles.savingsText}>
                🎉 You saved ₹{state.billSummary.savings} on this order!
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
        >
          <ThemedText style={styles.otherPaymentText}>Other payment mode</ThemedText>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.loadWalletButton,
            (state.loading || totalWalletBalance < state.billSummary.totalPayable || !canCheckout) && styles.disabledButton
          ]}
          onPress={handlers.handleWalletPayment}
          activeOpacity={0.7}
          disabled={state.loading || totalWalletBalance < state.billSummary.totalPayable || !canCheckout}
        >
          <ThemedText style={styles.loadWalletText}>
            {state.loading ? 'Processing...' : !canCheckout ? 'Cart has issues' : 'Load wallet & pay'}
          </ThemedText>
          <View style={styles.walletBalanceChip}>
            <Ionicons name="diamond" size={12} color="#FFD700" />
            <ThemedText style={styles.walletBalanceText}>Bal RC {totalWalletBalance}</ThemedText>
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
                  <ThemedText style={styles.availablePromosTitle}>My Coupons:</ThemedText>
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
                  state.availablePromoCodes.slice(0, 4).map((promo) => {
                    const isCurrentlyApplied = state.appliedPromoCode?.code === promo.code;
                    const itemTotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
                    const isEligible = itemTotal >= promo.minOrderValue;

                    // Calculate discount display
                    const discountDisplay = promo.discountType === 'PERCENTAGE'
                      ? `${promo.discount}% OFF`
                      : `₹${promo.discount} OFF`;

                    return (
                      <TouchableOpacity
                        key={promo.id}
                        style={[
                          styles.promoOption,
                          isCurrentlyApplied && styles.currentPromoOption,
                          !isEligible && styles.ineligiblePromoOption
                        ]}
                        onPress={() => isEligible ? handleQuickPromoSelect(promo.code) : null}
                        disabled={!isEligible}
                        activeOpacity={isEligible ? 0.7 : 1}
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
                            {promo.minOrderValue > 0 && (
                              <ThemedText style={[styles.minOrderText, isEligible && styles.eligibleMinOrder]}>
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
                  })
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