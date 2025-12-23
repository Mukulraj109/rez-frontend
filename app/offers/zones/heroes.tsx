/**
 * Heroes/Special Profiles Page
 * Redesigned special profiles page for Army/Healthcare/Teachers/Seniors
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

interface ProfileDeal {
  id: string;
  store: string;
  title: string;
  discount: string;
  category: string;
  storeLogo?: string;
}

interface SpecialProfile {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  gradientColors: string[];
  eligibility: string;
  deals: ProfileDeal[];
}

const SPECIAL_PROFILES: SpecialProfile[] = [
  {
    id: 'army',
    title: 'Defence Personnel',
    icon: '🪖',
    subtitle: 'Exclusive discounts for our heroes',
    gradientColors: ['#059669', '#047857', '#065F46'],
    eligibility: 'Valid defence ID card required',
    deals: [
      {
        id: 'army1',
        store: 'PVR Cinemas',
        title: '25% OFF on all movies',
        discount: '25%',
        category: 'Entertainment',
        storeLogo: 'https://logo.clearbit.com/pvrcinemas.com',
      },
      {
        id: 'army2',
        store: 'Shoppers Stop',
        title: '20% OFF Storewide',
        discount: '20%',
        category: 'Shopping',
        storeLogo: 'https://logo.clearbit.com/shoppersstop.com',
      },
      {
        id: 'army3',
        store: 'Tanishq',
        title: '15% OFF on Jewellery',
        discount: '15%',
        category: 'Jewellery',
        storeLogo: 'https://logo.clearbit.com/tanishq.co.in',
      },
      {
        id: 'army4',
        store: 'MakeMyTrip',
        title: 'Defence Fare: Extra 10% OFF',
        discount: '10%',
        category: 'Travel',
        storeLogo: 'https://logo.clearbit.com/makemytrip.com',
      },
    ],
  },
  {
    id: 'healthcare',
    title: 'Healthcare Workers',
    icon: '🩺',
    subtitle: 'Thank you for your service',
    gradientColors: ['#0EA5E9', '#0284C7', '#0369A1'],
    eligibility: 'Valid hospital/clinic ID required',
    deals: [
      {
        id: 'health1',
        store: 'Reliance Fresh',
        title: '15% OFF on Groceries',
        discount: '15%',
        category: 'Grocery',
        storeLogo: 'https://logo.clearbit.com/relianceretail.com',
      },
      {
        id: 'health2',
        store: 'DMart',
        title: 'Priority Checkout + 10% OFF',
        discount: '10%',
        category: 'Shopping',
        storeLogo: 'https://logo.clearbit.com/dmartindia.com',
      },
      {
        id: 'health3',
        store: 'Uber',
        title: 'Healthcare Heroes: 20% OFF',
        discount: '20%',
        category: 'Transport',
        storeLogo: 'https://logo.clearbit.com/uber.com',
      },
      {
        id: 'health4',
        store: 'Zomato',
        title: 'Frontline Meals: 25% OFF',
        discount: '25%',
        category: 'Food',
        storeLogo: 'https://logo.clearbit.com/zomato.com',
      },
    ],
  },
  {
    id: 'senior',
    title: 'Senior Citizens',
    icon: '👴',
    subtitle: 'Special care for our elders',
    gradientColors: ['#F59E0B', '#D97706', '#B45309'],
    eligibility: 'Age 60+ with valid ID proof',
    deals: [
      {
        id: 'senior1',
        store: 'Apollo Pharmacy',
        title: '20% OFF on Medicines',
        discount: '20%',
        category: 'Healthcare',
        storeLogo: 'https://logo.clearbit.com/apollopharmacy.in',
      },
      {
        id: 'senior2',
        store: 'Big Bazaar',
        title: 'Senior Day: Extra 10% OFF',
        discount: '10%',
        category: 'Shopping',
        storeLogo: 'https://logo.clearbit.com/bigbazaar.com',
      },
      {
        id: 'senior3',
        store: 'IRCTC',
        title: 'Senior Concession Available',
        discount: '40%',
        category: 'Travel',
        storeLogo: 'https://logo.clearbit.com/irctc.co.in',
      },
    ],
  },
  {
    id: 'teacher',
    title: 'Teachers & Educators',
    icon: '📚',
    subtitle: 'For those who shape minds',
    gradientColors: ['#8B5CF6', '#7C3AED', '#6D28D9'],
    eligibility: 'Valid teacher ID required',
    deals: [
      {
        id: 'teach1',
        store: 'Amazon',
        title: 'Books & Stationery: 30% OFF',
        discount: '30%',
        category: 'Shopping',
        storeLogo: 'https://logo.clearbit.com/amazon.in',
      },
      {
        id: 'teach2',
        store: 'Apple',
        title: 'Education Pricing',
        discount: '10%',
        category: 'Electronics',
        storeLogo: 'https://logo.clearbit.com/apple.com',
      },
    ],
  },
];

export default function HeroesZonePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [verifiedProfiles, setVerifiedProfiles] = useState<string[]>([]);
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const handleVerify = (profileId: string) => {
    // TODO: Implement verification flow
    setVerifiedProfiles([...verifiedProfiles, profileId]);
  };

  const handleDealPress = (deal: ProfileDeal) => {
    // TODO: Navigate to deal detail
    console.log('Deal pressed:', deal.id);
  };

  const renderProfileCard = (profile: SpecialProfile) => {
    const isVerified = verifiedProfiles.includes(profile.id);
    const isExpanded = selectedProfile === profile.id;

    return (
      <View key={profile.id} style={styles.profileCard}>
        {/* Profile Header */}
        <TouchableOpacity
          onPress={() => setSelectedProfile(isExpanded ? null : profile.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={profile.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.profileHeader,
              isExpanded && styles.profileHeaderExpanded,
            ]}
          >
            <ThemedText style={styles.profileIcon}>{profile.icon}</ThemedText>
            <View style={styles.profileHeaderContent}>
              <View style={styles.profileTitleRow}>
                <ThemedText style={styles.profileTitle}>{profile.title}</ThemedText>
                {isVerified && (
                  <Ionicons name="checkmark-circle" size={16} color="#FFFFFF" />
                )}
              </View>
              <ThemedText style={styles.profileSubtitle}>{profile.subtitle}</ThemedText>
            </View>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="rgba(255, 255, 255, 0.7)"
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.profileContent}>
            {/* Verification Status */}
            {!isVerified ? (
              <View style={styles.verificationCard}>
                <View style={styles.verificationContent}>
                  <Ionicons name="cloud-upload" size={20} color="#F59E0B" />
                  <View style={styles.verificationText}>
                    <ThemedText style={styles.verificationTitle}>
                      Verification Required
                    </ThemedText>
                    <ThemedText style={styles.verificationSubtitle}>
                      {profile.eligibility}
                    </ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={() => handleVerify(profile.id)}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.verifyButtonText}>Verify</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.verifiedCard}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                <ThemedText style={styles.verifiedText}>Verified - Access Granted</ThemedText>
              </View>
            )}

            {/* Deals List */}
            <ThemedText style={styles.dealsTitle}>Available Deals</ThemedText>
            <View style={styles.dealsList}>
              {profile.deals.map((deal) => (
                <TouchableOpacity
                  key={deal.id}
                  style={[
                    styles.dealItem,
                    !isVerified && styles.dealItemDisabled,
                  ]}
                  onPress={() => handleDealPress(deal)}
                  disabled={!isVerified}
                  activeOpacity={0.7}
                >
                  {deal.storeLogo ? (
                    <Image
                      source={{ uri: deal.storeLogo }}
                      style={styles.dealLogo}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.dealLogoPlaceholder}>
                      <Ionicons name="storefront" size={20} color={Colors.text.tertiary} />
                    </View>
                  )}
                  <View style={styles.dealItemContent}>
                    <ThemedText style={styles.dealItemStore}>{deal.store}</ThemedText>
                    <ThemedText style={styles.dealItemTitle}>{deal.title}</ThemedText>
                  </View>
                  <View style={styles.dealItemDiscount}>
                    <ThemedText style={styles.dealItemDiscountText}>{deal.discount}</ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {!isVerified && (
              <ThemedText style={styles.verificationHint}>
                Verify your profile to unlock these exclusive deals
              </ThemedText>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#6366F1', '#4F46E5', '#4338CA']}
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
              <ThemedText style={styles.headerTitle}>Special Profiles</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Exclusive access for verified members
              </ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.emoji}>🎖️</ThemedText>
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
            colors={['rgba(99, 102, 241, 0.3)', 'rgba(139, 92, 246, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="shield-checkmark" size={32} color="#818CF8" />
              </View>
              <View style={styles.heroTextContainer}>
                <ThemedText style={styles.heroTitle}>Honoring Our Heroes</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Exclusive deals for special community members
                </ThemedText>
              </View>
            </View>

            {/* Profile Icons Grid */}
            <View style={styles.profileIconsGrid}>
              {SPECIAL_PROFILES.map((profile) => (
                <View key={profile.id} style={styles.profileIconCard}>
                  <ThemedText style={styles.profileIconEmoji}>{profile.icon}</ThemedText>
                  <ThemedText style={styles.profileIconLabel}>
                    {profile.title.split(' ')[0]}
                  </ThemedText>
                </View>
              ))}
            </View>
          </LinearGradient>
        </View>

        {/* Profile Cards */}
        <View style={styles.profilesSection}>
          {SPECIAL_PROFILES.map((profile) => renderProfileCard(profile))}
        </View>

        {/* Support Message */}
        <View style={styles.supportCard}>
          <ThemedText style={styles.supportText}>
            Don't see your category?{' '}
            <ThemedText style={styles.supportLink}>Contact us</ThemedText> to request special
            profile verification.
          </ThemedText>
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
              Apply for Special Profile Verification
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
    borderColor: 'rgba(99, 102, 241, 0.2)',
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
    backgroundColor: 'rgba(129, 140, 248, 0.3)',
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
    marginBottom: 2,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  profileIconsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.base,
  },
  profileIconCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  profileIconEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  profileIconLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  profilesSection: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.md,
  },
  profileCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.base,
  },
  profileHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  profileIcon: {
    fontSize: 32,
  },
  profileHeaderContent: {
    flex: 1,
  },
  profileTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },
  profileTitle: {
    ...Typography.h4,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  profileSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  profileContent: {
    backgroundColor: Colors.background.primary,
    padding: Spacing.base,
  },
  verificationCard: {
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: Spacing.base,
  },
  verificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  verificationText: {
    flex: 1,
  },
  verificationTitle: {
    ...Typography.body,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  verificationSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  verifyButton: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  verifyButtonText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(46, 204, 113, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(46, 204, 113, 0.2)',
    marginBottom: Spacing.base,
    gap: Spacing.sm,
  },
  verifiedText: {
    ...Typography.bodySmall,
    color: Colors.success,
  },
  dealsTitle: {
    ...Typography.label,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  dealsList: {
    gap: Spacing.sm,
  },
  dealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    gap: Spacing.md,
  },
  dealItemDisabled: {
    opacity: 0.5,
  },
  dealLogo: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.primary,
  },
  dealLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealItemContent: {
    flex: 1,
  },
  dealItemStore: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  dealItemTitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  dealItemDiscount: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  dealItemDiscountText: {
    ...Typography.labelSmall,
    color: '#6366F1',
    fontWeight: '700',
  },
  verificationHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.base,
  },
  supportCard: {
    margin: Spacing.base,
    padding: Spacing.base,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  supportText: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  supportLink: {
    color: '#6366F1',
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
