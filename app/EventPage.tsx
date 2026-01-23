import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
  ImageBackground,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Image,
} from "react-native";
import { showAlert, alertOk, confirmAlert } from "@/utils/alert";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams, useFocusEffect, Stack } from "expo-router";
import Constants from "expo-constants";
import { ThemedView } from "@/components/ThemedView";
import { EventItem } from "@/types/homepage.types";
import { Ionicons } from "@expo/vector-icons";
import EventBookingModal from "@/components/events/EventBookingModal";
import RelatedEventsSection from "@/components/events/RelatedEventsSection";
import EventReviews from "@/components/events/EventReviews";
import StarRating from "@/components/events/StarRating";
import { useEventBooking } from "@/hooks/useEventBooking";
import eventsApiService from "@/services/eventsApi";
import { useAuth } from "@/contexts/AuthContext";
import { useRegion } from "@/contexts/RegionContext";
import { BUSINESS_CONFIG } from "@/config/env";
import stripeApi from "@/services/stripeApi";
import eventAnalytics from "@/services/eventAnalytics";
import { getCategoryTheme, CategoryTheme, DEFAULT_THEME } from "@/constants/categoryThemes";
// Conditional import for native Stripe service
let stripeReactNativeService: any = null;
if (Platform.OS !== 'web') {
  try {
    stripeReactNativeService = require('@/services/stripeReactNativeService').default;
  } catch (e) {
    console.warn('⚠️ [EVENT PAGE] Native Stripe service not available');
  }
}

interface EventPageProps {
  eventId?: string;
  initialEvent?: EventItem;
}

interface DynamicEventData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  price: {
    amount: number;
    currency: string;
    isFree: boolean;
  };
  location: string;
  date: string;
  time: string;
  category: string;
  organizer: string;
  isOnline: boolean;
  registrationRequired: boolean;
  bookingUrl?: string;
  availableSlots?: {
    id: string;
    time: string;
    available: boolean;
    maxCapacity: number;
    bookedCount: number;
  }[];
  [key: string]: any;
}

export default function EventPage({ eventId, initialEvent }: EventPageProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const auth = useAuth();
  const { getCurrencySymbol } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const user = auth.state.user;
  const isAuthenticated = auth.state.isAuthenticated;
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic event data state
  const [eventData, setEventData] = useState<DynamicEventData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [realEventData, setRealEventData] = useState<EventItem | null>(null);
  const [isLoadingEvent, setIsLoadingEvent] = useState(true);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [relatedEvents, setRelatedEvents] = useState<EventItem[]>([]);
  const [isLoadingRelated, setIsLoadingRelated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track page view time and scroll depth for analytics
  const pageViewStartTime = useRef<number>(Date.now());
  const scrollDepthRef = useRef<number>(0);

  // Animation values for UX improvements
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Extract specific params to avoid infinite loop from params object reference changes
  // Support both 'eventId' and 'id' parameters (navigation uses 'id')
  const eventIdParam = (params.eventId || params.id) as string | undefined;
  const eventDataParam = params.eventData as string | undefined;
  const eventTypeParam = params.eventType as string | undefined;

  // Parse dynamic event data from navigation params and fetch real data
  useEffect(() => {
    const loadEventData = async () => {
      setIsLoadingEvent(true);
      setError(null);
      
      try {
        if (eventDataParam && eventIdParam && eventTypeParam) {
          try {
            const parsedData = JSON.parse(eventDataParam);
            setEventData(parsedData);
            setIsDynamic(true);

            // Try to fetch real event data from backend
            try {
              const realData = await eventsApiService.getEventById(eventIdParam);
              if (realData) {
                setRealEventData(realData);
              }
            } catch (error) {
              console.error("❌ [EVENT PAGE] Failed to fetch event from backend:", error);
              // Continue with dynamic data if backend fetch fails
            }
          } catch (error) {
            console.error("❌ [DYNAMIC EVENT] Failed to parse event data:", error);
            setIsDynamic(false);
          }
        } else if (eventIdParam) {
          // Direct event ID from params - fetch from backend
          try {
            const realData = await eventsApiService.getEventById(eventIdParam);
            if (realData) {
              setRealEventData(realData);
              setIsDynamic(false);
            } else {
              setError("Event not found");
            }
          } catch (error) {
            console.error("❌ [EVENT PAGE] Failed to fetch event:", error);
            setError("Failed to load event. Please try again.");
          }
        } else {
          setIsDynamic(false);
        }
      } catch (error) {
        console.error("❌ [EVENT PAGE] Error loading event data:", error);
        setError("Failed to load event. Please try again.");
      } finally {
        setIsLoadingEvent(false);
      }
    };

    loadEventData();
  }, [eventIdParam, eventDataParam, eventTypeParam]);

  // Animate content on load
  useEffect(() => {
    if (!isLoadingEvent && realEventData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isLoadingEvent, realEventData, fadeAnim, slideAnim]);

  // Animate image on load
  const handleImageLoad = useCallback(() => {
    Animated.timing(imageOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [imageOpacity]);

  const handleImageError = useCallback(() => {
    setImageError(true);
    imageOpacity.setValue(1); // Show placeholder immediately
  }, [imageOpacity]);

  // Enhanced retry mechanism with exponential backoff
  const retryWithBackoff = useCallback(async (retryFn: () => Promise<void>, retries = 0) => {
    if (retries >= MAX_RETRIES) {
      setError("Failed to load event after multiple attempts. Please check your connection.");
      return;
    }

    try {
      await retryFn();
    } catch (error) {
      const delay = Math.min(1000 * Math.pow(2, retries), 10000); // Exponential backoff, max 10s
      setTimeout(() => {
        retryWithBackoff(retryFn, retries + 1);
      }, delay);
    }
  }, []);

  const HORIZONTAL_PADDING = screenData.width < 375 ? 16 : screenData.width > 768 ? 32 : 20;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
      }, 100);
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  // Deep link support for event pages
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      try {
        // Parse URL - handle both web and native formats
        let eventId: string | null = null;
        
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // Web: Use URL API
          const urlObj = new URL(url);
          eventId = urlObj.searchParams.get('eventId');
        } else {
          // Native: Parse manually
          const match = url.match(/[?&]eventId=([^&]+)/);
          if (match) {
            eventId = decodeURIComponent(match[1]);
          }
        }
        
        if (eventId && eventId !== eventIdParam) {
          // Load event from deep link
          setIsLoadingEvent(true);
          setError(null);
          
          eventsApiService.getEventById(eventId)
            .then((data) => {
              if (data) {
                setRealEventData(data);
                setIsDynamic(false);
              } else {
                setError("Event not found");
              }
            })
            .catch((error) => {
              console.error("❌ [EVENT PAGE] Deep link error:", error);
              setError("Failed to load event from link");
            })
            .finally(() => {
              setIsLoadingEvent(false);
            });
        }
      } catch (error) {
        console.error("❌ [EVENT PAGE] Invalid deep link:", error);
      }
    };

    // Listen for deep links
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });
    
    // Check if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    }).catch((error) => {
      console.error("❌ [EVENT PAGE] Error getting initial URL:", error);
    });

    return () => {
      subscription.remove();
    };
  }, [eventIdParam]);

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Note: error state is already declared at component level (retryCount area)

  // Event data - returns null if no real data available (no hardcoded fallback for production)
  const eventDetails: EventItem | null = useMemo(() => {
    // Priority 1: Real event data from backend API
    if (realEventData) {
      return realEventData;
    }

    // Priority 2: Dynamic event data from navigation params
    if (isDynamic && eventData) {
      return {
        id: eventData.id,
        type: "event",
        title: eventData.title,
        subtitle: eventData.subtitle,
        description: eventData.description,
        image: eventData.image,
        price: eventData.price,
        location: eventData.location,
        date: eventData.date,
        time: eventData.time,
        category: eventData.category,
        organizer: eventData.organizer,
        isOnline: eventData.isOnline,
        registrationRequired: eventData.registrationRequired,
      };
    }

    // Priority 3: Initial event prop (for direct component usage)
    if (initialEvent) {
      return initialEvent;
    }

    // No fallback data - return null for production
    // This will trigger "Event Not Found" screen
    return null;
  }, [initialEvent, isDynamic, eventData, realEventData]);

  // Get category theme based on event category
  const categoryTheme: CategoryTheme = useMemo(() => {
    return getCategoryTheme(eventDetails?.category);
  }, [eventDetails?.category]);

  // Determine if event is truly offline (NOT an online event)
  const isOfflineEvent = useMemo(() => {
    // If no event details, default to offline
    if (!eventDetails) return true;

    // Primary check: use isOnline flag from event data
    // If isOnline is explicitly true, it's NOT an offline event
    if (eventDetails.isOnline === true) {
      return false;
    }

    // Secondary check: if location indicates online
    if (eventDetails.location) {
      const locationLower = eventDetails.location.toLowerCase();
      if (locationLower === 'online' || locationLower === 'online event' || locationLower.includes('virtual')) {
        return false;
      }
    }

    // Default: treat as offline event (venue-based)
    return true;
  }, [eventDetails?.isOnline, eventDetails?.location]);


  // Get available slots for offline events - only use real data, no mock fallback
  const availableSlots = useMemo(() => {
    // Online events don't have slots
    if (!isOfflineEvent) {
      return [];
    }

    // Priority: realEventData > eventData
    // For real backend events, use actual slots (may be empty)
    if (realEventData) {
      // Real event from backend - use its slots (or empty if none defined)
      return realEventData.availableSlots && Array.isArray(realEventData.availableSlots)
        ? realEventData.availableSlots
        : [];
    }

    if (eventData?.availableSlots && Array.isArray(eventData.availableSlots)) {
      return eventData.availableSlots;
    }

    // No mock data for production - return empty array
    // Events without slots will show direct booking without slot selection
    return [];
  }, [isOfflineEvent, eventData, realEventData]);

  const handleSharePress = useCallback(async () => {
    if (!eventDetails) return;

    try {
      setIsLoading(true);

      // Construct share URL - use app URL if available, otherwise use deep link
      const appUrl = BUSINESS_CONFIG.app.website || "https://rezapp.com";
      const shareUrl = Platform.OS === 'web' && typeof window !== 'undefined'
        ? `${window.location.origin}/EventPage?eventId=${eventDetails.id}`
        : `${appUrl}/EventPage?eventId=${eventDetails.id}`;
      
      const shareMessage = `Check out ${eventDetails.title} by ${eventDetails.organizer} on ${eventDetails.date}\n${shareUrl}`;
      
      await Share.share({
        message: shareMessage,
        url: shareUrl,
        title: eventDetails.title,
      });
      
      // Track share analytics
      try {
        await eventsApiService.shareEvent(eventDetails.id);
        eventAnalytics.trackShare(eventDetails.id, Platform.OS, 'event_page');
      } catch (shareError) {
        console.error("❌ [EVENT PAGE] Failed to track share:", shareError);
        // Still track analytics even if API call fails
        eventAnalytics.trackShare(eventDetails.id, Platform.OS, 'event_page');
      }
    } catch (err) {
      console.error("❌ [EVENT PAGE] Share failed:", err);
      if (err instanceof Error && err.message !== "User canceled") {
        setError("Failed to share event.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [eventDetails]);

  const handleFavoritePress = useCallback(async () => {
    if (!eventDetails) return;

    if (!isAuthenticated || !user) {
      alertOk("Login Required", "Please login to favorite events");
      return;
    }

    try {
      setIsLoadingFavorite(true);
      const previousState = isFavorited;
      
      // Optimistically update UI
      setIsFavorited(!previousState);
      
      // Call backend API to toggle favorite
      const result = await eventsApiService.toggleEventFavorite(eventDetails.id);
      
      if (result.success) {
        // Track analytics
        eventAnalytics.trackFavoriteToggle(eventDetails.id, !previousState, 'event_page');
        
        alertOk(
          !previousState ? "Added to Favorites" : "Removed from Favorites",
          `${eventDetails.title} ${!previousState ? "added to" : "removed from"} favorites.`
        );
      } else {
        // Revert on failure
        setIsFavorited(previousState);
        throw new Error(result.message || "Failed to update favorite status");
      }
    } catch (error) {
      console.error("❌ [EVENT PAGE] Failed to toggle favorite:", error);
      setError(error instanceof Error ? error.message : "Failed to update favorite status");
      
      // Revert optimistic update
      setIsFavorited((prev) => !prev);
    } finally {
      setIsLoadingFavorite(false);
    }
  }, [eventDetails?.id, eventDetails?.title, isFavorited, isAuthenticated, user]);

  const handleOnlineBooking = useCallback(async () => {
    if (!eventDetails || !eventDetails.isOnline) return;

    // Check authentication
    if (!isAuthenticated || !user) {
      alertOk("Login Required", "Please login to register for events");
      return;
    }

    // Track booking start
    eventAnalytics.trackBookingStart(eventDetails.id, undefined, 'event_page');

    // Open booking modal (same flow as offline events, just without slot selection)
    setShowBookingModal(true);
  }, [eventDetails, isAuthenticated, user]);

  const handleOfflineBooking = useCallback(async () => {
    if (!eventDetails || eventDetails.isOnline) return;

    // Check if user needs to select a time slot (only if slots are defined)
    if (availableSlots.length > 0 && !selectedSlot) {
      alertOk("Select Time Slot", "Please select a time slot before booking.");
      return;
    }

    // Check authentication
    if (!isAuthenticated || !user) {
      alertOk("Login Required", "Please login to book events");
      return;
    }

    // Track booking start
    eventAnalytics.trackBookingStart(eventDetails.id, selectedSlot || undefined, 'event_page');

    // Open booking modal directly (for both free and paid events)
    setShowBookingModal(true);
  }, [eventDetails, selectedSlot, availableSlots, isAuthenticated, user]);

  const handleBookingSuccess = useCallback((bookingId?: string) => {
    setShowBookingModal(false);
    
    // Show success message and navigate to bookings page
    showAlert(
      "Booking Confirmed!",
      `Your booking has been confirmed${bookingId ? `. Booking Reference: ${bookingId}` : ''}. You can view all your bookings in the Bookings page.`,
      [
        { text: "Continue", style: "cancel" },
        {
          text: "View Bookings",
          onPress: () => {
            if (Platform.OS === 'ios') {
              setTimeout(() => router.push('/BookingsPage' as any), 50);
            } else {
              router.push('/BookingsPage' as any);
            }
          }
        }
      ]
    );
  }, [router]);

  const handleBackPress = useCallback(() => router.back(), [router]);

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(id);
  }, [error]);

  const styles = useMemo(
    () => createStyles(HORIZONTAL_PADDING, screenData),
    [HORIZONTAL_PADDING, screenData]
  );

  // Loading skeleton component with better UX
  if (isLoadingEvent) {
    return (
      <ThemedView style={styles.page}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
        <SafeAreaView style={{ backgroundColor: "#000000" }} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading event details...</Text>
          <Animated.View
            style={[
              styles.loadingSkeleton,
              {
                opacity: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.6],
                }),
              },
            ]}
          />
        </View>
      </ThemedView>
    );
  }

  // Event Not Found screen - when no event data is available after loading
  if (!eventDetails && !isLoadingEvent) {
    return (
      <ThemedView style={styles.page}>
        <Stack.Screen options={{ headerShown: false }} />
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
        <SafeAreaView style={{ backgroundColor: "#000000" }} />
        <View style={styles.notFoundContainer}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.notFoundGradient}
          >
            <View style={styles.notFoundContent}>
              <View style={styles.notFoundIconContainer}>
                <Ionicons name="calendar-outline" size={80} color="#6B7280" />
                <View style={styles.notFoundIconBadge}>
                  <Ionicons name="close" size={24} color="#EF4444" />
                </View>
              </View>
              <Text style={styles.notFoundTitle}>Event Not Found</Text>
              <Text style={styles.notFoundMessage}>
                The event you're looking for doesn't exist or has been removed.
              </Text>
              <View style={styles.notFoundActions}>
                <TouchableOpacity
                  style={styles.notFoundBackButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
                  <Text style={styles.notFoundBackText}>Go Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notFoundExploreButton}
                  onPress={() => router.push('/events/movies')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="compass-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.notFoundExploreText}>Explore Events</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>
      </ThemedView>
    );
  }

  // Error state component
  if (error && !realEventData && !eventData) {
    return (
      <ThemedView style={styles.page}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />
        <SafeAreaView style={{ backgroundColor: "#000000" }} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#EF4444" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              setRetryCount(prev => prev + 1);
              setIsLoadingEvent(true);
              // Enhanced retry with exponential backoff
              const loadEventData = async () => {
                try {
                  if (eventIdParam) {
                    const realData = await eventsApiService.getEventById(eventIdParam);
                    if (realData) {
                      setRealEventData(realData);
                      setRetryCount(0); // Reset on success
                    } else {
                      setError("Event not found");
                    }
                  }
                } catch (error) {
                  if (retryCount < MAX_RETRIES) {
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
                    setTimeout(() => {
                      loadEventData();
                    }, delay);
                  } else {
                    setError(`Failed to load event after ${MAX_RETRIES} attempts. Please check your connection.`);
                    setIsLoadingEvent(false);
                  }
                } finally {
                  if (retryCount >= MAX_RETRIES) {
                    setIsLoadingEvent(false);
                  }
                }
              };
              loadEventData();
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.retryButtonText}>
              {retryCount > 0 ? `Retry (${retryCount}/${MAX_RETRIES})` : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.page}>
      {/* Hide default navigation header */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Non-translucent status bar to avoid overlay */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />

      {/* Top safe area to prevent overlap with the hero header */}
      <SafeAreaView style={{ backgroundColor: "#000000" }} />

      {/* Hero Section - Optimized Image Loading */}
      <View style={styles.heroSection}>
        {!imageError ? (
          <ImageBackground
            source={{ uri: eventDetails.image }}
            style={styles.heroBackground}
            resizeMode="cover"
            onLoad={handleImageLoad}
            onError={handleImageError}
          >
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  opacity: imageOpacity,
                },
              ]}
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.35)", "rgba(0,0,0,0.75)"]}
              style={styles.heroOverlay}
            >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.actionButton} onPress={handleSharePress}>
                  <Ionicons name="share-outline" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleFavoritePress}
                  disabled={isLoadingFavorite}
                >
                  {isLoadingFavorite ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Ionicons
                      name={isFavorited ? "heart" : "heart-outline"}
                      size={20}
                      color={isFavorited ? "#EF4444" : "#FFFFFF"}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Event Info */}
            <View style={styles.heroContent}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryTheme.badgeBackground }]}>
                <Ionicons name={categoryTheme.icon as any} size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.categoryText}>{eventDetails.category}</Text>
              </View>

              <Text style={styles.heroTitle}>{eventDetails.title}</Text>
              <Text style={styles.heroSubtitle}>by {eventDetails.organizer}</Text>

              <View style={styles.heroMeta}>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.heroMetaText}>{eventDetails.date}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Ionicons name="time-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.heroMetaText}>{eventDetails.time}</Text>
                </View>
                <View style={styles.heroMetaItem}>
                  <Ionicons
                    name={eventDetails.isOnline ? "globe-outline" : "location-outline"}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.heroMetaText}>{eventDetails.location}</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
          </ImageBackground>
        ) : (
          <View style={[styles.heroBackground, styles.imagePlaceholder]}>
            <LinearGradient
              colors={categoryTheme.gradientColors}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Ionicons name={categoryTheme.icon as any} size={80} color="rgba(255,255,255,0.3)" />
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(0,0,0,0.7)"]}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <View style={[styles.categoryBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Ionicons name={categoryTheme.icon as any} size={14} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.categoryText}>{eventDetails.category}</Text>
                </View>
                <Text style={styles.heroTitle}>{eventDetails.title}</Text>
                <Text style={styles.heroSubtitle}>by {eventDetails.organizer}</Text>
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

          <Animated.ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            onScroll={(event) => {
              const scrollY = event.nativeEvent.contentOffset.y;
              const contentHeight = event.nativeEvent.contentSize.height;
              const scrollViewHeight = event.nativeEvent.layoutMeasurement.height;
              const scrollDepth = Math.min(100, Math.round((scrollY / (contentHeight - scrollViewHeight)) * 100));
              scrollDepthRef.current = Math.max(scrollDepthRef.current, scrollDepth);
            }}
            scrollEventThrottle={16}
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Entry Fee</Text>
            <Text style={styles.priceValue}>
              {/* ✅ FIX: Add null checks for price access */}
              {/* For online events, use regional currency; for venue events, use event's currency */}
              {eventDetails.price?.isFree
                ? "Free Entry"
                : `${eventDetails.isOnline ? currencySymbol : (eventDetails.price?.currency || currencySymbol)}${eventDetails.price?.amount ?? 0}`}
            </Text>
          </View>
          <View style={styles.priceCardRight}>
            {/* Rating Display */}
            {(realEventData?.rating ?? 0) > 0 && (
              <View style={styles.ratingBadge}>
                <StarRating rating={realEventData?.rating || 0} size={14} showEmpty={false} />
                <Text style={styles.ratingText}>
                  {(realEventData?.rating || 0).toFixed(1)} ({realEventData?.reviewCount || 0})
                </Text>
              </View>
            )}
            <View style={styles.eventTypeBadge}>
              <Ionicons
                name={eventDetails.isOnline ? "globe" : "location"}
                size={14}
                color={eventDetails.isOnline ? "#10B981" : "#F59E0B"}
              />
              <Text
                style={[
                  styles.eventTypeText,
                  { color: eventDetails.isOnline ? "#10B981" : "#F59E0B" },
                ]}
              >
                {eventDetails.isOnline ? "Online Event" : "Venue Event"}
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{eventDetails.description}</Text>
        </View>

        {/* Time Slots for Offline Events */}
        {isOfflineEvent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <Text style={styles.sectionSubtitle}>Choose your preferred time to attend the event</Text>


            {availableSlots.length > 0 ? (
              <View style={styles.slotsGrid}>
                {availableSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot.id}
                    style={[
                      styles.slotCard,
                      selectedSlot === slot.id && styles.slotCardSelected,
                      !slot.available && styles.slotCardDisabled,
                    ]}
                    onPress={() => slot.available && setSelectedSlot(slot.id)}
                    disabled={!slot.available}
                  >
                    <View style={styles.slotHeader}>
                      <Text
                        style={[
                          styles.slotTime,
                          selectedSlot === slot.id && styles.slotTimeSelected,
                          !slot.available && styles.slotTimeDisabled,
                        ]}
                      >
                        {slot.time}
                      </Text>
                      {selectedSlot === slot.id && (
                        <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                      )}
                    </View>

                    <Text
                      style={[styles.slotCapacity, !slot.available && styles.slotCapacityDisabled]}
                    >
                      {slot.available ? `${slot.maxCapacity - slot.bookedCount} spots left` : "Fully booked"}
                    </Text>

                    <View style={styles.capacityBar}>
                      <View
                        style={[
                          styles.capacityFill,
                          {
                            width: `${(slot.bookedCount / slot.maxCapacity) * 100}%`,
                            backgroundColor: slot.available ? "#8B5CF6" : "#9CA3AF",
                          },
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptySlotsContainer}>
                <Ionicons name="time-outline" size={48} color="#9CA3AF" />
                <Text style={styles.emptySlotsText}>No time slots available</Text>
                <Text style={styles.emptySlotsSubtext}>Please check back later or contact the organizer</Text>
              </View>
            )}
          </View>
        )}

        {/* Related Events Section - Lazy Loaded */}
        {relatedEvents.length > 0 && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <RelatedEventsSection
              events={relatedEvents}
              isLoading={isLoadingRelated}
            />
          </Animated.View>
        )}

        {/* Event Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          <View style={styles.detailsList}>
            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="person-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Organizer</Text>
                <Text style={styles.detailValue}>{eventDetails.organizer}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Date & Time</Text>
                <Text style={styles.detailValue}>
                  {eventDetails.date} at {eventDetails.time}
                </Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons
                  name={eventDetails.isOnline ? "globe-outline" : "location-outline"}
                  size={20}
                  color="#6B7280"
                />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{eventDetails.location}</Text>
              </View>
            </View>

            <View style={styles.detailItem}>
              <View style={styles.detailIcon}>
                <Ionicons name="pricetag-outline" size={20} color="#6B7280" />
              </View>
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{eventDetails.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reviews Section */}
        {eventDetails.id && (
          <EventReviews
            eventId={eventDetails.id}
            eventTitle={eventDetails.title}
          />
        )}
      </Animated.ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedBottom}>
        <EventActionButton
          onPress={eventDetails.isOnline ? handleOnlineBooking : handleOfflineBooking}
          loading={isLoading}
          disabled={!!error}
          isOnline={eventDetails.isOnline}
          price={{
            amount: eventDetails.price?.amount ?? 0,
            currency: eventDetails.isOnline ? currencySymbol : (eventDetails.price?.currency || currencySymbol),
            isFree: eventDetails.price?.isFree ?? false
          }}
          hasSelectedSlot={eventDetails.isOnline ? true : (availableSlots.length === 0 || !!selectedSlot)}
          theme={categoryTheme}
        />
      </View>

      {error && (
        <Animated.View
          style={[
            styles.errorToast,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, -10],
              })}],
            },
          ]}
        >
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                onPress={() => setError(null)}
                style={styles.errorCloseButton}
              >
                <Ionicons name="close" size={18} color="#991B1B" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Event Booking Modal */}
      <EventBookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        event={{
          ...eventDetails,
          availableSlots: availableSlots.length > 0 ? availableSlots : eventDetails.availableSlots,
        }}
        onBookingSuccess={handleBookingSuccess}
        initialSelectedSlot={selectedSlot}
      />
    </ThemedView>
  );
}

// Event Action Button Component with Category Theme
function EventActionButton({
  onPress,
  loading,
  disabled,
  isOnline,
  price,
  hasSelectedSlot,
  theme,
}: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  isOnline: boolean;
  price: { amount: number; currency: string; isFree: boolean };
  hasSelectedSlot: boolean;
  theme: CategoryTheme;
}) {
  const getButtonText = () => {
    if (loading) return "Processing...";
    if (isOnline) {
      return price.isFree ? "Register Free" : `Book Now • ${price.currency}${price.amount}`;
    } else {
      if (!hasSelectedSlot) return "Select Time Slot";
      return `Book Now • ${price.isFree ? "Free" : `${price.currency}${price.amount}`}`;
    }
  };

  const getButtonIcon = () => {
    if (loading) return "hourglass-outline";
    if (isOnline) return "globe-outline";
    if (!hasSelectedSlot) return "time-outline";
    return "ticket-outline";
  };

  // Use theme colors for the button gradient
  const buttonColors: [string, string] = disabled || !hasSelectedSlot
    ? ["#9CA3AF", "#6B7280"]
    : theme.buttonGradient;

  return (
    <TouchableOpacity
      style={[actionStyles.button, (disabled || !hasSelectedSlot) && actionStyles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled || !hasSelectedSlot}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={buttonColors}
        style={actionStyles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
        ) : (
          <Ionicons name={getButtonIcon() as any} size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
        )}
        <Text style={actionStyles.buttonText}>{getButtonText()}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const createStyles = (
  HORIZONTAL_PADDING: number,
  screenData: { width: number; height: number }
) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: "#FFFFFF",
    },

    // HERO
    heroSection: {
      height: Math.min(Math.max(screenData.height * 0.4, 320), 460),
      position: "relative",
      width: "100%",
      backgroundColor: "#000",
    },
    heroBackground: {
      flex: 1,
      width: "100%",
    },
    heroOverlay: {
      flex: 1,
      paddingTop: Platform.OS === "ios" ? 0 : 8, // slight breathing room on Android
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 8,
      paddingBottom: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerActions: {
      flexDirection: "row",
      gap: 12,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    heroContent: {
      flex: 1,
      justifyContent: "flex-end",
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingBottom: 24,
    },
    categoryBadge: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(139, 92, 246, 0.9)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      marginBottom: 12,
    },
    categoryText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    heroTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: "#FFFFFF",
      marginBottom: 8,
      lineHeight: 34,
    },
    heroSubtitle: {
      fontSize: 16,
      color: "rgba(255,255,255,0.9)",
      marginBottom: 16,
      fontWeight: "500",
    },
    heroMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
    },
    heroMetaItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    heroMetaText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "500",
    },

    // CONTENT
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 0,
      paddingBottom: 180, // ensure content isn't hidden behind the fixed button (button is at 90px from bottom + ~60px button height + 30px spacing)
    },

    priceCard: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 16, // removed negative margin to avoid overlap
      backgroundColor: "#FFFFFF",
      borderRadius: 20,
      padding: 20,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 6,
      zIndex: 1,
    },
    priceInfo: {
      flex: 1,
    },
    priceLabel: {
      fontSize: 14,
      color: "#6B7280",
      marginBottom: 4,
      fontWeight: "500",
    },
    priceValue: {
      fontSize: 24,
      fontWeight: "800",
      color: "#1F2937",
    },
    priceCardRight: {
      alignItems: "flex-end",
      gap: 8,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#FFF9E6",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 10,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: "600",
      color: "#92400E",
    },
    eventTypeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "#F9FAFB",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    eventTypeText: {
      fontSize: 12,
      fontWeight: "600",
    },

    section: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 32,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: "#1F2937",
      marginBottom: 8,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: "#6B7280",
      marginBottom: 16,
      lineHeight: 20,
    },
    description: {
      fontSize: 16,
      color: "#374151",
      lineHeight: 24,
      fontWeight: "400",
    },

    // Slots
    slotsGrid: {
      gap: 12,
    },
    slotCard: {
      backgroundColor: "#FFFFFF",
      borderRadius: 16,
      padding: 16,
      borderWidth: 2,
      borderColor: "#E5E7EB",
    },
    slotCardSelected: {
      borderColor: "#8B5CF6",
      backgroundColor: "#F8FAFC",
    },
    slotCardDisabled: {
      backgroundColor: "#F9FAFB",
      borderColor: "#E5E7EB",
    },
    slotHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 8,
    },
    slotTime: {
      fontSize: 16,
      fontWeight: "700",
      color: "#1F2937",
    },
    slotTimeSelected: {
      color: "#8B5CF6",
    },
    slotTimeDisabled: {
      color: "#9CA3AF",
    },
    slotCapacity: {
      fontSize: 14,
      color: "#6B7280",
      marginBottom: 8,
      fontWeight: "500",
    },
    slotCapacityDisabled: {
      color: "#9CA3AF",
    },
    capacityBar: {
      height: 4,
      backgroundColor: "#E5E7EB",
      borderRadius: 2,
      overflow: "hidden",
    },
    capacityFill: {
      height: "100%",
      borderRadius: 2,
    },
    emptySlotsContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      paddingHorizontal: 20,
    },
    emptySlotsText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1F2937",
      marginTop: 16,
      marginBottom: 8,
    },
    emptySlotsSubtext: {
      fontSize: 14,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: 20,
    },

    detailsList: {
      gap: 20,
    },
    detailItem: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 16,
    },
    detailIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "#F3F4F6",
      alignItems: "center",
      justifyContent: "center",
    },
    detailContent: {
      flex: 1,
    },
    detailLabel: {
      fontSize: 14,
      color: "#6B7280",
      marginBottom: 4,
      fontWeight: "500",
    },
    detailValue: {
      fontSize: 16,
      color: "#1F2937",
      fontWeight: "600",
    },

    // Bottom UI
    fixedBottom: {
      position: "absolute",
      left: HORIZONTAL_PADDING,
      right: HORIZONTAL_PADDING,
      bottom: 70, // Position above bottom navigation bar (70px nav + 20px spacing)
    },

    // Error toast
    errorToast: {
      position: "absolute",
      left: HORIZONTAL_PADDING,
      right: HORIZONTAL_PADDING,
      top: Platform.OS === "ios" ? 60 : 44,
    },
    errorInner: {
      backgroundColor: "#FEF2F2",
      borderLeftWidth: 4,
      borderLeftColor: "#EF4444",
      padding: 16,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    errorText: {
      color: "#991B1B",
      fontSize: 14,
      fontWeight: "600",
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: "#6B7280",
      fontWeight: "500",
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 40,
    },
    errorTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1F2937",
      marginTop: 16,
      marginBottom: 8,
    },
    errorMessage: {
      fontSize: 16,
      color: "#6B7280",
      textAlign: "center",
      marginBottom: 24,
    },
    retryButton: {
      backgroundColor: "#8B5CF6",
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryButtonText: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },
    loadingSkeleton: {
      width: '80%',
      height: 200,
      backgroundColor: '#E5E7EB',
      borderRadius: 12,
      marginTop: 20,
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F3F4F6',
    },
    imagePlaceholderText: {
      marginTop: 12,
      fontSize: 14,
      color: '#6B7280',
      fontWeight: '500',
    },
    errorCloseButton: {
      padding: 4,
      marginLeft: 8,
    },

    // Event Not Found styles
    notFoundContainer: {
      flex: 1,
      backgroundColor: '#111827',
    },
    notFoundGradient: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notFoundContent: {
      alignItems: 'center',
      paddingHorizontal: 40,
    },
    notFoundIconContainer: {
      position: 'relative',
      marginBottom: 24,
    },
    notFoundIconBadge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      backgroundColor: '#1F2937',
      borderRadius: 14,
      width: 28,
      height: 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notFoundTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 12,
      textAlign: 'center',
    },
    notFoundMessage: {
      fontSize: 16,
      color: '#9CA3AF',
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 32,
    },
    notFoundActions: {
      flexDirection: 'row',
      gap: 16,
    },
    notFoundBackButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#374151',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    notFoundBackText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    notFoundExploreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(139, 92, 246, 0.15)',
      borderWidth: 1,
      borderColor: '#8B5CF6',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    notFoundExploreText: {
      color: '#8B5CF6',
      fontSize: 16,
      fontWeight: '600',
    },
  });

const actionStyles = StyleSheet.create({
  button: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
