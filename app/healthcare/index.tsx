/**
 * Healthcare Hub Page
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', red500: '#EF4444', amber500: '#F59E0B' };

const categories = [
  { id: 'doctors', title: 'Doctors', icon: '👨‍⚕️', color: '#3B82F6', count: '1000+ doctors' },
  { id: 'pharmacy', title: 'Pharmacy', icon: '💊', color: '#22C55E', count: '500+ stores' },
  { id: 'lab-tests', title: 'Lab Tests', icon: '🔬', color: '#8B5CF6', count: '200+ tests' },
  { id: 'teleconsult', title: 'Teleconsult', icon: '📱', color: '#10B981', count: 'Instant' },
  { id: 'insurance', title: 'Insurance', icon: '🛡️', color: '#F97316', count: '50+ plans' },
  { id: 'offers', title: 'Health Offers', icon: '🏷️', color: '#EF4444', count: '100+ deals' },
];

const featuredServices = [
  { id: 1, name: 'Video Consultation', type: 'Teleconsult', price: '₹199', cashback: '30%', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
  { id: 2, name: 'Full Body Checkup', type: 'Lab Test', price: '₹999', cashback: '25%', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400' },
  { id: 3, name: 'Medicine Delivery', type: 'Pharmacy', price: 'Free delivery', cashback: '15%', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400' },
];

const HealthcarePage: React.FC = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#EF4444', '#DC2626']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Healthcare</Text>
            <Text style={styles.headerSubtitle}>Your health, our priority</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statItem}><Text style={styles.statValue}>1000+</Text><Text style={styles.statLabel}>Doctors</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>30%</Text><Text style={styles.statLabel}>Max Cashback</Text></View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}><Text style={styles.statValue}>24/7</Text><Text style={styles.statLabel}>Available</Text></View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryCard} onPress={() => router.push(`/healthcare/${cat.id}` as any)} activeOpacity={0.8}>
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}><Text style={styles.categoryEmoji}>{cat.icon}</Text></View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Popular Services</Text><TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity></View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredServices.map((service) => (
              <TouchableOpacity key={service.id} style={styles.serviceCard} onPress={() => router.push(`/healthcare/${service.id}` as any)} activeOpacity={0.9}>
                <Image source={{ uri: service.image }} style={styles.serviceImage} />
                <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{service.cashback}</Text></View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceType}>{service.type}</Text>
                  <Text style={styles.servicePrice}>{service.price}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.promoGradient}>
            <Text style={styles.promoEmoji}>🏥</Text>
            <Text style={styles.promoTitle}>Health Insurance</Text>
            <Text style={styles.promoSubtitle}>Get covered from ₹500/month • Family plans available</Text>
            <TouchableOpacity style={styles.promoButton}><Text style={styles.promoButtonText}>Get Quote</Text></TouchableOpacity>
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
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.red500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  serviceCard: { width: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  serviceImage: { width: '100%', height: 120 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  serviceInfo: { padding: 12 },
  serviceName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 2 },
  serviceType: { fontSize: 12, color: COLORS.gray600, marginBottom: 4 },
  servicePrice: { fontSize: 14, fontWeight: '600', color: COLORS.green500 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: '#3B82F6' },
});

export default HealthcarePage;
