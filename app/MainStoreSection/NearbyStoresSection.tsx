// NearbyStoresSection.tsx - Nearby ReZ stores section
import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { triggerImpact } from "@/utils/haptics";
import { ThemedText } from "@/components/ThemedText";
import {
  Colors,
  Spacing,
  BorderRadius,
} from "@/constants/DesignSystem";

export interface NearbyStore {
  id: string;
  name: string;
  distance: string;
}

export interface NearbyStoresSectionProps {
  stores?: NearbyStore[];
}

const SAMPLE_STORES: NearbyStore[] = [
  { id: "1", name: "Cafe Coffee Day", distance: "450m" },
  { id: "2", name: "McDonald's", distance: "600m" },
  { id: "3", name: "Pizza Hut", distance: "750m" },
];

export default function NearbyStoresSection({
  stores = SAMPLE_STORES,
}: NearbyStoresSectionProps) {
  const router = useRouter();

  const handleStorePress = (store: NearbyStore) => {
    triggerImpact('Light');
    // Navigate to the store page
    router.push(`/MainStorePage?storeId=${store.id}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <ThemedText style={styles.sectionTitle}>Nearby ReZ stores</ThemedText>

      {/* Stores List */}
      <View style={styles.storesList}>
        {stores.map((store) => (
          <TouchableOpacity
            key={store.id}
            style={styles.storeItem}
            activeOpacity={0.7}
            onPress={() => handleStorePress(store)}
            accessibilityRole="button"
            accessibilityLabel={`${store.name}, ${store.distance}`}
          >
            <ThemedText style={styles.storeName}>{store.name}</ThemedText>
            <ThemedText style={styles.storeDistance}>{store.distance}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.base,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  storesList: {
    gap: Spacing.sm,
  },
  storeItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  storeName: {
    fontSize: 15,
    color: Colors.text.primary,
  },
  storeDistance: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
});
