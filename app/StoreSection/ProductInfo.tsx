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
import { useLocation } from "@/contexts/LocationContext";

// Haversine formula for distance calculation between two coordinates
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
}

interface StoreLocation {
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: [number, number]; // [longitude, latitude]
  deliveryRadius?: number;
}

interface ProductInfoProps {
  dynamicData?: {
    title?: string;
    description?: string;
    price?: number;
    merchant?: string;
    category?: string;
    section?: string;
    productType?: 'product' | 'service';
    store?: {
      _id?: string;
      id?: string;
      name?: string;
      logo?: string;
      location?: StoreLocation;
      operationalInfo?: {
        deliveryTime?: string;
      };
      ratings?: {
        average?: number;
        count?: number;
      };
    };
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function ProductScreen({ dynamicData, cardType }: ProductInfoProps) {
  const router = useRouter();
  const { state: locationState } = useLocation();
  const [active, setActive] = useState("visit"); // 'visit' | 'book'
  const translateX = useRef(new Animated.Value(0)).current;
  const containerWidthRef = useRef(0);
  const { width: screenW } = useWindowDimensions();

  // Calculate distance from user to store
  const getDistanceText = () => {
    const storeCoords = dynamicData?.store?.location?.coordinates;
    const userCoords = locationState.currentLocation?.coordinates;

    if (storeCoords && storeCoords.length === 2 && userCoords) {
      const distance = calculateDistance(
        userCoords.latitude,
        userCoords.longitude,
        storeCoords[1], // latitude (MongoDB stores as [lng, lat])
        storeCoords[0]  // longitude
      );
      return `${distance} km`;
    }
    return null;
  };

  const distanceText = getDistanceText();

  // Use dynamic data if available, show loading state if not
  const productTitle = dynamicData?.title || "Loading...";
  const productDescription = dynamicData?.description || "Loading product information...";

  // Safely handle price with proper type checking
  const rawPrice = dynamicData?.price;
  const productPrice = typeof rawPrice === 'number' && !isNaN(rawPrice) ? rawPrice : 0;

  // Safely handle rating with proper type checking
  const rawRating = dynamicData?.rating;
  const rating = typeof rawRating === 'number' && !isNaN(rawRating) ? rawRating : 0;

  const merchantName = dynamicData?.merchant || "Loading...";
  const category = dynamicData?.category || "Loading...";

  // Get product ID from dynamicData - this should be the real product ID from navigation
  const productId = dynamicData?.id || dynamicData?._id;

  // Enable recommendations with trackView disabled to prevent infinite loops
  const {
    similar,
    frequentlyBought,
    bundles,
    loading: recommendationsLoading
  } = useRecommendations({
    productId: productId || '',
    autoFetch: !!productId,
    trackView: false  // Disable view tracking to prevent infinite API calls
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
    
    // Navigate to MainStorePage with store data
    if (dynamicData?.store || dynamicData?.merchant) {
      const storeData = {
        id: dynamicData.store?._id || dynamicData.store?.id || dynamicData.storeId || '',
        name: dynamicData.store?.name || dynamicData.merchant || 'Store',
        title: dynamicData.store?.name || dynamicData.merchant || 'Store',
        description: dynamicData.store?.description || '',
        logo: dynamicData.store?.logo || '',
        banner: dynamicData.store?.banner || '',
        rating: dynamicData.store?.ratings?.average || 0,
        ratingCount: dynamicData.store?.ratings?.count || 0,
        category: dynamicData.category || '',
        location: dynamicData.store?.location || null,
        deliveryTime: dynamicData.store?.operationalInfo?.deliveryTime || '30-45 mins',
        minimumOrder: dynamicData.store?.operationalInfo?.minimumOrder || 0,
      };

      // Navigate to MainStorePage with store data as query params
      router.push({
        pathname: '/MainStorePage',
        params: {
          storeId: storeData.id,
          storeData: JSON.stringify(storeData)
        }
      } as any);
    }
  };

  const onBookNowPress = () => {
    if (active === "book") return;
    setActive("book");
    const half = containerWidthRef.current / 2;
    animateTo(half);
    // TODO: Implement booking flow
  };

  // If no productId, show loading state instead of returning null (to maintain hooks order)
  if (!productId) {
    return (
      <View style={styles.container}>
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Loading...</Text>
          <Text style={styles.description}>Loading product information...</Text>
        </View>
      </View>
    );
  }

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
            {distanceText ? (
              <Text style={styles.distanceText}>{distanceText}</Text>
            ) : null}
            <Text style={styles.locationText}>
              {(() => {
                // Get location text from store or product
                const storeLocation = dynamicData?.store?.location;
                if (storeLocation?.address) {
                  return storeLocation.city && storeLocation.address !== storeLocation.city
                    ? `${storeLocation.address}, ${storeLocation.city}`
                    : storeLocation.address;
                }
                if (storeLocation?.city) {
                  return storeLocation.city;
                }
                // Fallback to product location
                if (typeof dynamicData?.location === 'string') {
                  return dynamicData.location;
                }
                if (typeof dynamicData?.location === 'object' && dynamicData.location) {
                  return dynamicData.location.address || dynamicData.location.city || "Location not available";
                }
                return "Location not available";
              })()}
            </Text>
            {dynamicData?.store ? (
              <View style={styles.openBadge}>
                <Text style={styles.openText}>
                  {dynamicData.availabilityStatus === 'in_stock' || dynamicData.availabilityStatus === 'low_stock' ? '• in stock' : '• available'}
                </Text>
              </View>
            ) : null}
            {(dynamicData?.computedDelivery || dynamicData?.store?.operationalInfo?.deliveryTime || dynamicData?.deliveryInfo?.estimatedDays) ? (
              <View style={styles.deliveryTimeRow}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={[styles.locationText, { marginLeft: 4 }]}>
                  {dynamicData?.computedDelivery || dynamicData?.store?.operationalInfo?.deliveryTime || dynamicData?.deliveryInfo?.estimatedDays}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Store Visit Card - For Products */}
          {dynamicData?.productType === 'product' && dynamicData?.store && (
            <TouchableOpacity
              style={styles.storeVisitCard}
              onPress={() => {
                const storeId = dynamicData?.store?.id || dynamicData?.store?._id || dynamicData?.storeId;
                if (storeId) {

                  router.push(`/MainStorePage?storeId=${storeId}`);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={styles.storeVisitContent}>
                <Ionicons name="storefront" size={18} color="#8B5CF6" />
                <View style={styles.storeVisitText}>
                  <Text style={styles.storeVisitLabel}>Visit Store</Text>
                  <Text style={styles.storeVisitName}>{dynamicData.store.name || dynamicData.merchant || 'Store'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
            </TouchableOpacity>
          )}

          {/* rating/review section */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#FBBF24" />
              <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
            </View>
            <Text style={styles.reviewCount}>
              {dynamicData?.ratings?.count || dynamicData?.originalRating?.count || 0} reviews
            </Text>
          </View>

          {/* Enhanced review CTA card */}
          <TouchableOpacity
            style={styles.reviewCTACard}
            onPress={() => {
              // Extract cashback values with safe fallback
              const getCashbackPercentage = () => {
                return dynamicData?.cashback?.percentage ||
                       dynamicData?.computedCashback?.percentage ||
                       dynamicData?.analytics?.cashback?.percentage ||
                       0;
              };

              const getCashbackAmount = () => {
                return dynamicData?.cashback?.maxAmount ||
                       dynamicData?.cashback?.amount ||
                       dynamicData?.computedCashback?.amount ||
                       dynamicData?.analytics?.cashback?.amount ||
                       0;
              };

              const cashbackPercentage = getCashbackPercentage();
              const cashbackAmount = getCashbackAmount();

              // Pass product data to ReviewPage
              router.push({
                pathname: '/ReviewPage',
                params: {
                  productId: productId,
                  productTitle: productTitle,
                  productImage: dynamicData?.image || dynamicData?.images?.[0] || '',
                  productPrice: productPrice,
                  cashbackPercentage: cashbackPercentage,
                  cashbackAmount: cashbackAmount,
                }
              } as any);
            }}
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
                    Earn {dynamicData?.cashback?.percentage || dynamicData?.computedCashback?.percentage || dynamicData?.analytics?.cashback?.percentage || 0}% cashback instantly
                  </Text>
                </View>
              </View>
              <View style={styles.cashbackBadge}>
                <Ionicons name="wallet-outline" size={16} color="#10B981" />
                <Text style={styles.cashbackText}>
                  ₹{dynamicData?.cashback?.maxAmount || dynamicData?.cashback?.amount || dynamicData?.computedCashback?.amount || dynamicData?.analytics?.cashback?.amount || 0}
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          {((dynamicData?.analytics?.todayPurchases || dynamicData?.todayPurchases) > 0) && (
            <View style={styles.peopleBought}>
              <Text style={styles.peopleNumber}>{dynamicData?.analytics?.todayPurchases || dynamicData?.todayPurchases || 0}</Text>
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
          )}

          {/* ---------- Segmented Action Buttons (Only for Services) ---------- */}
          {dynamicData?.productType === 'service' && (
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
          )}

          {/* small spacing */}
        </View>

        {/* Recommendation Sections */}

        {/* Similar Products Section */}
        <SimilarProducts
          similarProducts={similar}
          loading={recommendationsLoading}
          onProductPress={(productId) => {
            router.push({
              pathname: '/ProductPage',
              params: { cardId: productId, cardType: 'product' }
            } as any);
          }}
        />

        {/* Frequently Bought Together Section */}
        <FrequentlyBoughtTogether
          bundles={frequentlyBought}
          loading={recommendationsLoading}
          onAddToCart={(products) => {
            // TODO: Implement bundle add to cart
          }}
          onProductPress={(productId) => {
            router.push({
              pathname: '/ProductPage',
              params: { cardId: productId, cardType: 'product' }
            } as any);
          }}
        />

        {/* Bundle Deals Section */}
        <BundleDeals
          bundles={bundles}
          loading={recommendationsLoading}
          onAddToCart={(products) => {
            // TODO: Implement bundle add to cart
          }}
          onProductPress={(productId) => {
            router.push({
              pathname: '/ProductPage',
              params: { cardId: productId, cardType: 'product' }
            } as any);
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
  locationRow: { flexDirection: "row", alignItems: "center", padding: 10, flexWrap: "wrap" },
  locationText: { fontSize: 13, marginLeft: 6, color: "#555", flexShrink: 1 },
  distanceText: { fontSize: 14, marginLeft: 6, color: "#7C3AED", fontWeight: "700" },
  deliveryTimeRow: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
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

  // Store Visit Card styles
  storeVisitCard: {
    backgroundColor: "#F9F5FF",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E9D5FF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  storeVisitContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  storeVisitText: {
    flexDirection: "column",
  },
  storeVisitLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#8B5CF6",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  storeVisitName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },

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
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  peopleNumber: { fontSize: 17, fontWeight: "800", color: "#111827" },
  avatarGroup: { flexDirection: "row", marginLeft: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: "#fff" },
  peopleText: { marginLeft: 10, color: "#6B7280", fontSize: 14, fontWeight: "500" },

  /* Segmented control styles */
  segmentContainer: {
    height: 58,
    borderRadius: 30,
    borderWidth: 1.5,
    borderColor: "#E6E0FF",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
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
