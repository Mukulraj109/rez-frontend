import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Brand } from '@/types/voucher.types';
import realVouchersApi from '@/services/realVouchersApi';

const { width } = Dimensions.get('window');

// Category icon and color mapping
const CATEGORY_INFO: { [key: string]: { icon: string; color: string; backgroundColor: string } } = {
  beauty: { icon: '💄', color: '#EC4899', backgroundColor: '#FCE7F3' },
  electronics: { icon: '📱', color: '#3B82F6', backgroundColor: '#DBEAFE' },
  entertainment: { icon: '🎬', color: '#8B5CF6', backgroundColor: '#EDE9FE' },
  fashion: { icon: '👗', color: '#EC4899', backgroundColor: '#FCE7F3' },
  food: { icon: '🍔', color: '#10B981', backgroundColor: '#D1FAE5' },
  grocery: { icon: '🛒', color: '#F59E0B', backgroundColor: '#FEF3C7' },
  groceries: { icon: '🛒', color: '#F59E0B', backgroundColor: '#FEF3C7' },
  shopping: { icon: '🛍️', color: '#EF4444', backgroundColor: '#FEE2E2' },
  travel: { icon: '✈️', color: '#06B6D4', backgroundColor: '#CFFAFE' },
  sports: { icon: '⚽', color: '#14B8A6', backgroundColor: '#CCFBF1' },
};

export default function VoucherCategoryPage() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryInfo = slug ? CATEGORY_INFO[slug.toLowerCase()] : null;
  const categoryName = slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : 'Category';

  useEffect(() => {
    if (slug) {
      loadCategoryBrands();
    }
  }, [slug]);

  const loadCategoryBrands = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);

      const brandsRes = await realVouchersApi.getVoucherBrands({
        category: slug.toLowerCase(),
        page: 1,
        limit: 50 // Backend API max limit is 50
      });

      if (!brandsRes.success || !brandsRes.data) {
        console.error('❌ [VOUCHER CATEGORY] Failed to load brands:', brandsRes);
        setError('Failed to load brands. Please try again.');
        setBrands([]);
        return;
      }

      // Transform backend data to match frontend types
      const transformedBrands: Brand[] = brandsRes.data.map((brand: any) => ({
        id: brand._id,
        name: brand.name,
        logo: brand.logo,
        backgroundColor: brand.backgroundColor || '#F3F4F6',
        logoColor: brand.logoColor,
        cashbackRate: brand.cashbackRate || 0,
        rating: brand.rating || 0,
        reviewCount: brand.ratingCount ? `${(brand.ratingCount / 1000).toFixed(1)}k+ users` : '0 users',
        description: brand.description || '',
        categories: [brand.category || ''],
        featured: brand.isFeatured || false,
        newlyAdded: brand.isNewlyAdded || false,
        offers: [],
      }));

      // Sort by featured first, then by cashback rate
      transformedBrands.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return b.cashbackRate - a.cashbackRate;
      });

      setBrands(transformedBrands);
    } catch (error) {
      console.error('❌ [VOUCHER CATEGORY] Error loading brands:', error);
      setError('Failed to load brands. Please try again.');
      setBrands([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCategoryBrands();
  };

  const handleBrandSelect = (brand: Brand) => {
    router.push(`/voucher/${brand.id}`);
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
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          {categoryInfo && (
            <View style={[styles.categoryIconBadge, { backgroundColor: categoryInfo.backgroundColor }]}>
              <ThemedText style={styles.categoryIconText}>{categoryInfo.icon}</ThemedText>
            </View>
          )}
          <ThemedText style={styles.headerTitle}>{categoryName}</ThemedText>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={() => {/* TODO: Share */}}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ThemedText style={styles.headerSubtitle}>
        {brands.length} {brands.length === 1 ? 'brand' : 'brands'} available
      </ThemedText>
    </LinearGradient>
  );

  const renderBrandCard = (brand: Brand) => (
    <TouchableOpacity
      key={brand.id}
      style={styles.brandCard}
      onPress={() => handleBrandSelect(brand)}
      activeOpacity={0.8}
    >
      <View style={styles.brandHeader}>
        <View style={[styles.brandLogo, { backgroundColor: brand.backgroundColor || '#F3F4F6' }]}>
          <ThemedText style={[styles.brandLogoText, { color: brand.logoColor || '#000' }]}>
            {brand.logo}
          </ThemedText>
        </View>
        <View style={styles.brandInfo}>
          <View style={styles.brandNameRow}>
            <ThemedText style={styles.brandName}>{brand.name}</ThemedText>
            {brand.featured && (
              <View style={styles.featuredBadge}>
                <ThemedText style={styles.featuredText}>Featured</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.brandCashback}>
            Cashback upto {brand.cashbackRate || 0}%
          </ThemedText>
          {brand.rating && brand.rating > 0 && (
            <View style={styles.brandRating}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <ThemedText style={styles.ratingText}>{brand.rating.toFixed(1)}</ThemedText>
              <ThemedText style={styles.ratingCount}>{brand.reviewCount || '0 users'}</ThemedText>
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
      {brand.description && (
        <ThemedText style={styles.brandDescription} numberOfLines={2}>
          {brand.description}
        </ThemedText>
      )}
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading brands...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadCategoryBrands}
          >
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      );
    }

    if (brands.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
          <ThemedText style={styles.emptyTitle}>No brands found</ThemedText>
          <ThemedText style={styles.emptyText}>
            There are no voucher brands available in this category yet.
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.brandsList}>
        {brands.map((brand) => renderBrandCard(brand))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {renderHeader()}

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
      >
        {renderContent()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
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
    marginBottom: 12,
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
  headerTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
  },
  categoryIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryIconText: {
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    textAlign: 'center',
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 4,
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  
  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Empty
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Brands List
  brandsList: {
    padding: 20,
  },
  
  // Brand Card
  brandCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
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
    marginBottom: 12,
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
  brandNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  featuredBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#F59E0B',
  },
  brandCashback: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 4,
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
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  brandDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 8,
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});

