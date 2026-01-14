/**
 * Shop by Experience Section - Production Ready
 * Fetches experiences from backend API
 * Curated shopping experiences with 3x3 grid layout
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { experiencesApi, StoreExperience } from '@/services/experiencesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_WIDTH = (SCREEN_WIDTH - 32 - CARD_GAP * 2) / 3;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
  green50: '#F0FDF4',
  purple50: '#FAF5FF',
  green200: '#BBF7D0',
};

// Fallback gradient colors for experience types
const getGradientColors = (type: string): string[] => {
  const gradients: Record<string, string[]> = {
    'sample-trial': ['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.1)'],
    '60-min-delivery': ['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)'],
    'fastDelivery': ['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)'],
    'luxury': ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)'],
    'premium': ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)'],
    'organic': ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)'],
    'men': ['rgba(107, 114, 128, 0.2)', 'rgba(100, 116, 139, 0.1)'],
    'women': ['rgba(236, 72, 153, 0.2)', 'rgba(244, 63, 94, 0.1)'],
    'children': ['rgba(234, 179, 8, 0.2)', 'rgba(245, 158, 11, 0.1)'],
    'rental': ['rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.1)'],
    'gifting': ['rgba(239, 68, 68, 0.2)', 'rgba(236, 72, 153, 0.1)'],
    'budgetFriendly': ['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)'],
    'oneRupee': ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)'],
  };
  return gradients[type] || ['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.1)'];
};

// Fallback experiences (used if API fails)
const FALLBACK_EXPERIENCES = [
  {
    slug: 'sample-trial',
    title: 'Sample/Trial Store',
    subtitle: 'Try before you buy',
    icon: '🧪',
    gradientColors: ['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.1)'],
  },
  {
    slug: '60-min-delivery',
    title: '60 Min Delivery',
    subtitle: 'Ultra-fast delivery',
    icon: '⚡',
    gradientColors: ['rgba(249, 115, 22, 0.2)', 'rgba(239, 68, 68, 0.1)'],
  },
  {
    slug: 'luxury',
    title: 'Luxury Store',
    subtitle: 'Premium brands',
    icon: '💎',
    gradientColors: ['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.1)'],
  },
  {
    slug: 'organic',
    title: 'Organic Store',
    subtitle: '100% natural',
    icon: '🌿',
    gradientColors: ['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.1)'],
  },
  {
    slug: 'men',
    title: 'Men Store',
    subtitle: 'For modern men',
    icon: '👔',
    gradientColors: ['rgba(107, 114, 128, 0.2)', 'rgba(100, 116, 139, 0.1)'],
  },
  {
    slug: 'women',
    title: 'Women Store',
    subtitle: 'Curated for her',
    icon: '👗',
    gradientColors: ['rgba(236, 72, 153, 0.2)', 'rgba(244, 63, 94, 0.1)'],
  },
  {
    slug: 'children',
    title: 'Children Store',
    subtitle: 'Kids essentials',
    icon: '🧸',
    gradientColors: ['rgba(234, 179, 8, 0.2)', 'rgba(245, 158, 11, 0.1)'],
  },
  {
    slug: 'rental',
    title: 'Rental Store',
    subtitle: 'Rent not buy',
    icon: '🔄',
    gradientColors: ['rgba(99, 102, 241, 0.2)', 'rgba(59, 130, 246, 0.1)'],
  },
  {
    slug: 'gifting',
    title: 'Gifting Store',
    subtitle: 'Perfect presents',
    icon: '🎁',
    gradientColors: ['rgba(239, 68, 68, 0.2)', 'rgba(236, 72, 153, 0.1)'],
  },
];

const ShopByExperienceSection: React.FC = () => {
  const router = useRouter();
  const [experiences, setExperiences] = useState<StoreExperience[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        const response = await experiencesApi.getExperiences({ limit: 20 });

        if (response.success && response.data && response.data.experiences.length > 0) {
          setExperiences(response.data.experiences);
        } else {
          // Use fallback data if API fails
          setExperiences(FALLBACK_EXPERIENCES as any);
        }
      } catch (error) {
        console.error('❌ [ShopByExperienceSection] Error fetching experiences:', error);
        // Use fallback data on error
        setExperiences(FALLBACK_EXPERIENCES as any);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handlePress = (slug: string) => {
    router.push(`/experience/${slug}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛍️ Shop by Experience</Text>
        <Text style={styles.headerSubtitle}>Curated shopping experiences</Text>
      </View>

      {/* Experience Grid */}
      <View style={styles.grid}>
        {experiences.map((exp) => (
          <TouchableOpacity
            key={exp.id}
            style={styles.cardWrapper}
            onPress={() => handlePress(exp.path)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={exp.gradientColors as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.card}
            >
              <Text style={styles.cardIcon}>{exp.icon}</Text>
              <Text style={styles.cardTitle} numberOfLines={2}>{exp.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={1}>{exp.subtitle}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Banner */}
      <LinearGradient
        colors={['#F0FDF4', '#FAF5FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.banner}
      >
        <Text style={styles.bannerText}>
          ✨ <Text style={styles.bannerBold}>All experiences</Text> come with ReZ cashback & coins
        </Text>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  loadingContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  cardWrapper: {
    width: CARD_WIDTH,
  },
  card: {
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 100,
  },
  cardIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.navy,
    textAlign: 'center',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 9,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  banner: {
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.green200,
  },
  bannerText: {
    fontSize: 12,
    color: COLORS.navy,
    textAlign: 'center',
  },
  bannerBold: {
    fontWeight: '600',
  },
});

export default ShopByExperienceSection;
