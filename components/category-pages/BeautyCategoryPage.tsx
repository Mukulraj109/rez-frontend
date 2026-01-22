/**
 * Beauty & Wellness Category Page - ENHANCED
 * Based on Rez_v-2-main Beauty.jsx design
 * Features: Service/Product categories, Modes, Clinics, UGC, Book & Earn
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
// Fallback dummy data for mode filters
import { beautyCategoryData } from '@/data/category';
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

export default function BeautyCategoryPage() {
  const router = useRouter();
  const slug = 'beauty-wellness';
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

  const [activeModes, setActiveModes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleMode = (modeId: string) => {
    if (activeModes.includes(modeId)) {
      setActiveModes(activeModes.filter(m => m !== modeId));
    } else {
      setActiveModes([...activeModes, modeId]);
    }
  };

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
    return <LoadingState message="Loading beauty services..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="💄"
        title="Unable to load services"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('[BeautyPage] Error:', err)}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[categoryConfig.primaryColor]}
        />
      }
    >
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Live Rewards Strip */}
      <View style={styles.rewardsStrip}>
        <LinearGradient
          colors={['rgba(0, 192, 106, 0.2)', 'rgba(0, 137, 107, 0.2)']}
          style={styles.rewardsGradient}
        >
          <View style={styles.rewardsContent}>
            <Ionicons name="star" size={20} color={COLORS.primaryGold} />
            <Text style={styles.rewardsText}>
              Earn up to 20% Cashback + ReZ Coins on every beauty visit
            </Text>
          </View>
          <Text style={styles.rewardsSubtext}>Works at salons, clinics & stores</Text>
        </LinearGradient>
      </View>

      {/* Mode Chips */}
      <View style={styles.modesContainer}>
        <Text style={styles.modesLabel}>Results adapt to your lifestyle & preferences</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modes}>
          {beautyCategoryData.modeFilters.map((mode) => (
            <TouchableOpacity
              key={mode.id}
              onPress={() => toggleMode(mode.id)}
              style={[
                styles.modeChip,
                activeModes.includes(mode.id) && styles.modeChipActive,
              ]}
            >
              <Text style={styles.modeIcon}>{mode.icon}</Text>
              <Text style={[
                styles.modeLabel,
                activeModes.includes(mode.id) && styles.modeLabelActive,
              ]}>
                {mode.label}
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
        title="Browse Services"
        onCategoryPress={handleCategoryPress}
      />

      {/* Service Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>💆</Text>
          <Text style={styles.sectionTitle}>Book & Earn Services</Text>
          <TouchableOpacity onPress={() => router.push(`/services?category=${slug}`)}>
            <Text style={styles.sectionSeeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.servicesList}>
          {['Haircut', 'Facial', 'Manicure', 'Pedicure', 'Massage', 'Waxing'].map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceEmoji}>{['💇', '✨', '💅', '🦶', '💆', '🧴'][index]}</Text>
              </View>
              <Text style={styles.serviceName}>{service}</Text>
              <Text style={styles.serviceCashback}>Up to 15% cashback</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Categories */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🛍️</Text>
            <Text style={styles.sectionTitle}>Buy Products</Text>
            <TouchableOpacity onPress={() => router.push(`/products?category=${slug}`)}>
              <Text style={styles.sectionSeeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsList}>
            {products.slice(0, 6).map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCardCompact} onPress={() => router.push(`/ProductPage?productId=${product.id}` as any)}>
                <Image
                  source={{ uri: product.image || 'https://via.placeholder.com/150' }}
                  style={styles.productImageCompact}
                  resizeMode="cover"
                />
                <Text style={styles.productNameCompact} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPriceCompact}>{currencySymbol}{product.price?.toLocaleString() || '0'}</Text>
                <Text style={styles.productCashbackCompact}>
                  {product.cashback || 10}% cashback
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Verified Clinics */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.primaryGreen} />
            <Text style={styles.sectionTitle}>Verified Clinics</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}&filter=verified`)}>
              <Text style={styles.sectionSeeAll}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clinicsList}>
            {stores.slice(0, 5).map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.clinicCard}
                onPress={() => router.push(`/StorePage?storeId=${store.id}` as any)}
              >
                <Image
                  source={{ uri: store.logo || 'https://via.placeholder.com/200' }}
                  style={styles.clinicImage}
                  resizeMode="cover"
                />
                <View style={styles.clinicBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryGreen} />
                  <Text style={styles.clinicBadgeText}>Verified</Text>
                </View>
                <Text style={styles.clinicName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.clinicRating}>
                  <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                  <Text style={styles.clinicRatingText}>
                    {store.rating?.toFixed(1) || '4.5'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Today's Top Beauty Deals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🏷️</Text>
          <Text style={styles.sectionTitle}>Today's Top Beauty Deals</Text>
        </View>
        <View style={styles.offersTabs}>
          {['Offers', 'Cashback', 'Exclusive'].map((tab) => (
            <TouchableOpacity key={tab} style={styles.offerTab}>
              <Text style={styles.offerTabText}>{tab}</Text>
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
        title="Real Glow-ups, Real Reviews"
        subtitle="See transformations from our community!"
        onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
        onSharePress={() => router.push('/share' as any)}
      />

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
  rewardsStrip: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  rewardsGradient: {
    padding: 12,
  },
  rewardsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  rewardsText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  rewardsSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modesLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  modes: {
    gap: 8,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    gap: 6,
  },
  modeChipActive: {
    backgroundColor: COLORS.primaryGreen,
  },
  modeIcon: {
    fontSize: 14,
  },
  modeLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  modeLabelActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionSeeAll: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  servicesList: {
    gap: 12,
    paddingRight: 16,
  },
  serviceCard: {
    width: 100,
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
  },
  serviceIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceEmoji: {
    fontSize: 24,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceCashback: {
    fontSize: 11,
    color: COLORS.primaryGreen,
    textAlign: 'center',
  },
  productsList: {
    gap: 12,
    paddingRight: 16,
  },
  productCardCompact: {
    width: 140,
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.white,
  },
  productImageCompact: {
    width: '100%',
    height: 140,
    borderRadius: 8,
    marginBottom: 8,
  },
  productNameCompact: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productPriceCompact: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  productCashbackCompact: {
    fontSize: 11,
    color: COLORS.primaryGreen,
  },
  clinicsList: {
    gap: 12,
    paddingRight: 16,
  },
  clinicCard: {
    width: 160,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
    position: 'relative',
  },
  clinicImage: {
    width: '100%',
    height: 100,
  },
  clinicBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.9)',
    gap: 4,
  },
  clinicBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
  clinicName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    padding: 8,
    paddingBottom: 4,
  },
  clinicRating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 8,
    gap: 4,
  },
  clinicRatingText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  offersTabs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  offerTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  offerTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
});
