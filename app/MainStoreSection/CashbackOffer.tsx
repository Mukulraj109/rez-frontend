import React from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";

interface CashbackOfferProps {
  percentage?: string;        // e.g. "10%" or "10"
  title?: string;             // e.g. "Cash back"
  showIcon?: boolean;
  onPress?: (e: GestureResponderEvent) => void;
  compact?: boolean;          // slightly smaller footprint
}

export default function CashbackOffer({
  percentage = "10%",
  title = "Cash back",
  showIcon = true,
  onPress,
  compact = false,
}: CashbackOfferProps) {
  const { width } = Dimensions.get("window");
  const isSmallScreen = width < 360 || compact;

  // ensure percentage always ends with % (allow "10" or "10%")
  const pct = percentage.toString().trim().endsWith("%")
    ? percentage.toString().trim()
    : `${percentage}%`;

  const Container: React.ComponentType<any> = onPress ? TouchableOpacity : View;

  return (
    <Container
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.wrapper,
        isSmallScreen && styles.wrapperCompact,
        onPress && styles.pressable,
      ]}
      accessibilityRole={onPress ? "button" : "text"}
      accessibilityLabel={`${title} ${pct}`}
    >
      <View style={[styles.card, isSmallScreen && styles.cardCompact]}>
        {showIcon && (
          <View style={[styles.iconWrap, isSmallScreen && styles.iconWrapCompact]}>
            <View style={styles.iconBg}>
              <Ionicons name="cash-outline" size={16} color="#7C3AED" />
            </View>
          </View>
        )}

        <View style={styles.textWrap}>
          <ThemedText style={[styles.title, isSmallScreen && styles.titleCompact]}>
            {title}{" "}
            <ThemedText style={[styles.percentage, isSmallScreen && styles.percentageCompact]}>
              {pct}
            </ThemedText>
          </ThemedText>
        </View>
      </View>
    </Container>
  );
}

/* ===========================
   Styles — modern/pixel-clean
   =========================== */
const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: "transparent", // outer container keeps layout consistent in page
  },
  wrapperCompact: {
    // shrink outer spacing for tighter layouts
  },
  pressable: {
    // prevents ripple overflow on Android within rounded card
    overflow: "hidden",
    borderRadius: 12,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    backgroundColor: "#F3EFFA", // soft lilac background
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EAE6FF",
    // subtle elevation/shadow
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: Platform.select({ ios: 0.03, android: 0.06 }),
    shadowRadius: 10,
    elevation: 3,
  },

  cardCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  iconWrap: {
    marginRight: 10,
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  iconWrapCompact: {
    width: 30,
    height: 30,
    marginRight: 8,
    borderRadius: 8,
  },

  iconBg: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F6EEFF", // lighter lilac background for icon
    justifyContent: "center",
    alignItems: "center",
  },

  textWrap: {
    flex: 1,
    minWidth: 0,
  },

  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },

  titleCompact: {
    fontSize: 13,
  },

  percentage: {
    color: "#6D28D9", // rich purple
    fontWeight: "800",
    fontSize: 14,
  },

  percentageCompact: {
    fontSize: 13,
  },
});
