/**
 * Corporate/Employee Zone Page
 * Redesigned corporate employee offers page
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

interface CorporateDeal {
  id: string;
  store: string;
  title: string;
  discount: string;
  category: string;
  description: string;
  validTime?: string;
  image?: string;
}

const DUMMY_CORPORATE_DEALS: CorporateDeal[] = [
  {
    id: 'corp1',
    store: 'Box8',
    title: 'Office Lunch: 25% OFF',
    discount: '25%',
    validTime: '12 PM - 3 PM',
    category: 'Food & Dining',
    description: 'Quick and affordable lunch delivered to your office',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  },
  {
    id: 'corp2',
    store: 'Urban Company',
    title: 'After-work Spa: 40% OFF',
    discount: '40%',
    validTime: 'After 6 PM',
    category: 'Wellness',
    description: 'Relax after a long workday with spa services',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
  },
  {
    id: 'corp3',
    store: 'Swiggy',
    title: 'Team Orders: Extra 20% OFF',
    discount: '20%',
    validTime: '11 AM - 2 PM',
    category: 'Food & Dining',
    description: 'Bulk orders for team lunches at discounted rates',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  },
  {
    id: 'corp4',
    store: 'Cult.fit',
    title: 'Corporate Fitness: 30% OFF',
    discount: '30%',
    category: 'Fitness',
    description: 'Group fitness plans for your team',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
  },
  {
    id: 'corp5',
    store: 'Starbucks',
    title: 'Coffee Break: Buy 3 Get 1',
    discount: 'BOGO',
    validTime: '3 PM - 5 PM',
    category: 'Food & Dining',
    description: 'Perfect for team coffee breaks',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400',
  },
  {
    id: 'corp6',
    store: 'MakeMyTrip',
    title: 'Business Travel: 15% OFF',
    discount: '15%',
    category: 'Travel',
    description: 'Corporate rates on flights and hotels',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400',
  },
];

const TIME_SLOTS = [
  { id: 'all', label: 'All Day', icon: '🕐', time: '' },
  { id: 'morning', label: 'Morning', icon: '🌅', time: '9 AM - 12 PM' },
  { id: 'lunch', label: 'Lunch', icon: '🍽️', time: '12 PM - 3 PM' },
  { id: 'evening', label: 'Evening', icon: '🌆', time: 'After 6 PM' },
];

const QUICK_CATEGORIES = [
  { icon: 'cafe', label: 'Coffee', color: '#F59E0B' },
  { icon: 'restaurant', label: 'Lunch', color: '#F97316' },
  { icon: 'car', label: 'Commute', color: '#3B82F6' },
  { icon: 'barbell', label: 'Fitness', color: Colors.success },
];

export default function EmployeeZonePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedTime, setSelectedTime] = useState('all');
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const filteredDeals =
    selectedTime === 'all'
      ? DUMMY_CORPORATE_DEALS
      : DUMMY_CORPORATE_DEALS.filter((d) => {
          if (selectedTime === 'lunch' && d.validTime?.includes('12 PM')) return true;
          if (selectedTime === 'evening' && d.validTime?.includes('6 PM')) return true;
          return false;
        });

  const handleDealPress = (deal: CorporateDeal) => {
    // TODO: Navigate to deal detail
    console.log('Deal pressed:', deal.id);
  };

  const renderDealCard = (deal: CorporateDeal) => (
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
          {deal.validTime && (
            <View style={styles.tag}>
              <Ionicons name="time-outline" size={12} color={Colors.text.secondary} />
              <ThemedText style={styles.tagText}>{deal.validTime}</ThemedText>
            </View>
          )}
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>🏢 Corporate</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#475569" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#475569', '#334155', '#1E293B']}
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
              <ThemedText style={styles.headerTitle}>Corporate Perks</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Office hour specials & team deals</ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.emoji}>🏢</ThemedText>
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
            colors={['rgba(71, 85, 105, 0.3)', 'rgba(51, 65, 85, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="business" size={32} color="#94A3B8" />
              </View>
              <View style={styles.heroTextContainer}>
                <ThemedText style={styles.heroTitle}>Work Smarter, Save Better</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Exclusive deals for working professionals
                </ThemedText>
              </View>
            </View>

            {/* Current Time Indicator */}
            <View style={styles.timeIndicator}>
              <Ionicons name="time" size={20} color={Colors.success} />
              <View style={styles.timeIndicatorText}>
                <ThemedText style={styles.timeIndicatorTitle}>It's Lunch Time!</ThemedText>
                <ThemedText style={styles.timeIndicatorSubtitle}>Best deals available now</ThemedText>
              </View>
              <View style={styles.liveBadge}>
                <ThemedText style={styles.liveBadgeText}>Live</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Time-based Filter */}
        <View style={styles.timeFilterSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Deals by Time</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Find deals perfect for your schedule</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeScroll}
          >
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.id}
                style={[
                  styles.timeSlot,
                  selectedTime === slot.id && styles.timeSlotActive,
                ]}
                onPress={() => setSelectedTime(slot.id)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.timeSlotIcon}>{slot.icon}</ThemedText>
                <ThemedText
                  style={[
                    styles.timeSlotLabel,
                    selectedTime === slot.id && styles.timeSlotLabelActive,
                  ]}
                >
                  {slot.label}
                </ThemedText>
                {slot.time && (
                  <ThemedText style={styles.timeSlotTime}>{slot.time}</ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Quick Access Categories */}
        <View style={styles.quickCategories}>
          {QUICK_CATEGORIES.map((cat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.quickCategory, { backgroundColor: `${cat.color}15` }]}
              activeOpacity={0.7}
            >
              <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              <ThemedText style={styles.quickCategoryLabel}>{cat.label}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Deals List */}
        <View style={styles.dealsSection}>
          <ThemedText style={styles.sectionTitle}>Available Deals</ThemedText>
          {filteredDeals.map((deal) => renderDealCard(deal))}
        </View>

        {/* Team Orders Section */}
        <View style={styles.teamOrdersCard}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.teamOrdersGradient}
          >
            <ThemedText style={styles.teamOrdersIcon}>👥</ThemedText>
            <View style={styles.teamOrdersContent}>
              <ThemedText style={styles.teamOrdersTitle}>Team Orders</ThemedText>
              <ThemedText style={styles.teamOrdersSubtitle}>
                Order for your team & get extra discounts
              </ThemedText>
            </View>
            <TouchableOpacity style={styles.teamOrdersButton} activeOpacity={0.8}>
              <ThemedText style={styles.teamOrdersButtonText}>Explore</ThemedText>
            </TouchableOpacity>
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
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <ThemedText style={styles.ctaButtonText}>
              Connect Work Email for More Deals
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
    borderColor: 'rgba(71, 85, 105, 0.2)',
    borderRadius: BorderRadius['2xl'],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(148, 163, 184, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  timeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: Spacing.sm,
  },
  timeIndicatorText: {
    flex: 1,
  },
  timeIndicatorTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  timeIndicatorSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  liveBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  liveBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timeFilterSection: {
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
    marginBottom: 4,
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  timeScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  timeSlot: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[100],
    minWidth: 90,
  },
  timeSlotActive: {
    backgroundColor: 'rgba(71, 85, 105, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
  },
  timeSlotIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  timeSlotLabel: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
  },
  timeSlotLabelActive: {
    color: '#FFFFFF',
  },
  timeSlotTime: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  quickCategories: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickCategory: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  quickCategoryLabel: {
    ...Typography.caption,
    color: Colors.text.secondary,
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
    width: 96,
    height: 96,
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
    backgroundColor: 'rgba(71, 85, 105, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    ...Typography.labelSmall,
    color: '#94A3B8',
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
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  teamOrdersCard: {
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  teamOrdersGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: BorderRadius.lg,
    gap: Spacing.md,
  },
  teamOrdersIcon: {
    fontSize: 32,
  },
  teamOrdersContent: {
    flex: 1,
  },
  teamOrdersTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  teamOrdersSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  teamOrdersButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  teamOrdersButtonText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '600',
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
