/**
 * Financial Category Page - Dynamic route
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import financialServicesApi, { FinancialService, FinancialServiceCategory } from '@/services/financialServicesApi';
import { useComprehensiveAnalytics } from '@/hooks/useComprehensiveAnalytics';
import { ANALYTICS_EVENTS } from '@/services/analytics/events';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', purple500: '#8B5CF6', amber500: '#F59E0B' };

// Fallback data
const fallbackCategoryData: Record<string, any> = {
  bills: { title: 'Bill Payment', icon: '📄', gradientColors: ['#3B82F6', '#2563EB'] },
  ott: { title: 'OTT & DTH', icon: '📺', gradientColors: ['#EF4444', '#DC2626'] },
  recharge: { title: 'Mobile Recharge', icon: '📱', gradientColors: ['#22C55E', '#16A34A'] },
  gold: { title: 'Digital Gold', icon: '🪙', gradientColors: ['#F59E0B', '#D97706'] },
  insurance: { title: 'Insurance', icon: '🛡️', gradientColors: ['#8B5CF6', '#7C3AED'] },
  offers: { title: 'Offers', icon: '🎁', gradientColors: ['#EC4899', '#DB2777'] },
};

const FinancialCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const { trackEvent, trackScreen } = useComprehensiveAnalytics();
  const { isOffline } = useNetworkStatus();
  const startTimeRef = useRef<number>(Date.now());
  
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [services, setServices] = useState<FinancialService[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<FinancialServiceCategory | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const categorySlug = category || 'bills';
  const fallbackData = fallbackCategoryData[categorySlug] || fallbackCategoryData['bills'];

  const fetchServices = useCallback(async () => {
    if (isOffline) {
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await financialServicesApi.getByCategory(categorySlug, {
        page: 1,
        limit: 50,
        sortBy: selectedFilter === 'Top Rated' ? 'rating' : 
                selectedFilter === 'Best Price' ? 'price_low' : 'rating',
      });

      if (response.success && response.data) {
        setServices(response.data.services);
        if (response.data.category) {
          setCategoryInfo({
            _id: response.data.category._id,
            id: response.data.category.slug,
            name: response.data.category.name,
            slug: response.data.category.slug,
            icon: response.data.category.icon,
            iconType: response.data.category.iconType || 'emoji',
            color: response.data.category.metadata?.color || fallbackData.gradientColors[0],
            cashbackPercentage: response.data.category.cashbackPercentage,
            maxCashback: response.data.category.maxCashback,
            serviceCount: response.data.category.serviceCount || 0,
            metadata: response.data.category.metadata,
          });
        }
        trackEvent('financial_category_services_loaded', {
          category: categorySlug,
          count: response.data.services?.length || 0,
          filter: selectedFilter,
        });
      }
    } catch (error: any) {
      console.error('Error fetching financial services:', error);
      trackEvent('financial_category_error', {
        category: categorySlug,
        error: error.message || 'Unknown error',
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [categorySlug, selectedFilter, isOffline, trackEvent]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Track screen view
  useEffect(() => {
    trackScreen('financial_category', {
      category: categorySlug,
    });

    return () => {
      const timeSpent = Date.now() - startTimeRef.current;
      trackEvent('financial_category_time_spent', {
        category: categorySlug,
        time_spent_ms: timeSpent,
        time_spent_seconds: Math.floor(timeSpent / 1000),
      });
    };
  }, [categorySlug, trackScreen, trackEvent]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchServices();
  }, [fetchServices]);

  const handleServicePress = (service: FinancialService) => {
    const serviceId = service._id || service.id;
    if (serviceId) {
      trackEvent('financial_service_clicked', {
        service_id: serviceId,
        service_name: service.name,
        category: categorySlug,
        source: 'category_page',
      });
      router.push(`/financial/service/${serviceId}` as any);
    }
  };

  const gradientColors = categoryInfo?.metadata?.color 
    ? [categoryInfo.metadata.color, categoryInfo.metadata.color] 
    : fallbackData.gradientColors;
  const categoryTitle = categoryInfo?.name || fallbackData.title;
  const categoryIcon = categoryInfo?.icon || fallbackData.icon;

  if (isLoading && services.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.purple500} />
        <Text style={{ marginTop: 12, color: COLORS.gray600 }}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{categoryIcon} {categoryTitle}</Text>
            <Text style={styles.headerSubtitle}>{services.length} {services.length === 1 ? 'service' : 'services'}</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.purple500]} />
        }
      >
        <View style={styles.itemsList}>
          {services.length > 0 ? (
            services.map((service) => {
              const serviceId = service._id || service.id || '';
              const cashback = service.cashback?.percentage 
                ? `${service.cashback.percentage}%` 
                : service.serviceCategory?.cashbackPercentage 
                  ? `${service.serviceCategory.cashbackPercentage}%` 
                  : '5%';
              
              return (
                <TouchableOpacity 
                  key={serviceId} 
                  style={styles.itemCard} 
                  onPress={() => handleServicePress(service)} 
                  activeOpacity={0.8}
                >
                  <Image 
                    source={{ uri: service.images?.[0] || 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400' }} 
                    style={styles.itemImage} 
                  />
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{cashback}</Text>
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{service.name}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeText}>
                        {service.serviceCategory?.name || service.shortDescription || 'Service'}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleServicePress(service);
                      }}
                    >
                      <Text style={styles.payButtonText}>View Details</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={{ color: COLORS.gray600 }}>No services found</Text>
            </View>
          )}
        </View>
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
  itemsList: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  itemImage: { width: '100%', height: 140 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  payButton: { backgroundColor: COLORS.purple500, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  payButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

// Wrap with Error Boundary for production
const FinancialCategoryPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary
      fallback={
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Ionicons name="alert-circle" size={48} color={COLORS.purple500} />
          <Text style={{ marginTop: 12, color: COLORS.gray600 }}>Something went wrong. Please try again.</Text>
        </View>
      }
    >
      <FinancialCategoryPage />
    </ErrorBoundary>
  );
};

export default FinancialCategoryPageWithErrorBoundary;
