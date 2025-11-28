// MainStoreHeader.tsx - Modernized with Design System & Micro-animations
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
  TextInput,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { triggerImpact, triggerNotification } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import { GlassCard } from "@/components/ui";
import {
  Colors,
  Spacing,
  Shadows,
  BorderRadius,
  Typography,
  Gradients,
  Timing,
  IconSize,
} from "@/constants/DesignSystem";

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

  // Animation refs
  const searchScaleAnim = useRef(new Animated.Value(1)).current;
  const avatarScaleAnim = useRef(new Animated.Value(1)).current;
  const backButtonScaleAnim = useRef(new Animated.Value(1)).current;

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

  // Handlers with haptic feedback & animations
  const handleBack = () => {
    triggerImpact('Medium');
    if (onBack) onBack();
    else router.back();
  };

  const handleClearSearch = () => {
    triggerImpact('Light');
    setSearchQuery("");
    if (onSearchChange) {
      onSearchChange("");
    }
  };

  const handleProfilePress = () => {
    triggerImpact('Medium');
    if (onProfilePress) onProfilePress();
  };

  // Animation handlers
  const animateScale = (animValue: Animated.Value, toValue: number) => {
    Animated.spring(animValue, {
      toValue,
      useNativeDriver: true,
      ...Timing.springBouncy,
    }).start();
  };

  const handleSearchFocus = () => {
    setIsFocused(true);
    animateScale(searchScaleAnim, 1.02);
  };

  const handleSearchBlur = () => {
    setIsFocused(false);
    animateScale(searchScaleAnim, 1);
  };

  const initials = React.useMemo(() => {
    if (!storeName) return "R";
    const parts = storeName.trim().split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  }, [storeName]);

  return (
    <LinearGradient
      colors={Gradients.purplePrimary}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.container, { paddingTop: topPadding + Spacing.sm, paddingBottom: Spacing.md }]}
      accessibilityRole="header"
      accessibilityLabel={`Store page header. ${storeName}${subtitle ? `. ${subtitle}` : ''}`}
    >
      <View style={styles.inner}>
        {/* Glassmorphic Back Button with Animation */}
        <Animated.View
          style={{
            transform: [{ scale: backButtonScaleAnim }],
            opacity: showBack ? 1 : 0,
          }}
        >
          <GlassCard
            variant="light"
            intensity={30}
            borderRadius={BorderRadius.full}
            shadow={false}
            style={styles.iconBtn}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleBack}
              onPressIn={() => animateScale(backButtonScaleAnim, 0.92)}
              onPressOut={() => animateScale(backButtonScaleAnim, 1)}
              disabled={!showBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              accessibilityHint="Navigate to the previous screen"
              accessibilityState={{ disabled: !showBack }}
              style={styles.iconBtnTouchable}
            >
              <Ionicons name="chevron-back" size={IconSize.md} color={Colors.text.white} />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

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

        {/* Animated Profile Avatar */}
        <Animated.View style={{ transform: [{ scale: avatarScaleAnim }] }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleProfilePress}
            onPressIn={() => animateScale(avatarScaleAnim, 0.92)}
            onPressOut={() => animateScale(avatarScaleAnim, 1)}
            accessibilityRole="button"
            accessibilityLabel={`Profile. ${initials}`}
            accessibilityHint="Open profile menu"
            style={styles.avatarWrap}
          >
            <LinearGradient colors={["#FFD166", "#FF8A65"]} style={styles.avatarGradient}>
              <ThemedText style={styles.avatarText}>{initials}</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Animated Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View
          style={[
            styles.searchWrapper,
            isFocused && styles.searchWrapperFocused,
            { transform: [{ scale: searchScaleAnim }] },
          ]}
        >
          <Ionicons
            name="search"
            size={IconSize.md}
            color={isFocused ? Colors.primary[700] : Colors.gray[400]}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={Colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
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
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close-circle" size={IconSize.md} color={Colors.gray[400]} />
            </TouchableOpacity>
          )}
        </Animated.View>
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
    borderBottomLeftRadius: BorderRadius.lg,
    borderBottomRightRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.base,
    minHeight: 56,
    justifyContent: "space-between",
  },
  // Glassmorphic circular back button
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnTouchable: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.sm,
  },
  title: {
    color: Colors.text.white,
    ...Typography.h4,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.12)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  titleSmall: { fontSize: 16 },
  subtitle: {
    color: "rgba(255,255,255,0.9)",
    ...Typography.bodySmall,
    marginTop: 2,
    opacity: 0.9,
  },
  subtitleSmall: { fontSize: 11 },

  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    ...Shadows.medium,
  },
  avatarGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: Colors.text.white,
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
    backgroundColor: Colors.text.white,
    opacity: 0.06,
    transform: [{ rotate: "18deg" }],
  },
  decorCircleSmall: {
    position: "absolute",
    right: 28,
    width: 96,
    height: 36,
    borderRadius: 60,
    backgroundColor: Colors.text.white,
    opacity: 0.05,
    transform: [{ rotate: "18deg" }],
  },

  // Modern Search Bar Styles
  searchContainer: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    height: 44,
    paddingHorizontal: Spacing.md,
    borderWidth: 2,
    borderColor: "transparent",
    ...Shadows.subtle,
  },
  searchWrapperFocused: {
    borderColor: Colors.primary[700],
    backgroundColor: Colors.background.primary,
    ...Shadows.medium,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.bodyLarge,
    color: Colors.text.primary,
    padding: 0,
    height: "100%",
  },
  clearButton: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
});
