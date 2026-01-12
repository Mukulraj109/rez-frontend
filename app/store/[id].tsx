/**
 * Dynamic Store Detail Page
 * Route: /store/[id] - where id can be store slug or MongoDB _id
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
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';
import { showAlert } from '@/components/common/CrossPlatformAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  green500: '#22C55E',
  green600: '#16A34A',
  orange500: '#F97316',
  orange600: '#EA580C',
  amber500: '#F59E0B',
  red500: '#EF4444',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
};

interface Store {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string[];
  ratings: { average: number; count: number };
  location: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    coordinates: number[];
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
    whatsapp?: string;
  };
  offers: {
    cashback: number;
    minOrderAmount?: number;
    maxCashback?: number;
    isPartner: boolean;
    partnerLevel?: string;
  };
  operationalInfo: {
    hours: Record<string, { open: string; close: string; closed?: boolean }>;
    paymentMethods: string[];
  };
  tags: string[];
  serviceTypes?: string[];
  bookingType?: string;
  bookingConfig?: {
    enabled: boolean;
    requiresAdvanceBooking: boolean;
    allowWalkIn: boolean;
    slotDuration: number;
  };
  isActive: boolean;
  isFeatured: boolean;
  isVerified: boolean;
}

const StoreDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const [currentDayHours, setCurrentDayHours] = useState<{ open: string; close: string } | null>(null);

  const fetchStore = useCallback(async () => {
    if (!id) return;

    try {
      const response = await apiClient.get(`/stores/${id}`);
      const storeData = (response.data as any)?.store || response.data;
      setStore(storeData);

      // Check if store is currently open
      const now = new Date();
      const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const hours = storeData.operationalInfo?.hours?.[day];
      setCurrentDayHours(hours && !hours.closed ? hours : null);

      if (hours && !hours.closed) {
        const currentTime = now.getHours() * 100 + now.getMinutes();
        const openTime = parseInt(hours.open?.replace(':', '') || '0');
        const closeTime = parseInt(hours.close?.replace(':', '') || '2359');
        setIsOpen(currentTime >= openTime && currentTime <= closeTime);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      showAlert('Error', 'Failed to load store details', undefined, 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStore();
  };

  const handleCall = () => {
    if (store?.contact?.phone) {
      Linking.openURL(`tel:${store.contact.phone}`);
    }
  };

  const handleWhatsApp = () => {
    const phone = store?.contact?.whatsapp || store?.contact?.phone;
    if (phone) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      Linking.openURL(`whatsapp://send?phone=${cleanPhone}&text=Hi, I found you on Rez app!`);
    }
  };

  const handleDirections = () => {
    if (store?.location?.coordinates) {
      const [lng, lat] = store.location.coordinates;
      const url = Platform.select({
        ios: `maps://app?daddr=${lat},${lng}`,
        android: `google.navigation:q=${lat},${lng}`,
      });
      if (url) Linking.openURL(url);
    }
  };

  const handleWebsite = () => {
    if (store?.contact?.website) {
      Linking.openURL(store.contact.website);
    }
  };

  const handleBookNow = () => {
    if (!store) return;

    const fitnessKeywords = ['gym', 'fitness', 'yoga', 'studio', 'trainer', 'sports', 'pilates', 'crossfit', 'workout'];
    const isFitnessStore = store.tags?.some(tag =>
      fitnessKeywords.some(keyword => tag.toLowerCase().includes(keyword))
    ) || store.serviceTypes?.some(type =>
      fitnessKeywords.some(keyword => type.toLowerCase().includes(keyword))
    );

    if (isFitnessStore) {
      router.push({
        pathname: '/fitness/book/[storeId]',
        params: {
          storeId: store._id,
          storeName: store.name,
          cashback: store.offers?.cashback?.toString() || '0',
        },
      } as any);
    } else {
      router.push({
        pathname: '/booking',
        params: {
          storeId: store._id,
          storeName: store.name,
          serviceType: store.bookingType || 'SERVICE',
          cashback: store.offers?.cashback?.toString() || '0',
        },
      } as any);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getServiceTypeLabel = (): string => {
    if (store?.serviceTypes && store.serviceTypes.length > 0) {
      return store.serviceTypes
        .slice(0, 2)
        .map(s => s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        .join(' • ');
    }
    if (store?.tags && store.tags.length > 0) {
      return store.tags.slice(0, 2).map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(' • ');
    }
    return 'Store';
  };

  const getPartnerLevelColor = (level: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      platinum: { bg: '#E5E4E2', text: '#374151' },
      gold: { bg: '#FEF3C7', text: '#92400E' },
      silver: { bg: '#F3F4F6', text: '#374151' },
      bronze: { bg: '#FED7AA', text: '#9A3412' },
    };
    return colors[level] || { bg: COLORS.gray100, text: COLORS.gray600 };
  };

  const getDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingSpinner}>
          <ActivityIndicator size="large" color={COLORS.orange500} />
        </View>
        <Text style={styles.loadingText}>Loading store details...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Ionicons name="storefront-outline" size={48} color={COLORS.gray400} />
        </View>
        <Text style={styles.errorTitle}>Store Not Found</Text>
        <Text style={styles.errorDescription}>
          This store may have been removed or is temporarily unavailable.
        </Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={18} color={COLORS.white} />
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: store.banner?.[0] || store.logo || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.6)']}
            locations={[0, 0.4, 1]}
            style={styles.heroGradient}
          />

          {/* Top Navigation Bar */}
          <View style={styles.topNav}>
            <TouchableOpacity style={styles.navButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={22} color={COLORS.white} />
            </TouchableOpacity>
            <View style={styles.navRight}>
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="heart-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navButton}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Featured Badge */}
          {store.isFeatured && (
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={12} color={COLORS.amber500} />
              <Text style={styles.featuredText}>Featured</Text>
            </View>
          )}

          {/* Cashback Badge */}
          {store.offers?.cashback > 0 && (
            <View style={styles.cashbackBadge}>
              <LinearGradient
                colors={[COLORS.green500, COLORS.green600]}
                style={styles.cashbackGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="gift" size={14} color={COLORS.white} />
                <Text style={styles.cashbackText}>{store.offers.cashback}% Cashback</Text>
              </LinearGradient>
            </View>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.orange500} />
          }
        >
          {/* Main Info Card */}
          <View style={styles.mainCard}>
            <View style={styles.storeHeader}>
              <View style={styles.logoContainer}>
                <Image source={{ uri: store.logo }} style={styles.logo} />
                {store.isVerified && (
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  </View>
                )}
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName} numberOfLines={2}>{store.name}</Text>
                <Text style={styles.storeCategory}>{getServiceTypeLabel()}</Text>
                <View style={styles.ratingContainer}>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={12} color={COLORS.white} />
                    <Text style={styles.ratingValue}>{store.ratings?.average?.toFixed(1) || '4.5'}</Text>
                  </View>
                  <Text style={styles.reviewCount}>{store.ratings?.count || 0} reviews</Text>
                  {store.offers?.partnerLevel && (
                    <View style={[styles.partnerBadge, { backgroundColor: getPartnerLevelColor(store.offers.partnerLevel).bg }]}>
                      <Text style={[styles.partnerText, { color: getPartnerLevelColor(store.offers.partnerLevel).text }]}>
                        {store.offers.partnerLevel.toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Status & Hours */}
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, isOpen ? styles.openBadge : styles.closedBadge]}>
                <View style={[styles.statusDot, isOpen ? styles.openDot : styles.closedDot]} />
                <Text style={[styles.statusText, isOpen ? styles.openText : styles.closedText]}>
                  {isOpen ? 'Open Now' : 'Closed'}
                </Text>
              </View>
              {currentDayHours && (
                <Text style={styles.hoursText}>
                  {formatTime(currentDayHours.open)} - {formatTime(currentDayHours.close)}
                </Text>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsCard}>
            <TouchableOpacity style={styles.actionItem} onPress={handleCall}>
              <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call" size={22} color={COLORS.green500} />
              </View>
              <Text style={styles.actionLabel}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleWhatsApp}>
              <View style={[styles.actionIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              </View>
              <Text style={styles.actionLabel}>WhatsApp</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionItem} onPress={handleDirections}>
              <View style={[styles.actionIconBox, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="navigate" size={22} color={COLORS.blue500} />
              </View>
              <Text style={styles.actionLabel}>Directions</Text>
            </TouchableOpacity>

            {store.contact?.website ? (
              <TouchableOpacity style={styles.actionItem} onPress={handleWebsite}>
                <View style={[styles.actionIconBox, { backgroundColor: '#EDE9FE' }]}>
                  <Ionicons name="globe-outline" size={22} color={COLORS.purple500} />
                </View>
                <Text style={styles.actionLabel}>Website</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionItem}>
                <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="bookmark-outline" size={22} color={COLORS.orange500} />
                </View>
                <Text style={styles.actionLabel}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* About Section */}
          {store.description && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={20} color={COLORS.navy} />
                <Text style={styles.sectionTitle}>About</Text>
              </View>
              <Text style={styles.descriptionText}>{store.description}</Text>
            </View>
          )}

          {/* Location Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={COLORS.navy} />
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <TouchableOpacity style={styles.locationBox} onPress={handleDirections}>
              <View style={styles.locationIconBox}>
                <Ionicons name="map" size={24} color={COLORS.orange500} />
              </View>
              <View style={styles.locationDetails}>
                <Text style={styles.addressText}>{store.location?.address}</Text>
                <Text style={styles.cityText}>
                  {store.location?.city}, {store.location?.state} {store.location?.pincode}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
            </TouchableOpacity>
          </View>

          {/* Operating Hours */}
          {store.operationalInfo?.hours && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="time-outline" size={20} color={COLORS.navy} />
                <Text style={styles.sectionTitle}>Operating Hours</Text>
              </View>
              <View style={styles.hoursGrid}>
                {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                  const hours = store.operationalInfo?.hours?.[day];
                  const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day;
                  return (
                    <View key={day} style={[styles.hoursRow, isToday && styles.hoursRowToday]}>
                      <Text style={[styles.dayText, isToday && styles.dayTextToday]}>{getDayName(day)}</Text>
                      <Text style={[styles.timeText, hours?.closed && styles.closedTimeText]}>
                        {hours?.closed ? 'Closed' : hours ? `${formatTime(hours.open)} - ${formatTime(hours.close)}` : 'Not set'}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Services */}
          {store.serviceTypes && store.serviceTypes.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="grid-outline" size={20} color={COLORS.navy} />
                <Text style={styles.sectionTitle}>Services</Text>
              </View>
              <View style={styles.tagsContainer}>
                {store.serviceTypes.map((service, index) => (
                  <View key={index} style={styles.serviceTag}>
                    <Ionicons name="checkmark-circle" size={14} color={COLORS.green500} />
                    <Text style={styles.serviceTagText}>
                      {service.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Payment Methods */}
          {store.operationalInfo?.paymentMethods && store.operationalInfo.paymentMethods.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="wallet-outline" size={20} color={COLORS.navy} />
                <Text style={styles.sectionTitle}>Payment Methods</Text>
              </View>
              <View style={styles.paymentContainer}>
                {store.operationalInfo.paymentMethods.map((method, index) => (
                  <View key={index} style={styles.paymentItem}>
                    <Ionicons
                      name={
                        method === 'card' ? 'card-outline' :
                        method === 'upi' ? 'phone-portrait-outline' :
                        method === 'wallet' ? 'wallet-outline' :
                        method === 'cash' ? 'cash-outline' : 'ellipse-outline'
                      }
                      size={20}
                      color={COLORS.gray600}
                    />
                    <Text style={styles.paymentText}>{method.toUpperCase()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tags */}
          {store.tags && store.tags.length > 0 && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Ionicons name="pricetags-outline" size={20} color={COLORS.navy} />
                <Text style={styles.sectionTitle}>Tags</Text>
              </View>
              <View style={styles.tagsContainer}>
                {store.tags.map((tag, index) => (
                  <View key={index} style={styles.tagBadge}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 140 }} />
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.bottomLeft}>
            {store.offers?.cashback > 0 ? (
              <>
                <Text style={styles.earnLabel}>Earn up to</Text>
                <View style={styles.cashbackRow}>
                  <Ionicons name="gift" size={16} color={COLORS.green500} />
                  <Text style={styles.cashbackAmount}>{store.offers.cashback}% Cashback</Text>
                </View>
              </>
            ) : (
              <Text style={styles.partnerLabel}>Partner Store</Text>
            )}
          </View>
          <TouchableOpacity style={styles.bookButton} onPress={handleBookNow} activeOpacity={0.8}>
            <LinearGradient
              colors={[COLORS.orange500, COLORS.orange600]}
              style={styles.bookGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bookText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: COLORS.gray500,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 32,
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
  },
  errorDescription: {
    fontSize: 15,
    color: COLORS.gray500,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 32,
    backgroundColor: COLORS.orange500,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Hero Section
  heroContainer: {
    height: 300,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navRight: {
    flexDirection: 'row',
    gap: 10,
  },
  featuredBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 24,
    left: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  featuredText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.amber500,
  },
  cashbackBadge: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cashbackGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  scrollView: {
    flex: 1,
    marginTop: -50,
  },

  // Main Info Card
  mainCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  storeHeader: {
    flexDirection: 'row',
    gap: 16,
  },
  logoContainer: {
    position: 'relative',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.green500,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    lineHeight: 26,
  },
  storeCategory: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  reviewCount: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  partnerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  partnerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  openBadge: {
    backgroundColor: '#DCFCE7',
  },
  closedBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  openDot: {
    backgroundColor: COLORS.green500,
  },
  closedDot: {
    backgroundColor: COLORS.red500,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  openText: {
    color: COLORS.green600,
  },
  closedText: {
    color: COLORS.red500,
  },
  hoursText: {
    fontSize: 13,
    color: COLORS.gray500,
  },

  // Quick Actions Card
  actionsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '500',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
  },
  descriptionText: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 22,
  },

  // Location
  locationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: 14,
    borderRadius: 14,
    gap: 14,
  },
  locationIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationDetails: {
    flex: 1,
  },
  addressText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  cityText: {
    fontSize: 13,
    color: COLORS.gray500,
    marginTop: 4,
  },

  // Operating Hours
  hoursGrid: {
    gap: 2,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  hoursRowToday: {
    backgroundColor: '#FFF7ED',
  },
  dayText: {
    fontSize: 14,
    color: COLORS.gray600,
    fontWeight: '500',
  },
  dayTextToday: {
    color: COLORS.orange500,
    fontWeight: '600',
  },
  timeText: {
    fontSize: 14,
    color: COLORS.navy,
    fontWeight: '500',
  },
  closedTimeText: {
    color: COLORS.red500,
  },

  // Services
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  serviceTagText: {
    fontSize: 13,
    color: COLORS.green600,
    fontWeight: '500',
  },

  // Payment Methods
  paymentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray600,
  },

  // Tags
  tagBadge: {
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.gray600,
    fontWeight: '500',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomLeft: {},
  earnLabel: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  cashbackAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.green500,
  },
  partnerLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.navy,
  },
  bookButton: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: COLORS.orange500,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 16,
  },
  bookText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default StoreDetailPage;
