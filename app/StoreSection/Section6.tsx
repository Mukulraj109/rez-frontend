import React, { useState, useEffect, memo, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import storeVouchersApi from '@/services/storeVouchersApi';
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

interface Section6Props {
  dynamicData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    store?: {
      id?: string;
      _id?: string;
      name?: string;
    };
  } | null;
  cardType?: string;
}

export default memo(function Section6({ dynamicData, cardType }: Section6Props) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [voucherCount, setVoucherCount] = useState<number | null>(null);

  const storeId = dynamicData?.store?.id || dynamicData?.store?._id;
  const storeName = dynamicData?.store?.name;

  // Animation refs
  const expandButtonScaleAnim = useRef(new Animated.Value(1)).current;
  const outletsButtonScaleAnim = useRef(new Animated.Value(1)).current;

  // Animation helper
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  useEffect(() => {
    if (storeId) {
      fetchVoucherCount();
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId && showDetails) {
      fetchVouchers();
    }
  }, [storeId, showDetails]);

  const fetchVoucherCount = async () => {
    if (!storeId) return;

    try {
      const response = await storeVouchersApi.getStoreVouchers(storeId, {
        page: 1,
        limit: 100, // Get all vouchers to count
      });

      if (response.success && response.data?.vouchers) {
        setVoucherCount(response.data.vouchers.length);
      } else {
        setVoucherCount(0);
      }
    } catch (error) {
      setVoucherCount(0);
    }
  };

  const fetchVouchers = async () => {
    if (!storeId) return;

    try {
      setLoading(true);

      const response = await storeVouchersApi.getStoreVouchers(storeId, {
        page: 1,
        limit: 10,
      });

      if (response.success && response.data?.vouchers) {
        setVouchers(response.data.vouchers);
        // Update count from detailed fetch as well
        setVoucherCount(response.data.vouchers.length);
        // Auto-select first voucher if available
        if (response.data.vouchers.length > 0) {
          setSelectedVoucher(response.data.vouchers[0]);
        }
      }
    } catch (error) {
      // Silent fail - show empty state
    } finally {
      setLoading(false);
    }
  };

  const getVoucherTitle = () => {
    if (voucherCount === null) {
      return 'Vouchers for store visit';
    }
    if (voucherCount === 0) {
      return 'No vouchers available';
    }
    if (voucherCount === 1) {
      return '1 Voucher for store visit';
    }
    return `${voucherCount} Vouchers for store visit`;
  };

  const handleAddVoucher = async () => {
    // Haptic feedback on claim
    triggerImpact('Medium');

    try {
      setIsAddingVoucher(true);

      if (!storeId) {
        platformAlert('Error', 'Store information not available');
        return;
      }

      if (!selectedVoucher) {
        platformAlert('Error', 'No voucher selected');
        return;
      }

      // Claim the voucher
      const response = await storeVouchersApi.claimVoucher(selectedVoucher._id);

      if (response.success) {
        // Success haptic
        triggerNotification('Success');

        platformAlert(
          'Voucher Claimed!',
          `Store visit voucher for ${storeName || 'this store'} has been added to your account`
        );

        // Refresh vouchers to show updated status
        await fetchVouchers();
        await fetchVoucherCount();

        // Close the details panel after successful add
        setShowDetails(false);
      } else {
        // Error haptic
        triggerNotification('Error');
        platformAlert('Error', response.error || 'Unable to claim voucher');
      }
    } catch (error: any) {
      // Error haptic
      triggerNotification('Error');
      const errorMessage = error?.response?.data?.message || error?.message || 'Unable to add voucher. Please try again.';
      platformAlert('Error', errorMessage);
    } finally {
      setIsAddingVoucher(false);
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Store vouchers section"
    >
      <View
        style={styles.card}
        accessibilityLabel={`${getVoucherTitle()} available`}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText
            style={styles.mainTitle}
            accessibilityRole="header"
          >
            {getVoucherTitle()}
          </ThemedText>
          <View style={styles.percentContainer} accessibilityElementsHidden>
            <ThemedText style={styles.percentIcon}>%</ThemedText>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.actionButtonsRow}>
          {/* View Vouchers Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.expandButton}
            onPress={() => setShowDetails(!showDetails)}
            accessibilityRole="button"
            accessibilityLabel="View available vouchers"
            accessibilityHint="Double tap to see voucher details"
          >
            <ThemedText style={styles.expandText}>
              {showDetails ? 'Hide vouchers' : 'View vouchers'}
            </ThemedText>
            <Ionicons
              name={showDetails ? "chevron-up" : "chevron-down"}
              size={18}
              color="#6c63ff"
            />
          </TouchableOpacity>

          {/* View Outlets Button (only if storeId exists) */}
          {storeId && (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.outletsButton}
              onPress={() => {
                router.push({
                  pathname: '/outletspage',
                  params: {
                    storeId: storeId,
                    storeName: storeName || 'Store'
                  }
                } as any);
              }}
              accessibilityRole="button"
              accessibilityLabel={`View all outlets for ${storeName || 'store'}`}
              accessibilityHint="Double tap to see store outlet locations"
            >
              <Ionicons name="location-outline" size={18} color="#6c63ff" />
              <ThemedText style={styles.outletsButtonText}>View outlets</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Voucher Details Card - Shown when expanded */}
      {showDetails && (
        <ScrollView style={styles.voucherDetailsCard} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <ThemedText style={styles.loadingText}>Loading vouchers...</ThemedText>
            </View>
          ) : vouchers.length > 0 ? (
            vouchers.map((voucher, index) => (
            <View key={voucher._id || index} style={styles.voucherItemCard}>
            <>
              {/* Save Badge */}
              <View style={styles.saveBadge}>
                <ThemedText style={styles.saveBadgeText}>
                  Save {voucher.discountType === 'percentage' ? voucher.discountValue + '%' : '₹' + voucher.discountValue}
                </ThemedText>
              </View>

              {/* Icon */}
              <View style={styles.voucherIconContainer}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
              </View>

              {/* Title */}
              <ThemedText style={styles.voucherTitle}>{voucher.name}</ThemedText>

              {/* Minimum Bill */}
              <View style={styles.minimumBillRow}>
                <ThemedText style={styles.minimumBillLabel}>Minimum bill:</ThemedText>
                <ThemedText style={styles.minimumBillValue}>₹{voucher.minBillAmount}</ThemedText>
              </View>

              {/* Info Link */}
              <TouchableOpacity style={styles.infoRow}>
                {voucher.restrictions?.isOfflineOnly && (
                  <>
                    <ThemedText style={styles.infoText}>Offline Only</ThemedText>
                    <View style={styles.divider} />
                  </>
                )}
                <ThemedText style={styles.moreDetailsText}>More details</ThemedText>
                <Ionicons name="information-circle-outline" size={16} color="#8B5CF6" style={styles.infoIcon} />
              </TouchableOpacity>

              {/* Restrictions */}
              <View style={styles.restrictionsContainer}>
                {voucher.restrictions?.notValidAboveStoreDiscount && (
                  <View style={styles.restrictionRow}>
                    <View style={styles.bulletPoint} />
                    <ThemedText style={styles.restrictionText}>Not valid above store discount</ThemedText>
                  </View>
                )}
                {voucher.restrictions?.singleVoucherPerBill && (
                  <View style={styles.restrictionRow}>
                    <View style={styles.bulletPoint} />
                    <ThemedText style={styles.restrictionText}>Single voucher per bill</ThemedText>
                  </View>
                )}
              </View>

              {/* Claim Status */}
              {voucher.isAssigned && (
                <View style={styles.claimedBadge}>
                  <ThemedText style={styles.claimedText}>Already Claimed</ThemedText>
                </View>
              )}

              {/* Add Button */}
              {!voucher.isAssigned && (
                <TouchableOpacity
                  style={styles.addButtonWrapper}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedVoucher(voucher);
                    handleAddVoucher();
                  }}
                  disabled={isAddingVoucher || !voucher.canRedeem}
                  accessibilityRole="button"
                  accessibilityLabel={`Claim ${voucher.name} voucher. Minimum bill ${voucher.minBillAmount} rupees`}
                  accessibilityHint="Double tap to claim this voucher for your account"
                  accessibilityState={{ disabled: isAddingVoucher || !voucher.canRedeem, busy: isAddingVoucher }}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.addButton, (isAddingVoucher || !voucher.canRedeem) && styles.addButtonDisabled]}
                  >
                    <ThemedText style={styles.addButtonText}>
                      {isAddingVoucher ? 'Claiming...' : voucher.canRedeem ? 'Claim Voucher' : 'Not Available'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
            </View>
            ))
          ) : (
            <View style={styles.noVouchersContainer}>
              <ThemedText style={styles.noVouchersText}>No vouchers available for this store</ThemedText>
              <RetryButton
                onRetry={fetchVouchers}
                label="Retry"
                variant="secondary"
                size="small"
                style={{ marginTop: 16 }}
              />
            </View>
          )}
        </ScrollView>
      )}
    </View>
);
});

const styles = StyleSheet.create({
  // Modern Container
  container: {
    paddingHorizontal: Spacing['2xl'] - 4,
    paddingVertical: Spacing.base,
    backgroundColor: Colors.background.primary,
  },

  // Modern Card
  card: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing.lg + 2,
    ...Shadows.subtle,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  // Modern Typography
  mainTitle: {
    ...Typography.h4,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
    paddingRight: Spacing.md - 2,
  },

  percentContainer: {
    backgroundColor: '#fff3cd',
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe58f',
  },
  percentIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f39c12',
  },

  // Modern Action Buttons
  actionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm + 2,
    gap: Spacing.base,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  expandText: {
    ...Typography.body,
    color: Colors.primary[600],
    marginRight: Spacing.xs,
    fontWeight: '500',
  },
  outletsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary[50],
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  outletsButtonText: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '600',
  },
  // Modern Voucher Details
  voucherDetailsCard: {
    marginTop: Spacing.lg,
    maxHeight: 500,
  },
  voucherItemCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius['2xl'],
    padding: Spacing['2xl'] - 4,
    marginBottom: Spacing.base,
    ...Shadows.medium,
    position: 'relative',
  },

  saveBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: '#10B981',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.full,
  },
  saveBadgeText: {
    ...Typography.caption,
    color: Colors.text.white,
    fontWeight: '700',
  },

  voucherIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  voucherTitle: {
    ...Typography.h3,
    fontWeight: '700',
    color: Colors.gray[900],
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

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  infoText: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: Colors.gray[300],
    marginHorizontal: Spacing.sm,
  },
  moreDetailsText: {
    ...Typography.body,
    color: Colors.primary[600],
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: Spacing.xs,
  },

  restrictionsContainer: {
    backgroundColor: Colors.background.secondary,
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

  loadingContainer: {
    paddingVertical: Spacing['3xl'] + 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    ...Typography.body,
    marginTop: Spacing.base,
    color: Colors.gray[600],
  },

  noVouchersContainer: {
    paddingVertical: Spacing['3xl'] + 8,
    alignItems: 'center',
  },
  noVouchersText: {
    ...Typography.body,
    color: Colors.gray[600],
    textAlign: 'center',
  },

  claimedBadge: {
    backgroundColor: '#10B981',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing['2xl'] - 4,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  claimedText: {
    ...Typography.body,
    color: Colors.text.white,
    fontWeight: '600',
  },
});
