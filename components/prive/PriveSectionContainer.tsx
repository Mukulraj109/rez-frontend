/**
 * PriveSectionContainer - Main container for Privé tab content
 * Brings together all Privé components in a scrollable layout
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { usePriveSection } from '@/hooks/usePriveSection';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from './priveTheme';

// Import all Privé components (PriveMemberCard moved to header in index.tsx)
import { PriveHabitLoops } from './PriveHabitLoops';
import { PriveHighlightsSection } from './PriveHighlightsSection';
import { PriveBalanceCard } from './PriveBalanceCard';
import { PriveQuickActions } from './PriveQuickActions';
import { PrivePillarGrid } from './PrivePillarGrid';
import { PriveOffersCarousel } from './PriveOffersCarousel';
import { PriveActivitySummary } from './PriveActivitySummary';
import { PriveHowItWorks } from './PriveHowItWorks';
import { PriveConciergeCard } from './PriveConciergeCard';
import PriveHeroBanner from './PriveHeroBanner';

export const PriveSectionContainer: React.FC = () => {
  const {
    userData,
    eligibility,
    featuredOffers,
    highlights,
    dailyProgress,
    isLoading,
    isRefreshing,
    error,
    refresh,
    checkIn,
    trackOfferClick,
  } = usePriveSection();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#1F2937', '#111827', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
        />
        <ActivityIndicator size="large" color={PRIVE_COLORS.gold.primary} />
        <Text style={styles.loadingText}>Loading Privé...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <LinearGradient
          colors={['#1F2937', '#111827', '#0A0A0A']}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.errorText}>⚠️ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.outerContainer}>
      {/* Dark Privé Gradient Background */}
      <LinearGradient
        colors={['#1F2937', '#111827', '#0A0A0A']}
        style={styles.gradientBackground}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={PRIVE_COLORS.gold.primary}
            colors={[PRIVE_COLORS.gold.primary]}
          />
        }
      >
        {/* Hero Banner - Premium carousel (member card moved to header) */}
        <PriveHeroBanner />

        {/* Daily Habit Loops Section */}
        <PriveHabitLoops
          isCheckedIn={dailyProgress.isCheckedIn}
          streak={dailyProgress.streak}
          weeklyEarnings={dailyProgress.weeklyEarnings}
          loops={dailyProgress.loops}
          onCheckIn={checkIn}
        />

        {/* Today's Highlights */}
        <PriveHighlightsSection highlights={highlights} />

        {/* Coin Balance Card */}
        <PriveBalanceCard
          totalCoins={userData.totalCoins}
          rezCoins={userData.rezCoins}
          priveCoins={userData.priveCoins}
          brandedCoins={userData.brandedCoins}
          monthlyEarnings={userData.monthlyEarnings}
        />

        {/* Quick Actions */}
        <PriveQuickActions />

        {/* 6-Pillar Grid */}
        <PrivePillarGrid
          pillars={userData.pillars}
          totalScore={userData.totalScore}
          tier={eligibility.tier}
          accessState={userData.accessState}
        />

        {/* Featured Offers Carousel */}
        <PriveOffersCarousel
          offers={featuredOffers}
          onViewAll={() => {}}
        />

        {/* Activity Summary */}
        <PriveActivitySummary
          activeCampaigns={userData.activeCampaigns}
          completedCampaigns={userData.completedCampaigns}
          avgRating={4.9}
        />

        {/* How It Works */}
        <PriveHowItWorks />

        {/* Concierge CTA */}
        <PriveConciergeCard />

        {/* Bottom Spacing */}
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  gradientBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  welcomeSection: {
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingTop: PRIVE_SPACING.lg,
    paddingBottom: PRIVE_SPACING.sm,
  },
  welcomeText: {
    fontSize: 15,
    color: PRIVE_COLORS.text.secondary,
  },
  welcomeName: {
    color: PRIVE_COLORS.gold.primary,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  loadingText: {
    marginTop: PRIVE_SPACING.lg,
    fontSize: 14,
    color: PRIVE_COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 400,
  },
  errorText: {
    fontSize: 14,
    color: PRIVE_COLORS.status.error,
    textAlign: 'center',
  },
  bottomSpace: {
    height: PRIVE_SPACING.xxxl,
  },
});

export default PriveSectionContainer;
