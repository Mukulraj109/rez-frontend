import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import storesApi from '@/services/storesApi';

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
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

export default function BookingPage() {
  const { storeId } = useLocalSearchParams();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('1');

  useEffect(() => {
    loadStoreDetails();
  }, [storeId]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storesApi.getStoreById(storeId as string);
      if (response.success && response.data) {
        setStore(response.data);
      }
    } catch (error) {
      console.error('Error loading store:', error);
      Alert.alert('Error', 'Failed to load store details');
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots (9 AM to 9 PM in 30-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute of [0, 30]) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour > 12 ? hour - 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;

        // Simple availability logic - can be enhanced with backend data
        const isPast = selectedDate.toDateString() === new Date().toDateString() &&
                       hour < new Date().getHours();

        slots.push({
          id: timeString,
          time: displayTime,
          available: !isPast,
        });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Generate next 7 days for date selection
  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const nextDays = getNextDays(7);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
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

    // Show confirmation
    Alert.alert(
      'Confirm Booking',
      `Book a table for ${numberOfPeople} on ${formatDate(selectedDate)} at ${timeSlots.find(s => s.id === selectedTime)?.time}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            // TODO: Implement actual booking API call
            Alert.alert(
              'Booking Confirmed!',
              `Your booking has been confirmed. You will receive a confirmation message shortly.`,
              [
                {
                  text: 'OK',
                  onPress: () => router.back(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 100 }} />
      </ThemedView>
    );
  }

  if (!store) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText style={styles.errorText}>Store not found</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
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
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {nextDays.map((date, index) => {
              const isSelected = date.toDateString() === selectedDate.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(date);
                    setSelectedTime(null); // Reset time when date changes
                  }}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                  ]}
                >
                  <ThemedText style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </ThemedText>
                  <ThemedText style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                    {date.getDate()}
                  </ThemedText>
                  <ThemedText style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                    {date.toLocaleDateString('en-US', { month: 'short' })}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Time</ThemedText>
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
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Number of People */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Number of People</ThemedText>
          <View style={styles.peopleSelector}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                onPress={() => setNumberOfPeople(num.toString())}
                style={[
                  styles.peopleButton,
                  numberOfPeople === num.toString() && styles.peopleButtonSelected,
                ]}
              >
                <ThemedText
                  style={[
                    styles.peopleText,
                    numberOfPeople === num.toString() && styles.peopleTextSelected,
                  ]}
                >
                  {num}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Your Details</ThemedText>

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Full Name *"
            placeholderTextColor="#9CA3AF"
            value={customerName}
            onChangeText={setCustomerName}
          />

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Phone Number *"
            placeholderTextColor="#9CA3AF"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[styles.input, { color: textColor, borderColor }]}
            placeholder="Email (Optional)"
            placeholderTextColor="#9CA3AF"
            value={customerEmail}
            onChangeText={setCustomerEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, styles.textArea, { color: textColor, borderColor }]}
            placeholder="Special Requests (Optional)"
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity onPress={handleBooking} style={styles.bookButton}>
          <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.bookButtonGradient}>
            <ThemedText style={styles.bookButtonText}>Confirm Booking</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#E9D5FF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dateCard: {
    width: 70,
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#FFFFFF',
  },
  dateCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  dateMonth: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dateTextSelected: {
    color: '#FFFFFF',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
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
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  timeTextSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  timeTextDisabled: {
    color: '#9CA3AF',
  },
  peopleSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  peopleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  peopleButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#8B5CF6',
  },
  peopleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  peopleTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
  },
});
