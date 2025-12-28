/**
 * Beauty & Wellness Hub Page
 * Converted from V2
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  pink500: '#EC4899',
  purple500: '#8B5CF6',
  amber500: '#F59E0B',
};

const categories = [
  { id: 'salon', title: 'Salon', icon: '💇‍♀️', color: '#EC4899', services: '500+ salons' },
  { id: 'spa', title: 'Spa & Massage', icon: '💆‍♀️', color: '#8B5CF6', services: '200+ spas' },
  { id: 'products', title: 'Products', icon: '💄', color: '#F43F5E', services: '10k+ products' },
  { id: 'wellness', title: 'Wellness', icon: '🧘‍♀️', color: '#10B981', services: '100+ centers' },
  { id: 'skincare', title: 'Skincare', icon: '✨', color: '#F59E0B', services: '5k+ products' },
  { id: 'haircare', title: 'Hair Care', icon: '💇', color: '#3B82F6', services: '3k+ products' },
];

const featuredSalons = [
  { id: 1, name: 'Lakme Salon', rating: 4.8, distance: '1.2 km', cashback: '25%', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
  { id: 2, name: 'Jawed Habib', rating: 4.6, distance: '2.0 km', cashback: '20%', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
  { id: 3, name: 'Looks Salon', rating: 4.5, distance: '0.8 km', cashback: '30%', image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400' },
];

const topBrands = [
  { id: 1, name: 'Nykaa', logo: '💅', discount: 'Up to 40% off' },
  { id: 2, name: 'Sephora', logo: '💄', discount: 'Buy 2 Get 1' },
  { id: 3, name: 'MAC', logo: '💋', discount: '15% cashback' },
  { id: 4, name: 'Forest Essentials', logo: '🌿', discount: '20% off' },
];

const BeautyPage: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/beauty/${categoryId}` as any);
  };

  const handleSalonPress = (salonId: number) => {
    router.push(`/store/${salonId}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#EC4899', '#F43F5E']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Beauty & Wellness</Text>
            <Text style={styles.headerSubtitle}>Pamper yourself, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>500+</Text>
            <Text style={styles.statLabel}>Salons</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>30%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>2X</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryServices}>{cat.services}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Salons */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Salons</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredSalons.map((salon) => (
              <TouchableOpacity
                key={salon.id}
                style={styles.salonCard}
                onPress={() => handleSalonPress(salon.id)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: salon.image }} style={styles.salonImage} />
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{salon.cashback}</Text>
                </View>
                <View style={styles.salonInfo}>
                  <Text style={styles.salonName}>{salon.name}</Text>
                  <View style={styles.salonMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{salon.rating}</Text>
                    </View>
                    <Text style={styles.distanceText}>{salon.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Top Brands */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Brands</Text>
          <View style={styles.brandsGrid}>
            {topBrands.map((brand) => (
              <TouchableOpacity key={brand.id} style={styles.brandCard} activeOpacity={0.8}>
                <Text style={styles.brandLogo}>{brand.logo}</Text>
                <Text style={styles.brandName}>{brand.name}</Text>
                <Text style={styles.brandDiscount}>{brand.discount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>💅</Text>
            <Text style={styles.promoTitle}>Beauty Week Special</Text>
            <Text style={styles.promoSubtitle}>Extra 15% cashback on all bookings • Limited time</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Book Now</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchButton: {
    padding: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.pink500,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  categoryServices: {
    fontSize: 10,
    color: COLORS.gray600,
  },
  salonCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  salonImage: {
    width: '100%',
    height: 120,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  salonInfo: {
    padding: 12,
  },
  salonName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  salonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.navy,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  brandsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    padding: 16,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    alignItems: 'center',
  },
  brandLogo: {
    fontSize: 32,
    marginBottom: 8,
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  brandDiscount: {
    fontSize: 12,
    color: COLORS.green500,
    fontWeight: '600',
  },
  promoBanner: {
    marginHorizontal: 16,
  },
  promoGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 40,
    marginBottom: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promoButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.pink500,
  },
});

export default BeautyPage;
