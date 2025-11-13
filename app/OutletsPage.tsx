import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import outletsApi, { Outlet } from '@/services/outletsApi';

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
    const address = encodeURIComponent(outlet.address);
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
          // Fallback to Google Maps web
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
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const today = new Date().getDay();
    const dayName = days[today];
    
    const hours = outlet.openingHours?.find(
      (h) => h.day.toLowerCase() === dayName
    );

    if (!hours || hours.isClosed) return 'Closed today';
    return `Open ${hours.open} - ${hours.close}`;
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Store Outlets</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading outlets...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Store Outlets</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorTitle}>Oops!</ThemedText>
          <ThemedText style={styles.errorMessage}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchOutlets} activeOpacity={0.8}>
            <Ionicons name="refresh-outline" size={20} color="#fff" />
            <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={styles.header}
        accessibilityRole="header"
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText
          style={styles.headerTitle}
          accessibilityRole="header"
        >
          {storeName ? `${storeName} Outlets` : 'Store Outlets'}
        </ThemedText>
        <View style={styles.placeholder} />
      </View>

      {/* Outlet Count */}
      <View
        style={styles.countBanner}
        accessibilityLabel={`${totalCount} ${totalCount === 1 ? 'outlet' : 'outlets'} found`}
        accessibilityRole="summary"
      >
        <ThemedText style={styles.countText}>
          {totalCount} {totalCount === 1 ? 'Outlet' : 'Outlets'} Found
        </ThemedText>
      </View>

      {/* Outlets List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {outlets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="location-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyTitle}>No Outlets Found</ThemedText>
            <ThemedText style={styles.emptyText}>
              This store doesn't have any outlets listed yet.
            </ThemedText>
          </View>
        ) : (
          outlets.map((outlet, index) => (
            <View
              key={outlet._id}
              style={styles.outletCard}
              accessibilityRole="region"
              accessibilityLabel={`Outlet ${index + 1}. ${outlet.name}. ${outlet.address}. ${getCurrentDayHours(outlet)}`}
            >
              {/* Outlet Number Badge */}
              <View style={styles.outletBadge} accessibilityElementsHidden>
                <ThemedText style={styles.outletBadgeText}>{index + 1}</ThemedText>
              </View>

              {/* Outlet Name */}
              <ThemedText
                style={styles.outletName}
                accessibilityRole="header"
              >
                {outlet.name}
              </ThemedText>

              {/* Address */}
              <View style={styles.outletSection}>
                <Ionicons name="location-outline" size={20} color="#6B7280" />
                <ThemedText style={styles.outletAddress}>
                  {outlet.address}
                </ThemedText>
              </View>

              {/* Contact */}
              <View style={styles.outletSection}>
                <Ionicons name="call-outline" size={20} color="#6B7280" />
                <ThemedText style={styles.outletContact}>{outlet.phone}</ThemedText>
              </View>

              {/* Opening Hours Today */}
              <View style={styles.outletSection}>
                <Ionicons name="time-outline" size={20} color="#6B7280" />
                <ThemedText style={styles.outletHours}>{getCurrentDayHours(outlet)}</ThemedText>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => handleCall(outlet.phone)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Call ${outlet.name} at ${outlet.phone}`}
                  accessibilityHint="Double tap to call this outlet"
                >
                  <Ionicons name="call" size={18} color="#fff" />
                  <ThemedText style={styles.callButtonText}>Call</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navigateButton}
                  onPress={() => handleNavigate(outlet)}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel={`Navigate to ${outlet.name}`}
                  accessibilityHint="Double tap to open maps and navigate"
                >
                  <Ionicons name="navigate" size={18} color="#8B5CF6" />
                  <ThemedText style={styles.navigateButtonText}>Navigate</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </ThemedView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  countBanner: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  countText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  outletCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  outletBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#8B5CF6',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outletBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  outletName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
    paddingRight: 40,
  },
  outletSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
  },
  outletAddress: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  outletContact: {
    flex: 1,
    fontSize: 14,
    color: '#6B7280',
  },
  outletHours: {
    flex: 1,
    fontSize: 14,
    color: '#10B981',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  callButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  navigateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE9FE',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  navigateButtonText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
});
