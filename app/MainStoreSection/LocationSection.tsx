// LocationSection.tsx - Location & Directions section
import React, { useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Platform,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/DesignSystem";

export interface LocationSectionProps {
  address?: string;
  distance?: string;
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string;
}

export default function LocationSection({
  address = "MG Road, Bangalore",
  distance = "300m away",
  latitude,
  longitude,
  mapImageUrl,
}: LocationSectionProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animateScale = (toValue: number) => {
    Animated.spring(scaleAnim, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  };

  const handleGetDirections = () => {
    triggerImpact('Medium');

    // Open in maps app
    if (latitude && longitude) {
      const scheme = Platform.select({
        ios: `maps:0,0?q=${address}@${latitude},${longitude}`,
        android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${address})`,
      });

      if (scheme) {
        Linking.openURL(scheme).catch(() => {
          // Fallback to Google Maps web
          Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
          );
        });
      }
    } else {
      // Search by address
      const encodedAddress = encodeURIComponent(address);
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <ThemedText style={styles.sectionTitle}>Location & Directions</ThemedText>

      {/* Map Preview */}
      <View style={styles.mapContainer}>
        {mapImageUrl ? (
          <Image source={{ uri: mapImageUrl }} style={styles.mapImage} resizeMode="cover" />
        ) : (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={48} color={Colors.gray[300]} />
            {/* Pin Icon Overlay */}
            <View style={styles.pinOverlay}>
              <Ionicons name="location" size={40} color="#FF3B30" />
            </View>
          </View>
        )}
      </View>

      {/* Address */}
      <ThemedText style={styles.address}>
        {address} - {distance}
      </ThemedText>

      {/* Get Directions Button */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={styles.directionsButton}
          activeOpacity={0.8}
          onPress={handleGetDirections}
          onPressIn={() => animateScale(0.97)}
          onPressOut={() => animateScale(1)}
          accessibilityRole="button"
          accessibilityLabel="Get Directions"
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
          <ThemedText style={styles.directionsText}>Get Directions</ThemedText>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  mapContainer: {
    width: "100%",
    height: 160,
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    backgroundColor: Colors.gray[100],
    marginBottom: Spacing.sm,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8F4E5",
  },
  pinOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -20,
    marginTop: -40,
  },
  address: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  directionsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00C06A",
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    gap: 8,
    ...Shadows.subtle,
  },
  directionsText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
