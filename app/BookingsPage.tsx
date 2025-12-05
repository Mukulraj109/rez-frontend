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

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  goldDark: '#E5A83D',
  navy: '#0B2240',
  text: '#1F2937',
  textMuted: '#6B7280',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  error: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
};

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
        colors={[COLORS.primary, COLORS.primaryDark]}
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
                filter === status && styles.filterTabActive,
                { borderColor: filter === status ? COLORS.primary : borderColor },
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
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading bookings...</ThemedText>
        </View>
      ) : bookings.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
        >
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.primary} />
          </View>
          <ThemedText style={styles.emptyTitle}>No Bookings Found</ThemedText>
          <ThemedText style={styles.emptyText}>
            {filter === 'all'
              ? "You don't have any bookings yet"
              : `You don't have any ${filter} bookings`}
          </ThemedText>
          <TouchableOpacity
            style={styles.exploreButton}
            onPress={() => router.push('/' as any)}
          >
            <ThemedText style={styles.exploreButtonText}>Explore Events</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
        >
          {bookings.map((booking) => (
            <View
              key={booking._id}
              style={styles.bookingCard}
            >
              {/* Event Image and Info */}
              <View style={styles.bookingHeader}>
                <View style={styles.eventImageContainer}>
                  <Ionicons name="calendar" size={28} color={COLORS.primary} />
                </View>
                <View style={styles.bookingInfo}>
                  <ThemedText style={styles.eventTitle}>
                    {booking.event?.title || 'Event'}
                  </ThemedText>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="location-outline" size={14} color={COLORS.textMuted} />
                    <ThemedText style={styles.metaText}>
                      {booking.event?.location || 'Location TBD'}
                    </ThemedText>
                  </View>
                  <View style={styles.bookingMeta}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
                    <ThemedText style={styles.metaText}>
                      {booking.event?.date ? formatDate(booking.event.date) : formatDate(booking.bookingDate)} •{' '}
                      {booking.event?.time || formatTime(booking.bookingDate)}
                    </ThemedText>
                  </View>
                  {booking.slotId && (
                    <View style={styles.bookingMeta}>
                      <Ionicons name="ellipse" size={8} color={COLORS.primary} />
                      <ThemedText style={styles.metaText}>Slot: {booking.slotId}</ThemedText>
                    </View>
                  )}
                </View>
              </View>

              {/* Booking Details */}
              <View style={styles.bookingDetails}>
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
                  <ThemedText style={styles.amountText}>
                    {booking.currency} {booking.amount.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Status:</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) + '15' }]}>
                    <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Actions */}
              {booking.status === 'confirmed' || booking.status === 'pending' ? (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelBooking(booking._id, booking.event?.title || 'Event')}
                >
                  <Ionicons name="close-circle-outline" size={18} color={COLORS.error} />
                  <ThemedText style={styles.cancelButtonText}>
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
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 25,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 44,
  },
  filterContainer: {
    borderBottomWidth: 1,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    backgroundColor: COLORS.white,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
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
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    color: COLORS.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  loginButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  exploreButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    gap: 14,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
  },
  bookingHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  eventImageContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    gap: 4,
  },
  eventTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.textMuted,
  },
  bookingDetails: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 14,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  amountText: {
    fontWeight: '700',
    fontSize: 16,
    color: COLORS.gold,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
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
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 4,
    borderColor: COLORS.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.error,
  },
});

