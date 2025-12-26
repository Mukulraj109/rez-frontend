/**
 * Entertainment Category Page - ENHANCED
 * Based on Rez_v-2-main Events.jsx design
 * Features: Movies, Events, Gaming, UGC
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

const EVENT_CATEGORIES = [
  { id: 'movies', label: 'Movies', icon: 'film-outline' },
  { id: 'live', label: 'Live Events', icon: 'mic-outline' },
  { id: 'festivals', label: 'Festivals', icon: 'musical-notes-outline' },
  { id: 'gaming', label: 'Gaming', icon: 'game-controller-outline' },
];

export default function EntertainmentCategoryPage() {
  const router = useRouter();
  const slug = 'entertainment';
  const categoryConfig = getCategoryConfig(slug);

  const { subcategories, stores, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
    return <LoadingState message="Loading entertainment..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="film-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('EntertainmentCategoryPage Error:', err)}>
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

      {/* Entertainment Banner */}
      <View style={styles.entertainmentBanner}>
        <LinearGradient colors={['rgba(139, 92, 246, 0.15)', 'rgba(236, 72, 153, 0.15)']} style={styles.entertainmentGradient}>
          <Ionicons name="ticket" size={24} color="#8B5CF6" />
          <View style={styles.entertainmentText}>
            <Text style={styles.entertainmentTitle}>Book & Earn Rewards</Text>
            <Text style={styles.entertainmentSubtitle}>Get cashback on movies, events & experiences</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Event Categories */}
      <View style={styles.categoriesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
          {EVENT_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
              style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            >
              <Ionicons name={category.icon as any} size={18} color={selectedCategory === category.id ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.categoryLabel, selectedCategory === category.id && styles.categoryLabelActive]}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
        title="Browse Entertainment"
        onCategoryPress={handleCategoryPress}
      />

      {/* Movies Near You */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionEmoji}>🎬</Text>
            <Text style={styles.sectionTitle}>Movies Near You</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsList}>
            {stores.slice(0, 5).map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard} onPress={() => router.push(`/StorePage?storeId=${event.id}` as any)}>
                <Image source={{ uri: event.banner || event.logo || 'https://via.placeholder.com/300' }} style={styles.eventImage} resizeMode="cover" />
                <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.eventGradient} />
                <View style={styles.eventContent}>
                  <Text style={styles.eventName} numberOfLines={2}>{event.name}</Text>
                  <View style={styles.eventMeta}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.white} />
                    <Text style={styles.eventMetaText}>Today</Text>
                  </View>
                  <Text style={styles.eventPrice}>₹{event.price || '499'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Live Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🎤</Text>
          <Text style={styles.sectionTitle}>Live Events</Text>
        </View>
        <View style={styles.eventsGrid}>
          {['Concerts', 'Stand-up', 'Sports', 'Theatre'].map((event, index) => (
            <TouchableOpacity key={index} style={styles.eventTypeCard} onPress={() => router.push(`/search?q=${encodeURIComponent(event)}&category=${slug}`)}>
              <Text style={styles.eventTypeEmoji}>{['🎸', '😂', '⚽', '🎭'][index]}</Text>
              <Text style={styles.eventTypeName}>{event}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Festivals */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🎉</Text>
          <Text style={styles.sectionTitle}>Festivals</Text>
        </View>
        <View style={styles.festivalsGrid}>
          {['Music Festival', 'Food Festival', 'Art Festival'].map((festival, index) => (
            <TouchableOpacity key={index} style={styles.festivalCard} onPress={() => router.push(`/search?q=${encodeURIComponent(festival)}&category=${slug}`)}>
              <Text style={styles.festivalEmoji}>{['🎵', '🍕', '🎨'][index]}</Text>
              <Text style={styles.festivalName}>{festival}</Text>
              <Text style={styles.festivalDate}>This Weekend</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gaming Zone */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🎮</Text>
          <Text style={styles.sectionTitle}>Gaming Zone</Text>
        </View>
        <View style={styles.gamingGrid}>
          {['VR Experience', 'Gaming Cafe', 'E-Sports'].map((game, index) => (
            <TouchableOpacity key={index} style={styles.gamingCard} onPress={() => router.push(`/search?q=${encodeURIComponent(game)}&category=${slug}`)}>
              <Text style={styles.gamingEmoji}>{['🥽', '🕹️', '🏆'][index]}</Text>
              <Text style={styles.gamingName}>{game}</Text>
              <Text style={styles.gamingCashback}>15% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Fan Moments"
        subtitle="Real experiences from entertainment lovers!"
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
  entertainmentBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  entertainmentGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  entertainmentText: { flex: 1 },
  entertainmentTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  entertainmentSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  categoriesContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  categories: { gap: 8 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)', gap: 6 },
  categoryChipActive: { backgroundColor: COLORS.primaryGreen },
  categoryLabel: { fontSize: 14, color: COLORS.textSecondary },
  categoryLabelActive: { color: COLORS.white, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  eventsList: { gap: 12, paddingRight: 16 },
  eventCard: { width: 280, height: 200, borderRadius: 16, overflow: 'hidden', position: 'relative' },
  eventImage: { width: '100%', height: '100%' },
  eventGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' },
  eventContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  eventName: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 8 },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  eventMetaText: { fontSize: 12, color: COLORS.white },
  eventPrice: { fontSize: 16, fontWeight: '700', color: COLORS.white },
  eventsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  eventTypeCard: { width: '48%', padding: 20, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  eventTypeEmoji: { fontSize: 36, marginBottom: 8 },
  eventTypeName: { fontSize: 15, fontWeight: '600', color: COLORS.textPrimary },
  festivalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  festivalCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  festivalEmoji: { fontSize: 32, marginBottom: 8 },
  festivalName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  festivalDate: { fontSize: 12, color: COLORS.textSecondary },
  gamingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gamingCard: { flex: 1, minWidth: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  gamingEmoji: { fontSize: 32, marginBottom: 8 },
  gamingName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  gamingCashback: { fontSize: 11, color: COLORS.primaryGreen },
});
