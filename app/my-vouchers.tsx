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
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

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
}

const MyVouchersPage = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { state: authState } = useAuth();
  const { state: cartState, actions } = useCart();
  const [vouchers, setVouchers] = useState<UserVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<VoucherStatus>('active');
  const [selectedVoucher, setSelectedVoucher] = useState<UserVoucher | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);

  const handleBackPress = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/account' as any);
    }
  }, [router]);

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);

      if (authState.isLoading) {
        console.log('⏳ Auth still loading, waiting...');
        return;
      }

      if (!authState.isAuthenticated || !authState.token) {
        console.log('❌ Not authenticated, cannot fetch vouchers');
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

      // Fetch user vouchers from API
      const response = await vouchersService.getUserVouchers(params);

      console.log('📦 Vouchers API response:', response);

      // Handle both data structures: response.data (array) or response.data.vouchers (object with array)
      const vouchersArray = Array.isArray(response.data)
        ? response.data
        : response.data?.vouchers || [];

      if (vouchersArray.length > 0) {
        // Map backend voucher format to frontend UserVoucher format
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

        console.log('✅ Mapped vouchers:', mappedVouchers.length);
        setVouchers(mappedVouchers);
      } else {
        console.log('❌ No vouchers found in response');
        setVouchers([]);
      }
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

  const confirmUseVoucher = async () => {
    if (!selectedVoucher) return;

    Alert.alert(
      'Confirm Usage',
      `Are you sure you want to use this ${selectedVoucher.brandName} voucher worth ₹${selectedVoucher.value}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Use Now',
          onPress: async () => {
            try {
              await vouchersService.useVoucher(selectedVoucher.id, {});
              Alert.alert('Success!', 'Voucher has been redeemed successfully');
              setShowQRModal(false);
              setSelectedVoucher(null);
              fetchVouchers(); // Refresh vouchers list
            } catch (error) {
              Alert.alert('Error', 'Failed to redeem voucher');
            }
          },
        },
      ]
    );
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
            <Text style={styles.valueAmount}>₹{item.value}</Text>
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

              <TouchableOpacity
                style={styles.useVoucherButton}
                onPress={() => handleUseVoucher(item)}
              >
                <Ionicons name="qr-code-outline" size={18} color="#FFFFFF" />
                <Text style={styles.useVoucherButtonText}>Use at Store</Text>
              </TouchableOpacity>
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
            <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
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
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
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
      <Modal
        visible={showQRModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowQRModal(false)}
            >
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>

            {selectedVoucher && (
              <>
                <Text style={styles.modalTitle}>Use Voucher at Store</Text>
                <Text style={styles.modalBrandName}>{selectedVoucher.brandName}</Text>

                <View style={styles.qrCodePlaceholder}>
                  {/* TODO: Replace with actual QR code component */}
                  <Ionicons name="qr-code-outline" size={120} color="#F59E0B" />
                  <Text style={styles.qrPlaceholderText}>QR Code</Text>
                </View>

                <View style={styles.modalCodeSection}>
                  <Text style={styles.modalCodeLabel}>Voucher Code</Text>
                  <Text style={styles.modalCodeText}>{selectedVoucher.code}</Text>
                  <TouchableOpacity
                    style={styles.modalCopyButton}
                    onPress={() => handleCopyCode(selectedVoucher.code)}
                  >
                    <Ionicons name="copy-outline" size={20} color="#F59E0B" />
                    <Text style={styles.modalCopyText}>Copy Code</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.modalValueSection}>
                  <Text style={styles.modalValueLabel}>Value</Text>
                  <Text style={styles.modalValue}>₹{selectedVoucher.value}</Text>
                </View>

                <Text style={styles.modalInstructions}>
                  Show this QR code or code to the cashier at the store to redeem your voucher
                </Text>

                <TouchableOpacity
                  style={styles.confirmUseButton}
                  onPress={confirmUseVoucher}
                >
                  <Text style={styles.confirmUseButtonText}>Mark as Used</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  useVoucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
  },
  useVoucherButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F59E0B',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalCloseButton: {
    alignSelf: 'flex-end',
    padding: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalBrandName: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  qrCodePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
  },
  qrPlaceholderText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  modalCodeSection: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  modalCodeLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  modalCodeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 2,
    marginBottom: 12,
  },
  modalCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  modalCopyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
  },
  modalValueSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalValueLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  modalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F59E0B',
  },
  modalInstructions: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  confirmUseButton: {
    backgroundColor: '#F59E0B',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmUseButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default MyVouchersPage;
