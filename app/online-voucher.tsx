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

const { width } = Dimensions.get('window');

export default function OnlineVoucherPage() {
  const router = useRouter();
  const { state, handlers } = useOnlineVoucher();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleSearchChange = (text: string) => {
    handlers.handleSearch(text);
    setShowSearchResults(text.length > 0);
  };

  const clearSearch = () => {
    handlers.handleSearch('');
    setShowSearchResults(false);
    searchInputRef.current?.blur();
  };

  const renderHeader = () => (
    <LinearGradient 
      colors={['#8B5CF6', '#7C3AED']} 
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handlers.handleBackNavigation}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.coinsContainer}>
          <View style={styles.coinsBadge}>
            <Ionicons name="diamond" size={16} color="#FFD700" />
            <ThemedText style={styles.coinsText}>{state.userCoins}</ThemedText>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => handlers.handleShare()}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerActionButton}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder="Online voucher"
            placeholderTextColor="#9CA3AF"
            value={state.searchQuery}
            onChangeText={handleSearchChange}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {state.searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );

  const renderHeroCarousel = () => (
    <View style={styles.heroSection}>
      <FlatList
        data={VoucherData.heroCarousel}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[styles.heroCard, { backgroundColor: item.backgroundColor }]}
            activeOpacity={0.8}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroText}>
                <ThemedText style={[styles.heroTitle, { color: item.textColor }]}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[styles.heroSubtitle, { color: item.textColor }]}>
                  {item.subtitle}
                </ThemedText>
              </View>
              <View style={styles.heroIllustration}>
                <ThemedText style={styles.heroEmoji}>✈️</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.heroCarouselContent}
      />
      
      {/* Carousel indicators */}
      <View style={styles.carouselIndicators}>
        {VoucherData.heroCarousel.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.indicator,
              index === 0 ? styles.activeIndicator : styles.inactiveIndicator
            ]} 
          />
        ))}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.section}>
      <ThemedText style={styles.sectionTitle}>Deal by category</ThemedText>
      <View style={styles.categoryGrid}>
        {state.categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryCard, { backgroundColor: category.backgroundColor }]}
            onPress={() => handlers.handleCategorySelect(category)}
            activeOpacity={0.8}
          >
            <View style={styles.categoryContent}>
              <View style={styles.categoryIconContainer}>
                <ThemedText style={styles.categoryIcon}>{category.icon}</ThemedText>
              </View>
              <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#6B7280" />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderBrandCard = (brand: Brand) => (
    <TouchableOpacity
      style={styles.brandCard}
      onPress={() => handlers.handleBrandSelect(brand)}
      activeOpacity={0.8}
    >
      <View style={styles.brandHeader}>
        <View style={[styles.brandLogo, { backgroundColor: brand.backgroundColor || '#F3F4F6' }]}>
          <ThemedText style={[styles.brandLogoText, { color: brand.logoColor || '#000' }]}>
            {brand.logo}
          </ThemedText>
        </View>
        <View style={styles.brandInfo}>
          <ThemedText style={styles.brandName}>{brand.name}</ThemedText>
          <ThemedText style={styles.brandCashback}>
            {VoucherData.helpers.formatCashback(brand.cashbackRate)}
          </ThemedText>
        </View>
        {brand.rating && (
          <View style={styles.brandRating}>
            <ThemedText style={styles.ratingText}>
              {VoucherData.helpers.formatRating(brand.rating)}
            </ThemedText>
            <Ionicons name="star" size={14} color="#F59E0B" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderNewlyAddedBrands = () => {
    const newlyAdded = VoucherData.helpers.getNewlyAddedBrands();
    
    if (newlyAdded.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Newly Added Brands</ThemedText>
        <FlatList
          data={newlyAdded}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.newBrandCard}
              onPress={() => handlers.handleBrandSelect(item)}
              activeOpacity={0.8}
            >
              <View style={[styles.newBrandLogo, { backgroundColor: item.backgroundColor || '#F3F4F6' }]}>
                <ThemedText style={styles.newBrandEmoji}>{item.logo}</ThemedText>
              </View>
              <ThemedText style={styles.newBrandName}>{item.name}</ThemedText>
              <ThemedText style={styles.newBrandCashback}>
                {item.cashbackRate}% cash back
              </ThemedText>
            </TouchableOpacity>
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
    const featured = VoucherData.helpers.getFeaturedBrands();
    
    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Explore all Brands</ThemedText>
        <View style={styles.brandsList}>
          {featured.map((brand) => renderBrandCard(brand))}
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
    backgroundColor: '#FFFFFF',
  },
  animatedContent: {
    flex: 1,
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinsContainer: {
    flex: 1,
    alignItems: 'center',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Search Bar
  searchContainer: {
    marginHorizontal: 0,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  clearButton: {
    marginLeft: 8,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  
  // Hero Section
  heroSection: {
    marginBottom: 24,
  },
  heroCarouselContent: {
    paddingHorizontal: 20,
  },
  heroCard: {
    width: width - 60,
    height: 180,
    borderRadius: 24,
    marginRight: 20,
    padding: 24,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  heroIllustration: {
    marginLeft: 20,
  },
  heroEmoji: {
    fontSize: 48,
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    height: 8,
    borderRadius: 4,
  },
  activeIndicator: {
    width: 24,
    backgroundColor: '#8B5CF6',
  },
  inactiveIndicator: {
    width: 8,
    backgroundColor: '#D1D5DB',
  },
  
  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
    paddingHorizontal: 20,
    letterSpacing: -0.5,
  },
  
  // Category Grid
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 64) / 2,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 12,
  },
  
  // Brand Cards
  brandCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  brandLogoText: {
    fontSize: 16,
    fontWeight: '600',
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  brandCashback: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  brandRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  
  // Newly Added Brands
  newBrandsContent: {
    paddingHorizontal: 20,
  },
  newBrandCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginRight: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  newBrandLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  newBrandEmoji: {
    fontSize: 24,
  },
  newBrandName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  newBrandCashback: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Brands List
  brandsList: {
    paddingTop: 8,
  },
  
  // Search Results
  searchResults: {
    paddingTop: 20,
  },
  searchResultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  noResults: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});