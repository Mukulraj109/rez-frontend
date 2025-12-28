/**
 * Grocery Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', amber500: '#F59E0B' };

const categoryData: Record<string, any> = {
  essentials: { title: 'Essentials', icon: '🧴', gradientColors: ['#22C55E', '#16A34A'], items: [
    { id: 1, name: 'Cleaning Supplies', type: 'Home', rating: 4.5, price: '₹99+', cashback: '15%', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
    { id: 2, name: 'Personal Care', type: 'Hygiene', rating: 4.6, price: '₹49+', cashback: '20%', image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400' },
  ]},
  daily: { title: 'Daily Needs', icon: '🥛', gradientColors: ['#3B82F6', '#2563EB'], items: [
    { id: 3, name: 'Milk & Dairy', type: 'Fresh', rating: 4.7, price: '₹25+', cashback: '10%', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400' },
    { id: 4, name: 'Bread & Bakery', type: 'Fresh', rating: 4.5, price: '₹30+', cashback: '12%', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  ]},
  supermarket: { title: 'Supermarket', icon: '🛒', gradientColors: ['#F97316', '#EA580C'], items: [
    { id: 5, name: 'BigBasket', type: 'Online', rating: 4.5, price: 'Free delivery', cashback: '15%', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400' },
    { id: 6, name: 'DMart', type: 'Hypermarket', rating: 4.4, price: '₹499 min', cashback: '10%', image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400' },
  ]},
  organic: { title: 'Organic', icon: '🌿', gradientColors: ['#10B981', '#059669'], items: [
    { id: 7, name: 'Organic Vegetables', type: 'Farm Fresh', rating: 4.8, price: '₹50+', cashback: '20%', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400' },
    { id: 8, name: 'Organic Fruits', type: 'Farm Fresh', rating: 4.7, price: '₹80+', cashback: '18%', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
  ]},
  deals: { title: 'Best Deals', icon: '🏷️', gradientColors: ['#EF4444', '#DC2626'], items: [
    { id: 9, name: 'Weekly Deals', type: 'Limited', rating: 4.6, price: 'Up to 50% off', cashback: '25%', image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=400' },
    { id: 10, name: 'Combo Offers', type: 'Bundle', rating: 4.5, price: 'Save ₹200+', cashback: '20%', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
  ]},
  fresh: { title: 'Fresh Produce', icon: '🥬', gradientColors: ['#84CC16', '#65A30D'], items: [
    { id: 11, name: 'Vegetables', type: 'Daily Fresh', rating: 4.6, price: '₹20+', cashback: '15%', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400' },
    { id: 12, name: 'Fruits', type: 'Seasonal', rating: 4.7, price: '₹40+', cashback: '12%', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400' },
  ]},
};

const GroceryCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const data = categoryData[category || 'essentials'] || categoryData['essentials'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={data.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} items</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Price: Low', 'Rating', 'Cashback'].map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>{filter === 'all' ? 'All' : filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.itemsList}>
          {data.items.map((item: any) => (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push(`/store/${item.id}` as any)} activeOpacity={0.8}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{item.cashback}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type}</Text></View>
                <View style={styles.itemMeta}>
                  <View style={styles.ratingContainer}><Ionicons name="star" size={14} color={COLORS.amber500} /><Text style={styles.ratingText}>{item.rating}</Text></View>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <TouchableOpacity style={styles.addButton}><Text style={styles.addButtonText}>Shop</Text></TouchableOpacity>
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
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  filtersContainer: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.gray100, marginRight: 8 },
  filterChipActive: { backgroundColor: COLORS.green500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  itemsList: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  itemImage: { width: '100%', height: 140 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  itemMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 15, fontWeight: '600', color: COLORS.green500 },
  addButton: { backgroundColor: COLORS.green500, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  addButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default GroceryCategoryPage;
