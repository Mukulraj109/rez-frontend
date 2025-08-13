// PayBillCard.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TextInput,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type PayBillCardProps = {
  initialAmount?: string;
  onPay?: (amount: string) => void;
  saveBadgeText?: string;
};

export default function PayBillCard({
  initialAmount = "",
  onPay,
  saveBadgeText = "Save 20%",
}: PayBillCardProps) {
  const [amount, setAmount] = useState<string>(initialAmount);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const { width } = Dimensions.get("window");
  const responsivePadding = width < 360 ? 14 : 18;
  const responsiveMargin = width < 360 ? 12 : 16;

  const handlePay = () => {
    const clean = amount.trim();
    if (!clean) {
      console.warn("Please enter an amount");
      return;
    }
    onPay?.(clean);
    console.log("Paying amount:", clean);
  };

  const handleSubmitEditing = (
    _e: NativeSyntheticEvent<TextInputSubmitEditingEventData>
  ) => {
    handlePay();
  };

  return (
    <View
      style={[
        styles.container,
        { padding: responsivePadding, marginHorizontal: responsiveMargin },
      ]}
    >
      {/* Save badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{saveBadgeText}</Text>
      </View>

      {/* Header: icon + title */}
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text-outline" size={20} color="#6b21a8" />
        </View>
        <Text style={styles.title}>Pay your bill</Text>
      </View>

      {/* Input row: pill input (loses border when focused) + Pay button */}
      <View style={styles.row}>
        <View
          style={[
            styles.inputPill,
            // remove border when focused
            { borderWidth: isFocused ? 0 : 1, borderColor: "#E6E6F0" },
          ]}
        >
          <TextInput
            value={amount}
            onChangeText={(t) => {
              const sanitized = t.replace(/[^0-9]/g, "");
              setAmount(sanitized);
            }}
            placeholder="Enter the amount"
            placeholderTextColor="#9CA3AF"
            keyboardType={Platform.OS === "ios" ? "number-pad" : "numeric"}
            returnKeyType="done"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSubmitEditing}
            style={[
              styles.input,
              Platform.OS === "web" && ({ outline: "none" } as any),
            ]}
            accessibilityLabel="Amount input"
            underlineColorAndroid="transparent"
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
            selectionColor="#7C3AED"
          />

        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handlePay}
          style={styles.payButtonWrapper}
        >
          <LinearGradient
            colors={["#8B5CF6", "#7C3AED"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Pay bill</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    backgroundColor: "#FBF8FF",
    position: "relative",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  badge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#ECEBFF",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#5B21B6",
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2D2B3A",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    // `gap` is not supported on older RN versions; margins are used instead.
  },
  inputPill: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    // border default handled inline
  },
  input: {
    fontSize: 15,
    color: "#111827",
    padding: 0,
    margin: 0,
  },
  payButtonWrapper: {
    width: 110,
    borderRadius: 12,
    overflow: "hidden",
    marginLeft: 12,
  },
  gradientButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 15,
  },
});
