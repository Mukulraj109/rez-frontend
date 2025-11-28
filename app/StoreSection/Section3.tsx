import React, { useState, useEffect, memo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, Animated, Modal, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import discountsApi, { Discount } from '@/services/discountsApi';
import { useCart } from '@/contexts/CartContext';
import { platformAlert } from '@/utils/platformAlert';
import { RetryButton } from '@/components/common/RetryButton';
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  IconSize,
  Timing,
} from '@/constants/DesignSystem';

interface Section3Props {
  productPrice?: number;
  storeId?: string;
}

export default memo(function Section3({ productPrice = 1000, storeId }: Section3Props) {
  const { actions: cartActions } = useCart();
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Animation refs for micro-interactions
  const cardScaleAnim = useRef(new Animated.Value(1)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  useEffect(() => {
    fetchDiscounts();
  }, [productPrice, storeId]); // Phase 2: Add storeId dependency

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Phase 2: Pass storeId to API for store-specific filtering
      const response = await discountsApi.getBillPaymentDiscounts(productPrice, storeId);

      if (response.success && response.data && response.data.length > 0) {
        setDiscount(response.data[0]);
      } else {
        setDiscount(null);
      }
    } catch (error) {
      setError('Unable to load discounts');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!discount) {
      platformAlert('Error', 'Discount information is not available. Please try again later.');
      return;
    }

    // Check if discount is still valid
    const now = new Date();
    const validFrom = new Date(discount.validFrom);
    const validUntil = new Date(discount.validUntil);

    if (now < validFrom) {
      platformAlert(
        'Not Available Yet',
        `This discount will be available from ${validFrom.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        })}.`
      );
      return;
    }

    if (now > validUntil) {
      platformAlert('Expired', 'This discount has expired.');
      return;
    }

    if (!discount.isActive) {
      platformAlert('Unavailable', 'This discount is currently not active.');
      return;
    }

    // Haptic feedback on button press
    triggerImpact('Medium');

    try {
      setIsApplying(true);

      // Apply discount to cart using CartContext
      if (discount.code) {
        // If discount has a code, use it as a coupon
        // Check if cartActions and applyCoupon method exist to prevent crashes
        if (!cartActions || typeof cartActions.applyCoupon !== 'function') {
          throw new Error('Cart actions not available. Please ensure you are logged in.');
        }

        try {
          await cartActions.applyCoupon(discount.code);

          // Success haptic feedback
          triggerNotification('Success');

          // Success - show confirmation with more details
          const discountAmount = discount.type === 'percentage' 
            ? `${discount.value}%` 
            : `₹${discount.value}`;
          
          platformAlert(
            'Discount Applied!',
            `${discount.name} has been successfully applied to your cart. You'll save ${discountAmount} on your order!`
          );
          
          // Close modals
          setShowDetails(false);
          setShowDetailsModal(false);
        } catch (couponError: any) {
          // Error haptic feedback
          triggerNotification('Error');
          
          // Provide more specific error messages
          let errorMessage = 'Unable to apply discount. Please try again.';
          
          if (couponError?.message) {
            errorMessage = couponError.message;
          } else if (couponError?.response?.data?.message) {
            errorMessage = couponError.response.data.message;
          }
          
          platformAlert('Error', errorMessage);
        }
      } else {
        // For discounts without codes, they're auto-applied at checkout
        // But we should still validate eligibility
        if (productPrice && productPrice < discount.minOrderValue) {
          platformAlert(
            'Minimum Order Required',
            `This discount requires a minimum order of ₹${discount.minOrderValue}. Your current order value is ₹${productPrice}.`
          );
          setIsApplying(false);
          return;
        }

        // Info haptic feedback
        triggerNotification('Success');
        platformAlert(
          'Discount Available',
          `This discount will be automatically applied when your order value reaches ₹${discount.minOrderValue} or more.`
        );
        setShowDetails(false);
        setShowDetailsModal(false);
      }
    } catch (error: any) {
      // Error haptic feedback
      triggerNotification('Error');
      
      console.error('[Section3] Error applying discount:', error);
      
      const errorMessage = error?.message || error?.response?.data?.message || 'Unable to apply discount. Please try again.';
      platformAlert('Error', errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const displayText = discount?.metadata?.displayText || discount?.name || 'Get Instant Discount';
  const discountText = discount
    ? `${discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value} Off${discount.applicableOn === 'bill_payment' ? ' on bill payment' : ''}`
    : '10% Off on bill payment';

  // Handle card press with haptic feedback
  const handleCardPress = () => {
    if (!discount) return;

    triggerImpact('Light');

    setShowDetails(!showDetails);
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Discount offer section"
    >
      {/* Compact Card */}
      <Animated.View style={{ transform: [{ scale: cardScaleAnim }] }}>
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={handleCardPress}
          onPressIn={() => animateScale(cardScaleAnim, 0.96)}
          onPressOut={() => animateScale(cardScaleAnim, 1)}
          accessibilityRole="button"
          accessibilityLabel={`${displayText}. ${discountText}${showDetails ? '. Expanded' : ''}`}
          accessibilityHint={discount ? `Double tap to ${showDetails ? 'collapse' : 'expand'} discount details` : 'Discount not available'}
          accessibilityState={{ disabled: !discount, expanded: showDetails }}
        >
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>{displayText}</ThemedText>
          {loading ? (
            <ActivityIndicator size="small" color={Colors.gray[600]} />
          ) : error ? (
            <>
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <RetryButton
                onRetry={fetchDiscounts}
                label="Retry"
                variant="ghost"
                size="small"
                style={{ marginTop: 8, alignSelf: 'flex-start' }}
              />
            </>
          ) : (
            <ThemedText style={styles.subtitle}>{discountText}</ThemedText>
          )}
        </View>

        <View style={styles.badge} accessibilityElementsHidden>
          <ThemedText style={styles.badgeIcon}>⚡</ThemedText>
        </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Detailed Discount Card - Shown when expanded */}
      {showDetails && discount && (
        <View style={styles.detailsCard}>
          {/* Save Badge */}
          <View style={styles.saveBadge}>
            <ThemedText style={styles.saveBadgeText}>
              Save {discount.type === 'percentage' ? discount.value + '%' : '₹' + discount.value}
            </ThemedText>
          </View>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="flash" size={IconSize.lg} color="#F59E0B" />
          </View>

          {/* Title */}
          <ThemedText style={styles.detailsTitle}>{discount.name}</ThemedText>

          {/* Minimum Bill */}
          <View style={styles.minimumBillRow}>
            <ThemedText style={styles.minimumBillLabel}>Minimum bill:</ThemedText>
            <ThemedText style={styles.minimumBillValue}>₹{discount.minOrderValue || 0}</ThemedText>
          </View>

          {/* Info Row */}
          <View style={styles.infoRow}>
            {discount.restrictions?.isOfflineOnly && (
              <>
                <Ionicons name="storefront-outline" size={IconSize.sm} color={Colors.primary[600]} />
                <ThemedText style={styles.infoText}>Offline Only</ThemedText>
                <View style={styles.dividerVertical} />
              </>
            )}
            <TouchableOpacity
              style={styles.moreDetailsButton}
              onPress={() => {
                triggerImpact('Light');
                setShowDetailsModal(true);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="View more discount details"
            >
              <ThemedText style={styles.moreDetailsText}>More details</ThemedText>
              <Ionicons name="information-circle-outline" size={IconSize.sm} color={Colors.primary[600]} style={styles.infoIcon} />
            </TouchableOpacity>
          </View>

          {/* Restrictions */}
          <View style={styles.restrictionsContainer}>
            {discount.restrictions?.notValidAboveStoreDiscount && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>Not valid above store discount</ThemedText>
              </View>
            )}
            {discount.restrictions?.singleVoucherPerBill && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>Single voucher per bill</ThemedText>
              </View>
            )}
            {discount.usageLimitPerUser && (
              <View style={styles.restrictionRow}>
                <View style={styles.bulletPoint} />
                <ThemedText style={styles.restrictionText}>
                  Limited to {discount.usageLimitPerUser} use{discount.usageLimitPerUser > 1 ? 's' : ''} per user
                </ThemedText>
              </View>
            )}
          </View>

          {/* Add Button */}
          <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
            <TouchableOpacity
              style={styles.addButtonWrapper}
              activeOpacity={0.8}
              onPress={handleApplyDiscount}
              onPressIn={() => animateScale(buttonScaleAnim, 0.96)}
              onPressOut={() => animateScale(buttonScaleAnim, 1)}
              disabled={isApplying}
              accessibilityRole="button"
              accessibilityLabel={`Apply ${discount.name} discount`}
              accessibilityHint="Double tap to add this discount to your order"
              accessibilityState={{ disabled: isApplying, busy: isApplying }}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.addButton, isApplying && styles.addButtonDisabled]}
              >
                <ThemedText style={styles.addButtonText}>
                  {isApplying ? 'Applying...' : 'Add'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      <View style={styles.divider} />

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Discount Details</ThemedText>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalCloseButton}
                accessibilityLabel="Close modal"
              >
                <Ionicons name="close" size={24} color={Colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {discount && (
                <>
                  {/* Discount Title */}
                  <View style={styles.modalDiscountHeader}>
                    <View style={styles.modalIconContainer}>
                      <Ionicons name="flash" size={32} color="#F59E0B" />
                    </View>
                    <ThemedText style={styles.modalDiscountTitle}>{discount.name}</ThemedText>
                    {discount.description && (
                      <ThemedText style={styles.modalDiscountDescription}>{discount.description}</ThemedText>
                    )}
                  </View>

                  {/* Discount Value */}
                  <View style={styles.modalInfoCard}>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>Discount Value:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                      </ThemedText>
                    </View>
                    {discount.maxDiscountAmount && (
                      <View style={styles.modalInfoRow}>
                        <ThemedText style={styles.modalInfoLabel}>Maximum Discount:</ThemedText>
                        <ThemedText style={styles.modalInfoValue}>₹{discount.maxDiscountAmount}</ThemedText>
                      </View>
                    )}
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>Minimum Order:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>₹{discount.minOrderValue || 0}</ThemedText>
                    </View>
                  </View>

                  {/* Validity */}
                  <View style={styles.modalInfoCard}>
                    <ThemedText style={styles.modalSectionTitle}>Validity</ThemedText>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>Valid From:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {new Date(discount.validFrom).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </ThemedText>
                    </View>
                    <View style={styles.modalInfoRow}>
                      <ThemedText style={styles.modalInfoLabel}>Valid Until:</ThemedText>
                      <ThemedText style={styles.modalInfoValue}>
                        {new Date(discount.validUntil).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Restrictions */}
                  {(discount.restrictions || discount.usageLimitPerUser) && (
                    <View style={styles.modalInfoCard}>
                      <ThemedText style={styles.modalSectionTitle}>Terms & Conditions</ThemedText>
                      {discount.restrictions?.isOfflineOnly && (
                        <View style={styles.modalRestrictionRow}>
                          <Ionicons name="storefront-outline" size={16} color={Colors.primary[600]} />
                          <ThemedText style={styles.modalRestrictionText}>Available for offline purchases only</ThemedText>
                        </View>
                      )}
                      {discount.restrictions?.notValidAboveStoreDiscount && (
                        <View style={styles.modalRestrictionRow}>
                          <Ionicons name="alert-circle-outline" size={16} color={Colors.gray[600]} />
                          <ThemedText style={styles.modalRestrictionText}>Not valid with other store discounts</ThemedText>
                        </View>
                      )}
                      {discount.restrictions?.singleVoucherPerBill && (
                        <View style={styles.modalRestrictionRow}>
                          <Ionicons name="receipt-outline" size={16} color={Colors.gray[600]} />
                          <ThemedText style={styles.modalRestrictionText}>One voucher per bill</ThemedText>
                        </View>
                      )}
                      {discount.usageLimitPerUser && (
                        <View style={styles.modalRestrictionRow}>
                          <Ionicons name="person-outline" size={16} color={Colors.gray[600]} />
                          <ThemedText style={styles.modalRestrictionText}>
                            Limited to {discount.usageLimitPerUser} use{discount.usageLimitPerUser > 1 ? 's' : ''} per user
                          </ThemedText>
                        </View>
                      )}
                      {discount.usageLimit && (
                        <View style={styles.modalRestrictionRow}>
                          <Ionicons name="people-outline" size={16} color={Colors.gray[600]} />
                          <ThemedText style={styles.modalRestrictionText}>
                            Total usage limit: {discount.usageLimit} ({discount.usedCount || 0} used)
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Applicable On */}
                  <View style={styles.modalInfoCard}>
                    <ThemedText style={styles.modalSectionTitle}>Applicable On</ThemedText>
                    <ThemedText style={styles.modalInfoValue}>
                      {discount.applicableOn === 'bill_payment' ? 'Bill Payment' :
                       discount.applicableOn === 'all' ? 'All Products' :
                       discount.applicableOn === 'specific_products' ? 'Specific Products' :
                       discount.applicableOn === 'specific_categories' ? 'Specific Categories' :
                       discount.applicableOn}
                    </ThemedText>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalApplyButton}
                onPress={() => {
                  setShowDetailsModal(false);
                  handleApplyDiscount();
                }}
                disabled={isApplying}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalApplyButtonGradient}
                >
                  <ThemedText style={styles.modalApplyButtonText}>
                    {isApplying ? 'Applying...' : 'Apply Discount'}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
);
});

const styles = StyleSheet.create({
  // Modern Container
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background.primary,
  },

  // Modern Card with Purple Tint
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.purpleLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg + 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.primary[100],
    ...Shadows.purpleSubtle,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  // Modern Typography
  title: {
    ...Typography.bodyLarge,
    fontWeight: '700',
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
    lineHeight: 20,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.gray[600],
    lineHeight: 18,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: Spacing.xs,
  },

  // Modern Badge with Purple Shadow
  badge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.base,
    ...Shadows.purpleMedium,
  },
  badgeIcon: {
    fontSize: 22,
    color: Colors.text.white,
    lineHeight: 22,
  },

  // Modern Divider
  divider: {
    marginTop: Spacing.md,
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.gray[100],
    opacity: 0.9,
  },
  // Modern Details Card
  detailsCard: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'] - 8,
    ...Shadows.medium,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  saveBadgeText: {
    ...Typography.caption,
    color: Colors.gray[900],
    fontWeight: '700',
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  detailsTitle: {
    ...Typography.h3,
    fontWeight: '700',
    color: Colors.primary[600],
    marginBottom: Spacing.base,
  },
  minimumBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  minimumBillLabel: {
    ...Typography.body,
    color: Colors.gray[600],
    marginRight: Spacing.sm,
  },
  minimumBillValue: {
    ...Typography.h4,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  // Modern Info Row
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm + 2,
  },
  infoText: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  dividerVertical: {
    width: 1,
    height: 12,
    backgroundColor: Colors.gray[300],
    marginHorizontal: Spacing.xs,
  },
  moreDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreDetailsText: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: Spacing.xs,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: BorderRadius['2xl'],
    borderTopRightRadius: BorderRadius['2xl'],
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  modalTitle: {
    ...Typography.h3,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  modalCloseButton: {
    padding: Spacing.xs,
  },
  modalBody: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  modalDiscountHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  modalDiscountTitle: {
    ...Typography.h3,
    fontWeight: '700',
    color: Colors.primary[600],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  modalDiscountDescription: {
    ...Typography.body,
    color: Colors.gray[600],
    textAlign: 'center',
  },
  modalInfoCard: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  modalSectionTitle: {
    ...Typography.h4,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing.base,
  },
  modalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  modalInfoLabel: {
    ...Typography.body,
    color: Colors.gray[600],
    flex: 1,
  },
  modalInfoValue: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.gray[900],
    flex: 1,
    textAlign: 'right',
  },
  modalRestrictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  modalRestrictionText: {
    ...Typography.body,
    color: Colors.gray[600],
    flex: 1,
  },
  modalFooter: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  modalApplyButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginBottom: Spacing.base,
  },
  modalApplyButtonGradient: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalApplyButtonText: {
    ...Typography.h4,
    color: Colors.text.white,
    fontWeight: '700',
  },

  // Modern Restrictions
  restrictionsContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
  },
  restrictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.gray[600],
    marginRight: Spacing.sm,
  },
  restrictionText: {
    ...Typography.caption,
    color: Colors.gray[600],
    flex: 1,
  },

  // Modern Button
  addButtonWrapper: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  addButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    ...Typography.h4,
    color: Colors.text.white,
    fontWeight: '700',
  },
});
