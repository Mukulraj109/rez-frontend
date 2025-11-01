import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useOnlineVoucher } from '@/hooks/useOnlineVoucher';
import { Brand, Category } from '@/types/voucher.types';
import VoucherData from '@/data/voucherData';
import { useDebounce } from '@/hooks/useDebounce';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';

const { width } = Dimensions.get('window');
const CAROUSEL_HEIGHT = 220;
const CATEGORY_CARD_HEIGHT = 88;

export default function OnlineVoucherPage() {
  const router = useRouter();
  const { state, handlers, heroCarousel, actions } = useOnlineVoucher();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Debounce search input to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchInput, 300);

  useEffect(() => {
    let isMounted = true;

    const animation = Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]);

    if (isMounted) {
      animation.start();
    }

    return () => {
      isMounted = false;
      animation.stop(); // Stop animation on unmount
    };
  }, [fadeAnim, slideAnim]);

  // Trigger search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery !== state.searchQuery) {
      handlers.handleSearch(debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  const handleSearchChange = (text: string) => {
    setSearchInput(text);
    setShowSearchResults(text.length > 0);
  };

  const clearSearch = () => {
    setSearchInput('');
    handlers.handleSearch('');
    setShowSearchResults(false);
    searchInputRef.current?.blur();
  };

  const handleRetry = () => {
    if (state.error) {
      // Retry loading data
      actions.refreshData();
    }
  };

  const renderHeader = () => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#EC4899']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handlers.handleBackNavigation}
            activeOpacity={0.7}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          
          <View style={styles.coinsContainer}>
            <View style={styles.coinsBadge}>
              <Ionicons name="star" size={18} color="#FFD700" />
              <ThemedText style={styles.coinsText}>{state.userCoins}</ThemedText>
            </View>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerActionButton}
              onPress={() => handlers.handleShare()}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={22} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerActionButton}
              activeOpacity={0.7}
            >
              <Ionicons name="heart-outline" size={22} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <View style={styles.searchIconContainer}>
              <Ionicons name="search" size={20} color="#9333EA" />
            </View>
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search vouchers..."
              placeholderTextColor="#9CA3AF"
              value={searchInput}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              autoCapitalize="none"
            />
            {searchInput.length > 0 && (
              <TouchableOpacity onPress={clearSearch} style={styles.clearButton} activeOpacity={0.7}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderHeroCarousel = () => {
    const carouselData = heroCarousel;
    
    if (carouselData.length === 0) return null;
    
    return (
      <View style={styles.heroSection}>
        <FlatList
          data={carouselData}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <TouchableOpacity 
                style={[styles.heroCard, { backgroundColor: item.backgroundColor || '#F97316' }]}
                activeOpacity={0.9}
                onPress={() => {
                  if (item.brandId) {
                    handlers.handleBrandSelect({ id: item.brandId } as any);
                  }
                }}
              >
                <LinearGradient
                  colors={[
                    item.backgroundColor || '#F97316',
                    (item.backgroundColor || '#F97316') + 'DD',
                  ]}
                  style={styles.heroGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.heroContent}>
                    <View style={styles.heroText}>
                      <ThemedText style={[styles.heroTitle, { color: item.textColor || '#FFFFFF' }]}>
                        {item.title}
                      </ThemedText>
                      <ThemedText style={[styles.heroSubtitle, { color: item.textColor || '#FFFFFF' }]}>
                        {item.subtitle}
                      </ThemedText>
                      {(item as any).store && (
                        <View style={styles.heroStoreBadge}>
                          <Ionicons name="location" size={14} color={item.textColor || '#FFFFFF'} />
                          <ThemedText style={[styles.heroStoreInfo, { color: item.textColor || '#FFFFFF' }]}>
                            {(item as any).store.name}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.heroIllustration}>
                      {item.title?.toLowerCase() === 'make my trip' ? (
                        <View style={styles.heroIconWrapper}>
                          <ThemedText style={styles.heroEmoji}>✈️</ThemedText>
                        </View>
                      ) : (
                        <View style={styles.heroIconWrapper}>
                          <ThemedText style={styles.heroEmoji}>
                            {item.image || (item as any).logo || '🎁'}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item, index) => item.id || (item as any)._id || String(index)}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          contentContainerStyle={styles.heroCarouselContent}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
            setCarouselIndex(index);
          }}
          scrollEventThrottle={16}
        />
        
        {/* Enhanced Carousel indicators */}
        <View style={styles.carouselIndicators}>
          {carouselData.map((_, index) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.8}
              style={styles.indicatorContainer}
            >
              <Animated.View
                style={[
                  styles.indicator,
                  index === carouselIndex ? styles.activeIndicator : styles.inactiveIndicator,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderCategories = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Deal by category</ThemedText>
      </View>
      <View style={styles.categoryGrid}>
        {state.categories.map((category, index) => (
          <Animated.View
            key={category.id}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <TouchableOpacity
              style={[styles.categoryCard, { backgroundColor: category.backgroundColor || '#FFFFFF' }]}
              onPress={() => handlers.handleCategorySelect(category)}
              activeOpacity={0.85}
            >
              <View style={styles.categoryContentVertical}>
                <LinearGradient
                  colors={[category.color || '#F59E0B', category.color || '#F59E0B']}
                  style={[styles.categoryIconContainer, { backgroundColor: category.color || '#F59E0B' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
                </LinearGradient>
                <View style={styles.categoryTextContainerVertical}>
                  <ThemedText 
                    style={styles.categoryName} 
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {category.name}
                  </ThemedText>
                  {category.brandCount !== undefined && category.brandCount !== null && (
                    <ThemedText style={styles.categoryCount}>
                      {category.brandCount} {category.brandCount === 1 ? 'brand' : 'brands'}
                    </ThemedText>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </View>
  );

  const renderBrandCard = (brand: Brand, index?: number) => (
    <Animated.View
      key={brand.id}
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        style={styles.brandCard}
        onPress={() => handlers.handleBrandSelect(brand)}
        activeOpacity={0.85}
      >
        <View style={styles.brandHeader}>
          <LinearGradient
            colors={[
              brand.backgroundColor || '#F3F4F6',
              (brand.backgroundColor || '#F3F4F6') + 'DD',
            ]}
            style={[styles.brandLogo, { backgroundColor: brand.backgroundColor || '#F3F4F6' }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <ThemedText style={[styles.brandLogoText, { color: brand.logoColor || '#000' }]}>
              {brand.logo}
            </ThemedText>
          </LinearGradient>
          <View style={styles.brandInfo}>
            <View style={styles.brandInfoRow}>
              <ThemedText style={styles.brandName} numberOfLines={1}>
                {brand.name}
              </ThemedText>
              {brand.featured && (
                <View style={styles.featuredBadge}>
                  <ThemedText style={styles.featuredText}>Featured</ThemedText>
                </View>
              )}
            </View>
            <View style={styles.brandCashbackRow}>
              <Ionicons name="cash-outline" size={16} color="#9333EA" />
              <ThemedText style={styles.brandCashback}>
                Up to {brand.cashbackRate || 0}% cashback
              </ThemedText>
            </View>
          </View>
          {brand.rating && brand.rating > 0 && (
            <View style={styles.brandRating}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>
                {brand.rating.toFixed(1)}
              </ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderNewlyAddedBrands = () => {
    const newlyAdded = state.brands.filter(brand => brand.newlyAdded);
    
    if (newlyAdded.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText style={styles.sectionTitle}>Newly Added</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Latest voucher brands</ThemedText>
          </View>
        </View>
        <FlatList
          data={newlyAdded}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              }}
            >
              <TouchableOpacity 
                style={styles.newBrandCard}
                onPress={() => handlers.handleBrandSelect(item)}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[
                    item.backgroundColor || '#F3F4F6',
                    (item.backgroundColor || '#F3F4F6') + 'DD',
                  ]}
                  style={[styles.newBrandLogo, { backgroundColor: item.backgroundColor || '#F3F4F6' }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.newBrandEmoji}>{item.logo}</ThemedText>
                </LinearGradient>
                <ThemedText style={styles.newBrandName} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <View style={styles.newBrandCashbackRow}>
                  <Ionicons name="cash" size={12} color="#9333EA" />
                  <ThemedText style={styles.newBrandCashback}>
                    {item.cashbackRate || 0}% cashback
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.newBrandsContent}
        />
      </View>
    );
  };

  const renderFeaturedBrands = () => {
    const featured = state.brands.filter(brand => brand.featured).length > 0
      ? state.brands.filter(brand => brand.featured)
      : state.brands;
    
    if (featured.length === 0) return null;
    
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText style={styles.sectionTitle}>All Brands</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>{featured.length} brands available</ThemedText>
          </View>
        </View>
        <View style={styles.brandsList}>
          {featured.map((brand, index) => renderBrandCard(brand, index))}
        </View>
      </View>
    );
  };

  const renderSearchResults = () => {
    if (!showSearchResults || !state.searchQuery) return null;

    return (
      <View style={styles.searchResults}>
        <ThemedText style={styles.searchResultsTitle}>
          Search Results for "{state.searchQuery}"
        </ThemedText>
        {state.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
          </View>
        ) : (
          <View style={styles.brandsList}>
            {state.brands.length > 0 ? (
              state.brands.map((brand) => renderBrandCard(brand))
            ) : (
              <View style={styles.noResults}>
                <ThemedText style={styles.noResultsText}>
                  No brands found for "{state.searchQuery}"
                </ThemedText>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderMainContent = () => {
    // Show error state if there's an error
    if (state.error && !state.loading) {
      return <ErrorState message={state.error} onRetry={handleRetry} />;
    }

    // Show loading state during initial load
    if (state.loading && state.brands.length === 0 && !showSearchResults) {
      return <LoadingState message="Loading vouchers..." />;
    }

    if (showSearchResults) {
      return renderSearchResults();
    }

    return (
      <>
        {renderHeroCarousel()}
        {renderCategories()}
        {renderNewlyAddedBrands()}
        {renderFeaturedBrands()}
      </>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />

      {renderHeader()}

      <Animated.View
        style={[
          styles.animatedContent,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}
      >
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {renderMainContent()}

          <View style={styles.bottomSpace} />
        </ScrollView>
      </Animated.View>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  animatedContent: {
    flex: 1,
  },

  // Header Styles - Modern gradient with soft shadow
  header: {
    paddingTop: Platform.OS === 'android' ? 45 : 55,
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  coinsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    gap: 6,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  
  // Search Bar
  searchContainer: {
    marginHorizontal: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  searchIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  
  // Hero Section
  heroSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  heroCarouselContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    width: width - 40,
    height: CAROUSEL_HEIGHT,
    borderRadius: 24,
    marginRight: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
  },
  heroGradient: {
    flex: 1,
    padding: 26,
    justifyContent: 'center',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
    paddingRight: 16,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.6,
    textShadowColor: 'rgba(0, 0, 0, 0.12)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.95,
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroStoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  heroStoreInfo: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 1,
  },
  heroIllustration: {
    marginLeft: 16,
  },
  heroIconWrapper: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroEmoji: {
    fontSize: 48,
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  indicatorContainer: {
    padding: 4,
  },
  indicator: {
    height: 6,
    borderRadius: 3,
  },
  activeIndicator: {
    width: 28,
    backgroundColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  inactiveIndicator: {
    width: 6,
    backgroundColor: '#D1D5DB',
  },
  
  // Sections
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  seeAllText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9333EA',
  },
  
  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 52) / 2,
    minHeight: 115,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 8,
  },
  categoryContentVertical: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  categoryIconContainer: {
    width: 54,
    height: 54,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  categoryIcon: {
    fontSize: 26,
  },
  categoryTextContainerVertical: {
    alignItems: 'center',
    width: '100%',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.3,
    textAlign: 'center',
    width: '100%',
  },
  categoryCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Brand Cards
  brandCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 14,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.06)',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  brandLogoText: {
    fontSize: 26,
  },
  brandInfo: {
    flex: 1,
  },
  brandInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
    flex: 1,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: '#FCD34D',
  },
  featuredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#F59E0B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  brandCashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandCashback: {
    fontSize: 14,
    color: '#9333EA',
    fontWeight: '600',
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 0.5,
    borderColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F59E0B',
  },
  
  // Newly Added Brands
  newBrandsContent: {
    paddingHorizontal: 20,
    paddingRight: 4,
  },
  newBrandCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
  },
  newBrandLogo: {
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  newBrandEmoji: {
    fontSize: 30,
  },
  newBrandName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  newBrandCashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  newBrandCashback: {
    fontSize: 12,
    color: '#9333EA',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Brands List
  brandsList: {
    paddingTop: 8,
  },
  
  // Search Results
  searchResults: {
    paddingTop: 24,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  noResults: {
    paddingVertical: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});