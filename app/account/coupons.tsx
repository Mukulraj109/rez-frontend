// Coupon Management Screen
// Browse, claim, and manage coupons

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import couponService, { Coupon, UserCoupon } from '@/services/couponApi';

type CouponTab = 'available' | 'my-coupons' | 'expired';

export default function CouponsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CouponTab>('available');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [myCoupons, setMyCoupons] = useState<UserCoupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [couponSummary, setCouponSummary] = useState({
    total: 0,
    available: 0,
    used: 0,
    expired: 0,
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'available') {
        await loadAvailableCoupons();
      } else if (activeTab === 'my-coupons') {
        await loadMyCoupons('available');
      } else if (activeTab === 'expired') {
        await loadMyCoupons('expired');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableCoupons = async (featured?: boolean) => {
    try {
      const response = featured
        ? await couponService.getFeaturedCoupons()
        : await couponService.getAvailableCoupons();

      if (response.success && response.data) {
        setAvailableCoupons(response.data.coupons);

        // Calculate summary from available coupons
        const now = new Date();
        const summary = {
          total: response.data.coupons.length,
          available: response.data.coupons.filter(c => new Date(c.validTo) > now).length,
          used: 0, // Not applicable for available coupons
          expired: response.data.coupons.filter(c => new Date(c.validTo) <= now).length,
        };
        setCouponSummary(summary);
      }
    } catch (error) {
      console.error('Failed to load coupons:', error);
    }
  };

  const loadMyCoupons = async (status?: 'available' | 'used' | 'expired') => {
    try {
      const response = await couponService.getMyCoupons({ status });
      if (response.success && response.data) {
        setMyCoupons(response.data.coupons);
        setCouponSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to load my coupons:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleClaimCoupon = async (couponId: string) => {
    try {
      // Optimistically remove from Available tab
      setAvailableCoupons(prev => prev.filter(c => c._id !== couponId));

      // Update summary counts
      setCouponSummary(prev => ({
        ...prev,
        total: prev.total - 1,
        available: prev.available - 1,
      }));

      const response = await couponService.claimCoupon(couponId);
      if (response.success) {
        Alert.alert('Success', 'Coupon claimed successfully!');
        // Refresh to ensure data consistency
        await loadData();
      } else {
        // Revert on failure
        Alert.alert('Error', response.error || 'Failed to claim coupon');
        await loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to claim coupon');
      // Revert on error
      await loadData();
    }
  };

  const handleRemoveCoupon = async (couponId: string) => {
    Alert.alert(
      'Remove Coupon',
      'Are you sure you want to remove this coupon?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await couponService.removeCoupon(couponId);
              if (response.success) {
                Alert.alert('Success', 'Coupon removed successfully');
                loadData();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to remove coupon');
            }
          },
        },
      ]
    );
  };

  const handleViewDetails = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const calculateDiscount = (coupon: Coupon, amount: number = 1000) => {
    if (coupon.discountType === 'PERCENTAGE') {
      const discount = (amount * coupon.discountValue) / 100;
      return coupon.maxDiscountCap > 0
        ? Math.min(discount, coupon.maxDiscountCap)
        : discount;
    }
    return coupon.discountValue;
  };

  const renderCouponCard = (coupon: Coupon, isClaimed: boolean = false) => {
    const isExpiringSoon = new Date(coupon.validTo).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

    return (
      <TouchableOpacity
        key={coupon._id}
        style={styles.couponCard}
        onPress={() => handleViewDetails(coupon)}
      >
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.couponGradient}
        >
          {/* Header */}
          <View style={styles.couponHeader}>
            <View style={styles.couponBadge}>
              <ThemedText style={styles.couponCode}>{coupon.couponCode}</ThemedText>
            </View>
            {coupon.isFeatured && (
              <View style={styles.featuredBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <ThemedText style={styles.featuredText}>Featured</ThemedText>
              </View>
            )}
          </View>

          {/* Discount */}
          <View style={styles.discountContainer}>
            {coupon.discountType === 'PERCENTAGE' ? (
              <ThemedText style={styles.discountValue}>
                {coupon.discountValue}% OFF
              </ThemedText>
            ) : (
              <ThemedText style={styles.discountValue}>
                ₹{coupon.discountValue} OFF
              </ThemedText>
            )}
            {coupon.maxDiscountCap > 0 && coupon.discountType === 'PERCENTAGE' && (
              <ThemedText style={styles.maxDiscount}>
                Up to ₹{coupon.maxDiscountCap}
              </ThemedText>
            )}
          </View>

          {/* Title & Description */}
          <ThemedText style={styles.couponTitle} numberOfLines={1}>
            {coupon.title}
          </ThemedText>
          <ThemedText style={styles.couponDescription} numberOfLines={2}>
            {coupon.description}
          </ThemedText>

          {/* Min Order */}
          {coupon.minOrderValue > 0 && (
            <ThemedText style={styles.minOrder}>
              Min order: ₹{coupon.minOrderValue}
            </ThemedText>
          )}

          {/* Footer */}
          <View style={styles.couponFooter}>
            <View style={styles.validityContainer}>
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <ThemedText style={styles.validityText}>
                Valid till {formatDate(coupon.validTo)}
              </ThemedText>
            </View>

            {!isClaimed ? (
              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => handleClaimCoupon(coupon._id)}
              >
                <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
              </TouchableOpacity>
            ) : (
              <View style={styles.claimedBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <ThemedText style={styles.claimedText}>Claimed</ThemedText>
              </View>
            )}
          </View>

          {isExpiringSoon && (
            <View style={styles.expiringBanner}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <ThemedText style={styles.expiringText}>Expiring Soon!</ThemedText>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderUserCouponCard = (userCoupon: UserCoupon) => {
    const coupon = userCoupon.coupon;
    const isExpiringSoon = new Date(userCoupon.expiryDate).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;

    return (
      <TouchableOpacity
        key={userCoupon._id}
        style={styles.couponCard}
        onPress={() => handleViewDetails(coupon)}
      >
        <LinearGradient
          colors={userCoupon.status === 'used' ? ['#6B7280', '#4B5563'] : ['#667eea', '#764ba2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.couponGradient}
        >
          {/* Similar structure as regular coupon but with status indicators */}
          <View style={styles.couponHeader}>
            <View style={styles.couponBadge}>
              <ThemedText style={styles.couponCode}>{coupon.couponCode}</ThemedText>
            </View>
            <View style={[styles.statusBadge,
              userCoupon.status === 'used' ? styles.usedBadge :
              userCoupon.status === 'expired' ? styles.expiredBadge : styles.availableBadge
            ]}>
              <ThemedText style={styles.statusText}>
                {userCoupon.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>

          <View style={styles.discountContainer}>
            {coupon.discountType === 'PERCENTAGE' ? (
              <ThemedText style={styles.discountValue}>
                {coupon.discountValue}% OFF
              </ThemedText>
            ) : (
              <ThemedText style={styles.discountValue}>
                ₹{coupon.discountValue} OFF
              </ThemedText>
            )}
          </View>

          <ThemedText style={styles.couponTitle} numberOfLines={1}>
            {coupon.title}
          </ThemedText>

          <View style={styles.couponFooter}>
            <View style={styles.validityContainer}>
              <Ionicons name="time-outline" size={14} color="#FFF" />
              <ThemedText style={styles.validityText}>
                Expires: {formatDate(userCoupon.expiryDate)}
              </ThemedText>
            </View>

            {userCoupon.status === 'available' && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveCoupon(userCoupon._id)}
              >
                <Ionicons name="trash-outline" size={16} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {isExpiringSoon && userCoupon.status === 'available' && (
            <View style={styles.expiringBanner}>
              <Ionicons name="alert-circle" size={14} color="#EF4444" />
              <ThemedText style={styles.expiringText}>Expiring Soon!</ThemedText>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent={true} />

      {/* Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Coupons</ThemedText>
          <TouchableOpacity onPress={loadData} style={styles.refreshButton}>
            <Ionicons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        {activeTab !== 'available' && (
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryValue}>{couponSummary.available}</ThemedText>
              <ThemedText style={styles.summaryLabel}>Available</ThemedText>
            </View>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryValue}>{couponSummary.used}</ThemedText>
              <ThemedText style={styles.summaryLabel}>Used</ThemedText>
            </View>
            <View style={styles.summaryCard}>
              <ThemedText style={styles.summaryValue}>{couponSummary.expired}</ThemedText>
              <ThemedText style={styles.summaryLabel}>Expired</ThemedText>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'available' && styles.activeTab]}
            onPress={() => setActiveTab('available')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
              Available
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'my-coupons' && styles.activeTab]}
            onPress={() => setActiveTab('my-coupons')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'my-coupons' && styles.activeTabText]}>
              My Coupons
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expired' && styles.activeTab]}
            onPress={() => setActiveTab('expired')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'expired' && styles.activeTabText]}>
              Expired
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667eea" />
          </View>
        ) : (
          <View style={styles.couponsContainer}>
            {activeTab === 'available' && availableCoupons.map(coupon => renderCouponCard(coupon, false))}
            {(activeTab === 'my-coupons' || activeTab === 'expired') &&
              myCoupons.map(userCoupon => renderUserCouponCard(userCoupon))}

            {((activeTab === 'available' && availableCoupons.length === 0) ||
              ((activeTab === 'my-coupons' || activeTab === 'expired') && myCoupons.length === 0)) && (
              <View style={styles.emptyContainer}>
                <Ionicons name="ticket-outline" size={64} color="#9CA3AF" />
                <ThemedText style={styles.emptyText}>
                  {activeTab === 'available' ? 'No coupons available' : 'No coupons found'}
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Coupon Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Coupon Details</ThemedText>
              <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {selectedCoupon && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Code:</ThemedText>
                  <ThemedText style={styles.detailValue}>{selectedCoupon.couponCode}</ThemedText>
                </View>

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Discount:</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    {selectedCoupon.discountType === 'PERCENTAGE'
                      ? `${selectedCoupon.discountValue}%`
                      : `₹${selectedCoupon.discountValue}`}
                  </ThemedText>
                </View>

                {selectedCoupon.minOrderValue > 0 && (
                  <View style={styles.detailRow}>
                    <ThemedText style={styles.detailLabel}>Min Order:</ThemedText>
                    <ThemedText style={styles.detailValue}>₹{selectedCoupon.minOrderValue}</ThemedText>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Valid Till:</ThemedText>
                  <ThemedText style={styles.detailValue}>{formatDate(selectedCoupon.validTo)}</ThemedText>
                </View>

                {selectedCoupon.termsAndConditions.length > 0 && (
                  <View style={styles.termsContainer}>
                    <ThemedText style={styles.termsTitle}>Terms & Conditions:</ThemedText>
                    {selectedCoupon.termsAndConditions.map((term, index) => (
                      <ThemedText key={index} style={styles.termItem}>
                        • {term}
                      </ThemedText>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  refreshButton: {
    padding: 8,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFF',
  },
  tabText: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  couponsContainer: {
    padding: 16,
  },
  couponCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  couponGradient: {
    padding: 16,
  },
  couponHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  couponBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  couponCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  featuredText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  discountContainer: {
    marginBottom: 12,
  },
  discountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  maxDiscount: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
    marginTop: 4,
  },
  couponTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  couponDescription: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  minOrder: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 12,
  },
  couponFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validityText: {
    fontSize: 12,
    color: '#FFF',
    opacity: 0.9,
  },
  claimButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  claimedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  claimedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  availableBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
  },
  usedBadge: {
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
  },
  expiredBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
  },
  statusText: {
    fontSize: 11,
    color: '#FFF',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
  },
  expiringBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  expiringText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  termsContainer: {
    marginTop: 20,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  termItem: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 20,
  },
});
