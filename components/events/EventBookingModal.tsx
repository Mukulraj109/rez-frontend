import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { EventItem } from '@/types/homepage.types';
import { useEventBooking, BookingFormData } from '@/hooks/useEventBooking';

interface EventBookingModalProps {
  visible: boolean;
  onClose: () => void;
  event: EventItem | null;
  onBookingSuccess?: () => void;
}

export default function EventBookingModal({
  visible,
  onClose,
  event,
  onBookingSuccess
}: EventBookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState<BookingFormData>({
    attendeeInfo: {
      name: '',
      email: '',
      phone: '',
      age: undefined,
      specialRequirements: ''
    }
  });

  const { isBooking, bookEvent, clearBookingState } = useEventBooking();

  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');
  const placeholderColor = useThemeColor({ light: '#9CA3AF', dark: '#6B7280' }, 'text');

  useEffect(() => {
    if (visible && event) {
      // Reset form when modal opens
      setFormData({
        attendeeInfo: {
          name: '',
          email: '',
          phone: '',
          age: undefined,
          specialRequirements: ''
        }
      });
      setSelectedSlot(null);
      clearBookingState();
    }
  }, [visible, event, clearBookingState]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      attendeeInfo: {
        ...prev.attendeeInfo,
        [field]: value
      }
    }));
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
    setFormData(prev => ({
      ...prev,
      slotId
    }));
  };

  const handleBookingSubmit = async () => {
    if (!event) return;

    // Validate form
    if (!formData.attendeeInfo.name.trim()) {
      Alert.alert('Validation Error', 'Please enter your name');
      return;
    }

    if (!formData.attendeeInfo.email.trim()) {
      Alert.alert('Validation Error', 'Please enter your email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.attendeeInfo.email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    // For slot-based events, validate slot selection
    if (event.availableSlots && event.availableSlots.length > 0 && !selectedSlot) {
      Alert.alert('Validation Error', 'Please select a time slot');
      return;
    }

    const success = await bookEvent(event, formData);
    if (success) {
      onBookingSuccess?.();
      onClose();
    }
  };

  const formatPrice = () => {
    if (!event) return '';
    if (event.price.isFree) return 'Free';
    return `${event.price.currency}${event.price.amount}`;
  };

  const getAvailableSlots = () => {
    if (!event || !event.availableSlots) return [];
    return event.availableSlots.filter(slot => slot.available);
  };

  const isFormValid = () => {
    return formData.attendeeInfo.name.trim() && 
           formData.attendeeInfo.email.trim() &&
           (!event?.availableSlots || event.availableSlots.length === 0 || selectedSlot);
  };

  if (!event) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={textColor} />
          </TouchableOpacity>
          
          <ThemedText style={[styles.headerTitle, { color: textColor }]}>
            Book Event
          </ThemedText>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Event Info */}
          <ThemedView style={[styles.eventInfo, { backgroundColor: cardBackground, borderColor }]}>
            <ThemedText style={[styles.eventTitle, { color: textColor }]}>
              {event.title}
            </ThemedText>
            
            <View style={styles.eventMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={16} color={tintColor} />
                <ThemedText style={[styles.metaText, { color: textColor }]}>
                  {event.date} at {event.time}
                </ThemedText>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons
                  name={event.isOnline ? "globe-outline" : "location-outline"}
                  size={16}
                  color={tintColor}
                />
                <ThemedText style={[styles.metaText, { color: textColor }]}>
                  {event.location}
                </ThemedText>
              </View>
              
              <View style={styles.metaItem}>
                <Ionicons name="pricetag-outline" size={16} color={tintColor} />
                <ThemedText style={[styles.metaText, { color: textColor }]}>
                  {formatPrice()}
                </ThemedText>
              </View>
            </View>
          </ThemedView>

          {/* Time Slots (if applicable) */}
          {event.availableSlots && event.availableSlots.length > 0 && (
            <View style={styles.section}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Select Time Slot
              </ThemedText>
              
              <View style={styles.slotsContainer}>
                {getAvailableSlots().map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      { backgroundColor: cardBackground, borderColor },
                      selectedSlot === slot.id && { borderColor: tintColor, backgroundColor: `${tintColor}10` }
                    ]}
                    onPress={() => handleSlotSelect(slot.id)}
                  >
                    <View style={styles.slotHeader}>
                      <ThemedText
                        style={[
                          styles.slotTime,
                          { color: textColor },
                          selectedSlot === slot.id && { color: tintColor }
                        ]}
                      >
                        {slot.time}
                      </ThemedText>
                      
                      {selectedSlot === slot.id && (
                        <Ionicons name="checkmark-circle" size={20} color={tintColor} />
                      )}
                    </View>
                    
                    <ThemedText style={[styles.slotCapacity, { color: placeholderColor }]}>
                      {slot.maxCapacity - slot.bookedCount} spots left
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Attendee Information */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
              Attendee Information
            </ThemedText>
            
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Full Name *
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: cardBackground, borderColor, color: textColor }]}
                  placeholder="Enter your full name"
                  placeholderTextColor={placeholderColor}
                  value={formData.attendeeInfo.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Email Address *
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: cardBackground, borderColor, color: textColor }]}
                  placeholder="Enter your email"
                  placeholderTextColor={placeholderColor}
                  value={formData.attendeeInfo.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Phone Number
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: cardBackground, borderColor, color: textColor }]}
                  placeholder="Enter your phone number"
                  placeholderTextColor={placeholderColor}
                  value={formData.attendeeInfo.phone}
                  onChangeText={(value) => handleInputChange('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Age
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: cardBackground, borderColor, color: textColor }]}
                  placeholder="Enter your age"
                  placeholderTextColor={placeholderColor}
                  value={formData.attendeeInfo.age?.toString() || ''}
                  onChangeText={(value) => handleInputChange('age', parseInt(value) || '' as any)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Special Requirements
                </ThemedText>
                <TextInput
                  style={[styles.textArea, { backgroundColor: cardBackground, borderColor, color: textColor }]}
                  placeholder="Any special requirements or accessibility needs"
                  placeholderTextColor={placeholderColor}
                  value={formData.attendeeInfo.specialRequirements}
                  onChangeText={(value) => handleInputChange('specialRequirements', value)}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: cardBackground, borderTopColor: borderColor }]}>
          <TouchableOpacity
            style={[
              styles.bookButton,
              { backgroundColor: isFormValid() ? tintColor : placeholderColor }
            ]}
            onPress={handleBookingSubmit}
            disabled={!isFormValid() || isBooking}
          >
            <ThemedText style={styles.bookButtonText}>
              {isBooking ? 'Booking...' : `Book Event - ${formatPrice()}`}
            </ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eventInfo: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  eventMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  slotsContainer: {
    gap: 12,
  },
  slotCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotTime: {
    fontSize: 16,
    fontWeight: '600',
  },
  slotCapacity: {
    fontSize: 14,
    fontWeight: '500',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  textInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  textArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  bookButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

