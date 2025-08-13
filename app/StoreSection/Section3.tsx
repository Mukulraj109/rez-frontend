import React from "react";
import { View, Image, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ThemedText } from "@/components/ThemedText";

export default function Section3() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
      

        {/* Middle text */}
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>Get Instant Discount</ThemedText>
          <ThemedText style={styles.subtitle}>10% Off on bill payment</ThemedText>
        </View>

        {/* Right icon badge */}
        <View style={styles.badge}>
          <ThemedText style={styles.badgeIcon}>⚡</ThemedText>
        </View>
      </View>
      {/* subtle dashed divider like the screenshot */}
      <View style={styles.divider} accessibilityElementsHidden />
    </View>
  );
}

/* --- Styles --- */
interface Styles {
  container: ViewStyle;
  card: ViewStyle;
  image: ViewStyle;
  textContainer: ViewStyle;
  title: TextStyle;
  subtitle: TextStyle;
  badge: ViewStyle;
  badgeIcon: TextStyle;
  divider: ViewStyle;
}

const PURPLE = "#6c63ff";
const BG = "#f8f9fa";
const PRIMARY_TEXT = "#333333";
const SECONDARY_TEXT = "#666666";

const styles = StyleSheet.create<Styles>({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BG,
    paddingHorizontal: 14,
    paddingVertical: 17,
    borderRadius: 14,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: "#e9ecef",
    marginRight: 14,
   
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: PURPLE, // purple heading like screenshot
    marginBottom: 4,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 13,
    color: SECONDARY_TEXT,
    lineHeight: 18,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: PURPLE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    // elevated look
    shadowColor: PURPLE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ rotate: "0deg" }], // change if you want a tilt
  },
  badgeIcon: {
    fontSize: 22,
    color: "#fff",
    lineHeight: 22,
  },
  divider: {
    marginTop: 14,
    borderBottomWidth: 1,
    borderStyle: "dashed",
    borderColor: "#eee",
    opacity: 0.9,
  },
});

