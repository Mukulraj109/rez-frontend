/**
 * Pay In Store - Entry Screen
 *
 * Entry point for store payment flow with ReZ brand design.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRScanner from '@/components/store-payment/QRScanner';
import { StorePaymentInfo, PayInStoreParams } from '@/types/storePayment.types';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ReZ Brand Colors
const REZ_COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A05A',
  primaryLight: '#E8F5EE',
  gold: '#FFC857',
  navy: '#0B2240',
  slate: '#1F2D3D',
  gray: '#6B7280',
  lightGray: '#9CA3AF',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  error: '#EF4444',
  errorLight: '#FEF2F2',
};

export default function PayInStoreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<PayInStoreParams>();
  const { state } = useAuth();

  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recentStores, setRecentStores] = useState<StorePaymentInfo[]>([]);
  const [loadingRecentStores, setLoadingRecentStores] = useState(true);

  // Load recent stores only once on mount
  useEffect(() => {
    loadRecentStores();
  }, []);

  // Handle QR code or storeId from params separately
  useEffect(() => {
    if (params.qrCode) {
      handleQRScan(params.qrCode);
    }
    if (params.storeId) {
      navigateToEnterAmount(params.storeId, params.storeName || 'Store');
    }
  }, [params.qrCode, params.storeId, params.storeName]);

  const loadRecentStores = async () => {
    try {
      setLoadingRecentStores(true);
      const response = await apiClient.get('/store-payment/history?limit=5');
      if (response.success && response.data?.transactions) {
        const stores: StorePaymentInfo[] = [];
        const seenIds = new Set<string>();
        for (const tx of response.data.transactions) {
          if (!seenIds.has(tx.storeId)) {
            seenIds.add(tx.storeId);
            stores.push({
              _id: tx.storeId,
              name: tx.storeName,
              slug: '',
              logo: tx.storeLogo,
              category: { _id: '', name: '', slug: '' },
              location: { address: '', city: '' },
              paymentSettings: {} as any,
              rewardRules: {} as any,
              ratings: { average: 0, count: 0 },
              isActive: true,
            });
          }
        }
        setRecentStores(stores);
      }
    } catch (err) {
      console.log('Failed to load recent stores:', err);
    } finally {
      setLoadingRecentStores(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setShowScanner(false);

      console.log('🔍 Looking up QR code:', qrCode);
      const response = await apiClient.get(`/store-payment/lookup/${qrCode}`);
      console.log('📦 Lookup response:', response);

      if (response.success && response.data) {
        const store = response.data as StorePaymentInfo;
        console.log('✅ Store found:', store.name);
        navigateToEnterAmount(store._id, store.name, store.logo);
      } else {
        console.log('❌ Store not found:', response.error);
        setError(response.error || 'Store not found. Please try again.');
      }
    } catch (err: any) {
      console.error('QR lookup error:', err);
      setError(err.message || 'Failed to find store. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToEnterAmount = (storeId: string, storeName: string, storeLogo?: string) => {
    router.push({
      pathname: '/pay-in-store/enter-amount',
      params: { storeId, storeName, storeLogo: storeLogo || '' },
    });
  };

  const handleManualEntry = () => {
    setShowScanner(false);
    router.push('/pay-in-store/store-search');
  };

  // Show loading while auth state is being loaded
  if (state.isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={REZ_COLORS.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!state.isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContent}>
          <View style={styles.authIconContainer}>
            <Ionicons name="lock-closed-outline" size={48} color={REZ_COLORS.primary} />
          </View>
          <Text style={styles.authTitle}>Sign in Required</Text>
          <Text style={styles.authSubtitle}>
            Please sign in to pay at stores and earn rewards
          </Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/sign-in')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showScanner) {
    return (
      <QRScanner
        onScan={handleQRScan}
        onClose={() => setShowScanner(false)}
        onManualEntry={handleManualEntry}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={REZ_COLORS.navy} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay at Store</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Action Card - Scan QR */}
        <TouchableOpacity
          style={styles.mainActionCard}
          onPress={() => setShowScanner(true)}
          disabled={isLoading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[REZ_COLORS.primary, REZ_COLORS.primaryDark]}
            style={styles.mainActionGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <>
                <View style={styles.qrIconContainer}>
                  <Ionicons name="qr-code" size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.mainActionTitle}>Scan & Pay</Text>
                <Text style={styles.mainActionSubtitle}>
                  Scan QR code at store counter to pay instantly
                </Text>
                <View style={styles.scanButtonIndicator}>
                  <Text style={styles.scanButtonText}>Tap to Scan</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </View>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Actions Row */}
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/pay-in-store/store-search')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: REZ_COLORS.primaryLight }]}>
              <Ionicons name="search" size={22} color={REZ_COLORS.primary} />
            </View>
            <Text style={styles.quickActionTitle}>Search</Text>
            <Text style={styles.quickActionSubtitle}>Find stores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/offers')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FFF7E6' }]}>
              <Ionicons name="pricetag" size={22} color={REZ_COLORS.gold} />
            </View>
            <Text style={styles.quickActionTitle}>Offers</Text>
            <Text style={styles.quickActionSubtitle}>View deals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/WalletScreen')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="wallet" size={22} color="#6366F1" />
            </View>
            <Text style={styles.quickActionTitle}>Wallet</Text>
            <Text style={styles.quickActionSubtitle}>ReZ Coins</Text>
          </TouchableOpacity>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={REZ_COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Ionicons name="close-circle" size={20} color={REZ_COLORS.error} />
            </TouchableOpacity>
          </View>
        )}

        {/* Recently Paid Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recently Paid</Text>
            {recentStores.length > 0 && (
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {loadingRecentStores ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={REZ_COLORS.primary} />
            </View>
          ) : recentStores.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentStoresScroll}
            >
              {recentStores.map((store) => (
                <TouchableOpacity
                  key={store._id}
                  style={styles.recentStoreCard}
                  onPress={() => navigateToEnterAmount(store._id, store.name, store.logo)}
                >
                  <View style={styles.recentStoreIcon}>
                    {store.logo ? (
                      <Image source={{ uri: store.logo }} style={styles.storeImage} />
                    ) : (
                      <Ionicons name="storefront" size={24} color={REZ_COLORS.primary} />
                    )}
                  </View>
                  <Text style={styles.recentStoreName} numberOfLines={1}>
                    {store.name}
                  </Text>
                  <Text style={styles.payAgainText}>Pay Again</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={32} color={REZ_COLORS.lightGray} />
              <Text style={styles.emptyText}>No recent payments</Text>
              <Text style={styles.emptySubtext}>Your payment history will appear here</Text>
            </View>
          )}
        </View>

        {/* How It Works Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>

          <View style={styles.stepsCard}>
            {[
              { icon: 'qr-code-outline', title: 'Scan QR', desc: 'Scan at store counter' },
              { icon: 'calculator-outline', title: 'Enter Amount', desc: 'Add bill amount' },
              { icon: 'gift-outline', title: 'Earn Rewards', desc: 'Get coins & cashback' },
            ].map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepIconContainer}>
                  <View style={styles.stepIcon}>
                    <Ionicons name={step.icon as any} size={20} color={REZ_COLORS.primary} />
                  </View>
                  {index < 2 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepTextContainer}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Benefits Banner */}
        <View style={styles.benefitsBanner}>
          <View style={styles.benefitItem}>
            <Ionicons name="shield-checkmark" size={20} color={REZ_COLORS.primary} />
            <Text style={styles.benefitText}>Secure Payments</Text>
          </View>
          <View style={styles.benefitDivider} />
          <View style={styles.benefitItem}>
            <Ionicons name="flash" size={20} color={REZ_COLORS.gold} />
            <Text style={styles.benefitText}>Instant Rewards</Text>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: REZ_COLORS.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 16,
    color: REZ_COLORS.gray,
    marginTop: 12,
  },
  authIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: REZ_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: REZ_COLORS.navy,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 15,
    color: REZ_COLORS.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  signInButton: {
    backgroundColor: REZ_COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  signInButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: REZ_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: REZ_COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: REZ_COLORS.navy,
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  mainActionCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: REZ_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  mainActionGradient: {
    padding: 28,
    alignItems: 'center',
  },
  qrIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainActionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  mainActionSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  scanButtonIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  scanButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: REZ_COLORS.navy,
    marginBottom: 2,
  },
  quickActionSubtitle: {
    fontSize: 11,
    color: REZ_COLORS.lightGray,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: REZ_COLORS.errorLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: REZ_COLORS.error,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: REZ_COLORS.navy,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: REZ_COLORS.primary,
  },
  loadingCard: {
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  recentStoresScroll: {
    paddingRight: 16,
    gap: 12,
  },
  recentStoreCard: {
    width: 100,
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recentStoreIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: REZ_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    overflow: 'hidden',
  },
  storeImage: {
    width: 52,
    height: 52,
  },
  recentStoreName: {
    fontSize: 13,
    fontWeight: '600',
    color: REZ_COLORS.navy,
    textAlign: 'center',
    marginBottom: 4,
  },
  payAgainText: {
    fontSize: 11,
    color: REZ_COLORS.primary,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    color: REZ_COLORS.gray,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: REZ_COLORS.lightGray,
    marginTop: 4,
  },
  stepsCard: {
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stepIconContainer: {
    alignItems: 'center',
    marginRight: 14,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: REZ_COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepLine: {
    width: 2,
    height: 24,
    backgroundColor: REZ_COLORS.primaryLight,
    marginTop: 4,
  },
  stepTextContainer: {
    flex: 1,
    paddingTop: 8,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: REZ_COLORS.navy,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 13,
    color: REZ_COLORS.gray,
  },
  benefitsBanner: {
    flexDirection: 'row',
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  benefitText: {
    fontSize: 13,
    fontWeight: '500',
    color: REZ_COLORS.slate,
  },
  benefitDivider: {
    width: 1,
    height: 20,
    backgroundColor: REZ_COLORS.border,
    marginHorizontal: 20,
  },
});
