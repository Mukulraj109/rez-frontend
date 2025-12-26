/**
 * Education & Learning Category Page - ENHANCED
 * Based on Rez_v-2-main Education.jsx design
 * Features: Course categories, Learning platforms, Tutors, UGC
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

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

export default function EducationCategoryPage() {
  const router = useRouter();
  const slug = 'education-learning';
  const categoryConfig = getCategoryConfig(slug);

  const { subcategories, stores, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);
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
    return <LoadingState message="Loading courses..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="book-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('EducationCategoryPage Error:', err)}>
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

      {/* Learning Banner */}
      <View style={styles.learningBanner}>
        <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.15)']} style={styles.learningGradient}>
          <Ionicons name="school" size={24} color="#8B5CF6" />
          <View style={styles.learningText}>
            <Text style={styles.learningTitle}>Learn & Earn Rewards</Text>
            <Text style={styles.learningSubtitle}>Get cashback on courses, books & tutoring</Text>
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
        title="Browse Courses"
        onCategoryPress={handleCategoryPress}
      />

      {/* Popular Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>📚</Text>
          <Text style={styles.sectionTitle}>Popular Categories</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesList}>
          {['Coding', 'Languages', 'Business', 'Design', 'Music', 'Exam Prep'].map((cat, index) => (
            <TouchableOpacity key={index} style={styles.categoryCard} onPress={() => router.push(`/search?q=${encodeURIComponent(cat)}&category=${slug}`)}>
              <View style={[styles.categoryIcon, { backgroundColor: ['#DBEAFE', '#FEE2E2', '#D1FAE5', '#FDE68A', '#E9D5FF', '#CFFAFE'][index] }]}>
                <Text style={styles.categoryEmoji}>{['💻', '🌐', '📈', '🎨', '🎵', '📝'][index]}</Text>
              </View>
              <Text style={styles.categoryName}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Platforms */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="laptop-outline" size={20} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Learning Platforms</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.platformsList}>
            {stores.slice(0, 5).map((store) => (
              <TouchableOpacity key={store.id} style={styles.platformCard} onPress={() => router.push(`/StorePage?storeId=${store.id}` as any)}>
                <View style={styles.platformLogo}>
                  {store.logo ? <Image source={{ uri: store.logo }} style={styles.platformLogoImage} /> : <Text style={styles.platformEmoji}>📖</Text>}
                </View>
                <Text style={styles.platformName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.platformRating}>
                  <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                  <Text style={styles.platformRatingText}>{store.rating?.toFixed(1) || '4.5'}</Text>
                </View>
                <Text style={styles.platformCashback}>{store.cashback || 10}% Cashback</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Learning Goals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="trophy-outline" size={20} color={COLORS.primaryGold} />
          <Text style={styles.sectionTitle}>Set Learning Goals</Text>
        </View>
        <View style={styles.goalCard}>
          <LinearGradient colors={['rgba(251, 191, 36, 0.15)', 'rgba(0, 192, 106, 0.15)']} style={styles.goalGradient}>
            <View style={styles.goalContent}>
              <View>
                <Text style={styles.goalTitle}>Complete 5 courses this month</Text>
                <Text style={styles.goalSubtitle}>Earn bonus coins & unlock rewards</Text>
              </View>
              <TouchableOpacity style={styles.goalButton} onPress={() => router.push(`/stores?category=${slug}`)}>
                <Text style={styles.goalButtonText}>Start Now</Text>
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
        title="Student Success Stories"
        subtitle="See how others are learning & growing!"
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
  learningBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  learningGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  learningText: { flex: 1 },
  learningTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  learningSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  categoriesList: { gap: 12, paddingRight: 16 },
  categoryCard: { width: 80, alignItems: 'center' },
  categoryIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryName: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, textAlign: 'center' },
  platformsList: { gap: 12, paddingRight: 16 },
  platformCard: { width: 140, padding: 12, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  platformLogo: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EDE9FE', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  platformLogoImage: { width: 40, height: 40, borderRadius: 10 },
  platformEmoji: { fontSize: 20 },
  platformName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 4 },
  platformRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  platformRatingText: { fontSize: 12, color: COLORS.textPrimary },
  platformCashback: { fontSize: 11, color: COLORS.primaryGreen },
  goalCard: { borderRadius: 16, overflow: 'hidden' },
  goalGradient: { padding: 16 },
  goalContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  goalTitle: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  goalSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  goalButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primaryGreen },
  goalButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
});
