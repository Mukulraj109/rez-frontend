/**
 * Fitness & Sports Hub Page
 * Connected to real API data
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  orange500: '#F97316',
  amber500: '#F59E0B',
};

// Static categories for navigation (icons and colors)
const categoryConfig: Record<string, { icon: string; color: string }> = {
  gyms: { icon: '🏋️', color: '#F97316' },
  studios: { icon: '🧘', color: '#8B5CF6' },
  trainers: { icon: '💪', color: '#10B981' },
  store: { icon: '🛒', color: '#3B82F6' },
  challenges: { icon: '🏆', color: '#EAB308' },
  nutrition: { icon: '🥗', color: '#22C55E' },
};

interface Category {
  _id: string;
  name: string;
  slug: string;
  storeCount?: number;
}

interface FeaturedGym {
  _id: string;
  name: string;
  slug: string;
  ratings: { average: number };
  location: { address: string; city: string };
  offers: { cashback: number };
  logo: string;
  banner: string[];
}

interface Stats {
  totalGyms: number;
  maxCashback: number;
  coinsMultiplier: string;
}

const FitnessPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredGyms, setFeaturedGyms] = useState<FeaturedGym[]>([]);
  const [stats, setStats] = useState<Stats>({ totalGyms: 0, maxCashback: 0, coinsMultiplier: '3X' });

  const fetchData = useCallback(async () => {
    try {
      // Fetch subcategories and featured gyms in parallel
      const [gymsRes, studiosRes, trainersRes, storesRes] = await Promise.all([
        apiClient.get('/stores/by-category-slug/gyms?limit=5&sortBy=rating'),
        apiClient.get('/stores/by-category-slug/studios?limit=5'),
        apiClient.get('/stores/by-category-slug/trainers?limit=5'),
        apiClient.get('/stores/by-category-slug/store?limit=5'),
      ]);

      // Extract data from responses
      const gymsData = (gymsRes.data as any)?.stores || [];
      const studiosData = (studiosRes.data as any)?.stores || [];
      const trainersData = (trainersRes.data as any)?.stores || [];
      const storesData = (storesRes.data as any)?.stores || [];

      // Build categories with real counts
      const builtCategories: Category[] = [
        { _id: 'gyms', name: 'Gyms', slug: 'gyms', storeCount: (gymsRes.data as any)?.total || gymsData.length },
        { _id: 'studios', name: 'Fitness Studios', slug: 'studios', storeCount: (studiosRes.data as any)?.total || studiosData.length },
        { _id: 'trainers', name: 'Personal Trainers', slug: 'trainers', storeCount: (trainersRes.data as any)?.total || trainersData.length },
        { _id: 'store', name: 'Sports Store', slug: 'store', storeCount: (storesRes.data as any)?.total || storesData.length },
        { _id: 'challenges', name: 'Challenges', slug: 'challenges', storeCount: 50 },
        { _id: 'nutrition', name: 'Nutrition', slug: 'nutrition', storeCount: 100 },
      ];

      setCategories(builtCategories);
      setFeaturedGyms(gymsData.slice(0, 5));

      // Calculate stats
      const allStores = [...gymsData, ...studiosData, ...trainersData, ...storesData];
      const maxCashback = Math.max(...allStores.map((s: any) => s.offers?.cashback || 0), 0);

      setStats({
        totalGyms: gymsData.length + studiosData.length,
        maxCashback: maxCashback || 35,
        coinsMultiplier: '3X',
      });

    } catch (error) {
      console.error('Error fetching fitness data:', error);
      // Set fallback data
      setCategories([
        { _id: 'gyms', name: 'Gyms', slug: 'gyms', storeCount: 0 },
        { _id: 'studios', name: 'Fitness Studios', slug: 'studios', storeCount: 0 },
        { _id: 'trainers', name: 'Personal Trainers', slug: 'trainers', storeCount: 0 },
        { _id: 'store', name: 'Sports Store', slug: 'store', storeCount: 0 },
        { _id: 'challenges', name: 'Challenges', slug: 'challenges', storeCount: 50 },
        { _id: 'nutrition', name: 'Nutrition', slug: 'nutrition', storeCount: 100 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCategoryPress = (categorySlug: string) => {
    if (categorySlug === 'challenges') {
      router.push('/challenges' as any);
    } else {
      router.push(`/fitness/${categorySlug}` as any);
    }
  };

  const handleGymPress = (gym: FeaturedGym) => {
    router.push(`/store/${gym.slug || gym._id}` as any);
  };

  const getCategoryIcon = (slug: string) => categoryConfig[slug]?.icon || '🏋️';
  const getCategoryColor = (slug: string) => categoryConfig[slug]?.color || '#F97316';

  const formatCount = (count: number | undefined) => {
    if (!count) return '0';
    if (count >= 100) return `${Math.floor(count / 10) * 10}+`;
    return String(count);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.orange500} />
        <Text style={styles.loadingText}>Loading fitness data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Fitness & Sports</Text>
            <Text style={styles.headerSubtitle}>Stay fit, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.totalGyms || '10'}+</Text>
            <Text style={styles.statLabel}>Gyms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.maxCashback}%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.coinsMultiplier}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.orange500}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat._id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.slug)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${getCategoryColor(cat.slug)}20` }]}>
                  <Text style={styles.categoryEmoji}>{getCategoryIcon(cat.slug)}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.name}</Text>
                <Text style={styles.categoryCount}>{formatCount(cat.storeCount)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Gyms</Text>
            <TouchableOpacity onPress={() => handleCategoryPress('gyms')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {featuredGyms.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredGyms.map((gym) => (
                <TouchableOpacity
                  key={gym._id}
                  style={styles.gymCard}
                  onPress={() => handleGymPress(gym)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: gym.banner?.[0] || gym.logo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' }}
                    style={styles.gymImage}
                  />
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{gym.offers?.cashback || 15}%</Text>
                  </View>
                  <View style={styles.gymInfo}>
                    <Text style={styles.gymName} numberOfLines={1}>{gym.name}</Text>
                    <View style={styles.gymMeta}>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.amber500} />
                        <Text style={styles.ratingText}>{gym.ratings?.average?.toFixed(1) || '4.5'}</Text>
                      </View>
                      <Text style={styles.distanceText} numberOfLines={1}>{gym.location?.city || 'Bangalore'}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={48} color={COLORS.gray200} />
              <Text style={styles.emptyStateText}>No featured gyms yet</Text>
            </View>
          )}
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>💪</Text>
            <Text style={styles.promoTitle}>New Year Fitness Challenge</Text>
            <Text style={styles.promoSubtitle}>Join now & win up to 10,000 coins</Text>
            <TouchableOpacity
              style={styles.promoButton}
              onPress={() => router.push('/challenges' as any)}
            >
              <Text style={styles.promoButtonText}>Join Challenge</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.orange500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  gymCard: { width: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  gymImage: { width: '100%', height: 120 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  gymInfo: { padding: 12 },
  gymName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  gymMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  distanceText: { fontSize: 12, color: COLORS.gray600, maxWidth: 80 },
  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyStateText: { marginTop: 8, fontSize: 14, color: COLORS.gray600 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.green500 },
});

export default FitnessPage;
