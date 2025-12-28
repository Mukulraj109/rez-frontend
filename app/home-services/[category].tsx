/**
 * Home Services Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', blue500: '#3B82F6', amber500: '#F59E0B' };

const categoryData: Record<string, any> = {
  repair: { title: 'Repair Services', icon: '🔧', gradientColors: ['#3B82F6', '#2563EB'], items: [
    { id: 1, name: 'AC Repair', type: 'Appliance', rating: 4.7, price: '₹299', cashback: '25%', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400' },
    { id: 2, name: 'Washing Machine', type: 'Appliance', rating: 4.6, price: '₹349', cashback: '20%', image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=400' },
    { id: 3, name: 'Refrigerator', type: 'Appliance', rating: 4.5, price: '₹399', cashback: '22%', image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=400' },
  ]},
  cleaning: { title: 'Cleaning Services', icon: '🧹', gradientColors: ['#22C55E', '#16A34A'], items: [
    { id: 4, name: 'Deep Home Cleaning', type: 'Full House', rating: 4.8, price: '₹999', cashback: '30%', image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400' },
    { id: 5, name: 'Sofa Cleaning', type: 'Furniture', rating: 4.6, price: '₹499', cashback: '25%', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
  ]},
  painting: { title: 'Painting Services', icon: '🎨', gradientColors: ['#F97316', '#EA580C'], items: [
    { id: 6, name: 'Interior Painting', type: 'Wall', rating: 4.7, price: '₹15/sqft', cashback: '20%', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400' },
    { id: 7, name: 'Exterior Painting', type: 'Wall', rating: 4.5, price: '₹18/sqft', cashback: '18%', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=400' },
  ]},
  carpentry: { title: 'Carpentry', icon: '🪚', gradientColors: ['#8B5CF6', '#7C3AED'], items: [
    { id: 8, name: 'Furniture Repair', type: 'Repair', rating: 4.6, price: '₹399', cashback: '22%', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400' },
    { id: 9, name: 'Custom Furniture', type: 'New', rating: 4.8, price: '₹2,999+', cashback: '15%', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' },
  ]},
  plumbing: { title: 'Plumbing', icon: '🚿', gradientColors: ['#06B6D4', '#0891B2'], items: [
    { id: 10, name: 'Tap Repair', type: 'Repair', rating: 4.5, price: '₹199', cashback: '25%', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400' },
    { id: 11, name: 'Pipe Fitting', type: 'Installation', rating: 4.6, price: '₹349', cashback: '20%', image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=400' },
  ]},
  electrical: { title: 'Electrical', icon: '⚡', gradientColors: ['#EAB308', '#CA8A04'], items: [
    { id: 12, name: 'Wiring', type: 'Installation', rating: 4.7, price: '₹499', cashback: '20%', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400' },
    { id: 13, name: 'Fan Installation', type: 'Installation', rating: 4.5, price: '₹299', cashback: '25%', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400' },
  ]},
};

const HomeServicesCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const data = categoryData[category || 'repair'] || categoryData['repair'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={data.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} services</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Today', 'Top Rated', 'Best Price'].map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)} style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>{filter === 'all' ? 'All' : filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.itemsList}>
          {data.items.map((item: any) => (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push(`/booking` as any)} activeOpacity={0.8}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{item.cashback}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type}</Text></View>
                <View style={styles.itemMeta}>
                  <View style={styles.ratingContainer}><Ionicons name="star" size={14} color={COLORS.amber500} /><Text style={styles.ratingText}>{item.rating}</Text></View>
                </View>
                <View style={styles.itemFooter}>
                  <Text style={styles.priceText}>From {item.price}</Text>
                  <TouchableOpacity style={styles.bookButton}><Text style={styles.bookButtonText}>Book</Text></TouchableOpacity>
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
  filterChipActive: { backgroundColor: COLORS.blue500 },
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
  bookButton: { backgroundColor: COLORS.blue500, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default HomeServicesCategoryPage;
