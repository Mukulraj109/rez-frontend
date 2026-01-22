/**
 * Electronics Category Page - ENHANCED v2
 * Updated to use new BrowseCategoryGrid, EnhancedAISuggestionsSection,
 * EnhancedUGCSocialProofSection, VibeCard, and OccasionCard components
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryHeader from '@/components/CategoryHeader';
import { getCategoryConfig } from '@/config/categoryConfig';
import { useRegion } from '@/contexts/RegionContext';
import QuickActionBar from '@/components/category/QuickActionBar';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';

// New Enhanced Components
import BrowseCategoryGrid from '@/components/category/BrowseCategoryGrid';
import EnhancedAISuggestionsSection from '@/components/category/EnhancedAISuggestionsSection';
import EnhancedUGCSocialProofSection from '@/components/category/EnhancedUGCSocialProofSection';
import VibeCard from '@/components/category/VibeCard';
import OccasionCard from '@/components/category/OccasionCard';
import TrendingHashtagsSection from '@/components/category/TrendingHashtagsSection';

// Error and Loading States
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';

// API Hook for real data
import { useCategoryPageData } from '@/hooks/useCategoryPageData';
import { useWallet } from '@/hooks/useWallet';

// Fallback dummy data (for brands, bank offers, quick filters)
import {
  electronicsBrands,
  electronicsBankOffers,
  electronicsQuickFilters,
} from '@/data/category/electronicsCategoryData';

// Rez Brand Colors
const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  primaryBlue: '#3B82F6',
  purple: '#8B5CF6',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  background: '#F5F5F5',
  white: '#FFFFFF',
};

// Product Card Component
const ProductCard = ({ product, variant = 'default', currencySymbol }: { product: any; variant?: 'default' | 'compact'; currencySymbol: string }) => {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const isCompact = variant === 'compact';

  const originalPrice = product.originalPrice || product.price * 1.3;
  const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);

  if (isCompact) {
    return (
      <TouchableOpacity
        style={styles.productCardCompact}
        onPress={() => router.push(`/ProductPage?productId=${product._id || product.id}`)}
        activeOpacity={0.8}
      >
        <View style={styles.productImageContainerCompact}>
          <Image
            source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/200' }}
            style={styles.productImageCompact}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.productBadge}>
              <Text style={styles.productBadgeText}>{discount}% OFF</Text>
            </View>
          )}
        </View>
        <Text style={styles.productBrandCompact} numberOfLines={1}>
          {product.brand?.name || product.brand || 'Brand'}
        </Text>
        <Text style={styles.productNameCompact} numberOfLines={2}>
          {product.name}
        </Text>
        <View style={styles.productPriceCompact}>
          <Text style={styles.productPriceTextCompact}>{currencySymbol}{product.price?.toLocaleString() || '0'}</Text>
          {originalPrice > product.price && (
            <Text style={styles.productOriginalPriceCompact}>
              {currencySymbol}{originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
        <Text style={styles.productCashbackCompact}>
          {product.cashbackPercent || 10}% cashback
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/ProductPage?productId=${product._id || product.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.productCardContent}>
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: product.images?.[0] || product.image || 'https://via.placeholder.com/200' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {discount > 0 && (
            <View style={styles.productBadge}>
              <Text style={styles.productBadgeText}>{discount}% OFF</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.productLikeButton}
            onPress={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
          >
            <Ionicons
              name={liked ? 'heart' : 'heart-outline'}
              size={16}
              color={liked ? '#EF4444' : '#FFFFFF'}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {product.brand?.name || product.brand || 'Brand'}
          </Text>
          <Text style={styles.productName} numberOfLines={2}>
            {product.name}
          </Text>
          <View style={styles.productRating}>
            <Ionicons name="star" size={12} color={COLORS.primaryGold} />
            <Text style={styles.productRatingText}>
              {product.ratings?.average?.toFixed(1) || '4.5'}
            </Text>
            <Text style={styles.productRatingCount}>
              ({product.ratings?.count || 0})
            </Text>
          </View>
          <View style={styles.productPrice}>
            <Text style={styles.productPriceText}>{currencySymbol}{product.price?.toLocaleString() || '0'}</Text>
            {originalPrice > product.price && (
              <Text style={styles.productOriginalPrice}>
                {currencySymbol}{originalPrice.toLocaleString()}
              </Text>
            )}
          </View>
          <View style={styles.productCoins}>
            <Ionicons name="star" size={14} color={COLORS.primaryGold} />
            <Text style={styles.productCoinsText}>
              Earn {Math.floor(product.price * 0.01)} coins
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Brand Card Component
const BrandCard = ({ brand }: { brand: any }) => {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.brandCard}
      onPress={() => router.push(`/StorePage?storeId=${brand._id || brand.id}`)}
      activeOpacity={0.8}
    >
      <View style={styles.brandLogoContainer}>
        <Text style={styles.brandLogoEmoji}>{brand.logo || '🏪'}</Text>
      </View>
      <Text style={styles.brandName} numberOfLines={1}>
        {brand.name}
      </Text>
      {brand.tag && (
        <View style={styles.brandTag}>
          <Text style={styles.brandTagText}>{brand.tag}</Text>
        </View>
      )}
      <View style={styles.brandCashback}>
        <Text style={styles.brandCashbackText}>
          {brand.cashback || 10}% cashback
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Exclusive Offer Card
const ExclusiveOfferCard = ({ offer }: { offer: any }) => {
  return (
    <TouchableOpacity style={[styles.exclusiveCard, { backgroundColor: offer.color + '15' }]} activeOpacity={0.8}>
      <Text style={styles.exclusiveIcon}>{offer.icon}</Text>
      <Text style={styles.exclusiveTitle}>{offer.title}</Text>
      <Text style={[styles.exclusiveDiscount, { color: offer.color }]}>{offer.discount}</Text>
      <Text style={styles.exclusiveDescription}>{offer.description}</Text>
    </TouchableOpacity>
  );
};

export default function ElectronicsCategoryPage() {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const slug = 'electronics';
  const categoryConfig = getCategoryConfig(slug);

  // Use the new hook for real data with fallback
  const {
    subcategories,
    vibes,
    occasions,
    hashtags,
    stores,
    products,
    ugcPosts,
    exclusiveOffers,
    aiPlaceholders,
    isLoading,
    error,
    refetch,
  } = useCategoryPageData(slug);

  // Get wallet data for coin balance
  const { walletState } = useWallet({ autoFetch: true });
  const totalCoins = walletState.data?.totalBalance || 0;

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      setActiveFilters(activeFilters.filter(f => f !== filterId));
    } else {
      setActiveFilters([...activeFilters, filterId]);
    }
  };

  if (!categoryConfig) return null;

  // Show loading state
  if (isLoading && !refreshing && subcategories.length === 0) {
    return (
      <LoadingState message="Loading electronics collection..." />
    );
  }

  // Show error state with retry
  if (error && subcategories.length === 0) {
    return (
      <EmptyState
        icon="⚠️"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('[ElectronicsPage] Error:', err)}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primaryGreen]}
        />
      }
    >
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Loyalty Hub CTA */}
      <View style={styles.loyaltyHub}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.15)', 'rgba(6, 182, 212, 0.1)', 'rgba(251, 191, 36, 0.1)']}
          style={styles.loyaltyHubGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.loyaltyHubHeader}>
            <View style={[styles.loyaltyHubIcon, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Ionicons name="hardware-chip" size={24} color={COLORS.primaryBlue} />
            </View>
            <View style={styles.loyaltyHubText}>
              <Text style={styles.loyaltyHubTitle}>Electronics Loyalty Hub</Text>
              <Text style={styles.loyaltyHubSubtitle}>Track purchases, unlock tech rewards</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </View>
          <View style={styles.loyaltyHubStats}>
            <View style={styles.loyaltyHubStat}>
              <Text style={styles.loyaltyHubStatLabel}>Total Orders</Text>
              <Text style={styles.loyaltyHubStatValue}>8</Text>
            </View>
            <View style={styles.loyaltyHubStat}>
              <Text style={styles.loyaltyHubStatLabel}>Active Brands</Text>
              <Text style={[styles.loyaltyHubStatValue, { color: COLORS.primaryBlue }]}>3</Text>
            </View>
            <View style={styles.loyaltyHubStat}>
              <Text style={styles.loyaltyHubStatLabel}>Next Reward</Text>
              <Ionicons name="gift" size={20} color="#3B82F6" />
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Quick Filters */}
      <View style={styles.quickFiltersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickFilters}>
          {electronicsQuickFilters.slice(0, 7).map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.quickFilterChip,
                activeFilters.includes(filter.id) && styles.quickFilterChipActive,
              ]}
              onPress={() => toggleFilter(filter.id)}
            >
              <Text style={styles.quickFilterIcon}>{filter.icon}</Text>
              <Text style={[
                styles.quickFilterText,
                activeFilters.includes(filter.id) && styles.quickFilterTextActive,
              ]}>
                {filter.label}
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
        onSearch={(query) => router.push(`/search?q=${encodeURIComponent(query)}&category=${slug}` as any)}
      />

      {/* Trending Hashtags */}
      <TrendingHashtagsSection
        hashtags={hashtags}
        categorySlug={slug}
        onHashtagPress={(hashtag) => router.push(`/search?q=${encodeURIComponent(hashtag.tag)}&category=${slug}` as any)}
      />

      {/* Browse Categories Grid (NEW - 4 column) */}
      <BrowseCategoryGrid
        categories={subcategories}
        title="Shop by Category"
        onCategoryPress={(category) => router.push(`/category/${slug}/subcategory/${category.id}` as any)}
      />

      {/* Shop by Vibe Section */}
      {vibes.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Shop by Vibe</Text>
              <Text style={styles.sectionSubtitle}>What kind of tech are you looking for?</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/search?q=vibes&category=${slug}`)}>
              <Text style={styles.sectionSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.vibesContainer}>
            {vibes.map((vibe) => (
              <VibeCard
                key={vibe.id}
                vibe={vibe}
                onPress={(v) => router.push(`/search?q=${encodeURIComponent(v.name)}&category=${slug}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Shop by Occasion Section */}
      {occasions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Shop by Occasion</Text>
              <Text style={styles.sectionSubtitle}>Get the best deals for every event</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/search?q=occasions&category=${slug}`)}>
              <Text style={styles.sectionSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.occasionsContainer}>
            {occasions.map((occasion) => (
              <OccasionCard
                key={occasion.id}
                occasion={occasion}
                onPress={(o) => router.push(`/search?q=${encodeURIComponent(o.name)}&category=${slug}` as any)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Exclusive Offers */}
      {exclusiveOffers.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Exclusive For You</Text>
            <TouchableOpacity onPress={() => router.push('/offers')}>
              <Text style={styles.sectionSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exclusiveContainer}>
            {exclusiveOffers.map((offer) => (
              <ExclusiveOfferCard key={offer.id} offer={offer} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Exchange Offer Banner */}
      <View style={styles.tryBuyBanner}>
        <LinearGradient
          colors={['rgba(16, 185, 129, 0.2)', 'rgba(6, 182, 212, 0.2)']}
          style={styles.tryBuyGradient}
        >
          <View style={styles.tryBuyContent}>
            <View style={[styles.tryBuyIcon, { backgroundColor: 'rgba(16, 185, 129, 0.3)' }]}>
              <Ionicons name="swap-horizontal" size={24} color="#10B981" />
            </View>
            <View style={styles.tryBuyText}>
              <Text style={styles.tryBuyTitle}>Exchange Your Old Device</Text>
              <Text style={styles.tryBuySubtitle}>Get up to {currencySymbol}10,000 off on new purchase</Text>
            </View>
            <TouchableOpacity style={styles.tryBuyButton} onPress={() => router.push(`/stores?category=${slug}&filter=exchange`)}>
              <Text style={styles.tryBuyButtonText}>Explore</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Top Brands */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}&type=brand`)}>
            <Text style={styles.sectionSeeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brandsList}>
          {electronicsBrands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </ScrollView>
      </View>

      {/* Trending Products (from API) */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Now</Text>
            <TouchableOpacity onPress={() => router.push(`/products?category=${slug}&filter=trending`)}>
              <Text style={styles.sectionSeeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsList}>
            {products.slice(0, 10).map((product) => (
              <ProductCard key={product.id} product={product} variant="compact" currencySymbol={currencySymbol} />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Smart Compare Banner */}
      <View style={styles.compareBanner}>
        <LinearGradient
          colors={['rgba(59, 130, 246, 0.15)', 'rgba(6, 182, 212, 0.15)']}
          style={styles.compareGradient}
        >
          <View style={styles.compareHeader}>
            <Text style={styles.compareEmoji}>🧠</Text>
            <View style={styles.compareText}>
              <Text style={styles.compareTitle}>Smart Compare</Text>
              <Text style={styles.compareSubtitle}>Compare prices across Amazon, Flipkart, Croma</Text>
            </View>
          </View>
          <View style={styles.compareInputRow}>
            <TextInput
              style={styles.compareInput}
              placeholder="Paste product URL or search..."
              placeholderTextColor={COLORS.textSecondary}
            />
            <TouchableOpacity style={styles.compareButton} onPress={() => router.push('/compare')}>
              <Text style={styles.compareButtonText}>Compare</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Bank Offers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bank Offers</Text>
          <TouchableOpacity onPress={() => router.push('/offers?type=bank')}>
            <Text style={styles.sectionSeeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.bankOffersList}>
          {electronicsBankOffers.slice(0, 3).map((offer) => (
            <View key={offer.id} style={styles.bankOfferCard}>
              <Text style={styles.bankOfferIcon}>{offer.icon}</Text>
              <View style={styles.bankOfferInfo}>
                <Text style={styles.bankOfferBank}>{offer.bank}</Text>
                <Text style={styles.bankOfferText}>{offer.offer}</Text>
              </View>
              <View style={styles.bankOfferRight}>
                <Text style={styles.bankOfferMax}>Up to {currencySymbol}{offer.maxDiscount}</Text>
                <Text style={styles.bankOfferCardText}>{offer.cardType}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Wallet Reminder */}
      <View style={styles.walletBanner}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.1)', 'rgba(234, 179, 8, 0.1)']}
          style={styles.walletGradient}
        >
          <View style={styles.walletContent}>
            <Ionicons name="wallet-outline" size={28} color={COLORS.primaryGold} />
            <View style={styles.walletText}>
              <Text style={styles.walletTitle}>
                You have <Text style={styles.walletCoins}>{totalCoins.toLocaleString()}</Text> coins
              </Text>
              <Text style={styles.walletSubtitle}>Use up to 20% on any purchase</Text>
            </View>
            <TouchableOpacity style={styles.walletButton} onPress={() => router.push('/wallet')}>
              <Text style={styles.walletButtonText}>View</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primaryGold} />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Enhanced UGC Social Proof Section (NEW) */}
      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Real Tech Enthusiasts"
        subtitle="See what others are buying - Get inspired!"
        onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
        onSharePress={() => router.push('/share' as any)}
        onViewAllPress={() => router.push(`/category/${slug}/ugc` as any)}
      />

      <StreakLoyaltySection />
      <FooterTrustSection />
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  loyaltyHub: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  loyaltyHubGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderRadius: 16,
  },
  loyaltyHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  loyaltyHubIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loyaltyHubText: {
    flex: 1,
  },
  loyaltyHubTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  loyaltyHubSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loyaltyHubStats: {
    flexDirection: 'row',
    gap: 8,
  },
  loyaltyHubStat: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: COLORS.white,
  },
  loyaltyHubStatLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  loyaltyHubStatValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  quickFiltersContainer: {
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  quickFilters: {
    paddingHorizontal: 16,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  quickFilterChipActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  quickFilterIcon: {
    fontSize: 14,
  },
  quickFilterText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  quickFilterTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitleRow: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionSeeAll: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  vibesContainer: {
    paddingRight: 16,
  },
  occasionsContainer: {
    paddingRight: 16,
  },
  exclusiveContainer: {
    paddingRight: 16,
    gap: 12,
  },
  exclusiveCard: {
    width: 140,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  exclusiveIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  exclusiveTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  exclusiveDiscount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  exclusiveDescription: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  tryBuyBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tryBuyGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  tryBuyContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tryBuyIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(16, 185, 129, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tryBuyText: {
    flex: 1,
  },
  tryBuyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  tryBuySubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tryBuyButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  tryBuyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  brandsList: {
    gap: 12,
    paddingRight: 16,
  },
  brandCard: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  brandLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  brandLogoEmoji: {
    fontSize: 24,
  },
  brandName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  brandTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    marginBottom: 4,
  },
  brandTagText: {
    fontSize: 9,
    fontWeight: '600',
    color: COLORS.primaryBlue,
  },
  brandCashback: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  brandCashbackText: {
    fontSize: 10,
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  productsList: {
    gap: 12,
    paddingRight: 16,
  },
  productCardCompact: {
    width: 160,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  productImageContainerCompact: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    position: 'relative',
  },
  productImageCompact: {
    width: '100%',
    height: '100%',
  },
  productBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#EF4444',
  },
  productBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  productBrandCompact: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productNameCompact: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  productPriceCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  productPriceTextCompact: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  productOriginalPriceCompact: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  productCashbackCompact: {
    fontSize: 11,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  productCard: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    marginBottom: 12,
  },
  productCardContent: {
    flexDirection: 'row',
    gap: 12,
  },
  productImageContainer: {
    width: 112,
    height: 144,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productLikeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  productRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  productRatingCount: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  productPrice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  productPriceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  productOriginalPrice: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },
  productCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  productCoinsText: {
    fontSize: 12,
    color: COLORS.primaryGold,
    fontWeight: '500',
  },
  compareBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  compareGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  compareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  compareEmoji: {
    fontSize: 28,
  },
  compareText: {
    flex: 1,
  },
  compareTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  compareSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  compareInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compareInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  compareButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
  },
  compareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.white,
  },
  bankOffersList: {
    gap: 10,
  },
  bankOfferCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    gap: 12,
  },
  bankOfferIcon: {
    fontSize: 24,
  },
  bankOfferInfo: {
    flex: 1,
  },
  bankOfferBank: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  bankOfferText: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  bankOfferRight: {
    alignItems: 'flex-end',
  },
  bankOfferMax: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  bankOfferCardText: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  walletBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  walletGradient: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  walletContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletText: {
    flex: 1,
  },
  walletTitle: {
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  walletCoins: {
    fontWeight: '700',
    color: COLORS.primaryGold,
  },
  walletSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  walletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  walletButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryGold,
  },
});
