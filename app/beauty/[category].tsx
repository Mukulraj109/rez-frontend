/**
 * Beauty Category Page - Dynamic route
 * salon, spa, products, wellness, skincare, haircare
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
  gray600: '#6B7280',
  green500: '#22C55E',
  pink500: '#EC4899',
  amber500: '#F59E0B',
};

const categoryData: Record<string, any> = {
  salon: {
    title: 'Salons',
    icon: '💇‍♀️',
    gradientColors: ['#EC4899', '#F43F5E'],
    items: [
      { id: 1, name: 'Lakme Salon', type: 'Premium', rating: 4.8, distance: '1.2 km', cashback: '25%', price: '₹500+', image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400' },
      { id: 2, name: 'Jawed Habib', type: 'Chain', rating: 4.6, distance: '2.0 km', cashback: '20%', price: '₹300+', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400' },
      { id: 3, name: 'Naturals Salon', type: 'Unisex', rating: 4.5, distance: '0.8 km', cashback: '30%', price: '₹400+', image: 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400' },
      { id: 4, name: 'Looks Salon', type: 'Premium', rating: 4.7, distance: '1.5 km', cashback: '22%', price: '₹600+', image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400' },
    ],
  },
  spa: {
    title: 'Spa & Massage',
    icon: '💆‍♀️',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    items: [
      { id: 5, name: 'O2 Spa', type: 'Luxury', rating: 4.9, distance: '3.0 km', cashback: '20%', price: '₹2,000+', image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400' },
      { id: 6, name: 'Thai Odyssey', type: 'Thai Massage', rating: 4.7, distance: '2.5 km', cashback: '25%', price: '₹1,500+', image: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400' },
      { id: 7, name: 'Kaya Spa', type: 'Ayurvedic', rating: 4.6, distance: '1.8 km', cashback: '18%', price: '₹1,200+', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400' },
    ],
  },
  products: {
    title: 'Beauty Products',
    icon: '💄',
    gradientColors: ['#F43F5E', '#E11D48'],
    items: [
      { id: 8, name: 'Nykaa', type: 'Multi-brand', rating: 4.5, distance: 'Online', cashback: '15%', price: '₹199+', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400' },
      { id: 9, name: 'Sephora', type: 'Premium', rating: 4.8, distance: '5.0 km', cashback: '12%', price: '₹999+', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400' },
      { id: 10, name: 'MAC', type: 'Luxury', rating: 4.7, distance: '4.0 km', cashback: '10%', price: '₹1,500+', image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400' },
    ],
  },
  wellness: {
    title: 'Wellness Centers',
    icon: '🧘‍♀️',
    gradientColors: ['#10B981', '#059669'],
    items: [
      { id: 11, name: 'Yoga House', type: 'Yoga', rating: 4.8, distance: '1.0 km', cashback: '30%', price: '₹500/class', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400' },
      { id: 12, name: 'Meditation Hub', type: 'Meditation', rating: 4.9, distance: '2.2 km', cashback: '25%', price: '₹300/session', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400' },
      { id: 13, name: 'Holistic Center', type: 'Wellness', rating: 4.6, distance: '3.5 km', cashback: '20%', price: '₹800+', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400' },
    ],
  },
  skincare: {
    title: 'Skincare',
    icon: '✨',
    gradientColors: ['#F59E0B', '#D97706'],
    items: [
      { id: 14, name: 'The Ordinary', type: 'Clinical', rating: 4.7, distance: 'Online', cashback: '20%', price: '₹500+', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
      { id: 15, name: 'Minimalist', type: 'Indian', rating: 4.6, distance: 'Online', cashback: '25%', price: '₹349+', image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400' },
      { id: 16, name: 'Dot & Key', type: 'Premium', rating: 4.5, distance: 'Online', cashback: '18%', price: '₹445+', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400' },
    ],
  },
  haircare: {
    title: 'Hair Care',
    icon: '💇',
    gradientColors: ['#3B82F6', '#2563EB'],
    items: [
      { id: 17, name: "L'Oreal", type: 'Professional', rating: 4.6, distance: 'Online', cashback: '15%', price: '₹299+', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400' },
      { id: 18, name: 'Schwarzkopf', type: 'Premium', rating: 4.7, distance: 'Online', cashback: '18%', price: '₹499+', image: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=400' },
      { id: 19, name: 'Matrix', type: 'Salon', rating: 4.5, distance: 'Online', cashback: '20%', price: '₹399+', image: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?w=400' },
    ],
  },
};

const BeautyCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const data = categoryData[category || 'salon'] || categoryData['salon'];
  const filters = ['all', 'Nearby', 'Top Rated', 'Best Cashback'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={data.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} options available</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Items List */}
        <View style={styles.itemsList}>
          {data.items.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.itemCard}
              onPress={() => router.push(`/store/${item.id}` as any)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.cashbackBadge}>
                <Text style={styles.cashbackText}>{item.cashback}</Text>
              </View>
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.type}</Text>
                  </View>
                </View>
                <View style={styles.itemMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={COLORS.amber500} />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
                    <Text style={styles.metaText}>{item.distance}</Text>
                  </View>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.priceText}>From {item.price}</Text>
                  <TouchableOpacity style={styles.bookButton}>
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.pink500,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  itemsList: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  itemImage: {
    width: '100%',
    height: 160,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  itemInfo: {
    padding: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  typeBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  itemMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.navy,
  },
  bookButton: {
    backgroundColor: COLORS.pink500,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default BeautyCategoryPage;
