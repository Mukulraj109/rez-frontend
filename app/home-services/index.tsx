/**
 * Home Services Hub Page
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import homeServicesApi, { HomeServiceCategory, HomeService, HomeServicesStats } from '@/services/homeServicesApi';
import { useRegion } from '@/contexts/RegionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', blue500: '#3B82F6', amber500: '#F59E0B' };

const HomeServicesPage: React.FC = () => {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const [categories, setCategories] = useState<HomeServiceCategory[]>([]);
  const [featuredServices, setFeaturedServices] = useState<HomeService[]>([]);
  const [stats, setStats] = useState<HomeServicesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [categoriesRes, featuredRes, statsRes] = await Promise.all([
          homeServicesApi.getCategories(),
          homeServicesApi.getFeatured(3),
          homeServicesApi.getStats()
        ]);

        if (categoriesRes.success && categoriesRes.data) {
          setCategories(categoriesRes.data);
        }
        if (featuredRes.success && featuredRes.data) {
          setFeaturedServices(featuredRes.data);
        }
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }
      } catch (error) {
        console.error('[HomeServicesPage] Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleServicePress = (service: HomeService) => {
    const serviceId = service._id || service.id;
    if (serviceId) {
      router.push(`/product/${serviceId}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color={COLORS.blue500} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Home Services</Text>
            <Text style={styles.headerSubtitle}>Professional services at home</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.professionals || 200}+</Text>
            <Text style={styles.statLabel}>Professionals</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats?.maxCashback || 30}%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Same Day</Text>
            <Text style={styles.statLabel}>Service</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => {
              const isIconUrl = cat.icon && (cat.icon.startsWith('http://') || cat.icon.startsWith('https://'));
              return (
                <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/home-services/${cat.id}` as any)} activeOpacity={0.8}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                    {isIconUrl ? (
                      <Image 
                        source={{ uri: cat.icon }} 
                        style={{ width: 32, height: 32 }} 
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                    )}
                  </View>
                  <Text style={styles.categoryTitle}>{cat.title}</Text>
                  <Text style={styles.categoryCount}>{cat.count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popular Services</Text><TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredServices.map((service) => {
              const serviceId = service._id || service.id;
              const imageUrl = service.images?.[0] || 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400';
              const price = service.pricing?.selling || 0;
              const cashback = service.cashback?.percentage || service.serviceCategory?.cashbackPercentage || 0;
              const categoryName = service.serviceCategory?.name || 'Service';
              
              return (
                <TouchableOpacity 
                  key={serviceId} 
                  style={styles.serviceCard} 
                  onPress={() => handleServicePress(service)} 
                  activeOpacity={0.9}
                >
                  <Image source={{ uri: imageUrl }} style={styles.serviceImage} />
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{cashback}%</Text>
                  </View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service.name}</Text>
                    <Text style={styles.serviceType}>{categoryName}</Text>
                    <Text style={styles.servicePrice}>From {currencySymbol}{price}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🏠</Text>
            <Text style={styles.promoTitle}>Verified Professionals</Text>
            <Text style={styles.promoSubtitle}>Background verified • Trained experts • Guaranteed service</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Book Now</Text></TouchableOpacity>
          </LinearGradient>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 16 },
  statValue: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.blue500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  serviceCard: { width: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  serviceImage: { width: '100%', height: 120 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  serviceInfo: { padding: 12 },
  serviceName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  serviceType: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 },
  servicePrice: { fontSize: 14, fontWeight: '600', color: COLORS.green500 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.green500 },
});

export default HomeServicesPage;
