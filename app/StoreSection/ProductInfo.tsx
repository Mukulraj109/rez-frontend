// ProductScreen.jsx (or .tsx if using TypeScript)
// Replace your current ProductScreen actionButtons section with this full component if desired.

import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Animated,
  Easing,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import useRecommendations from "@/hooks/useRecommendations";
import SimilarProducts from "@/components/products/SimilarProducts";
import FrequentlyBoughtTogether from "@/components/products/FrequentlyBoughtTogether";
import BundleDeals from "@/components/products/BundleDeals";

interface ProductInfoProps {
  dynamicData?: {
    title?: string;
    description?: string;
    price?: number;
    merchant?: string;
    category?: string;
    section?: string;
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function ProductScreen({ dynamicData, cardType }: ProductInfoProps) {
  const router = useRouter();
  const [active, setActive] = useState("visit"); // 'visit' | 'book'
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidthRef = useRef(0);
  const { width: screenW } = useWindowDimensions();

  // Use dynamic data if available, otherwise use defaults
  const productTitle = dynamicData?.title || "Premium Product";
  const productDescription = dynamicData?.description || "High-quality product with exceptional features and benefits";

  // Safely handle price with proper type checking
  const rawPrice = dynamicData?.price;
  const productPrice = typeof rawPrice === 'number' && !isNaN(rawPrice) ? rawPrice : 999;

  // Safely handle rating with proper type checking
  const rawRating = dynamicData?.rating;
  const rating = typeof rawRating === 'number' && !isNaN(rawRating) ? rawRating : 4.5;

  const merchantName = dynamicData?.merchant || "Premium Store";
  const category = dynamicData?.category || "Featured";

  // Get product ID from dynamicData or generate a dummy ID for testing
  const productId = dynamicData?.id || dynamicData?._id || "sample-product-id";

  // Use recommendations hook
  const {
    similar,
    frequentlyBought,
    bundles,
    loading: recommendationsLoading
  } = useRecommendations({
    productId,
    autoFetch: true,
    trackView: true
  });

  // Debug logging
  console.log('🛍️ [PRODUCT INFO] Component received:', {
    dynamicData,
    productPrice,
    rating,
    productTitle,
    merchantName,
    productId,
    recommendationsLoading
  });

  const onContainerLayout = (e:any) => {
    const w = e.nativeEvent.layout.width;
    containerWidthRef.current = w;
    // ensure slider initial position matches active
    const half = w / 2;
    translateX.setValue(active === "visit" ? 0 : half);
  };

  const animateTo = (toValue:any) => {
    Animated.timing(translateX, {
      toValue,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const onStoreVisitPress = () => {
    if (active === "visit") return;
    setActive("visit");
    const half = containerWidthRef.current / 2;
    animateTo(0);
    // TODO: replace with real action (open store-visit flow)
    console.log("STORE VISIT pressed");
  };

  const onBookNowPress = () => {
    if (active === "book") return;
    setActive("book");
    const half = containerWidthRef.current / 2;
    animateTo(half);
    // TODO: replace with real action (open booking flow)
    console.log("BOOK NOW pressed");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 5 }}>
        {/* --- TOP PRODUCT IMAGE & INFO (kept simple) --- */}
      

        <View style={styles.infoContainer}>
          <Text style={styles.title}>{productTitle}</Text>
          <Text style={styles.description}>
            {productDescription}
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{productPrice}</Text>
            {/* Show original price if there's a discount */}
            {dynamicData?.originalPrice?.original && dynamicData.originalPrice.original > productPrice && (
              <Text style={styles.originalPrice}>₹{dynamicData.originalPrice.original}</Text>
            )}
            {/* Show discount percentage */}
            {dynamicData?.originalPrice?.discount && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{dynamicData.originalPrice.discount}% OFF</Text>
              </View>
            )}
          </View>
          
          {/* Dynamic availability and location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#7C3AED" />
            <Text style={styles.locationText}>
              {dynamicData?.location || "0.7 Km, BTM"}
            </Text>
            <View style={styles.openBadge}>
              <Text style={styles.openText}>
                • {dynamicData?.availabilityStatus === 'in_stock' ? 'in stock' : 'open'}
              </Text>
            </View>
          </View>

          {/* rating/review section */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>
              {dynamicData?.originalRating?.count || 300} reviews
            </Text>
          </View>

          {/* Enhanced review CTA card */}
          <TouchableOpacity 
            style={styles.reviewCTACard} 
            onPress={() => router.push('/ReviewPage')}
            activeOpacity={0.8}
          >
            <View style={styles.reviewCardContent}>
              <View style={styles.reviewTextSection}>
                <View style={styles.reviewIconWrapper}>
                  <Ionicons name="create-outline" size={18} color="#8B5CF6" />
                </View>
                <View style={styles.reviewTextContent}>
                  <Text style={styles.reviewMainText}>Write a review</Text>
                  <Text style={styles.reviewSubText}>
                    Earn {dynamicData?.cashback?.percentage || 10}% cashback instantly
                  </Text>
                </View>
              </View>
              <View style={styles.cashbackBadge}>
                <Ionicons name="wallet-outline" size={16} color="#10B981" />
                <Text style={styles.cashbackText}>
                  ₹{dynamicData?.cashback?.maxAmount || 220}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.peopleBought}>
            <Text style={styles.peopleNumber}>1200</Text>
            <View style={styles.avatarGroup}>
              {["#ff6b6b", "#4ecdc4", "#3b82f6", "#f9ca24"].map((color, i) => (
                <LinearGradient
                  key={i}
                  colors={[color, color]}
                  style={[styles.avatar, { marginLeft: i === 0 ? 0 : -8 }]}
                />
              ))}
            </View>
            <Text style={styles.peopleText}>People brought today</Text>
          </View>

          {/* ---------- Segmented Action Buttons (NEW) ---------- */}
          <View onLayout={onContainerLayout} style={styles.segmentContainer}>
            {/* sliding indicator */}
            <Animated.View
              pointerEvents="none"
              style={[
                styles.slider,
                {
                  transform: [{ translateX }],
                },
              ]}
            >
              <LinearGradient
                colors={["#8B5CF6", "#6D28D9"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sliderGradient}
              />
            </Animated.View>

            {/* left button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.segmentButton}
              onPress={onStoreVisitPress}
            >
              <View style={styles.segmentContent}>
                <Ionicons name="storefront" size={16} color={active === "visit" ? "#fff" : "#7C3AED"} />
                <Text style={[styles.segmentText, active === "visit" ? styles.segmentTextActive : styles.segmentTextInactive]}>
                  STORE VISIT
                </Text>
              </View>
            </TouchableOpacity>

            {/* right button */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.segmentButton}
              onPress={onBookNowPress}
            >
              <View style={styles.segmentContent}>
                <Ionicons name="calendar-outline" size={16} color={active === "book" ? "#fff" : "#7C3AED"} />
                <Text style={[styles.segmentText, active === "book" ? styles.segmentTextActive : styles.segmentTextInactive]}>
                  Book Now
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* small spacing */}
        </View>

        {/* Recommendation Sections */}

        {/* Similar Products Section */}
        <SimilarProducts
          similarProducts={similar}
          loading={recommendationsLoading}
          onProductPress={(productId) => {
            console.log('Navigate to product:', productId);
            // Add navigation logic here
          }}
        />

        {/* Frequently Bought Together Section */}
        <FrequentlyBoughtTogether
          bundles={frequentlyBought}
          loading={recommendationsLoading}
          onAddToCart={(products) => {
            console.log('Add bundle to cart:', products);
            // Add to cart logic here
          }}
          onProductPress={(productId) => {
            console.log('Navigate to product:', productId);
            // Add navigation logic here
          }}
        />

        {/* Bundle Deals Section */}
        <BundleDeals
          bundles={bundles}
          loading={recommendationsLoading}
          onAddToCart={(products) => {
            console.log('Add bundle to cart:', products);
            // Add to cart logic here
          }}
          onProductPress={(productId) => {
            console.log('Navigate to product:', productId);
            // Add navigation logic here
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  infoContainer: { padding: 16, paddingTop: 18 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 6 },
  description: { fontSize: 14, color: "#555", marginBottom: 12 },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  price: { fontSize: 24, fontWeight: "800", color: "#7C3AED" },
  originalPrice: { 
    fontSize: 18, fontWeight: "500", color: "#999", 
    textDecorationLine: "line-through", marginLeft: 8 
  },
  discountBadge: {
    backgroundColor: "#EF4444", paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6, marginLeft: 8
  },
  discountText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  locationRow: { flexDirection: "row", alignItems: "center",padding: 10 },
  locationText: { fontSize: 13, marginLeft: 6, color: "#555" },
  openBadge: {
    marginLeft: 8,
    backgroundColor: "#16A34A",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  openText: { color: "#fff", fontSize: 12 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  ratingText: { marginLeft: 6, fontWeight: "700" },
  reviewCount: { marginLeft: 12, fontWeight: "600", color: "#6B7280", fontSize: 14 },
  
  // Enhanced review CTA card styles
  reviewCTACard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginVertical: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  reviewCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  reviewTextSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reviewIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F0FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  reviewTextContent: {
    flex: 1,
  },
  reviewMainText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 2,
  },
  reviewSubText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "500",
  },
  cashbackBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  cashbackText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#10B981",
    marginLeft: 4,
  },
  peopleBought: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 16,
    marginVertical: 16,
  },
  peopleNumber: { fontSize: 16, fontWeight: "800" },
  avatarGroup: { flexDirection: "row", marginLeft: 8 },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#fff" },
  peopleText: { marginLeft: 8, color: "#555" },

  /* Segmented control styles */
  segmentContainer: {
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "#E6E0FF",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  slider: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "50%", // slider occupies half
    borderRadius: 28,
  },
  sliderGradient: {
    flex: 1,
  
    // small inset so it looks like half pill (optional)
    margin: 4,
    borderRadius: 24,
  },
  segmentButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  segmentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  segmentText: {
    marginLeft: 8,
    fontWeight: "700",
    fontSize: 15,
    letterSpacing: 0.3,
  },
  segmentTextActive: {
    color: "#fff",
  },
  segmentTextInactive: {
    color: "#6D28D9",
  },
});
