/**
 * Fitness & Sports Category Page - ENHANCED
 * Based on Rez_v-2-main Fitness.jsx design
 * Features: Workout types, Gyms, Equipment, Classes, UGC
 */

import React, { useState } from 'react';
import { ScrollView, View, Text, StyleSheet, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import CategoryHeader from '@/components/CategoryHeader';
import { getCategoryConfig } from '@/config/categoryConfig';
import QuickActionBar from '@/components/category/QuickActionBar';
import StreakLoyaltySection from '@/components/category/StreakLoyaltySection';
import FooterTrustSection from '@/components/category/FooterTrustSection';
import BrowseCategoryGrid from '@/components/category/BrowseCategoryGrid';
import EnhancedAISuggestionsSection from '@/components/category/EnhancedAISuggestionsSection';
import EnhancedUGCSocialProofSection from '@/components/category/EnhancedUGCSocialProofSection';
import { useCategoryPageData } from '@/hooks/useCategoryPageData';
// Error and Loading States
import { ErrorBoundary } from '@/components/ErrorBoundary';
import EmptyState from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { useRegion } from '@/contexts/RegionContext';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

export default function FitnessCategoryPage() {
  const router = useRouter();
  const slug = 'fitness-sports';
  const categoryConfig = getCategoryConfig(slug);
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const { subcategories, stores, products, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCategoryPress = (category: any) => {
    router.push(`/category/${slug}/subcategory/${category.slug || category.id}` as any);
  };

  const handleAISearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}&category=${slug}`);
  };

  if (!categoryConfig) return null;

  // Show loading state
  if (isLoading && !refreshing && stores.length === 0) {
    return <LoadingState message="Loading fitness..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="barbell-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('FitnessCategoryPage Error:', err)}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[categoryConfig.primaryColor]} />}
    >
      <CategoryHeader
        categoryName={categoryConfig.name}
        primaryColor={categoryConfig.primaryColor}
        banner={categoryConfig.banner}
        gradientColors={categoryConfig.gradientColors}
      />

      {/* Fitness Banner */}
      <View style={styles.fitnessBanner}>
        <LinearGradient colors={['rgba(236, 72, 153, 0.15)', 'rgba(239, 68, 68, 0.15)']} style={styles.fitnessGradient}>
          <Ionicons name="fitness" size={24} color="#EC4899" />
          <View style={styles.fitnessText}>
            <Text style={styles.fitnessTitle}>Get Fit & Earn Rewards</Text>
            <Text style={styles.fitnessSubtitle}>Cashback on gym memberships, gear & classes</Text>
          </View>
        </LinearGradient>
      </View>

      <QuickActionBar categorySlug={slug} />

      <EnhancedAISuggestionsSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        placeholders={aiPlaceholders}
        onSearch={handleAISearch}
      />

      <BrowseCategoryGrid
        categories={subcategories}
        title="Browse Fitness"
        onCategoryPress={handleCategoryPress}
      />

      {/* Workout Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>💪</Text>
          <Text style={styles.sectionTitle}>Workout Types</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.workoutsList}>
          {['Cardio', 'Strength', 'Yoga', 'HIIT', 'Swimming', 'CrossFit'].map((workout, index) => (
            <TouchableOpacity key={index} style={styles.workoutCard} onPress={() => router.push(`/search?q=${encodeURIComponent(workout)}&category=${slug}`)}>
              <View style={[styles.workoutIcon, { backgroundColor: ['#DBEAFE', '#FEE2E2', '#D1FAE5', '#FDE68A', '#CFFAFE', '#E9D5FF'][index] }]}>
                <Text style={styles.workoutEmoji}>{['🏃', '🏋️', '🧘', '⚡', '🏊', '🔥'][index]}</Text>
              </View>
              <Text style={styles.workoutName}>{workout}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Nearby Gyms */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="barbell-outline" size={20} color="#EC4899" />
            <Text style={styles.sectionTitle}>Gyms Near You</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.gymsList}>
            {stores.slice(0, 5).map((store) => (
              <TouchableOpacity key={store.id} style={styles.gymCard} onPress={() => router.push(`/StorePage?storeId=${store.id}` as any)}>
                <Image source={{ uri: store.logo || 'https://via.placeholder.com/200' }} style={styles.gymImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.gymGradient} />
                <View style={styles.gymContent}>
                  <Text style={styles.gymName} numberOfLines={1}>{store.name}</Text>
                  <View style={styles.gymMeta}>
                    <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                    <Text style={styles.gymRating}>{store.rating?.toFixed(1) || '4.5'}</Text>
                    <Text style={styles.gymCashback}>{store.cashback || 10}% cashback</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fitness Equipment */}
      {products.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🏋️</Text>
            <Text style={styles.sectionTitle}>Fitness Equipment</Text>
            <TouchableOpacity onPress={() => router.push(`/products?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsList}>
            {products.slice(0, 6).map((product) => (
              <TouchableOpacity key={product.id} style={styles.productCard} onPress={() => router.push(`/ProductPage?productId=${product.id}` as any)}>
                <Image source={{ uri: product.image || 'https://via.placeholder.com/150' }} style={styles.productImage} resizeMode="cover" />
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productPrice}>{currencySymbol}{product.price?.toLocaleString() || '0'}</Text>
                <Text style={styles.productCashback}>{product.cashback || 10}% cashback</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Fitness Challenge */}
      <View style={styles.section}>
        <View style={styles.challengeCard}>
          <LinearGradient colors={['rgba(236, 72, 153, 0.15)', 'rgba(251, 191, 36, 0.15)']} style={styles.challengeGradient}>
            <View style={styles.challengeContent}>
              <Text style={styles.challengeEmoji}>🏆</Text>
              <View style={styles.challengeText}>
                <Text style={styles.challengeTitle}>30-Day Fitness Challenge</Text>
                <Text style={styles.challengeSubtitle}>Complete workouts & earn bonus coins</Text>
              </View>
              <TouchableOpacity style={styles.challengeButton} onPress={() => router.push('/challenges')}>
                <Text style={styles.challengeButtonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Fitness Transformations"
        subtitle="Real results from our fitness community!"
        onPostPress={(post) => router.push(`/ugc/${post.id}` as any)}
        onSharePress={() => router.push('/share' as any)}
      />

      <FooterTrustSection />
    </ScrollView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  contentContainer: { paddingBottom: 100 },
  fitnessBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  fitnessGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  fitnessText: { flex: 1 },
  fitnessTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  fitnessSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  workoutsList: { gap: 12, paddingRight: 16 },
  workoutCard: { width: 80, alignItems: 'center' },
  workoutIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  workoutEmoji: { fontSize: 24 },
  workoutName: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, textAlign: 'center' },
  gymsList: { gap: 12, paddingRight: 16 },
  gymCard: { width: 200, height: 140, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  gymImage: { width: '100%', height: '100%' },
  gymGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  gymContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 12 },
  gymName: { fontSize: 14, fontWeight: '600', color: COLORS.white, marginBottom: 4 },
  gymMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gymRating: { fontSize: 12, color: COLORS.white },
  gymCashback: { fontSize: 11, color: COLORS.primaryGold },
  productsList: { gap: 12, paddingRight: 16 },
  productCard: { width: 140, padding: 8, borderRadius: 12, backgroundColor: COLORS.white },
  productImage: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  productName: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 4 },
  productPrice: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  productCashback: { fontSize: 11, color: COLORS.primaryGreen },
  challengeCard: { borderRadius: 16, overflow: 'hidden' },
  challengeGradient: { padding: 16 },
  challengeContent: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  challengeEmoji: { fontSize: 32 },
  challengeText: { flex: 1 },
  challengeTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  challengeSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  challengeButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primaryGreen },
  challengeButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
});
