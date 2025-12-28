/**
 * Financial Services Hub Page
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', purple500: '#8B5CF6', amber500: '#F59E0B' };

const categories = [
  { id: 'bills', title: 'Bill Payment', icon: '📄', color: '#3B82F6', count: 'All bills' },
  { id: 'ott', title: 'OTT & DTH', icon: '📺', color: '#EF4444', count: '50+ services' },
  { id: 'recharge', title: 'Recharge', icon: '📱', color: '#22C55E', count: 'All networks' },
  { id: 'gold', title: 'Digital Gold', icon: '🪙', color: '#F59E0B', count: 'Buy/Sell' },
  { id: 'insurance', title: 'Insurance', icon: '🛡️', color: '#8B5CF6', count: '100+ plans' },
  { id: 'loans', title: 'Loans', icon: '💳', color: '#EC4899', count: 'Quick approval' },
];

const featuredServices = [
  { id: 1, name: 'Electricity Bill', type: 'Utility', cashback: '5%', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400' },
  { id: 2, name: 'Netflix', type: 'OTT', cashback: '10%', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400' },
  { id: 3, name: 'Mobile Recharge', type: 'Prepaid', cashback: '3%', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400' },
];

const FinancialPage: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Financial Services</Text>
            <Text style={styles.headerSubtitle}>Pay bills, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>100+</Text><Text style={styles.statLabel}>Billers</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>10%</Text><Text style={styles.statLabel}>Max Cashback</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>Instant</Text><Text style={styles.statLabel}>Processing</Text></View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/financial/${cat.id}` as any)} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Quick Pay</Text><TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredServices.map((service) => (
              <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => router.push(`/bill-payment` as any)} activeOpacity={0.9}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{service.cashback}</Text></View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceType}>{service.type}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#F59E0B', '#D97706']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🪙</Text>
            <Text style={styles.promoTitle}>Digital Gold</Text>
            <Text style={styles.promoSubtitle}>Start with just ₹10 • 24K purity guaranteed</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Buy Gold</Text></TouchableOpacity>
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
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.purple500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  serviceCard: { width: 160, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  serviceImage: { width: '100%', height: 100 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  serviceInfo: { padding: 12 },
  serviceName: { fontSize: 14, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  serviceType: { fontSize: 12, color: COLORS.gray600 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#F59E0B' },
});

export default FinancialPage;
