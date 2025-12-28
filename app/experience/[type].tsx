/**
 * Experience Detail Page - Dynamic route for all experience types
 * Converted from V2: ExperienceDetail.jsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  teal500: '#14B8A6',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  amber500: '#F59E0B',
  red500: '#EF4444',
};

interface Store {
  id: number;
  name: string;
  category: string;
  offer: string;
  rating: number;
  distance: string;
  image: string;
}

interface ExperienceData {
  title: string;
  subtitle: string;
  icon: string;
  gradientColors: string[];
  description: string;
  benefits: string[];
  categories: string[];
  stores: Store[];
}

const experienceData: Record<string, ExperienceData> = {
  'sample-trial': {
    title: 'Sample/Trial Store',
    subtitle: 'Try before you buy',
    icon: '🧪',
    gradientColors: ['#3B82F6', '#06B6D4'],
    description: 'Experience products before making a purchase. Get free samples and trial offers from top brands.',
    benefits: [
      'Free product samples',
      'Trial period for electronics',
      'Test cosmetics before buying',
      'Money-back guarantee on trials'
    ],
    categories: ['Beauty', 'Electronics', 'Fashion', 'Food'],
    stores: [
      { id: 1, name: 'Nykaa', category: 'Beauty', offer: 'Free makeup samples', rating: 4.5, distance: '1.2 km', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300' },
      { id: 2, name: 'Croma', category: 'Electronics', offer: '7-day trial on headphones', rating: 4.3, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300' },
      { id: 3, name: 'Sephora', category: 'Beauty', offer: 'Try 3 perfumes free', rating: 4.7, distance: '0.8 km', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=300' },
      { id: 4, name: 'Decathlon', category: 'Sports', offer: 'Test sports gear', rating: 4.4, distance: '3.2 km', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300' }
    ]
  },
  '60-min-delivery': {
    title: '60 Min Delivery',
    subtitle: 'Ultra-fast delivery',
    icon: '⚡',
    gradientColors: ['#F97316', '#EF4444'],
    description: 'Get your orders delivered in 60 minutes or less. Perfect for urgent needs and last-minute shopping.',
    benefits: [
      'Guaranteed 60-min delivery',
      'Real-time order tracking',
      'Free delivery on orders ₹500+',
      'Late delivery = coins back'
    ],
    categories: ['Groceries', 'Food', 'Medicine', 'Electronics'],
    stores: [
      { id: 1, name: 'Blinkit', category: 'Groceries', offer: '10% off first order', rating: 4.2, distance: '0.5 km', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
      { id: 2, name: 'Swiggy Instamart', category: 'Groceries', offer: 'Free delivery today', rating: 4.4, distance: '1.0 km', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300' },
      { id: 3, name: 'Zepto', category: 'Groceries', offer: '15% cashback', rating: 4.3, distance: '0.7 km', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=300' },
      { id: 4, name: 'Dunzo', category: 'Medicine', offer: 'Express pharma delivery', rating: 4.1, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=300' }
    ]
  },
  'luxury': {
    title: 'Luxury Store',
    subtitle: 'Premium brands',
    icon: '💎',
    gradientColors: ['#8B5CF6', '#EC4899'],
    description: 'Indulge in premium shopping experiences with exclusive luxury brands and VIP treatment.',
    benefits: [
      'Personal shopping assistance',
      'Exclusive brand collections',
      'Premium gift wrapping',
      'VIP lounge access'
    ],
    categories: ['Fashion', 'Jewelry', 'Watches', 'Accessories'],
    stores: [
      { id: 1, name: 'Louis Vuitton', category: 'Fashion', offer: 'New collection preview', rating: 4.9, distance: '5.2 km', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300' },
      { id: 2, name: 'Tiffany & Co', category: 'Jewelry', offer: 'Complimentary engraving', rating: 4.8, distance: '4.8 km', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300' },
      { id: 3, name: 'Rolex', category: 'Watches', offer: 'Exclusive viewing', rating: 4.9, distance: '5.0 km', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300' },
      { id: 4, name: 'Gucci', category: 'Fashion', offer: 'Limited edition items', rating: 4.7, distance: '4.5 km', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300' }
    ]
  },
  'organic': {
    title: 'Organic Store',
    subtitle: '100% natural',
    icon: '🌿',
    gradientColors: ['#22C55E', '#10B981'],
    description: 'Shop 100% certified organic products. Healthy choices for you and sustainable for the planet.',
    benefits: [
      'Certified organic products',
      'Farm-to-table freshness',
      'Eco-friendly packaging',
      'Sustainability rewards'
    ],
    categories: ['Food', 'Beauty', 'Baby Care', 'Home'],
    stores: [
      { id: 1, name: 'Organic India', category: 'Food', offer: '20% off on first order', rating: 4.6, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300' },
      { id: 2, name: "Nature's Basket", category: 'Food', offer: 'Fresh organic produce', rating: 4.5, distance: '1.8 km', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=300' },
      { id: 3, name: 'Forest Essentials', category: 'Beauty', offer: 'Natural skincare', rating: 4.7, distance: '3.0 km', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=300' },
      { id: 4, name: 'Conscious Food', category: 'Food', offer: 'Bulk buy discount', rating: 4.4, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=300' }
    ]
  },
  'men': {
    title: 'Men Store',
    subtitle: 'For modern men',
    icon: '👔',
    gradientColors: ['#6B7280', '#475569'],
    description: "Curated collection of fashion, grooming, and lifestyle products exclusively for men.",
    benefits: [
      'Style consultation',
      'Grooming guides',
      "Exclusive men's brands",
      'Loyalty rewards'
    ],
    categories: ['Fashion', 'Grooming', 'Accessories', 'Footwear'],
    stores: [
      { id: 1, name: 'Jack & Jones', category: 'Fashion', offer: '40% off on jeans', rating: 4.3, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=300' },
      { id: 2, name: 'The Man Company', category: 'Grooming', offer: 'Beard kit bundle', rating: 4.5, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=300' },
      { id: 3, name: 'Nike Men', category: 'Footwear', offer: 'New sneaker drop', rating: 4.6, distance: '3.0 km', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300' },
      { id: 4, name: 'Raymond', category: 'Fashion', offer: 'Suit customization', rating: 4.4, distance: '2.8 km', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300' }
    ]
  },
  'women': {
    title: 'Women Store',
    subtitle: 'Curated for her',
    icon: '👗',
    gradientColors: ['#EC4899', '#F43F5E'],
    description: "Discover the latest in women's fashion, beauty, wellness, and lifestyle essentials.",
    benefits: [
      'Personal stylist service',
      'Beauty consultations',
      "Exclusive women's brands",
      'Special occasion styling'
    ],
    categories: ['Fashion', 'Beauty', 'Jewelry', 'Wellness'],
    stores: [
      { id: 1, name: 'Zara Women', category: 'Fashion', offer: '50% off summer collection', rating: 4.5, distance: '1.8 km', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300' },
      { id: 2, name: 'MAC Cosmetics', category: 'Beauty', offer: 'Free makeover', rating: 4.7, distance: '2.2 km', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300' },
      { id: 3, name: 'Tanishq', category: 'Jewelry', offer: 'New gold collection', rating: 4.8, distance: '3.5 km', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300' },
      { id: 4, name: 'Lululemon', category: 'Wellness', offer: 'Yoga gear sale', rating: 4.6, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300' }
    ]
  },
  'children': {
    title: 'Children Store',
    subtitle: 'Kids essentials',
    icon: '🧸',
    gradientColors: ['#EAB308', '#F59E0B'],
    description: 'Everything your little ones need - from toys and clothes to educational products.',
    benefits: [
      'Age-appropriate selections',
      'Safety certified products',
      'Educational toys',
      'Parent discounts'
    ],
    categories: ['Toys', 'Clothing', 'Books', 'Baby Care'],
    stores: [
      { id: 1, name: 'Hamleys', category: 'Toys', offer: 'Buy 2 Get 1 free', rating: 4.6, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=300' },
      { id: 2, name: 'Mothercare', category: 'Baby Care', offer: '30% off baby essentials', rating: 4.5, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=300' },
      { id: 3, name: 'FirstCry', category: 'Clothing', offer: 'Kids fashion sale', rating: 4.4, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=300' },
      { id: 4, name: 'Crossword Kids', category: 'Books', offer: 'Story time bundle', rating: 4.7, distance: '1.8 km', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300' }
    ]
  },
  'rental': {
    title: 'Rental Store',
    subtitle: 'Rent not buy',
    icon: '🔄',
    gradientColors: ['#6366F1', '#3B82F6'],
    description: 'Rent high-quality products instead of buying. Perfect for special occasions and temporary needs.',
    benefits: [
      'Flexible rental periods',
      'No maintenance hassle',
      'Try before you buy option',
      'Eco-friendly choice'
    ],
    categories: ['Fashion', 'Electronics', 'Furniture', 'Events'],
    stores: [
      { id: 1, name: 'Rent It Bae', category: 'Fashion', offer: 'Designer outfits', rating: 4.4, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300' },
      { id: 2, name: 'RentoMojo', category: 'Furniture', offer: 'Monthly packages', rating: 4.3, distance: '3.0 km', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300' },
      { id: 3, name: 'Flyrobe', category: 'Fashion', offer: 'Wedding collection', rating: 4.5, distance: '2.5 km', image: 'https://images.unsplash.com/photo-1519657814959-9b213d2ac5a0?w=300' },
      { id: 4, name: 'Furlenco', category: 'Furniture', offer: '3 months free delivery', rating: 4.4, distance: '3.5 km', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=300' }
    ]
  },
  'gifting': {
    title: 'Gifting Store',
    subtitle: 'Perfect presents',
    icon: '🎁',
    gradientColors: ['#EF4444', '#EC4899'],
    description: 'Find the perfect gift for every occasion. From personalized items to luxury hampers.',
    benefits: [
      'Gift wrapping included',
      'Personalization options',
      'Same-day delivery',
      'Gift cards available'
    ],
    categories: ['Personalized', 'Hampers', 'Experiences', 'Flowers'],
    stores: [
      { id: 1, name: 'Archies', category: 'Personalized', offer: 'Photo gifts 30% off', rating: 4.3, distance: '1.5 km', image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=300' },
      { id: 2, name: 'Ferns N Petals', category: 'Flowers', offer: 'Fresh flower bouquets', rating: 4.6, distance: '1.0 km', image: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=300' },
      { id: 3, name: 'IGP', category: 'Hampers', offer: 'Luxury gift boxes', rating: 4.5, distance: '2.0 km', image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=300' },
      { id: 4, name: 'OYO Gift Cards', category: 'Experiences', offer: 'Stay vouchers', rating: 4.4, distance: 'Online', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300' }
    ]
  }
};

const ExperienceDetailPage: React.FC = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const experience = experienceData[type || 'sample-trial'] || experienceData['sample-trial'];
  const filters = ['all', ...experience.categories];

  const filteredStores = selectedFilter === 'all'
    ? experience.stores
    : experience.stores.filter(store => store.category === selectedFilter);

  const handleStorePress = (storeId: number) => {
    router.push(`/store/${storeId}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{experience.title}</Text>
          <Text style={styles.headerSubtitle}>{experience.subtitle}</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={experience.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroIconContainer}>
            <Text style={styles.heroIcon}>{experience.icon}</Text>
          </View>
          <Text style={styles.heroTitle}>{experience.title}</Text>
          <Text style={styles.heroDescription}>{experience.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Ionicons name="storefront" size={20} color={COLORS.white} />
              <Text style={styles.statValue}>{experience.stores.length}+</Text>
              <Text style={styles.statLabel}>Stores</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={20} color={COLORS.white} />
              <Text style={styles.statValue}>50%</Text>
              <Text style={styles.statLabel}>Max Savings</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Benefits Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={COLORS.amber500} />
            <Text style={styles.sectionTitle}>Experience Benefits</Text>
          </View>
          <View style={styles.benefitsList}>
            {experience.benefits.map((benefit, idx) => (
              <View key={idx} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="checkmark" size={16} color={COLORS.emerald500} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Browse Stores</Text>
            <View style={styles.filterIcon}>
              <Ionicons name="filter" size={16} color={COLORS.gray600} />
              <Text style={styles.filterText}>Filter</Text>
            </View>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && styles.filterChipActive
                ]}
              >
                <Text style={[
                  styles.filterChipText,
                  selectedFilter === filter && styles.filterChipTextActive
                ]}>
                  {filter === 'all' ? 'All' : filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Stores List */}
        <View style={styles.storesSection}>
          {filteredStores.map((store) => (
            <TouchableOpacity
              key={store.id}
              style={styles.storeCard}
              onPress={() => handleStorePress(store.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: store.image }} style={styles.storeImage} />
              <View style={styles.storeInfo}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeNameContainer}>
                    <Text style={styles.storeName}>{store.name}</Text>
                    <View style={styles.storeMetaRow}>
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{store.category}</Text>
                      </View>
                      <View style={styles.ratingContainer}>
                        <Ionicons name="star" size={14} color={COLORS.amber500} />
                        <Text style={styles.ratingText}>{store.rating}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.heartButton}>
                    <Ionicons name="heart-outline" size={22} color={COLORS.gray400} />
                  </TouchableOpacity>
                </View>

                <View style={styles.offerBanner}>
                  <Ionicons name="pricetag" size={14} color={COLORS.emerald500} />
                  <Text style={styles.offerText}>{store.offer}</Text>
                </View>

                <View style={styles.storeFooter}>
                  <View style={styles.distanceContainer}>
                    <Ionicons name="location" size={14} color={COLORS.gray600} />
                    <Text style={styles.distanceText}>{store.distance}</Text>
                  </View>
                  <View style={styles.coinsContainer}>
                    <Ionicons name="logo-bitcoin" size={14} color={COLORS.emerald500} />
                    <Text style={styles.coinsText}>Earn coins</Text>
                  </View>
                  <TouchableOpacity style={styles.visitButton}>
                    <Text style={styles.visitButtonText}>Visit</Text>
                    <Ionicons name="chevron-forward" size={14} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Rewards Banner */}
        <View style={styles.rewardsBanner}>
          <LinearGradient
            colors={['#FAF5FF', '#FDF2F8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.rewardsBannerGradient}
          >
            <View style={styles.rewardsIconContainer}>
              <Ionicons name="gift" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.rewardsTitle}>Earn Rewards on Every Purchase</Text>
            <Text style={styles.rewardsSubtitle}>
              Shop at any store in this experience and earn ReZ coins + cashback
            </Text>
            <View style={styles.rewardsStats}>
              <View style={styles.rewardsStat}>
                <Ionicons name="logo-bitcoin" size={18} color={COLORS.emerald500} />
                <Text style={styles.rewardsStatText}>Up to 500 coins</Text>
              </View>
              <View style={styles.rewardsDivider} />
              <View style={styles.rewardsStat}>
                <Ionicons name="trending-up" size={18} color={COLORS.blue500} />
                <Text style={[styles.rewardsStatText, { color: COLORS.blue500 }]}>Up to 20% cashback</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Empty State */}
        {filteredStores.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="storefront-outline" size={48} color={COLORS.gray400} />
            <Text style={styles.emptyStateTitle}>No stores found</Text>
            <Text style={styles.emptyStateText}>Try selecting a different category</Text>
          </View>
        )}

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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  searchButton: {
    padding: 8,
  },
  heroSection: {
    padding: 24,
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginLeft: 8,
  },
  filterIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  benefitsList: {
    gap: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 12,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.navy,
    flex: 1,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.emerald500,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  storesSection: {
    paddingHorizontal: 16,
    gap: 16,
  },
  storeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    overflow: 'hidden',
  },
  storeImage: {
    width: '100%',
    height: 120,
  },
  storeInfo: {
    padding: 16,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  storeNameContainer: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  storeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.blue500,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  heartButton: {
    padding: 4,
  },
  offerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  offerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.emerald500,
  },
  storeFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  coinsText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.emerald500,
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emerald500,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  visitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  rewardsBanner: {
    padding: 16,
  },
  rewardsBannerGradient: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  rewardsIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.purple500,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  rewardsSubtitle: {
    fontSize: 13,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 16,
  },
  rewardsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rewardsStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardsStatText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.emerald500,
  },
  rewardsDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.gray200,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
});

export default ExperienceDetailPage;
