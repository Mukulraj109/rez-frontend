/**
 * Pay In Store - Entry Screen (Find Store)
 *
 * Entry point for store payment flow with ReZ brand design.
 * Includes QR scanning and manual store search capabilities.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRScanner from '@/components/store-payment/QRScanner';
import { ScannerPlaceholder } from '@/components/store-payment';
import { FilterChips, StoreTabs, PaymentStoreCard } from '@/components/pay-store-search';
import { StorePaymentInfo, PayInStoreParams } from '@/types/storePayment.types';
import { usePaymentStoreSearch } from '@/hooks/usePaymentStoreSearch';
import apiClient from '@/services/apiClient';
import { useAuth } from '@/contexts/AuthContext';

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
  const searchInputRef = useRef<TextInput>(null);

  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use payment store search hook
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    filters,
    handleFilterChange,
    activeTab,
    handleTabChange,
    nearbyStores,
    popularStores,
    getFilteredStores,
    isInitialLoading,
  } = usePaymentStoreSearch();


  // Handle QR code or storeId from params
  useEffect(() => {
    if (params.qrCode) {
      handleQRScan(params.qrCode);
    }
    if (params.storeId) {
      navigateToEnterAmount(params.storeId, params.storeName || 'Store');
    }
  }, [params.qrCode, params.storeId, params.storeName]);

  const handleQRScan = async (qrCode: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setShowScanner(false);

      const response = await apiClient.get(`/store-payment/lookup/${qrCode}`);

      if (response.success && response.data) {
        const store = response.data as StorePaymentInfo;
        navigateToEnterAmount(store._id, store.name, store.logo);
      } else {
        setError(response.error || 'Store not found. Please try again.');
      }
    } catch (err: any) {
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

  const handleStorePress = (store: any) => {
    navigateToEnterAmount(store._id, store.name, store.logo);
  };

  const handleStoreView = (store: any) => {
    // Navigate to store details page
    router.push({
      pathname: '/store/[id]',
      params: { id: store._id },
    });
  };

  const scrollToSearch = () => {
    searchInputRef.current?.focus();
  };

  // Get filtered stores to display from backend data
  // When there's a search query, use searchResults; otherwise use nearbyStores or popularStores
  const hasSearchQuery = searchQuery.trim().length > 0;
  const baseStores = hasSearchQuery
    ? searchResults
    : (nearbyStores.length > 0 ? nearbyStores : popularStores);
  const displayStores = getFilteredStores(baseStores);

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
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Find Store</Text>
          <Text style={styles.headerSubtitle}>Scan QR or select store to pay & earn rewards</Text>
        </View>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Scanner Placeholder */}
        <ScannerPlaceholder onPress={() => setShowScanner(true)} />

        {/* Can't scan? Find store manually button */}
        <TouchableOpacity
          style={styles.manualSearchButton}
          onPress={scrollToSearch}
        >
          <Ionicons name="search-outline" size={20} color={REZ_COLORS.primary} />
          <Text style={styles.manualSearchText}>Can't scan? Find store manually</Text>
        </TouchableOpacity>

        {/* OR Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
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

        {/* Store Discovery Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose from nearby ReZ partner stores</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={REZ_COLORS.lightGray} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search store name, brand, or area"
              placeholderTextColor={REZ_COLORS.lightGray}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={REZ_COLORS.lightGray} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <View style={styles.filterChipsContainer}>
            <FilterChips
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </View>

          {/* Store Tabs */}
          <StoreTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />

          {/* Store List */}
          {isInitialLoading || isSearching ? (
            <View style={styles.loadingCard}>
              <ActivityIndicator size="small" color={REZ_COLORS.primary} />
              <Text style={styles.loadingText}>
                {isSearching ? 'Searching stores...' : 'Finding stores...'}
              </Text>
            </View>
          ) : displayStores.length > 0 ? (
            <View style={styles.storeList}>
              {displayStores.map((store, index) => (
                <PaymentStoreCard
                  key={store._id}
                  store={store}
                  onPress={handleStorePress}
                  onView={handleStoreView}
                  index={index}
                  variant="full"
                  showCTA={true}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Ionicons name="storefront-outline" size={48} color={REZ_COLORS.lightGray} />
              <Text style={styles.emptyText}>No stores found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'No partner stores available in your area'}
              </Text>
            </View>
          )}
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: REZ_COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: REZ_COLORS.gray,
    marginTop: 2,
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  manualSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: REZ_COLORS.primary,
    backgroundColor: REZ_COLORS.surface,
    gap: 8,
  },
  manualSearchText: {
    fontSize: 15,
    fontWeight: '600',
    color: REZ_COLORS.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: REZ_COLORS.border,
  },
  dividerText: {
    fontSize: 14,
    fontWeight: '600',
    color: REZ_COLORS.lightGray,
    marginHorizontal: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: REZ_COLORS.errorLight,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 16,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: REZ_COLORS.navy,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: REZ_COLORS.border,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: REZ_COLORS.navy,
  },
  loadingCard: {
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  emptyCard: {
    backgroundColor: REZ_COLORS.surface,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 16,
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
    textAlign: 'center',
  },
  filterChipsContainer: {
    marginBottom: 8,
  },
  storeList: {
    marginTop: 16,
  },
});
