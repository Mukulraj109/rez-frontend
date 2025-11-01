// My Vouchers Page
// Shows user's owned vouchers and gift cards

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
  Image,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import vouchersService from '@/services/realVouchersApi';
import realOffersApi from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useSafeNavigation } from '@/hooks/useSafeNavigation';
import { HeaderBackButton } from '@/components/navigation';
import QRCodeModal from '@/components/vouchers/QRCodeModal';
import OnlineRedemptionModal from '@/components/voucher/OnlineRedemptionModal';

type VoucherStatus = 'all' | 'active' | 'used' | 'expired';

interface UserVoucher {
  id: string;
  code: string;
  brandName: string;
  brandLogo?: string;
  value: number;
  description: string;
  expiryDate: string;
  status: 'active' | 'used' | 'expired';
  usedAt?: string;
  category: string;
  restrictions?: {
    minOrderValue?: number;
    maxDiscountAmount?: number;
    usageLimitPerUser?: number;
  };
}

const MyVouchersPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { state: cartState, actions } = useCart();
  const { goBack } = useSafeNavigation();
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<VoucherStatus>('active');
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);

  const handleBackPress = useCallback(() => {
    goBack('/account' as any);
  }, [goBack]);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);

      if (authState.isLoading) {
        return;
      }

      if (!authState.isAuthenticated || !authState.token) {
        setVouchers([]);
        setLoading(false);
        return;
      }

      const params: any = {
        page: 1,
        limit: 50
      };

      if (activeTab !== 'all') {
        params.status = activeTab;
      }

      // Fetch BOTH gift card vouchers AND offer redemptions
      const [vouchersResponse, redemptionsResponse] = await Promise.all([
        vouchersService.getUserVouchers(params).catch(() => ({ data: [] })),
        realOffersApi.getUserRedemptions(params).catch(() => ({ data: [] }))
      ]);

      console.log('[MY VOUCHERS] Vouchers response:', vouchersResponse);
      console.log('[MY VOUCHERS] Redemptions response:', redemptionsResponse);

      const allVouchers: UserVoucher[] = [];

      // 1. Map gift card vouchers
      const vouchersArray = vouchersResponse.data || [];
      if (vouchersArray.length > 0) {
        const mappedVouchers: UserVoucher[] = vouchersArray.map((voucher: any) => ({
          id: voucher._id || voucher.id,
          code: voucher.voucherCode,
          brandName: voucher.brand?.name || 'Unknown Brand',
          brandLogo: voucher.brand?.logo,
          value: voucher.denomination,
          description: voucher.brand?.description || `₹${voucher.denomination} voucher`,
          expiryDate: voucher.expiryDate,
          status: voucher.status,
          usedAt: voucher.usedAt,
          category: voucher.brand?.category || 'General'
        }));
        allVouchers.push(...mappedVouchers);
      }

      // 2. Map offer redemptions (cashback vouchers)
      const redemptionsArray = redemptionsResponse.data || [];
      console.log('[MY VOUCHERS] Redemptions array:', redemptionsArray);
      
      if (redemptionsArray.length > 0) {
        const mappedRedemptions: UserVoucher[] = redemptionsArray.map((redemption: any) => {
          const offerTitle = redemption.offer?.title || 'Cashback Offer';
          
          // Get cashback info - prefer percentage over fixed amount
          const cashbackPercentage = redemption.cashbackPercentage || 
                                    redemption.offer?.cashbackPercentage || 0;
          
          const usedAmount = redemption.usedAmount;
          
          // If used, show actual amount saved, otherwise show percentage
          let displayValue: number;
          let displayDescription: string;
          
          if (usedAmount) {
            displayValue = usedAmount;
            displayDescription = `Cashback saved - Used on order`;
          } else if (cashbackPercentage) {
            displayValue = cashbackPercentage;
            displayDescription = `Get ${cashbackPercentage}% cashback - Use during checkout`;
          } else {
            displayValue = 0;
            displayDescription = `Cashback voucher - Use during checkout`;
          }
          
          // Map redemption status to voucher status
          let voucherStatus: 'active' | 'used' | 'expired' = 'active';
          if (redemption.status === 'used') voucherStatus = 'used';
          else if (redemption.status === 'expired') voucherStatus = 'expired';
          
          return {
            id: redemption._id || redemption.id,
            code: redemption.redemptionCode,
            brandName: offerTitle,
            brandLogo: redemption.offer?.image,
            value: displayValue,
            description: displayDescription,
            expiryDate: redemption.expiryDate,
            status: voucherStatus,
            usedAt: redemption.usedAt,
            category: usedAmount ? 'Used' : `${cashbackPercentage}% Cashback`,
            restrictions: redemption.restrictions || redemption.offer?.restrictions
          };
        });
        console.log('[MY VOUCHERS] Mapped redemptions:', mappedRedemptions);
        allVouchers.push(...mappedRedemptions);
      }

      console.log('[MY VOUCHERS] Total vouchers:', allVouchers.length);
      setVouchers(allVouchers);
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      setVouchers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeTab, authState.isLoading, authState.isAuthenticated, authState.token]);

  useEffect(() => {
    if (!authState.isLoading && authState.isAuthenticated) {
      fetchVouchers();
    }
  }, [fetchVouchers, authState.isLoading, authState.isAuthenticated]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchVouchers();
  }, [fetchVouchers]);

  const filteredVouchers = vouchers.filter((voucher) => {
    if (activeTab === 'all') return true;
    return voucher.status === activeTab;
  });

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied to Clipboard!', `Voucher code "${code}" has been copied to clipboard`);
  };

  const handleApplyVoucher = async (voucher: UserVoucher) => {
    // Check if cart has items first
    if (!cartState.items || cartState.items.length === 0) {
      Alert.alert(
        'Cart is Empty',
        'Please add items to your cart before applying this voucher.',
        [
          {
            text: 'Browse Products',
            onPress: () => router.push('/(tabs)' as any),
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
      return;
    }

    // Copy voucher code to clipboard and navigate to cart
    await Clipboard.setStringAsync(voucher.code);

    Alert.alert(
      'Voucher Code Copied!',
      `Voucher code "${voucher.code}" has been copied to clipboard. You can paste it in the cart to apply the discount.`,
      [
        {
          text: 'Go to Cart',
          onPress: () => router.push('/CartPage' as any),
        },
        { text: 'OK', style: 'cancel' },
      ]
    );
  };

  const handleShareVoucher = async (voucher: UserVoucher) => {
    try {
      const message = `🎁 Check out this amazing voucher!\n\n` +
        `${voucher.brandName} - ₹${voucher.value}\n` +
        `Code: ${voucher.code}\n` +
        `Valid till: ${new Date(voucher.expiryDate).toLocaleDateString()}\n\n` +
        `Download REZ app to get exclusive vouchers and cashback!`;

      await Share.share({
        message,
        title: `${voucher.brandName} Voucher`
      });
    } catch (error) {
      console.error('Error sharing voucher:', error);
    }
  };

  const handleUseVoucher = (voucher: UserVoucher) => {
    setSelectedVoucher(voucher);
    setShowQRModal(true);
  };

  const handleUseOnline = (voucher: UserVoucher) => {
    // Show online redemption modal
    setSelectedVoucher(voucher);
    setShowRedemptionModal(true);
  };

  const handleMarkAsUsed = async (voucherId: string) => {
    try {
      // Call API to mark voucher as used
      await vouchersService.useVoucher(voucherId, {
        usageLocation: 'online'
      });

      // Refresh vouchers list
      await fetchVouchers();
    } catch (error) {
      console.error('Error marking voucher as used:', error);
      throw error; // Re-throw to let modal handle error display
    }
  };

  const confirmUseVoucher = async () => {
    if (!selectedVoucher) return;

    try {
      await vouchersService.useVoucher(selectedVoucher.id, {});
      Alert.alert('Success!', 'Voucher has been redeemed successfully');
      setShowQRModal(false);
      setSelectedVoucher(null);
      fetchVouchers(); // Refresh vouchers list
    } catch (error) {
      console.error('Error marking voucher as used:', error);
      Alert.alert('Error', 'Failed to redeem voucher. Please try again.');
    }
  };

  const renderVoucher = ({ item }: { item: UserVoucher }) => {
    const isExpired = item.status === 'expired';
    const isUsed = item.status === 'used';
    const isActive = item.status === 'active';

    return (
      <TouchableOpacity
        style={[styles.voucherCard, isExpired && styles.expiredCard]}
        activeOpacity={0.7}
        disabled={!isActive}
      >
        <LinearGradient
          colors={isActive ? ['#F59E0B', '#F97316'] : ['#D1D5DB', '#9CA3AF']}
          style={styles.voucherGradient}
        >
          {/* Brand Section */}
          <View style={styles.brandSection}>
            {item.brandLogo && (item.brandLogo.startsWith('http://') || item.brandLogo.startsWith('https://')) ? (
              <Image source={{ uri: item.brandLogo }} style={styles.brandLogo} />
            ) : (
              <View style={styles.brandLogoPlaceholder}>
                <Ionicons name="ticket" size={24} color="#FFFFFF" />
              </View>
            )}
            <View style={styles.brandInfo}>
              <Text style={styles.brandName}>{item.brandName}</Text>
              <Text style={styles.category}>{item.category}</Text>
            </View>
          </View>

          {/* Value Section */}
          <View style={styles.valueSection}>
            <Text style={styles.valueAmount}>
              {item.category?.includes('Cashback') && !item.usedAt ? `${item.value}%` : `₹${item.value}`}
            </Text>
            {isExpired && (
              <View style={styles.expiredBadge}>
                <Text style={styles.expiredText}>EXPIRED</Text>
              </View>
            )}
            {isUsed && (
              <View style={styles.usedBadge}>
                <Text style={styles.usedText}>USED</Text>
              </View>
            )}
          </View>

          {/* Code Section */}
          <View style={styles.codeSection}>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Code:</Text>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={() => handleCopyCode(item.code)}
            >
              <Ionicons name="copy-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Terms & Conditions - Only for cashback offers */}
          {item.restrictions && (item.restrictions.minOrderValue || item.restrictions.maxDiscountAmount) && (
            <View style={styles.termsContainer}>
              <Text style={styles.termsTitle}>Terms & Conditions:</Text>
              {item.restrictions.minOrderValue && (
                <View style={styles.termItem}>
                  <Ionicons name="checkmark-circle" size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.termText}>
                    Min. order: ₹{item.restrictions.minOrderValue}
                  </Text>
                </View>
              )}
              {item.restrictions.maxDiscountAmount && (
                <View style={styles.termItem}>
                  <Ionicons name="checkmark-circle" size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.termText}>
                    Max. discount: ₹{item.restrictions.maxDiscountAmount}
                  </Text>
                </View>
              )}
              {item.restrictions.usageLimitPerUser && (
                <View style={styles.termItem}>
                  <Ionicons name="checkmark-circle" size={14} color="rgba(255, 255, 255, 0.9)" />
                  <Text style={styles.termText}>
                    Can be used {item.restrictions.usageLimitPerUser} time{item.restrictions.usageLimitPerUser > 1 ? 's' : ''} per user
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Expiry Date */}
          <Text style={styles.expiryDate}>
            Valid till: {new Date(item.expiryDate).toLocaleDateString()}
          </Text>

          {/* Action Buttons */}
          {isActive && (
            <View style={styles.actionButtonsContainer}>
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={() => handleApplyVoucher(item)}
                >
                  <Ionicons name="cart-outline" size={16} color="#F59E0B" />
                  <Text style={styles.applyButtonText}>Apply to Cart</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.shareButton}
                  onPress={() => handleShareVoucher(item)}
                >
                  <Ionicons name="share-social-outline" size={18} color="#F59E0B" />
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtonsRow}>
                <TouchableOpacity
                  style={[styles.useVoucherButton, styles.useOnlineButton]}
                  onPress={() => handleUseOnline(item)}
                >
                  <Ionicons name="globe-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.useVoucherButtonText}>Use Online</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.useVoucherButton}
                  onPress={() => handleUseVoucher(item)}
                >
                  <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.useVoucherButtonText}>Use at Store</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="ticket-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Vouchers Yet</Text>
      <Text style={styles.emptyText}>
        Purchase vouchers and they will appear here
      </Text>
      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => router.push('/online-voucher' as any)}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.buyButtonText}>Buy Vouchers</Text>
      </TouchableOpacity>
    </View>
  );

  const tabs: { key: VoucherStatus; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'used', label: 'Used' },
    { key: 'expired', label: 'Expired' },
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />
        <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.header}>
          <View style={styles.headerContent}>
            <HeaderBackButton
              onPress={handleBackPress}
              iconColor="#FFFFFF"
              style={styles.backButton}
            />
            <Text style={styles.headerTitle}>My Vouchers</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F59E0B" />
          <Text style={styles.loadingText}>Loading vouchers...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" />

      {/* Header */}
      <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.header}>
        <View style={styles.headerContent}>
          <HeaderBackButton
            onPress={handleBackPress}
            iconColor="#FFFFFF"
            style={styles.backButton}
          />
          <Text style={styles.headerTitle}>My Vouchers</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/online-voucher' as any)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Vouchers List */}
      <FlatList
        data={filteredVouchers}
        renderItem={renderVoucher}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* QR Code Modal */}
      <QRCodeModal
        visible={showQRModal}
        voucher={
          selectedVoucher
            ? {
                id: selectedVoucher.id,
                code: selectedVoucher.code,
                brandName: selectedVoucher.brandName,
                brandLogo: selectedVoucher.brandLogo,
                value: selectedVoucher.value,
                description: selectedVoucher.description,
                expiryDate: selectedVoucher.expiryDate,
                userId: authState.user?.id || '',
              }
            : null
        }
        onClose={() => {
          setShowQRModal(false);
          setSelectedVoucher(null);
        }}
        onMarkAsUsed={confirmUseVoucher}
      />

      {/* Online Redemption Modal */}
      <OnlineRedemptionModal
        visible={showRedemptionModal}
        voucher={
          selectedVoucher
            ? {
                _id: selectedVoucher.id,
                voucherCode: selectedVoucher.code,
                denomination: selectedVoucher.value,
                expiryDate: selectedVoucher.expiryDate,
                brand: {
                  name: selectedVoucher.brandName,
                  logo: selectedVoucher.brandLogo || '',
                  backgroundColor: '#F3F4F6',
                  logoColor: '#000000',
                  websiteUrl: undefined, // TODO: Add website URL from brand data
                },
              }
            : null
        }
        onClose={() => {
          setShowRedemptionModal(false);
          setSelectedVoucher(null);
        }}
        onMarkAsUsed={handleMarkAsUsed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  activeTabText: {
    color: '#F59E0B',
  },
  listContainer: {
    padding: 16,
  },
  voucherCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  expiredCard: {
    opacity: 0.6,
  },
  voucherGradient: {
    padding: 16,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  brandLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    resizeMode: 'contain',
  },
  brandLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandInfo: {
    marginLeft: 12,
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  category: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  valueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  valueAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  expiredBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expiredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  usedBadge: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  usedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  codeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginRight: 8,
  },
  codeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  copyButton: {
    padding: 8,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  termsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  termsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 6,
  },
  termItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  termText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  expiryDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  actionButtonsContainer: {
    gap: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  applyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F59E0B',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  useVoucherButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingVertical: 12,
    borderRadius: 8,
  },
  useOnlineButton: {
    backgroundColor: '#3B82F6',
  },
  useVoucherButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default MyVouchersPage;
