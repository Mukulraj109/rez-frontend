import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import outletsApi, { Outlet } from '@/services/outletsApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function OutletsPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const storeId = params.storeId as string;
  const storeName = params.storeName as string;

  useEffect(() => {
    if (storeId) {
      fetchOutlets();
    }
  }, [storeId]);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await outletsApi.getOutletsByStore(storeId);

      if (response.success && response.data) {
        setOutlets(response.data.outlets || []);
        setTotalCount(response.data.total || 0);
      } else {
        setError(response.message || 'Failed to load outlets');
      }
    } catch (err: any) {
      console.error('Error fetching outlets:', err);
      setError('Unable to load outlets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    const phoneUrl = `tel:${phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'Phone calling is not supported on this device');
        }
      })
      .catch((err) => {
        console.error('Error opening phone dialer:', err);
        Alert.alert('Error', 'Unable to make call');
      });
  };

  const handleNavigate = (outlet: Outlet) => {
    const [lng, lat] = outlet.location.coordinates;
    const label = encodeURIComponent(outlet.name);
    let url = '';
    if (Platform.OS === 'ios') {
      url = `maps:0,0?q=${label}@${lat},${lng}`;
    } else {
      url = `geo:0,0?q=${lat},${lng}(${label})`;
    }

    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          const webUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        console.error('Error opening maps:', err);
        Alert.alert('Error', 'Unable to open maps');
      });
  };

  const getCurrentDayHours = (outlet: Outlet) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = new Date().getDay();
    const dayName = days[today];

    const hours = outlet.openingHours?.find(
      (h) => h.day.toLowerCase() === dayName
    );

    if (!hours || hours.isClosed) return { isOpen: false, text: 'Closed today' };

    // Check if currently open
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const isOpen = currentTime >= hours.open && currentTime <= hours.close;

    return {
      isOpen,
      text: `${hours.open} - ${hours.close}`,
      opensAt: hours.open,
      closesAt: hours.close
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${suffix}`;
  };

  // Render Header
  const renderHeader = () => (
    <LinearGradient
      colors={['#10B981', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.headerGradient}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            {storeName ? `${storeName}` : 'Store Outlets'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {totalCount} {totalCount === 1 ? 'Location' : 'Locations'} Available
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.locationIconBg}>
            <Ionicons name="location" size={20} color="#10B981" />
          </View>
        </View>
      </View>
    </LinearGradient>
  );

  // Render Outlet Card
  const renderOutletCard = (outlet: Outlet, index: number) => {
    const hoursInfo = getCurrentDayHours(outlet);

    return (
      <View key={outlet._id} style={styles.outletCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.outletIconContainer}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.outletIconGradient}
            >
              <Ionicons name="storefront" size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <View style={styles.outletHeaderInfo}>
            <Text style={styles.outletName} numberOfLines={1}>{outlet.name}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: hoursInfo.isOpen ? '#ECFDF5' : '#FEF2F2' }
            ]}>
              <View style={[
                styles.statusDot,
                { backgroundColor: hoursInfo.isOpen ? '#10B981' : '#EF4444' }
              ]} />
              <Text style={[
                styles.statusText,
                { color: hoursInfo.isOpen ? '#10B981' : '#EF4444' }
              ]}>
                {hoursInfo.isOpen ? 'Open Now' : 'Closed'}
              </Text>
            </View>
          </View>
          <View style={styles.indexBadge}>
            <Text style={styles.indexText}>{index + 1}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Info Section */}
        <View style={styles.infoSection}>
          {/* Address */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="location-outline" size={16} color="#10B981" />
            </View>
            <Text style={styles.infoText} numberOfLines={2}>{outlet.address}</Text>
          </View>

          {/* Phone */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="call-outline" size={16} color="#3B82F6" />
            </View>
            <Text style={styles.infoText}>{outlet.phone}</Text>
          </View>

          {/* Hours */}
          <View style={styles.infoRow}>
            <View style={styles.infoIconBg}>
              <Ionicons name="time-outline" size={16} color="#F59E0B" />
            </View>
            <View style={styles.hoursContainer}>
              <Text style={styles.hoursLabel}>Today's Hours:</Text>
              <Text style={[
                styles.hoursValue,
                { color: hoursInfo.isOpen ? '#10B981' : '#EF4444' }
              ]}>
                {hoursInfo.text === 'Closed today'
                  ? hoursInfo.text
                  : `${formatTime(hoursInfo.opensAt || '09:00')} - ${formatTime(hoursInfo.closesAt || '21:00')}`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => handleCall(outlet.phone)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.callButtonGradient}
            >
              <Ionicons name="call" size={18} color="#FFFFFF" />
              <Text style={styles.callButtonText}>Call Now</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navigateButton}
            onPress={() => handleNavigate(outlet)}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={18} color="#10B981" />
            <Text style={styles.navigateButtonText}>Get Directions</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingSpinner}>
            <ActivityIndicator size="large" color="#10B981" />
          </View>
          <Text style={styles.loadingText}>Finding nearby outlets...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <View style={styles.errorIconBg}>
            <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
          </View>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOutlets} activeOpacity={0.8}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.retryButtonGradient}
            >
              <Ionicons name="refresh" size={20} color="#FFFFFF" />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      {renderHeader()}

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {outlets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['#D1FAE5', '#A7F3D0']}
              style={styles.emptyIconBg}
            >
              <Ionicons name="location-outline" size={56} color="#10B981" />
            </LinearGradient>
            <Text style={styles.emptyTitle}>No Outlets Found</Text>
            <Text style={styles.emptyText}>
              This store doesn't have any outlet locations listed yet. Please check back later.
            </Text>
            <TouchableOpacity
              style={styles.backToStoreButton}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={18} color="#10B981" />
              <Text style={styles.backToStoreText}>Back to Store</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#10B981', '#059669']}
                  style={styles.statIconBg}
                >
                  <Ionicons name="location" size={18} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.statValue}>{totalCount}</Text>
                <Text style={styles.statLabel}>Outlets</Text>
              </View>
              <View style={styles.statCard}>
                <LinearGradient
                  colors={['#3B82F6', '#1D4ED8']}
                  style={styles.statIconBg}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                </LinearGradient>
                <Text style={styles.statValue}>
                  {outlets.filter(o => getCurrentDayHours(o).isOpen).length}
                </Text>
                <Text style={styles.statLabel}>Open Now</Text>
              </View>
            </View>

            {/* Outlet Cards */}
            {outlets.map((outlet, index) => renderOutletCard(outlet, index))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  headerRight: {
    marginLeft: 12,
  },
  locationIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingSpinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingVertical: 14,
    gap: 10,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },
  backToStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  backToStoreText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#10B981',
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
  },

  // Outlet Card
  outletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outletIconContainer: {
    marginRight: 14,
  },
  outletIconGradient: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outletHeaderInfo: {
    flex: 1,
  },
  outletName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    paddingTop: 5,
  },
  hoursContainer: {
    flex: 1,
    paddingTop: 5,
  },
  hoursLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  hoursValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  callButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  callButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  navigateButtonText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
  },
});
