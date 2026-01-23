import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  Linking,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import storesApi, { Store } from '@/services/storesApi';
import storeVisitApi from '@/services/storeVisitApi';
import { useAuth } from '@/contexts/AuthContext';
import { showAlert } from '@/components/common/CrossPlatformAlert';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SkeletonLoader from '@/components/common/SkeletonLoader';
import analyticsService from '@/services/analyticsService';
import StoreVisitLoadingSkeleton from '@/components/store-visit/StoreVisitLoadingSkeleton';

// Get screen dimensions for responsive design
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

type CrowdLevel = 'Low' | 'Medium' | 'High';

interface VisitDetails {
  name: string;
  phone: string;
  email: string;
  visitDate: Date | null;
  visitTime: string;
}

// Input Validation Utilities
const validateEmail = (email: string): boolean => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const validatePhone = (phone: string): { valid: boolean; message?: string } => {
  const cleanPhone = phone.replace(/\D/g, '');

  if (cleanPhone.length === 0) {
    return { valid: false, message: 'Phone number is required' };
  }

  if (cleanPhone.length < 10) {
    return { valid: false, message: 'Phone number must be at least 10 digits' };
  }

  if (cleanPhone.length > 15) {
    return { valid: false, message: 'Phone number is too long' };
  }

  return { valid: true };
};

const validateName = (name: string): { valid: boolean; message?: string } => {
  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, message: 'Name is required' };
  }

  if (trimmedName.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, message: 'Name is too long (max 50 characters)' };
  }

  // Allow letters, spaces, hyphens, apostrophes, and common international characters
  const nameRegex = /^[a-zA-ZÀ-ÿ\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }

  return { valid: true };
};

const sanitizeInput = (input: string): string => {
  // Remove potential XSS characters
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .trim();
};

function StoreVisitPageInner() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const storeId = params.storeId as string;
  const { state: authState } = useAuth();
  const { user, isAuthenticated } = authState;

  // State
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState<Store | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [crowdLevel, setCrowdLevel] = useState<CrowdLevel>('Medium');
  const [queueNumber, setQueueNumber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [visitDetails, setVisitDetails] = useState<VisitDetails>({
    name: user?.name || '',
    phone: user?.phoneNumber || '',
    email: user?.email || '',
    visitDate: null,
    visitTime: '',
  });
  const [schedulingVisit, setSchedulingVisit] = useState(false);
  const [gettingQueue, setGettingQueue] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const refreshIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Memoized next 7 days for date selection - returns array directly
  const next7DaysArray = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  }, []);

  // Legacy function wrapper for compatibility
  const getNext7Days = useCallback(() => next7DaysArray, [next7DaysArray]);

  // Time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM',
  ];

  // Check if a time slot is in the past for the selected date
  const isTimeInPast = (timeString: string, dateToCheck: Date): boolean => {
    const now = new Date();
    const selectedDate = new Date(dateToCheck);

    // If selected date is not today, it can't be in the past (assuming future dates only)
    if (selectedDate.toDateString() !== now.toDateString()) {
      return false;
    }

    // Parse the time string (e.g., "02:00 PM")
    const [time, period] = timeString.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    // Create a date object for the selected time
    const selectedDateTime = new Date(selectedDate);
    selectedDateTime.setHours(hour24, minutes, 0, 0);

    // Check if this time has passed
    return selectedDateTime <= now;
  };

  // Helper function to convert time string to minutes since midnight
  const timeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);

    let hour24 = hours;
    if (period === 'PM' && hours !== 12) {
      hour24 = hours + 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }

    return hour24 * 60 + minutes;
  };

  // Memoized available time slots based on selected date and store hours
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate) {
      return timeSlots;
    }

    // Get store hours for selected date
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayHours = store?.hours?.find(h => h.day === dayName);

    // If store is closed on this day, return empty array
    if (dayHours?.closed) {
      return [];
    }

    // Filter slots based on store hours and past time
    return timeSlots.filter(time => {
      // First check if time is in the past
      if (isTimeInPast(time, selectedDate)) {
        return false;
      }

      // If no store hours available, allow all future times
      if (!dayHours?.open || !dayHours?.close) {
        return true;
      }

      // Check if time falls within store hours
      const timeMinutes = timeToMinutes(time);
      const openMinutes = timeToMinutes(dayHours.open);
      const closeMinutes = timeToMinutes(dayHours.close);

      return timeMinutes >= openMinutes && timeMinutes <= closeMinutes;
    });
  }, [selectedDate, store, timeSlots]);

  // Legacy function wrapper for compatibility
  const getAvailableTimeSlots = useCallback(() => availableTimeSlots, [availableTimeSlots]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      showAlert(
        'Login Required',
        'You need to be logged in to visit a store. Please sign in to continue.',
        [
          {
            text: 'Go to Login',
            onPress: () => router.push('/sign-in'),
          },
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => router.back(),
          },
        ],
        'warning'
      );
    }
  }, [isAuthenticated]);

  // Pre-fill user details when user data loads
  useEffect(() => {
    if (user) {
      setVisitDetails(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phoneNumber || prev.phone,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  // Clear selected time if it becomes invalid when date changes
  useEffect(() => {
    if (selectedDate && selectedTime && isTimeInPast(selectedTime, selectedDate)) {
      setSelectedTime('');
      showAlert(
        'Time Slot No Longer Available',
        'The selected time has passed. Please choose another time slot.',
        undefined,
        'info'
      );
    }
  }, [selectedDate]);

  // Memoized fetch store details function
  const fetchStoreDetails = useCallback(async () => {
    if (!storeId) {
      setError('Store ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await storesApi.getStoreById(storeId);

      if (response.success && response.data) {
        // Backend returns { store, products, productsCount }, extract just the store
        const storeData = (response.data as any).store || response.data;
        setStore(storeData);
      } else {
        setError(response.message || 'Failed to load store details');
      }
    } catch (err) {
      console.error('Error fetching store:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  // Memoized fetch store availability function
  const fetchStoreAvailability = useCallback(async () => {
    if (!storeId) {
      return;
    }

    try {
      const response = await storeVisitApi.checkStoreAvailability(storeId);

      if (response.success && response.data) {
        setCrowdLevel(response.data.crowdStatus);
        setLastUpdated(new Date());
      } else {
        console.warn('⚠️ [STORE AVAILABILITY] Failed to fetch crowd data, using default');
        // Keep default 'Medium' if API fails
      }
    } catch (err) {
      console.error('❌ [STORE AVAILABILITY] Error fetching availability:', err);
      // Keep default 'Medium' if error occurs
    }
  }, [storeId]);

  // Fetch store details and availability
  useEffect(() => {
    // Track page view
    if (storeId) {
      analyticsService.trackPageView('store_visit', {
        storeId,
        timestamp: new Date().toISOString(),
      });
    }

    fetchStoreDetails();
    fetchStoreAvailability();
  }, [fetchStoreDetails, fetchStoreAvailability, storeId]);

  // Set up periodic refresh of crowd data (every 30 seconds)
  useEffect(() => {
    if (!storeId) return;

    // Start auto-refresh
    const intervalId = setInterval(() => {
      fetchStoreAvailability();
    }, 30000); // Refresh every 30 seconds

    refreshIntervalRef.current = intervalId;

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
  }, [storeId]);

  // Memoized today's store hours
  const todayHours = useMemo(() => {
    if (!store?.hours || store.hours.length === 0) {
      return { open: '09:00 AM', close: '09:00 PM', closed: false };
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const hours = store.hours.find(h => h.day === today);

    return hours || { open: '09:00 AM', close: '09:00 PM', closed: false };
  }, [store?.hours]);

  const isOpen = !todayHours.closed;

  // Memoized handle queue number generation
  const handleGetQueueNumber = useCallback(async () => {
    // Check authentication
    if (!isAuthenticated) {
      showAlert(
        'Login Required',
        'You need to be logged in to get a queue number. Please sign in to continue.',
        [{ text: 'Go to Login', onPress: () => router.push('/sign-in') }],
        'warning'
      );
      return;
    }

    // Validate name
    const nameValidation = validateName(visitDetails.name);
    if (!nameValidation.valid) {
      showAlert('Invalid Name', nameValidation.message || 'Please enter a valid name', undefined, 'error');
      return;
    }

    // Validate phone
    const phoneValidation = validatePhone(visitDetails.phone);
    if (!phoneValidation.valid) {
      showAlert('Invalid Phone', phoneValidation.message || 'Please enter a valid phone number', undefined, 'error');
      return;
    }

    // Validate email if provided
    if (visitDetails.email && !validateEmail(visitDetails.email)) {
      showAlert('Invalid Email', 'Please enter a valid email address', undefined, 'error');
      return;
    }

    try {
      setGettingQueue(true);

      // Track queue number request initiated
      analyticsService.track('queue_number_requested', {
        storeId,
        storeName: store?.name,
        crowdLevel,
        timestamp: new Date().toISOString(),
      });

      const response = await storeVisitApi.getQueueNumber({
        storeId: storeId as string,
        customerName: visitDetails.name,
        customerPhone: visitDetails.phone,
      });

      if (response.success && response.data) {
        setQueueNumber(response.data.queueNumber);

        // Track queue number success
        analyticsService.track('queue_number_success', {
          storeId,
          storeName: store?.name,
          queueNumber: response.data.queueNumber,
          estimatedWaitTime: response.data.estimatedWaitTime,
          currentQueueSize: response.data.currentQueueSize,
          crowdLevel,
          timestamp: new Date().toISOString(),
          status: 'success',
        });

        showAlert(
          'Queue Number Assigned!',
          `Your queue number is: ${response.data.queueNumber}\n\nEstimated wait time: ${response.data.estimatedWaitTime}\nCurrent queue size: ${response.data.currentQueueSize}\n\nYou'll receive an SMS when it's your turn.`,
          [{ text: 'OK', style: 'default' }],
          'success'
        );
      } else {
        // Track queue number error
        analyticsService.track('queue_number_error', {
          storeId,
          storeName: store?.name,
          errorMessage: response.message || 'Unknown error',
          crowdLevel,
          timestamp: new Date().toISOString(),
          status: 'failed',
        });

        showAlert('Failed', response.message || 'Unable to get queue number. Please try again.', undefined, 'error');
      }
    } catch (error: any) {
      // Track error occurred
      analyticsService.track('error_occurred', {
        context: 'queue_number_generation',
        storeId,
        storeName: store?.name,
        errorMessage: error.message,
        crowdLevel,
        timestamp: new Date().toISOString(),
      });
      console.error('❌ [ANALYTICS] Error getting queue number:', error);

      console.error('Error getting queue number:', error);
      showAlert('Error', error.message || 'Unable to get queue number. Please try again.', undefined, 'error');
    } finally {
      setGettingQueue(false);
    }
  }, [isAuthenticated, visitDetails, storeId, router, store, crowdLevel]);

  // Memoized handle visit scheduling
  const handleScheduleVisit = useCallback(async () => {
    // Check authentication
    if (!isAuthenticated) {
      showAlert(
        'Login Required',
        'You need to be logged in to schedule a visit. Please sign in to continue.',
        [{ text: 'Go to Login', onPress: () => router.push('/sign-in') }],
        'warning'
      );
      return;
    }

    // Validate name
    const nameValidation = validateName(visitDetails.name);
    if (!nameValidation.valid) {
      showAlert('Invalid Name', nameValidation.message || 'Please enter a valid name', undefined, 'error');
      return;
    }

    // Validate phone
    const phoneValidation = validatePhone(visitDetails.phone);
    if (!phoneValidation.valid) {
      showAlert('Invalid Phone', phoneValidation.message || 'Please enter a valid phone number', undefined, 'error');
      return;
    }

    // Validate email if provided
    if (visitDetails.email && !validateEmail(visitDetails.email)) {
      showAlert('Invalid Email', 'Please enter a valid email address', undefined, 'error');
      return;
    }

    // Validate date & time selection
    if (!selectedDate || !selectedTime) {
      showAlert('Select Date & Time', 'Please select your preferred visit date and time', undefined, 'warning');
      return;
    }

    // Validate that the selected time is not in the past
    if (isTimeInPast(selectedTime, selectedDate)) {
      showAlert(
        'Invalid Time',
        'The selected time has already passed. Please choose a future time slot.',
        undefined,
        'error'
      );
      return;
    }

    // Validate that the date is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const selectedDateOnly = new Date(selectedDate);
    selectedDateOnly.setHours(0, 0, 0, 0);

    if (selectedDateOnly < now) {
      showAlert(
        'Invalid Date',
        'Cannot schedule a visit in the past. Please select a future date.',
        undefined,
        'error'
      );
      return;
    }

    try {
      setSchedulingVisit(true);

      // Track visit scheduling initiated
      analyticsService.track('visit_scheduling_initiated', {
        storeId,
        storeName: store?.name,
        visitDate: selectedDate?.toISOString(),
        visitTime: selectedTime,
        crowdLevel,
        timestamp: new Date().toISOString(),
      });
      const response = await storeVisitApi.scheduleStoreVisit({
        storeId: storeId as string,
        visitDate: selectedDate.toISOString(),
        visitTime: selectedTime,
        customerName: visitDetails.name,
        customerPhone: visitDetails.phone,
        customerEmail: visitDetails.email || undefined,
      });

      if (response.success && response.data) {
        const dateStr = selectedDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        // Track visit scheduled success
        analyticsService.track('visit_scheduled', {
          storeId,
          storeName: store?.name,
          visitNumber: response.data.visitNumber,
          visitDate: selectedDate?.toISOString(),
          visitTime: selectedTime,
          crowdLevel,
          timestamp: new Date().toISOString(),
          status: 'success',
        });

        showAlert(
          'Visit Scheduled!',
          `Your visit has been scheduled!\n\nVisit Number: ${response.data.visitNumber}\nDate: ${dateStr}\nTime: ${selectedTime}\n\nYou'll receive a confirmation SMS shortly.`,
          [{
            text: 'OK',
            style: 'default',
            onPress: () => {
              // Reset form
              setSelectedDate(null);
              setSelectedTime('');
              router.back();
            }
          }],
          'success'
        );
      } else {
        // Track visit scheduling error
        analyticsService.track('visit_scheduling_error', {
          storeId,
          storeName: store?.name,
          visitDate: selectedDate?.toISOString(),
          visitTime: selectedTime,
          errorMessage: response.message || 'Unknown error',
          crowdLevel,
          timestamp: new Date().toISOString(),
          status: 'failed',
        });

        showAlert('Failed', response.message || 'Unable to schedule visit. Please try again.', undefined, 'error');
      }
    } catch (error: any) {
      // Track error occurred
      analyticsService.track('error_occurred', {
        context: 'visit_scheduling',
        storeId,
        storeName: store?.name,
        errorMessage: error.message,
        crowdLevel,
        timestamp: new Date().toISOString(),
      });
      console.error('❌ [ANALYTICS] Error scheduling visit:', error);

      console.error('Error scheduling visit:', error);
      showAlert('Error', error.message || 'Unable to schedule visit. Please try again.', undefined, 'error');
    } finally {
      setSchedulingVisit(false);
    }
  }, [isAuthenticated, visitDetails, selectedDate, selectedTime, storeId, router, store, crowdLevel]);

  // Memoized handle directions
  const handleGetDirections = useCallback(() => {
    if (!store?.address || !store.address.street || !store.address.city) {
      showAlert('Address Not Available', 'Store address information is not available', undefined, 'warning');
      return;
    }

    // Track directions clicked
    analyticsService.track('directions_clicked', {
      storeId,
      storeName: store?.name,
      address: `${store.address.street}, ${store.address.city}`,
      crowdLevel,
      timestamp: new Date().toISOString(),
    });

    const address = `${store.address.street}, ${store.address.city}, ${store.address.state || ''} ${store.address.zipCode || ''}`.trim();
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`,
    });

    Linking.openURL(url).catch(() => {
      // Track error opening maps
      analyticsService.track('error_occurred', {
        context: 'directions_opening',
        storeId,
        storeName: store?.name,
        errorMessage: 'Unable to open maps application',
        crowdLevel,
        timestamp: new Date().toISOString(),
      });
      console.error('❌ [ANALYTICS] Error opening maps for store:', store?.name);

      showAlert('Error', 'Unable to open maps application', undefined, 'error');
    });
  }, [store, storeId, crowdLevel]);

  // Memoized get crowd status color and badge
  const getCrowdStatusColor = useCallback((level: CrowdLevel) => {
    switch (level) {
      case 'Low': return '#10B981';
      case 'Medium': return '#F59E0B';
      case 'High': return '#EF4444';
    }
  }, []);

  // Memoized get time since last update
  const getTimeSinceUpdate = useCallback(() => {
    const now = new Date();
    const secondsAgo = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

    if (secondsAgo < 60) return 'Just now';
    if (secondsAgo < 120) return '1 minute ago';
    const minutesAgo = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minutes ago`;
  }, [lastUpdated]);

  // Format date for display
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Loading state - show skeleton screens
  if (loading) {
    return <StoreVisitLoadingSkeleton onBackPress={() => router.back()} />;
  }

  // Error state
  if (error || !store) {
    return (
      <ThemedView style={styles.container}>
        <LinearGradient
          colors={['#00C06A', '#00796B']}
          style={styles.header}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Store Visit</ThemedText>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Store not found'}</Text>
          <TouchableOpacity onPress={fetchStoreDetails} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Modern Multi-Color Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <View style={styles.backButtonCircle}>
            <Ionicons name="arrow-back" size={22} color="#667eea" />
          </View>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.storeName}>{store.name}</Text>
          {store.category?.name && (
            <View style={styles.categoryBadge}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.categoryGradient}
              >
                <Ionicons name="business-outline" size={14} color="white" />
                <Text style={styles.categoryText}>{store.category.name}</Text>
              </LinearGradient>
            </View>
          )}
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={18} color="#fff" />
            <Text style={styles.addressText} numberOfLines={1}>
              {store.address?.street}, {store.address?.city}
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Live Availability Card with Gradient */}
        <LinearGradient
          colors={[getCrowdStatusColor(crowdLevel) + '15', getCrowdStatusColor(crowdLevel) + '05']}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.iconCircle}
              >
                <Ionicons name="people" size={18} color="white" />
              </LinearGradient>
              <View>
                <Text style={styles.cardTitle}>Live Availability</Text>
                <View style={styles.lastUpdatedContainer}>
                  <Ionicons name="time-outline" size={10} color="#999" />
                  <Text style={styles.lastUpdatedText}>{getTimeSinceUpdate()}</Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.crowdStatusContainer}>
            <LinearGradient
              colors={[getCrowdStatusColor(crowdLevel), getCrowdStatusColor(crowdLevel) + 'dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.crowdBadge}
            >
              <View style={styles.crowdDot} />
              <Text style={styles.crowdText}>{crowdLevel} Crowd</Text>
              <View style={styles.pulseDot} />
            </LinearGradient>
            {queueNumber && (
              <LinearGradient
                colors={['#667eea15', '#764ba215']}
                style={styles.queueNumberDisplay}
              >
                <Text style={styles.queueNumberLabel}>Your Queue Number</Text>
                <Text style={styles.queueNumberValue}>#{queueNumber}</Text>
              </LinearGradient>
            )}
          </View>
        </LinearGradient>

        {/* Store Hours Card with Modern Design */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.iconCircle}
            >
              <Ionicons name="time-outline" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Store Hours (Today)</Text>
          </View>
          <View style={styles.hoursContainer}>
            <LinearGradient
              colors={isOpen ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
              style={styles.statusBadge}
            >
              <Ionicons name={isOpen ? "checkmark-circle" : "close-circle"} size={16} color="white" />
              <Text style={styles.statusText}>{isOpen ? 'Open Now' : 'Closed'}</Text>
            </LinearGradient>
            {isOpen && (
              <View style={styles.hoursTextContainer}>
                <Ionicons name="time" size={18} color="#667eea" />
                <Text style={styles.hoursText}>
                  {todayHours.open} - {todayHours.close}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Customer Details Form with Modern Inputs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.iconCircle}
            >
              <Ionicons name="person-outline" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Your Details</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="person" size={14} color="#667eea" /> Name *
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor="#aaa"
                value={visitDetails.name}
                onChangeText={(text) => setVisitDetails({ ...visitDetails, name: text })}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="call" size={14} color="#667eea" /> Phone Number *
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit phone number"
                placeholderTextColor="#aaa"
                keyboardType="phone-pad"
                maxLength={10}
                value={visitDetails.phone}
                onChangeText={(text) => setVisitDetails({ ...visitDetails, phone: text.replace(/[^0-9]/g, '') })}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>
              <Ionicons name="mail" size={14} color="#999" /> Email (Optional)
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="#999" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
                value={visitDetails.email}
                onChangeText={(text) => setVisitDetails({ ...visitDetails, email: text })}
              />
            </View>
          </View>
        </View>

        {/* Plan Visit Time with Modern Design */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.iconCircle}
            >
              <Ionicons name="calendar-outline" size={18} color="white" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Plan Your Visit</Text>
          </View>

          <View style={styles.sectionHeader}>
            <Ionicons name="calendar" size={16} color="#667eea" />
            <Text style={styles.sectionLabel}>Select Date</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {getNext7Days().map((date, index) => {
              const isSelected = selectedDate?.toDateString() === date.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDate(date);
                    // Track date selected
                    analyticsService.track('date_selected', {
                      storeId,
                      storeName: store?.name,
                      selectedDate: date.toISOString(),
                      dateFormatted: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                      crowdLevel,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.dateCard}
                    >
                      <Text style={styles.dateDaySelected}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.dateNumberSelected}>{date.getDate()}</Text>
                      <Text style={styles.dateLabelSelected}>{formatDate(date)}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.dateCard}>
                      <Text style={styles.dateDay}>
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </Text>
                      <Text style={styles.dateNumber}>{date.getDate()}</Text>
                      <Text style={styles.dateLabel}>{formatDate(date)}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={[styles.sectionHeader, { marginTop: 24 }]}>
            <Ionicons name="time" size={16} color="#667eea" />
            <Text style={styles.sectionLabel}>Select Time</Text>
          </View>
          <View style={styles.timeGrid}>
            {getAvailableTimeSlots().map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => {
                    setSelectedTime(time);
                    // Track time selected
                    analyticsService.track('time_selected', {
                      storeId,
                      storeName: store?.name,
                      selectedTime: time,
                      selectedDate: selectedDate?.toISOString(),
                      crowdLevel,
                      timestamp: new Date().toISOString(),
                    });
                  }}
                  activeOpacity={0.7}
                >
                  {isSelected ? (
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.timeSlot}
                    >
                      <Ionicons name="checkmark-circle" size={16} color="white" />
                      <Text style={styles.timeTextSelected}>{time}</Text>
                    </LinearGradient>
                  ) : (
                    <View style={styles.timeSlot}>
                      <Text style={styles.timeText}>{time}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
          {selectedDate && getAvailableTimeSlots().length === 0 && (() => {
            const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
            const dayHours = store?.hours?.find(h => h.day === dayName);
            const isClosed = dayHours?.closed;
            const isToday = selectedDate.toDateString() === new Date().toDateString();

            return (
              <View style={styles.noTimeSlotsContainer}>
                <Ionicons
                  name={isClosed ? "close-circle-outline" : "time-outline"}
                  size={24}
                  color={isClosed ? "#EF4444" : "#999"}
                />
                <Text style={styles.noTimeSlotsText}>
                  {isClosed
                    ? `Store is closed on ${dayName}. Please select another day.`
                    : isToday
                      ? 'All time slots for today have passed. Please select another date.'
                      : 'No time slots available. Please select another date.'
                  }
                </Text>
              </View>
            );
          })()}
        </View>

        {/* Bottom spacing for fixed buttons */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Modern Fixed Bottom Action Buttons */}
      <View style={styles.bottomActions}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.secondaryButton, gettingQueue && styles.buttonDisabled]}
            onPress={handleGetQueueNumber}
            disabled={gettingQueue}
            activeOpacity={0.8}
          >
            <View style={styles.buttonContent}>
              {gettingQueue ? (
                <ActivityIndicator size="small" color="#667eea" />
              ) : (
                <Ionicons name="ticket" size={20} color="#667eea" />
              )}
              <Text style={styles.secondaryButtonText}>
                {gettingQueue ? 'Getting...' : 'Get Queue'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.directionsButton, gettingQueue && styles.buttonDisabled]}
            onPress={handleGetDirections}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.buttonGradient}
            >
              <Ionicons name="navigate" size={20} color="white" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, schedulingVisit && styles.buttonDisabled]}
          onPress={handleScheduleVisit}
          disabled={schedulingVisit}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            {schedulingVisit ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="calendar" size={22} color="white" />
            )}
            <Text style={styles.primaryButtonText}>
              {schedulingVisit ? 'Scheduling Visit...' : 'Schedule Visit'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 45 : 25,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    gap: 8,
  },
  storeName: {
    fontSize: 26,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
  },
  categoryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  categoryText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  addressText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
    opacity: 0.95,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 180,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    gap: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 8,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  lastUpdatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
  },
  crowdStatusContainer: {
    gap: 12,
  },
  crowdBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 18,
  },
  crowdDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginLeft: -6,
  },
  crowdText: {
    fontSize: 17,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  queueNumberDisplay: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  queueNumberLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontWeight: '600',
  },
  queueNumberValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#667eea',
    letterSpacing: 1,
  },
  hoursContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
  },
  hoursTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  hoursText: {
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputContainer: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderWidth: 2,
    borderColor: '#e8ecf1',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.3,
  },
  dateScroll: {
    marginTop: 4,
    marginBottom: 8,
  },
  dateCard: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e8ecf1',
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 75,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  dateDay: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateDaySelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  dateNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a1a1a',
    marginVertical: 5,
  },
  dateNumberSelected: {
    color: 'white',
  },
  dateLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
  },
  dateLabelSelected: {
    color: 'rgba(255,255,255,0.85)',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  timeSlot: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e8ecf1',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minWidth: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  timeTextSelected: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  noTimeSlotsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginTop: 12,
  },
  noTimeSlotsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bottomActions: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(102, 126, 234, 0.1)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#667eea',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  directionsButton: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  directionsButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});

// Wrap component with ErrorBoundary for production safety
export default function StoreVisitPage() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('❌ [STORE VISIT ERROR]:', error);
        console.error('Error Info:', errorInfo);
      }}
      onReset={() => {
      }}
    >
      <StoreVisitPageInner />
    </ErrorBoundary>
  );
}
