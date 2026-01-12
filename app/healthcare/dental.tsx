import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import apiClient from '@/services/apiClient';

const { width } = Dimensions.get('window');

// TypeScript Interfaces
interface DentistStore {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  metadata?: {
    specialization?: string;
    experience?: string;
    qualification?: string;
    consultationFee?: number;
    availableSlots?: string[];
    languages?: string[];
    services?: string[];
  };
}

interface DentalService {
  id: string;
  name: string;
  icon: string;
  description: string;
  priceRange: string;
}

interface BookingSlot {
  time: string;
  available: boolean;
}

// Dental services offered
const dentalServices: DentalService[] = [
  { id: 'cleaning', name: 'Teeth Cleaning', icon: 'sparkles', description: 'Professional dental cleaning and polishing', priceRange: '500 - 1,500' },
  { id: 'filling', name: 'Dental Filling', icon: 'ellipse', description: 'Cavity filling and restoration', priceRange: '800 - 3,000' },
  { id: 'root_canal', name: 'Root Canal', icon: 'medical', description: 'Root canal treatment (RCT)', priceRange: '3,000 - 8,000' },
  { id: 'extraction', name: 'Tooth Extraction', icon: 'remove-circle', description: 'Simple and surgical extractions', priceRange: '500 - 2,500' },
  { id: 'braces', name: 'Dental Braces', icon: 'git-compare', description: 'Orthodontic braces and aligners', priceRange: '25,000 - 80,000' },
  { id: 'whitening', name: 'Teeth Whitening', icon: 'sunny', description: 'Professional teeth whitening', priceRange: '3,000 - 15,000' },
  { id: 'implant', name: 'Dental Implants', icon: 'pin', description: 'Permanent tooth replacement', priceRange: '20,000 - 50,000' },
  { id: 'crown', name: 'Dental Crown', icon: 'shield', description: 'Caps and crown placement', priceRange: '3,000 - 15,000' },
];

// Time slots
const timeSlots: BookingSlot[] = [
  { time: '09:00 AM', available: true },
  { time: '09:30 AM', available: true },
  { time: '10:00 AM', available: false },
  { time: '10:30 AM', available: true },
  { time: '11:00 AM', available: true },
  { time: '11:30 AM', available: true },
  { time: '02:00 PM', available: true },
  { time: '02:30 PM', available: false },
  { time: '03:00 PM', available: true },
  { time: '03:30 PM', available: true },
  { time: '04:00 PM', available: true },
  { time: '04:30 PM', available: true },
  { time: '05:00 PM', available: true },
  { time: '05:30 PM', available: false },
  { time: '06:00 PM', available: true },
];

export default function DentalCarePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [dentists, setDentists] = useState<DentistStore[]>([]);
  const [filteredDentists, setFilteredDentists] = useState<DentistStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  // Booking modal state
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedDentist, setSelectedDentist] = useState<DentistStore | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Fetch dentists from API
  const fetchDentists = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/stores?category=healthcare&type=doctor&specialty=dentist');

      if (response.success && response.data?.stores) {
        setDentists(response.data.stores);
        setFilteredDentists(response.data.stores);
      } else {
        // Fallback: fetch all doctors and filter for dentists
        const fallbackResponse = await apiClient.get('/stores?category=healthcare&type=doctor');
        if (fallbackResponse.success && fallbackResponse.data?.stores) {
          const dentistStores = fallbackResponse.data.stores.filter((store: DentistStore) =>
            store.metadata?.specialization?.toLowerCase().includes('dent') ||
            store.name.toLowerCase().includes('dental') ||
            store.name.toLowerCase().includes('dentist')
          );
          setDentists(dentistStores);
          setFilteredDentists(dentistStores);
        }
      }
    } catch (error) {
      console.error('Error fetching dentists:', error);
      Alert.alert('Error', 'Failed to load dentists. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDentists();
  }, []);

  // Filter dentists based on search and selected service
  useEffect(() => {
    let filtered = dentists;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (dentist) =>
          dentist.name.toLowerCase().includes(query) ||
          dentist.address.city.toLowerCase().includes(query) ||
          dentist.metadata?.services?.some(s => s.toLowerCase().includes(query))
      );
    }

    if (selectedService) {
      filtered = filtered.filter((dentist) =>
        dentist.metadata?.services?.some(s =>
          s.toLowerCase().includes(selectedService.toLowerCase())
        )
      );
    }

    setFilteredDentists(filtered);
  }, [searchQuery, selectedService, dentists]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchDentists();
    setRefreshing(false);
  }, []);

  // Generate dates for the next 7 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      day: days[date.getDay()],
      date: date.getDate(),
      month: date.toLocaleString('default', { month: 'short' }),
    };
  };

  const openBookingModal = (dentist: DentistStore) => {
    setSelectedDentist(dentist);
    setSelectedDate(new Date());
    setSelectedSlot(null);
    setSelectedServiceType('');
    setBookingNotes('');
    setBookingModalVisible(true);
  };

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      Alert.alert('Select Time', 'Please select a time slot');
      return;
    }
    if (!selectedServiceType) {
      Alert.alert('Select Service', 'Please select the service you need');
      return;
    }

    try {
      setIsBooking(true);

      const bookingData = {
        storeId: selectedDentist?._id,
        serviceType: 'dental_consultation',
        appointmentDate: selectedDate.toISOString().split('T')[0],
        appointmentTime: selectedSlot,
        service: selectedServiceType,
        notes: bookingNotes,
      };

      const response = await apiClient.post('/consultations/book', bookingData);

      if (response.success) {
        Alert.alert(
          'Appointment Booked!',
          `Your dental appointment with ${selectedDentist?.name} is confirmed for ${formatDate(selectedDate).day}, ${formatDate(selectedDate).date} ${formatDate(selectedDate).month} at ${selectedSlot}.`,
          [{ text: 'OK', onPress: () => setBookingModalVisible(false) }]
        );
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      Alert.alert('Booking Failed', error.message || 'Could not book appointment. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  const callDentist = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('Not Available', 'Phone number not available for this dentist.');
    }
  };

  // Render service card
  const renderServiceCard = (service: DentalService) => {
    const isSelected = selectedService === service.id;
    return (
      <TouchableOpacity
        key={service.id}
        style={[styles.serviceCard, isSelected && styles.serviceCardSelected]}
        onPress={() => setSelectedService(isSelected ? null : service.id)}
      >
        <View style={[styles.serviceIcon, isSelected && styles.serviceIconSelected]}>
          <Ionicons
            name={service.icon as any}
            size={24}
            color={isSelected ? '#fff' : '#06B6D4'}
          />
        </View>
        <Text style={[styles.serviceName, isSelected && styles.serviceNameSelected]}>
          {service.name}
        </Text>
        <Text style={styles.servicePrice}>{service.priceRange}</Text>
      </TouchableOpacity>
    );
  };

  // Render dentist card
  const renderDentistCard = (dentist: DentistStore) => (
    <TouchableOpacity
      key={dentist._id}
      style={styles.dentistCard}
      onPress={() => openBookingModal(dentist)}
    >
      <View style={styles.dentistHeader}>
        <View style={styles.dentistImageContainer}>
          {dentist.logo ? (
            <Image source={{ uri: dentist.logo }} style={styles.dentistImage} />
          ) : (
            <View style={styles.dentistImagePlaceholder}>
              <Ionicons name="person" size={32} color="#06B6D4" />
            </View>
          )}
        </View>
        <View style={styles.dentistInfo}>
          <Text style={styles.dentistName}>{dentist.name}</Text>
          <Text style={styles.dentistSpecialty}>
            {dentist.metadata?.qualification || 'BDS, MDS'}
          </Text>
          <Text style={styles.dentistExperience}>
            {dentist.metadata?.experience || '5+ years experience'}
          </Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={styles.ratingText}>
              {dentist.ratings.average.toFixed(1)} ({dentist.ratings.count} reviews)
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.dentistDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#6B7280" />
          <Text style={styles.detailText}>
            {dentist.address.city}, {dentist.address.state}
          </Text>
        </View>
        {dentist.metadata?.consultationFee && (
          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              Consultation: Rs {dentist.metadata.consultationFee}
            </Text>
          </View>
        )}
        {dentist.metadata?.languages && dentist.metadata.languages.length > 0 && (
          <View style={styles.detailRow}>
            <Ionicons name="chatbubbles-outline" size={16} color="#6B7280" />
            <Text style={styles.detailText}>
              {dentist.metadata.languages.join(', ')}
            </Text>
          </View>
        )}
      </View>

      {dentist.metadata?.services && dentist.metadata.services.length > 0 && (
        <View style={styles.servicesContainer}>
          {dentist.metadata.services.slice(0, 4).map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
          {dentist.metadata.services.length > 4 && (
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>+{dentist.metadata.services.length - 4}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => callDentist(dentist.contact.phone)}
        >
          <Ionicons name="call-outline" size={18} color="#06B6D4" />
          <Text style={styles.callButtonText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => openBookingModal(dentist)}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Dental Care</Text>
            <Text style={styles.headerSubtitle}>Find dentists near you</Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search dentists, services..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06B6D4']} />
        }
      >
        {/* Dental Services */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dental Services</Text>
          <Text style={styles.sectionSubtitle}>Select a service to filter dentists</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.servicesScroll}
          >
            {dentalServices.map(renderServiceCard)}
          </ScrollView>
        </View>

        {/* Dentists List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Dentists</Text>
            <Text style={styles.resultCount}>{filteredDentists.length} found</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#06B6D4" />
              <Text style={styles.loadingText}>Finding dentists...</Text>
            </View>
          ) : filteredDentists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No dentists found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedService
                  ? 'Try adjusting your search or filters'
                  : 'Check back later for available dentists'}
              </Text>
            </View>
          ) : (
            filteredDentists.map(renderDentistCard)
          )}
        </View>

        {/* Dental Tips */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dental Health Tips</Text>
          <View style={styles.tipsCard}>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="time-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Brush Twice Daily</Text>
                <Text style={styles.tipText}>Brush for 2 minutes, morning and night</Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="water-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Floss Daily</Text>
                <Text style={styles.tipText}>Clean between teeth to prevent decay</Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="calendar-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Regular Checkups</Text>
                <Text style={styles.tipText}>Visit your dentist every 6 months</Text>
              </View>
            </View>
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Ionicons name="nutrition-outline" size={20} color="#06B6D4" />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Limit Sugar</Text>
                <Text style={styles.tipText}>Reduce sugary foods and drinks</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book Appointment</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedDentist && (
                <View style={styles.selectedDentistInfo}>
                  <View style={styles.dentistImageSmall}>
                    {selectedDentist.logo ? (
                      <Image source={{ uri: selectedDentist.logo }} style={styles.dentistImageSmallImg} />
                    ) : (
                      <Ionicons name="person" size={24} color="#06B6D4" />
                    )}
                  </View>
                  <View>
                    <Text style={styles.selectedDentistName}>{selectedDentist.name}</Text>
                    <Text style={styles.selectedDentistSpec}>
                      {selectedDentist.metadata?.qualification || 'Dentist'}
                    </Text>
                  </View>
                </View>
              )}

              {/* Service Selection */}
              <Text style={styles.modalSectionTitle}>Select Service</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {dentalServices.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceChip,
                      selectedServiceType === service.name && styles.serviceChipSelected,
                    ]}
                    onPress={() => setSelectedServiceType(service.name)}
                  >
                    <Text
                      style={[
                        styles.serviceChipText,
                        selectedServiceType === service.name && styles.serviceChipTextSelected,
                      ]}
                    >
                      {service.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Date Selection */}
              <Text style={styles.modalSectionTitle}>Select Date</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {getAvailableDates().map((date, index) => {
                  const formatted = formatDate(date);
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateCard, isSelected && styles.dateCardSelected]}
                      onPress={() => setSelectedDate(date)}
                    >
                      <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
                        {formatted.day}
                      </Text>
                      <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
                        {formatted.date}
                      </Text>
                      <Text style={[styles.dateMonth, isSelected && styles.dateTextSelected]}>
                        {formatted.month}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time Slots */}
              <Text style={styles.modalSectionTitle}>Select Time</Text>
              <View style={styles.slotsGrid}>
                {timeSlots.map((slot, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.slotButton,
                      !slot.available && styles.slotUnavailable,
                      selectedSlot === slot.time && styles.slotSelected,
                    ]}
                    disabled={!slot.available}
                    onPress={() => setSelectedSlot(slot.time)}
                  >
                    <Text
                      style={[
                        styles.slotText,
                        !slot.available && styles.slotTextUnavailable,
                        selectedSlot === slot.time && styles.slotTextSelected,
                      ]}
                    >
                      {slot.time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Notes */}
              <Text style={styles.modalSectionTitle}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Describe your dental issue or concern..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={bookingNotes}
                onChangeText={setBookingNotes}
              />

              {/* Consultation Fee */}
              {selectedDentist?.metadata?.consultationFee && (
                <View style={styles.feeContainer}>
                  <Text style={styles.feeLabel}>Consultation Fee</Text>
                  <Text style={styles.feeAmount}>Rs {selectedDentist.metadata.consultationFee}</Text>
                </View>
              )}

              {/* Book Button */}
              <TouchableOpacity
                style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]}
                onPress={handleBookAppointment}
                disabled={isBooking}
              >
                {isBooking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color="#fff" />
                    <Text style={styles.confirmButtonText}>Confirm Appointment</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  resultCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  servicesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  serviceCard: {
    width: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  serviceCardSelected: {
    borderColor: '#06B6D4',
    backgroundColor: '#ECFEFF',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceIconSelected: {
    backgroundColor: '#06B6D4',
  },
  serviceName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 4,
  },
  serviceNameSelected: {
    color: '#0891B2',
  },
  servicePrice: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  dentistCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dentistHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dentistImageContainer: {
    marginRight: 12,
  },
  dentistImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  dentistImagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dentistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  dentistName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  dentistSpecialty: {
    fontSize: 13,
    color: '#06B6D4',
    marginTop: 2,
  },
  dentistExperience: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  dentistDetails: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  servicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 6,
  },
  serviceTag: {
    backgroundColor: '#ECFEFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  serviceTagText: {
    fontSize: 11,
    color: '#0891B2',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06B6D4',
    marginLeft: 6,
  },
  bookButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#06B6D4',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  tipsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  bottomPadding: {
    height: 40,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  selectedDentistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  dentistImageSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dentistImageSmallImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  selectedDentistName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedDentistSpec: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  serviceChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginLeft: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  serviceChipSelected: {
    backgroundColor: '#ECFEFF',
    borderColor: '#06B6D4',
  },
  serviceChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
  },
  serviceChipTextSelected: {
    color: '#0891B2',
  },
  dateCard: {
    width: 60,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    marginLeft: 16,
  },
  dateCardSelected: {
    backgroundColor: '#06B6D4',
  },
  dateDay: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginVertical: 2,
  },
  dateMonth: {
    fontSize: 12,
    color: '#6B7280',
  },
  dateTextSelected: {
    color: '#fff',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  slotButton: {
    width: (width - 48 - 24) / 4,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  slotUnavailable: {
    backgroundColor: '#E5E7EB',
  },
  slotSelected: {
    backgroundColor: '#06B6D4',
  },
  slotText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
  slotTextUnavailable: {
    color: '#9CA3AF',
  },
  slotTextSelected: {
    color: '#fff',
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  feeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ECFEFF',
    borderRadius: 12,
  },
  feeLabel: {
    fontSize: 14,
    color: '#374151',
  },
  feeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0891B2',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 8,
  },
});
