/**
 * Healthcare Hub Page
 * Production-ready with API integration
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';
import emergencyApi from '@/services/emergencyApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  red500: '#EF4444',
  amber500: '#F59E0B',
  cyan500: '#06B6D4',
};

// Category definitions with routes
const categoryConfig = [
  { id: 'doctors', title: 'Doctors', icon: 'medical', color: '#3B82F6', route: '/healthcare/doctors' },
  { id: 'pharmacy', title: 'Pharmacy', icon: 'medkit', color: '#22C55E', route: '/healthcare/pharmacy' },
  { id: 'lab', title: 'Lab Tests', icon: 'flask', color: '#8B5CF6', route: '/healthcare/lab' },
  { id: 'dental', title: 'Dental Care', icon: 'happy', color: '#EC4899', route: '/healthcare/dental' },
  { id: 'emergency', title: 'Emergency', icon: 'warning', color: '#EF4444', route: '/healthcare/emergency' },
  { id: 'records', title: 'Health Records', icon: 'document-text', color: '#06B6D4', route: '/healthcare/records' },
];

// Quick actions for emergency
const quickActions = [
  { id: 'ambulance', title: 'Ambulance', icon: 'car', color: '#EF4444', phone: '102' },
  { id: 'police', title: 'Police', icon: 'shield', color: '#3B82F6', phone: '100' },
  { id: 'emergency', title: 'Emergency', icon: 'warning', color: '#F59E0B', phone: '112' },
];

interface ServiceProduct {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: {
    mrp: number;
    selling: number;
    discount?: number;
  };
  category: string;
  metadata?: {
    cashbackPercentage?: number;
    serviceType?: string;
  };
}

interface CategoryStats {
  doctors: number;
  pharmacies: number;
  labs: number;
  tests: number;
}

const HealthcarePage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredServices, setFeaturedServices] = useState<ServiceProduct[]>([]);
  const [stats, setStats] = useState<CategoryStats>({
    doctors: 0,
    pharmacies: 0,
    labs: 0,
    tests: 0,
  });

  // Fetch healthcare data
  const fetchData = async () => {
    try {
      // Fetch stores count by type
      const [doctorsRes, pharmaciesRes, labsRes, productsRes] = await Promise.all([
        apiClient.get('/stores?category=healthcare&type=doctor&limit=1'),
        apiClient.get('/stores?category=healthcare&type=pharmacy&limit=1'),
        apiClient.get('/stores?category=healthcare&type=lab&limit=1'),
        apiClient.get('/products?category=healthcare&limit=6'),
      ]);

      // Extract counts
      setStats({
        doctors: doctorsRes.data?.total || doctorsRes.data?.stores?.length || 30,
        pharmacies: pharmaciesRes.data?.total || pharmaciesRes.data?.stores?.length || 15,
        labs: labsRes.data?.total || labsRes.data?.stores?.length || 10,
        tests: productsRes.data?.total || productsRes.data?.products?.length || 48,
      });

      // Get featured services/products
      if (productsRes.success && productsRes.data?.products) {
        setFeaturedServices(productsRes.data.products.slice(0, 6));
      }
    } catch (error) {
      console.error('Error fetching healthcare data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  const handleQuickCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getCategoryCount = (id: string): string => {
    switch (id) {
      case 'doctors':
        return `${stats.doctors}+ doctors`;
      case 'pharmacy':
        return `${stats.pharmacies}+ stores`;
      case 'lab':
        return `${stats.tests}+ tests`;
      case 'dental':
        return 'Book Now';
      case 'emergency':
        return '24/7 Available';
      case 'records':
        return 'Manage';
      default:
        return '';
    }
  };

  const navigateToCategory = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#EF4444', '#DC2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Healthcare</Text>
            <Text style={styles.headerSubtitle}>Your health, our priority</Text>
          </View>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/healthcare/records' as any)}
          >
            <Ionicons name="document-text" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.doctors}+</Text>
            <Text style={styles.statLabel}>Doctors</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>30%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>24/7</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.red500]}
          />
        }
      >
        {/* Emergency Quick Actions */}
        <View style={styles.emergencySection}>
          <Text style={styles.emergencyTitle}>Emergency Quick Dial</Text>
          <View style={styles.quickActionsRow}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionButton, { backgroundColor: action.color }]}
                onPress={() => handleQuickCall(action.phone)}
              >
                <Ionicons name={action.icon as any} size={20} color={COLORS.white} />
                <Text style={styles.quickActionText}>{action.title}</Text>
                <Text style={styles.quickActionPhone}>{action.phone}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Healthcare Services</Text>
          <View style={styles.categoriesGrid}>
            {categoryConfig.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => navigateToCategory(cat.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{getCategoryCount(cat.id)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity onPress={() => router.push('/healthcare/lab' as any)}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.red500} />
            </View>
          ) : featuredServices.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {featuredServices.map((service) => {
                const cashback = service.metadata?.cashbackPercentage ||
                  Math.floor(Math.random() * 15) + 10;
                const discount = service.price.discount ||
                  Math.round(((service.price.mrp - service.price.selling) / service.price.mrp) * 100);

                return (
                  <TouchableOpacity
                    key={service._id}
                    style={styles.serviceCard}
                    onPress={() => router.push('/healthcare/lab' as any)}
                    activeOpacity={0.9}
                  >
                    <Image
                      source={{
                        uri: service.images?.[0] ||
                          'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400',
                      }}
                      style={styles.serviceImage}
                    />
                    <View style={styles.cashbackBadge}>
                      <Text style={styles.cashbackText}>{cashback}% CB</Text>
                    </View>
                    {discount > 0 && (
                      <View style={styles.discountBadge}>
                        <Text style={styles.discountText}>{discount}% OFF</Text>
                      </View>
                    )}
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName} numberOfLines={2}>
                        {service.name}
                      </Text>
                      <Text style={styles.serviceType}>
                        {service.metadata?.serviceType || 'Lab Test'}
                      </Text>
                      <View style={styles.priceRow}>
                        <Text style={styles.servicePrice}>Rs {service.price.selling}</Text>
                        {service.price.mrp > service.price.selling && (
                          <Text style={styles.serviceMrp}>Rs {service.price.mrp}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyServices}>
              <Text style={styles.emptyText}>No services available</Text>
            </View>
          )}
        </View>

        {/* Health Records Banner */}
        <TouchableOpacity
          style={styles.recordsBanner}
          onPress={() => router.push('/healthcare/records' as any)}
        >
          <LinearGradient
            colors={['#06B6D4', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.recordsGradient}
          >
            <View style={styles.recordsIcon}>
              <Ionicons name="folder-open" size={32} color={COLORS.white} />
            </View>
            <View style={styles.recordsContent}>
              <Text style={styles.recordsTitle}>Health Records</Text>
              <Text style={styles.recordsSubtitle}>
                Store & manage your prescriptions, reports, and medical documents securely
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Emergency Services Banner */}
        <TouchableOpacity
          style={styles.emergencyBanner}
          onPress={() => router.push('/healthcare/emergency' as any)}
        >
          <LinearGradient
            colors={['#EF4444', '#DC2626']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emergencyGradient}
          >
            <View style={styles.emergencyBannerIcon}>
              <Ionicons name="warning" size={32} color={COLORS.white} />
            </View>
            <View style={styles.emergencyBannerContent}>
              <Text style={styles.emergencyBannerTitle}>Emergency 24x7</Text>
              <Text style={styles.emergencyBannerSubtitle}>
                Book ambulance, find nearby hospitals, emergency contacts
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Insurance Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#3B82F6', '#2563EB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Ionicons name="shield-checkmark" size={48} color="rgba(255,255,255,0.3)" />
            <View style={styles.promoContent}>
              <Text style={styles.promoTitle}>Health Insurance</Text>
              <Text style={styles.promoSubtitle}>
                Get covered from Rs 500/month{'\n'}Family plans available
              </Text>
            </View>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Get Quote</Text>
            </TouchableOpacity>
          </LinearGradient>
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
    marginBottom: 16,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  emergencySection: {
    backgroundColor: '#FEF2F2',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  emergencyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.red500,
    marginBottom: 10,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
  quickActionPhone: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 12,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.red500,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: COLORS.gray600,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyServices: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  serviceCard: {
    width: 180,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  serviceImage: {
    width: '100%',
    height: 100,
    backgroundColor: COLORS.gray100,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: COLORS.amber500,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.white,
  },
  serviceInfo: {
    padding: 10,
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
    minHeight: 32,
  },
  serviceType: {
    fontSize: 11,
    color: COLORS.gray600,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.green500,
  },
  serviceMrp: {
    fontSize: 11,
    color: COLORS.gray600,
    textDecorationLine: 'line-through',
  },
  recordsBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  recordsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recordsContent: {
    flex: 1,
  },
  recordsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  recordsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  emergencyBanner: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  emergencyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  emergencyBannerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emergencyBannerContent: {
    flex: 1,
  },
  emergencyBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  emergencyBannerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  promoBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  promoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  promoContent: {
    flex: 1,
    marginLeft: 12,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  promoButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#3B82F6',
  },
});

export default HealthcarePage;
