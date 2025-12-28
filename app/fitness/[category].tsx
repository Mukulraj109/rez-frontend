/**
 * Fitness Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6',
  gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', orange500: '#F97316', amber500: '#F59E0B',
};

const categoryData: Record<string, any> = {
  gyms: {
    title: 'Gyms', icon: '🏋️', gradientColors: ['#F97316', '#EA580C'],
    items: [
      { id: 1, name: "Gold's Gym", type: 'Premium', rating: 4.8, distance: '1.5 km', cashback: '25%', price: '₹2,500/mo', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
      { id: 2, name: 'Cult.fit', type: 'Chain', rating: 4.7, distance: '0.8 km', cashback: '30%', price: '₹1,999/mo', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400' },
      { id: 3, name: 'Anytime Fitness', type: '24/7', rating: 4.6, distance: '2.0 km', cashback: '20%', price: '₹3,000/mo', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400' },
    ],
  },
  studios: {
    title: 'Fitness Studios', icon: '🧘', gradientColors: ['#8B5CF6', '#7C3AED'],
    items: [
      { id: 4, name: 'Yoga House', type: 'Yoga', rating: 4.9, distance: '1.0 km', cashback: '35%', price: '₹500/class', image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400' },
      { id: 5, name: 'Pilates Studio', type: 'Pilates', rating: 4.7, distance: '2.5 km', cashback: '25%', price: '₹800/class', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400' },
    ],
  },
  trainers: {
    title: 'Personal Trainers', icon: '💪', gradientColors: ['#10B981', '#059669'],
    items: [
      { id: 6, name: 'Rahul Fitness', type: 'Strength', rating: 4.9, distance: '1.2 km', cashback: '20%', price: '₹1,500/session', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400' },
      { id: 7, name: 'Priya Yoga', type: 'Yoga', rating: 4.8, distance: '0.5 km', cashback: '25%', price: '₹800/session', image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' },
    ],
  },
  store: {
    title: 'Sports Store', icon: '🛒', gradientColors: ['#3B82F6', '#2563EB'],
    items: [
      { id: 8, name: 'Decathlon', type: 'Multi-sport', rating: 4.6, distance: '3.0 km', cashback: '15%', price: '₹499+', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400' },
      { id: 9, name: 'Nike Store', type: 'Sportswear', rating: 4.8, distance: '2.5 km', cashback: '20%', price: '₹1,999+', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' },
    ],
  },
  challenges: {
    title: 'Fitness Challenges', icon: '🏆', gradientColors: ['#EAB308', '#CA8A04'],
    items: [
      { id: 10, name: '30 Day Plank', type: 'Strength', rating: 4.9, distance: 'Online', cashback: 'Win 5000 coins', price: 'Free', image: 'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=400' },
      { id: 11, name: '10K Steps Daily', type: 'Cardio', rating: 4.8, distance: 'Online', cashback: 'Win 3000 coins', price: 'Free', image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=400' },
    ],
  },
  nutrition: {
    title: 'Nutrition Plans', icon: '🥗', gradientColors: ['#22C55E', '#16A34A'],
    items: [
      { id: 12, name: 'Weight Loss Plan', type: 'Diet', rating: 4.7, distance: 'Online', cashback: '30%', price: '₹999/mo', image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400' },
      { id: 13, name: 'Muscle Gain Diet', type: 'Bulking', rating: 4.6, distance: 'Online', cashback: '25%', price: '₹1,299/mo', image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?w=400' },
    ],
  },
};

const FitnessCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const data = categoryData[category || 'gyms'] || categoryData['gyms'];
  const filters = ['all', 'Nearby', 'Top Rated', 'Best Cashback'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={data.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} options</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter} onPress={() => setSelectedFilter(filter)}
              style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedFilter === filter && styles.filterChipTextActive]}>
                {filter === 'all' ? 'All' : filter}
              </Text>
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
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type}</Text></View>
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
                  <Text style={styles.priceText}>{item.price}</Text>
                  <TouchableOpacity style={styles.bookButton}><Text style={styles.bookButtonText}>Join</Text></TouchableOpacity>
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
  filterChipActive: { backgroundColor: COLORS.orange500 },
  filterChipText: { fontSize: 14, color: COLORS.gray600 },
  filterChipTextActive: { color: COLORS.white, fontWeight: '600' },
  itemsList: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  itemImage: { width: '100%', height: 160 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  typeBadge: { backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  itemMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: COLORS.gray600 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 15, fontWeight: '600', color: COLORS.navy },
  bookButton: { backgroundColor: COLORS.orange500, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default FitnessCategoryPage;
