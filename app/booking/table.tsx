import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
  Dimensions,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import storesApi from '@/services/storesApi';
import tableBookingApi from '@/services/tableBookingApi';

const { width } = Dimensions.get('window');

interface Store {
  _id: string;
  name: string;
  logo?: string;
  category: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  businessHours?: {
    [key: string]: { open: string; close: string; isClosed?: boolean };
  };
  bookingConfig?: {
    enabled: boolean;
    slotDuration: number; // in minutes
    maxPartySize: number;
    minPartySize: number;
    advanceBookingDays: number;
  };
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
  tablesLeft?: number;
}

interface DateItem {
  id: string;
  date: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  fullDate: Date;
}

export default function TableBookingPage() {
  const { storeId } = useLocalSearchParams();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storesApi.getStoreById(storeId as string);
      if (response.success && response.data) {
        setStore(response.data);
      } else {
        Alert.alert('Error', 'Failed to load store details');
      }
    } catch (error) {
      console.error('Error loading store:', error);
      Alert.alert('Error', 'Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  // Generate next 14 days for date selection
  const availableDates: DateItem[] = useMemo(() => {
    const days = store?.bookingConfig?.advanceBookingDays || 14;
    const dates: DateItem[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        id: date.toISOString().split('T')[0],
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate(),
        monthName: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date,
      });
    }
    return dates;
  }, [store]);

  // Generate time slots based on store working hours (90-minute slots)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const slotDuration = store?.bookingConfig?.slotDuration || 90; // default 90 minutes

    // Get today's day name
    const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const hours = store?.businessHours?.[dayOfWeek];

    if (hours && !hours.isClosed) {
      // Parse opening and closing hours
      const [openHour, openMinute] = hours.open.split(':').map(Number);
      const [closeHour, closeMinute] = hours.close.split(':').map(Number);

      let currentHour = openHour;
      let currentMinute = openMinute;

      while (
        currentHour < closeHour ||
        (currentHour === closeHour && currentMinute < closeMinute)
      ) {
        const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
        const hour12 = currentHour > 12 ? currentHour - 12 : currentHour === 0 ? 12 : currentHour;
        const displayTime = `${hour12}:${currentMinute.toString().padStart(2, '0')} ${currentHour >= 12 ? 'PM' : 'AM'}`;

        // Check if slot is in the past
        const isToday = selectedDate.toDateString() === new Date().toDateString();
        const now = new Date();
        const isPast = isToday &&
          (currentHour < now.getHours() ||
           (currentHour === now.getHours() && currentMinute <= now.getMinutes()));

        slots.push({
          id: timeString,
          time: displayTime,
          available: !isPast,
          tablesLeft: Math.floor(Math.random() * 5) + 1, // Mock data
        });

        // Add slot duration
        currentMinute += slotDuration;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
    } else {
      // Default slots if no business hours configured (9 AM to 9 PM, 90-minute slots)
      for (let hour = 9; hour <= 21; hour += 1.5) {
        const wholeHour = Math.floor(hour);
        const minutes = (hour % 1) * 60;
        const timeString = `${wholeHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        const displayHour = wholeHour > 12 ? wholeHour - 12 : wholeHour;
        const displayTime = `${displayHour}:${minutes.toString().padStart(2, '0')} ${wholeHour >= 12 ? 'PM' : 'AM'}`;

        const isToday = selectedDate.toDateString() === new Date().toDateString();
        const isPast = isToday && wholeHour < new Date().getHours();

        slots.push({
          id: timeString,
          time: displayTime,
          available: !isPast,
          tablesLeft: Math.floor(Math.random() * 5) + 1,
        });
      }
    }

    return slots;
  };

  const timeSlots = useMemo(() => generateTimeSlots(), [selectedDate, store]);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const handlePartySizeChange = (increment: boolean) => {
    const maxSize = store?.bookingConfig?.maxPartySize || 10;
    const minSize = store?.bookingConfig?.minPartySize || 1;

    if (increment) {
      setPartySize(Math.min(partySize + 1, maxSize));
    } else {
      setPartySize(Math.max(partySize - 1, minSize));
    }
  };

  const handleBooking = () => {
    // Validate form
    if (!selectedTime) {
      Alert.alert('Missing Information', 'Please select a time slot');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('Missing Information', 'Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return;
    }

    const selectedTimeSlot = timeSlots.find(s => s.id === selectedTime);

    // Show confirmation
    Alert.alert(
      'Confirm Booking',
      `Book a table for ${partySize} ${partySize === 1 ? 'person' : 'people'} on ${formatDate(selectedDate)} at ${selectedTimeSlot?.time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: handleConfirmBooking,
        },
      ]
    );
  };

  const handleConfirmBooking = async () => {
    try {
      setSubmitting(true);
      const response = await tableBookingApi.createTableBooking({
        storeId: storeId as string,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime!,
        guests: partySize,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || '',
        specialRequests: specialRequests.trim() || undefined,
      });

      if (response.success && response.data) {
        const selectedTimeSlot = timeSlots.find(s => s.id === selectedTime);
        Alert.alert(
          'Booking Confirmed!',
          `Your table has been booked!\nBooking Number: ${response.data.bookingId || response.data.confirmationCode || 'N/A'}\nDate: ${formatDate(selectedDate)}\nTime: ${selectedTimeSlot?.time}\nParty Size: ${partySize}`,
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Booking Failed', response.message || 'Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      Alert.alert('Booking Failed', error.message || 'Unable to create booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.loadingHeader}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading restaurant details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!store) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.loadingHeader}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
          <ThemedText style={styles.errorText}>Restaurant not found</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <ThemedText style={styles.errorButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const maxPartySize = store?.bookingConfig?.maxPartySize || 10;
  const quickPartySizes = Array.from(
    { length: Math.min(4, maxPartySize) },
    (_, i) => (i + 1) * 2
  ).filter(size => size <= maxPartySize);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header with Purple Gradient */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Book a Table</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{store.name}</ThemedText>
          <ThemedText style={styles.storeCategory}>{store.category}</ThemedText>
          {store.bookingConfig && (
            <View style={styles.bookingInfoBadge}>
              <Ionicons name="time-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.bookingInfoText}>
                {store.bookingConfig.slotDuration || 90} min slots
              </ThemedText>
              <ThemedText style={styles.bookingInfoDivider}>•</ThemedText>
              <Ionicons name="people-outline" size={14} color="#FFFFFF" />
              <ThemedText style={styles.bookingInfoText}>
                Up to {store.bookingConfig.maxPartySize || 10} guests
              </ThemedText>
            </View>
          )}
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.dateScroll}
            contentContainerStyle={styles.dateScrollContent}
          >
            {availableDates.map((dateItem) => {
              const isSelected = dateItem.date === selectedDate.toISOString().split('T')[0];
              const isToday = dateItem.date === new Date().toISOString().split('T')[0];

              return (
                <TouchableOpacity
                  key={dateItem.id}
                  onPress={() => {
                    setSelectedDate(dateItem.fullDate);
                    setSelectedTime(null); // Reset time when date changes
                  }}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                  ]}
                >
                  {isToday && (
                    <View style={styles.todayBadge}>
                      <ThemedText style={styles.todayBadgeText}>Today</ThemedText>
                    </View>
                  )}
                  <ThemedText style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                    {dateItem.dayName}
                  </ThemedText>
                  <ThemedText style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                    {dateItem.dayNumber}
                  </ThemedText>
                  <ThemedText style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                    {dateItem.monthName}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Select Time</ThemedText>
          </View>
          {timeSlots.length > 0 ? (
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => slot.available && setSelectedTime(slot.id)}
                    disabled={!slot.available}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      !slot.available && styles.timeSlotDisabled,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.timeText,
                        isSelected && styles.timeTextSelected,
                        !slot.available && styles.timeTextDisabled,
                      ]}
                    >
                      {slot.time}
                    </ThemedText>
                    {slot.available && slot.tablesLeft && slot.tablesLeft <= 3 && (
                      <ThemedText style={styles.tablesLeftText}>
                        {slot.tablesLeft} left
                      </ThemedText>
                    )}
                    {!slot.available && (
                      <ThemedText style={styles.bookedText}>Booked</ThemedText>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={48} color="#D1D5DB" />
              <ThemedText style={styles.emptyStateText}>
                No time slots available for this date
              </ThemedText>
            </View>
          )}
        </View>

        {/* Party Size */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="people" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Party Size</ThemedText>
          </View>

          <View style={styles.partySizeContainer}>
            <TouchableOpacity
              style={styles.partySizeButton}
              onPress={() => handlePartySizeChange(false)}
              disabled={partySize <= (store?.bookingConfig?.minPartySize || 1)}
            >
              <Ionicons
                name="remove-circle"
                size={40}
                color={partySize <= (store?.bookingConfig?.minPartySize || 1) ? '#D1D5DB' : '#8B5CF6'}
              />
            </TouchableOpacity>

            <View style={styles.partySizeDisplay}>
              <ThemedText style={styles.partySizeNumber}>{partySize}</ThemedText>
              <ThemedText style={styles.partySizeLabel}>
                {partySize === 1 ? 'Guest' : 'Guests'}
              </ThemedText>
            </View>

            <TouchableOpacity
              style={styles.partySizeButton}
              onPress={() => handlePartySizeChange(true)}
              disabled={partySize >= maxPartySize}
            >
              <Ionicons
                name="add-circle"
                size={40}
                color={partySize >= maxPartySize ? '#D1D5DB' : '#8B5CF6'}
              />
            </TouchableOpacity>
          </View>

          {quickPartySizes.length > 0 && (
            <View style={styles.quickSizeContainer}>
              {quickPartySizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  onPress={() => setPartySize(size)}
                  style={[
                    styles.quickSizeButton,
                    partySize === size && styles.quickSizeButtonSelected,
                  ]}
                >
                  <Ionicons
                    name="people"
                    size={16}
                    color={partySize === size ? '#FFFFFF' : '#8B5CF6'}
                  />
                  <ThemedText
                    style={[
                      styles.quickSizeText,
                      partySize === size && styles.quickSizeTextSelected,
                    ]}
                  >
                    {size}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Your Details</ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Full Name *"
                placeholderTextColor="#9CA3AF"
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Phone Number *"
                placeholderTextColor="#9CA3AF"
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Email (Optional)"
                placeholderTextColor="#9CA3AF"
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="create-outline" size={20} color="#9CA3AF" style={[styles.inputIcon, styles.textAreaIcon]} />
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor }]}
                placeholder="Special Requests (Optional)"
                placeholderTextColor="#9CA3AF"
                value={specialRequests}
                onChangeText={setSpecialRequests}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Fixed Button */}
      <View style={[styles.bottomContainer, { backgroundColor }]}>
        <TouchableOpacity
          onPress={handleBooking}
          style={styles.bookButton}
          activeOpacity={0.8}
          disabled={submitting}
        >
          <LinearGradient
            colors={submitting ? ['#9CA3AF', '#6B7280'] : ['#8B5CF6', '#7C3AED']}
            style={styles.bookButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {submitting ? (
              <>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <ThemedText style={styles.bookButtonText}>Confirming...</ThemedText>
              </>
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <ThemedText style={styles.bookButtonText}>Confirm Booking</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  loadingHeader: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  storeInfo: {
    alignItems: 'center',
  },
  storeName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  storeCategory: {
    fontSize: 15,
    color: '#E9D5FF',
    marginBottom: 8,
  },
  bookingInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  bookingInfoText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  bookingInfoDivider: {
    fontSize: 12,
    color: '#FFFFFF',
    marginHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
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
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    color: '#6B7280',
  },
  errorButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dateScrollContent: {
    paddingRight: 20,
  },
  dateCard: {
    width: 80,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  dateCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  todayBadge: {
    position: 'absolute',
    top: 4,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateMonth: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dateTextSelected: {
    color: '#8B5CF6',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: (width - 64) / 3,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  timeSlotSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  timeSlotDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  timeTextSelected: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  timeTextDisabled: {
    color: '#9CA3AF',
  },
  tablesLeftText: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 4,
  },
  bookedText: {
    fontSize: 11,
    color: '#EF4444',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  partySizeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  partySizeButton: {
    padding: 8,
  },
  partySizeDisplay: {
    alignItems: 'center',
  },
  partySizeNumber: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  partySizeLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
  },
  quickSizeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  quickSizeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    backgroundColor: '#FFFFFF',
    gap: 6,
  },
  quickSizeButtonSelected: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  quickSizeText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  quickSizeTextSelected: {
    color: '#FFFFFF',
  },
  formContainer: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 12,
  },
  textAreaIcon: {
    marginTop: 16,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 14,
    paddingBottom: 14,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  bookButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  bookButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
