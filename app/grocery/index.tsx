/**
 * Grocery & Essentials Hub Page
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', amber500: '#F59E0B' };

const categories = [
  { id: 'essentials', title: 'Essentials', icon: '🧴', color: '#22C55E', count: '500+ items' },
  { id: 'daily', title: 'Daily Needs', icon: '🥛', color: '#3B82F6', count: '300+ items' },
  { id: 'supermarket', title: 'Supermarket', icon: '🛒', color: '#F97316', count: '50+ stores' },
  { id: 'organic', title: 'Organic', icon: '🌿', color: '#10B981', count: '200+ products' },
  { id: 'deals', title: 'Best Deals', icon: '🏷️', color: '#EF4444', count: '100+ offers' },
  { id: 'fresh', title: 'Fresh Produce', icon: '🥬', color: '#84CC16', count: '150+ items' },
];

const featuredStores = [
  { id: 1, name: 'BigBasket', rating: 4.5, deliveryTime: '30 min', cashback: '15%', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
  { id: 2, name: 'Blinkit', rating: 4.6, deliveryTime: '10 min', cashback: '20%', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400' },
  { id: 3, name: 'Zepto', rating: 4.4, deliveryTime: '15 min', cashback: '25%', image: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=400' },
];

const GroceryPage: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#22C55E', '#16A34A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Grocery & Essentials</Text>
            <Text style={styles.headerSubtitle}>Fresh groceries delivered</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>50+</Text><Text style={styles.statLabel}>Stores</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>25%</Text><Text style={styles.statLabel}>Max Cashback</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>10 min</Text><Text style={styles.statLabel}>Fastest</Text></View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/grocery/${cat.id}` as any)} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Delivery</Text>
            <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredStores.map((store) => (
              <TouchableOpacity key={store.id} style={styles.storeCard} onPress={() => router.push(`/store/${store.id}` as any)} activeOpacity={0.9}>
                <Image source={{ uri: store.image }} style={styles.storeImage} />
                <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{store.cashback}</Text></View>
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  <View style={styles.storeMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{store.rating}</Text>
                    </View>
                    <Text style={styles.deliveryText}>{store.deliveryTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#F97316', '#EA580C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🛒</Text>
            <Text style={styles.promoTitle}>First Order? Get ₹100 Off</Text>
            <Text style={styles.promoSubtitle}>+ Free delivery on orders above ₹199</Text>
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
  searchButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.green500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  storeCard: { width: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  storeImage: { width: '100%', height: 120 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  storeInfo: { padding: 12 },
  storeName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  storeMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  deliveryText: { fontSize: 12, color: COLORS.green500, fontWeight: '600' },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#F97316' },
});

export default GroceryPage;
