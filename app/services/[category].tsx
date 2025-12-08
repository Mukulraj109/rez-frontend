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
const PARENT_PADDING = 20;
const AVAILABLE_WIDTH = SCREEN_WIDTH - (PARENT_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

// Service Card Component
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
            <Ionicons name="star" size={12} color="#FFB800" />
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

      console.log('[ServiceCategory] Fetching category:', categorySlug);

      const response = await serviceCategoriesApi.getServicesInCategory(
        categorySlug as string,
        { page: pageNum, limit: 20, sortBy }
      );

      if (response.success && response.data) {
        const { services: newServices, category: categoryData, pagination } = response.data;

        setCategory(categoryData as any);

        if (pageNum === 1) {
          setServices(newServices);
        } else {
          setServices(prev => [...prev, ...newServices]);
        }

        setHasMore(pagination.page < pagination.pages);
        setPage(pageNum);

        console.log('[ServiceCategory] Got', newServices.length, 'services');
      } else {
        setError('Failed to load services');
        console.error('[ServiceCategory] Failed:', response.error);
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
          colors={['#7C3AED', '#8B5CF6', '#A855F7']}
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
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      </View>
    );
  }

  // Error state
  if (error && services.length === 0) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#7C3AED', '#8B5CF6', '#A855F7']}
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
      {/* Header */}
      <LinearGradient
        colors={['#7C3AED', '#8B5CF6', '#A855F7']}
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
              <ThemedText style={styles.headerSubtitle}>
                Up to {category.cashbackPercentage}% cash back
              </ThemedText>
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
            color="#7C3AED"
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
                <Ionicons name="checkmark" size={18} color="#7C3AED" />
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
            colors={['#7C3AED']}
            tintColor="#7C3AED"
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
            <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
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
            <ActivityIndicator size="small" color="#7C3AED" />
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
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
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
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sortBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sortButtonText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '500',
  },
  sortOptionsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: '#F3E8FF',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },
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
  serviceCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: CARD_GAP,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: '100%',
    height: 120,
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
    backgroundColor: '#7C3AED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cashbackBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  getServiceButton: {
    backgroundColor: '#7C3AED',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  getServiceButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  loadingMoreText: {
    fontSize: 14,
    color: '#6B7280',
  },
  endOfListContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  endOfListText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
