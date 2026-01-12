/**
 * Lab Tests Page
 * Browse and book diagnostic lab tests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import apiClient from '@/services/apiClient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  red500: '#EF4444',
  green500: '#22C55E',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
  teal500: '#14B8A6',
};

interface LabTest {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  tags: string[];
  serviceDetails: {
    preparationNeeded: boolean;
    fastingHours?: number;
    reportTime: string;
    testsIncluded?: number;
  };
  metadata: {
    testCategory: string;
  };
  cashbackPercentage: number;
  rating: {
    average: number;
    count: number;
  };
}

interface LabProvider {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  metadata: {
    testsCount: number;
    homeCollection: boolean;
    discount: number;
    nabl: boolean;
    reportTime: string;
  };
  rating: {
    average: number;
    count: number;
  };
}

// Test category icons
const testCategories = [
  { id: 'all', name: 'All Tests', icon: '🔬', color: COLORS.purple500 },
  { id: 'blood', name: 'Blood', icon: '🩸', color: COLORS.red500 },
  { id: 'thyroid', name: 'Thyroid', icon: '🦋', color: COLORS.blue500 },
  { id: 'diabetes', name: 'Diabetes', icon: '💉', color: COLORS.amber500 },
  { id: 'liver', name: 'Liver', icon: '🫀', color: COLORS.teal500 },
  { id: 'kidney', name: 'Kidney', icon: '🫘', color: COLORS.green500 },
  { id: 'package', name: 'Packages', icon: '📦', color: COLORS.purple500 },
];

const LabTestsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [providers, setProviders] = useState<LabProvider[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LabProvider | null>(null);
  const [bookingForm, setBookingForm] = useState({
    patientName: '',
    patientPhone: '',
    address: '',
    preferredDate: '',
    preferredTime: 'morning',
    homeCollection: true,
  });

  useEffect(() => {
    fetchLabData();
  }, [selectedCategory]);

  const fetchLabData = async () => {
    try {
      setLoading(true);

      // Fetch lab tests (products with type 'service' and lab-test tag)
      const testsResponse = await apiClient.get('/products', {
        params: {
          productType: 'service',
          tags: selectedCategory === 'all' ? 'lab-test' : `lab-test,${selectedCategory}`,
          limit: 50,
        }
      });

      // Fetch lab providers (stores with metadata.type = 'lab')
      const providersResponse = await apiClient.get('/stores', {
        params: {
          tags: 'lab',
          limit: 20,
        }
      });

      if (testsResponse.success && testsResponse.data) {
        setTests(testsResponse.data.products || []);
      }

      if (providersResponse.success && providersResponse.data) {
        setProviders(providersResponse.data.stores || []);
      }
    } catch (error) {
      console.error('Error fetching lab data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Filter tests by search query
    if (searchQuery.trim()) {
      const filtered = tests.filter(
        (test) =>
          test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          test.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setTests(filtered);
    } else {
      fetchLabData();
    }
  };

  const handleBookTest = (test: LabTest) => {
    setSelectedTest(test);
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!bookingForm.patientName || !bookingForm.patientPhone || !bookingForm.address) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      // In a real app, this would call the service booking API
      Alert.alert(
        'Booking Confirmed!',
        `Your ${selectedTest?.name} has been booked.\n\nA phlebotomist will visit on ${bookingForm.preferredDate || 'tomorrow'} in the ${bookingForm.preferredTime}.`,
        [{ text: 'OK', onPress: () => setShowBookingModal(false) }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book test. Please try again.');
    }
  };

  const renderCategoryFilters = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryScroll}
      contentContainerStyle={styles.categoryContainer}
    >
      {testCategories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && { backgroundColor: category.color },
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.categoryTextActive,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPopularPackages = () => {
    const packages = tests.filter((t) => t.metadata?.testCategory === 'Package').slice(0, 4);
    if (packages.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Health Packages</Text>
          <TouchableOpacity onPress={() => setSelectedCategory('package')}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg._id}
              style={styles.packageCard}
              onPress={() => handleBookTest(pkg)}
            >
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.packageGradient}
              >
                <View style={styles.packageBadge}>
                  <Text style={styles.packageBadgeText}>
                    {pkg.serviceDetails?.testsIncluded || 0} Tests
                  </Text>
                </View>
                <Text style={styles.packageName}>{pkg.name}</Text>
                <Text style={styles.packageDescription} numberOfLines={2}>
                  {pkg.description}
                </Text>
                <View style={styles.packagePricing}>
                  <Text style={styles.packagePrice}>₹{pkg.price}</Text>
                  {pkg.originalPrice > pkg.price && (
                    <Text style={styles.packageOriginalPrice}>₹{pkg.originalPrice}</Text>
                  )}
                </View>
                <View style={styles.packageCashback}>
                  <Text style={styles.packageCashbackText}>
                    {pkg.cashbackPercentage}% Cashback
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderLabProviders = () => {
    if (providers.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trusted Lab Partners</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {providers.map((provider) => (
            <TouchableOpacity
              key={provider._id}
              style={styles.providerCard}
              onPress={() => setSelectedProvider(provider)}
            >
              <Image source={{ uri: provider.logo }} style={styles.providerLogo} />
              <Text style={styles.providerName}>{provider.name}</Text>
              <View style={styles.providerMeta}>
                <View style={styles.providerRating}>
                  <Ionicons name="star" size={12} color={COLORS.amber500} />
                  <Text style={styles.providerRatingText}>
                    {provider.rating?.average?.toFixed(1) || '4.5'}
                  </Text>
                </View>
                {provider.metadata?.nabl && (
                  <View style={styles.nablBadge}>
                    <Text style={styles.nablText}>NABL</Text>
                  </View>
                )}
              </View>
              {provider.metadata?.homeCollection && (
                <Text style={styles.homeCollectionText}>🏠 Home Collection</Text>
              )}
              <Text style={styles.providerDiscount}>
                Up to {provider.metadata?.discount || 20}% Off
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderTestCard = (test: LabTest) => {
    const category = test.metadata?.testCategory || 'Other';

    return (
      <TouchableOpacity
        key={test._id}
        style={styles.testCard}
        onPress={() => handleBookTest(test)}
      >
        <View style={styles.testCardContent}>
          <View style={styles.testInfo}>
            <View style={styles.testHeader}>
              <Text style={styles.testName}>{test.name}</Text>
              {test.cashbackPercentage > 0 && (
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{test.cashbackPercentage}%</Text>
                </View>
              )}
            </View>
            <Text style={styles.testCategory}>{category}</Text>
            <Text style={styles.testDescription} numberOfLines={2}>
              {test.description}
            </Text>
            <View style={styles.testMeta}>
              {test.serviceDetails?.preparationNeeded && (
                <View style={styles.metaTag}>
                  <Ionicons name="moon" size={12} color={COLORS.amber500} />
                  <Text style={styles.metaTagText}>
                    Fasting {test.serviceDetails.fastingHours || 8}hrs
                  </Text>
                </View>
              )}
              <View style={styles.metaTag}>
                <Ionicons name="time" size={12} color={COLORS.blue500} />
                <Text style={styles.metaTagText}>
                  {test.serviceDetails?.reportTime || '24-48 hrs'}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.testPricing}>
            <Text style={styles.testPrice}>₹{test.price}</Text>
            {test.originalPrice > test.price && (
              <Text style={styles.testOriginalPrice}>₹{test.originalPrice}</Text>
            )}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => handleBookTest(test)}
            >
              <Text style={styles.bookButtonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookingModal = () => (
    <Modal visible={showBookingModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Book Test</Text>
            <TouchableOpacity onPress={() => setShowBookingModal(false)}>
              <Ionicons name="close" size={24} color={COLORS.gray600} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {selectedTest && (
              <View style={styles.selectedTestInfo}>
                <Text style={styles.selectedTestName}>{selectedTest.name}</Text>
                <View style={styles.selectedTestPricing}>
                  <Text style={styles.selectedTestPrice}>₹{selectedTest.price}</Text>
                  {selectedTest.cashbackPercentage > 0 && (
                    <Text style={styles.selectedTestCashback}>
                      + ₹{Math.round(selectedTest.price * selectedTest.cashbackPercentage / 100)} Cashback
                    </Text>
                  )}
                </View>
                {selectedTest.serviceDetails?.preparationNeeded && (
                  <View style={styles.prepWarning}>
                    <Ionicons name="warning" size={16} color={COLORS.amber500} />
                    <Text style={styles.prepWarningText}>
                      Requires {selectedTest.serviceDetails.fastingHours || 8} hours fasting
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Patient Name *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter patient name"
                value={bookingForm.patientName}
                onChangeText={(text) => setBookingForm({ ...bookingForm, patientName: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Phone Number *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter phone number"
                keyboardType="phone-pad"
                value={bookingForm.patientPhone}
                onChangeText={(text) => setBookingForm({ ...bookingForm, patientPhone: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Collection Address *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                placeholder="Enter complete address"
                multiline
                numberOfLines={3}
                value={bookingForm.address}
                onChangeText={(text) => setBookingForm({ ...bookingForm, address: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Preferred Time Slot</Text>
              <View style={styles.timeSlots}>
                {[
                  { id: 'morning', label: '6AM-10AM', icon: '🌅' },
                  { id: 'afternoon', label: '10AM-2PM', icon: '☀️' },
                  { id: 'evening', label: '2PM-6PM', icon: '🌆' },
                ].map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.timeSlot,
                      bookingForm.preferredTime === slot.id && styles.timeSlotActive,
                    ]}
                    onPress={() => setBookingForm({ ...bookingForm, preferredTime: slot.id })}
                  >
                    <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
                    <Text
                      style={[
                        styles.timeSlotText,
                        bookingForm.preferredTime === slot.id && styles.timeSlotTextActive,
                      ]}
                    >
                      {slot.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.collectionToggle}>
              <TouchableOpacity
                style={[
                  styles.collectionOption,
                  bookingForm.homeCollection && styles.collectionOptionActive,
                ]}
                onPress={() => setBookingForm({ ...bookingForm, homeCollection: true })}
              >
                <Ionicons
                  name="home"
                  size={20}
                  color={bookingForm.homeCollection ? COLORS.white : COLORS.gray600}
                />
                <Text
                  style={[
                    styles.collectionOptionText,
                    bookingForm.homeCollection && styles.collectionOptionTextActive,
                  ]}
                >
                  Home Collection
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.collectionOption,
                  !bookingForm.homeCollection && styles.collectionOptionActive,
                ]}
                onPress={() => setBookingForm({ ...bookingForm, homeCollection: false })}
              >
                <Ionicons
                  name="business"
                  size={20}
                  color={!bookingForm.homeCollection ? COLORS.white : COLORS.gray600}
                />
                <Text
                  style={[
                    styles.collectionOptionText,
                    !bookingForm.homeCollection && styles.collectionOptionTextActive,
                  ]}
                >
                  Visit Lab
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{selectedTest?.price || 0}</Text>
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmBooking}>
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.purple500} />
        <Text style={styles.loadingText}>Loading lab tests...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#8B5CF6', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Lab Tests</Text>
            <Text style={styles.headerSubtitle}>Book diagnostic tests with cashback</Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Ionicons name="cart-outline" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.gray400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search tests, packages..."
            placeholderTextColor={COLORS.gray400}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
        </View>
      </LinearGradient>

      {renderCategoryFilters()}

      <ScrollView showsVerticalScrollIndicator={false}>
        {selectedCategory === 'all' && (
          <>
            {renderPopularPackages()}
            {renderLabProviders()}
          </>
        )}

        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Tests' : testCategories.find(c => c.id === selectedCategory)?.name || 'Tests'}
          </Text>
          {tests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔬</Text>
              <Text style={styles.emptyText}>No tests found</Text>
            </View>
          ) : (
            tests.map(renderTestCard)
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {renderBookingModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  cartButton: { padding: 8 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, marginHorizontal: 16, borderRadius: 12, paddingHorizontal: 12 },
  searchInput: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, fontSize: 14, color: COLORS.navy },

  categoryScroll: { backgroundColor: COLORS.gray50 },
  categoryContainer: { paddingHorizontal: 16, paddingVertical: 12 },
  categoryChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  categoryIcon: { fontSize: 16, marginRight: 6 },
  categoryText: { fontSize: 13, fontWeight: '500', color: COLORS.gray600 },
  categoryTextActive: { color: COLORS.white },

  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.purple500 },

  packageCard: { width: 220, marginRight: 12, borderRadius: 16, overflow: 'hidden' },
  packageGradient: { padding: 16, minHeight: 160 },
  packageBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 12 },
  packageBadgeText: { fontSize: 11, fontWeight: '600', color: COLORS.white },
  packageName: { fontSize: 16, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  packageDescription: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 12 },
  packagePricing: { flexDirection: 'row', alignItems: 'center' },
  packagePrice: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  packageOriginalPrice: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginLeft: 8, textDecorationLine: 'line-through' },
  packageCashback: { marginTop: 8 },
  packageCashbackText: { fontSize: 12, fontWeight: '600', color: COLORS.amber500 },

  providerCard: { width: 140, padding: 12, marginRight: 12, backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.gray200, alignItems: 'center' },
  providerLogo: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, backgroundColor: COLORS.gray100 },
  providerName: { fontSize: 13, fontWeight: '600', color: COLORS.navy, textAlign: 'center', marginBottom: 4 },
  providerMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  providerRating: { flexDirection: 'row', alignItems: 'center' },
  providerRatingText: { fontSize: 12, fontWeight: '500', color: COLORS.gray600, marginLeft: 2 },
  nablBadge: { backgroundColor: COLORS.green500, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 6 },
  nablText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
  homeCollectionText: { fontSize: 10, color: COLORS.gray600, marginBottom: 4 },
  providerDiscount: { fontSize: 11, fontWeight: '600', color: COLORS.green500 },

  testsSection: { padding: 16 },
  testCard: { backgroundColor: COLORS.white, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: COLORS.gray200, overflow: 'hidden' },
  testCardContent: { flexDirection: 'row', padding: 12 },
  testInfo: { flex: 1 },
  testHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  testName: { fontSize: 15, fontWeight: '600', color: COLORS.navy, flex: 1 },
  cashbackBadge: { backgroundColor: COLORS.green500, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  cashbackText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  testCategory: { fontSize: 11, color: COLORS.purple500, marginTop: 2 },
  testDescription: { fontSize: 12, color: COLORS.gray600, marginTop: 4 },
  testMeta: { flexDirection: 'row', marginTop: 8, gap: 8 },
  metaTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaTagText: { fontSize: 10, color: COLORS.gray600, marginLeft: 4 },
  testPricing: { alignItems: 'flex-end', justifyContent: 'space-between' },
  testPrice: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  testOriginalPrice: { fontSize: 12, color: COLORS.gray400, textDecorationLine: 'line-through' },
  bookButton: { backgroundColor: COLORS.purple500, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 8 },
  bookButtonText: { fontSize: 12, fontWeight: '600', color: COLORS.white },

  emptyState: { alignItems: 'center', padding: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, color: COLORS.gray600 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  modalBody: { padding: 16 },
  modalFooter: { padding: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 },

  selectedTestInfo: { backgroundColor: COLORS.purple500 + '10', padding: 16, borderRadius: 12, marginBottom: 16 },
  selectedTestName: { fontSize: 16, fontWeight: '600', color: COLORS.navy },
  selectedTestPricing: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  selectedTestPrice: { fontSize: 20, fontWeight: '700', color: COLORS.purple500 },
  selectedTestCashback: { fontSize: 12, color: COLORS.green500, marginLeft: 8 },
  prepWarning: { flexDirection: 'row', alignItems: 'center', marginTop: 8, backgroundColor: COLORS.amber500 + '20', padding: 8, borderRadius: 8 },
  prepWarningText: { fontSize: 12, color: COLORS.amber500, marginLeft: 6 },

  formGroup: { marginBottom: 16 },
  formLabel: { fontSize: 13, fontWeight: '600', color: COLORS.navy, marginBottom: 8 },
  formInput: { borderWidth: 1, borderColor: COLORS.gray200, borderRadius: 12, padding: 12, fontSize: 14, color: COLORS.navy },
  formTextArea: { height: 80, textAlignVertical: 'top' },

  timeSlots: { flexDirection: 'row', justifyContent: 'space-between' },
  timeSlot: { flex: 1, alignItems: 'center', padding: 12, marginHorizontal: 4, backgroundColor: COLORS.gray100, borderRadius: 12 },
  timeSlotActive: { backgroundColor: COLORS.purple500 },
  timeSlotIcon: { fontSize: 20, marginBottom: 4 },
  timeSlotText: { fontSize: 11, color: COLORS.gray600 },
  timeSlotTextActive: { color: COLORS.white },

  collectionToggle: { flexDirection: 'row', marginTop: 8 },
  collectionOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, backgroundColor: COLORS.gray100, marginHorizontal: 4, borderRadius: 12 },
  collectionOptionActive: { backgroundColor: COLORS.purple500 },
  collectionOptionText: { fontSize: 13, color: COLORS.gray600, marginLeft: 8 },
  collectionOptionTextActive: { color: COLORS.white },

  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  totalLabel: { fontSize: 14, color: COLORS.gray600 },
  totalValue: { fontSize: 24, fontWeight: '700', color: COLORS.navy },
  confirmButton: { backgroundColor: COLORS.purple500, padding: 16, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});

export default LabTestsPage;
