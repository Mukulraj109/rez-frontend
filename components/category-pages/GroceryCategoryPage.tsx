/**
 * Grocery & Essentials Category Page - ENHANCED
 * Based on Rez_v-2-main Grocery.jsx design
 * Features: Tabs (nearby, online, wholesale, organic), store cards, product cards,
 * bill upload, smart suggestions, streak card, 60-min delivery
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryHeader from '@/components/CategoryHeader';
import { getCategoryConfig } from '@/config/categoryConfig';
import QuickActionBar from '@/components/category/QuickActionBar';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';
// New enhanced components
import BrowseCategoryGrid from '@/components/category/BrowseCategoryGrid';
import EnhancedAISuggestionsSection from '@/components/category/EnhancedAISuggestionsSection';
import EnhancedUGCSocialProofSection from '@/components/category/EnhancedUGCSocialProofSection';
// API Hook for real data
import { useCategoryPageData } from '@/hooks/useCategoryPageData';
// Error and Loading States
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { useRegion } from '@/contexts/RegionContext';

// Rez Brand Colors
const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

const GROCERY_TABS = [
  { id: 'nearby', label: 'Nearby', icon: 'location-outline' },
  { id: 'online', label: 'Online', icon: 'cart-outline' },
  { id: 'wholesale', label: 'Wholesale', icon: 'cube-outline' },
  { id: 'organic', label: 'Organic', icon: 'leaf-outline' },
];

// Store Card Component
const StoreCard = ({ store, variant = 'default' }: { store: any; variant?: 'default' | 'compact' }) => {
  const router = useRouter();
  const isCompact = variant === 'compact';

  if (isCompact) {
    return (
      <TouchableOpacity
        style={styles.storeCardCompact}
        onPress={() => router.push(`/StorePage?storeId=${store._id || store.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.storeLogoCompact}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.storeLogoImage} resizeMode="contain" />
          ) : (
            <Text style={styles.storeLogoEmoji}>🏪</Text>
          )}
        </View>
        <Text style={styles.storeNameCompact} numberOfLines={1}>{store.name}</Text>
        <View style={styles.storeRatingCompact}>
          <Ionicons name="star" size={12} color={COLORS.primaryGold} />
          <Text style={styles.storeRatingTextCompact}>
            {store.ratings?.average?.toFixed(1) || '4.5'}
          </Text>
        </View>
        <View style={styles.storeBadgesCompact}>
          <View style={styles.storeBadgeCompact}>
            <Text style={styles.storeBadgeTextCompact}>{store.offers?.cashback || 10}% Cashback</Text>
          </View>
          {store.deliveryCategories?.fastDelivery && (
            <View style={styles.storeBadge60Compact}>
              <Ionicons name="flash" size={10} color="#000" />
              <Text style={styles.storeBadge60TextCompact}>60-min</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => router.push(`/StorePage?storeId=${store._id || store.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.storeCardContent}>
        <View style={styles.storeLogo}>
          {store.logo ? (
            <Image source={{ uri: store.logo }} style={styles.storeLogoImage} resizeMode="contain" />
          ) : (
            <Text style={styles.storeLogoEmoji}>🏪</Text>
          )}
        </View>
        <View style={styles.storeInfo}>
          <View style={styles.storeHeader}>
            <Text style={styles.storeName} numberOfLines={1}>{store.name}</Text>
            {store.isOpen && (
              <View style={styles.storeOpenBadge}>
                <View style={styles.storeOpenDot} />
                <Text style={styles.storeOpenText}>Open</Text>
              </View>
            )}
          </View>
          <View style={styles.storeMeta}>
            <View style={styles.storeMetaItem}>
              <Ionicons name="star" size={14} color={COLORS.primaryGold} />
              <Text style={styles.storeMetaText}>
                {store.ratings?.average?.toFixed(1) || '4.5'} ({store.ratings?.count || 0})
              </Text>
            </View>
            <View style={styles.storeMetaItem}>
              <Ionicons name="location-outline" size={14} color={COLORS.textSecondary} />
              <Text style={styles.storeMetaText}>{store.location?.city || 'Nearby'}</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.storeFooter}>
        <View style={styles.storeCoins}>
          <Ionicons name="star" size={16} color={COLORS.primaryGold} />
          <Text style={styles.storeCoinsText}>{store.offers?.cashback || 10}% ReZ Coins</Text>
        </View>
        <TouchableOpacity style={styles.storeActionButton}>
          <Text style={styles.storeActionText}>
            {store.type === 'online' ? 'Order Now' : 'Pay in Store'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

// Product Card Component
const ProductCard = ({ product, currencySymbol }: { product: any; currencySymbol: string }) => {
  const router = useRouter();
  const originalPrice = product.originalPrice || product.price * 1.2;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/ProductPage?productId=${product._id || product.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/150' }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.tag && (
          <View style={styles.productTag}>
            <Text style={styles.productTagText}>{product.tag}</Text>
          </View>
        )}
        {product.deliveryCategories?.fastDelivery && (
          <View style={styles.productBadge60}>
            <Ionicons name="flash" size={10} color="#000" />
            <Text style={styles.productBadge60Text}>60-min</Text>
          </View>
        )}
      </View>
      <Text style={styles.productBrand} numberOfLines={1}>
        {product.brand?.name || product.brand || 'Brand'}
      </Text>
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.productUnit}>{product.unit || '1 unit'}</Text>
      <View style={styles.productPriceRow}>
        <Text style={styles.productPrice}>{currencySymbol}{product.price?.toLocaleString() || '0'}</Text>
        {discount > 0 && (
          <Text style={styles.productOriginalPrice}>{currencySymbol}{originalPrice.toLocaleString()}</Text>
        )}
        <TouchableOpacity style={styles.productAddButton}>
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>
      <View style={styles.productCoins}>
        <Ionicons name="star" size={12} color={COLORS.primaryGold} />
        <Text style={styles.productCoinsText}>+{Math.floor(product.price * 0.01)} coins</Text>
      </View>
    </TouchableOpacity>
  );
};

export default function GroceryCategoryPage() {
  const router = useRouter();
  const slug = 'grocery-essentials';
  const categoryConfig = getCategoryConfig(slug);
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // Use the new hook for real data with fallback
  const {
    subcategories,
    stores,
    products,
    ugcPosts,
    aiPlaceholders,
    isLoading,
    error,
    refetch,
  } = useCategoryPageData(slug);

  const [activeTab, setActiveTab] = useState('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [offerTab, setOfferTab] = useState('today');

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Filter stores by tab - simplified for hook data
  const filteredStores = stores;
  const fastDeliveryStores = stores.filter((s: any) => s.is60Min);

  // Handle category press - navigate to subcategory page with stores + products
  const handleCategoryPress = (category: any) => {
    router.push(`/category/${slug}/subcategory/${category.slug || category.id}` as any);
  };

  // Handle AI search
  const handleAISearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&category=${slug}`);
  };

  if (!categoryConfig) return null;

  // Show loading state
  if (isLoading && !refreshing && stores.length === 0) {
    return <LoadingState message="Loading groceries..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('GroceryCategoryPage Error:', err)}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[categoryConfig.primaryColor]} />
      }
    >
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Value Strip */}
      <View style={styles.valueStrip}>
        <LinearGradient
          colors={['rgba(0, 192, 106, 0.2)', 'rgba(0, 137, 107, 0.2)']}
          style={styles.valueGradient}
        >
          <Text style={styles.valueText}>
            💸 Save on daily essentials. Earn ReZ Coins on every purchase.
          </Text>
        </LinearGradient>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {GROCERY_TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            >
              <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <QuickActionBar categorySlug={slug} />

      {/* Enhanced AI Suggestions Section */}
      <EnhancedAISuggestionsSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        placeholders={aiPlaceholders}
        onSearch={handleAISearch}
      />

      {/* Browse Category Grid */}
      <BrowseCategoryGrid
        categories={subcategories}
        title="Shop by Category"
        onCategoryPress={handleCategoryPress}
      />

      {/* 60-Min Delivery */}
      {fastDeliveryStores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color={COLORS.primaryGold} />
            <Text style={styles.sectionTitle}>60-Min Delivery</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}&filter=fast-delivery`)}>
              <Text style={styles.sectionSeeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesList}>
            {fastDeliveryStores.slice(0, 5).map((store) => (
              <StoreCard key={store._id || store.id} store={store} variant="compact" />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Nearby Stores */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="location-outline" size={20} color={COLORS.textSecondary} />
          <Text style={styles.sectionTitle}>
            {activeTab === 'nearby' ? 'Nearby Stores' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Stores`}
          </Text>
          <Text style={styles.sectionCount}>{filteredStores.length} stores</Text>
        </View>
        <View style={styles.storesGrid}>
          {filteredStores.map((store) => (
            <StoreCard key={store._id || store.id} store={store} />
          ))}
        </View>
      </View>

      {/* Popular Products */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🛒</Text>
            <Text style={styles.sectionTitle}>Popular Products</Text>
            <TouchableOpacity onPress={() => router.push(`/products?category=${slug}`)}>
              <Text style={styles.sectionSeeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsList}>
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Deals Zone */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🏷️</Text>
          <Text style={styles.sectionTitle}>Deals Zone</Text>
        </View>
        <View style={styles.offersTabs}>
          {['Today', 'This Week', 'Best Deals'].map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setOfferTab(tab.toLowerCase().replace(' ', '-'))}
              style={[styles.offerTab, offerTab === tab.toLowerCase().replace(' ', '-') && styles.offerTabActive]}
            >
              <Text style={[styles.offerTabText, offerTab === tab.toLowerCase().replace(' ', '-') && styles.offerTabTextActive]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bill Upload Banner */}
      <View style={styles.billUploadBanner}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.2)', 'rgba(0, 192, 106, 0.2)']}
          style={styles.billUploadGradient}
        >
          <View style={styles.billUploadContent}>
            <Ionicons name="cloud-upload-outline" size={32} color="#3B82F6" />
            <View style={styles.billUploadText}>
              <Text style={styles.billUploadTitle}>Upload Grocery Bill</Text>
              <Text style={styles.billUploadSubtitle}>Get cashback on any grocery purchase</Text>
            </View>
            <TouchableOpacity style={styles.billUploadButton} onPress={() => router.push('/bill-upload')}>
              <Text style={styles.billUploadButtonText}>Upload</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Smart Suggestions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primaryGold} />
          <Text style={styles.sectionTitle}>Smart Suggestions</Text>
        </View>
        <View style={styles.suggestionsList}>
          {['Buy 2 Get 1 Free on Detergents', 'Stock up on Rice - Best Price', 'Fresh Vegetables - 20% Off'].map((suggestion, index) => (
            <TouchableOpacity key={index} style={styles.suggestionCard} onPress={() => router.push(`/search?q=${encodeURIComponent(suggestion)}&category=${slug}`)}>
              <Ionicons name="sparkles-outline" size={16} color={COLORS.primaryGold} />
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      {/* Enhanced UGC Social Proof Section */}
      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Smart Shoppers, Real Savings"
        subtitle="See how others are saving on groceries!"
        onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
        onSharePress={() => router.push('/share' as any)}
      />

      <FooterTrustSection />
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 100 },
  valueStrip: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  valueGradient: { padding: 16 },
  valueText: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary },
  tabsContainer: { backgroundColor: COLORS.white, paddingVertical: 8, marginTop: 12 },
  tabs: { paddingHorizontal: 16, gap: 8 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  tabActive: { backgroundColor: COLORS.primaryGreen },
  tabLabel: { fontSize: 14, color: COLORS.textSecondary },
  tabLabelActive: { color: COLORS.white, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  sectionCount: { fontSize: 12, color: COLORS.textSecondary },
  storesList: { gap: 12, paddingRight: 16 },
  storeCardCompact: {
    width: 180,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  storeLogoCompact: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeLogoImage: { width: 40, height: 40 },
  storeLogoEmoji: { fontSize: 20 },
  storeNameCompact: { fontSize: 14, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 4 },
  storeRatingCompact: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  storeRatingTextCompact: { fontSize: 12, color: COLORS.textPrimary },
  storeBadgesCompact: { gap: 6 },
  storeBadgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  storeBadgeTextCompact: { fontSize: 11, color: COLORS.primaryGreen, fontWeight: '500' },
  storeBadge60Compact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGold,
    gap: 3,
  },
  storeBadge60TextCompact: { fontSize: 10, fontWeight: '700', color: '#000' },
  storesGrid: { gap: 12 },
  storeCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  storeCardContent: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  storeLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: { flex: 1 },
  storeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  storeName: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.textPrimary },
  storeOpenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeOpenDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primaryGreen },
  storeOpenText: { fontSize: 11, color: COLORS.primaryGreen, fontWeight: '500' },
  storeMeta: { flexDirection: 'row', gap: 12 },
  storeMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeMetaText: { fontSize: 12, color: COLORS.textSecondary },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  storeCoins: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  storeCoinsText: { fontSize: 13, color: COLORS.primaryGold, fontWeight: '500' },
  storeActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.primaryGreen,
  },
  storeActionText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  productsList: { gap: 12, paddingRight: 16 },
  productCard: {
    width: 140,
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  productImageContainer: { width: '100%', height: 120, borderRadius: 8, marginBottom: 8, position: 'relative' },
  productImage: { width: '100%', height: '100%', borderRadius: 8 },
  productTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
  },
  productTagText: { fontSize: 9, fontWeight: '600', color: COLORS.white },
  productBadge60: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: COLORS.primaryGold,
    gap: 2,
  },
  productBadge60Text: { fontSize: 8, fontWeight: '700', color: '#000' },
  productBrand: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  productName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  productUnit: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  productPriceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  productPrice: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  productOriginalPrice: { fontSize: 11, color: COLORS.textSecondary, textDecorationLine: 'line-through' },
  productAddButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productCoins: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  productCoinsText: { fontSize: 11, color: COLORS.primaryGold },
  offersTabs: { flexDirection: 'row', gap: 8, marginTop: 8 },
  offerTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)' },
  offerTabActive: { backgroundColor: COLORS.primaryGreen },
  offerTabText: { fontSize: 13, fontWeight: '500', color: '#374151' },
  offerTabTextActive: { color: COLORS.white },
  billUploadBanner: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden' },
  billUploadGradient: { padding: 16 },
  billUploadContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  billUploadText: { flex: 1 },
  billUploadTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  billUploadSubtitle: { fontSize: 13, color: COLORS.textSecondary },
  billUploadButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#3B82F6' },
  billUploadButtonText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  suggestionsList: { gap: 8 },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    gap: 8,
  },
  suggestionText: { flex: 1, fontSize: 13, color: '#374151' },
});
