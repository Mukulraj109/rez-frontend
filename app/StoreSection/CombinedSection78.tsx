// CombinedSection78.tsx - Premium Glassmorphism Design
// Instant Discount / Deals Section - Green & Gold Theme

import React, { useState, useEffect, memo, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  Platform,
  Animated,
  Image,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ThemedText } from '@/components/ThemedText';
import storeVouchersApi from '@/services/storeVouchersApi';
import discountsApi from '@/services/discountsApi';

// Premium Glass Design Tokens - Green & Gold Theme
const GLASS = {
  lightBg: 'rgba(255, 255, 255, 0.8)',
  lightBorder: 'rgba(255, 255, 255, 0.5)',
  lightHighlight: 'rgba(255, 255, 255, 0.9)',
  frostedBg: 'rgba(255, 255, 255, 0.92)',
  tintedGreenBg: 'rgba(0, 192, 106, 0.08)',
  tintedGreenBorder: 'rgba(0, 192, 106, 0.2)',
  tintedGoldBg: 'rgba(255, 200, 87, 0.12)',
  tintedGoldBorder: 'rgba(255, 200, 87, 0.35)',
};

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00996B',
  gold: '#FFC857',
  goldDark: '#E5A500',
  navy: '#0B2240',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  surface: '#F7FAFC',
};

interface CombinedSection78Props {
  title?: string;
  savePercentage?: string;
  minimumBill?: string;
  onAddPress?: () => void;
  disabled?: boolean;
  testID?: string;
  dynamicData?: {
    id?: string;
    _id?: string;
    store?: {
      id?: string;
      _id?: string;
      name?: string;
    };
  } | null;
  cardType?: string;
}

export default memo(function CombinedSection78({
  title = 'Get Instant Discount',
  savePercentage = 'Save 20%',
  minimumBill = 'Minimum bill: ₹5000',
  onAddPress,
  disabled = false,
  testID,
  dynamicData,
  cardType,
}: CombinedSection78Props) {
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [voucher, setVoucher] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Animations
  const cardScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.9)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  const storeId = dynamicData?.store?.id || dynamicData?.store?._id;
  const storeName = dynamicData?.store?.name;

  useEffect(() => {
    if (storeId) {
      fetchVoucher();
    } else {
      setLoading(false);
    }
  }, [storeId]);

  const animatePress = (anim: Animated.Value, toValue: number) => {
    Animated.spring(anim, {
      toValue,
      useNativeDriver: true,
      friction: 8,
      tension: 100,
    }).start();
  };

  const fetchVoucher = async () => {
    if (!storeId) return;

    try {
      setLoading(true);

      const vouchersResponse = await storeVouchersApi.getStoreVouchers(storeId, {
        page: 1,
        limit: 1,
      });

      if (vouchersResponse.success && vouchersResponse.data?.vouchers?.length > 0) {
        setVoucher(vouchersResponse.data.vouchers[0]);
      } else {
        const discountsResponse = await discountsApi.getBillPaymentDiscounts(5000);

        if (discountsResponse.success && discountsResponse.data?.length > 0) {
          setVoucher(discountsResponse.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async () => {
    if (onAddPress) {
      onAddPress();
      return;
    }

    try {
      setIsAddingVoucher(true);

      if (!storeId) {
        if (Platform.OS === 'web') {
          alert('Store information not available');
        } else {
          Alert.alert('Error', 'Store information not available');
        }
        return;
      }

      if (!voucher) {
        if (Platform.OS === 'web') {
          alert('No voucher available');
        } else {
          Alert.alert('Error', 'No voucher available');
        }
        return;
      }

      const voucherId = voucher._id || voucher.id;
      const response = await storeVouchersApi.claimVoucher(voucherId);

      if (response.success) {
        if (Platform.OS === 'web') {
          alert(`Voucher Claimed!\n\nDiscount voucher for ${storeName || 'this store'} has been added to your account`);
        } else {
          Alert.alert(
            'Voucher Claimed!',
            `Discount voucher for ${storeName || 'this store'} has been added to your account`,
            [{ text: 'OK' }]
          );
        }
        await fetchVoucher();
      } else {
        if (Platform.OS === 'web') {
          alert(response.error || 'Unable to claim voucher');
        } else {
          Alert.alert('Error', response.error || 'Unable to claim voucher');
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unable to add voucher. Please try again.';
      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsAddingVoucher(false);
    }
  };

  const handleShowDetails = () => {
    if (!voucher) {
      if (Platform.OS === 'web') {
        alert('No voucher information available');
      } else {
        Alert.alert('No Details', 'No voucher information available');
      }
      return;
    }

    Animated.parallel([
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true, friction: 8 }),
      Animated.timing(modalOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setShowDetailsModal(true);
  };

  const handleHideDetails = () => {
    Animated.parallel([
      Animated.timing(modalScale, { toValue: 0.9, duration: 150, useNativeDriver: true }),
      Animated.timing(modalOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setShowDetailsModal(false));
  };

  const voucherType = voucher?.discountType || voucher?.type;
  const voucherValue = voucher?.discountValue || voucher?.value;

  const displayTitle = voucher?.name || title;
  const displaySavePercentage = voucher && voucherValue
    ? `Save ${voucherType === 'percentage' ? voucherValue + '%' : '₹' + voucherValue}`
    : savePercentage;
  const displayMinBill = voucher
    ? `Minimum bill: ₹${voucher.minBillAmount || voucher.minOrderValue || 5000}`
    : minimumBill;

  // Loading state
  if (loading) {
    return (
      <View style={styles.container} testID={testID}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading deal...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <Animated.View style={{ transform: [{ scale: cardScale }] }}>
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={() => animatePress(cardScale, 0.98)}
          onPressOut={() => animatePress(cardScale, 1)}
          style={styles.cardWrapper}
        >
          {/* Glass Card */}
          {Platform.OS === 'ios' ? (
            <BlurView intensity={50} tint="light" style={styles.card}>
              {renderCardContent()}
            </BlurView>
          ) : (
            <View style={[styles.card, styles.cardAndroid]}>
              {renderCardContent()}
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Premium Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="none"
        onRequestClose={handleHideDetails}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleHideDetails}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                opacity: modalOpacity,
                transform: [{ scale: modalScale }],
              },
            ]}
          >
            <View onStartShouldSetResponder={() => true} onTouchEnd={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.modalHeaderIcon}
                >
                  <Ionicons name="ticket" size={24} color={COLORS.white} />
                </LinearGradient>
                <ThemedText style={styles.modalTitle}>Deal Details</ThemedText>
                <TouchableOpacity
                  onPress={handleHideDetails}
                  style={styles.modalCloseBtn}
                >
                  <Ionicons name="close" size={22} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Modal Body */}
              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalLabel}>Name</ThemedText>
                  <ThemedText style={styles.modalValue}>{voucher?.name || 'N/A'}</ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalLabel}>Discount</ThemedText>
                  <View style={styles.discountValueRow}>
                    <LinearGradient
                      colors={[COLORS.gold, COLORS.goldDark]}
                      style={styles.discountBadgeLarge}
                    >
                      <ThemedText style={styles.discountBadgeText}>
                        {voucherType === 'percentage' ? `${voucherValue}%` : `₹${voucherValue}`}
                      </ThemedText>
                    </LinearGradient>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalLabel}>Minimum Bill</ThemedText>
                  <ThemedText style={styles.modalValue}>
                    ₹{voucher?.minBillAmount || voucher?.minOrderValue || 'N/A'}
                  </ThemedText>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={styles.modalLabel}>Restrictions</ThemedText>
                  <View style={styles.restrictionsList}>
                    <View style={styles.restrictionItem}>
                      <View style={styles.restrictionIcon}>
                        <Ionicons
                          name={voucher?.restrictions?.isOfflineOnly ? 'storefront' : 'globe-outline'}
                          size={16}
                          color={COLORS.primary}
                        />
                      </View>
                      <ThemedText style={styles.restrictionText}>
                        {voucher?.restrictions?.isOfflineOnly ? 'Offline only' : 'Online & Offline'}
                      </ThemedText>
                    </View>
                    <View style={styles.restrictionItem}>
                      <View style={styles.restrictionIcon}>
                        <Ionicons name="pricetag-outline" size={16} color={COLORS.primary} />
                      </View>
                      <ThemedText style={styles.restrictionText}>
                        {voucher?.restrictions?.notValidAboveStoreDiscount
                          ? 'Not valid above store discount'
                          : 'Valid with store discount'}
                      </ThemedText>
                    </View>
                    <View style={styles.restrictionItem}>
                      <View style={styles.restrictionIcon}>
                        <Ionicons name="receipt-outline" size={16} color={COLORS.primary} />
                      </View>
                      <ThemedText style={styles.restrictionText}>
                        {voucher?.restrictions?.singleVoucherPerBill
                          ? 'Single voucher per bill'
                          : 'Multiple vouchers allowed'}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleHideDetails}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  style={styles.modalButtonGradient}
                >
                  <ThemedText style={styles.modalButtonText}>Close</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );

  function renderCardContent() {
    return (
      <>
        {/* Glass Highlight */}
        <View style={styles.glassHighlight} />

        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.headerIcon}
            >
              <Ionicons name="flash" size={20} color={COLORS.white} />
            </LinearGradient>
            <ThemedText style={styles.title}>{displayTitle}</ThemedText>
          </View>

          {/* Save Badge */}
          <LinearGradient
            colors={[COLORS.gold, COLORS.goldDark]}
            style={styles.saveBadge}
          >
            <ThemedText style={styles.saveBadgeText}>{displaySavePercentage}</ThemedText>
          </LinearGradient>
        </View>

        {/* Minimum Bill */}
        <ThemedText style={styles.minBill}>{displayMinBill}</ThemedText>

        {/* Dashed Divider */}
        <View style={styles.divider} />

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialCommunityIcons name="bag-carry-on-off" size={18} color={COLORS.primary} />
            </View>
            <View style={styles.detailTextContainer}>
              <ThemedText style={styles.detailText}>Offline Only</ThemedText>
              <TouchableOpacity onPress={handleShowDetails}>
                <ThemedText style={styles.moreDetailsLink}>| More details</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <MaterialIcons name="percent" size={16} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.detailText}>Not valid above store discount</ThemedText>
              <ThemedText style={styles.subText}>Single voucher per bill</ThemedText>
            </View>
          </View>
        </View>

        {/* Add Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            activeOpacity={1}
            onPressIn={() => animatePress(buttonScale, 0.96)}
            onPressOut={() => animatePress(buttonScale, 1)}
            onPress={handleAddVoucher}
            disabled={disabled || isAddingVoucher || !voucher || voucher.isAssigned}
            style={[
              styles.addButtonWrapper,
              (disabled || isAddingVoucher || !voucher || voucher.isAssigned) && styles.addButtonDisabled
            ]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.addButton}
            >
              {isAddingVoucher ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <ThemedText style={styles.addButtonText}>
                  {voucher?.isAssigned ? 'Already Claimed' : !voucher ? 'Not Available' : 'Add Deal'}
                </ThemedText>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </>
    );
  }
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: GLASS.lightBorder,
    overflow: 'hidden',
  },

  cardAndroid: {
    backgroundColor: GLASS.lightBg,
  },

  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: GLASS.lightHighlight,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
  },

  saveBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  saveBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: 0.2,
  },

  minBill: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    marginLeft: 52,
  },

  divider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    marginBottom: 16,
  },

  // Details Section
  detailsSection: {
    gap: 14,
    marginBottom: 20,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },

  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: GLASS.tintedGreenBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.tintedGreenBorder,
  },

  detailTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  detailText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },

  moreDetailsLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 4,
  },

  subText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Add Button
  addButtonWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
  },

  addButton: {
    height: 50,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButtonDisabled: {
    opacity: 0.5,
  },

  addButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },

  // Loading State
  loadingCard: {
    backgroundColor: GLASS.frostedBg,
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GLASS.lightBorder,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
      },
      android: {
        elevation: 16,
      },
    }),
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    gap: 12,
  },

  modalHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GLASS.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalBody: {
    padding: 20,
  },

  modalSection: {
    marginBottom: 24,
  },

  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },

  modalValue: {
    fontSize: 17,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },

  discountValueRow: {
    flexDirection: 'row',
  },

  discountBadgeLarge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
  },

  discountBadgeText: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.navy,
  },

  restrictionsList: {
    gap: 14,
  },

  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  restrictionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: GLASS.tintedGreenBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: GLASS.tintedGreenBorder,
  },

  restrictionText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    flex: 1,
    fontWeight: '500',
  },

  modalButton: {
    padding: 20,
    paddingTop: 0,
  },

  modalButtonGradient: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
