/**
 * Healthcare Category Page - Dynamic route
 * Handles doctors, teleconsult, insurance, offers
 * Redirects to dedicated pages for lab, pharmacy, dental, emergency, records
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
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';

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

// Category configuration
const categoryConfig: Record<string, {
  title: string;
  icon: string;
  gradientColors: [string, string];
  apiType: string;
  dedicatedPage?: string;
}> = {
  doctors: {
    title: 'Doctors',
    icon: 'medical',
    gradientColors: ['#3B82F6', '#2563EB'],
    apiType: 'doctor',
  },
  pharmacy: {
    title: 'Pharmacy',
    icon: 'medkit',
    gradientColors: ['#22C55E', '#16A34A'],
    apiType: 'pharmacy',
    dedicatedPage: '/healthcare/pharmacy',
  },
  lab: {
    title: 'Lab Tests',
    icon: 'flask',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    apiType: 'lab',
    dedicatedPage: '/healthcare/lab',
  },
  'lab-tests': {
    title: 'Lab Tests',
    icon: 'flask',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    apiType: 'lab',
    dedicatedPage: '/healthcare/lab',
  },
  dental: {
    title: 'Dental Care',
    icon: 'happy',
    gradientColors: ['#EC4899', '#DB2777'],
    apiType: 'doctor',
    dedicatedPage: '/healthcare/dental',
  },
  emergency: {
    title: 'Emergency 24x7',
    icon: 'warning',
    gradientColors: ['#EF4444', '#DC2626'],
    apiType: 'emergency',
    dedicatedPage: '/healthcare/emergency',
  },
  records: {
    title: 'Health Records',
    icon: 'document-text',
    gradientColors: ['#06B6D4', '#0891B2'],
    apiType: 'records',
    dedicatedPage: '/healthcare/records',
  },
  teleconsult: {
    title: 'Teleconsult',
    icon: 'videocam',
    gradientColors: ['#10B981', '#059669'],
    apiType: 'doctor',
  },
  insurance: {
    title: 'Health Insurance',
    icon: 'shield-checkmark',
    gradientColors: ['#F97316', '#EA580C'],
    apiType: 'insurance',
  },
  offers: {
    title: 'Health Offers',
    icon: 'pricetag',
    gradientColors: ['#EF4444', '#DC2626'],
    apiType: 'offers',
  },
};

interface Store {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  metadata?: {
    specialization?: string;
    experience?: string;
    qualification?: string;
    consultationFee?: number;
    availableSlots?: string[];
    languages?: string[];
    services?: string[];
    cashbackPercentage?: number;
  };
}

const filterOptions = ['All', 'Nearby', 'Top Rated', 'Best Price'];

const HealthcareCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const config = categoryConfig[category || 'doctors'] || categoryConfig['doctors'];

  // Redirect to dedicated pages if they exist
  if (config.dedicatedPage) {
    return <Redirect href={config.dedicatedPage as any} />;
  }

  // Fetch stores from API
  const fetchStores = async () => {
    try {
      setLoading(true);
      let url = `/stores?category=healthcare`;

      if (config.apiType === 'doctor') {
        url += '&type=doctor';
        // For teleconsult, filter for doctors offering video consultation
        if (category === 'teleconsult') {
          // This would need backend support for filtering by teleconsult capability
        }
      } else if (config.apiType === 'pharmacy') {
        url += '&type=pharmacy';
      } else if (config.apiType === 'lab') {
        url += '&type=lab';
      }

      // Add filter params
      if (selectedFilter === 'Top Rated') {
        url += '&sortBy=ratings.average&sortOrder=desc';
      } else if (selectedFilter === 'Best Price') {
        url += '&sortBy=metadata.consultationFee&sortOrder=asc';
      }

      const response = await apiClient.get(url);

      if (response.success && response.data?.stores) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      Alert.alert('Error', 'Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [category, selectedFilter]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStores();
    setRefreshing(false);
  }, [category, selectedFilter]);

  const handleCallStore = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Not Available', 'Phone number is not available.');
    }
  };

  const handleBookAppointment = (store: Store) => {
    // Navigate to consultation booking
    router.push({
      pathname: '/consultation/book',
      params: {
        storeId: store._id,
        storeName: store.name,
        fee: store.metadata?.consultationFee || 500,
      },
    } as any);
  };

  const renderStoreCard = (store: Store) => {
    const cashback = store.metadata?.cashbackPercentage || Math.floor(Math.random() * 15) + 10;

    return (
      <TouchableOpacity
        key={store._id}
        style={styles.itemCard}
        onPress={() => router.push(`/store/${store.slug}` as any)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.storeImageContainer}>
            {store.logo ? (
              <Image source={{ uri: store.logo }} style={styles.storeImage} />
            ) : store.banner ? (
              <Image source={{ uri: store.banner }} style={styles.storeImage} />
            ) : (
              <View style={styles.storeImagePlaceholder}>
                <Ionicons name={config.icon as any} size={32} color={config.gradientColors[0]} />
              </View>
            )}
          </View>
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>{cashback}% CB</Text>
          </View>
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{store.name}</Text>

          {store.metadata?.specialization && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{store.metadata.specialization}</Text>
            </View>
          )}

          {store.metadata?.qualification && (
            <Text style={styles.qualificationText}>{store.metadata.qualification}</Text>
          )}

          {store.metadata?.experience && (
            <Text style={styles.experienceText}>{store.metadata.experience}</Text>
          )}

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
            <Text style={styles.locationText}>
              {store.address.city}, {store.address.state}
            </Text>
          </View>

          <View style={styles.itemMeta}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={14} color={COLORS.amber500} />
              <Text style={styles.ratingText}>
                {store.ratings.average.toFixed(1)} ({store.ratings.count})
              </Text>
            </View>

            {store.metadata?.languages && store.metadata.languages.length > 0 && (
              <View style={styles.languagesContainer}>
                <Ionicons name="chatbubble-outline" size={12} color={COLORS.gray600} />
                <Text style={styles.languagesText}>
                  {store.metadata.languages.slice(0, 2).join(', ')}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.itemFooter}>
            <View>
              {store.metadata?.consultationFee ? (
                <Text style={styles.priceText}>Rs {store.metadata.consultationFee}</Text>
              ) : (
                <Text style={styles.priceText}>Contact for price</Text>
              )}
              <Text style={styles.priceLabel}>Consultation Fee</Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => handleCallStore(store.contact.phone)}
              >
                <Ionicons name="call" size={18} color={config.gradientColors[0]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bookButton, { backgroundColor: config.gradientColors[0] }]}
                onPress={() => handleBookAppointment(store)}
              >
                <Text style={styles.bookButtonText}>Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Static content for insurance and offers (placeholder until APIs are ready)
  const renderStaticContent = () => {
    if (category === 'insurance') {
      return (
        <View style={styles.staticContent}>
          <View style={styles.comingSoonCard}>
            <Ionicons name="shield-checkmark" size={64} color={COLORS.gray200} />
            <Text style={styles.comingSoonTitle}>Health Insurance</Text>
            <Text style={styles.comingSoonText}>
              Compare and buy health insurance plans from top providers.
              This feature is coming soon!
            </Text>
            <TouchableOpacity style={styles.notifyButton}>
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (category === 'offers') {
      return (
        <View style={styles.staticContent}>
          <View style={styles.comingSoonCard}>
            <Ionicons name="pricetag" size={64} color={COLORS.gray200} />
            <Text style={styles.comingSoonTitle}>Health Offers</Text>
            <Text style={styles.comingSoonText}>
              Exclusive health offers and discounts.
              Stay tuned for amazing deals!
            </Text>
            <TouchableOpacity style={styles.notifyButton}>
              <Text style={styles.notifyButtonText}>Notify Me</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={config.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerTitleRow}>
              <Ionicons name={config.icon as any} size={24} color={COLORS.white} />
              <Text style={styles.headerTitle}>{config.title}</Text>
            </View>
            <Text style={styles.headerSubtitle}>
              {stores.length > 0 ? `${stores.length} options available` : 'Finding options...'}
            </Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      {(config.apiType === 'doctor' || config.apiType === 'pharmacy' || config.apiType === 'lab') && (
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => setSelectedFilter(filter)}
                style={[
                  styles.filterChip,
                  selectedFilter === filter && { backgroundColor: config.gradientColors[0] },
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === filter && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[config.gradientColors[0]]}
          />
        }
      >
        {/* Static content for insurance/offers */}
        {(category === 'insurance' || category === 'offers') && renderStaticContent()}

        {/* Dynamic content for doctors/pharmacies/labs */}
        {config.apiType !== 'insurance' && config.apiType !== 'offers' && (
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={config.gradientColors[0]} />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : stores.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name={config.icon as any} size={64} color={COLORS.gray200} />
                <Text style={styles.emptyText}>No {config.title.toLowerCase()} found</Text>
                <Text style={styles.emptySubtext}>
                  Try adjusting your filters or check back later
                </Text>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {stores.map(renderStoreCard)}
              </View>
            )}
          </>
        )}

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
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.gray600,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 4,
    textAlign: 'center',
  },
  itemsList: {
    padding: 16,
    gap: 16,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    position: 'relative',
  },
  storeImageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.gray50,
  },
  storeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  storeImagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray50,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  itemInfo: {
    padding: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  qualificationText: {
    fontSize: 13,
    color: COLORS.cyan500,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 13,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  languagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  languagesText: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
  },
  priceLabel: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  staticContent: {
    padding: 16,
  },
  comingSoonCard: {
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  notifyButton: {
    backgroundColor: COLORS.red500,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  notifyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default HealthcareCategoryPage;
