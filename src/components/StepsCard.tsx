import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const StepsCard = () => {
  const steps = [
    {
      id: 1,
      icon: <MaterialCommunityIcons name="ticket-percent" size={24} color="#6B21A8" />,
      text: "Buy a voucher on rez app",
    },
    {
      id: 2,
      icon: <MaterialCommunityIcons name="store-outline" size={24} color="#6B21A8" />,
      text: "Buy selected items in-store",
    },
    {
      id: 3,
      icon: <MaterialCommunityIcons name="check-decagram-outline" size={24} color="#6B21A8" />,
      text: "Use vouchers at store checkout",
    },
  ];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {steps.map((step) => (
          <View key={step.id} style={styles.step}>
            <View style={styles.circle}>
              <Text style={styles.number}>{step.id}</Text>
            </View>
            <View style={{ marginBottom: 8 }}>{step.icon}</View>
            <Text style={styles.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F6F0FF",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 14,
  },
  step: {
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 8, // more breathing space
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  number: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#6B21A8",
  },
  stepText: {
    fontSize: 13,
    textAlign: "center",
    color: "#333",
    lineHeight: 18, // more vertical spacing
  },
});

export default StepsCard;
