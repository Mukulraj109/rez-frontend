import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import storesApi, { Store } from '@/services/storesApi';
import consultationApi from '@/services/consultationApi';

const { width } = Dimensions.get('window');

// Medical consultation types with icons
const CONSULTATION_TYPES = [
  { id: 'general', name: 'General Physician', icon: 'medical' as const, color: '#8B5CF6' },
  { id: 'pediatrician', name: 'Pediatrician', icon: 'people' as const, color: '#EC4899' },
  { id: 'dentist', name: 'Dentist', icon: 'happy' as const, color: '#10B981' },
  { id: 'eye', name: 'Eye Care', icon: 'eye' as const, color: '#3B82F6' },
  { id: 'cardio', name: 'Cardiologist', icon: 'heart' as const, color: '#EF4444' },
  { id: 'derma', name: 'Dermatologist', icon: 'body' as const, color: '#F59E0B' },
  { id: 'ortho', name: 'Orthopedic', icon: 'walk' as const, color: '#6366F1' },
  { id: 'gynae', name: 'Gynecologist', icon: 'woman' as const, color: '#EC4899' },
];

interface TimeSlot {
  time: string;
  available: boolean;
  isPast?: boolean;
}

export default function ConsultationBookingScreen() {
  const router = useRouter();
  const { storeId } = useLocalSearchParams<{ storeId: string }>();

  // Store data
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Booking form state
  const [selectedConsultation, setSelectedConsultation] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Patient details
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch store details
  useEffect(() => {
    const fetchStoreDetails = async () => {
      if (!storeId) {
        setError('Store ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await storesApi.getStoreById(storeId);

        if (response.success && response.data) {
          setStore(response.data);
          setError(null);
        } else {
          setError(response.error || 'Failed to load clinic details');
        }
      } catch (err) {
        setError('Failed to connect to server');
        console.error('Error fetching store:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreDetails();
  }, [storeId]);

  // Generate next 60 days
  const availableDates = useMemo(() => {
    const dates: Date[] = [];
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, []);

  // Generate time slots based on clinic hours
  const timeSlots = useMemo(() => {
    if (!selectedDate || !store?.hours) {
      return [];
    }

    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = store.hours.find(h => h.day === dayName);

    if (!dayHours || dayHours.closed) {
      return [];
    }

    // Parse hours (assuming format "09:00")
    const [openHour] = dayHours.open.split(':').map(Number);
    const [closeHour] = dayHours.close.split(':').map(Number);

    const slots: TimeSlot[] = [];
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    // Generate 30-minute slots
    for (let hour = openHour; hour < closeHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        // Check if slot is in the past for today
        let isPast = false;
        if (isToday) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minute, 0, 0);
          isPast = slotTime < now;
        }

        slots.push({
          time: timeString,
          available: !isPast,
          isPast,
        });
      }
    }

    return slots;
  }, [selectedDate, store]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Format day for date selector
  const formatDay = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Validate form
  const validateForm = () => {
    if (!selectedConsultation) {
      Alert.alert('Validation Error', 'Please select a consultation type');
      return false;
    }
    if (!selectedDate) {
      Alert.alert('Validation Error', 'Please select a date');
      return false;
    }
    if (!selectedTime) {
      Alert.alert('Validation Error', 'Please select a time slot');
      return false;
    }
    if (!patientName.trim()) {
      Alert.alert('Validation Error', 'Patient name is required');
      return false;
    }
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid age');
      return false;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return false;
    }
    if (!reason.trim()) {
      Alert.alert('Validation Error', 'Reason for consultation is required');
      return false;
    }
    return true;
  };

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!validateForm() || !store || !selectedDate) {
      return;
    }

    try {
      setIsSubmitting(true);

      const consultationType = CONSULTATION_TYPES.find(c => c.id === selectedConsultation);

      // Prepare consultation data for the API
      const consultationData = {
        storeId: store.id,
        date: selectedDate.toISOString().split('T')[0], // Format: YYYY-MM-DD
        time: selectedTime!,
        type: 'in-person' as const, // Default to in-person, can be made selectable later
        duration: 30, // Default 30 minutes consultation
        reason: reason.trim(),
        notes: `Consultation Type: ${consultationType?.name}\nAge: ${age}${medicalHistory.trim() ? `\nMedical History: ${medicalHistory.trim()}` : ''}`,
        customerName: patientName.trim(),
        customerPhone: phoneNumber.trim(),
        customerEmail: email.trim() || patientName.trim().toLowerCase().replace(/\s+/g, '') + '@temp.com', // Email is required by API
      };

      const response = await consultationApi.createConsultation(consultationData);

      if (response.success && response.data) {
        Alert.alert(
          'Consultation Confirmed!',
          `Your ${consultationType?.name} consultation has been successfully booked!\n\n` +
          `Confirmation Code: ${response.data.confirmationCode || 'Pending'}\n` +
          `Date: ${formatDate(selectedDate)}\n` +
          `Time: ${selectedTime}\n` +
          `Patient: ${patientName}\n\n` +
          `You will receive a confirmation message shortly.`,
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Booking Failed', response.error || 'Unable to book consultation. Please try again.');
      }
    } catch (err: any) {
      console.error('Error booking consultation:', err);
      Alert.alert('Error', err.message || 'Failed to book consultation. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Book Consultation</ThemedText>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading clinic details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Error state
  if (error || !store) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Book Consultation</ThemedText>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error || 'Clinic not found'}</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.errorButton}>
            <Text style={styles.errorButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const selectedConsultationType = CONSULTATION_TYPES.find(c => c.id === selectedConsultation);

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Book Consultation</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{store.name}</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Consultation Type Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="medical" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Select Consultation Type</ThemedText>
          </View>
          <View style={styles.consultationGrid}>
            {CONSULTATION_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.consultationCard,
                  selectedConsultation === type.id && styles.consultationCardSelected,
                ]}
                onPress={() => setSelectedConsultation(type.id)}
              >
                <View style={[styles.consultationIcon, { backgroundColor: type.color + '20' }]}>
                  <Ionicons name={type.icon} size={24} color={type.color} />
                </View>
                <Text
                  style={[
                    styles.consultationName,
                    selectedConsultation === type.id && styles.consultationNameSelected,
                  ]}
                  numberOfLines={2}
                >
                  {type.name}
                </Text>
                {selectedConsultation === type.id && (
                  <View style={styles.selectedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
          >
            {availableDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate?.toDateString() === date.toDateString() && styles.dateCardSelected,
                ]}
                onPress={() => {
                  setSelectedDate(date);
                  setSelectedTime(null); // Reset time when date changes
                }}
              >
                <Text style={[
                  styles.dateDay,
                  selectedDate?.toDateString() === date.toDateString() && styles.dateDaySelected,
                ]}>
                  {formatDay(date)}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate?.toDateString() === date.toDateString() && styles.dateNumberSelected,
                ]}>
                  {date.getDate()}
                </Text>
                <Text style={[
                  styles.dateMonth,
                  selectedDate?.toDateString() === date.toDateString() && styles.dateMonthSelected,
                ]}>
                  {date.toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Slot Selection */}
        {selectedDate && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="time" size={20} color="#8B5CF6" />
              <ThemedText style={styles.sectionTitle}>Select Time Slot</ThemedText>
            </View>
            {timeSlots.length > 0 ? (
              <View style={styles.timeGrid}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.timeSlot,
                      !slot.available && styles.timeSlotDisabled,
                      selectedTime === slot.time && styles.timeSlotSelected,
                    ]}
                    onPress={() => slot.available && setSelectedTime(slot.time)}
                    disabled={!slot.available}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        !slot.available && styles.timeSlotTextDisabled,
                        selectedTime === slot.time && styles.timeSlotTextSelected,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.noSlotsContainer}>
                <Ionicons name="close-circle" size={32} color="#EF4444" />
                <ThemedText style={styles.noSlotsText}>
                  Clinic is closed on this day
                </ThemedText>
              </View>
            )}
          </View>
        )}

        {/* Patient Details Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color="#8B5CF6" />
            <ThemedText style={styles.sectionTitle}>Patient Details</ThemedText>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Patient Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter patient's full name"
              placeholderTextColor="#9CA3AF"
              value={patientName}
              onChangeText={setPatientName}
            />
          </View>

          <View style={styles.formRow}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="Age"
                placeholderTextColor="#9CA3AF"
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.formGroup, { flex: 2 }]}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#9CA3AF"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              placeholderTextColor="#9CA3AF"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Reason for Consultation *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your symptoms or reason for visit"
              placeholderTextColor="#9CA3AF"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Medical History (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any relevant medical history, allergies, or current medications"
              placeholderTextColor="#9CA3AF"
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        {/* Booking Summary */}
        {selectedConsultationType && selectedDate && selectedTime && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
              <ThemedText style={styles.summaryTitle}>Booking Summary</ThemedText>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Clinic</Text>
              <Text style={styles.summaryValue}>{store.name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Consultation</Text>
              <Text style={styles.summaryValue}>{selectedConsultationType.name}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Date</Text>
              <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Time</Text>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>

            {patientName && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Patient</Text>
                <Text style={styles.summaryValue}>{patientName}</Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom spacing for fixed button */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={handleConfirmBooking}
          disabled={isSubmitting || !selectedConsultation || !selectedDate || !selectedTime}
        >
          <LinearGradient
            colors={
              isSubmitting || !selectedConsultation || !selectedDate || !selectedTime
                ? ['#D1D5DB', '#9CA3AF']
                : ['#8B5CF6', '#7C3AED']
            }
            style={styles.confirmButton}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>Confirm Consultation</Text>
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
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E9D5FF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
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
    color: '#1F2937',
  },
  consultationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  consultationCard: {
    width: (width - 64) / 2,
    margin: 6,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    position: 'relative',
  },
  consultationCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  consultationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  consultationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
    minHeight: 36,
  },
  consultationNameSelected: {
    color: '#8B5CF6',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  dateScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dateCard: {
    width: 70,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    marginRight: 12,
  },
  dateCardSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  dateDaySelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  dateNumberSelected: {
    color: '#8B5CF6',
  },
  dateMonth: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateMonthSelected: {
    color: '#8B5CF6',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  timeSlot: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    margin: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  timeSlotSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3E8FF',
  },
  timeSlotDisabled: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  timeSlotTextSelected: {
    color: '#8B5CF6',
  },
  timeSlotTextDisabled: {
    color: '#9CA3AF',
  },
  noSlotsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noSlotsText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  summaryCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#1F2937',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    textAlign: 'right',
  },
  bottomSpacing: {
    height: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
