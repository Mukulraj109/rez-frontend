/**
 * Healthcare Category Page - ENHANCED
 * Based on Rez_v-2-main Healthcare.jsx design
 * Features: Specialization grid, Doctor cards, Pharmacy section, Lab tests, UGC
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

export default function HealthcareCategoryPage() {
  const router = useRouter();
  const slug = 'healthcare';
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
    return <LoadingState message="Loading healthcare..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="medkit-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('HealthcareCategoryPage Error:', err)}>
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

      {/* Trust Banner */}
      <View style={styles.trustBanner}>
        <LinearGradient colors={['rgba(0, 192, 106, 0.15)', 'rgba(59, 130, 246, 0.15)']} style={styles.trustGradient}>
          <Ionicons name="shield-checkmark" size={24} color={COLORS.primaryGreen} />
          <View style={styles.trustText}>
            <Text style={styles.trustTitle}>Verified Healthcare Partners</Text>
            <Text style={styles.trustSubtitle}>Earn cashback on medicines, consultations & lab tests</Text>
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
        title="Browse Healthcare"
        onCategoryPress={handleCategoryPress}
      />

      {/* Quick Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🏥</Text>
          <Text style={styles.sectionTitle}>Quick Services</Text>
        </View>
        <View style={styles.servicesGrid}>
          {['Book Doctor', 'Order Medicine', 'Lab Tests', 'Health Checkup'].map((service, index) => (
            <TouchableOpacity key={index} style={styles.serviceCard} onPress={() => router.push(`/search?q=${encodeURIComponent(service)}&category=${slug}`)}>
              <View style={styles.serviceIcon}>
                <Text style={styles.serviceEmoji}>{['👨‍⚕️', '💊', '🧪', '🩺'][index]}</Text>
              </View>
              <Text style={styles.serviceName}>{service}</Text>
              <Text style={styles.serviceCashback}>Up to 15% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Featured Pharmacies */}
      {stores.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#EF4444" />
            <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storesList}>
            {stores.slice(0, 5).map((store) => (
              <TouchableOpacity key={store.id} style={styles.pharmacyCard} onPress={() => router.push(`/StorePage?storeId=${store.id}` as any)}>
                <View style={styles.pharmacyLogo}>
                  {store.logo ? <Image source={{ uri: store.logo }} style={styles.pharmacyLogoImage} /> : <Text style={styles.pharmacyEmoji}>💊</Text>}
                </View>
                <Text style={styles.pharmacyName} numberOfLines={1}>{store.name}</Text>
                <View style={styles.pharmacyRating}>
                  <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                  <Text style={styles.pharmacyRatingText}>{store.rating?.toFixed(1) || '4.5'}</Text>
                </View>
                <Text style={styles.pharmacyCashback}>{store.cashback || 10}% Cashback</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Health Tips */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="bulb-outline" size={20} color={COLORS.primaryGold} />
          <Text style={styles.sectionTitle}>Health Tips</Text>
        </View>
        <View style={styles.tipsList}>
          {['Stay hydrated - Drink 8 glasses daily', 'Get 7-8 hours of sleep', 'Regular health checkups'].map((tip, index) => (
            <View key={index} style={styles.tipCard}>
              <Ionicons name="checkmark-circle" size={18} color={COLORS.primaryGreen} />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Real Health Stories"
        subtitle="See how others are taking care of their health!"
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
  trustBanner: { marginHorizontal: 16, marginTop: 12, borderRadius: 12, overflow: 'hidden' },
  trustGradient: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  trustText: { flex: 1 },
  trustTitle: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  trustSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionEmoji: { fontSize: 20 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  servicesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  serviceCard: { width: '48%', alignItems: 'center', padding: 16, borderRadius: 16, backgroundColor: COLORS.white },
  serviceIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  serviceEmoji: { fontSize: 24 },
  serviceName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  serviceCashback: { fontSize: 12, color: COLORS.primaryGreen },
  storesList: { gap: 12, paddingRight: 16 },
  pharmacyCard: { width: 140, padding: 12, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  pharmacyLogo: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  pharmacyLogoImage: { width: 40, height: 40, borderRadius: 20 },
  pharmacyEmoji: { fontSize: 20 },
  pharmacyName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 4 },
  pharmacyRating: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  pharmacyRatingText: { fontSize: 12, color: COLORS.textPrimary },
  pharmacyCashback: { fontSize: 11, color: COLORS.primaryGreen },
  tipsList: { gap: 8 },
  tipCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: COLORS.white, gap: 8 },
  tipText: { flex: 1, fontSize: 13, color: '#374151' },
});
