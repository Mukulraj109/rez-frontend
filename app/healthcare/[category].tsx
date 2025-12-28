/**
 * Healthcare Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', red500: '#EF4444', amber500: '#F59E0B' };

const categoryData: Record<string, any> = {
  doctors: { title: 'Doctors', icon: '👨‍⚕️', gradientColors: ['#3B82F6', '#2563EB'], items: [
    { id: 1, name: 'Dr. Sharma', type: 'General Physician', rating: 4.9, price: '₹500', cashback: '20%', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
    { id: 2, name: 'Dr. Patel', type: 'Dermatologist', rating: 4.8, price: '₹800', cashback: '15%', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400' },
    { id: 3, name: 'Dr. Gupta', type: 'Cardiologist', rating: 4.9, price: '₹1,200', cashback: '18%', image: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400' },
  ]},
  pharmacy: { title: 'Pharmacy', icon: '💊', gradientColors: ['#22C55E', '#16A34A'], items: [
    { id: 4, name: 'PharmEasy', type: 'Online Pharmacy', rating: 4.5, price: 'Up to 25% off', cashback: '15%', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
    { id: 5, name: 'Netmeds', type: 'Online Pharmacy', rating: 4.4, price: 'Free delivery', cashback: '20%', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400' },
  ]},
  'lab-tests': { title: 'Lab Tests', icon: '🔬', gradientColors: ['#8B5CF6', '#7C3AED'], items: [
    { id: 6, name: 'Full Body Checkup', type: 'Comprehensive', rating: 4.7, price: '₹999', cashback: '25%', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400' },
    { id: 7, name: 'Thyroid Profile', type: 'Specific', rating: 4.6, price: '₹399', cashback: '20%', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
  ]},
  teleconsult: { title: 'Teleconsult', icon: '📱', gradientColors: ['#10B981', '#059669'], items: [
    { id: 8, name: 'Video Consultation', type: 'Instant', rating: 4.8, price: '₹199', cashback: '30%', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
    { id: 9, name: 'Chat Consultation', type: 'Text', rating: 4.6, price: '₹99', cashback: '25%', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400' },
  ]},
  insurance: { title: 'Health Insurance', icon: '🛡️', gradientColors: ['#F97316', '#EA580C'], items: [
    { id: 10, name: 'Individual Plan', type: 'Self', rating: 4.5, price: '₹500/mo', cashback: '10%', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400' },
    { id: 11, name: 'Family Plan', type: 'Family', rating: 4.6, price: '₹1,200/mo', cashback: '12%', image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400' },
  ]},
  offers: { title: 'Health Offers', icon: '🏷️', gradientColors: ['#EF4444', '#DC2626'], items: [
    { id: 12, name: 'Free Health Checkup', type: 'Limited', rating: 4.9, price: 'Free', cashback: '100% value', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400' },
    { id: 13, name: 'Medicine Combo', type: 'Bundle', rating: 4.5, price: 'Save ₹500', cashback: '30%', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
  ]},
};

const HealthcareCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const data = categoryData[category || 'doctors'] || categoryData['doctors'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={data.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} options</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['all', 'Nearby', 'Top Rated', 'Best Price'].map((filter) => (
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
  filterChipActive: { backgroundColor: COLORS.red500 },
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
  bookButton: { backgroundColor: COLORS.red500, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20 },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default HealthcareCategoryPage;
