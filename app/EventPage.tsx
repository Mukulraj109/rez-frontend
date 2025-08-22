import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  Alert,
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
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import { EventItem } from "@/types/homepage.types";
import { Ionicons } from "@expo/vector-icons";

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
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Dynamic event data state
  const [eventData, setEventData] = useState<DynamicEventData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  // Parse dynamic event data from navigation params
  useEffect(() => {
    if (params.eventData && params.eventId && params.eventType) {
      try {
        const parsedData = JSON.parse(params.eventData as string);
        setEventData(parsedData);
        setIsDynamic(true);
        console.log("🎉 [DYNAMIC EVENT] Loaded event data:", {
          eventId: params.eventId,
          eventType: params.eventType,
          eventName: parsedData.title,
          isOnline: parsedData.isOnline,
          fullData: parsedData,
        });
      } catch (error) {
        console.error("❌ [DYNAMIC EVENT] Failed to parse event data:", error);
        setIsDynamic(false);
      }
    } else {
      console.log("🎉 [STATIC EVENT] Loading default event page");
      setIsDynamic(false);
    }
  }, [params]);

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

  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const eventDetails: EventItem = useMemo(() => {
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

    return (
      initialEvent || {
        id: eventId || "event-001",
        type: "event",
        title: "Art of Living - Happiness Program",
        subtitle: "Free • Online",
        description:
          "Transform your life with ancient wisdom and modern techniques. Learn breathing exercises, meditation, and stress management.",
        image:
          "https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=200&fit=crop",
        price: { amount: 0, currency: "₹", isFree: true },
        location: "Online",
        date: "2025-08-25",
        time: "7:00 PM",
        category: "Wellness",
        organizer: "Art of Living Foundation",
        isOnline: true,
        registrationRequired: true,
      }
    );
  }, [initialEvent, eventId, isDynamic, eventData]);

  const handleSharePress = useCallback(async () => {
    try {
      setIsLoading(true);
      await Share.share({
        message: `Check out ${eventDetails.title} by ${eventDetails.organizer} on ${eventDetails.date}`,
        url: `https://events.example.com/events/${eventDetails.id}`,
        title: eventDetails.title,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to share event.");
    } finally {
      setIsLoading(false);
    }
  }, [eventDetails]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorited((prev) => {
      const next = !prev;
      Alert.alert(
        next ? "Added to Favorites" : "Removed from Favorites",
        `${eventDetails.title} ${next ? "added to" : "removed from"} favorites.`
      );
      return next;
    });
  }, [eventDetails.title]);

  const handleOnlineBooking = useCallback(async () => {
    if (!eventDetails.isOnline) return;

    try {
      setIsLoading(true);
      const bookingUrl =
        eventData?.bookingUrl || `https://events.example.com/book/${eventDetails.id}`;

      const supported = await Linking.canOpenURL(bookingUrl);
      if (supported) {
        await Linking.openURL(bookingUrl);
      } else {
        Alert.alert("Error", "Unable to open booking link. Please try again later.");
      }
    } catch (error) {
      console.error("Error opening booking URL:", error);
      Alert.alert("Error", "Failed to open booking page. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [eventDetails, eventData]);

  const handleOfflineBooking = useCallback(() => {
    if (eventDetails.isOnline) return;

    if (!selectedSlot) {
      Alert.alert("Select Time Slot", "Please select a time slot to continue with booking.");
      return;
    }

    const cartItem = {
      id: eventDetails.id,
      name: eventDetails.title,
      price: eventDetails.price.amount,
      image: eventDetails.image,
      category: "events",
      eventDate: eventDetails.date,
      eventTime: selectedSlot,
      location: eventDetails.location,
    };

    console.log("Adding event to cart:", cartItem);
    Alert.alert(
      "Added to Cart",
      `${eventDetails.title} has been added to your cart for ${eventDetails.date} at ${selectedSlot}.`
    );
  }, [eventDetails, selectedSlot]);

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

  // Mock available slots for offline events
  const availableSlots = useMemo(() => {
    if (eventDetails.isOnline) return [];
    return (
      eventData?.availableSlots || [
        { id: "slot1", time: "10:00 AM", available: true, maxCapacity: 50, bookedCount: 12 },
        { id: "slot2", time: "2:00 PM", available: true, maxCapacity: 50, bookedCount: 28 },
        { id: "slot3", time: "6:00 PM", available: false, maxCapacity: 50, bookedCount: 50 },
      ]
    );
  }, [eventDetails.isOnline, eventData]);

  return (
    <ThemedView style={styles.page}>
      {/* Non-translucent status bar to avoid overlay */}
      <StatusBar barStyle="light-content" backgroundColor="#000000" translucent={false} />

      {/* Top safe area to prevent overlap with the hero header */}
      <SafeAreaView style={{ backgroundColor: "#000000" }} />

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: eventDetails.image }}
          style={styles.heroBackground}
          resizeMode="cover"
        >
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
                <TouchableOpacity style={styles.actionButton} onPress={handleFavoritePress}>
                  <Ionicons
                    name={isFavorited ? "heart" : "heart-outline"}
                    size={20}
                    color={isFavorited ? "#EF4444" : "#FFFFFF"}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Event Info */}
            <View style={styles.heroContent}>
              <View style={styles.categoryBadge}>
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
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Price Card */}
        <View style={styles.priceCard}>
          <View style={styles.priceInfo}>
            <Text style={styles.priceLabel}>Entry Fee</Text>
            <Text style={styles.priceValue}>
              {eventDetails.price.isFree
                ? "Free Entry"
                : `${eventDetails.price.currency}${eventDetails.price.amount}`}
            </Text>
          </View>
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

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Event</Text>
          <Text style={styles.description}>{eventDetails.description}</Text>
        </View>

        {/* Time Slots for Offline Events */}
        {!eventDetails.isOnline && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Time Slot</Text>
            <Text style={styles.sectionSubtitle}>Choose your preferred time to attend the event</Text>

            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.slotCard,
                    selectedSlot === slot.time && styles.slotCardSelected,
                    !slot.available && styles.slotCardDisabled,
                  ]}
                  onPress={() => slot.available && setSelectedSlot(slot.time)}
                  disabled={!slot.available}
                >
                  <View style={styles.slotHeader}>
                    <Text
                      style={[
                        styles.slotTime,
                        selectedSlot === slot.time && styles.slotTimeSelected,
                        !slot.available && styles.slotTimeDisabled,
                      ]}
                    >
                      {slot.time}
                    </Text>
                    {selectedSlot === slot.time && (
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
          </View>
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
      </ScrollView>

      {/* Fixed Action Button */}
      <View style={styles.fixedBottom}>
        <EventActionButton
          onPress={eventDetails.isOnline ? handleOnlineBooking : handleOfflineBooking}
          loading={isLoading}
          disabled={!!error}
          isOnline={eventDetails.isOnline}
          price={eventDetails.price}
          hasSelectedSlot={!eventDetails.isOnline ? !!selectedSlot : true}
        />
      </View>

      {error && (
        <View style={styles.errorToast}>
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}
    </ThemedView>
  );
}

// Event Action Button Component
function EventActionButton({
  onPress,
  loading,
  disabled,
  isOnline,
  price,
  hasSelectedSlot,
}: {
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  isOnline: boolean;
  price: { amount: number; currency: string; isFree: boolean };
  hasSelectedSlot: boolean;
}) {
  const getButtonText = () => {
    if (loading) return "Loading...";
    if (isOnline) {
      return price.isFree ? "Register Free" : "Book Now";
    } else {
      if (!hasSelectedSlot) return "Select Time Slot";
      return `Add to Cart • ${price.isFree ? "Free" : `${price.currency}${price.amount}`}`;
    }
  };

  const getButtonIcon = () => {
    if (loading) return "hourglass-outline";
    if (isOnline) return "globe-outline";
    if (!hasSelectedSlot) return "time-outline";
    return "bag-add-outline";
  };

  return (
    <TouchableOpacity
      style={[actionStyles.button, (disabled || !hasSelectedSlot) && actionStyles.buttonDisabled]}
      onPress={onPress}
      disabled={loading || disabled || !hasSelectedSlot}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={disabled || !hasSelectedSlot ? ["#9CA3AF", "#9CA3AF"] : ["#8B5CF6", "#7C3AED"]}
        style={actionStyles.gradient}
      >
        <Ionicons name={getButtonIcon() as any} size={20} color="#FFFFFF" />
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
      paddingBottom: 140, // ensure content isn't hidden behind the fixed button
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
      bottom: Platform.OS === "ios" ? 24 : 16,
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
