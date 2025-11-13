import React from "react";
import { View, TouchableOpacity, StyleSheet, ViewStyle, TextStyle, Linking, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";

interface ActionButtonProps {
  label: string;
  icon: string;
}

interface Section2Props {
  dynamicData?: {
    store?: {
      phone?: string;
      contact?: string;
      location?: {
        lat?: number;
        lng?: number;
        address?: string;
      };
    };
    id?: string;
    _id?: string;
  } | null;
  cardType?: string;
}

const actions: ActionButtonProps[] = [
  { label: "Call", icon: "📞" },
  { label: "Product", icon: "📦" },
  { label: "Location", icon: "📍" },
];

export default function Section2({ dynamicData, cardType }: Section2Props){
  const router = useRouter();

  const handleCall = async () => {
    try {
      const phoneNumber = dynamicData?.store?.phone || dynamicData?.store?.contact;
      if (!phoneNumber) {
        Alert.alert('No Phone Number', 'Store contact information is not available');
        return;
      }

      const url = `tel:${phoneNumber}`;
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make phone calls on this device');
      }
    } catch (error) {
      console.error('Call error:', error);
      Alert.alert('Error', 'Unable to initiate call');
    }
  };

  const handleProduct = () => {
    try {
      const productId = dynamicData?.id || dynamicData?._id;
      if (!productId) {
        Alert.alert('Error', 'Product information not available');
        return;
      }

      // Navigate to product details or product list
      router.push({
        pathname: '/ProductPage',
        params: {
          cardId: productId,
          cardType: cardType || 'product'
        }
      } as any);
    } catch (error) {
      console.error('Product navigation error:', error);
      Alert.alert('Error', 'Unable to view product details');
    }
  };

  const handleLocation = async () => {
    try {
      const location = dynamicData?.store?.location;
      if (!location) {
        Alert.alert('No Location', 'Store location information is not available');
        return;
      }

      const { lat, lng, address } = location;
      let url: string;

      if (lat && lng) {
        // Open in maps app with coordinates
        url = `geo:${lat},${lng}?q=${lat},${lng}(Store)`;
      } else if (address) {
        // Open with address
        url = `geo:0,0?q=${encodeURIComponent(address)}`;
      } else {
        Alert.alert('No Location', 'Store location details are incomplete');
        return;
      }

      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        // Fallback to Google Maps web
        const mapsUrl = lat && lng
          ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address || '')}`;
        await Linking.openURL(mapsUrl);
      }
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Unable to open location');
    }
  };

  const getHandler = (label: string) => {
    switch (label) {
      case 'Call':
        return handleCall;
      case 'Product':
        return handleProduct;
      case 'Location':
        return handleLocation;
      default:
        return () => {};
    }
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="region"
      accessibilityLabel="Store action buttons"
    >
      <View style={styles.buttonRow}>
        {actions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.button}
            activeOpacity={0.8}
            onPress={getHandler(action.label)}
            accessibilityRole="button"
            accessibilityLabel={`${action.label} store`}
            accessibilityHint={`Double tap to ${action.label.toLowerCase()} this store`}
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
