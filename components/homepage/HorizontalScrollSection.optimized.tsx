/**
 * Optimized Horizontal Scroll Section with FlatList Virtualization
 *
 * Performance Features:
 * - FlatList virtualization for memory efficiency
 * - getItemLayout for instant scrolling
 * - Optimized render callbacks with useCallback
 * - React.memo for list items
 * - Configurable windowSize and initialNumToRender
 * - removeClippedSubviews for native performance
 * - Pagination support with onEndReached
 * - Memory-efficient rendering
 *
 * Target: 60fps scrolling, 50% memory reduction
 */

import React, { useCallback, useMemo, useRef } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Platform, ListRenderItemInfo } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HorizontalScrollSectionProps, HomepageSectionItem } from '@/types/homepage.types';
import { useThemeColor } from '@/hooks/useThemeColor';
import SectionSkeleton from './skeletons/SectionSkeleton';

const { width: screenWidth } = Dimensions.get('window');

interface OptimizedHorizontalScrollSectionProps extends HorizontalScrollSectionProps {
  isLoading?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  windowSize?: number;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  updateCellsBatchingPeriod?: number;
  removeClippedSubviews?: boolean;
  enablePagination?: boolean;
}

/**
 * Memoized Card Wrapper Component
 * Prevents unnecessary re-renders of individual cards
 */
const CardWrapper = React.memo<{
  item: HomepageSectionItem;
  renderCard: (item: HomepageSectionItem) => React.ReactNode;
  cardWidth: number;
  spacing: number;
  isLast: boolean;
}>(({ item, renderCard, cardWidth, spacing, isLast }) => {
  return (
    <View
      style={[
        styles.cardContainer,
        { width: cardWidth, marginRight: isLast ? 0 : spacing },
      ]}
    >
      {renderCard(item)}
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the item ID changes or if it's the last item status changes
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.isLast === nextProps.isLast &&
    prevProps.cardWidth === nextProps.cardWidth &&
    prevProps.spacing === nextProps.spacing
  );
});

CardWrapper.displayName = 'CardWrapper';

/**
 * Optimized Horizontal Scroll Section Component
 */
const OptimizedHorizontalScrollSection = React.memo<OptimizedHorizontalScrollSectionProps>(
  function OptimizedHorizontalScrollSection({
    section,
    onRefresh,
    renderCard,
    cardWidth = 280,
    spacing = 16,
    showIndicator = true,
    isLoading = false,
    onEndReached,
    onEndReachedThreshold = 0.5,
    windowSize = 5,
    initialNumToRender = 3,
    maxToRenderPerBatch = 3,
    updateCellsBatchingPeriod = 50,
    removeClippedSubviews = Platform.OS !== 'web',
    enablePagination = false,
  }) {
    const [refreshing, setRefreshing] = React.useState(false);

    const primaryColor = useThemeColor({}, 'tint');
    const textColor = useThemeColor({}, 'text');
    const backgroundColor = useThemeColor({}, 'background');

    // Refs to track performance
    const renderCountRef = useRef(0);
    const lastScrollTime = useRef(Date.now());

    /**
     * Handle refresh
     */
    const handleRefresh = useCallback(async () => {
      if (onRefresh) {
        setRefreshing(true);
        try {
          await onRefresh();
        } catch (error) {
          console.error('Failed to refresh section:', error);
        } finally {
          setRefreshing(false);
        }
      }
    }, [onRefresh]);

    /**
     * Determine card type from section type for skeleton loader
     */
    const getCardType = useCallback(() => {
      const sectionType = section.type?.toLowerCase();
      if (sectionType?.includes('store')) return 'store';
      if (sectionType?.includes('event')) return 'event';
      if (sectionType?.includes('product')) return 'product';
      if (sectionType?.includes('recommendation')) return 'recommendation';
      return 'product'; // default
    }, [section.type]);

    /**
     * Memoized keyExtractor
     */
    const keyExtractor = useCallback((item: HomepageSectionItem) => item.id, []);

    /**
     * Optimized getItemLayout for instant scrolling
     * Critical for performance - tells FlatList exact dimensions
     */
    const getItemLayout = useCallback(
      (data: HomepageSectionItem[] | null | undefined, index: number) => ({
        length: cardWidth + spacing,
        offset: (cardWidth + spacing) * index,
        index,
      }),
      [cardWidth, spacing]
    );

    /**
     * Memoized renderItem with performance tracking
     */
    const renderItem = useCallback(
      ({ item, index }: ListRenderItemInfo<HomepageSectionItem>) => {
        renderCountRef.current++;

        const isLast = index === section.items.length - 1;

        return (
          <CardWrapper
            item={item}
            renderCard={renderCard}
            cardWidth={cardWidth}
            spacing={spacing}
            isLast={isLast}
          />
        );
      },
      [renderCard, cardWidth, spacing, section.items.length]
    );

    /**
     * Handle end reached for pagination
     */
    const handleEndReached = useCallback(() => {
      if (enablePagination && onEndReached) {
        onEndReached();
      }
    }, [enablePagination, onEndReached]);

    /**
     * Track scroll performance
     */
    const handleScroll = useCallback(() => {
      const now = Date.now();
      const timeSinceLastScroll = now - lastScrollTime.current;

      if (timeSinceLastScroll > 16.67) {
        // Dropped below 60fps
        console.warn(`[Virtualization] Scroll jank detected: ${timeSinceLastScroll.toFixed(2)}ms`);
      }

      lastScrollTime.current = now;
    }, []);

    /**
     * Memoized content container style
     */
    const contentContainerStyle = useMemo(
      () => [styles.scrollContent, { paddingHorizontal: spacing }],
      [spacing]
    );

    /**
     * Show skeleton loader if loading or no items yet
     */
    if (isLoading || !section.items || section.items.length === 0) {
      return (
        <SectionSkeleton
          cardType={getCardType()}
          cardWidth={cardWidth}
          spacing={spacing}
          numCards={4}
          showIndicator={showIndicator}
        />
      );
    }

    return (
      <ThemedView style={styles.container}>
        {/* Section Header */}
        <ThemedView style={styles.header}>
          <ThemedText style={[styles.title, { color: textColor }]}>
            {section.title}
          </ThemedText>
          <View style={[styles.titleAccent, { backgroundColor: primaryColor }]} />
        </ThemedView>

        {/* Virtualized Horizontal List */}
        <FlatList
          data={section.items}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          getItemLayout={getItemLayout}
          horizontal
          showsHorizontalScrollIndicator={showIndicator}
          contentContainerStyle={contentContainerStyle}
          // Performance optimizations
          windowSize={windowSize}
          initialNumToRender={initialNumToRender}
          maxToRenderPerBatch={maxToRenderPerBatch}
          updateCellsBatchingPeriod={updateCellsBatchingPeriod}
          removeClippedSubviews={removeClippedSubviews}
          // Pagination
          onEndReached={handleEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          // Scroll performance tracking
          onScroll={handleScroll}
          scrollEventThrottle={16}
          // Misc
          decelerationRate="normal"
          nestedScrollEnabled={false}
          // Accessibility
          accessible={true}
          accessibilityLabel={`${section.title} section`}
          accessibilityRole="list"
        />

        {/* Optional iOS Always-visible Scroll Indicator */}
        {Platform.OS === 'ios' && showIndicator && (
          <View style={[styles.fakeIndicator, { backgroundColor: primaryColor }]} />
        )}
      </ThemedView>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if section items actually changed (deep comparison of IDs)
    if (prevProps.section.id !== nextProps.section.id) return false;
    if (prevProps.section.items.length !== nextProps.section.items.length) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;

    // Check if item IDs changed
    const prevIds = prevProps.section.items.map(item => item.id).join(',');
    const nextIds = nextProps.section.items.map(item => item.id).join(',');
    if (prevIds !== nextIds) return false;

    // Check if other props changed
    if (prevProps.cardWidth !== nextProps.cardWidth) return false;
    if (prevProps.spacing !== nextProps.spacing) return false;
    if (prevProps.showIndicator !== nextProps.showIndicator) return false;

    // If all checks pass, props are equal - skip re-render
    return true;
  }
);

export default OptimizedHorizontalScrollSection;

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
  },
  titleAccent: {
    position: 'absolute',
    bottom: -8,
    left: 20,
    width: 32,
    height: 3,
    borderRadius: 2,
  },
  scrollContent: {
    paddingVertical: 8,
  },
  cardContainer: {
    flex: 0,
    flexShrink: 0,
  },
  fakeIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 20,
    right: 20,
    height: 2,
    borderRadius: 1,
    opacity: 0.3,
  },
});
