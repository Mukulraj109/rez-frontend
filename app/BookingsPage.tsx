import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuth } from '@/contexts/AuthContext';
import eventsApiService from '@/services/eventsApi';
import { showAlert, alertOk, confirmAlert } from '@/utils/alert';

interface UserBooking {
  _id: string;
  eventId: any;
  slotId?: string;
  bookingDate: string;
  status: string;
  amount: number;
  currency: string;
  attendeeInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  bookingReference: string;
  createdAt: string;
  event?: {
    _id: string;
    title: string;
    image: string;
    location: string;
    date: string;
    time: string;
  };
}

type FilterStatus = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function BookingsPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 20,
    hasMore: false,
    total: 0,
  });

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');

  // Load bookings when page is focused (e.g., when navigating back from booking)
  useFocusEffect(
    useCallback(() => {
      if (authState.isAuthenticated) {
        loadBookings();
      } else {
        setLoading(false);
      }
    }, [authState.isAuthenticated, filter])
  );

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [authState.isAuthenticated, filter]);

  const loadBookings = async () => {
    if (!authState.isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const result = await eventsApiService.getUserBookings(status, pagination.limit, 0);
      
      setBookings(result.bookings);
      setPagination({
        ...pagination,
        total: result.total,
        hasMore: result.hasMore,
        offset: 0,
      });
    } catch (error: any) {
      console.error('❌ [BOOKINGS PAGE] Error loading bookings:', error);
      Alert.alert('Error', error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  }, [filter, authState.isAuthenticated]);

  const handleCancelBooking = async (bookingId: string, eventTitle: string) => {
    const confirmed = await confirmAlert(
      'Cancel Booking',
      `Are you sure you want to cancel your booking for "${eventTitle}"?`,
      'Cancel',
      'Confirm'
    );

    if (!confirmed) return;

    try {
      const result = await eventsApiService.cancelBooking(bookingId);
      
      if (result.success) {
        alertOk('Booking Cancelled', result.message || 'Your booking has been cancelled successfully.');
        await loadBookings(); // Refresh list
      } else {
        alertOk('Error', result.message || 'Failed to cancel booking');
      }
    } catch (error: any) {
      console.error('❌ [BOOKINGS PAGE] Error cancelling booking:', error);
      alertOk('Error', error.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return '#10B981'; // green
      case 'pending':
        return '#F59E0B'; // amber
      case 'cancelled':
        return '#EF4444'; // red
      default:
        return '#6B7280'; // gray
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!authState.isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>My Bookings</ThemedText>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed" size={64} color={textColor} style={styles.emptyIcon} />
          <ThemedText style={styles.emptyTitle}>Login Required</ThemedText>
          <ThemedText style={styles.emptyText}>
            Please login to view your bookings
          </ThemedText>
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/login' as any)}
          >
            <ThemedText style={styles.loginButtonText}>Login</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>My Bookings</ThemedText>
        <View style={styles.placeholder} />
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={[styles.filterContainer, { backgroundColor: cardBackground, borderBottomColor: borderColor }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {(['all', 'confirmed', 'pending', 'cancelled'] as FilterStatus[]).map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.filterTab,
                filter === status && { backgroundColor: tintColor },
                { borderColor: filter === status ? tintColor : borderColor },
              ]}
              onPress={() => setFilter(status)}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  filter === status && styles.filterTextActive,
                ]}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Bookings List */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={styles.loadingText}>Loading bookings...</ThemedText>
        </View>
      ) : bookings.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <Ionicons name="calendar-outline" size={64} color={textColor} style={styles.emptyIcon} />
          <ThemedText style={styles.emptyTitle}>No Bookings Found</ThemedText>
          <ThemedText style={styles.emptyText}>
            {filter === 'all'
              ? "You don't have any bookings yet"
              : `You don't have any ${filter} bookings`}
          </ThemedText>
          <TouchableOpacity
            style={[styles.exploreButton, { backgroundColor: tintColor }]}
            onPress={() => router.push('/' as any)}
          >
            <ThemedText style={styles.exploreButtonText}>Explore Events</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {bookings.map((booking) => (
            <View
              key={booking._id}
              style={[styles.bookingCard, { backgroundColor: cardBackground, borderColor: borderColor }]}
            >
              {/* Event Image and Info */}
              <View style={styles.bookingHeader}>
                {booking.event?.image && (
                  <View style={styles.eventImageContainer}>
                    <Ionicons name="calendar" size={32} color={tintColor} />
                  </View>
                )}
                <View style={styles.bookingInfo}>
                  <ThemedText style={styles.eventTitle}>
                    {booking.event?.title || 'Event'}
                  </ThemedText>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="location-outline" size={14} color={textColor} />
                    <ThemedText style={styles.metaText}>
                      {booking.event?.location || 'Location TBD'}
                    </ThemedText>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="time-outline" size={14} color={textColor} />
                    <ThemedText style={styles.metaText}>
                      {booking.event?.date ? formatDate(booking.event.date) : formatDate(booking.bookingDate)} •{' '}
                      {booking.event?.time || formatTime(booking.bookingDate)}
                    </ThemedText>
                  </View>
                  {booking.slotId && (
                    <View style={styles.bookingMeta}>
                      <Ionicons name="time" size={14} color={textColor} />
                      <ThemedText style={styles.metaText}>Slot: {booking.slotId}</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              {/* Booking Details */}
              <View style={[styles.bookingDetails, { borderTopColor: borderColor }]}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Booking Reference:</ThemedText>
                  <ThemedText style={styles.detailValue}>{booking.bookingReference}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Attendee:</ThemedText>
                  <ThemedText style={styles.detailValue}>{booking.attendeeInfo.name}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Amount:</ThemedText>
                  <ThemedText style={[styles.detailValue, styles.amountText]}>
                    {booking.currency} {booking.amount}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Actions */}
              {booking.status === 'confirmed' || booking.status === 'pending' ? (
                <TouchableOpacity
                  style={[styles.cancelButton, { borderColor: '#EF4444' }]}
                  onPress={() => handleCancelBooking(booking._id, booking.event?.title || 'Event')}
                >
                  <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                  <ThemedText style={[styles.cancelButtonText, { color: '#EF4444' }]}>
                    Cancel Booking
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  filterContainer: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 24,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  eventImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 14,
    opacity: 0.7,
  },
  bookingDetails: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  amountText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

