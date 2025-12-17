/**
 * StoreExperiencesSection Component
 * Displays store experience cards for different store types:
 * - 60-Minute Delivery (fastDelivery)
 * - ₹1 Store (budgetFriendly)
 * - Luxury Store (premium)
 * - Organic Store (organic)
 */

import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { StoreExperienceCard, StoreExperienceCardProps } from './cards/StoreExperienceCard';

// Store experience configurations
const STORE_EXPERIENCES: StoreExperienceCardProps[] = [
  {
    title: '60-Minute Delivery',
    subtitle: 'Fashion, beauty, grocery & essentials',
    icon: '⚡',
    buttonText: 'Shop Now',
    gradientColors: ['#3B82F6', '#1D4ED8'] as const,
    storeType: 'fastDelivery',
    buttonTextColor: '#1D4ED8',
  },
  {
    title: '₹1 Store',
    subtitle: '₹1 products + delivery cashback on sharing',
    icon: '🏷️',
    buttonText: 'Explore Deals',
    gradientColors: ['#F97316', '#EA580C'] as const,
    storeType: 'budgetFriendly',
    buttonTextColor: '#EA580C',
  },
  {
    title: 'Luxury Store',
    subtitle: 'Premium brands with exclusive rewards',
    icon: '👑',
    buttonText: 'Shop Luxury',
    gradientColors: ['#1E293B', '#0F172A'] as const,
    storeType: 'premium',
    buttonTextColor: '#1E293B',
  },
  {
    title: 'Organic Store',
    subtitle: 'Eco-friendly & sustainable products',
    icon: '🌿',
    buttonText: 'Go Green',
    gradientColors: ['#22C55E', '#16A34A'] as const,
    storeType: 'organic',
    buttonTextColor: '#16A34A',
  },
];

interface StoreExperiencesSectionProps {
  showTitle?: boolean;
}

const StoreExperiencesSection: React.FC<StoreExperiencesSectionProps> = memo(({
  showTitle = true,
}) => {
  return (
    <View style={styles.container}>
      {showTitle && (
        <ThemedText style={styles.sectionTitle}>Store Experiences</ThemedText>
      )}
      <View style={styles.cardsContainer}>
        {STORE_EXPERIENCES.map((experience) => (
          <StoreExperienceCard
            key={experience.storeType}
            {...experience}
          />
        ))}
      </View>
    </View>
  );
});

StoreExperiencesSection.displayName = 'StoreExperiencesSection';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1F2937',
  },
  cardsContainer: {
    gap: 4,
  },
});

export { StoreExperiencesSection };
