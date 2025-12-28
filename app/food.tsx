/**
 * Food Category Page
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', orange500: '#F97316', amber500: '#F59E0B' };

const subcategories = [
  { id: 'delivery', title: 'Food Delivery', icon: '🍕', count: '500+ restaurants' },
  { id: 'dine-out', title: 'Dine Out', icon: '🍽️', count: '300+ places' },
  { id: 'cafe', title: 'Cafes', icon: '☕', count: '200+ cafes' },
  { id: 'fast-food', title: 'Fast Food', icon: '🍔', count: '150+ outlets' },
  { id: 'desserts', title: 'Desserts', icon: '🍰', count: '100+ shops' },
  { id: 'healthy', title: 'Healthy', icon: '🥗', count: '80+ options' },
];

const featuredRestaurants = [
  { id: 1, name: 'Dominos Pizza', cuisine: 'Italian', rating: 4.5, deliveryTime: '30 min', cashback: '25%', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400' },
  { id: 2, name: 'Burger King', cuisine: 'Fast Food', rating: 4.3, deliveryTime: '25 min', cashback: '20%', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
  { id: 3, name: 'Starbucks', cuisine: 'Cafe', rating: 4.6, deliveryTime: '20 min', cashback: '15%', image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400' },
  { id: 4, name: 'Biryani House', cuisine: 'Indian', rating: 4.7, deliveryTime: '35 min', cashback: '30%', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400' },
];

const popularCuisines = [
  { id: 1, name: 'Indian', emoji: '🍛', count: '200+' },
  { id: 2, name: 'Chinese', emoji: '🥡', count: '150+' },
  { id: 3, name: 'Italian', emoji: '🍝', count: '100+' },
  { id: 4, name: 'Mexican', emoji: '🌮', count: '80+' },
  { id: 5, name: 'Thai', emoji: '🍜', count: '60+' },
];

const offers = [
  { id: 1, title: '50% OFF', subtitle: 'On first order', code: 'FIRST50', color: '#EF4444' },
  { id: 2, title: 'FREE Delivery', subtitle: 'Orders above ₹199', code: 'FREEDEL', color: '#22C55E' },
  { id: 3, title: '₹100 OFF', subtitle: 'On orders above ₹499', code: 'SAVE100', color: '#3B82F6' },
];

const FoodPage: React.FC = () => {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState('all');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F97316', '#EA580C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Food</Text>
            <Text style={styles.headerSubtitle}>Order & earn cashback</Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>1000+</Text><Text style={styles.statLabel}>Restaurants</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>30%</Text><Text style={styles.statLabel}>Max Cashback</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>20 min</Text><Text style={styles.statLabel}>Avg Delivery</Text></View>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Fast Delivery', 'Rating 4.0+', 'Offers', 'Nearby'].map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>{filter === 'all' ? 'All' : filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Offers For You</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {offers.map((offer) => (
              <View key={offer.id} style={[styles.offerCard, { backgroundColor: offer.color }]}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                <View style={styles.codeContainer}>
                  <Text style={styles.codeText}>Use: {offer.code}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse by Category</Text>
          <View style={styles.categoriesGrid}>
            {subcategories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/categories` as any)} activeOpacity={0.8}>
                <View style={styles.categoryIcon}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Cuisines</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {popularCuisines.map((cuisine) => (
              <TouchableOpacity key={cuisine.id} style={styles.cuisineCard} activeOpacity={0.8}>
                <Text style={styles.cuisineEmoji}>{cuisine.emoji}</Text>
                <Text style={styles.cuisineName}>{cuisine.name}</Text>
                <Text style={styles.cuisineCount}>{cuisine.count}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          {featuredRestaurants.map((restaurant) => (
            <TouchableOpacity key={restaurant.id} style={styles.restaurantCard} onPress={() => router.push(`/restaurant` as any)} activeOpacity={0.8}>
              <Image source={{ uri: restaurant.image }} style={styles.restaurantImage} />
              <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{restaurant.cashback}</Text></View>
              <View style={styles.restaurantInfo}>
                <View style={styles.restaurantHeader}>
                  <Text style={styles.restaurantName}>{restaurant.name}</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={COLORS.white} />
                    <Text style={styles.ratingText}>{restaurant.rating}</Text>
                  </View>
                </View>
                <Text style={styles.cuisineText}>{restaurant.cuisine}</Text>
                <View style={styles.restaurantMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.gray600} />
                    <Text style={styles.metaText}>{restaurant.deliveryTime}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🍕</Text>
            <Text style={styles.promoTitle}>Pizza Festival</Text>
            <Text style={styles.promoSubtitle}>Buy 1 Get 1 Free on all pizzas</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Order Now</Text></TouchableOpacity>
          </LinearGradient>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  cartButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  filtersContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.orange500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.orange500 },
  offerCard: { width: 180, padding: 16, borderRadius: 16, marginRight: 12 },
  offerTitle: { fontSize: 24, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  offerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.9)', marginBottom: 12 },
  codeContainer: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  codeText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F9731620', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 11, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600, textAlign: 'center' },
  cuisineCard: { width: 80, alignItems: 'center', marginRight: 12 },
  cuisineEmoji: { fontSize: 36, marginBottom: 8 },
  cuisineName: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2 },
  cuisineCount: { fontSize: 10, color: COLORS.gray600 },
  restaurantCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200, marginBottom: 12 },
  restaurantImage: { width: '100%', height: 150 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  restaurantInfo: { padding: 16 },
  restaurantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  restaurantName: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  cuisineText: { fontSize: 14, color: COLORS.gray600, marginBottom: 8 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: COLORS.gray600 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#22C55E' },
});

export default FoodPage;
