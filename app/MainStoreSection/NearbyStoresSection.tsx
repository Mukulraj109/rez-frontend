// NearbyStoresSection.tsx - Nearby ReZ stores section
import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
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
import { storesApi } from "@/services/storesApi";

export interface NearbyStore {
  id: string;
  name: string;
  distance: string;
}

export interface NearbyStoresSectionProps {
  stores?: NearbyStore[];
  currentStoreId?: string;
  userLat?: number;
  userLng?: number;
}

const SAMPLE_STORES: NearbyStore[] = [
  { id: "1", name: "Cafe Coffee Day", distance: "450m" },
  { id: "2", name: "McDonald's", distance: "600m" },
  { id: "3", name: "Pizza Hut", distance: "750m" },
];

// Format distance to human readable string
const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
};

export default function NearbyStoresSection({
  stores: propStores,
  currentStoreId,
  userLat,
  userLng,
}: NearbyStoresSectionProps) {
  const router = useRouter();
  const [stores, setStores] = useState<NearbyStore[]>(propStores || SAMPLE_STORES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLat && userLng) {
      fetchNearbyStores();
    }
  }, [userLat, userLng, currentStoreId]);

  const fetchNearbyStores = async () => {
    if (!userLat || !userLng) return;

    try {
      setLoading(true);
      const response = await storesApi.getNearbyStores(userLat, userLng, 10, 5);

      if (response.success && response.data && response.data.length > 0) {
        // Filter out current store and format data
        const nearbyStores: NearbyStore[] = response.data
          .filter((store: any) => store._id !== currentStoreId && store.id !== currentStoreId)
          .slice(0, 3) // Limit to 3 stores
          .map((store: any) => ({
            id: store._id || store.id,
            name: store.name,
            distance: store.distance ? formatDistance(store.distance) : '~1km',
          }));

        if (nearbyStores.length > 0) {
          setStores(nearbyStores);
        }
      }
    } catch (error) {
      // Use sample data on error
    } finally {
      setLoading(false);
    }
  };

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
