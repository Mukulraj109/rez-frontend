import React, { useState, useEffect, useCallback } from 'react';
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
import {
  SearchPageState,
  SearchSection,
  SearchCategory,
  SearchResult,
  SearchSuggestion,
  SearchViewMode,
} from '@/types/search.types';
import { SearchHeader, SearchSection as SearchSectionComponent, FilterModal } from '@/components/search';
import { useSearchPage } from '@/hooks/useSearchPage';
import useDebouncedSearch from '@/hooks/useDebouncedSearch';
import type { FilterState } from '@/components/search/FilterModal';

const { width } = Dimensions.get('window');

export default function SearchPage() {
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || '';

  // Use the new search page hook
  const { state: searchState, actions } = useSearchPage();

  // Use debounced search hook
  const { value: searchQuery, debouncedValue: debouncedQuery, isDebouncing, setValue: setSearchQuery } = useDebouncedSearch(initialQuery, { delay: 300, minLength: 2 });

  const [viewMode, setViewMode] = useState<SearchViewMode>(initialQuery ? 'results' : 'categories');
  const [inputFocused, setInputFocused] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [currentFilters, setCurrentFilters] = useState<FilterState>({
    priceRange: { min: 0, max: 100000 },
    rating: null,
    categories: [],
    inStock: false,
    cashbackMin: 0,
  });

  useEffect(() => {
    // Perform search if initial query exists
    if (initialQuery) {
      actions.performSearch(initialQuery);
    }
  }, [initialQuery, actions]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery && debouncedQuery.trim().length >= 2) {
      actions.performSearch(debouncedQuery);
    }
  }, [debouncedQuery, actions]);

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

  const handleSearch = () => {
    if (searchState.query.trim()) {
      actions.handleSearchSubmit(searchState.query);
      setViewMode('results');
    }
  };

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

    if (result.category === 'Store') {
      // Navigate to MainStorePage with storeId to show store view

      router.push(`/MainStorePage?storeId=${result.id}`);
    } else {
      // Navigate to product page
      router.push({
        pathname: '/product/[id]' as any,
        params: {
          id: result.id
        }
      });
    }
  };

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
        label: `₹${filters.priceRange.min} - ₹${filters.priceRange.max}`,
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
    <LinearGradient colors={['#7C3AED', '#8B5CF6', '#C084FC'] as const} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity
          onPress={handleBack}
          style={styles.backButton}
          activeOpacity={0.8}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          accessibilityHint="Returns to the previous screen"
        >
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, inputFocused && styles.searchInputFocused]}>
            <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
            <TextInput
              style={[
                styles.searchInput,
                // web-only inline style to remove web focus outline; cast to any to satisfy TS
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
                accessibilityLabel="Clear search"
                accessibilityRole="button"
                accessibilityHint="Clears the current search text"
              >
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={styles.filterButton}
          activeOpacity={0.8}
          onPress={handleOpenFilters}
          accessibilityLabel={`Filters${Object.keys(searchState.activeFilters).length > 0 ? `, ${Object.keys(searchState.activeFilters).length} active` : ''}`}
          accessibilityRole="button"
          accessibilityHint="Opens filter options to refine search results"
          accessibilityState={{ selected: Object.keys(searchState.activeFilters).length > 0 }}
        >
          <Ionicons name="options-outline" size={20} color="white" />
          {Object.keys(searchState.activeFilters).length > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{Object.keys(searchState.activeFilters).length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Decorative elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />
    </LinearGradient>
  );

  const renderCategories = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
              <Ionicons name="arrow-forward" size={16} color="#8B5CF6" style={{ marginLeft: 4 }} />
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
                      <Ionicons name="image-outline" size={28} color="#8B5CF6" />
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

  const renderResults = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Search Results Header */}
      <View style={styles.searchResultsHeader}>
        <View style={styles.searchResultsTitleContainer}>
          <Ionicons name="search" size={20} color="#8B5CF6" />
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
                  <Ionicons name="cash-outline" size={14} color="#10B981" />
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
      <ActivityIndicator size="large" color="#7C3AED" />
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
        <Ionicons name="search-outline" size={80} color="#D1D5DB" accessibilityLabel="Search icon" />
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
      <Ionicons name="information-circle-outline" size={48} color="#D1D5DB" accessibilityLabel="Information icon" />
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
        if (searchState.results.length === 0 && !searchState.loading) {
          return renderEmptyState();
        }
        return renderResults();
      default:
        return renderCategories();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
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
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 22,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  backButton: {
    zIndex: 3,
  },
  backButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  searchContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  searchInputFocused: {
    shadowOpacity: 0.12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    // make sure no border is present by default:
    borderWidth: 0,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  filterBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  floatingElement1: {
    position: 'absolute',
    top: -10,
    right: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
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
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(139, 92, 246, 0.15)',
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 14,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.12)',
      },
    }),
    borderWidth: 0.5,
    borderColor: 'rgba(139,92,246,0.08)',
  },
  categoryImageContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 120,
    borderRadius: 16,
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  categoryInfo: {
    alignItems: 'flex-start',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashbackBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(16, 185, 129, 0.2)',
      },
    }),
  },
  cashbackBadgeText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  categoryCashback: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#8B5CF6',
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
    backgroundColor: 'white',
    marginBottom: 16,
    marginHorizontal: 2,
    borderRadius: 20,
    padding: 16,
    height: 300, // Increased height for better consistency
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(139, 92, 246, 0.12)',
      },
    }),
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.08)',
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
    color: '#8B5CF6',
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
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  resultCashbackText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.3,
  },
  categoryTag: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  categoryTagText: {
    color: '#6B21A8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    backgroundColor: '#7C3AED',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 8px rgba(139, 92, 246, 0.3)',
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
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
  },
  searchHintText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
