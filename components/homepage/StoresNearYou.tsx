import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNearbyStores, NearbyStore } from '@/hooks/useNearbyStores';

interface StoresNearYouProps {
  onMapViewPress?: () => void;
}

const StoresNearYou: React.FC<StoresNearYouProps> = ({ onMapViewPress }) => {
  const router = useRouter();

  // Use the nearby stores hook to fetch real data
  const {
    stores,
    isLoading,
    error,
    hasLocationPermission,
    refetch,
    requestLocationPermission,
  } = useNearbyStores({ radius: 2, limit: 5 });

  const handleMapView = () => {
    if (onMapViewPress) {
      onMapViewPress();
    } else {
      router.push('/map');
    }
  };

  const handleStorePress = (storeId: string) => {
    router.push(`/store/${storeId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="location" size={20} color="#EC4899" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Stores Near You</Text>
              <Text style={styles.subtitle}>Within 2km • Live availability.</Text>
            </View>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <Text style={styles.loadingText}>Finding stores nearby...</Text>
        </View>
      </View>
    );
  }

  // Location permission not granted
  if (!hasLocationPermission) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="location" size={20} color="#EC4899" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Stores Near You</Text>
              <Text style={styles.subtitle}>Within 2km • Live availability.</Text>
            </View>
          </View>
        </View>
        <View style={styles.permissionContainer}>
          <View style={styles.permissionIconContainer}>
            <Ionicons name="location-outline" size={48} color="#9CA3AF" />
          </View>
          <Text style={styles.permissionTitle}>Enable Location</Text>
          <Text style={styles.permissionText}>
            Allow location access to discover stores near you
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={requestLocationPermission}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.enableButtonText}>Enable Location</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="location" size={20} color="#EC4899" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Stores Near You</Text>
              <Text style={styles.subtitle}>Within 2km • Live availability.</Text>
            </View>
          </View>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to load stores</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Empty state - no stores found
  if (stores.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="location" size={20} color="#EC4899" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Stores Near You</Text>
              <Text style={styles.subtitle}>Within 2km • Live availability.</Text>
            </View>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No Stores Nearby</Text>
          <Text style={styles.emptyText}>
            No stores found within 2km of your location
          </Text>
        </View>
      </View>
    );
  }

  // Success state - show stores
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <Ionicons name="location" size={20} color="#EC4899" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>Stores Near You</Text>
            <Text style={styles.subtitle}>Within 2km • Live availability.</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleMapView}
          activeOpacity={0.7}
          style={styles.mapViewButton}
        >
          <Text style={styles.mapViewText}>Map View</Text>
          <Ionicons name="chevron-forward" size={14} color="#00C06A" />
        </TouchableOpacity>
      </View>

      {/* Store Cards */}
      <View style={styles.storesContainer}>
        {stores.map((store: NearbyStore) => (
          <TouchableOpacity
            key={store.id}
            onPress={() => handleStorePress(store.id)}
            activeOpacity={0.9}
            style={styles.storeCard}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F7FAFC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              {/* Store Name Row */}
              <View style={styles.storeNameRow}>
                <View style={styles.storeNameLeft}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.isLive && (
                    <View style={styles.liveBadge}>
                      <View style={styles.liveBadgeDot} />
                      <Text style={styles.liveBadgeText}>Live</Text>
                    </View>
                  )}
                </View>
                <View style={styles.distanceContainer}>
                  <Ionicons name="location-outline" size={12} color="#3B82F6" />
                  <Text style={styles.distance}>{store.distance}</Text>
                </View>
              </View>

              {/* Status Row */}
              <View style={styles.statusRow}>
                <View style={styles.statusLeft}>
                  <Ionicons
                    name={store.closingSoon ? "time-outline" : "checkmark-circle-outline"}
                    size={14}
                    color={store.closingSoon ? "#F97316" : "#10B981"}
                    style={styles.statusIcon}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      store.closingSoon && styles.closingSoonText,
                    ]}
                  >
                    {store.status} Wait: {store.waitTime}
                  </Text>
                </View>
                <View style={styles.cashbackContainer}>
                  <Ionicons name="cash-outline" size={12} color="#10B981" />
                  <Text style={styles.cashbackText}>{store.cashback}</Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  headerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(236, 72, 153, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(236, 72, 153, 0.2)',
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '400',
  },
  mapViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  mapViewText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  storesContainer: {
    gap: 14,
  },
  storeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardGradient: {
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
  },
  storeNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeNameLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  storeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
    letterSpacing: -0.2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  liveBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  distance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 192, 106, 0.08)',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  statusIcon: {
    marginRight: 2,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#10B981',
  },
  closingSoonText: {
    color: '#F97316',
  },
  cashbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#10B981',
  },
  // Loading state styles
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Permission state styles
  permissionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginTop: 8,
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  enableButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Error state styles
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    marginTop: 12,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 13,
    color: '#B91C1C',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default StoresNearYou;

