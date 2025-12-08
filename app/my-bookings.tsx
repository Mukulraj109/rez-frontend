// My Bookings Page
// Shows user's service bookings (salon, spa, etc.)

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import bookingService from '@/services/bookingApi';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceBooking {
  id: string;
  bookingNumber?: string;
  service: {
    _id: string;
    name: string;
    images?: Array<{ url: string }>;
  };
  store: {
    _id: string;
    name: string;
  };
  bookingDate: string;
  timeSlot: {
    start: string;
    end: string;
  };
  duration: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  pricing: {
    basePrice: number;
    total: number;
  };
  createdAt: string;
}

const MyBookingsPage = () => {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      if (!authState.isAuthenticated || !authState.token) {
        setErrorMessage('Please login to view your bookings');
        setLoading(false);
        return;
      }

      const response = await bookingService.getUserBookings({
        status: activeTab,
        sortBy: activeTab === 'upcoming' ? 'date_asc' : 'date_desc',
        limit: 20,
      });

      if (response.success && response.data?.bookings) {
        setBookings(response.data.bookings as unknown as ServiceBooking[]);
      } else {
        setBookings([]);
        if (response.error) {
          console.log('Booking fetch error:', response.error);
        }
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      setBookings([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authState.isAuthenticated, authState.token, activeTab]);

  // Refresh on focus
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [fetchBookings])
  );

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings, activeTab]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await bookingService.cancelBooking(bookingId);
              if (response.success) {
                Alert.alert('Success', 'Booking cancelled successfully');
                fetchBookings();
              } else {
                Alert.alert('Error', response.error || 'Failed to cancel booking');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'completed':
        return '#3B82F6';
      case 'cancelled':
      case 'no_show':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      case 'no_show':
        return 'No Show';
      default:
        return status;
    }
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours % 12 || 12;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderBooking = ({ item }: { item: ServiceBooking }) => {
    const canCancel = item.status === 'confirmed' || item.status === 'pending';
    const bookingDate = new Date(item.bookingDate);
    const isUpcoming = bookingDate > new Date();

    return (
      <TouchableOpacity
        style={styles.bookingCard}
        onPress={() => {
          // Navigate to booking details if needed
        }}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName} numberOfLines={1}>
              {item.service?.name || 'Service'}
            </Text>
            <Text style={styles.storeName} numberOfLines={1}>
              {item.store?.name || 'Store'}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color="#6B7280" />
            <Text style={styles.detailText}>{formatDate(item.bookingDate)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} color="#6B7280" />
            <Text style={styles.detailText}>
              {formatTime(item.timeSlot?.start)} - {formatTime(item.timeSlot?.end)}
            </Text>
          </View>
          {item.duration && (
            <View style={styles.detailRow}>
              <Ionicons name="hourglass-outline" size={18} color="#6B7280" />
              <Text style={styles.detailText}>{item.duration} minutes</Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total</Text>
            <Text style={styles.priceValue}>
              ₹{(item.pricing?.total || item.pricing?.basePrice || 0).toLocaleString()}
            </Text>
          </View>

          {canCancel && isUpcoming && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => handleCancelBooking(item.id)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Booking Number */}
        {item.bookingNumber && (
          <View style={styles.bookingNumberContainer}>
            <Text style={styles.bookingNumberLabel}>Booking #</Text>
            <Text style={styles.bookingNumber}>{item.bookingNumber}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {activeTab === 'upcoming' ? 'No Upcoming Bookings' : 'No Past Bookings'}
      </Text>
      <Text style={styles.emptyText}>
        {activeTab === 'upcoming'
          ? 'Book a service to see your upcoming appointments here'
          : 'Your completed bookings will appear here'}
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={styles.browseButton}
          onPress={() => router.push('/(tabs)/categories' as any)}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
          <Text style={styles.browseButtonText}>Browse Services</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !refreshing && bookings.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
        <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Bookings</Text>
            <View style={styles.headerRight} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />

      {/* Header */}
      <LinearGradient colors={['#00C06A', '#00796B']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={styles.headerRight} />
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
            onPress={() => setActiveTab('upcoming')}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'past' && styles.activeTab]}
            onPress={() => setActiveTab('past')}
          >
            <Text style={[styles.tabText, activeTab === 'past' && styles.activeTabText]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Error Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={20} color="#EF4444" />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}

      {/* Bookings List */}
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00C06A"
            colors={['#00C06A']}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  activeTabText: {
    color: '#00C06A',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingDetails: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#00C06A',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
  bookingNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 6,
  },
  bookingNumberLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  bookingNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  browseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00C06A',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: '#DC2626',
  },
});

export default MyBookingsPage;
