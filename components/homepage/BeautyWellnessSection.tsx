/**
 * Beauty & Wellness Section - Converted from V2
 * Salon & Spa cards with gradient backgrounds
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
  pink100: '#FCE7F3',
  pink500: '#EC4899',
};

const BeautyWellnessSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/beauty' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💄 Beauty & Wellness</Text>
          <Text style={styles.headerSubtitle}>Pamper yourself, save more</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Cards Row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Salon & Spa Card */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => handlePress('/beauty/salon')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#FDF2F8', '#FCE7F3', '#FBCFE8']}
            style={styles.mainCardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Text style={styles.icon}>🦊</Text>
              </View>
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>30% OFF</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Salon & Spa</Text>
            <Text style={styles.cardSubtitle}>Hair, nails, skin treatments</Text>
            <Text style={styles.partnersText}>350+ Partners</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Beauty Products Card */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => handlePress('/beauty/products')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#F5F3FF', '#EDE9FE', '#DDD6FE']}
            style={styles.mainCardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBoxPurple}>
                <Text style={styles.icon}>💅</Text>
              </View>
              <View style={styles.discountBadgePurple}>
                <Text style={styles.discountText}>25% OFF</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Beauty Products</Text>
            <Text style={styles.cardSubtitle}>Makeup, skincare, haircare</Text>
            <Text style={styles.partnersTextPurple}>500+ Brands</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Wellness Card */}
        <TouchableOpacity
          style={styles.mainCard}
          onPress={() => handlePress('/beauty/wellness')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']}
            style={styles.mainCardGradient}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconBoxGreen}>
                <Text style={styles.icon}>🧘</Text>
              </View>
              <View style={styles.discountBadgeGreen}>
                <Text style={styles.discountText}>20% OFF</Text>
              </View>
            </View>
            <Text style={styles.cardTitle}>Wellness</Text>
            <Text style={styles.cardSubtitle}>Massage, therapy, relaxation</Text>
            <Text style={styles.partnersTextGreen}>200+ Centers</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
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
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  mainCard: {
    width: 180,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mainCardGradient: {
    padding: 16,
    minHeight: 180,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(236, 72, 153, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxPurple: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxGreen: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
  discountBadge: {
    backgroundColor: COLORS.pink500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgePurple: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountBadgeGreen: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.gray600,
    marginBottom: 12,
  },
  partnersText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.pink500,
  },
  partnersTextPurple: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  partnersTextGreen: {
    fontSize: 13,
    fontWeight: '600',
    color: '#10B981',
  },
});

export default BeautyWellnessSection;
