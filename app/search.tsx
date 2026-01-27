import React, { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  navy: '#0B2240',
  slate: '#1F2D3D',
  muted: '#9AA7B2',
  surface: '#F7FAFC',
  error: '#EF4444',
  warning: '#F59E0B',
  glassWhite: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  glassHighlight: 'rgba(255, 255, 255, 0.5)',
};
import {
  SearchPageState,
  SearchSection,
  SearchCategory,
  SearchResult,
  SearchSuggestion,
  SearchViewMode,
} from '@/types/search.types';
import { SearchHeader, SearchSection as SearchSectionComponent, FilterModal } from '@/components/search';
import SellerComparisonCard from '@/components/search/SellerComparisonCard';
import ProductGroupHeader from '@/components/search/ProductGroupHeader';
import SearchResultsSummary from '@/components/search/SearchResultsSummary';
import FilterBar, { SortOption } from '@/components/search/FilterBar';
import { useSearchPage } from '@/hooks/useSearchPage';
import useDebouncedSearch from '@/hooks/useDebouncedSearch';
import { useCurrentLocation } from '@/hooks/useLocation';
import type { FilterState } from '@/components/search/FilterModal';
import { formatPrice } from '@/utils/priceFormatter';
import { useRegion } from '@/contexts/RegionContext';

const { width } = Dimensions.get('window');

export default function SearchPage() {
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || '';

  // Use the new search page hook
  const { state: searchState, groupedProducts, matchingStores, searchSummary, actions } = useSearchPage();

  // Get user location for distance calculation
  const { currentLocation } = useCurrentLocation();

  // Get currency symbol for price display
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  // Use debounced search hook
  const { value: searchQuery, debouncedValue: debouncedQuery, isDebouncing, setValue: setSearchQuery } = useDebouncedSearch(initialQuery, { delay: 300, minLength: 2 });

  const [viewMode, setViewMode] = useState<SearchViewMode>(initialQuery ? 'results' : 'categories');
  const [inputFocused, setInputFocused] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentSort, setCurrentSort] = useState<SortOption>('best_value');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 100000 },
    rating: null,
    categories: [],
    inStock: false,
    cashbackMin: 0,
  });

  // Prepare user location for search (memoized to avoid recreation)
  const userLocation = useMemo(() => {
    if (currentLocation?.coordinates) {
      return {
        latitude: currentLocation.coordinates.latitude,
        longitude: currentLocation.coordinates.longitude,
      };
    }
    return undefined;
  }, [currentLocation?.coordinates?.latitude, currentLocation?.coordinates?.longitude]);

  // Extract location coordinates to avoid object recreation issues
  const userLat = currentLocation?.coordinates?.latitude;
  const userLon = currentLocation?.coordinates?.longitude;

  // Store function and location in refs to avoid dependency issues
  const performGroupedSearchRef = useRef(actions.performGroupedSearch);
  const userLocationRef = useRef<{ latitude: number; longitude: number } | undefined>(undefined);

  // Update refs (using useLayoutEffect to avoid render issues)
  useLayoutEffect(() => {
    performGroupedSearchRef.current = actions.performGroupedSearch;
    userLocationRef.current = userLat && userLon ? { latitude: userLat, longitude: userLon } : undefined;
  }, [actions.performGroupedSearch, userLat, userLon]);

  // Track last search to prevent duplicate searches
  const lastSearchedQuery = useRef<string>('');

  // Perform grouped search if initial query exists (only once on mount)
  const hasSearchedInitial = useRef(false);
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length >= 2 && !hasSearchedInitial.current) {
      hasSearchedInitial.current = true;
      lastSearchedQuery.current = initialQuery;
      // IMPORTANT: Sync the input field with the URL query parameter
      actions.handleSearchChange(initialQuery);
      performGroupedSearchRef.current(initialQuery, userLocationRef.current);
      setViewMode('results');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]); // Only run once when initialQuery is set

  // Perform grouped search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      // Only search if query actually changed
      if (lastSearchedQuery.current !== debouncedQuery) {
        lastSearchedQuery.current = debouncedQuery;
        performGroupedSearchRef.current(debouncedQuery, userLocationRef.current);
        setViewMode('results');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]); // Only depend on debouncedQuery - location is in ref

  const handleBack = () => {
    router.back();
  };

  const handleQueryChange = (text: string) => {
    actions.handleSearchChange(text);
    setSearchQuery(text); // Update debounced search

    if (text.length > 0) {
      setViewMode('suggestions');
    } else {
      setViewMode('categories');
    }
  };

  const handleSearch = useCallback(() => {
    if (searchState.query.trim()) {
      lastSearchedQuery.current = searchState.query;
      performGroupedSearchRef.current(searchState.query, userLocationRef.current);
      setViewMode('results');
    }
  }, [searchState.query]);

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    actions.handleSearchChange(suggestion.text);
    actions.handleSearchSubmit(suggestion.text);
    setViewMode('results');
  };

  const handleCategoryPress = async (category: SearchCategory) => {
    await actions.handleCategoryPress(category);

    // Navigate to category page to show all products in this category
    router.push({
      pathname: '/category/[slug]' as any,
      params: {
        slug: category.slug,
        name: category.name,
        categoryId: category.id
      }
    });
  };

  const handleResultPress = async (result: SearchResult, position: number) => {
    await actions.handleResultPress(result, position);

    // Safely extract ID with fallback
    const resultId = result.id || result.productId || result.storeId || '';

    if (!resultId) {
      console.warn('[SEARCH] No valid ID found for result:', result);
      return;
    }

    if (result.category === 'Store') {
      // Navigate to MainStorePage with storeId to show store view
      router.push(`/MainStorePage?storeId=${resultId}`);
    } else {
      // Navigate to ProductPage with proper params
      router.push({
        pathname: '/ProductPage' as any,
        params: {
          cardId: resultId,
          cardType: 'product'
        }
      });
    }
  };

  const handleSellerPress = (seller: any) => {
    // Navigate to product page with store context
    if (seller.productId) {
      router.push({
        pathname: '/ProductPage' as any,
        params: {
          cardId: seller.productId,
          cardType: 'product',
          storeId: seller.storeId
        }
      });
    }
  };

  const handleFilterPress = (filter: string) => {
    if (filter === 'filters') {
      setShowFilterModal(true);
    } else {
      // Toggle filter
      setActiveFilters(prev => {
        if (prev.includes(filter)) {
          return prev.filter(f => f !== filter);
        }
        return [...prev, filter];
      });
    }
  };

  const handleSortChange = (sort: SortOption) => {
    setCurrentSort(sort);
  };

  // Apply sorting to grouped products based on current sort option
  const sortedGroupedProducts = useMemo(() => {
    if (!groupedProducts || groupedProducts.length === 0) return groupedProducts;

    return groupedProducts.map(productGroup => {
      const sortedSellers = [...productGroup.sellers].sort((a, b) => {
        switch (currentSort) {
          case 'price_low':
            return a.price.current - b.price.current;
          case 'price_high':
            return b.price.current - a.price.current;
          case 'cashback_high':
            return b.cashback.amount - a.cashback.amount;
          case 'distance':
            // Sort by distance (closer first)
            const distA = a.distance ?? 999;
            const distB = b.distance ?? 999;
            return distA - distB;
          case 'rating':
            // Sort by rating (higher first)
            if (b.rating !== a.rating) {
              return b.rating - a.rating;
            }
            // If ratings are equal, sort by review count
            return b.reviewCount - a.reviewCount;
          case 'best_value':
          default:
            // Best value: considers price, cashback, rating, and distance
            // Lower score = better value
            const scoreA =
              (a.price.current * 0.4) -
              (a.cashback.amount * 0.3) -
              (a.rating * 100 * 0.2) +
              ((a.distance || 999) * 0.1);
            const scoreB =
              (b.price.current * 0.4) -
              (b.cashback.amount * 0.3) -
              (b.rating * 100 * 0.2) +
              ((b.distance || 999) * 0.1);
            return scoreA - scoreB;
        }
      });

      return {
        ...productGroup,
        sellers: sortedSellers
      };
    });
  }, [groupedProducts, currentSort]);

  const handleViewAll = (sectionId: string) => {
    actions.handleViewAllSection(sectionId);

    // Navigate to the appropriate page based on section
    if (sectionId === 'going-out') {
      router.push('/going-out');
    } else if (sectionId === 'home-delivery') {
      router.push('/home-delivery');
    }
  };

  const handleOpenFilters = () => {
    setShowFilterModal(true);
  };

  const handleApplyFilters = (filters: FilterState) => {
    setCurrentFilters(filters);

    // Convert FilterState to SearchPageState activeFilters format
    const activeFilters: SearchPageState['activeFilters'] = {};

    if (filters.categories.length > 0) {
      activeFilters.category = filters.categories.map(cat => ({
        id: cat,
        label: cat,
        value: cat,
      }));
    }

    if (filters.rating !== null) {
      activeFilters.rating = [{
        id: 'rating',
        label: `${filters.rating}+ Stars`,
        value: filters.rating,
      }];
    }

    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000) {
      activeFilters.price = [{
        id: 'price-range',
        label: `${currencySymbol}${filters.priceRange.min} - ${currencySymbol}${filters.priceRange.max}`,
        value: `${filters.priceRange.min}-${filters.priceRange.max}`,
      }];
    }

    if (filters.cashbackMin > 0) {
      activeFilters.cashback = [{
        id: 'cashback-min',
        label: `${filters.cashbackMin}% and above`,
        value: filters.cashbackMin,
      }];
    }

    actions.applyFilters(activeFilters);
    setShowFilterModal(false);
  };

  const renderHeader = () => (
    <View style={styles.headerWrapper}>
      <LinearGradient
        colors={['#00C06A', '#00A85A', '#008F4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Subtle decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
        <View style={styles.decorativeCircle3} />

        <View style={styles.headerContent}>
          {/* Back Button - Modern design */}
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            activeOpacity={0.8}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Returns to the previous screen"
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </View>
          </TouchableOpacity>

          {/* Search Container - Premium design */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, inputFocused && styles.searchInputFocused]}>
              <View style={styles.searchIconWrapper}>
                <Ionicons name="search" size={16} color={COLORS.primary} />
              </View>
              <TextInput
                style={[
                  styles.searchInput,
                  Platform.OS === 'web'
                    ? ({
                      outlineWidth: 0,
                      outlineColor: 'transparent',
                      outlineStyle: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    } as any)
                    : undefined,
                ]}
                placeholder="Search for a service, store or category"
                placeholderTextColor="#9CA3AF"
                value={searchState.query}
                onChangeText={handleQueryChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
                autoFocus={!initialQuery}
                underlineColorAndroid="transparent"
                importantForAutofill="no"
                accessibilityLabel="Search input"
                accessibilityRole="search"
                accessibilityHint="Enter keywords to search for services, stores or categories"
                accessibilityValue={{ text: searchState.query }}
              />

              {searchState.query.length > 0 && (
                <TouchableOpacity
                  onPress={() => handleQueryChange('')}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  accessibilityHint="Clears the current search text"
                >
                  <View style={styles.clearButtonInner}>
                    <Ionicons name="close" size={14} color="#6B7280" />
                  </View>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Filter Button - Premium design */}
          <TouchableOpacity
            style={[
              styles.filterButton,
              Object.keys(searchState.activeFilters).length > 0 && styles.filterButtonActive
            ]}
            activeOpacity={0.8}
            onPress={handleOpenFilters}
            accessibilityLabel={`Filters${Object.keys(searchState.activeFilters).length > 0 ? `, ${Object.keys(searchState.activeFilters).length} active` : ''}`}
            accessibilityRole="button"
            accessibilityHint="Opens filter options to refine search results"
            accessibilityState={{ selected: Object.keys(searchState.activeFilters).length > 0 }}
          >
            <View style={styles.filterIconContainer}>
              <Ionicons
                name="options-outline"
                size={18}
                color={Object.keys(searchState.activeFilters).length > 0 ? '#FFC857' : 'white'}
              />
            </View>
            {Object.keys(searchState.activeFilters).length > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{Object.keys(searchState.activeFilters).length}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );

  const renderCategories = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Quick Search Actions */}
      <View style={styles.quickSearchActions}>
        <TouchableOpacity
          style={styles.quickSearchCard}
          onPress={() => router.push('/search/ai-search')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.quickSearchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="sparkles" size={24} color="#FFF" />
            <Text style={styles.quickSearchText}>AI Search</Text>
            <Text style={styles.quickSearchSubtext}>Natural language</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickSearchCard}
          onPress={() => router.push('/search/hotspots')}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            style={styles.quickSearchGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Ionicons name="location" size={24} color="#FFF" />
            <Text style={styles.quickSearchText}>Hotspots</Text>
            <Text style={styles.quickSearchSubtext}>Nearby deals</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {searchState.sections.map((section, index) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.subtitle && (
                <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => handleViewAll(section.id)}
              activeOpacity={0.7}
              accessibilityLabel={`View all ${section.title}`}
              accessibilityRole="button"
              accessibilityHint={`Opens full list of ${section.title} categories`}
            >
              <Text style={styles.viewAllText}>View all</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primaryDark} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {section.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
                accessibilityLabel={`${category.name} category, up to ${category.cashbackPercentage}% cashback`}
                accessibilityRole="button"
                accessibilityHint={`Opens ${category.name} category page with products and offers`}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <Image
                      source={{ uri: category.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                      accessibilityLabel={`${category.name} category image`}
                      accessibilityRole="image"
                    />
                  ) : (
                    <View
                      style={styles.categoryImagePlaceholder}
                      accessibilityLabel={`${category.name} category placeholder`}
                    >
                      <Ionicons name="image-outline" size={28} color={COLORS.primary} />
                    </View>
                  )}
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.cashbackRow}>
                    <View style={styles.cashbackBadge}>
                      <Text style={styles.cashbackBadgeText}>Upto {category.cashbackPercentage}%</Text>
                    </View>
                    <Text style={styles.categoryCashback}>cash back</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderSuggestions = () => (
    <View
      style={styles.suggestionsContainer}
      accessibilityLabel="Search suggestions list"
      accessibilityRole="list"
    >
      <Text style={styles.suggestionsTitle}>Search Suggestions</Text>
      {searchState.suggestions
        .filter(s => s.text.toLowerCase().includes(searchState.query.toLowerCase()))
        .slice(0, 8)
        .map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(suggestion)}
            activeOpacity={0.7}
            accessibilityLabel={`Search for ${suggestion.text}${suggestion.resultCount ? `, ${suggestion.resultCount} results available` : ''}`}
            accessibilityRole="button"
            accessibilityHint="Selects this search suggestion and performs search"
          >
            <Ionicons
              name={suggestion.type === 'category' ? 'grid-outline' : 'search-outline'}
              size={16}
              color="#6B7280"
            />
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
            {suggestion.resultCount && <Text style={styles.suggestionCount}>({suggestion.resultCount})</Text>}
          </TouchableOpacity>
        ))}
    </View>
  );

  const renderStoreCard = (store: any) => (
    <TouchableOpacity
      key={store.storeId}
      style={styles.storeResultCard}
      onPress={() => router.push(`/store/${store.storeId}`)}
      activeOpacity={0.9}
    >
      <View style={styles.storeResultContent}>
        {store.logo ? (
          <Image source={{ uri: store.logo }} style={styles.storeResultLogo} />
        ) : (
          <View style={[styles.storeResultLogo, styles.storeResultLogoPlaceholder]}>
            <Ionicons name="storefront" size={24} color={COLORS.muted} />
          </View>
        )}
        <View style={styles.storeResultInfo}>
          <View style={styles.storeResultNameRow}>
            <Text style={styles.storeResultName} numberOfLines={1}>{store.name}</Text>
            {store.isVerified && (
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          {store.description ? (
            <Text style={styles.storeResultDescription} numberOfLines={2}>{store.description}</Text>
          ) : null}
          <View style={styles.storeResultMeta}>
            {store.rating > 0 && (
              <View style={styles.storeResultRating}>
                <Ionicons name="star" size={12} color={COLORS.gold} />
                <Text style={styles.storeResultRatingText}>{store.rating.toFixed(1)}</Text>
                {store.reviewCount > 0 && (
                  <Text style={styles.storeResultReviewCount}>({store.reviewCount})</Text>
                )}
              </View>
            )}
            {store.location ? (
              <View style={styles.storeResultLocation}>
                <Ionicons name="location-outline" size={12} color={COLORS.muted} />
                <Text style={styles.storeResultLocationText}>{store.location}</Text>
              </View>
            ) : null}
            {store.distance !== undefined && (
              <Text style={styles.storeResultDistance}>{store.distance} km</Text>
            )}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.muted} />
      </View>
    </TouchableOpacity>
  );

  const renderResults = () => {
    // Use grouped products if available, otherwise fall back to regular results
    if (groupedProducts.length > 0 || matchingStores.length > 0) {
      return (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Search Results Summary */}
          {searchSummary && (
            <SearchResultsSummary query={searchState.query} summary={searchSummary} />
          )}

          {/* Filter Bar */}
          {groupedProducts.length > 0 && (
            <FilterBar
              onFilterPress={handleFilterPress}
              onSortChange={handleSortChange}
              currentSort={currentSort}
              activeFilters={activeFilters}
            />
          )}

          {/* Matching Stores Section */}
          {matchingStores.length > 0 && (
            <View style={styles.matchingStoresSection}>
              <View style={styles.matchingStoresHeader}>
                <Ionicons name="storefront-outline" size={18} color={COLORS.primary} />
                <Text style={styles.matchingStoresTitle}>Matching Stores</Text>
                <Text style={styles.matchingStoresCount}>{matchingStores.length}</Text>
              </View>
              {matchingStores.map(renderStoreCard)}
            </View>
          )}

          {/* Promotional Banner - ReZ Brand Colors */}
          {groupedProducts.length > 0 && (
            <LinearGradient
              colors={['rgba(0, 192, 106, 0.1)', 'rgba(255, 200, 87, 0.08)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.promoBanner}
            >
              <View style={styles.promoIconContainer}>
                <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.promoText}>
                Cashback & rezcoins auto-applied at checkout for maximum savings
              </Text>
              <Ionicons name="sparkles" size={16} color={COLORS.gold} />
            </LinearGradient>
          )}

          {/* Grouped Products */}
          {sortedGroupedProducts.map((productGroup) => (
            <View key={productGroup.productId} style={styles.productGroup}>
              <ProductGroupHeader product={productGroup} />
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderContent}>
                  <Text style={styles.sectionTitle}>Same product • Compare sellers</Text>
                  <Text style={styles.sectionSubtitle}>Find the best deal across sellers.</Text>
                </View>
                <View style={styles.brandAccent} />
              </View>
              {productGroup.sellers.map((seller, index) => (
                <SellerComparisonCard
                  key={`${seller.storeId}-${index}`}
                  seller={seller}
                  productId={productGroup.productId}
                  onPress={handleSellerPress}
                  onCompare={(seller) => {
                    // Navigate to compare page with product ID
                    router.push(`/compare?productId=${productGroup.productId}`);
                  }}
                  onFavorite={(seller) => {
                    // TODO: Implement favorite functionality
                  }}
                  onShare={(seller) => {
                    // TODO: Implement share functionality
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      );
    }

    // Fallback to regular results display
    return (
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Results Header */}
        <View style={styles.searchResultsHeader}>
          <View style={styles.searchResultsTitleContainer}>
            <Ionicons name="search" size={20} color={COLORS.primary} />
            <Text style={styles.searchResultsTitle}>
              Search Results
            </Text>
          </View>
          <Text style={styles.searchResultsCount}>
            {searchState.loading ? 'Searching...' : `${searchState.results.length} ${searchState.results.length === 1 ? 'result' : 'results'} found`}
          </Text>
          <Text style={styles.searchQueryText}>
            for "{searchState.query}"
          </Text>
        </View>

        {/* Results Grid */}
        <View style={styles.resultsGrid}>
          {searchState.results.map((result, index) => (
            <TouchableOpacity
              key={result.id}
              style={styles.resultCard}
              onPress={() => handleResultPress(result, index + 1)}
              activeOpacity={0.9}
              accessibilityLabel={`${result.title}, ${result.category}, ${result.cashbackPercentage}% cashback`}
              accessibilityRole="button"
              accessibilityHint={`Opens details page for ${result.title}`}
            >
              <View style={styles.resultImageContainer}>
                {result.image ? (
                  <Image
                    source={{ uri: result.image }}
                    style={styles.resultImage}
                    resizeMode="cover"
                    accessibilityLabel={`${result.title} image`}
                    accessibilityRole="image"
                  />
                ) : (
                  <View
                    style={styles.resultImagePlaceholder}
                    accessibilityLabel={`${result.title} placeholder image`}
                  >
                    <Text style={styles.resultImageText}>{result.title.charAt(0)}</Text>
                  </View>
                )}
              </View>

              <View style={styles.resultInfo}>
                <Text style={styles.resultTitle} numberOfLines={2}>{result.title}</Text>
                <Text style={styles.resultDescription} numberOfLines={2}>
                  {result.description}
                </Text>
                <View style={styles.resultMeta}>
                  <View style={styles.resultCashback}>
                    <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.resultCashbackText}>{result.cashbackPercentage}% cashback</Text>
                  </View>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{result.category}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderErrorState = () => (
    <View
      style={styles.errorContainer}
      accessibilityLabel="Error occurred"
      accessibilityRole="alert"
    >
      <Ionicons name="alert-circle-outline" size={80} color="#EF4444" accessibilityLabel="Error icon" />
      <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
      <Text style={styles.errorMessage}>{searchState.error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => {
          actions.handleClearError();
          if (viewMode === 'results' && searchState.query) {
            actions.performSearch(searchState.query);
          } else {
            actions.loadCategories();
          }
        }}
        accessibilityLabel="Try again"
        accessibilityRole="button"
        accessibilityHint="Retries the failed operation"
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View
      style={styles.loadingContainer}
      accessibilityLabel={searchState.isSearching ? 'Searching for results' : 'Loading content'}
      accessibilityRole="progressbar"
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>
        {searchState.isSearching ? 'Searching...' : 'Loading...'}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View
      style={styles.emptyContainer}
      accessibilityLabel="No search results found"
      accessibilityRole="alert"
    >
      <View style={styles.emptyIconContainer}>
        <Ionicons name="search-outline" size={80} color="rgba(0, 192, 106, 0.2)" accessibilityLabel="Search icon" />
      </View>
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptyMessage}>
        We couldn't find anything for "{searchState.query}"
      </Text>
      <Text style={styles.emptySuggestion}>
        Try different keywords or browse our categories
      </Text>
      <View style={styles.emptyActionContainer}>
        <TouchableOpacity
          style={styles.emptyActionButton}
          onPress={() => {
            actions.handleClearSearch();
            setViewMode('categories');
          }}
          accessibilityLabel="Browse categories"
          accessibilityRole="button"
          accessibilityHint="Clears search and shows all available categories"
        >
          <Text style={styles.emptyActionText}>Browse Categories</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSearchHint = () => (
    <View
      style={styles.searchHintContainer}
      accessibilityLabel="Search hint"
      accessibilityRole="alert"
    >
      <Ionicons name="information-circle-outline" size={48} color="rgba(0, 192, 106, 0.3)" accessibilityLabel="Information icon" />
      <Text style={styles.searchHintTitle}>Keep typing...</Text>
      <Text style={styles.searchHintText}>
        Enter at least 2 characters to start searching
      </Text>
    </View>
  );

  const renderContent = () => {
    // Show error if there's an error
    if (searchState.error && !searchState.sections.length) {
      return renderErrorState();
    }

    // Show loading
    if (searchState.loading && !searchState.sections.length) {
      return renderLoadingState();
    }

    switch (viewMode) {
      case 'suggestions':
        return renderSuggestions();
      case 'results':
        if (searchState.loading) {
          return renderLoadingState();
        }
        if (searchState.query.trim().length < 2) {
          return renderSearchHint();
        }
        if ((groupedProducts.length === 0 && matchingStores.length === 0 && searchState.results.length === 0) && !searchState.loading) {
          return renderEmptyState();
        }
        return renderResults();
      default:
        return renderCategories();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {renderHeader()}
      {searchState.error && searchState.sections.length > 0 && (
        <View
          style={styles.errorBanner}
          accessibilityLabel={`Warning: ${searchState.error}`}
          accessibilityRole="alert"
        >
          <Ionicons name="warning-outline" size={16} color="#F59E0B" accessibilityLabel="Warning icon" />
          <Text style={styles.errorBannerText}>{searchState.error}</Text>
        </View>
      )}
      {renderContent()}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  headerWrapper: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 24px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 48 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -60,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    top: 20,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    zIndex: 1,
  },
  decorativeCircle3: {
    position: 'absolute',
    bottom: -40,
    right: 80,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
    position: 'relative',
  },
  backButton: {
    zIndex: 3,
  },
  backButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
      },
    }),
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 3px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
      },
    }),
  },
  searchInputFocused: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOpacity: 0.18,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 18px rgba(0, 192, 106, 0.18), inset 0 1px 0 rgba(255,255,255,0.8)',
      },
    }),
  },
  searchIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    borderWidth: 0,
    padding: 0,
    letterSpacing: 0.1,
    lineHeight: 18,
  },
  clearButton: {
    marginLeft: 4,
  },
  clearButtonInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
    overflow: 'visible',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
      web: {
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255,255,255,0.3)',
      },
    }),
  },
  filterButtonActive: {
    backgroundColor: 'rgba(0, 192, 106, 0.3)',
    borderColor: '#FFC857',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC857',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 3px 14px rgba(255, 200, 87, 0.3), inset 0 0 0 1px rgba(0, 192, 106, 0.25)',
      },
    }),
  },
  filterIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FFC857',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#FFC857',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 3px 12px rgba(255, 200, 87, 0.4)',
      },
    }),
  },
  filterBadgeText: {
    color: '#1F2937',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  quickSearchActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  quickSearchCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  quickSearchGradient: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  quickSearchText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 8,
  },
  quickSearchSubtext: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.muted,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 192, 106, 0.12)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 12px rgba(0, 192, 106, 0.15)',
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    color: COLORS.primaryDark,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 54) / 2,
    backgroundColor: COLORS.glassWhite,
    borderRadius: 20,
    padding: 14,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  },
  categoryImageContainer: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 110,
    borderRadius: 14,
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  categoryImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  categoryInfo: {
    alignItems: 'flex-start',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 10px rgba(0, 192, 106, 0.2)',
      },
    }),
  },
  cashbackBadgeText: {
    color: COLORS.primaryDark,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  categoryCashback: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '700',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  suggestionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  searchResultsHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  searchResultsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  searchResultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  searchResultsCount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  searchQueryText: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  resultCard: {
    width: (width - 48) / 2,
    backgroundColor: COLORS.glassWhite,
    marginBottom: 16,
    marginHorizontal: 2,
    borderRadius: 20,
    padding: 14,
    height: 290,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255,255,255,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      },
    }),
  },
  resultImageContainer: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
  },
  resultImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImageText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00C06A',
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    lineHeight: 22,
  },
  resultDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 18,
    fontWeight: '500',
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  resultCashback: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 192, 106, 0.15)',
      },
    }),
  },
  resultCashbackText: {
    fontSize: 11,
    color: COLORS.primaryDark,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  categoryTag: {
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 200, 87, 0.3)',
  },
  categoryTagText: {
    color: COLORS.navy,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  emptySuggestion: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyActionContainer: {
    width: '100%',
  },
  emptyActionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  searchHintContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginTop: 20,
    marginHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  searchHintTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginTop: 16,
    marginBottom: 8,
  },
  searchHintText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '500',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 12px rgba(0, 192, 106, 0.15)',
      },
    }),
  },
  promoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.25)',
  },
  promoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  productGroup: {
    marginTop: 16,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 192, 106, 0.08)',
      },
    }),
  },
  sectionHeaderContent: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  brandAccent: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginLeft: 12,
  },
  // Matching Stores Section
  matchingStoresSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  matchingStoresHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    gap: 8,
  },
  matchingStoresTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.navy,
    flex: 1,
  },
  matchingStoresCount: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden' as const,
  },
  // Store Result Card
  storeResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storeResultContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 14,
    gap: 12,
  },
  storeResultLogo: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  storeResultLogoPlaceholder: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  storeResultInfo: {
    flex: 1,
  },
  storeResultNameRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: 3,
  },
  storeResultName: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: COLORS.navy,
  },
  storeResultDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  storeResultMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    flexWrap: 'wrap' as const,
  },
  storeResultRating: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3,
  },
  storeResultRatingText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.navy,
  },
  storeResultReviewCount: {
    fontSize: 11,
    color: COLORS.muted,
  },
  storeResultLocation: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 2,
  },
  storeResultLocationText: {
    fontSize: 12,
    color: COLORS.muted,
  },
  storeResultDistance: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: COLORS.primary,
  },
});
