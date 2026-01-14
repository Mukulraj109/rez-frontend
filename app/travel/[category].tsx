/**
 * Travel Category Page - Dynamic route
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import travelApi, { TravelService, TravelServicesByCategoryResponse } from '@/services/travelApi';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', blue500: '#3B82F6', amber500: '#F59E0B', red: '#EF4444' };

// Fallback gradient colors for categories
const categoryGradients: Record<string, string[]> = {
  flights: ['#3B82F6', '#2563EB'],
  hotels: ['#EC4899', '#DB2777'],
  trains: ['#22C55E', '#16A34A'],
  bus: ['#F97316', '#EA580C'],
  cab: ['#EAB308', '#CA8A04'],
  packages: ['#8B5CF6', '#7C3AED'],
};

const TravelCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [services, setServices] = useState<TravelService[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      if (!category) return;
      
      try {
        setIsLoading(true);
        let sortBy: 'price_low' | 'price_high' | 'rating' | 'newest' | 'popular' = 'rating';
        
        if (selectedFilter === 'Best Price') {
          sortBy = 'price_low';
        } else if (selectedFilter === 'Top Rated') {
          sortBy = 'rating';
        } else if (selectedFilter === 'Today') {
          sortBy = 'rating';
        }

        const response = await travelApi.getByCategory(category, {
          page: currentPage,
          limit: 20,
          sortBy
        });

        if (response.success && response.data) {
          const data = response.data;
          if (currentPage === 1) {
            setServices(data.services || []);
          } else {
            setServices(prev => [...prev, ...(data.services || [])]);
          }
          if (data.category) {
            setCategoryInfo(data.category);
          }
          if (data.pagination) {
            setTotalPages(data.pagination.pages);
            setHasMore(data.pagination.page < data.pagination.pages);
          }
          setError(null);
        } else {
          setError(response.error || 'Failed to load services');
        }
      } catch (error) {
        console.error('[TravelCategoryPage] Error fetching services:', error);
        setError('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [category, selectedFilter, currentPage]);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setServices([]);
  }, [category, selectedFilter]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleServicePress = (service: TravelService) => {
    const serviceId = service._id || service.id;
    if (serviceId) {
      // Route to dedicated pages based on category
      if (category === 'flights') {
        router.push(`/flight/${serviceId}` as any);
      } else if (category === 'hotels') {
        router.push(`/hotel/${serviceId}` as any);
      } else if (category === 'trains') {
        router.push(`/train/${serviceId}` as any);
      } else if (category === 'cab') {
        router.push(`/cab/${serviceId}` as any);
      } else {
        router.push(`/product/${serviceId}` as any);
      }
    }
  };

  const handleBookPress = (service: TravelService) => {
    const serviceId = service._id || service.id;
    if (serviceId) {
      // Route to dedicated booking pages
      if (category === 'flights') {
        router.push(`/flight/${serviceId}` as any);
      } else if (category === 'hotels') {
        router.push(`/hotel/${serviceId}` as any);
      } else if (category === 'trains') {
        router.push(`/train/${serviceId}` as any);
      } else if (category === 'cab') {
        router.push(`/cab/${serviceId}` as any);
      } else {
        const storeId = service.store?._id;
        if (storeId) {
          router.push(`/booking?storeId=${storeId}&productId=${serviceId}&bookingType=service` as any);
        }
      }
    }
  };

  const gradientColors = categoryGradients[category || 'flights'] || categoryGradients['flights'];
  const displayTitle = categoryInfo?.name || `${category?.charAt(0).toUpperCase()}${category?.slice(1)}`;
  const displayIcon = categoryInfo?.icon || '✈️';
  
  // Check if icon is a URL or emoji
  const isIconUrl = displayIcon && (displayIcon.startsWith('http://') || displayIcon.startsWith('https://'));

  if (isLoading && services.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color={COLORS.blue500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {isIconUrl ? (
                <Image source={{ uri: displayIcon }} style={{ width: 24, height: 24 }} resizeMode="contain" />
              ) : (
                <Text style={styles.headerTitle}>{displayIcon} </Text>
              )}
              <Text style={styles.headerTitle}>{displayTitle}</Text>
            </View>
            <Text style={styles.headerSubtitle}>{services.length} options</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Today', 'Top Rated', 'Best Price'].map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>{filter === 'all' ? 'All' : filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom) {
            loadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {error && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: COLORS.red, textAlign: 'center' }}>{error}</Text>
            <TouchableOpacity 
              style={{ marginTop: 10, padding: 10, backgroundColor: COLORS.blue500, borderRadius: 8 }}
              onPress={() => {
                setError(null);
                setCurrentPage(1);
                setServices([]);
              }}
            >
              <Text style={{ color: COLORS.white }}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.itemsList}>
          {services.length === 0 && !isLoading ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.gray600 }}>No travel services found in this category</Text>
            </View>
          ) : (
            services.map((service) => {
              const serviceId = service._id || service.id;
              
              // Get image with category-specific validation
              let imageUrl = service.images?.[0] || '';
              
              // Validate and fix image mismatches
              if (imageUrl) {
                // For trains, ensure it's not a bus image
                if (category === 'trains') {
                  if (imageUrl.toLowerCase().includes('bus') && !imageUrl.toLowerCase().includes('train')) {
                    imageUrl = 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400';
                  }
                }
                // For hotels, ensure it's not a flight image
                if (category === 'hotels') {
                  if (imageUrl.toLowerCase().includes('airplane') || imageUrl.toLowerCase().includes('flight')) {
                    imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400';
                  }
                }
                // For flights, ensure it's not a train/bus image
                if (category === 'flights') {
                  if (imageUrl.toLowerCase().includes('train') || imageUrl.toLowerCase().includes('bus')) {
                    imageUrl = 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400';
                  }
                }
                // For cabs, ensure it's not a bus/train/airplane/hotel image
                if (category === 'cab') {
                  if ((imageUrl.toLowerCase().includes('bus') || imageUrl.toLowerCase().includes('train') || 
                       imageUrl.toLowerCase().includes('airplane') || imageUrl.toLowerCase().includes('hotel')) &&
                      !imageUrl.toLowerCase().includes('cab') && !imageUrl.toLowerCase().includes('taxi') && 
                      !imageUrl.toLowerCase().includes('car')) {
                    imageUrl = 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400';
                  }
                }
              } else {
                // Fallback images by category
                const fallbackImages: Record<string, string> = {
                  trains: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400',
                  hotels: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
                  flights: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
                  bus: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400',
                  cab: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400',
                  packages: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400',
                };
                imageUrl = fallbackImages[category || ''] || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400';
              }
              
              const price = service.pricing?.selling || 0;
              const cashback = service.cashback?.percentage || service.serviceCategory?.cashbackPercentage || 0;
              const rating = service.ratings?.average || 0;
              
              return (
                <TouchableOpacity 
                  key={serviceId} 
                  style={styles.itemCard} 
                  onPress={() => handleServicePress(service)} 
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: imageUrl }} style={styles.itemImage} />
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{cashback}%</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{service.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>{service.serviceCategory?.name || 'Travel Service'}</Text>
                    </View>
                    <View style={styles.itemMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.amber500} />
                        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
                      </View>
                    </View>
                    <View style={styles.itemFooter}>
                      <Text style={styles.priceText}>From ₹{price}</Text>
                      <TouchableOpacity 
                        style={styles.bookButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleBookPress(service);
                        }}
                      >
                        <Text style={styles.bookButtonText}>Book</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
        {hasMore && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.blue500} />
            <Text style={{ color: COLORS.gray600, marginTop: 10 }}>Loading more services...</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  filtersContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.blue500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  itemsList: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  itemImage: { width: '100%', height: 160 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  itemMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 18, fontWeight: '700', color: COLORS.green500 },
  bookButton: { backgroundColor: COLORS.blue500, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default TravelCategoryPage;
