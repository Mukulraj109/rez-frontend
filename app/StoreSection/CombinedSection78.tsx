import React, { useState, useEffect, memo } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Modal, ScrollView, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import storeVouchersApi from '@/services/storeVouchersApi';
import discountsApi from '@/services/discountsApi';

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

const PURPLE = '#6c63ff';
const CARD_BG = '#f6f3ff';     // soft lavender like the screenshot
const BORDER = '#ece6ff';
const DIVIDER = '#e6e0fa';
const PRIMARY = '#333333';
const SECONDARY = '#666666';

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

  const storeId = dynamicData?.store?.id || dynamicData?.store?._id;
  const storeName = dynamicData?.store?.name;

  useEffect(() => {
    if (storeId) {
      fetchVoucher();
    } else {
      setLoading(false);
    }
  }, [storeId]);

  const fetchVoucher = async () => {
    if (!storeId) return;

    try {
      setLoading(true);

      // Try to fetch store vouchers first
      const vouchersResponse = await storeVouchersApi.getStoreVouchers(storeId, {
        page: 1,
        limit: 1,
      });

      console.log('🎫 [CombinedSection78] Vouchers response:', vouchersResponse);

      if (vouchersResponse.success && vouchersResponse.data?.vouchers?.length > 0) {
        console.log('✅ [CombinedSection78] Store voucher found:', vouchersResponse.data.vouchers[0]);
        setVoucher(vouchersResponse.data.vouchers[0]);
      } else {
        // If no store vouchers, try to get discount offers
        console.log('⚠️ [CombinedSection78] No store vouchers, trying discounts API...');
        const discountsResponse = await discountsApi.getBillPaymentDiscounts(5000);

        console.log('🎯 [CombinedSection78] Discounts response:', discountsResponse);

        if (discountsResponse.success && discountsResponse.data?.length > 0) {
          console.log('✅ [CombinedSection78] Discount found:', discountsResponse.data[0]);
          setVoucher(discountsResponse.data[0]);
        } else {
          console.log('❌ [CombinedSection78] No vouchers or discounts available');
        }
      }
    } catch (error) {
      console.error('❌ [CombinedSection78] Error fetching voucher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async () => {
    console.log('🔘 [CombinedSection78] Add button clicked');
    console.log('📦 [CombinedSection78] Current voucher:', voucher);
    console.log('🏪 [CombinedSection78] Store ID:', storeId);

    // If custom handler provided, use it
    if (onAddPress) {
      console.log('🔄 [CombinedSection78] Using custom onAddPress handler');
      onAddPress();
      return;
    }

    try {
      setIsAddingVoucher(true);

      if (!storeId) {
        console.log('❌ [CombinedSection78] No store ID available');
        if (Platform.OS === 'web') {
          alert('Store information not available');
        } else {
          Alert.alert('Error', 'Store information not available');
        }
        return;
      }

      if (!voucher) {
        console.log('❌ [CombinedSection78] No voucher available');
        if (Platform.OS === 'web') {
          alert('No voucher available');
        } else {
          Alert.alert('Error', 'No voucher available');
        }
        return;
      }

      const voucherId = voucher._id || voucher.id;
      console.log('🎫 [CombinedSection78] Claiming voucher with ID:', voucherId);

      // Claim the voucher using the real API
      const response = await storeVouchersApi.claimVoucher(voucherId);

      console.log('📥 [CombinedSection78] Claim response:', response);

      if (response.success) {
        console.log('✅ [CombinedSection78] Voucher claimed successfully');
        if (Platform.OS === 'web') {
          alert(`Voucher Claimed!\n\nDiscount voucher for ${storeName || 'this store'} has been added to your account`);
        } else {
          Alert.alert(
            'Voucher Claimed!',
            `Discount voucher for ${storeName || 'this store'} has been added to your account`,
            [{ text: 'OK' }]
          );
        }

        // Refresh voucher data
        await fetchVoucher();
      } else {
        console.log('❌ [CombinedSection78] Claim failed:', response.error);
        if (Platform.OS === 'web') {
          alert(response.error || 'Unable to claim voucher');
        } else {
          Alert.alert('Error', response.error || 'Unable to claim voucher');
        }
      }
    } catch (error: any) {
      console.error('❌ [CombinedSection78] Add voucher error:', error);
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

  const handleMoreDetails = () => {
    console.log('ℹ️ [CombinedSection78] More details clicked');
    console.log('📦 [CombinedSection78] Voucher details:', voucher);

    if (!voucher) {
      if (Platform.OS === 'web') {
        alert('No voucher information available');
      } else {
        Alert.alert('No Details', 'No voucher information available');
      }
      return;
    }

    setShowDetailsModal(true);
  };

  // Calculate display values from real voucher data
  // Handle both voucher format (discountType/discountValue) and discount format (type/value)
  const displayTitle = voucher?.name || title;

  const voucherType = voucher?.discountType || voucher?.type;
  const voucherValue = voucher?.discountValue || voucher?.value;

  const displaySavePercentage = voucher && voucherValue
    ? `Save ${voucherType === 'percentage' ? voucherValue + '%' : '₹' + voucherValue}`
    : savePercentage;

  const displayMinBill = voucher
    ? `Minimum bill: ₹${voucher.minBillAmount || voucher.minOrderValue || 5000}`
    : minimumBill;

  return (
    <View
      style={styles.wrap}
      testID={testID}
      accessibilityRole="region"
      accessibilityLabel="Instant discount voucher"
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PURPLE} />
          <ThemedText style={styles.loadingText}>Loading voucher...</ThemedText>
        </View>
      ) : (
        <View
          style={styles.card}
          accessibilityLabel={`${displayTitle}. ${displaySavePercentage}. ${displayMinBill}`}
        >
          {/* header */}
          <View style={styles.headerRow}>
            <ThemedText
              style={styles.title}
              accessibilityRole="header"
            >
              {displayTitle}
            </ThemedText>
            <View style={styles.badge} accessibilityElementsHidden>
              <ThemedText style={styles.badgeText}>{displaySavePercentage}</ThemedText>
            </View>
          </View>

          {/* min bill */}
          <ThemedText style={styles.minBill}>{displayMinBill}</ThemedText>

        {/* dashed divider */}
        <View style={styles.dashed} />

        {/* detail rows */}
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="bag-carry-on-off" size={24} color="purple" />
            </View>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <ThemedText style={styles.detailText}>Offline Only </ThemedText>
              <TouchableOpacity
                onPress={handleMoreDetails}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="View more details about this voucher"
              >
                <ThemedText style={styles.linkText}>| More details</ThemedText>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="percent" size={20} color="purple" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.detailText}>
                Not valid above store discount
              </ThemedText>
              <ThemedText style={styles.subText}>Single voucher per bill</ThemedText>
            </View>
          </View>
        </View>

        {/* add button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleAddVoucher}
          disabled={disabled || isAddingVoucher || !voucher || voucher.isAssigned}
          style={[styles.addBtn, (disabled || isAddingVoucher || !voucher || voucher.isAssigned) && styles.addBtnDisabled]}
          accessibilityRole="button"
          accessibilityLabel={`Add ${displayTitle} voucher to account`}
          accessibilityHint="Double tap to add this discount voucher"
          accessibilityState={{ disabled: disabled || isAddingVoucher || !voucher || voucher.isAssigned, busy: isAddingVoucher }}
        >
          <ThemedText style={styles.addText}>
            {isAddingVoucher ? 'Adding...' : voucher?.isAssigned ? 'Already Claimed' : !voucher ? 'Not Available' : 'Add'}
          </ThemedText>
        </TouchableOpacity>
        </View>
      )}

      {/* Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDetailsModal(false)}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Voucher Details</ThemedText>
              <TouchableOpacity
                onPress={() => setShowDetailsModal(false)}
                style={styles.modalCloseButton}
                accessibilityRole="button"
                accessibilityLabel="Close details"
              >
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Voucher Name */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Name</ThemedText>
                <ThemedText style={styles.modalValue}>{voucher?.name || 'N/A'}</ThemedText>
              </View>

              {/* Discount Amount */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Discount</ThemedText>
                <ThemedText style={styles.modalValue}>
                  {voucherType === 'percentage' ? `${voucherValue}%` : `₹${voucherValue}`}
                </ThemedText>
              </View>

              {/* Minimum Bill */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Minimum Bill</ThemedText>
                <ThemedText style={styles.modalValue}>
                  ₹{voucher?.minBillAmount || voucher?.minOrderValue || 'N/A'}
                </ThemedText>
              </View>

              {/* Restrictions */}
              <View style={styles.modalSection}>
                <ThemedText style={styles.modalLabel}>Restrictions</ThemedText>
                <View style={styles.restrictionsList}>
                  <View style={styles.restrictionItem}>
                    <Ionicons
                      name={voucher?.restrictions?.isOfflineOnly ? 'storefront' : 'globe-outline'}
                      size={16}
                      color="#6B7280"
                    />
                    <ThemedText style={styles.restrictionText}>
                      {voucher?.restrictions?.isOfflineOnly ? 'Offline only' : 'Online & Offline'}
                    </ThemedText>
                  </View>
                  <View style={styles.restrictionItem}>
                    <Ionicons name="pricetag-outline" size={16} color="#6B7280" />
                    <ThemedText style={styles.restrictionText}>
                      {voucher?.restrictions?.notValidAboveStoreDiscount
                        ? 'Not valid above store discount'
                        : 'Valid with store discount'}
                    </ThemedText>
                  </View>
                  <View style={styles.restrictionItem}>
                    <Ionicons name="receipt-outline" size={16} color="#6B7280" />
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
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowDetailsModal(false)}
                activeOpacity={0.8}
              >
                <ThemedText style={styles.modalButtonText}>Close</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
);
});

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },

  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    // very soft elevation like the screenshot
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: PURPLE,
  },
  badge: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    // subtle floating feel
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2f2f2f',
  },

  minBill: {
    fontSize: 13,
    color: SECONDARY,
    marginTop: 2,
    marginBottom: 10,
  },

  dashed: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: DIVIDER,
    marginBottom: 12,
  },

  details: {
    gap: 10,
    marginBottom: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#efe8ff',
    borderWidth: 1,
    borderColor: '#e3dcff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: PRIMARY,
    lineHeight: 18,
  },
  linkText: {
    color: PURPLE,
    fontWeight: '600',
  },
  subText: {
    fontSize: 12,
    color: SECONDARY,
    marginTop: 2,
    lineHeight: 16,
  },

  addBtn: {
    marginTop: 4,
    backgroundColor: PURPLE,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    // slight glow like the mock
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  addBtnDisabled: {
    backgroundColor: '#b8aefc',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  addText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },

  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: SECONDARY,
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  restrictionsList: {
    gap: 12,
  },
  restrictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restrictionText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  modalButton: {
    backgroundColor: PURPLE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
