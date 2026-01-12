/**
 * Fitness Booking Page - Gym/Studio/Trainer specific booking
 * Handles membership plans, class bookings, trainer sessions, day passes
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import apiClient from '@/services/apiClient';
import { showAlert } from '@/components/common/CrossPlatformAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  green500: '#22C55E',
  orange500: '#F97316',
  amber500: '#F59E0B',
  red500: '#EF4444',
  purple500: '#8B5CF6',
};

// Booking types
type BookingTabType = 'membership' | 'classes' | 'trainer' | 'daypass';

interface Store {
  _id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  banner: string[];
  ratings: { average: number; count: number };
  location: { address: string; city: string };
  offers: { cashback: number };
  tags: string[];
  serviceTypes?: string[];
}

interface MembershipPlan {
  id: string;
  name: string;
  duration: string;
  durationMonths: number;
  price: number;
  originalPrice: number;
  features: string[];
  popular?: boolean;
}

interface FitnessClass {
  id: string;
  name: string;
  instructor: string;
  time: string;
  duration: string;
  spots: number;
  maxSpots: number;
  price: number;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

const MEMBERSHIP_PLANS: MembershipPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly',
    duration: '1 Month',
    durationMonths: 1,
    price: 2499,
    originalPrice: 2999,
    features: ['Full gym access', 'Locker room', 'Fitness assessment'],
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    duration: '3 Months',
    durationMonths: 3,
    price: 5999,
    originalPrice: 7999,
    features: ['Full gym access', 'Locker room', 'Fitness assessment', '1 PT session/month', 'Diet consultation'],
    popular: true,
  },
  {
    id: 'halfyearly',
    name: 'Half Yearly',
    duration: '6 Months',
    durationMonths: 6,
    price: 9999,
    originalPrice: 13999,
    features: ['Full gym access', 'Locker room', 'Fitness assessment', '2 PT sessions/month', 'Diet consultation', 'Group classes'],
  },
  {
    id: 'annual',
    name: 'Annual',
    duration: '12 Months',
    durationMonths: 12,
    price: 17999,
    originalPrice: 25999,
    features: ['Full gym access', 'Locker room', 'Fitness assessment', '4 PT sessions/month', 'Diet consultation', 'All group classes', 'Guest passes'],
  },
];

const SAMPLE_CLASSES: FitnessClass[] = [
  { id: '1', name: 'Morning Yoga', instructor: 'Priya S.', time: '06:00 AM', duration: '60 min', spots: 8, maxSpots: 15, price: 299 },
  { id: '2', name: 'HIIT Blast', instructor: 'Rahul K.', time: '07:30 AM', duration: '45 min', spots: 5, maxSpots: 20, price: 349 },
  { id: '3', name: 'Pilates Core', instructor: 'Sneha M.', time: '09:00 AM', duration: '50 min', spots: 12, maxSpots: 12, price: 399 },
  { id: '4', name: 'Zumba', instructor: 'Meera P.', time: '05:00 PM', duration: '60 min', spots: 3, maxSpots: 25, price: 249 },
  { id: '5', name: 'CrossFit', instructor: 'Vikram R.', time: '06:30 PM', duration: '60 min', spots: 10, maxSpots: 15, price: 449 },
  { id: '6', name: 'Spin Class', instructor: 'Arjun D.', time: '07:30 PM', duration: '45 min', spots: 6, maxSpots: 20, price: 349 },
];

const FitnessBookingPage: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { storeId, storeName, cashback, type } = useLocalSearchParams<{
    storeId: string;
    storeName?: string;
    cashback?: string;
    type?: string;
  }>();

  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<BookingTabType>(
    (type as BookingTabType) || 'membership'
  );

  // Membership state
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);

  // Class booking state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedClass, setSelectedClass] = useState<FitnessClass | null>(null);
  const [classes, setClasses] = useState<FitnessClass[]>(SAMPLE_CLASSES);

  // Trainer session state
  const [selectedTrainerDate, setSelectedTrainerDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<'single' | 'pack5' | 'pack10'>('single');

  // Day pass state
  const [dayPassDate, setDayPassDate] = useState<Date>(new Date());
  const [dayPassCount, setDayPassCount] = useState(1);

  // Customer details
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchStore = useCallback(async () => {
    if (!storeId) return;

    try {
      const response = await apiClient.get(`/stores/${storeId}`);
      const storeData = (response.data as any)?.store || response.data;
      setStore(storeData);
    } catch (error) {
      console.error('Error fetching store:', error);
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchStore();
  }, [fetchStore]);

  // Generate next 14 days
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

  // Generate time slots for trainer sessions
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 6; hour <= 20; hour++) {
      slots.push({
        id: `${hour}:00`,
        time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
        available: Math.random() > 0.3, // Simulated availability
      });
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getTrainerPrice = () => {
    switch (sessionType) {
      case 'single': return 999;
      case 'pack5': return 4499;
      case 'pack10': return 7999;
      default: return 999;
    }
  };

  const getDayPassPrice = () => 499 * dayPassCount;

  const getCashbackAmount = () => {
    const cashbackPercent = parseInt(cashback || '0') || store?.offers?.cashback || 15;
    let totalPrice = 0;

    switch (activeTab) {
      case 'membership':
        totalPrice = selectedPlan?.price || 0;
        break;
      case 'classes':
        totalPrice = selectedClass?.price || 0;
        break;
      case 'trainer':
        totalPrice = getTrainerPrice();
        break;
      case 'daypass':
        totalPrice = getDayPassPrice();
        break;
    }

    return Math.round(totalPrice * cashbackPercent / 100);
  };

  const getTotalPrice = () => {
    switch (activeTab) {
      case 'membership':
        return selectedPlan?.price || 0;
      case 'classes':
        return selectedClass?.price || 0;
      case 'trainer':
        return getTrainerPrice();
      case 'daypass':
        return getDayPassPrice();
      default:
        return 0;
    }
  };

  const validateForm = () => {
    if (!customerName.trim()) {
      setErrorMessage('Please enter your name');
      return false;
    }
    if (!customerPhone.trim()) {
      setErrorMessage('Please enter your phone number');
      return false;
    }

    switch (activeTab) {
      case 'membership':
        if (!selectedPlan) {
          setErrorMessage('Please select a membership plan');
          return false;
        }
        break;
      case 'classes':
        if (!selectedClass) {
          setErrorMessage('Please select a class');
          return false;
        }
        break;
      case 'trainer':
        if (!selectedTimeSlot) {
          setErrorMessage('Please select a time slot');
          return false;
        }
        break;
    }

    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) return;

    setErrorMessage('');
    setSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // TODO: Replace with actual booking API
      // const response = await apiClient.post('/bookings/fitness', { ... });

      setSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      setSubmitting(false);
      setErrorMessage('Failed to complete booking. Please try again.');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.back();
  };

  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {[
          { id: 'membership' as BookingTabType, label: 'Membership', icon: 'card' },
          { id: 'classes' as BookingTabType, label: 'Classes', icon: 'people' },
          { id: 'trainer' as BookingTabType, label: 'Trainer', icon: 'person' },
          { id: 'daypass' as BookingTabType, label: 'Day Pass', icon: 'ticket' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? COLORS.white : COLORS.gray600}
            />
            <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderMembershipPlans = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Choose Your Plan</Text>
      {MEMBERSHIP_PLANS.map((plan) => (
        <TouchableOpacity
          key={plan.id}
          style={[
            styles.planCard,
            selectedPlan?.id === plan.id && styles.planCardSelected,
            plan.popular && styles.planCardPopular,
          ]}
          onPress={() => setSelectedPlan(plan)}
          activeOpacity={0.8}
        >
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
            </View>
          )}
          <View style={styles.planHeader}>
            <View>
              <Text style={styles.planName}>{plan.name}</Text>
              <Text style={styles.planDuration}>{plan.duration}</Text>
            </View>
            <View style={styles.planPriceContainer}>
              <Text style={styles.planOriginalPrice}>₹{plan.originalPrice.toLocaleString()}</Text>
              <Text style={styles.planPrice}>₹{plan.price.toLocaleString()}</Text>
            </View>
          </View>
          <View style={styles.planFeatures}>
            {plan.features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green500} />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
          {selectedPlan?.id === plan.id && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.orange500} />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderDateSelector = (selected: Date, onSelect: (date: Date) => void) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
      {nextDays.map((date, index) => {
        const isSelected = date.toDateString() === selected.toDateString();
        const isToday = date.toDateString() === new Date().toDateString();
        return (
          <TouchableOpacity
            key={index}
            style={[styles.dateCard, isSelected && styles.dateCardSelected]}
            onPress={() => onSelect(date)}
          >
            <Text style={[styles.dateDay, isSelected && styles.dateTextSelected]}>
              {date.toLocaleDateString('en-US', { weekday: 'short' })}
            </Text>
            <Text style={[styles.dateNumber, isSelected && styles.dateTextSelected]}>
              {date.getDate()}
            </Text>
            {isToday && <View style={[styles.todayDot, isSelected && styles.todayDotSelected]} />}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderClassBooking = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      {renderDateSelector(selectedDate, setSelectedDate)}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Available Classes</Text>
      {classes.map((cls) => {
        const isFull = cls.spots === 0;
        const isSelected = selectedClass?.id === cls.id;
        return (
          <TouchableOpacity
            key={cls.id}
            style={[
              styles.classCard,
              isSelected && styles.classCardSelected,
              isFull && styles.classCardFull,
            ]}
            onPress={() => !isFull && setSelectedClass(cls)}
            disabled={isFull}
            activeOpacity={0.8}
          >
            <View style={styles.classTime}>
              <Text style={styles.classTimeText}>{cls.time}</Text>
              <Text style={styles.classDuration}>{cls.duration}</Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={styles.className}>{cls.name}</Text>
              <Text style={styles.classInstructor}>{cls.instructor}</Text>
              <View style={styles.spotsRow}>
                <Ionicons name="people" size={14} color={isFull ? COLORS.red500 : COLORS.gray600} />
                <Text style={[styles.spotsText, isFull && styles.spotsTextFull]}>
                  {isFull ? 'Full' : `${cls.spots} spots left`}
                </Text>
              </View>
            </View>
            <View style={styles.classPrice}>
              <Text style={styles.classPriceText}>₹{cls.price}</Text>
              {isSelected && <Ionicons name="checkmark-circle" size={20} color={COLORS.orange500} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderTrainerBooking = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Session Type</Text>
      <View style={styles.sessionTypeContainer}>
        {[
          { id: 'single' as const, label: 'Single Session', price: 999 },
          { id: 'pack5' as const, label: '5 Sessions', price: 4499, save: '10%' },
          { id: 'pack10' as const, label: '10 Sessions', price: 7999, save: '20%' },
        ].map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.sessionOption, sessionType === option.id && styles.sessionOptionSelected]}
            onPress={() => setSessionType(option.id)}
          >
            {option.save && (
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save {option.save}</Text>
              </View>
            )}
            <Text style={[styles.sessionLabel, sessionType === option.id && styles.sessionLabelSelected]}>
              {option.label}
            </Text>
            <Text style={[styles.sessionPrice, sessionType === option.id && styles.sessionPriceSelected]}>
              ₹{option.price.toLocaleString()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Select Date</Text>
      {renderDateSelector(selectedTrainerDate, setSelectedTrainerDate)}

      <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Select Time</Text>
      <View style={styles.timeGrid}>
        {timeSlots.map((slot) => (
          <TouchableOpacity
            key={slot.id}
            style={[
              styles.timeSlot,
              selectedTimeSlot === slot.id && styles.timeSlotSelected,
              !slot.available && styles.timeSlotDisabled,
            ]}
            onPress={() => slot.available && setSelectedTimeSlot(slot.id)}
            disabled={!slot.available}
          >
            <Text style={[
              styles.timeSlotText,
              selectedTimeSlot === slot.id && styles.timeSlotTextSelected,
              !slot.available && styles.timeSlotTextDisabled,
            ]}>
              {slot.time}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderDayPass = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Date</Text>
      {renderDateSelector(dayPassDate, setDayPassDate)}

      <View style={styles.dayPassCard}>
        <View style={styles.dayPassHeader}>
          <View>
            <Text style={styles.dayPassTitle}>Day Pass</Text>
            <Text style={styles.dayPassSubtitle}>Full gym access for 1 day</Text>
          </View>
          <Text style={styles.dayPassPrice}>₹499/pass</Text>
        </View>

        <View style={styles.dayPassFeatures}>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green500} />
            <Text style={styles.featureText}>Full equipment access</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green500} />
            <Text style={styles.featureText}>Locker room & shower</Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.green500} />
            <Text style={styles.featureText}>Valid for 12 hours</Text>
          </View>
        </View>

        <View style={styles.quantitySelector}>
          <Text style={styles.quantityLabel}>Number of Passes</Text>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => dayPassCount > 1 && setDayPassCount(dayPassCount - 1)}
            >
              <Ionicons name="remove" size={20} color={COLORS.navy} />
            </TouchableOpacity>
            <Text style={styles.quantityValue}>{dayPassCount}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => dayPassCount < 5 && setDayPassCount(dayPassCount + 1)}
            >
              <Ionicons name="add" size={20} color={COLORS.navy} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderCustomerDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Details</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="person" size={18} color={COLORS.gray400} />
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor={COLORS.gray400}
          value={customerName}
          onChangeText={setCustomerName}
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="call" size={18} color={COLORS.gray400} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number *"
          placeholderTextColor={COLORS.gray400}
          value={customerPhone}
          onChangeText={setCustomerPhone}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={18} color={COLORS.gray400} />
        <TextInput
          style={styles.input}
          placeholder="Email (Optional)"
          placeholderTextColor={COLORS.gray400}
          value={customerEmail}
          onChangeText={setCustomerEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={COLORS.orange500} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const displayName = store?.name || storeName || 'Fitness Center';
  const displayCashback = parseInt(cashback || '0') || store?.offers?.cashback || 15;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          {/* Header */}
          <LinearGradient
            colors={[COLORS.orange500, '#EA580C']}
            style={[styles.header, { paddingTop: Platform.OS === 'ios' ? insets.top : 16 }]}
          >
            <View style={styles.headerTop}>
              <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color={COLORS.white} />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{displayName}</Text>
                <View style={styles.cashbackRow}>
                  <Ionicons name="gift" size={14} color={COLORS.white} />
                  <Text style={styles.cashbackText}>{displayCashback}% Cashback</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Tabs */}
          {renderTabs()}

          <ScrollView
            style={styles.content}
            contentContainerStyle={{ paddingBottom: 180 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {activeTab === 'membership' && renderMembershipPlans()}
            {activeTab === 'classes' && renderClassBooking()}
            {activeTab === 'trainer' && renderTrainerBooking()}
            {activeTab === 'daypass' && renderDayPass()}
            {renderCustomerDetails()}
          </ScrollView>

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color={COLORS.red500} />
              <Text style={styles.errorText}>{errorMessage}</Text>
              <TouchableOpacity onPress={() => setErrorMessage('')}>
                <Ionicons name="close" size={18} color={COLORS.red500} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Bottom Bar */}
          <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.priceSection}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalPrice}>₹{getTotalPrice().toLocaleString()}</Text>
              {getCashbackAmount() > 0 && (
                <Text style={styles.cashbackEarn}>
                  Earn ₹{getCashbackAmount()} cashback
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              onPress={handleBooking}
              disabled={submitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[COLORS.orange500, '#EA580C']}
                style={styles.bookButtonGradient}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.bookButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Success Modal */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={handleSuccessClose}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.successIcon}>
                <Ionicons name="checkmark-circle" size={64} color={COLORS.green500} />
              </View>
              <Text style={styles.modalTitle}>Booking Confirmed!</Text>
              <Text style={styles.modalMessage}>
                {activeTab === 'membership'
                  ? `Your ${selectedPlan?.name} membership is confirmed.`
                  : activeTab === 'classes'
                  ? `You're booked for ${selectedClass?.name}.`
                  : activeTab === 'trainer'
                  ? 'Your trainer session is confirmed.'
                  : 'Your day pass is confirmed.'}
              </Text>
              <View style={styles.modalDetails}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Amount Paid</Text>
                  <Text style={styles.modalDetailValue}>₹{getTotalPrice().toLocaleString()}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Cashback Earned</Text>
                  <Text style={[styles.modalDetailValue, { color: COLORS.green500 }]}>
                    ₹{getCashbackAmount()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.doneButton} onPress={handleSuccessClose}>
                <LinearGradient
                  colors={[COLORS.orange500, '#EA580C']}
                  style={styles.doneButtonGradient}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray50 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.white },
  loadingText: { marginTop: 12, fontSize: 14, color: COLORS.gray600 },

  header: { paddingHorizontal: 16, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white },
  cashbackRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cashbackText: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },

  tabsContainer: { backgroundColor: COLORS.white, paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: COLORS.gray200 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, backgroundColor: COLORS.gray100, marginRight: 8 },
  tabActive: { backgroundColor: COLORS.orange500 },
  tabText: { fontSize: 14, fontWeight: '600', color: COLORS.gray600 },
  tabTextActive: { color: COLORS.white },

  content: { flex: 1 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },

  // Membership Plans
  planCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 2, borderColor: COLORS.gray200, position: 'relative' },
  planCardSelected: { borderColor: COLORS.orange500 },
  planCardPopular: { borderColor: COLORS.purple500 },
  popularBadge: { position: 'absolute', top: -1, right: 16, backgroundColor: COLORS.purple500, paddingHorizontal: 12, paddingVertical: 4, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  popularBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.white },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  planName: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  planDuration: { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  planPriceContainer: { alignItems: 'flex-end' },
  planOriginalPrice: { fontSize: 13, color: COLORS.gray400, textDecorationLine: 'line-through' },
  planPrice: { fontSize: 22, fontWeight: '700', color: COLORS.orange500 },
  planFeatures: { borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  featureText: { fontSize: 13, color: COLORS.gray600, flex: 1 },
  selectedIndicator: { position: 'absolute', top: 16, left: 16 },

  // Date Selector
  dateScroll: { marginBottom: 8 },
  dateCard: { width: 60, height: 72, borderRadius: 12, backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1.5, borderColor: COLORS.gray200 },
  dateCardSelected: { borderColor: COLORS.orange500, backgroundColor: COLORS.orange500 },
  dateDay: { fontSize: 11, fontWeight: '500', color: COLORS.gray600, textTransform: 'uppercase' },
  dateNumber: { fontSize: 20, fontWeight: '700', color: COLORS.navy, marginVertical: 2 },
  dateTextSelected: { color: COLORS.white },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.orange500 },
  todayDotSelected: { backgroundColor: COLORS.white },

  // Class Booking
  classCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1.5, borderColor: COLORS.gray200 },
  classCardSelected: { borderColor: COLORS.orange500, backgroundColor: '#FFF7ED' },
  classCardFull: { opacity: 0.6 },
  classTime: { width: 70, alignItems: 'center', paddingRight: 12, borderRightWidth: 1, borderRightColor: COLORS.gray200 },
  classTimeText: { fontSize: 13, fontWeight: '700', color: COLORS.navy },
  classDuration: { fontSize: 11, color: COLORS.gray600, marginTop: 2 },
  classInfo: { flex: 1, paddingHorizontal: 12 },
  className: { fontSize: 15, fontWeight: '600', color: COLORS.navy },
  classInstructor: { fontSize: 12, color: COLORS.gray600, marginTop: 2 },
  spotsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  spotsText: { fontSize: 11, color: COLORS.gray600 },
  spotsTextFull: { color: COLORS.red500 },
  classPrice: { alignItems: 'center', gap: 4 },
  classPriceText: { fontSize: 16, fontWeight: '700', color: COLORS.orange500 },

  // Trainer Booking
  sessionTypeContainer: { flexDirection: 'row', gap: 8 },
  sessionOption: { flex: 1, backgroundColor: COLORS.white, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.gray200, position: 'relative' },
  sessionOptionSelected: { borderColor: COLORS.orange500, backgroundColor: '#FFF7ED' },
  saveBadge: { position: 'absolute', top: -8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  saveBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.white },
  sessionLabel: { fontSize: 12, fontWeight: '600', color: COLORS.gray600, textAlign: 'center', marginBottom: 4 },
  sessionLabelSelected: { color: COLORS.navy },
  sessionPrice: { fontSize: 16, fontWeight: '700', color: COLORS.navy },
  sessionPriceSelected: { color: COLORS.orange500 },

  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeSlot: { width: (SCREEN_WIDTH - 48) / 4, paddingVertical: 10, borderRadius: 10, backgroundColor: COLORS.white, alignItems: 'center', borderWidth: 1.5, borderColor: COLORS.gray200 },
  timeSlotSelected: { borderColor: COLORS.orange500, backgroundColor: '#FFF7ED' },
  timeSlotDisabled: { backgroundColor: COLORS.gray100, opacity: 0.5 },
  timeSlotText: { fontSize: 12, fontWeight: '500', color: COLORS.gray600 },
  timeSlotTextSelected: { color: COLORS.orange500, fontWeight: '600' },
  timeSlotTextDisabled: { color: COLORS.gray400 },

  // Day Pass
  dayPassCard: { backgroundColor: COLORS.white, borderRadius: 16, padding: 16, borderWidth: 1.5, borderColor: COLORS.gray200 },
  dayPassHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  dayPassTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy },
  dayPassSubtitle: { fontSize: 13, color: COLORS.gray600, marginTop: 2 },
  dayPassPrice: { fontSize: 18, fontWeight: '700', color: COLORS.orange500 },
  dayPassFeatures: { borderBottomWidth: 1, borderBottomColor: COLORS.gray200, paddingBottom: 12, marginBottom: 16 },
  quantitySelector: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  quantityLabel: { fontSize: 14, fontWeight: '600', color: COLORS.navy },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  quantityButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.gray100, justifyContent: 'center', alignItems: 'center' },
  quantityValue: { fontSize: 18, fontWeight: '700', color: COLORS.navy, width: 30, textAlign: 'center' },

  // Customer Details
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderRadius: 12, paddingHorizontal: 14, borderWidth: 1.5, borderColor: COLORS.gray200, marginBottom: 12 },
  input: { flex: 1, height: 48, fontSize: 15, color: COLORS.navy, marginLeft: 10 },

  // Error Banner
  errorBanner: { position: 'absolute', top: 120, left: 16, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEE2E2', borderRadius: 12, padding: 12, gap: 8, zIndex: 100 },
  errorText: { flex: 1, fontSize: 14, color: COLORS.red500, fontWeight: '500' },

  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray200 },
  priceSection: {},
  totalLabel: { fontSize: 12, color: COLORS.gray600 },
  totalPrice: { fontSize: 20, fontWeight: '700', color: COLORS.navy },
  cashbackEarn: { fontSize: 11, color: COLORS.green500, fontWeight: '600' },
  bookButton: { borderRadius: 24, overflow: 'hidden' },
  bookButtonGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14 },
  bookButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },

  // Success Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: COLORS.white, borderRadius: 24, padding: 24, width: '100%', maxWidth: 340, alignItems: 'center' },
  successIcon: { marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  modalMessage: { fontSize: 14, color: COLORS.gray600, textAlign: 'center', marginBottom: 20 },
  modalDetails: { width: '100%', backgroundColor: COLORS.gray50, borderRadius: 12, padding: 16, marginBottom: 20 },
  modalDetailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  modalDetailLabel: { fontSize: 14, color: COLORS.gray600 },
  modalDetailValue: { fontSize: 14, fontWeight: '700', color: COLORS.navy },
  doneButton: { width: '100%', borderRadius: 12, overflow: 'hidden' },
  doneButtonGradient: { paddingVertical: 14, alignItems: 'center' },
  doneButtonText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});

export default FitnessBookingPage;
