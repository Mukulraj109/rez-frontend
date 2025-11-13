import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import storeVouchersApi from '@/services/storeVouchersApi';

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

export default function Section6({ dynamicData, cardType }: Section6Props) {
  const router = useRouter();
  const [showDetails, setShowDetails] = useState(false);
  const [isAddingVoucher, setIsAddingVoucher] = useState(false);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const storeId = dynamicData?.store?.id || dynamicData?.store?._id;
  const storeName = dynamicData?.store?.name;

  useEffect(() => {
    if (storeId && showDetails) {
      fetchVouchers();
    }
  }, [storeId, showDetails]);

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
        // Auto-select first voucher if available
        if (response.data.vouchers.length > 0) {
          setSelectedVoucher(response.data.vouchers[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching vouchers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async () => {
    try {
      setIsAddingVoucher(true);

      if (!storeId) {
        Alert.alert('Error', 'Store information not available');
        return;
      }

      if (!selectedVoucher) {
        Alert.alert('Error', 'No voucher selected');
        return;
      }

      // Claim the voucher
      const response = await storeVouchersApi.claimVoucher(selectedVoucher._id);

      if (response.success) {
        Alert.alert(
          'Voucher Claimed!',
          `Store visit voucher for ${storeName || 'this store'} has been added to your account`,
          [{ text: 'OK' }]
        );
        
        // Refresh vouchers to show updated status
        await fetchVouchers();

        // Close the details panel after successful add
        setShowDetails(false);
      } else {
        Alert.alert('Error', response.error || 'Unable to claim voucher');
      }
    } catch (error: any) {
      console.error('Add voucher error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Unable to add voucher. Please try again.';
      Alert.alert('Error', errorMessage);
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
        accessibilityLabel="10 vouchers for store visit available"
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText
            style={styles.mainTitle}
            accessibilityRole="header"
          >
            10 Vouchers for store visit
          </ThemedText>
          <View style={styles.percentContainer} accessibilityElementsHidden>
            <ThemedText style={styles.percentIcon}>%</ThemedText>
          </View>
        </View>

        {/* Bottom Action */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.expandButton}
          onPress={() => {
            if (storeId) {
              router.push({
                pathname: '/OutletsPage',
                params: {
                  storeId: storeId,
                  storeName: storeName || 'Store'
                }
              } as any);
            } else {
              setShowDetails(!showDetails);
            }
          }}
          accessibilityRole="button"
          accessibilityLabel={storeId ? `View all outlets for ${storeName || 'store'}` : 'View voucher details'}
          accessibilityHint={storeId ? 'Double tap to see store outlet locations' : 'Double tap to expand voucher information'}
        >
          <ThemedText style={styles.expandText}>View all outlet</ThemedText>
          <Ionicons name="chevron-forward" size={18} color="#6c63ff" />
        </TouchableOpacity>
      </View>

      {/* Voucher Details Card - Shown when expanded */}
      {showDetails && (
        <View style={styles.voucherDetailsCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <ThemedText style={styles.loadingText}>Loading vouchers...</ThemedText>
            </View>
          ) : selectedVoucher ? (
            <>
              {/* Save Badge */}
              <View style={styles.saveBadge}>
                <ThemedText style={styles.saveBadgeText}>
                  Save {selectedVoucher.discountType === 'percentage' ? selectedVoucher.discountValue + '%' : '₹' + selectedVoucher.discountValue}
                </ThemedText>
              </View>

              {/* Icon */}
              <View style={styles.voucherIconContainer}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
              </View>

              {/* Title */}
              <ThemedText style={styles.voucherTitle}>{selectedVoucher.name}</ThemedText>

              {/* Minimum Bill */}
              <View style={styles.minimumBillRow}>
                <ThemedText style={styles.minimumBillLabel}>Minimum bill:</ThemedText>
                <ThemedText style={styles.minimumBillValue}>₹{selectedVoucher.minBillAmount}</ThemedText>
              </View>

              {/* Info Link */}
              <TouchableOpacity style={styles.infoRow}>
                {selectedVoucher.restrictions?.isOfflineOnly && (
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
                {selectedVoucher.restrictions?.notValidAboveStoreDiscount && (
                  <View style={styles.restrictionRow}>
                    <View style={styles.bulletPoint} />
                    <ThemedText style={styles.restrictionText}>Not valid above store discount</ThemedText>
                  </View>
                )}
                {selectedVoucher.restrictions?.singleVoucherPerBill && (
                  <View style={styles.restrictionRow}>
                    <View style={styles.bulletPoint} />
                    <ThemedText style={styles.restrictionText}>Single voucher per bill</ThemedText>
                  </View>
                )}
              </View>

              {/* Claim Status */}
              {selectedVoucher.isAssigned && (
                <View style={styles.claimedBadge}>
                  <ThemedText style={styles.claimedText}>Already Claimed</ThemedText>
                </View>
              )}

              {/* Add Button */}
              {!selectedVoucher.isAssigned && (
                <TouchableOpacity
                  style={styles.addButtonWrapper}
                  activeOpacity={0.8}
                  onPress={handleAddVoucher}
                  disabled={isAddingVoucher || !selectedVoucher.canRedeem}
                  accessibilityRole="button"
                  accessibilityLabel={`Claim ${selectedVoucher.name} voucher. Minimum bill ${selectedVoucher.minBillAmount} rupees`}
                  accessibilityHint="Double tap to claim this voucher for your account"
                  accessibilityState={{ disabled: isAddingVoucher || !selectedVoucher.canRedeem, busy: isAddingVoucher }}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.addButton, (isAddingVoucher || !selectedVoucher.canRedeem) && styles.addButtonDisabled]}
                  >
                    <ThemedText style={styles.addButtonText}>
                      {isAddingVoucher ? 'Claiming...' : selectedVoucher.canRedeem ? 'Claim Voucher' : 'Not Available'}
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </>
          ) : (
            <View style={styles.noVouchersContainer}>
              <ThemedText style={styles.noVouchersText}>No vouchers available for this store</ThemedText>
            </View>
          )}
        </View>
      )}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    flex: 1,
    paddingRight: 10,
  },
  percentContainer: {
    backgroundColor: '#fff3cd',
    width: 44,
    height: 44,
    borderRadius: 22,
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
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
  },
  expandText: {
    fontSize: 14,
    color: '#6c63ff',
    marginRight: 4,
    fontWeight: '500',
  },
  // Voucher Details Card Styles
  voucherDetailsCard: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  saveBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  voucherIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  voucherTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  minimumBillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  minimumBillLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: 8,
  },
  minimumBillValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 8,
  },
  moreDetailsText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 4,
  },
  restrictionsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  restrictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginRight: 8,
  },
  restrictionText: {
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
  },
  addButtonWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  addButton: {
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  noVouchersContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noVouchersText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  claimedBadge: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  claimedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
