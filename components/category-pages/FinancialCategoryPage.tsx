/**
 * Financial Lifestyle Category Page - ENHANCED
 * Based on Rez_v-2-main Financial.jsx design
 * Features: Bill payments, Recharge, Insurance, Gold savings, UGC
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
import { useWallet } from '@/hooks/useWallet';
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

const FINANCIAL_SECTIONS = [
  { id: 'payments', label: 'Payments & Bills', icon: 'receipt-outline' },
  { id: 'savings', label: 'Savings', icon: 'wallet-outline' },
  { id: 'credit', label: 'Credit', icon: 'card-outline' },
];

export default function FinancialCategoryPage() {
  const router = useRouter();
  const slug = 'financial-lifestyle';
  const categoryConfig = getCategoryConfig(slug);
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const { subcategories, stores, ugcPosts, aiPlaceholders, isLoading, error, refetch } = useCategoryPageData(slug);

  // Get wallet data for savings dashboard
  const { walletState } = useWallet({ autoFetch: true });
  const savingsThisMonth = walletState.data?.savingsInsights?.thisMonth || 0;
  const totalCoins = walletState.data?.totalBalance || 0;
  const cashbackBalance = walletState.data?.cashbackBalance || 0;

  const [activeSection, setActiveSection] = useState('payments');
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
    return <LoadingState message="Loading services..." />;
  }

  // Show error state with retry
  if (error && stores.length === 0) {
    return (
      <EmptyState
        icon="wallet-outline"
        title="Unable to load"
        message={error || "Something went wrong. Please try again."}
        actionLabel="Try Again"
        onAction={refetch}
      />
    );
  }

  return (
    <ErrorBoundary onError={(err) => console.error('FinancialCategoryPage Error:', err)}>
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

      {/* Dashboard Card */}
      <View style={styles.dashboardCard}>
        <LinearGradient colors={['rgba(59, 130, 246, 0.2)', 'rgba(139, 92, 246, 0.2)']} style={styles.dashboardGradient}>
          <Text style={styles.dashboardTitle}>Total Savings This Month</Text>
          <Text style={styles.dashboardAmount}>{currencySymbol}{savingsThisMonth.toLocaleString()}</Text>
          <View style={styles.dashboardStats}>
            <View style={styles.dashboardStat}>
              <Text style={styles.dashboardStatLabel}>Balance</Text>
              <Text style={styles.dashboardStatValue}>{currencySymbol}{(walletState.data?.availableBalance || 0).toLocaleString()}</Text>
            </View>
            <View style={styles.dashboardStat}>
              <Text style={styles.dashboardStatLabel}>Cashback</Text>
              <Text style={styles.dashboardStatValue}>{currencySymbol}{cashbackBalance.toLocaleString()}</Text>
            </View>
            <View style={styles.dashboardStat}>
              <Text style={styles.dashboardStatLabel}>Coins</Text>
              <Text style={styles.dashboardStatValue}>{totalCoins.toLocaleString()}</Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Section Tabs */}
      <View style={styles.sectionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sections}>
          {FINANCIAL_SECTIONS.map((section) => (
            <TouchableOpacity
              key={section.id}
              onPress={() => setActiveSection(section.id)}
              style={[styles.sectionTab, activeSection === section.id && styles.sectionTabActive]}
            >
              <Ionicons name={section.icon as any} size={16} color={activeSection === section.id ? COLORS.white : COLORS.textSecondary} />
              <Text style={[styles.sectionLabel, activeSection === section.id && styles.sectionLabelActive]}>{section.label}</Text>
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
        title="Browse Financial Services"
        onCategoryPress={handleCategoryPress}
      />

      {/* Bill Payments */}
      {activeSection === 'payments' && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
            <Text style={styles.sectionTitle}>Bill Payments</Text>
            <TouchableOpacity onPress={() => router.push(`/stores?category=${slug}`)}><Text style={styles.sectionSeeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.billsGrid}>
            {[{ name: 'Electricity', icon: 'flash-outline', color: '#F59E0B' }, { name: 'Water', icon: 'water-outline', color: '#3B82F6' }, { name: 'Gas', icon: 'flame-outline', color: '#EF4444' }, { name: 'Internet', icon: 'wifi-outline', color: '#8B5CF6' }, { name: 'Mobile', icon: 'phone-portrait-outline', color: '#10B981' }, { name: 'Broadband', icon: 'tv-outline', color: '#EC4899' }].map((bill, index) => (
              <TouchableOpacity key={index} style={styles.billCard} onPress={() => router.push(`/bill-payment?type=${bill.name.toLowerCase()}`)}>
                <View style={[styles.billIcon, { backgroundColor: bill.color + '20' }]}>
                  <Ionicons name={bill.icon as any} size={24} color={bill.color} />
                </View>
                <Text style={styles.billName}>{bill.name}</Text>
                <Text style={styles.billCashback}>10% cashback</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Mobile Recharge */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="phone-portrait-outline" size={20} color="#10B981" />
          <Text style={styles.sectionTitle}>Mobile Recharge</Text>
        </View>
        <View style={styles.rechargeGrid}>
          {[99, 199, 299, 499].map((amount, index) => (
            <TouchableOpacity key={index} style={styles.rechargeCard} onPress={() => router.push(`/recharge?amount=${amount}`)}>
              <Text style={styles.rechargeAmount}>{currencySymbol}{amount}</Text>
              <Text style={styles.rechargeCashback}>10% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Insurance */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="shield-outline" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Insurance</Text>
        </View>
        <View style={styles.insuranceGrid}>
          {['Health', 'Life', 'Vehicle', 'Travel'].map((type, index) => (
            <TouchableOpacity key={index} style={styles.insuranceCard} onPress={() => router.push(`/insurance?type=${type.toLowerCase()}`)}>
              <Text style={styles.insuranceEmoji}>{['🏥', '❤️', '🚗', '✈️'][index]}</Text>
              <Text style={styles.insuranceName}>{type} Insurance</Text>
              <Text style={styles.insuranceCashback}>Up to 15% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Gold Savings */}
      <View style={styles.section}>
        <View style={styles.goldCard}>
          <LinearGradient colors={['rgba(251, 191, 36, 0.2)', 'rgba(249, 115, 22, 0.2)']} style={styles.goldGradient}>
            <Text style={styles.goldEmoji}>🥇</Text>
            <View style={styles.goldText}>
              <Text style={styles.goldTitle}>Start Saving in Gold</Text>
              <Text style={styles.goldSubtitle}>Buy as low as {currencySymbol}1, invest in 24K gold</Text>
            </View>
            <TouchableOpacity style={styles.goldButton} onPress={() => router.push('/gold-savings')}>
              <Text style={styles.goldButtonText}>Start Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>

      {/* OTT Subscriptions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="tv-outline" size={20} color="#EC4899" />
          <Text style={styles.sectionTitle}>OTT Subscriptions</Text>
        </View>
        <View style={styles.ottGrid}>
          {['Netflix', 'Disney+', 'Prime', 'Hotstar'].map((ott, index) => (
            <TouchableOpacity key={index} style={styles.ottCard} onPress={() => router.push(`/subscriptions?platform=${ott.toLowerCase().replace('+', '')}`)}>
              <Text style={styles.ottEmoji}>{['📺', '🎬', '🎥', '📱'][index]}</Text>
              <Text style={styles.ottName}>{ott}</Text>
              <Text style={styles.ottCashback}>10% cashback</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <StreakLoyaltySection />

      <EnhancedUGCSocialProofSection
        categorySlug={slug}
        categoryName={categoryConfig.name}
        posts={ugcPosts}
        title="Smart Savers"
        subtitle="See how others are saving money!"
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
  dashboardCard: { marginHorizontal: 16, marginTop: 12, borderRadius: 16, overflow: 'hidden' },
  dashboardGradient: { padding: 20 },
  dashboardTitle: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 8 },
  dashboardAmount: { fontSize: 36, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 16 },
  dashboardStats: { flexDirection: 'row', gap: 16 },
  dashboardStat: { flex: 1 },
  dashboardStatLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  dashboardStatValue: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary },
  sectionsContainer: { backgroundColor: COLORS.white, paddingVertical: 8, marginTop: 12 },
  sections: { paddingHorizontal: 16, gap: 8 },
  sectionTab: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: 'rgba(0, 0, 0, 0.05)', gap: 6 },
  sectionTabActive: { backgroundColor: COLORS.primaryGreen },
  sectionLabel: { fontSize: 14, color: COLORS.textSecondary },
  sectionLabelActive: { color: COLORS.white, fontWeight: '600' },
  section: { marginTop: 24, paddingHorizontal: 16 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: COLORS.textPrimary },
  sectionSeeAll: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '500' },
  billsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  billCard: { width: '30%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  billIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  billName: { fontSize: 13, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 4, textAlign: 'center' },
  billCashback: { fontSize: 11, color: COLORS.primaryGreen, textAlign: 'center' },
  rechargeGrid: { flexDirection: 'row', gap: 8 },
  rechargeCard: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  rechargeAmount: { fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 4 },
  rechargeCashback: { fontSize: 11, color: COLORS.primaryGreen },
  insuranceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  insuranceCard: { flex: 1, minWidth: '45%', padding: 16, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  insuranceEmoji: { fontSize: 32, marginBottom: 8 },
  insuranceName: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  insuranceCashback: { fontSize: 12, color: COLORS.primaryGreen },
  goldCard: { borderRadius: 16, overflow: 'hidden' },
  goldGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  goldEmoji: { fontSize: 32 },
  goldText: { flex: 1 },
  goldTitle: { fontSize: 16, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 4 },
  goldSubtitle: { fontSize: 12, color: COLORS.textSecondary },
  goldButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primaryGold },
  goldButtonText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  ottGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  ottCard: { flex: 1, minWidth: '22%', padding: 12, borderRadius: 16, backgroundColor: COLORS.white, alignItems: 'center' },
  ottEmoji: { fontSize: 24, marginBottom: 4 },
  ottName: { fontSize: 12, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 2 },
  ottCashback: { fontSize: 10, color: COLORS.primaryGreen },
});
