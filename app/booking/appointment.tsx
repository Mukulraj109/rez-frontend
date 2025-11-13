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
import storesApi, { Store } from '@/services/storesApi';
import servicesApi, { ServiceItem } from '@/services/servicesApi';
import bookingApi from '@/services/bookingApi';

// Service type icon mapping
const SERVICE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  haircut: 'cut',
  'hair styling': 'cut',
  'color treatment': 'color-palette',
  coloring: 'color-palette',
  facial: 'sparkles',
  massage: 'hand-left',
  spa: 'water',
  manicure: 'hand-right',
  pedicure: 'footsteps',
  waxing: 'flash',
  makeup: 'brush',
  'hair treatment': 'flask',
  threading: 'remove',
  'nail art': 'color-fill',
  default: 'cut-outline',
};

// Helper function to get icon for service
const getServiceIcon = (serviceName: string): keyof typeof Ionicons.glyphMap => {
  const name = serviceName.toLowerCase();
  for (const [key, icon] of Object.entries(SERVICE_ICONS)) {
    if (name.includes(key)) {
      return icon;
    }
  }
  return SERVICE_ICONS.default;
};

interface TimeSlot {
  id: string;
  time: string;
  displayTime: string;
  available: boolean;
}

export default function AppointmentBookingPage() {
  const { storeId } = useLocalSearchParams<{ storeId: string }>();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');

  // State management
  const [store, setStore] = useState<Store | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Booking selections
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  useEffect(() => {
    if (storeId) {
      loadStoreDetails();
      loadStoreServices();
    }
  }, [storeId]);

  const loadStoreDetails = async () => {
    try {
      setLoading(true);
      const response = await storesApi.getStoreById(storeId);
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

  const loadStoreServices = async () => {
    try {
      setServicesLoading(true);
      const response = await servicesApi.getStoreServices(storeId);
      if (response.success && response.data?.services) {
        setServices(response.data.services);
      }
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setServicesLoading(false);
    }
  };

  // Generate next 30 days for date selection
  const getNextDays = (count: number = 30): Date[] => {
    const days: Date[] = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Generate time slots based on working hours (60-minute intervals)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];

    // Default working hours: 9 AM to 8 PM
    let startHour = 9;
    let endHour = 20;

    // If store has working hours, use them
    if (store?.hours && store.hours.length > 0) {
      const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
      const todayHours = store.hours.find(h => h.day.toLowerCase() === dayName.toLowerCase());

      if (todayHours && !todayHours.closed) {
        const openTime = todayHours.open.split(':');
        const closeTime = todayHours.close.split(':');
        startHour = parseInt(openTime[0]);
        endHour = parseInt(closeTime[0]);
      }
    }

    // Generate 60-minute slots
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = `${hour.toString().padStart(2, '0')}:00`;
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayTime = `${displayHour}:00 ${period}`;

      // Check if slot is in the past for today
      const isToday = selectedDate.toDateString() === new Date().toDateString();
      const isPast = isToday && hour <= new Date().getHours();

      slots.push({
        id: timeString,
        time: timeString,
        displayTime,
        available: !isPast,
      });
    }

    return slots;
  };

  const nextDays = getNextDays();
  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const validateForm = (): boolean => {
    if (!selectedService) {
      Alert.alert('Missing Information', 'Please select a service');
      return false;
    }
    if (!selectedTime) {
      Alert.alert('Missing Information', 'Please select a time slot');
      return false;
    }
    if (!customerName.trim()) {
      Alert.alert('Missing Information', 'Please enter your full name');
      return false;
    }
    if (!customerPhone.trim()) {
      Alert.alert('Missing Information', 'Please enter your phone number');
      return false;
    }
    if (customerPhone.trim().length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleConfirmAppointment = async () => {
    if (!validateForm()) return;

    // Show confirmation dialog with summary
    const summary = `
Service: ${selectedService?.name}
Date: ${formatDate(selectedDate)}
Time: ${selectedTime?.displayTime}
Duration: ${selectedService?.duration ? formatDuration(selectedService.duration) : 'N/A'}
Price: ₹${selectedService?.price}
    `.trim();

    Alert.alert(
      'Confirm Appointment',
      summary,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: submitBooking,
        },
      ]
    );
  };

  const submitBooking = async () => {
    if (!selectedService || !selectedTime) return;

    try {
      setSubmitting(true);

      const bookingData = {
        serviceId: selectedService.id,
        storeId: storeId,
        date: selectedDate.toISOString().split('T')[0],
        timeSlot: selectedTime.time,
        notes: specialInstructions.trim() || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
      };

      const response = await bookingApi.createBooking(bookingData);

      if (response.success) {
        // Get appointment number/ID from response
        const appointmentNumber = response.data?.id || 'N/A';

        // Success alert with appointment details
        const successMessage = `
Your appointment has been confirmed!

Appointment Number: ${appointmentNumber}
Service: ${selectedService.name}
Date: ${formatDate(selectedDate)}
Time: ${selectedTime.displayTime}
Store: ${store?.name}

You will receive a confirmation message at ${customerPhone}${customerEmail ? ` and ${customerEmail}` : ''}.
        `.trim();

        Alert.alert(
          'Appointment Confirmed!',
          successMessage,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Booking Failed', response.error || 'Unable to create appointment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting booking:', error);
      Alert.alert('Error', 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#8B5CF6" style={styles.loadingIndicator} />
      </ThemedView>
    );
  }

  if (!store) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText style={styles.errorText}>Store not found</ThemedText>
        <TouchableOpacity onPress={() => router.back()} style={styles.backToStoreButton}>
          <ThemedText style={styles.backToStoreText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

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
          <ThemedText style={styles.headerTitle}>Book Appointment</ThemedText>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.storeInfo}>
          <ThemedText style={styles.storeName}>{store.name}</ThemedText>
          {store.category && (
            <ThemedText style={styles.storeCategory}>{store.category.name}</ThemedText>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Service Selection */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Select Service</ThemedText>

          {servicesLoading ? (
            <ActivityIndicator color="#8B5CF6" style={{ marginVertical: 20 }} />
          ) : services.length > 0 ? (
            <View style={styles.servicesGrid}>
              {services.map((service) => {
                const isSelected = selectedService?.id === service.id;
                const iconName = getServiceIcon(service.name);

                return (
                  <TouchableOpacity
                    key={service.id}
                    onPress={() => {
                      setSelectedService(service);
                      setSelectedTime(null); // Reset time when service changes
                    }}
                    style={[
                      styles.serviceCard,
                      isSelected && styles.serviceCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.serviceIconContainer,
                      isSelected && styles.serviceIconContainerSelected,
                    ]}>
                      <Ionicons
                        name={iconName}
                        size={28}
                        color={isSelected ? '#FFFFFF' : '#8B5CF6'}
                      />
                    </View>
                    <ThemedText
                      style={[
                        styles.serviceName,
                        isSelected && styles.serviceNameSelected,
                      ]}
                      numberOfLines={2}
                    >
                      {service.name}
                    </ThemedText>
                    {service.duration && (
                      <ThemedText
                        style={[
                          styles.serviceDuration,
                          isSelected && styles.serviceDurationSelected,
                        ]}
                      >
                        {formatDuration(service.duration)}
                      </ThemedText>
                    )}
                    <ThemedText
                      style={[
                        styles.servicePrice,
                        isSelected && styles.servicePriceSelected,
                      ]}
                    >
                      ₹{service.price}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <ThemedText style={styles.noDataText}>No services available</ThemedText>
          )}
        </View>

        {/* Date Selection */}
        {selectedService && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.dateScroll}
              contentContainerStyle={styles.dateScrollContent}
            >
              {nextDays.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = index === 0;

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
                    {isToday && (
                      <View style={styles.todayBadge}>
                        <ThemedText style={styles.todayBadgeText}>Today</ThemedText>
                      </View>
                    )}
                    <ThemedText
                      style={[
                        styles.dateDay,
                        isSelected && styles.dateTextSelected
                      ]}
                    >
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dateNumber,
                        isSelected && styles.dateTextSelected
                      ]}
                    >
                      {date.getDate()}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dateMonth,
                        isSelected && styles.dateTextSelected
                      ]}
                    >
                      {date.toLocaleDateString('en-US', { month: 'short' })}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Time Slot Selection */}
        {selectedService && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Select Time</ThemedText>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime?.id === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => slot.available && setSelectedTime(slot)}
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
                      {slot.displayTime}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* Customer Details Form */}
        {selectedService && selectedTime && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Your Details</ThemedText>

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
              <Ionicons name="document-text-outline" size={20} color="#9CA3AF" style={styles.inputIconTop} />
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor }]}
                placeholder="Special Instructions (Optional)"
                placeholderTextColor="#9CA3AF"
                value={specialInstructions}
                onChangeText={setSpecialInstructions}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Booking Summary */}
        {selectedService && selectedTime && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Booking Summary</ThemedText>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Service</ThemedText>
                <ThemedText style={styles.summaryValue}>{selectedService.name}</ThemedText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Date</ThemedText>
                <ThemedText style={styles.summaryValue}>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </ThemedText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabel}>Time</ThemedText>
                <ThemedText style={styles.summaryValue}>{selectedTime.displayTime}</ThemedText>
              </View>
              {selectedService.duration && (
                <>
                  <View style={styles.summaryDivider} />
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Duration</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {formatDuration(selectedService.duration)}
                    </ThemedText>
                  </View>
                </>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <ThemedText style={styles.summaryLabelBold}>Total Price</ThemedText>
                <ThemedText style={styles.summaryValueBold}>₹{selectedService.price}</ThemedText>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Fixed Button */}
      {selectedService && selectedTime && (
        <View style={[styles.bottomContainer, { backgroundColor }]}>
          <TouchableOpacity
            onPress={handleConfirmAppointment}
            style={styles.confirmButton}
            disabled={submitting}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.confirmButtonGradient}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <ThemedText style={styles.confirmButtonText}>Confirm Appointment</ThemedText>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingIndicator: {
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 100,
    paddingHorizontal: 20,
  },
  backToStoreButton: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  backToStoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 24,
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
  scrollContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '31%',
    aspectRatio: 0.85,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  serviceCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIconContainerSelected: {
    backgroundColor: '#8B5CF6',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    color: '#111827',
  },
  serviceNameSelected: {
    color: '#7C3AED',
  },
  serviceDuration: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  serviceDurationSelected: {
    color: '#8B5CF6',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  servicePriceSelected: {
    color: '#7C3AED',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9CA3AF',
    paddingVertical: 20,
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
    borderRadius: 12,
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
    right: 4,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  todayBadgeText: {
    fontSize: 9,
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
    gap: 10,
  },
  timeSlot: {
    width: '31%',
    paddingVertical: 14,
    borderRadius: 10,
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
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
    opacity: 0.5,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconTop: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 0,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  summaryLabelBold: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  confirmButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
