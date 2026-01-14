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
  KeyboardAvoidingView,
  Dimensions,
  Modal,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import storesApi from '@/services/storesApi';
import productsApi from '@/services/productsApi';
import cartApi from '@/services/cartApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  navy: '#0B2240',
  slate: '#1F2D3D',
  muted: '#9AA7B2',
  surface: '#F7FAFC',
  white: '#FFFFFF',
  border: '#E5E7EB',
  error: '#EF4444',
};

interface Store {
  id?: string;
  _id?: string;
  name: string;
  logo?: string;
  category: string | { _id: string; name: string; slug?: string };
  contact?: {
    phone?: string;
    email?: string;
  };
  businessHours?: {
    [key: string]: { open: string; close: string; isClosed?: boolean };
  };
}

interface Service {
  _id: string;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images?: Array<{ url: string; alt?: string }>;
  serviceDetails?: {
    duration: number; // in minutes
    serviceType: 'home' | 'store' | 'online';
  };
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Booking types
type BookingType = 'table' | 'service';

export default function BookingPage() {
  // URL params: storeId (required), bookingType ('table' | 'service'), productId (for service)
  const { storeId, bookingType: bookingTypeParam, productId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Determine booking type: 'service' if productId is provided, otherwise 'table'
  const bookingType: BookingType = bookingTypeParam === 'service' || productId ? 'service' : 'table';
  const isServiceBooking = bookingType === 'service';

  const [store, setStore] = useState<Store | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null); // Display format: "9:00 AM"
  const [selectedTime24h, setSelectedTime24h] = useState<string | null>(null); // 24-hour format: "09:00"
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [numberOfPeople, setNumberOfPeople] = useState('2');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showAddedToCartModal, setShowAddedToCartModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadDetails();
  }, [storeId, productId]);

  const loadDetails = async () => {
    try {
      setLoading(true);

      // Load store details
      const storeResponse = await storesApi.getStoreById(storeId as string);
      if (storeResponse.success && storeResponse.data) {
        setStore(storeResponse.data);
      }

      // If service booking, also load service details
      if (isServiceBooking && productId) {
        const serviceResponse = await productsApi.getProductById(productId as string);
        if (serviceResponse.success && serviceResponse.data) {
          const productData = serviceResponse.data;
          setService({
            _id: productData.id || productData._id,
            name: productData.name,
            description: productData.description,
            price: productData.pricing?.selling || productData.pricing?.original || productData.price?.current || productData.price?.original || 0,
            comparePrice: productData.pricing?.original || productData.pricing?.comparePrice,
            images: productData.images,
            serviceDetails: productData.serviceDetails,
          });
        }
      }
    } catch (error) {
      console.error('Error loading details:', error);
      setErrorMessage('Failed to load details. Please try again.');
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

        // Simple availability logic
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

  // Generate next 14 days for date selection
  const getNextDays = (count: number) => {
    const days = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const nextDays = getNextDays(14);

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleBooking = () => {
    // Validate form
    if (!selectedTime) {
      setErrorMessage('Please select a time slot');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    // Clear any previous error and show confirmation modal
    setErrorMessage('');
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);

    try {
      // TODO: Replace with actual API call
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      setSubmitting(false);
      setErrorMessage('Failed to create booking. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  // Calculate end time based on service duration
  const calculateEndTime = (startTime: string, durationMinutes: number): string => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMins = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  // Handle Add to Cart for service booking
  const handleAddToCart = async () => {
    // Validate
    if (!selectedTime) {
      setErrorMessage('Please select a time slot');
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name');
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    if (!service || !store) {
      setErrorMessage('Service or store information missing');
      return;
    }

    setErrorMessage('');
    setAddingToCart(true);

    try {
      if (!selectedTime24h) {
        setErrorMessage('Please select a time slot');
        return;
      }
      
      const duration = service.serviceDetails?.duration || 60;
      const endTime = calculateEndTime(selectedTime24h, duration);

      const response = await cartApi.addServiceToCart({
        productId: service._id,
        storeId: store.id || store._id || '',
        serviceBookingDetails: {
          bookingDate: selectedDate.toISOString(),
          timeSlot: {
            start: selectedTime24h, // Use 24-hour format
            end: endTime,
          },
          duration: duration,
          serviceType: service.serviceDetails?.serviceType || 'store',
          customerNotes: notes || undefined,
          customerName: customerName,
          customerPhone: customerPhone,
          customerEmail: customerEmail || undefined,
        },
      });

      if (response.success) {
        setShowAddedToCartModal(true);
      } else {
        setErrorMessage(response.message || 'Failed to add service to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      setErrorMessage('Failed to add service to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle navigation after adding to cart
  const handleViewCart = () => {
    setShowAddedToCartModal(false);
    router.push('/CartPage');
  };

  const handleContinueShopping = () => {
    setShowAddedToCartModal(false);
    router.back();
  };

  const getCategoryName = () => {
    if (!store?.category) return 'Restaurant';
    return typeof store.category === 'string' ? store.category : store.category?.name || 'Restaurant';
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!store) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.error} />
          <ThemedText style={styles.errorText}>Store not found</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
            <ThemedText style={styles.retryText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  // Calculate bottom padding: button height (60) + button padding (32) + tab bar (~80) + safe area
  const bottomPadding = 60 + 32 + 80 + insets.bottom;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header with Glassmorphism */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top + 10 : 40 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>
              {isServiceBooking ? 'Book Service' : 'Book a Table'}
            </ThemedText>
            <View style={{ width: 44 }} />
          </View>

          {/* Store/Service Info Card */}
          <View style={styles.storeCard}>
            <View style={styles.storeIconContainer}>
              <Ionicons
                name={isServiceBooking ? 'cut' : 'restaurant'}
                size={24}
                color={COLORS.primary}
              />
            </View>
            <View style={styles.storeDetails}>
              {isServiceBooking && service ? (
                <>
                  <ThemedText style={styles.storeName}>{service.name}</ThemedText>
                  <ThemedText style={styles.storeCategory}>{store.name}</ThemedText>
                  <View style={styles.servicePriceRow}>
                    <ThemedText style={styles.servicePrice}>₹{service.price.toLocaleString()}</ThemedText>
                    {service.serviceDetails?.duration && (
                      <ThemedText style={styles.serviceDuration}>
                        • {service.serviceDetails.duration} min
                      </ThemedText>
                    )}
                  </View>
                </>
              ) : (
                <>
                  <ThemedText style={styles.storeName}>{store.name}</ThemedText>
                  <ThemedText style={styles.storeCategory}>{getCategoryName()}</ThemedText>
                </>
              )}
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Date Selection */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.sectionTitle}>Select Date</ThemedText>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateScrollContent}
            >
              {nextDays.map((date, index) => {
                const isSelected = date.toDateString() === selectedDate.toDateString();
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                      setSelectedTime24h(null);
                    }}
                    style={[
                      styles.dateCard,
                      isSelected && styles.dateCardSelected,
                    ]}
                    activeOpacity={0.7}
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
                    {isToday && (
                      <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Time Slots */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.sectionTitle}>Select Time</ThemedText>
            </View>
            <View style={styles.timeGrid}>
              {timeSlots.map((slot) => {
                const isSelected = selectedTime === slot.id;
                return (
                  <TouchableOpacity
                    key={slot.id}
                    onPress={() => {
                      if (slot.available) {
                        setSelectedTime(slot.time); // Display format
                        setSelectedTime24h(slot.id); // 24-hour format for calculation
                      }
                    }}
                    disabled={!slot.available}
                    style={[
                      styles.timeSlot,
                      isSelected && styles.timeSlotSelected,
                      !slot.available && styles.timeSlotDisabled,
                    ]}
                    activeOpacity={0.7}
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

          {/* Number of People - Only for Table Booking */}
          {!isServiceBooking && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="people-outline" size={20} color={COLORS.primary} />
                <ThemedText style={styles.sectionTitle}>Number of Guests</ThemedText>
              </View>
              <View style={styles.peopleSelector}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setNumberOfPeople(num.toString())}
                    style={[
                      styles.peopleButton,
                      numberOfPeople === num.toString() && styles.peopleButtonSelected,
                    ]}
                    activeOpacity={0.7}
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
          )}

          {/* Customer Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color={COLORS.primary} />
              <ThemedText style={styles.sectionTitle}>Your Details</ThemedText>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="person" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Full Name *"
                placeholderTextColor={COLORS.muted}
                value={customerName}
                onChangeText={setCustomerName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="call" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Phone Number *"
                placeholderTextColor={COLORS.muted}
                value={customerPhone}
                onChangeText={setCustomerPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="mail" size={18} color={COLORS.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Email (Optional)"
                placeholderTextColor={COLORS.muted}
                value={customerEmail}
                onChangeText={setCustomerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <Ionicons name="chatbubble" size={18} color={COLORS.muted} style={[styles.inputIcon, { marginTop: 14 }]} />
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor }]}
                placeholder="Special Requests (Optional)"
                placeholderTextColor={COLORS.muted}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Summary Card */}
          {selectedTime && (
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <ThemedText style={styles.summaryTitle}>
                  {isServiceBooking ? 'Service Summary' : 'Booking Summary'}
                </ThemedText>

                {/* Service Name - Only for service booking */}
                {isServiceBooking && service && (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Service</ThemedText>
                    <ThemedText style={styles.summaryValue}>{service.name}</ThemedText>
                  </View>
                )}

                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Date</ThemedText>
                  <ThemedText style={styles.summaryValue}>{formatDate(selectedDate)}</ThemedText>
                </View>
                <View style={styles.summaryRow}>
                  <ThemedText style={styles.summaryLabel}>Time</ThemedText>
                  <ThemedText style={styles.summaryValue}>
                    {selectedTime || timeSlots.find(s => s.id === selectedTime24h)?.time}
                  </ThemedText>
                </View>

                {/* Duration - Only for service booking */}
                {isServiceBooking && service?.serviceDetails?.duration && (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Duration</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {service.serviceDetails.duration} min
                    </ThemedText>
                  </View>
                )}

                {/* Guests - Only for table booking */}
                {!isServiceBooking && (
                  <View style={styles.summaryRow}>
                    <ThemedText style={styles.summaryLabel}>Guests</ThemedText>
                    <ThemedText style={styles.summaryValue}>
                      {numberOfPeople} {parseInt(numberOfPeople) === 1 ? 'person' : 'people'}
                    </ThemedText>
                  </View>
                )}

                {/* Price - Only for service booking */}
                {isServiceBooking && service && (
                  <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                    <ThemedText style={styles.summaryLabelTotal}>Total</ThemedText>
                    <ThemedText style={styles.summaryValueTotal}>₹{service.price.toLocaleString()}</ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Error Message */}
        {errorMessage ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <ThemedText style={styles.errorBannerText}>{errorMessage}</ThemedText>
            <TouchableOpacity onPress={() => setErrorMessage('')}>
              <Ionicons name="close" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Bottom Button - Fixed above tab bar */}
        <View style={[styles.bottomContainer, { paddingBottom: insets.bottom + 80 }]}>
          {isServiceBooking ? (
            /* Add to Cart Button for Service Booking */
            <TouchableOpacity
              onPress={handleAddToCart}
              style={styles.bookButton}
              activeOpacity={0.85}
              disabled={addingToCart}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookButtonGradient}
              >
                {addingToCart ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="cart" size={20} color={COLORS.white} />
                    <ThemedText style={styles.bookButtonText}>
                      Add to Cart{service ? ` - ₹${service.price.toLocaleString()}` : ''}
                    </ThemedText>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ) : (
            /* Confirm Booking Button for Table Booking */
            <TouchableOpacity
              onPress={handleBooking}
              style={styles.bookButton}
              activeOpacity={0.85}
              disabled={submitting}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.bookButtonGradient}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <ThemedText style={styles.bookButtonText}>Confirm Booking</ThemedText>
                    <View style={styles.bookButtonIcon}>
                      <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                    </View>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="calendar" size={32} color={COLORS.primary} />
            </View>
            <ThemedText style={styles.modalTitle}>Confirm Booking</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Book a table for {numberOfPeople} {parseInt(numberOfPeople) === 1 ? 'person' : 'people'} on {formatDate(selectedDate)} at {timeSlots.find(s => s.id === selectedTime)?.time}?
            </ThemedText>

            <View style={styles.modalDetails}>
              <View style={styles.modalDetailRow}>
                <Ionicons name="restaurant" size={16} color={COLORS.muted} />
                <ThemedText style={styles.modalDetailText}>{store?.name}</ThemedText>
              </View>
              <View style={styles.modalDetailRow}>
                <Ionicons name="person" size={16} color={COLORS.muted} />
                <ThemedText style={styles.modalDetailText}>{customerName}</ThemedText>
              </View>
              <View style={styles.modalDetailRow}>
                <Ionicons name="call" size={16} color={COLORS.muted} />
                <ThemedText style={styles.modalDetailText}>{customerPhone}</ThemedText>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <ThemedText style={styles.modalCancelText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={confirmBooking}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalConfirmGradient}
                >
                  <ThemedText style={styles.modalConfirmText}>Confirm</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleSuccessClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, styles.successIconContainer]}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.primary} />
            </View>
            <ThemedText style={styles.modalTitle}>Booking Confirmed!</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Your table has been reserved. You will receive a confirmation shortly.
            </ThemedText>

            <View style={styles.successDetails}>
              <View style={styles.successDetailRow}>
                <ThemedText style={styles.successLabel}>Date</ThemedText>
                <ThemedText style={styles.successValue}>{formatDate(selectedDate)}</ThemedText>
              </View>
              <View style={styles.successDetailRow}>
                <ThemedText style={styles.successLabel}>Time</ThemedText>
                <ThemedText style={styles.successValue}>{timeSlots.find(s => s.id === selectedTime)?.time}</ThemedText>
              </View>
              <View style={styles.successDetailRow}>
                <ThemedText style={styles.successLabel}>Guests</ThemedText>
                <ThemedText style={styles.successValue}>{numberOfPeople}</ThemedText>
              </View>
            </View>

            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccessClose}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.successButtonGradient}
              >
                <ThemedText style={styles.successButtonText}>Done</ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Added to Cart Modal - For Service Booking */}
      <Modal
        visible={showAddedToCartModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddedToCartModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalIconContainer, styles.successIconContainer]}>
              <Ionicons name="cart" size={40} color={COLORS.primary} />
            </View>
            <ThemedText style={styles.modalTitle}>Added to Cart!</ThemedText>
            <ThemedText style={styles.modalMessage}>
              Your service has been added to cart. Proceed to checkout to complete your booking.
            </ThemedText>

            {service && (
              <View style={styles.successDetails}>
                <View style={styles.successDetailRow}>
                  <ThemedText style={styles.successLabel}>Service</ThemedText>
                  <ThemedText style={styles.successValue}>{service.name}</ThemedText>
                </View>
                <View style={styles.successDetailRow}>
                  <ThemedText style={styles.successLabel}>Date</ThemedText>
                  <ThemedText style={styles.successValue}>{formatDate(selectedDate)}</ThemedText>
                </View>
                <View style={styles.successDetailRow}>
                  <ThemedText style={styles.successLabel}>Time</ThemedText>
                  <ThemedText style={styles.successValue}>
                    {timeSlots.find(s => s.id === selectedTime)?.time}
                  </ThemedText>
                </View>
                <View style={[styles.successDetailRow, { borderBottomWidth: 0 }]}>
                  <ThemedText style={styles.successLabel}>Price</ThemedText>
                  <ThemedText style={[styles.successValue, { color: COLORS.primary, fontWeight: '700' }]}>
                    ₹{service.price.toLocaleString()}
                  </ThemedText>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={handleContinueShopping}
              >
                <ThemedText style={styles.modalCancelText}>Continue</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={handleViewCart}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalConfirmGradient}
                >
                  <ThemedText style={styles.modalConfirmText}>View Cart</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.slate,
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Poppins',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  storeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  storeCategory: {
    fontSize: 14,
    color: COLORS.muted,
  },
  servicePriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  serviceDuration: {
    fontSize: 14,
    color: COLORS.muted,
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
    marginLeft: 8,
    fontFamily: 'Poppins',
  },
  dateScrollContent: {
    paddingRight: 16,
  },
  dateCard: {
    width: 68,
    height: 88,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  dateCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
  },
  dateDay: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.muted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
  },
  dateMonth: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 2,
  },
  dateTextSelected: {
    color: COLORS.white,
  },
  todayDot: {
    position: 'absolute',
    bottom: 8,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  todayDotSelected: {
    backgroundColor: COLORS.white,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    width: (SCREEN_WIDTH - 32 - 30) / 4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  timeSlotSelected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  timeSlotDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    opacity: 0.5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.slate,
  },
  timeTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  timeTextDisabled: {
    color: COLORS.muted,
  },
  peopleSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  peopleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  peopleButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  peopleText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate,
  },
  peopleTextSelected: {
    color: COLORS.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 52,
    fontSize: 15,
    fontFamily: 'Inter',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 90,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: `${COLORS.primary}20`,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  summaryRowTotal: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  summaryLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.navy,
  },
  summaryValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButton: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  bookButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'Inter',
  },
  bookButtonIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Error Banner
  errorBanner: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    gap: 8,
    zIndex: 100,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  modalDetails: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  modalDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 10,
  },
  modalDetailText: {
    fontSize: 14,
    color: COLORS.slate,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.slate,
  },
  modalConfirmButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalConfirmGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
  successDetails: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  successDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  successLabel: {
    fontSize: 14,
    color: COLORS.muted,
  },
  successValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  successButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  successButtonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  successButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
