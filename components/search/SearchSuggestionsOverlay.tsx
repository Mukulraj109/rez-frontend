import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';
import { searchHistoryService } from '@/services/searchHistoryService';
import searchDiscoveryApi, { TrendingSearch } from '@/services/searchDiscoveryApi';
import { useRegion } from '@/contexts/RegionContext';

interface AutocompleteResult {
  products: Array<{
    _id: string;
    name: string;
    price: number;
    image: string;
    store: { name: string };
  }>;
  stores: Array<{
    _id: string;
    name: string;
    logo: string;
  }>;
  categories: Array<{
    _id: string;
    name: string;
  }>;
  brands: string[];
}

interface SearchSuggestionsOverlayProps {
  query: string;
  visible: boolean;
  onSuggestionPress: (text: string) => void;
  onClose?: () => void;
  topOffset?: number;
}

export default function SearchSuggestionsOverlay({
  query,
  visible,
  onSuggestionPress,
  onClose,
  topOffset = 0,
}: SearchSuggestionsOverlayProps) {
  const { getCurrencySymbol, getLocale } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const locale = getLocale();
  const [autocompleteResults, setAutocompleteResults] = useState<AutocompleteResult | null>(null);
  const [recentSearches, setRecentSearches] = useState<Array<{ id: string; query: string }>>([]);
  const [trendingSearches, setTrendingSearches] = useState<TrendingSearch[]>([]);
  const [loading, setLoading] = useState(false);

  // Load recent searches and trending searches
  useEffect(() => {
    if (visible) {
      loadRecentSearches();
      loadTrendingSearches();
    }
  }, [visible]);

  // Load autocomplete when query changes (2+ characters)
  useEffect(() => {
    if (visible && query.trim().length >= 2) {
      loadAutocomplete(query.trim());
    } else {
      setAutocompleteResults(null);
    }
  }, [query, visible]);

  const loadRecentSearches = async () => {
    try {
      const history = await searchHistoryService.getRecentSearches(5);
      setRecentSearches(
        history.map((item) => ({
          id: item.id,
          query: item.query,
        }))
      );
    } catch (error) {
      console.error('[SearchSuggestionsOverlay] Error loading recent searches:', error);
    }
  };

  const loadTrendingSearches = async () => {
    try {
      const response = await searchDiscoveryApi.getTrendingSearches(5);
      if (response.success && response.data) {
        setTrendingSearches(response.data.searches || []);
      }
    } catch (error) {
      console.error('[SearchSuggestionsOverlay] Error loading trending searches:', error);
    }
  };

  const loadAutocomplete = async (searchQuery: string) => {
    if (searchQuery.length < 2) return;

    setLoading(true);
    try {
      const response = await apiClient.get<AutocompleteResult>('/search/autocomplete', {
        q: searchQuery,
      });

      if (response.success && response.data) {
        setAutocompleteResults(response.data);
      }
    } catch (error) {
      console.error('[SearchSuggestionsOverlay] Error loading autocomplete:', error);
      setAutocompleteResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (text: string) => {
    onSuggestionPress(text);
  };

  if (!visible) return null;

  const hasQuery = query.trim().length >= 2;
  const hasAutocompleteResults = autocompleteResults && (
    autocompleteResults.products.length > 0 ||
    autocompleteResults.stores.length > 0 ||
    autocompleteResults.categories.length > 0 ||
    autocompleteResults.brands.length > 0
  );

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.overlay, { top: topOffset }]}>
      {/* Search Query Header */}
      {hasQuery && (
        <View style={styles.searchQueryHeader}>
          <Ionicons name="search" size={16} color="#00C06A" />
          <Text style={styles.searchQueryText}>
            Searching for "<Text style={styles.searchQueryBold}>{query}</Text>"
          </Text>
        </View>
      )}
      
      <ScrollView
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Recent Searches - Show when no query or query < 2 chars */}
        {!hasQuery && recentSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={18} color="#6B7280" />
              <Text style={styles.sectionTitle}>Recent Searches</Text>
            </View>
            {recentSearches.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item.query)}
                activeOpacity={0.7}
              >
                <Ionicons name="time" size={18} color="#9CA3AF" />
                <Text style={styles.suggestionText}>{item.query}</Text>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    searchHistoryService.removeSearch(item.id);
                    loadRecentSearches();
                  }}
                  style={styles.deleteButton}
                >
                  <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Trending Searches - Show when no query */}
        {!hasQuery && trendingSearches.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="trending-up" size={18} color="#00C06A" />
              <Text style={styles.sectionTitle}>Trending Searches</Text>
            </View>
            {trendingSearches.map((item, index) => (
              <TouchableOpacity
                key={item._id || index}
                style={styles.suggestionItem}
                onPress={() => handleSuggestionPress(item.query)}
                activeOpacity={0.7}
              >
                <View style={styles.trendingBadge}>
                  <Text style={styles.trendingNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.suggestionText}>{item.query}</Text>
                {item.count && (
                  <Text style={styles.countText}>{item.count} searches</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Autocomplete Results - Show when query >= 2 chars */}
        {hasQuery && (
          <>
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00C06A" />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            )}

            {!loading && hasAutocompleteResults && (
              <>
                {/* Products */}
                {autocompleteResults!.products.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="cube-outline" size={18} color="#00C06A" />
                      <Text style={styles.sectionTitle}>Products</Text>
                    </View>
                    {autocompleteResults!.products.map((product) => (
                      <TouchableOpacity
                        key={product._id}
                        style={styles.productItem}
                        onPress={() => handleSuggestionPress(product.name)}
                        activeOpacity={0.7}
                      >
                        {product.image ? (
                          <Image
                            source={{ uri: product.image }}
                            style={styles.productImage}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.productImagePlaceholder}>
                            <Ionicons name="image-outline" size={20} color="#9CA3AF" />
                          </View>
                        )}
                        <View style={styles.productInfo}>
                          <Text style={styles.productName} numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text style={styles.productStore}>{product.store.name}</Text>
                        </View>
                        <Text style={styles.productPrice}>
                          {currencySymbol}{product.price.toLocaleString(locale)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Stores */}
                {autocompleteResults!.stores.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="storefront-outline" size={18} color="#00C06A" />
                      <Text style={styles.sectionTitle}>Stores</Text>
                    </View>
                    {autocompleteResults!.stores.map((store) => (
                      <TouchableOpacity
                        key={store._id}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionPress(store.name)}
                        activeOpacity={0.7}
                      >
                        {store.logo ? (
                          <Image
                            source={{ uri: store.logo }}
                            style={styles.storeLogo}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.storeLogoPlaceholder}>
                            <Ionicons name="storefront" size={18} color="#9CA3AF" />
                          </View>
                        )}
                        <Text style={styles.suggestionText}>{store.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Categories */}
                {autocompleteResults!.categories.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="grid-outline" size={18} color="#00C06A" />
                      <Text style={styles.sectionTitle}>Categories</Text>
                    </View>
                    {autocompleteResults!.categories.map((category) => (
                      <TouchableOpacity
                        key={category._id}
                        style={styles.suggestionItem}
                        onPress={() => handleSuggestionPress(category.name)}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="grid" size={18} color="#9CA3AF" />
                        <Text style={styles.suggestionText}>{category.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Brands */}
                {autocompleteResults!.brands.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="pricetag-outline" size={18} color="#00C06A" />
                      <Text style={styles.sectionTitle}>Brands</Text>
                    </View>
                    <View style={styles.brandsContainer}>
                      {autocompleteResults!.brands.map((brand, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.brandChip}
                          onPress={() => handleSuggestionPress(brand)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.brandText}>{brand}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </>
            )}

            {!loading && !hasAutocompleteResults && (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="search-outline" size={40} color="#00C06A" />
                </View>
                <Text style={styles.emptyText}>No results for "{query}"</Text>
                <Text style={styles.emptySubtext}>Try a different search term or check spelling</Text>
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={() => onSuggestionPress(query)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.searchButtonText}>Search anyway</Text>
                  <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 1000,
    paddingTop: 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  searchQueryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 8,
  },
  searchQueryText: {
    fontSize: 14,
    color: '#6B7280',
  },
  searchQueryBold: {
    fontWeight: '700',
    color: '#1F2937',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  deleteButton: {
    padding: 4,
  },
  trendingBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00C06A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  countText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginLeft: 'auto',
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  productImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  productStore: {
    fontSize: 12,
    color: '#6B7280',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  storeLogo: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  storeLogoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  brandText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
