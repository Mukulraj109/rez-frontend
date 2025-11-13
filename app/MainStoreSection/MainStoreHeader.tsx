// MainStoreHeader.tsx (updated back-arrow to be circular)
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  TextInput,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

export interface MainStoreHeaderProps {
  storeName?: string;
  subtitle?: string;
  onBack?: () => void;
  onProfilePress?: () => void;
  showBack?: boolean;
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
}

export default function MainStoreHeader({
  storeName = "Reliance Trends",
  subtitle,
  onBack,
  onProfilePress,
  showBack = true,
  onSearchChange,
  searchQuery: externalSearchQuery,
}: MainStoreHeaderProps) {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const isSmall = width < 360;
  const topPadding =
    Platform.OS === "ios" ? (height >= 812 ? 44 : 20) : StatusBar.currentHeight ?? 24;

  // Search state
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery || "");
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync external search query with internal state
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Debounced search handler
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (onSearchChange) {
        onSearchChange(searchQuery);
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, onSearchChange]);

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const initials = React.useMemo(() => {
    if (!storeName) return "R";
    const parts = storeName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [storeName]);

  return (
    <LinearGradient
      colors={["#7C3AED", "#8B5CF6"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: topPadding + 8, paddingBottom: 12 }]}
      accessibilityRole="header"
      accessibilityLabel={`Store page header. ${storeName}${subtitle ? `. ${subtitle}` : ''}`}
    >
      <View style={styles.inner}>
        {/* Circular Back */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          disabled={!showBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to the previous screen"
          accessibilityState={{ disabled: !showBack }}
          style={[styles.iconBtn, !showBack && { opacity: 0 }]}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <View
          style={styles.titleWrap}
          accessibilityRole="header"
        >
          <ThemedText style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={1}>
            {storeName}
          </ThemedText>
          {subtitle ? (
            <ThemedText style={[styles.subtitle, isSmall && styles.subtitleSmall]} numberOfLines={1}>
              {subtitle}
            </ThemedText>
          ) : null}
        </View>

        {/* Profile avatar */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onProfilePress}
          accessibilityRole="button"
          accessibilityLabel={`Profile. ${initials}`}
          accessibilityHint="Open profile menu"
          style={styles.avatarWrap}
        >
          <LinearGradient colors={["#FFD166", "#FF8A65"]} style={styles.avatarGradient}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, isFocused && styles.searchWrapperFocused]}>
          <Ionicons
            name="search"
            size={20}
            color={isFocused ? "#7C3AED" : "#9CA3AF"}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            returnKeyType="search"
            accessibilityLabel="Search products"
            accessibilityHint="Enter product name to search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={handleClearSearch}
              style={styles.clearButton}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
              accessibilityHint="Clear the search input"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Decorative curved highlight to the right (matches screenshot) */}
      <View pointerEvents="none" style={styles.decorWrap}>
        <View style={styles.decorCircleLarge} />
        <View style={styles.decorCircleSmall} />
      </View>
    </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 56,
    justifyContent: "space-between",
  },
  // <-- updated: make iconBtn a circle (44x44, borderRadius 22) -->
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22, // half of width/height to make a perfect circle
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleSmall: { fontSize: 16 },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
    opacity: 0.9,
  },
  subtitleSmall: { fontSize: 11 },

  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  decorWrap: {
    position: "absolute",
    right: -40,
    top: 20,
    width: 220,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  decorCircleLarge: {
    position: "absolute",
    right: 6,
    width: 220,
    height: 72,
    borderRadius: 100,
    backgroundColor: "#ffffff",
    opacity: 0.06,
    transform: [{ rotate: "18deg" }],
  },
  decorCircleSmall: {
    position: "absolute",
    right: 28,
    width: 96,
    height: 36,
    borderRadius: 60,
    backgroundColor: "#ffffff",
    opacity: 0.05,
    transform: [{ rotate: "18deg" }],
  },

  // Search bar styles
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchWrapperFocused: {
    borderColor: "#7C3AED",
    backgroundColor: "#fff",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
    height: "100%",
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
});
