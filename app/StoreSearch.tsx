import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/contexts/LocationContext';
import StoreSearchBar from '@/components/store/StoreSearchBar';
import StoreFilters, { FilterOptions } from '@/components/store/StoreFilters';
import StoreComparison from '@/components/store/StoreComparison';
import StoreReviews from '@/components/store/StoreReviews';
import apiClient from '@/services/apiClient';
import { useStoreComparison } from '@/hooks/useStoreComparison';
import { useStoreFavorites } from '@/hooks/useStoreFavorites';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Store, storeSearchService } from '@/services/storeSearchService';
import BottomNavigation from '@/components/navigation/BottomNavigation';

const { width } = Dimensions.get('window');

// Store interface is now imported from storeSearchService

interface StoreSearchParams {
  category: string;
  title?: string;
}

const StoreSearch: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { state } = useLocation();
  const { currentLocation } = state;
  
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'name' | 'newest' | 'price'>('rating');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [selectedStoreForReviews, setSelectedStoreForReviews] = useState<Store | null>(null);

  const {
    comparisonStores,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddToComparison,
    loadComparisonFromStorage,
  } = useStoreComparison();

  const {
    favoriteStores,
    toggleFavorite,
    isFavorite,
    loadFavoritesFromStorage,
  } = useStoreFavorites();

  const {
    trackStoreView, trackStoreSearch, trackStoreFavorite, trackStoreCompare, trackStoreReview, trackStoreClick
  } = useAnalytics();

  const categoryInfo = {
    fastDelivery: { name: '30 min delivery', icon: '🚀', color: '#7B61FF' },
    budgetFriendly: { name: '1 rupees store', icon: '💰', color: '#6E56CF' },
    ninetyNineStore: { name: '99 Rupees store', icon: '💳', color: '#6A5ACD' },
    premium: { name: 'Luxury store', icon: '👑', color: '#A78BFA' },
    organic: { name: 'Organic Store', icon: '🌱', color: '#34D399' },
    alliance: { name: 'Alliance Store', icon: '🤝', color: '#9F7AEA' },
    lowestPrice: { name: 'Lowest Price', icon: '💸', color: '#22D3EE' },
    mall: { name: 'Rez Mall', icon: '🏬', color: '#60A5FA' },
    cashStore: { name: 'Cash Store', icon: '💵', color: '#8B5CF6' },
    // Keep backward compatibility
    oneRupeeStore: { name: '1 rupees store', icon: '💰', color: '#6E56CF' },
  };

  const currentCategory = categoryInfo[params.category as keyof typeof categoryInfo];

  const fetchStores = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }

      const locationParam = currentLocation?.coordinates 
        ? `${currentLocation.coordinates.longitude},${currentLocation.coordinates.latitude}`
        : undefined;

      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '20',
        sortBy,
        ...(locationParam && { location: locationParam, radius: '10' }),
      });

          console.log(`[StoreSearch] Fetching stores for category: ${params.category}`);
          console.log(`[StoreSearch] Request URL: /stores/search-by-category/${params.category}?${queryParams}`);
          console.log(`[StoreSearch] Current category info:`, currentCategory);
          console.log(`[StoreSearch] Full API URL: ${apiClient.getBaseURL()}/stores/search-by-category/${params.category}?${queryParams}`);

      const response = await apiClient.get(
        `/stores/search-by-category/${params.category}?${queryParams}`
      );

      console.log(`[StoreSearch] API Response:`, response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch stores');
      }

      const data = response.data as any;
      
      console.log(`[StoreSearch] Response data:`, data);
      console.log(`[StoreSearch] Stores in response:`, data?.stores);
      console.log(`[StoreSearch] Stores count:`, data?.stores?.length || 0);
      
      if (data && data.stores) {
        const newStores = data.stores;
        console.log(`[StoreSearch] Setting stores:`, newStores);
        
        if (pageNum === 1 || refresh) {
          setStores(newStores);
        } else {
          setStores(prev => [...prev, ...newStores]);
        }
        
        setHasMore(data.pagination?.hasNext || false);
        setPage(pageNum);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', 'Failed to load stores. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (params.category) {
      fetchStores(1);
    }
    // Load comparison and favorites data from storage
    loadComparisonFromStorage();
    loadFavoritesFromStorage();
  }, [params.category, sortBy, loadComparisonFromStorage, loadFavoritesFromStorage]);

  const handleRefresh = () => {
    fetchStores(1, true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchStores(page + 1);
    }
  };

  const handleStorePress = (store: Store) => {
    // Navigate to MainStorePage with store data
    router.push({
      pathname: '/MainStorePage' as any,
      params: {
        storeData: JSON.stringify(store),
        storeId: store._id,
        storeName: store.name,
      },
    });
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        setLoading(true);
        
        // Track search analytics
        trackStoreSearch(query.trim(), params.category as string);
        
        const locationString = currentLocation 
          ? `${currentLocation.coordinates.longitude},${currentLocation.coordinates.latitude}`
          : undefined;
        
        const response = await storeSearchService.advancedStoreSearch({
          search: query.trim(),
          location: locationString,
          radius: 10,
          page: 1,
          limit: 20,
          sortBy: sortBy as any,
        });
        
        if (response.success) {
          setStores(response.data.stores);
          setPage(1);
          setHasMore(response.data.pagination.hasNext);
        }
      } catch (error) {
        console.error('Search error:', error);
        Alert.alert('Search Error', 'Failed to search stores. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (suggestion.type === 'category') {
      // Navigate to category search
      router.push({
        pathname: '/StoreSearch' as any,
        params: {
          category: suggestion.id,
          title: suggestion.name,
        },
      });
    } else if (suggestion.type === 'location') {
      // Handle location-based search
      console.log('Location search:', suggestion.name);
    }
  };

  const handleApplyFilters = async (filters: FilterOptions) => {
    setActiveFilters(filters);
    setSortBy(filters.sortBy);
    
    try {
      setLoading(true);
      const locationString = currentLocation 
        ? `${currentLocation.coordinates.longitude},${currentLocation.coordinates.latitude}`
        : undefined;
      
      const response = await storeSearchService.advancedStoreSearch({
        search: searchQuery,
        category: params.category as string,
        deliveryTime: filters.deliveryTime,
        priceRange: filters.priceRange,
        rating: filters.rating > 0 ? filters.rating : undefined,
        paymentMethods: filters.paymentMethods.length > 0 ? filters.paymentMethods : undefined,
        features: filters.features,
        sortBy: filters.sortBy,
        location: locationString,
        radius: 10,
        page: 1,
        limit: 20,
      });
      
      if (response.success) {
        setStores(response.data.stores);
        setPage(1);
        setHasMore(response.data.pagination.hasNext);
      }
    } catch (error) {
      console.error('Filter error:', error);
      Alert.alert('Filter Error', 'Failed to apply filters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActiveFiltersCount = () => {
    if (!activeFilters) return 0;
    let count = 0;
    if (activeFilters.deliveryTime.min !== 15 || activeFilters.deliveryTime.max !== 90) count++;
    if (activeFilters.priceRange.min !== 0 || activeFilters.priceRange.max !== 2000) count++;
    if (activeFilters.rating > 0) count++;
    if (activeFilters.paymentMethods.length > 0) count++;
    if (Object.values(activeFilters.features).some(Boolean)) count++;
    return count;
  };

  const handleAddToComparison = async (store: Store) => {
    const success = await addToComparison(store);
    if (success) {
      trackStoreCompare(store._id, 'add');
      Alert.alert('Success', `${store.name} added to comparison`);
    } else if (isInComparison(store._id)) {
      Alert.alert('Already Added', `${store.name} is already in comparison`);
    } else {
      Alert.alert('Limit Reached', 'You can compare up to 4 stores at a time');
    }
  };

  const handleRemoveFromComparison = async (storeId: string) => {
    await removeFromComparison(storeId);
    trackStoreCompare(storeId, 'remove');
  };

  const handleClearComparison = async () => {
    await clearComparison();
  };

  const handleToggleFavorite = async (store: Store) => {
    const wasAdded = await toggleFavorite(store);
    trackStoreFavorite(store._id, wasAdded);
    if (wasAdded) {
      Alert.alert('Added to Favorites', `${store.name} has been added to your favorites`);
    } else {
      Alert.alert('Removed from Favorites', `${store.name} has been removed from your favorites`);
    }
  };

  const handleShowReviews = (store: Store) => {
    setSelectedStoreForReviews(store);
    setShowReviews(true);
    trackStoreReview(store._id, 'view');
  };

  const handleAddReview = () => {
    Alert.alert('Add Review', 'Review functionality will be implemented in the next phase');
  };

  const renderStoreCard = ({ item: store }: { item: Store }) => {
    if (!store) {
      console.log('Store is null or undefined');
      return null;
    }
    
    console.log('[StoreSearch] Rendering store card for:', store.name);
    console.log('[StoreSearch] Store data fields:', {
      name: store.name,
      rating: store.rating,
      deliveryTime: store.deliveryTime,
      minimumOrder: store.minimumOrder,
      address: store.address,
      city: store.address?.city,
      street: store.address?.street,
      hasAddress: !!store.address
    });
    
    return (
        <TouchableOpacity
          style={styles.storeCard}
          onPress={() => {
            trackStoreClick(store._id, 'store_card', { category: params.category });
            handleStorePress(store);
          }}
          activeOpacity={0.7}
        >
        <View style={styles.storeImageContainer}>
        {store.logo && store.logo.trim() !== '' ? (
          <Image 
            source={{ uri: store.logo }} 
            style={styles.storeImage} 
            resizeMode="cover"
            onError={() => {
              console.log('Image failed to load for store:', store.name);
            }}
          />
        ) : (
          <LinearGradient
            colors={[currentCategory?.color || '#7B61FF', '#A855F7']}
            style={styles.storeImagePlaceholder}
          >
            <View style={styles.placeholderContent}>
              <Text style={styles.storeImageText}>{store.name.charAt(0)}</Text>
              <Text style={styles.placeholderSubtext}>{store.name.split(' ')[0]}</Text>
            </View>
            {/* Decorative elements */}
            <View style={styles.placeholderCircle1} />
            <View style={styles.placeholderCircle2} />
          </LinearGradient>
        )}
        
        {/* Modern Badge */}
        <View style={styles.modernBadge}>
          <Text style={styles.modernBadgeText}>{currentCategory?.icon}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => handleToggleFavorite(store)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isFavorite(store._id) ? "heart" : "heart-outline"}
            size={20}
            color={isFavorite(store._id) ? "#FF3B30" : "#fff"}
          />
        </TouchableOpacity>

        {/* Delivery Time Badge */}
        {store.deliveryTime && (
          <View style={styles.deliveryBadge}>
            <Ionicons name="flash" size={12} color="white" />
            <Text style={styles.deliveryBadgeText}>{store.deliveryTime}</Text>
          </View>
        )}
      </View>

      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={styles.storeName} numberOfLines={1}>
            {store.name}
          </Text>
          <TouchableOpacity
            style={styles.ratingContainer}
            onPress={() => {
              trackStoreClick(store._id, 'rating', { category: params.category });
              handleShowReviews(store);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>
              {store.rating ? store.rating.toFixed(1) : 'N/A'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.storeDescription} numberOfLines={2}>
          {store.description || 'Quality products and services'}
        </Text>

        <View style={styles.storeDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {store.deliveryTime || '30 min'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {store.address?.city || store.address?.street || (store.distance ? `${store.distance.toFixed(1)} km` : 'Mumbai')}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="wallet-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              Min: ₹{store.minimumOrder || 0}
            </Text>
          </View>
        </View>


        <View style={styles.storeActions}>
          <TouchableOpacity
            style={[
              styles.compareButton,
              isInComparison(store._id) && styles.compareButtonActive,
            ]}
            onPress={() => handleAddToComparison(store)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isInComparison(store._id) ? "checkmark" : "add"}
              size={16}
              color={isInComparison(store._id) ? "#fff" : "#7B61FF"}
            />
            <Text
              style={[
                styles.compareButtonText,
                isInComparison(store._id) && styles.compareButtonTextActive,
              ]}
            >
              {isInComparison(store._id) ? 'Added' : 'Compare'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const renderCustomHeader = () => (
    <LinearGradient
      colors={[currentCategory?.color || '#7B61FF', '#A855F7']}
      style={styles.customHeader}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      
      <View style={styles.headerContent}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{currentCategory?.icon}</Text>
          <View style={styles.categoryInfo}>
            <Text style={styles.headerTitle}>
              {currentCategory?.name}
            </Text>
            <Text style={styles.headerSubtitle}>
              {stores.length} stores found
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.headerActions}>
        {comparisonStores.length > 0 && (
          <TouchableOpacity
            style={styles.comparisonButton}
            onPress={() => setShowComparison(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="git-compare-outline" size={20} color="white" />
            <View style={styles.comparisonBadge}>
              <Text style={styles.comparisonBadgeText}>{comparisonStores.length}</Text>
            </View>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="options-outline" size={20} color="white" />
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filtersBadge}>
              <Text style={styles.filtersBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const renderSearchSection = () => (
    <View style={styles.searchSection}>
      <StoreSearchBar
        onSearch={handleSearch}
        onSuggestionSelect={handleSuggestionSelect}
        placeholder="Search stores, categories..."
        style={styles.searchBar}
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>🏪</Text>
      <Text style={styles.emptyStateTitle}>No stores found</Text>
      <Text style={styles.emptyStateSubtitle}>
        Try adjusting your search criteria or check back later
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loading || page === 1) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#7B61FF" />
        <Text style={styles.footerLoaderText}>Loading more stores...</Text>
      </View>
    );
  };

  if (loading && page === 1) {
    return (
      <View style={styles.loadingContainer}>
        {renderCustomHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#7B61FF" />
          <Text style={styles.loadingText}>Loading stores...</Text>
        </View>
        <BottomNavigation />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderCustomHeader()}
      {renderSearchSection()}
      
      <FlatList
        data={stores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[styles.listContainer, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#7B61FF']}
            tintColor="#7B61FF"
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
      />

      <StoreFilters
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={activeFilters || undefined}
      />

      <StoreComparison
        visible={showComparison}
        onClose={() => setShowComparison(false)}
        stores={comparisonStores}
        onRemoveStore={handleRemoveFromComparison}
        onClearAll={handleClearComparison}
      />

      {selectedStoreForReviews && (
        <StoreReviews
          visible={showReviews}
          onClose={() => {
            setShowReviews(false);
            setSelectedStoreForReviews(null);
          }}
          storeName={selectedStoreForReviews.name}
          storeId={selectedStoreForReviews._id}
          averageRating={selectedStoreForReviews.rating || selectedStoreForReviews.ratings?.average || 0}
          totalReviews={selectedStoreForReviews.reviewCount || selectedStoreForReviews.ratings?.count || 0}
          onAddReview={handleAddReview}
        />
      )}

      <BottomNavigation />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Add top padding for status bar
    paddingBottom: 16, // Add bottom padding to prevent overlap
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    zIndex: 1000, // Ensure header stays on top
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8, // Add margin to prevent overlap with content
  },
  comparisonButton: {
    padding: 8,
    marginRight: 8,
    position: 'relative',
  },
  comparisonBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#7B61FF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  filtersButton: {
    padding: 8,
    position: 'relative',
  },
  filtersBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    marginTop: 0, // Ensure no gap between header and search
  },
  searchBar: {
    marginBottom: 0,
  },
  listContainer: {
    padding: 16,
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  storeImageContainer: {
    position: 'relative',
    height: 120,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden', // Ensure content doesn't overflow
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
    position: 'relative',
  },
  placeholderContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  storeImageText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  placeholderSubtext: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  placeholderCircle1: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  placeholderCircle2: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modernBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10, // Ensure it stays on top
  },
  modernBadgeText: {
    fontSize: 18,
  },
  deliveryBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10, // Ensure it stays on top
  },
  deliveryBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Ensure it stays on top
  },
  storeInfo: {
    padding: 20,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  storeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    color: '#1F2937',
    marginLeft: 4,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  deliveryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  deliveryTime: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '600',
  },
  minOrder: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  storeActions: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  compareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#7B61FF',
    backgroundColor: '#fff',
    shadowColor: '#7B61FF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compareButtonActive: {
    backgroundColor: '#7B61FF',
    borderColor: '#7B61FF',
  },
  compareButtonText: {
    fontSize: 13,
    color: '#7B61FF',
    fontWeight: '600',
    marginLeft: 6,
  },
  compareButtonTextActive: {
    color: '#fff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
});

export default StoreSearch;
