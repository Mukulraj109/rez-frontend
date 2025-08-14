import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

const FashionHeader = () => {
  const router = useRouter();

  // Animations
  const fadeAnim = useSharedValue(0);
  const slideAnim = useSharedValue(-50);
  const scaleBadge = useSharedValue(0.8);

  useEffect(() => {
    fadeAnim.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
    slideAnim.value = withSpring(0, { damping: 15, stiffness: 100 });
    scaleBadge.value = withSpring(1, {
      damping: 5,
      stiffness: 200,
      mass: 0.8,
    });
  }, []);

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [{ translateY: slideAnim.value }],
  }));

  const animatedBadgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleBadge.value }],
  }));

  return (
    <LinearGradient
      colors={["#ff9a9e", "#fad0c4"]}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Animated.View style={[styles.contentWrapper, animatedHeaderStyle]}>
        {/* Top Navigation Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back" size={22} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>Fashion</Text>

          <View style={styles.rightIcons}>
            {/* Coins */}
            <TouchableOpacity style={styles.coinContainer} onPress={() => router.push('/CoinPage')}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.coinNumber}>382</Text>
            </TouchableOpacity>

            {/* Cart */}
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => router.push('/CartPage')}
            >
              <Ionicons name="bag-outline" size={20} color="white" />
            </TouchableOpacity>

            {/* Profile */}
            {/* Profile */}
<TouchableOpacity style={styles.profileWrapper}>
  <LinearGradient
    colors={["#FFD700", "#FF8C00"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.profileGradient}
  >
    <Text style={styles.profileText}>R</Text>
  </LinearGradient>
</TouchableOpacity>

          </View>
        </View>

        {/* Sale Section */}
        <View style={styles.saleContent}>
          <Text style={styles.saleTitle}>Wedding Glam in a Flash</Text>
          <Text style={styles.saleSubtitle}>SALE</Text>

          <Animated.View style={[styles.discountBadge, animatedBadgeStyle]}>
            <Text style={styles.uptoText}>UPTO</Text>
            <Text style={styles.discountText}>50%</Text>
            <Text style={styles.offText}>OFF</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: "hidden",
  },
  contentWrapper: {
    position: "relative",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "white",
    letterSpacing: 1,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  coinContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    marginLeft: 4,
  },
 profileWrapper: {
  width: 36,
  height: 36,
  borderRadius: 18,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOpacity: 0.2,
  shadowRadius: 4,
  elevation: 4,
},
profileGradient: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},
profileText: {
  fontSize: 16,
  fontWeight: "900",
  color: "#fff",
  letterSpacing: 1,
  textShadowColor: "rgba(0, 0, 0, 0.3)",
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 2,
},
  saleContent: {
    alignItems: "center",
    marginTop: 20,
  },
  saleTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "white",
    textAlign: "center",
    marginBottom: 4,
  },
  saleSubtitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "white",
    letterSpacing: 2,
    marginBottom: 12,
  },
  discountBadge: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  uptoText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  discountText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#6B21A8",
  },
  offText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
});

export default FashionHeader;
