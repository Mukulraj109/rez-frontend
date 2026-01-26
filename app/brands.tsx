/**
 * Brands Listing Page
 * Shows all brands for a category with filtering options
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getBrandsForCategory, Brand, getAllBrands } from '@/data/categoryDummyData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  primaryGreen: '#00C06A',
  background: '#F5F7FA',
};

const BrandCard = ({
  brand,
  onPress,
}: {
  brand: Brand;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.brandCard} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.logoContainer}>
      <Text style={styles.logo}>{brand.logo}</Text>
    </View>
    <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
    <View style={styles.cashbackBadge}>
      <Text style={styles.cashbackText}>{brand.cashback}% cashback</Text>
    </View>
    {brand.tag && (
      <View style={[
        styles.tagBadge,
        brand.tag === 'Premium' && styles.tagPremium,
        brand.tag === 'Trending' && styles.tagTrending,
        brand.tag === 'Popular' && styles.tagPopular,
      ]}>
        <Text style={[
          styles.tagText,
          brand.tag === 'Premium' && styles.tagTextPremium,
          brand.tag === 'Trending' && styles.tagTextTrending,
          brand.tag === 'Popular' && styles.tagTextPopular,
        ]}>{brand.tag}</Text>
      </View>
    )}
    <View style={styles.ratingRow}>
      <Text style={styles.ratingStar}>★</Text>
      <Text style={styles.ratingValue}>{brand.rating.toFixed(1)}</Text>
    </View>
  </TouchableOpacity>
);

export default function BrandsPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const categorySlug = params.category as string;

  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'trending' | 'premium' | 'popular'>('all');

  // Load brands
  useEffect(() => {
    loadBrands();
  }, [categorySlug]);

  const loadBrands = async () => {
    setLoading(true);
    try {
      // Get brands for category or all brands
      const brandsList = categorySlug
        ? getBrandsForCategory(categorySlug)
        : getAllBrands();

      setBrands(brandsList);
      setFilteredBrands(brandsList);
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter brands based on search and filter
  useEffect(() => {
    let filtered = [...brands];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(brand => {
        if (selectedFilter === 'trending') return brand.tag === 'Trending';
        if (selectedFilter === 'premium') return brand.tag === 'Premium';
        if (selectedFilter === 'popular') return brand.tag === 'Popular';
        return true;
      });
    }

    setFilteredBrands(filtered);
  }, [brands, searchQuery, selectedFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBrands();
  };

  const handleBrandPress = (brand: Brand) => {
    router.push({
      pathname: '/brand/[name]',
      params: { name: brand.id },
    } as any);
  };

  const renderBrand = ({ item }: { item: Brand }) => (
    <BrandCard brand={item} onPress={() => handleBrandPress(item)} />
  );

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.gray600} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands..."
          placeholderTextColor={COLORS.gray600}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.gray600} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      <View style={styles.filterRow}>
        {(['all', 'popular', 'trending', 'premium'] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterPill,
              selectedFilter === filter && styles.filterPillActive,
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedFilter === filter && styles.filterPillTextActive,
              ]}
            >
              {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.resultCount}>
        {filteredBrands.length} {filteredBrands.length === 1 ? 'brand' : 'brands'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="storefront-outline" size={64} color={COLORS.gray200} />
      <Text style={styles.emptyTitle}>No brands found</Text>
      <Text style={styles.emptyText}>
        Try adjusting your search or filters
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#00C06A', '#00A05A']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {categorySlug
              ? `${categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Brands`
              : 'All Brands'}
          </Text>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      {/* Brands List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
          <Text style={styles.loadingText}>Loading brands...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBrands}
          renderItem={renderBrand}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primaryGreen}
              colors={[COLORS.primaryGreen]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  placeholder: {
    width: 40,
  },
  headerContent: {
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.navy,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterPillActive: {
    backgroundColor: COLORS.primaryGreen,
    borderColor: COLORS.primaryGreen,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterPillTextActive: {
    color: COLORS.white,
  },
  resultCount: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray600,
  },
  listContent: {
    paddingBottom: 100,
  },
  row: {
    paddingHorizontal: 16,
    gap: 16,
  },
  brandCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    fontSize: 32,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 8,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  tagBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  tagPremium: {
    backgroundColor: '#FEF3C7',
  },
  tagTrending: {
    backgroundColor: '#DBEAFE',
  },
  tagPopular: {
    backgroundColor: '#FCE7F3',
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  tagTextPremium: {
    color: '#D97706',
  },
  tagTextTrending: {
    color: '#2563EB',
  },
  tagTextPopular: {
    color: '#DB2777',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    fontSize: 14,
    color: '#FFB800',
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
  },
});
