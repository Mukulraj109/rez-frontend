// MainStoreHeader.tsx (updated back-arrow to be circular)
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  StatusBar,
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
}

export default function MainStoreHeader({
  storeName = "Reliance Trends",
  subtitle,
  onBack,
  onProfilePress,
  showBack = true,
}: MainStoreHeaderProps) {
  const router = useRouter();
  const { width, height } = Dimensions.get("window");
  const isSmall = width < 360;
  const topPadding =
    Platform.OS === "ios" ? (height >= 812 ? 44 : 20) : StatusBar.currentHeight ?? 24;

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
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
    >
      <View style={styles.inner}>
        {/* Circular Back */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleBack}
          disabled={!showBack}
          accessibilityLabel="Go back"
          accessibilityHint="Navigate to the previous screen"
          style={[styles.iconBtn, !showBack && { opacity: 0 }]}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleWrap}>
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
          accessibilityLabel="Profile"
          accessibilityHint="Open profile menu"
          style={styles.avatarWrap}
        >
          <LinearGradient colors={["#FFD166", "#FF8A65"]} style={styles.avatarGradient}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
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
});
