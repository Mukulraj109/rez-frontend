/**
 * Women Exclusive Zone Page
 * Redesigned women-exclusive offers page
 * Based on Rez_v-2-main design, adapted for rez-frontend theme
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography, Gradients } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WomenDeal {
  id: string;
  store: string;
  title: string;
  discount: string;
  category: string;
  description: string;
  image?: string;
}

const DUMMY_WOMEN_DEALS: WomenDeal[] = [
  {
    id: 'wom1',
    store: 'Nykaa',
    title: 'Beauty Essentials: 35% OFF',
    discount: '35%',
    category: 'Beauty',
    description: 'Top beauty brands at exclusive prices',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
  },
  {
    id: 'wom2',
    store: 'Curves Fitness',
    title: 'First Month FREE',
    discount: 'FREE',
    category: 'Fitness',
    description: 'Women-only gym with personalized training',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
  },
  {
    id: 'wom3',
    store: 'Myntra',
    title: "Women's Fashion: 40% OFF",
    discount: '40%',
    category: 'Fashion',
    description: 'Latest trends at unbeatable prices',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400',
  },
  {
    id: 'wom4',
    store: 'VLCC',
    title: 'Wellness Package: 50% OFF',
    discount: '50%',
    category: 'Wellness',
    description: 'Complete wellness and beauty treatments',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
  },
  {
    id: 'wom5',
    store: 'Fab India',
    title: 'Ethnic Wear: 30% OFF',
    discount: '30%',
    category: 'Fashion',
    description: 'Beautiful ethnic wear collection',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400',
  },
  {
    id: 'wom6',
    store: 'HealthifyMe',
    title: "Women's Health Plan: 25% OFF",
    discount: '25%',
    category: 'Health',
    description: 'Personalized nutrition for women',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
  },
];

const CATEGORIES = [
  { id: 'Beauty', icon: '💄', label: 'Beauty', count: 24 },
  { id: 'Fashion', icon: '👗', label: 'Fashion', count: 45 },
  { id: 'Wellness', icon: '🧘', label: 'Wellness', count: 18 },
  { id: 'Fitness', icon: '💪', label: 'Fitness', count: 12 },
  { id: 'Health', icon: '❤️', label: 'Health', count: 15 },
];

const FEATURED_BRANDS = ['Nykaa', 'Myntra', 'VLCC', 'Fab India'];

export default function WomenZonePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const filteredDeals = selectedCategory
    ? DUMMY_WOMEN_DEALS.filter((d) => d.category === selectedCategory)
    : DUMMY_WOMEN_DEALS;

  const handleDealPress = (deal: WomenDeal) => {
    // TODO: Navigate to deal detail
    console.log('Deal pressed:', deal.id);
  };

  const renderDealCard = (deal: WomenDeal) => (
    <TouchableOpacity
      key={deal.id}
      style={styles.dealCard}
      onPress={() => handleDealPress(deal)}
      activeOpacity={0.7}
    >
      {deal.image && (
        <Image source={{ uri: deal.image }} style={styles.dealImage} resizeMode="cover" />
      )}
      <View style={styles.dealContent}>
        <View style={styles.dealHeader}>
          <View style={styles.dealInfo}>
            <ThemedText style={styles.dealStore}>{deal.store}</ThemedText>
            <ThemedText style={styles.dealTitle}>{deal.title}</ThemedText>
          </View>
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>{deal.discount}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.dealDescription} numberOfLines={2}>
          {deal.description}
        </ThemedText>

        <View style={styles.dealTags}>
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>👩 Women Exclusive</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EC4899" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#EC4899', '#DB2777', '#BE185D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Women Exclusive</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Beauty, wellness & lifestyle</ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.emoji}>👩</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={['rgba(236, 72, 153, 0.3)', 'rgba(219, 39, 119, 0.2)', 'rgba(139, 92, 246, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Ionicons name="sparkles" size={20} color="#F472B6" />
                <ThemedText style={styles.heroBadgeText}>Curated for You</ThemedText>
              </View>
              <ThemedText style={styles.heroTitle}>Celebrate You</ThemedText>
              <ThemedText style={styles.heroSubtitle}>
                Exclusive deals on beauty, fashion & wellness
              </ThemedText>

              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <ThemedText style={styles.heroStatValue}>50+</ThemedText>
                  <ThemedText style={styles.heroStatLabel}>Deals</ThemedText>
                </View>
                <View style={styles.heroStat}>
                  <ThemedText style={[styles.heroStatValue, { color: '#A78BFA' }]}>35%</ThemedText>
                  <ThemedText style={styles.heroStatLabel}>Avg. Savings</ThemedText>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Categories */}
        <View style={styles.categorySection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Shop by Category</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() =>
                  setSelectedCategory(selectedCategory === cat.id ? null : cat.id)
                }
                activeOpacity={0.7}
              >
                <ThemedText style={styles.categoryIcon}>{cat.icon}</ThemedText>
                <ThemedText style={styles.categoryLabel}>{cat.label}</ThemedText>
                <ThemedText style={styles.categoryCount}>{cat.count} deals</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Brands */}
        <View style={styles.brandsSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Featured Brands</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.brandsScroll}
          >
            {FEATURED_BRANDS.map((brand, i) => (
              <View key={i} style={styles.brandCard}>
                <ThemedText style={styles.brandText}>{brand}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Deals List */}
        <View style={styles.dealsSection}>
          <ThemedText style={styles.sectionTitle}>All Deals</ThemedText>
          {filteredDeals.map((deal) => renderDealCard(deal))}
        </View>

        {/* Self-Care Reminder */}
        <View style={styles.selfCareCard}>
          <LinearGradient
            colors={['rgba(244, 63, 94, 0.1)', 'rgba(236, 72, 153, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.selfCareGradient}
          >
            <View style={styles.selfCareIcon}>
              <Ionicons name="heart" size={24} color="#FB7185" />
            </View>
            <View style={styles.selfCareContent}>
              <ThemedText style={styles.selfCareTitle}>Self-Care Sunday</ThemedText>
              <ThemedText style={styles.selfCareSubtitle}>
                Extra 10% off on wellness services
              </ThemedText>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Fixed CTA Button */}
      <View style={styles.fixedCTA}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#EC4899', '#A78BFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <ThemedText style={styles.ctaButtonText}>
              Explore All Women Exclusive Deals
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  safeHeader: {
    paddingBottom: Spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Will be overridden by dynamic padding
  },
  heroBanner: {
    margin: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.medium,
  },
  heroGradient: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
    borderRadius: BorderRadius['2xl'],
  },
  heroContent: {
    position: 'relative',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.md,
  },
  heroBadgeText: {
    ...Typography.labelSmall,
    color: '#F472B6',
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    marginBottom: Spacing.base,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
  },
  heroStat: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroStatValue: {
    ...Typography.h3,
    color: '#F472B6',
    fontWeight: '700',
    marginBottom: 2,
  },
  heroStatLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  categoryCard: {
    alignItems: 'center',
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.background.primary,
    minWidth: 100,
    ...Shadows.subtle,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryCount: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  brandsSection: {
    marginBottom: Spacing.lg,
  },
  brandsScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  brandCard: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    ...Typography.caption,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  dealsSection: {
    paddingHorizontal: Spacing.base,
  },
  dealCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  dealImage: {
    width: 112,
    height: 112,
  },
  dealContent: {
    flex: 1,
    padding: Spacing.base,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  dealInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  dealStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  dealTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    ...Typography.labelSmall,
    color: '#EC4899',
    fontWeight: '700',
  },
  dealDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  dealTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  selfCareCard: {
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  selfCareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  selfCareIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(251, 113, 133, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selfCareContent: {
    flex: 1,
  },
  selfCareTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  selfCareSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  fixedCTA: {
    position: 'absolute',
    bottom: 70, // Above bottom nav bar (70px height)
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadows.medium,
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
