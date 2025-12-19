// RewardsFooterBanner.tsx - Dark footer banner with trophy
import React from "react";
import {
  View,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import {
  Spacing,
  BorderRadius,
} from "@/constants/DesignSystem";

export interface RewardsFooterBannerProps {
  message?: string;
  subMessage?: string;
}

export default function RewardsFooterBanner({
  message = "This store rewards you for shopping smarter",
  subMessage = "— only on ReZ.",
}: RewardsFooterBannerProps) {
  return (
    <View style={styles.container}>
      {/* Trophy Icon */}
      <Ionicons name="trophy" size={36} color="#FFC857" style={styles.trophy} />

      {/* Message */}
      <ThemedText style={styles.message}>{message}</ThemedText>
      <ThemedText style={styles.subMessage}>{subMessage}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0B2240",
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: "center",
  },
  trophy: {
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 22,
  },
  subMessage: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 4,
  },
});
