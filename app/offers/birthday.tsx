/**
 * Birthday Specials Page
 * Redesigned birthday rewards page
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

interface BirthdayDeal {
  id: string;
  store: string;
  title: string;
  discount: string;
  description: string;
  image?: string;
}

const DUMMY_BIRTHDAY_DEALS: BirthdayDeal[] = [
  {
    id: 'bday1',
    store: 'Baskin Robbins',
    title: 'FREE Ice Cream Cake',
    discount: 'FREE',
    description: 'Celebrate with a complimentary ice cream cake',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400',
  },
  {
    id: 'bday2',
    store: 'PVR Cinemas',
    title: 'FREE Movie Ticket',
    discount: 'FREE',
    description: 'Watch any movie on us',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
  },
  {
    id: 'bday3',
    store: 'ReZ',
    title: '500 Bonus ReZ Coins',
    discount: '500 🪙',
    description: 'Birthday gift from ReZ',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400',
  },
  {
    id: 'bday4',
    store: "Domino's",
    title: 'FREE Medium Pizza',
    discount: 'FREE',
    description: 'Birthday pizza on the house',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    id: 'bday5',
    store: 'Starbucks',
    title: 'FREE Birthday Drink',
    discount: 'FREE',
    description: 'Any handcrafted beverage on your birthday',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
  },
  {
    id: 'bday6',
    store: 'Sephora',
    title: 'Birthday Beauty Gift',
    discount: 'FREE',
    description: 'Exclusive birthday beauty kit',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400',
  },
];

export default function BirthdayRewardsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [birthdayActive, setBirthdayActive] = useState(true);
  const [birthdayDate] = useState('December 25');
  const [daysUntil] = useState(4);
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const handleClaimGift = (deal: BirthdayDeal) => {
    // TODO: Implement claim functionality
  };

  const renderGiftCard = (deal: BirthdayDeal) => (
    <View key={deal.id} style={styles.giftCard}>
      {/* Gift Ribbon */}
      <View style={styles.giftRibbon}>
        <ThemedText style={styles.giftRibbonText}>FREE</ThemedText>
      </View>

      <View style={styles.giftContent}>
        {deal.image && (
          <Image source={{ uri: deal.image }} style={styles.giftImage} resizeMode="cover" />
        )}
        <View style={styles.giftInfo}>
          <View style={styles.giftHeader}>
            <View style={styles.giftStoreInfo}>
              <ThemedText style={styles.giftStore}>{deal.store || 'ReZ'}</ThemedText>
              <ThemedText style={styles.giftTitle}>{deal.title}</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.giftDescription}>{deal.description}</ThemedText>

          <View style={styles.giftTags}>
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>🎂 Birthday Gift</ThemedText>
            </View>
          </View>

          <TouchableOpacity
            style={styles.claimButton}
            onPress={() => handleClaimGift(deal)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#F59E0B', '#EA580C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.claimGradient}
            >
              <ThemedText style={styles.claimButtonText}>Claim Gift</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#F59E0B" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#F59E0B', '#EA580C', '#DC2626']}
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
              <ThemedText style={styles.headerTitle}>Birthday Specials</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Your special day rewards</ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.emoji}>🎂</ThemedText>
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
            colors={['rgba(245, 158, 11, 0.3)', 'rgba(236, 72, 153, 0.2)', 'rgba(220, 38, 38, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradient}
          >
            {birthdayActive ? (
              <View style={styles.heroContent}>
                <View style={styles.birthdayActiveBadge}>
                  <Ionicons name="gift" size={20} color="#F472B6" />
                  <ThemedText style={styles.birthdayActiveText}>Birthday Week Active!</ThemedText>
                </View>

                <ThemedText style={styles.heroTitle}>Happy Birthday! 🎉</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Enjoy exclusive gifts & rewards this week
                </ThemedText>

                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <ThemedText style={styles.heroStatValue}>{DUMMY_BIRTHDAY_DEALS.length}</ThemedText>
                    <ThemedText style={styles.heroStatLabel}>Free Gifts</ThemedText>
                  </View>
                  <View style={styles.heroStat}>
                    <ThemedText style={[styles.heroStatValue, { color: '#F472B6' }]}>500</ThemedText>
                    <ThemedText style={styles.heroStatLabel}>Bonus Coins</ThemedText>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.birthdayCountdown}>
                <View style={styles.countdownIcon}>
                  <Ionicons name="calendar" size={28} color="#A78BFA" />
                </View>
                <View style={styles.countdownContent}>
                  <ThemedText style={styles.countdownTitle}>
                    Your birthday: {birthdayDate}
                  </ThemedText>
                  <ThemedText style={styles.countdownSubtitle}>
                    {daysUntil} days until your special day
                  </ThemedText>
                </View>
                <TouchableOpacity style={styles.updateButton} activeOpacity={0.8}>
                  <ThemedText style={styles.updateButtonText}>Update</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        </View>

        {/* Birthday Gifts */}
        <View style={styles.giftsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="gift" size={20} color="#F59E0B" />
              <ThemedText style={styles.sectionTitle}>Your Birthday Gifts</ThemedText>
            </View>
            <ThemedText style={styles.sectionSubtitle}>Claim within your birthday week</ThemedText>
          </View>

          {DUMMY_BIRTHDAY_DEALS.map((deal) => renderGiftCard(deal))}
        </View>

        {/* Bonus Coins Card */}
        <View style={styles.bonusCoinsCard}>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.2)', 'rgba(234, 179, 8, 0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bonusCoinsGradient}
          >
            <View style={styles.bonusCoinsIcon}>
              <ThemedText style={styles.coinEmoji}>🪙</ThemedText>
            </View>
            <View style={styles.bonusCoinsContent}>
              <ThemedText style={styles.bonusCoinsValue}>500 Bonus Coins</ThemedText>
              <ThemedText style={styles.bonusCoinsSubtitle}>
                Auto-credited to your wallet
              </ThemedText>
              <View style={styles.creditedBadge}>
                <ThemedText style={styles.creditedBadgeText}>Credited</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Party Mode */}
        <View style={styles.partyCard}>
          <Ionicons name="balloon" size={24} color="#A78BFA" />
          <View style={styles.partyContent}>
            <ThemedText style={styles.partyTitle}>Share Your Birthday Joy</ThemedText>
            <ThemedText style={styles.partySubtitle}>
              Invite friends & both get bonus coins
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8}>
            <ThemedText style={styles.shareButtonText}>Share</ThemedText>
          </TouchableOpacity>
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
            colors={['#F59E0B', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <Ionicons name="gift" size={20} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
            <ThemedText style={styles.ctaButtonText}>Claim All Birthday Gifts</ThemedText>
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
    borderColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: BorderRadius['2xl'],
  },
  heroContent: {
    alignItems: 'center',
  },
  birthdayActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: Spacing.base,
  },
  birthdayActiveText: {
    ...Typography.labelSmall,
    color: '#F472B6',
    fontWeight: '600',
  },
  heroTitle: {
    ...Typography.h1,
    color: Colors.text.primary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  heroStats: {
    flexDirection: 'row',
    gap: Spacing.base,
  },
  heroStat: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroStatValue: {
    ...Typography.h2,
    color: '#F59E0B',
    fontWeight: '700',
    marginBottom: 2,
  },
  heroStatLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  birthdayCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  countdownIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(167, 139, 250, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownContent: {
    flex: 1,
  },
  countdownTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  countdownSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  updateButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  updateButtonText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  giftsSection: {
    paddingHorizontal: Spacing.base,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  giftCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  giftRibbon: {
    position: 'absolute',
    top: 8,
    right: -24,
    width: 96,
    height: 24,
    backgroundColor: '#F59E0B',
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  giftRibbonText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  giftContent: {
    flexDirection: 'row',
    padding: Spacing.base,
  },
  giftImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    marginRight: Spacing.base,
  },
  giftInfo: {
    flex: 1,
  },
  giftHeader: {
    marginBottom: Spacing.xs,
  },
  giftStoreInfo: {
    marginBottom: Spacing.xs,
  },
  giftStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  giftTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  giftDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  giftTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
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
  claimButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  claimGradient: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  claimButtonText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bonusCoinsCard: {
    margin: Spacing.base,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  bonusCoinsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    borderRadius: BorderRadius.lg,
    gap: Spacing.base,
  },
  bonusCoinsIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinEmoji: {
    fontSize: 32,
  },
  bonusCoinsContent: {
    flex: 1,
  },
  bonusCoinsValue: {
    ...Typography.h2,
    color: '#F59E0B',
    fontWeight: '700',
    marginBottom: 2,
  },
  bonusCoinsSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  creditedBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  creditedBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  partyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    margin: Spacing.base,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  partyContent: {
    flex: 1,
  },
  partyTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  partySubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  shareButton: {
    backgroundColor: Colors.primary[600],
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  shareButtonText: {
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
    flexDirection: 'row',
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
