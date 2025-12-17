/**
 * Pay In Store - Enter Amount Screen
 *
 * Dark themed screen with:
 * - Store header with name and location
 * - Distance warning banner
 * - Bill amount input with custom keypad
 * - EMI plans banner
 * - Available offers section
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { EnterAmountParams, StorePaymentInfo, StorePaymentOffer, OffersResponse } from '@/types/storePayment.types';
import apiClient from '@/services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EnterAmountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<EnterAmountParams>();
  const { storeId, storeName, storeLogo } = params;

  const [amount, setAmount] = useState('0');
  const [store, setStore] = useState<StorePaymentInfo | null>(null);
  const [offers, setOffers] = useState<StorePaymentOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOffers, setIsLoadingOffers] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  useEffect(() => {
    loadStoreDetails();
    getUserLocation();
  }, [storeId]);

  // Load offers when store is loaded
  useEffect(() => {
    if (store) {
      loadOffers();
    }
  }, [store]);

  // Calculate distance when both user location and store coordinates are available
  useEffect(() => {
    if (userLocation && store?.location?.coordinates) {
      const [storeLng, storeLat] = store.location.coordinates;
      const dist = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        storeLat,
        storeLng
      );
      setDistance(dist);
    }
  }, [userLocation, store]);

  // Get user's current location
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Location permission denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (err) {
      console.error('Failed to get user location:', err);
    }
  };

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Format distance for display
  const formatDistance = (dist: number): string => {
    if (dist < 1) {
      return `${Math.round(dist * 1000)} m`;
    }
    return `${dist.toFixed(1)} km`;
  };

  const loadStoreDetails = async () => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.get<{ store: StorePaymentInfo }>(`/stores/${storeId}`);
      console.log('Store API response:', response);
      if (response.success && response.data?.store) {
        setStore(response.data.store);
      }
    } catch (err: any) {
      console.error('Failed to load store:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOffers = async () => {
    if (!storeId) return;

    try {
      setIsLoadingOffers(true);
      const response = await apiClient.get<OffersResponse>(`/store-payment/offers/${storeId}`, { amount: 0 });

      if (response.success && response.data) {
        const offersData = response.data;
        // Combine all offers for preview
        const allOffers = [
          ...(offersData.storeOffers || []),
          ...(offersData.bankOffers || []),
          ...(offersData.rezOffers || []),
        ].slice(0, 4); // Show max 4 offers in preview
        setOffers(allOffers);
      }
    } catch (err: any) {
      console.error('Failed to load offers:', err);
    } finally {
      setIsLoadingOffers(false);
    }
  };

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace') {
      setAmount(prev => {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      });
    } else if (key === '.') {
      setAmount(prev => {
        if (prev.includes('.')) return prev;
        return prev + '.';
      });
    } else {
      setAmount(prev => {
        if (prev === '0' && key !== '.') return key;
        if (prev.includes('.') && prev.split('.')[1]?.length >= 2) return prev;
        if (prev.length >= 8) return prev;
        return prev + key;
      });
    }
  }, []);

  const numericAmount = parseFloat(amount) || 0;

  const handleProceed = () => {
    if (numericAmount <= 0) return;

    router.push({
      pathname: '/pay-in-store/offers',
      params: {
        storeId,
        storeName,
        amount: numericAmount.toString(),
      },
    });
  };

  const formatDisplayAmount = (val: string) => {
    const num = parseFloat(val) || 0;
    if (val.includes('.')) {
      const parts = val.split('.');
      return parts[0] + '.' + (parts[1] || '').padEnd(2, '0').slice(0, 2);
    }
    return num.toFixed(2);
  };

  // Build store address from location data
  const getStoreAddress = () => {
    console.log('=== DEBUG: getStoreAddress ===');
    console.log('store:', store);
    console.log('store?.location:', store?.location);
    console.log('store keys:', store ? Object.keys(store) : 'no store');

    if (!store) {
      console.log('No store data');
      return '';
    }

    // Try location object first
    if (store.location) {
      console.log('Found store.location:', store.location);
      const { address, city, state, pincode } = store.location;
      console.log('address:', address, 'city:', city, 'state:', state, 'pincode:', pincode);
      const parts = [address, city, state, pincode].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
    }

    // Fallback to address object if exists
    if ((store as any).address) {
      const addr = (store as any).address;
      console.log('Found store.address:', addr);
      if (typeof addr === 'string') return addr;
      const parts = [addr.street, addr.city, addr.state, addr.formattedAddress].filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1]; // Use formattedAddress if available
    }

    console.log('No address found in store data');
    return '';
  };

  const storeAddress = getStoreAddress() || (isLoading ? 'Loading...' : '');
  const displayStoreName = storeName || store?.name || 'Store';

  // Get offer icon based on type
  const getOfferIcon = (offer: StorePaymentOffer): string => {
    switch (offer.type) {
      case 'FLAT_OFF':
        return 'tag-outline';
      case 'PERCENTAGE_OFF':
      case 'CASHBACK':
        return 'percent';
      case 'BONUS_COINS':
        return 'star-outline';
      default:
        return 'pricetag-outline';
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.storeName} numberOfLines={1}>{displayStoreName}</Text>
            <Text style={styles.storeAddress} numberOfLines={1}>{storeAddress}</Text>
          </View>
        </View>

        {/* Distance Warning Banner - Only show if distance > 1km */}
        {distance !== null && distance > 1 && (
          <View style={styles.distanceWarning}>
            <Text style={styles.distanceText}>
              You're <Text style={styles.distanceBold}>{formatDistance(distance)}</Text> away from this store
            </Text>
            <Text style={styles.distanceSubtext}>Please ensure you're paying at the correct store</Text>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Amount Section */}
          <Text style={styles.amountLabel}>Enter your bill amount</Text>

          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <Text style={styles.amountDisplay}>{formatDisplayAmount(amount)}</Text>
          </View>

          {/* EMI Banner */}
          <LinearGradient
            colors={['#1E40AF', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emiBanner}
          >
            <View style={styles.emiIconContainer}>
              <Text style={styles.emiIconText}>0%</Text>
            </View>
            <View style={styles.emiContent}>
              <Text style={styles.emiTitle}>No Cost EMI plans available</Text>
              <Text style={styles.emiSubtitle}>above ₹4000</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.knowMoreText}>Know more</Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Available Offers Section */}
          <Text style={styles.offersTitle}>Available Offers</Text>

          {isLoadingOffers ? (
            <View style={styles.offersLoading}>
              <ActivityIndicator size="small" color="#00C06A" />
            </View>
          ) : offers.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersContainer}
            >
              {offers.map((offer) => (
                <View key={offer.id} style={styles.offerCard}>
                  <View style={styles.offerIconContainer}>
                    <Ionicons
                      name={getOfferIcon(offer) as any}
                      size={20}
                      color="#00C06A"
                    />
                  </View>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  <Text style={styles.offerDescription} numberOfLines={2}>{offer.description}</Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.noOffers}>
              <Text style={styles.noOffersText}>No offers available</Text>
            </View>
          )}
        </ScrollView>

        {/* Proceed Button */}
        <View style={styles.proceedContainer}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              numericAmount <= 0 && styles.proceedButtonDisabled,
            ]}
            onPress={handleProceed}
            disabled={numericAmount <= 0}
          >
            <Text style={[
              styles.proceedText,
              numericAmount <= 0 && styles.proceedTextDisabled,
            ]}>
              Proceed
            </Text>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={numericAmount > 0 ? '#FFFFFF' : '#6B7280'}
            />
          </TouchableOpacity>
        </View>

        {/* Custom Number Keypad */}
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            {['1', '2', '3'].map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadText}>{key}</Text>
                {key !== '1' && (
                  <Text style={styles.keypadSubText}>
                    {key === '2' ? 'ABC' : 'DEF'}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['4', '5', '6'].map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadText}>{key}</Text>
                <Text style={styles.keypadSubText}>
                  {key === '4' ? 'GHI' : key === '5' ? 'JKL' : 'MNO'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            {['7', '8', '9'].map((key) => (
              <TouchableOpacity
                key={key}
                style={styles.keypadButton}
                onPress={() => handleKeyPress(key)}
              >
                <Text style={styles.keypadText}>{key}</Text>
                <Text style={styles.keypadSubText}>
                  {key === '7' ? 'PQRS' : key === '8' ? 'TUV' : 'WXYZ'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.keypadRow}>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleKeyPress('.')}
            >
              <Text style={styles.keypadText}>.</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleKeyPress('0')}
            >
              <Text style={styles.keypadText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleKeyPress('backspace')}
            >
              <Ionicons name="backspace-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  storeAddress: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  distanceWarning: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  distanceText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  distanceBold: {
    fontWeight: '700',
  },
  distanceSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3F3F3F',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  amountDisplay: {
    fontSize: 32,
    fontWeight: '600',
    color: '#6B7280',
  },
  emiBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 24,
  },
  emiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emiIconText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emiContent: {
    flex: 1,
    marginLeft: 12,
  },
  emiTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emiSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  knowMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  offersTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  offersContainer: {
    paddingRight: 16,
    gap: 12,
  },
  offerCard: {
    width: SCREEN_WIDTH * 0.55,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
  },
  offerIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 192, 106, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  offersLoading: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noOffers: {
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
  },
  noOffersText: {
    fontSize: 14,
    color: '#6B7280',
  },
  proceedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  proceedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 4,
  },
  proceedButtonDisabled: {
    backgroundColor: '#2A2A2A',
  },
  proceedText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  proceedTextDisabled: {
    color: '#6B7280',
  },
  keypadContainer: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 5,
  },
  keypadButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginHorizontal: 3,
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
  },
  keypadText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  keypadSubText: {
    fontSize: 8,
    color: '#6B7280',
    marginTop: 1,
    letterSpacing: 1,
  },
});
