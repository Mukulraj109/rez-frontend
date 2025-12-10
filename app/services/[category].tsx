import React, { useState, useCallback, useEffect, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import serviceCategoriesApi, {
  ServiceCategory,
  ServiceInCategory,
  ServiceCategoryQueryParams
} from '@/services/serviceCategoriesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 12;
const PARENT_PADDING = 16;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (PARENT_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

// ReZ Design System Colors from TASK.md
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  navy: '#0B2240',
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  gold: '#FFC857',
  cardBorder: 'rgba(0, 0, 0, 0.04)',
};

// Service Card Component - ReZ Premium Design
const ServiceCard = memo(({
  service,
  onPress
}: {
  service: ServiceInCategory;
  onPress: () => void;
}) => {
  const imageUrl = service.images?.[0] || 'https://via.placeholder.com/300x200';
  const price = service.pricing?.selling || service.pricing?.original || 0;
  const originalPrice = service.pricing?.original || price;
  const hasDiscount = originalPrice > price;
  const cashbackPercentage = service.cashback?.percentage || service.serviceCategory?.cashbackPercentage || 0;
  const rating = service.ratings?.average || 0;
  const ratingCount = service.ratings?.count || 0;

  return (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {/* Service Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.serviceImage}
          resizeMode="cover"
        />
        {cashbackPercentage > 0 && (
          <View style={styles.cashbackBadge}>
            <ThemedText style={styles.cashbackBadgeText}>
              {cashbackPercentage}% back
            </ThemedText>
          </View>
        )}
      </View>

      {/* Service Info */}
      <View style={styles.serviceInfo}>
        <ThemedText style={styles.serviceName} numberOfLines={2}>
          {service.name}
        </ThemedText>

        {/* Store Name */}
        {service.store?.name && (
          <ThemedText style={styles.storeName} numberOfLines={1}>
            {service.store.name}
          </ThemedText>
        )}

        {/* Rating */}
        {rating > 0 && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={12} color={COLORS.gold} />
            <ThemedText style={styles.ratingText}>
              {rating.toFixed(1)} ({ratingCount})
            </ThemedText>
          </View>
        )}

        {/* Price */}
        <View style={styles.priceContainer}>
          <ThemedText style={styles.price}>
            {service.pricing?.currency || 'INR'} {price.toLocaleString()}
          </ThemedText>
          {hasDiscount && (
            <ThemedText style={styles.originalPrice}>
              {service.pricing?.currency || 'INR'} {originalPrice.toLocaleString()}
            </ThemedText>
          )}
        </View>

        {/* Get Service Button */}
        <TouchableOpacity
          style={styles.getServiceButton}
          onPress={onPress}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.getServiceButtonText}>Get service</ThemedText>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});

// Sort Options
const SORT_OPTIONS = [
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low to High', value: 'price_low' },
  { label: 'Price: High to Low', value: 'price_high' },
  { label: 'Newest', value: 'newest' },
  { label: 'Popular', value: 'popular' },
];

export default function ServiceCategoryPage() {
  const router = useRouter();
  const { category: categorySlug } = useLocalSearchParams();

  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [services, setServices] = useState<ServiceInCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortBy, setSortBy] = useState<ServiceCategoryQueryParams['sortBy']>('rating');
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Fetch category and services
  const fetchData = useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (pageNum === 1) {
        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await serviceCategoriesApi.getServicesInCategory(
        categorySlug as string,
        { page: pageNum, limit: 20, sortBy }
      );

      if (response.success && response.data) {
        const { services: newServices, category: categoryData, pagination } = response.data;

        setCategory(categoryData as any);

        // Safely handle services array
        const servicesArray = Array.isArray(newServices) ? newServices : [];

        if (pageNum === 1) {
          setServices(servicesArray);
        } else {
          setServices(prev => [...prev, ...servicesArray]);
        }

        // Safely handle pagination
        const totalPages = pagination?.pages || 1;
        const currentPage = pagination?.page || 1;
        setHasMore(currentPage < totalPages);
        setPage(pageNum);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('[ServiceCategory] Error:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [categorySlug, sortBy]);

  useEffect(() => {
    if (categorySlug) {
      fetchData(1);
    }
  }, [categorySlug, sortBy]);

  const handleRefresh = useCallback(() => {
    fetchData(1, true);
  }, [fetchData]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchData(page + 1);
    }
  }, [fetchData, loadingMore, hasMore, page]);

  const handleServicePress = (service: ServiceInCategory) => {
    router.push(`/ProductPage?cardId=${service._id}&cardType=product`);
  };

  const handleSortChange = (value: ServiceCategoryQueryParams['sortBy']) => {
    setSortBy(value);
    setShowSortOptions(false);
    setPage(1);
    setServices([]);
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Loading...</ThemedText>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Fetching your savings...</ThemedText>
        </View>
      </View>
    );
  }

  // Error state
  if (error && services.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Services</ThemedText>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchData(1)}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with ReZ Green Gradient */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <ThemedText style={styles.headerTitle}>
              {category?.name || 'Services'}
            </ThemedText>
            {category?.cashbackPercentage && (
              <View style={styles.cashbackPill}>
                <ThemedText style={styles.cashbackPillText}>
                  Up to {category.cashbackPercentage}% cash back
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Sort Bar */}
      <View style={styles.sortBar}>
        <ThemedText style={styles.resultsCount}>
          {services.length} services
        </ThemedText>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortOptions(!showSortOptions)}
        >
          <ThemedText style={styles.sortButtonText}>
            {SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort'}
          </ThemedText>
          <Ionicons
            name={showSortOptions ? "chevron-up" : "chevron-down"}
            size={16}
            color={COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Sort Options Dropdown */}
      {showSortOptions && (
        <View style={styles.sortOptionsContainer}>
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.sortOption,
                sortBy === option.value && styles.sortOptionActive
              ]}
              onPress={() => handleSortChange(option.value as ServiceCategoryQueryParams['sortBy'])}
            >
              <ThemedText style={[
                styles.sortOptionText,
                sortBy === option.value && styles.sortOptionTextActive
              ]}>
                {option.label}
              </ThemedText>
              {sortBy === option.value && (
                <Ionicons name="checkmark" size={18} color={COLORS.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Services Grid */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={COLORS.textMuted} />
            <ThemedText style={styles.emptyText}>No services available</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Check back later for new services
            </ThemedText>
          </View>
        ) : (
          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <ServiceCard
                key={service._id || `service-${index}`}
                service={service}
                onPress={() => handleServicePress(service)}
              />
            ))}
            {/* Add empty card if odd number for grid alignment */}
            {services.length % 2 !== 0 && <View style={styles.emptyCard} />}
          </View>
        )}

        {/* Loading More Indicator */}
        {loadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <ThemedText style={styles.loadingMoreText}>Loading more...</ThemedText>
          </View>
        )}

        {/* End of List */}
        {!hasMore && services.length > 0 && (
          <View style={styles.endOfListContainer}>
            <ThemedText style={styles.endOfListText}>
              That's all the services in this category
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  // Header with ReZ gradient
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  cashbackPill: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  cashbackPillText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  // Sort Bar
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderRadius: 20,
  },
  sortButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  sortOptionsContainer: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sortOptionActive: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
  },
  sortOptionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  sortOptionTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Services Grid
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: PARENT_PADDING,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  // Service Card - Standard Card from TASK.md
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: CARD_GAP,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    // Shadow from Standard Card spec
    shadowColor: '#0B2240',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: '100%',
    height: 130,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  cashbackBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    lineHeight: 18,
  },
  storeName: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  originalPrice: {
    fontSize: 12,
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },
  // Primary Button from TASK.md
  getServiceButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  getServiceButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  // Loading more
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  endOfListContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfListText: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
});
