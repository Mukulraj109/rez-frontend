import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface ActionButtonProps {
  label: string;
  icon: string;
}

const actions: ActionButtonProps[] = [
  { label: "Call", icon: "📞" },
  { label: "Product", icon: "📦" },
  { label: "Location", icon: "📍" },
];

export default function Section2(){
  return (
    <View style={styles.container}>
      <View style={styles.buttonRow}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.buttonText}>
              {action.icon} {action.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface Styles {
  container: ViewStyle;
  buttonRow: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#6c63ff",
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#6c63ff",
  },
});
