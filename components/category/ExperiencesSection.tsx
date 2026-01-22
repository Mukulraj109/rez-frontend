/**
 * ExperiencesSection Component
 * Displays food experiences like dining events, chef's tables, food walks
 * Used in FoodDiningCategoryPage experiences tab
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRegion } from '@/contexts/RegionContext';

interface ExperiencesSectionProps {
  categorySlug: string;
}

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

const EXPERIENCES = [
  {
    id: '1',
    title: "Chef's Table Experience",
    description: 'Exclusive 7-course meal with the chef',
    price: '2,999',
    originalPrice: '4,999',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400',
    rating: 4.9,
    reviews: 128,
    cashback: 15,
    tag: 'Premium',
  },
  {
    id: '2',
    title: 'Food Walk Tour',
    description: 'Explore local street food gems',
    price: '499',
    originalPrice: '799',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    rating: 4.7,
    reviews: 256,
    cashback: 10,
    tag: 'Popular',
  },
  {
    id: '3',
    title: 'Cooking Masterclass',
    description: 'Learn from award-winning chefs',
    price: '1,499',
    originalPrice: '2,499',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400',
    rating: 4.8,
    reviews: 89,
    cashback: 12,
    tag: 'New',
  },
  {
    id: '4',
    title: 'Wine & Dine Evening',
    description: 'Curated wine pairing dinner',
    price: '3,499',
    originalPrice: '5,999',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400',
    rating: 4.9,
    reviews: 67,
    cashback: 18,
    tag: 'Exclusive',
  },
];

const EXPERIENCE_TYPES = [
  { id: 'dining', name: 'Fine Dining', icon: '🍽️', count: 24 },
  { id: 'cooking', name: 'Cooking Classes', icon: '👨‍🍳', count: 18 },
  { id: 'tours', name: 'Food Tours', icon: '🚶', count: 12 },
  { id: 'events', name: 'Food Events', icon: '🎉', count: 8 },
  { id: 'private', name: 'Private Chef', icon: '👑', count: 6 },
];

export default function ExperiencesSection({ categorySlug }: ExperiencesSectionProps) {
  const router = useRouter();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();

  const handleExperiencePress = (experience: typeof EXPERIENCES[0]) => {
    router.push(`/experience/${experience.id}`);
  };

  return (
    <View style={styles.container}>
      {/* Experience Banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.2)', 'rgba(249, 115, 22, 0.2)']}
          style={styles.bannerGradient}
        >
          <Text style={styles.bannerTitle}>Not just food. Experiences.</Text>
          <Text style={styles.bannerSubtitle}>Worth remembering.</Text>
        </LinearGradient>
      </View>

      {/* Experience Types */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={20} color="#F59E0B" />
          <Text style={styles.sectionTitle}>Explore Experiences</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typesList}>
          {EXPERIENCE_TYPES.map((type) => (
            <TouchableOpacity key={type.id} style={styles.typeCard}>
              <Text style={styles.typeIcon}>{type.icon}</Text>
              <Text style={styles.typeName}>{type.name}</Text>
              <Text style={styles.typeCount}>{type.count} available</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Featured Experiences */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>⭐</Text>
          <Text style={styles.sectionTitle}>Featured Experiences</Text>
          <TouchableOpacity onPress={() => router.push(`/experiences?category=${categorySlug}`)}>
            <Text style={styles.sectionSeeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.experiencesList}>
          {EXPERIENCES.map((experience) => (
            <TouchableOpacity
              key={experience.id}
              style={styles.experienceCard}
              onPress={() => handleExperiencePress(experience)}
            >
              <Image source={{ uri: experience.image }} style={styles.experienceImage} resizeMode="cover" />
              <LinearGradient colors={['transparent', 'rgba(0,0,0,0.8)']} style={styles.experienceGradient} />

              {experience.tag && (
                <View style={styles.experienceTag}>
                  <Text style={styles.experienceTagText}>{experience.tag}</Text>
                </View>
              )}

              <View style={styles.experienceContent}>
                <Text style={styles.experienceTitle} numberOfLines={1}>{experience.title}</Text>
                <Text style={styles.experienceDescription} numberOfLines={1}>{experience.description}</Text>

                <View style={styles.experienceFooter}>
                  <View style={styles.experiencePricing}>
                    <Text style={styles.experiencePrice}>{currencySymbol}{experience.price}</Text>
                    <Text style={styles.experienceOriginalPrice}>{currencySymbol}{experience.originalPrice}</Text>
                  </View>
                  <View style={styles.experienceRating}>
                    <Ionicons name="star" size={12} color={COLORS.primaryGold} />
                    <Text style={styles.experienceRatingText}>{experience.rating}</Text>
                  </View>
                </View>

                <View style={styles.cashbackBadge}>
                  <Ionicons name="gift" size={12} color={COLORS.primaryGreen} />
                  <Text style={styles.cashbackText}>{experience.cashback}% Cashback</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Why Book Experiences */}
      <View style={styles.whySection}>
        <Text style={styles.whyTitle}>Why Book with ReZ?</Text>
        <View style={styles.whyGrid}>
          {[
            { icon: '💰', title: 'Earn Cashback', description: 'Up to 20% on experiences' },
            { icon: '✅', title: 'Verified', description: 'Quality assured venues' },
            { icon: '🎁', title: 'Bonus Rewards', description: 'Extra coins on booking' },
            { icon: '💳', title: 'Easy Refunds', description: 'Hassle-free cancellation' },
          ].map((item, index) => (
            <View key={index} style={styles.whyItem}>
              <Text style={styles.whyIcon}>{item.icon}</Text>
              <Text style={styles.whyItemTitle}>{item.title}</Text>
              <Text style={styles.whyItemDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionSeeAll: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  typesList: {
    gap: 12,
    paddingRight: 16,
  },
  typeCard: {
    width: 100,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  typeCount: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },
  experiencesList: {
    gap: 16,
  },
  experienceCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  experienceImage: {
    width: '100%',
    height: '100%',
  },
  experienceGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
  },
  experienceTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.primaryGold,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  experienceContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  experienceTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  experienceDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  experienceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experiencePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  experiencePrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  experienceOriginalPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textDecorationLine: 'line-through',
  },
  experienceRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  experienceRatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 192, 106, 0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  whySection: {
    margin: 16,
    marginTop: 24,
    padding: 20,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  whyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  whyItem: {
    width: '47%',
    alignItems: 'center',
    padding: 12,
  },
  whyIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  whyItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  whyItemDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
