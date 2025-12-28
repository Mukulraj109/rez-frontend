/**
 * Travel Hub Page
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', cyan500: '#06B6D4', amber500: '#F59E0B' };

const categories = [
  { id: 'flights', title: 'Flights', icon: '✈️', color: '#3B82F6', count: 'All airlines' },
  { id: 'hotels', title: 'Hotels', icon: '🏨', color: '#EC4899', count: '50k+ hotels' },
  { id: 'trains', title: 'Trains', icon: '🚂', color: '#22C55E', count: 'IRCTC' },
  { id: 'bus', title: 'Bus', icon: '🚌', color: '#F97316', count: '2000+ operators' },
  { id: 'cab', title: 'Cab', icon: '🚕', color: '#EAB308', count: 'Intercity' },
  { id: 'packages', title: 'Packages', icon: '🎒', color: '#8B5CF6', count: '500+ tours' },
];

const featuredDeals = [
  { id: 1, name: 'Goa Flight + Hotel', type: 'Package', price: '₹9,999', cashback: '20%', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
  { id: 2, name: 'Mumbai-Delhi Flight', type: 'Flight', price: '₹2,499', cashback: '15%', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400' },
  { id: 3, name: 'Taj Hotel Agra', type: 'Hotel', price: '₹4,999/night', cashback: '25%', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
];

const TravelPage: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06B6D4', '#0891B2']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Travel</Text>
            <Text style={styles.headerSubtitle}>Book trips, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>50k+</Text><Text style={styles.statLabel}>Hotels</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>25%</Text><Text style={styles.statLabel}>Max Cashback</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>2X</Text><Text style={styles.statLabel}>Coins</Text></View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Book Travel</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/travel/${cat.id}` as any)} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Hot Deals</Text><TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredDeals.map((deal) => (
              <TouchableOpacity key={deal.id} style={styles.dealCard} onPress={() => router.push(`/travel/${deal.id}` as any)} activeOpacity={0.9}>
                <Image source={{ uri: deal.image }} style={styles.dealImage} />
                <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{deal.cashback}</Text></View>
                <View style={styles.dealInfo}>
                  <Text style={styles.dealName}>{deal.name}</Text>
                  <Text style={styles.dealType}>{deal.type}</Text>
                  <Text style={styles.dealPrice}>{deal.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🌴</Text>
            <Text style={styles.promoTitle}>New Year Travel Sale</Text>
            <Text style={styles.promoSubtitle}>Up to 40% off on hotels • Extra coins on bookings</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Explore</Text></TouchableOpacity>
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
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.cyan500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  dealCard: { width: 220, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  dealImage: { width: '100%', height: 130 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  dealInfo: { padding: 12 },
  dealName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  dealType: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 },
  dealPrice: { fontSize: 16, fontWeight: '700', color: COLORS.green500 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#8B5CF6' },
});

export default TravelPage;
