/**
 * ServiceSection Component
 * Section for services - AC repair, salons, cleaning, spa
 * Displays stores with category tabs and modern card design
 */

import React, { useCallback, memo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInRight,
  Layout,
} from 'react-native-reanimated';
import { ThemedText } from '@/components/ThemedText';
import { useServiceSection, ServiceSectionStore } from '@/hooks/useServiceSection';
import {
  SERVICE_SUBCATEGORIES,
  SERVICE_SECTION_CONFIG,
  SERVICE_COLORS,
} from '@/config/serviceSectionConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animated components
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.View;

// Card dimensions
const CARD_WIDTH = 200;
const CARD_IMAGE_HEIGHT = 140;

// Skeleton Loading Card
const SkeletonCard = memo(() => (
  <View style={styles.storeCard}>
    <View style={[styles.storeImageContainer, styles.skeletonImage]}>
      <View style={styles.skeletonShimmer} />
    </View>
    <View style={styles.storeInfo}>
      <View style={[styles.skeletonText, { width: '70%', height: 16 }]} />
      <View style={[styles.skeletonText, { width: '40%', height: 14, marginTop: 8 }]} />
      <View style={[styles.skeletonText, { width: '90%', height: 12, marginTop: 8 }]} />
    </View>
  </View>
));

// Category Chip Component
const CategoryChip = memo(({
  label,
  isActive,
  onPress,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.categoryChip, isActive && styles.categoryChipActive]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
));

// Store Card Component
const StoreCard = memo(({
  store,
  index,
  onPress,
}: {
  store: ServiceSectionStore;
  index: number;
  onPress: () => void;
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  // Get display image
  const displayImage = store.banner || store.logo;

  return (
    <AnimatedView
      entering={FadeInRight.delay(index * 80).springify()}
      layout={Layout.springify()}
    >
      <AnimatedTouchable
        style={[styles.storeCard, animatedStyle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Store Image */}
        <View style={styles.storeImageContainer}>
          {displayImage ? (
            <Image
              source={{ uri: displayImage }}
              style={styles.storeImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.storeImagePlaceholder}>
              <Ionicons name="construct-outline" size={40} color={SERVICE_COLORS.textMuted} />
            </View>
          )}
        </View>

        {/* Store Info */}
        <View style={styles.storeInfo}>
          {/* Store Name and Earn Badge Row */}
          <View style={styles.storeNameRow}>
            <Text style={styles.storeName} numberOfLines={1}>
              {store.name}
            </Text>
            {store.earnAmount > 0 && (
              <View style={styles.earnBadge}>
                <Text style={styles.earnBadgeText}>Earn ₹{store.earnAmount}</Text>
              </View>
            )}
          </View>

          {/* Rating and Price Level Row */}
          <View style={styles.ratingRow}>
            {store.rating.average > 0 && (
              <>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>{store.rating.average.toFixed(1)}</Text>
              </>
            )}
            {store.priceLevel && (
              <>
                <Text style={styles.dotSeparator}>•</Text>
                <Text style={styles.priceLevelText}>{store.priceLevel}</Text>
              </>
            )}
          </View>

          {/* Category and Distance Row */}
          <View style={styles.categoryRow}>
            <Text style={styles.categoryText} numberOfLines={1}>
              {store.category.length > 0 ? store.category.join(' • ') : 'Service'}
              {store.distance && ` • ${store.distance}`}
            </Text>
          </View>
        </View>
      </AnimatedTouchable>
    </AnimatedView>
  );
});

// Main Component
function ServiceSection() {
  const router = useRouter();
  const {
    activeSubcategory,
    stores,
    loading,
    error,
    setActiveSubcategory,
    refreshStores,
  } = useServiceSection();

  const tabScrollRef = useRef<ScrollView>(null);

  const handleSubcategoryPress = useCallback((subcategoryId: string) => {
    setActiveSubcategory(subcategoryId);
  }, [setActiveSubcategory]);

  const handleStorePress = useCallback((store: ServiceSectionStore) => {
    router.push(`/MainStorePage?storeId=${store.id}` as any);
  }, [router]);

  const handleViewAll = useCallback(() => {
    router.push('/services' as any);
  }, [router]);

  const handleRetry = useCallback(() => {
    refreshStores();
  }, [refreshStores]);

  // Render category chips
  const renderCategoryChips = () => (
    <ScrollView
      ref={tabScrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.chipsContainer}
      style={styles.chipsScroll}
    >
      {SERVICE_SUBCATEGORIES.map((subcategory) => {
        const isActive = activeSubcategory === subcategory.id;
        return (
          <CategoryChip
            key={subcategory.id}
            label={subcategory.label}
            isActive={isActive}
            onPress={() => handleSubcategoryPress(subcategory.id)}
          />
        );
      })}
    </ScrollView>
  );

  // Render store cards or states
  const renderStores = () => {
    // Loading state
    if (loading) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storesContainer}
          style={styles.storesScroll}
        >
          {[1, 2, 3].map((_, index) => (
            <SkeletonCard key={`skeleton-${index}`} />
          ))}
        </ScrollView>
      );
    }

    // Error state
    if (error) {
      return (
        <TouchableOpacity style={styles.errorContainer} onPress={handleRetry} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={32} color={SERVICE_COLORS.primary} />
          <Text style={styles.errorText}>{error}</Text>
        </TouchableOpacity>
      );
    }

    // Empty state
    if (stores.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="construct-outline" size={40} color={SERVICE_COLORS.textMuted} />
          <Text style={styles.emptyText}>No services found</Text>
          <Text style={styles.emptySubtext}>Check back soon for new listings</Text>
        </View>
      );
    }

    // Stores list
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storesContainer}
        style={styles.storesScroll}
      >
        {stores.map((store, index) => (
          <StoreCard
            key={store.id}
            store={store}
            index={index}
            onPress={() => handleStorePress(store)}
          />
        ))}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.sectionTitle}>
            {SERVICE_SECTION_CONFIG.title}
          </ThemedText>
          <ThemedText style={styles.sectionSubtitle}>
            {SERVICE_SECTION_CONFIG.subtitle}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={handleViewAll} activeOpacity={0.7}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      {renderCategoryChips()}

      {/* Store Cards */}
      {renderStores()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: SERVICE_COLORS.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: SERVICE_COLORS.textSecondary,
    fontWeight: '400',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: SERVICE_COLORS.primary,
  },
  // Category Chips styles
  chipsContainer: {
    paddingRight: 16,
    gap: 10,
    marginBottom: 16,
  },
  chipsScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: SERVICE_COLORS.white,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    borderColor: SERVICE_COLORS.primary,
    backgroundColor: SERVICE_COLORS.white,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: SERVICE_COLORS.textSecondary,
  },
  categoryChipTextActive: {
    color: SERVICE_COLORS.primary,
    fontWeight: '600',
  },
  // Store Cards styles
  storesContainer: {
    paddingRight: 16,
    gap: 12,
  },
  storesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  storeCard: {
    width: CARD_WIDTH,
    backgroundColor: SERVICE_COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  storeImageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    backgroundColor: '#F9FAFB',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storeImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  storeInfo: {
    padding: 12,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '600',
    color: SERVICE_COLORS.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  earnBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  earnBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: SERVICE_COLORS.primary,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: SERVICE_COLORS.textPrimary,
    marginLeft: 4,
  },
  dotSeparator: {
    fontSize: 13,
    color: SERVICE_COLORS.textMuted,
    marginHorizontal: 6,
  },
  priceLevelText: {
    fontSize: 13,
    color: SERVICE_COLORS.textSecondary,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: SERVICE_COLORS.textMuted,
  },
  // Skeleton styles
  skeletonImage: {
    backgroundColor: '#E5E7EB',
  },
  skeletonShimmer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
  },
  skeletonText: {
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  // Error state
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: SERVICE_COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: SERVICE_COLORS.textPrimary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: SERVICE_COLORS.textMuted,
    marginTop: 4,
  },
});

export default memo(ServiceSection);
