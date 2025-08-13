// MainStorePage.tsx
import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Dimensions,
  Platform,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/ThemedView";
import {
  MainStoreHeader,
  ProductDisplay,
  TabNavigation,
  TabKey,
  ProductDetails,
  CashbackOffer,
  UGCSection,
  VisitStoreButton,
} from "./MainStoreSection";
import { MainStoreProduct, MainStorePageProps, CartItemFromProduct } from "@/types/mainstore";

const { width } = Dimensions.get("window");
const HORIZONTAL_PADDING = 16;
const IMAGE_SECTION_BG = "#F6F3FF";

export default function MainStorePage({ productId, initialProduct }: MainStorePageProps = {}) {
  const router = useRouter();

  // UI state
  const [activeTab, setActiveTab] = useState<TabKey>("deals");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const productData: MainStoreProduct = useMemo(
    () =>
      initialProduct || {
        id: productId || "product-001",
        title: "Little Big Comfort Tee",
        description:
          "Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric for all-day comfort and effortless style.",
        price: "₹2,199",
        location: "BTM",
        distance: "0.7 Km",
        isOpen: true,
        images: [
          { id: "1", uri: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&h=1100&fit=crop&crop=center" },
          { id: "2", uri: "https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=900&h=1100&fit=crop&crop=center" },
          { id: "3", uri: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=900&h=1100&fit=crop&crop=center" },
        ],
        cashbackPercentage: "10",
        storeName: "Reliance Trends",
        storeId: "store-001",
        category: "Fashion",
      },
    [initialProduct, productId]
  );

  // ---------- Handlers (unchanged logic) ----------
  const handleSharePress = useCallback(async () => {
    try {
      setIsLoading(true);
      await Share.share({
        message: `Check out ${productData.title} at ${productData.storeName} for ${productData.price}`,
        url: `https://store.example.com/products/${productData.id}`,
        title: productData.title,
      });
    } catch (err) {
      console.error(err);
      setError("Failed to share product.");
    } finally {
      setIsLoading(false);
    }
  }, [productData]);

  const handleFavoritePress = useCallback(() => {
    setIsFavorited((prev) => {
      const next = !prev;
      Alert.alert(next ? "Added to Favorites" : "Removed from Favorites", `${productData.title} ${next ? "added to" : "removed from"} favorites.`);
      return next;
    });
  }, [productData.title]);

  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);
  }, []);

  const handleViewAllPress = useCallback(() => {
    Alert.alert("UGC", "View all UGC");
  }, []);

  const handleImagePress = useCallback((imageId: string) => {
    Alert.alert("Image", imageId);
  }, []);

  const handleAddToCart = useCallback(() => {
    const cartItem: CartItemFromProduct = {
      id: productData.id,
      name: productData.title,
      price: parseInt(productData.price.replace("₹", "").replace(",", "")) || 0,
      image: productData.images[0]?.uri || "",
      cashback: `${productData.cashbackPercentage} cashback`,
      category: "products",
    };
    console.log("Adding to cart:", cartItem);
    Alert.alert("Added to Cart", `${productData.title} has been added to your cart.`);
  }, [productData]);

  const handleVisitStorePress = useCallback(() => {
    Alert.alert("Visit Store", `Open ${productData.storeName}`);
  }, [productData.storeName]);

  const handleBackPress = useCallback(() => router.back(), [router]);

  // Clear errors after a few seconds
  React.useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(id);
  }, [error]);

  return (
    <ThemedView style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      {/* Gradient header area — header component (user provided) will sit on top */}
      <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.headerGradient}>
        <MainStoreHeader storeName={productData.storeName} onBack={handleBackPress} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* IMAGE SECTION - subtle background and card feel */}
        <View style={styles.imageSection}>
          <View style={styles.imageCard}>
            <ProductDisplay
              images={productData.images}
              onSharePress={handleSharePress}
              onFavoritePress={handleFavoritePress}
              isFavorited={isFavorited}
            />
          </View>
        </View>

        {/* TABS - centered with soft divider */}
        <View style={styles.tabsContainer}>
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </View>

        {/* DETAILS CARD - elevated card with padding */}
        <View style={styles.sectionCard}>
          <ProductDetails
            title={productData.title}
            description={productData.description}
            location={productData.location}
            distance={productData.distance}
            isOpen={productData.isOpen}
          />
        </View>

        {/* CASHBACK PILL in its own row */}
        <View style={styles.sectionRow}>
          <View style={styles.cashbackCard}>
            <CashbackOffer percentage={productData.cashbackPercentage} />
          </View>
        </View>

        {/* UGC - horizontal scroll inside a subtle card */}
        <View style={styles.sectionCard}>
          <UGCSection onViewAllPress={handleViewAllPress} onImagePress={handleImagePress} />
        </View>

        {/* Small bottom spacer to prevent content being hidden behind fixed button */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Visit Store - you provide component; we position it on top of the page */}
      <View style={styles.fixedBottom}>
        <VisitStoreButton onPress={handleVisitStorePress} loading={isLoading} disabled={!!error} />
      </View>

      {/* Inline error toast */}
      {error ? (
        <View style={styles.errorToast}>
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <View style={styles.errorDot} />
              <View style={{ marginLeft: 10 }}>
                <ThemedView>
                  {/* keep the same ThemedView/Text system you use */}
                  <View>
                    <Text style={styles.errorText as any}>{error}</Text>
                  </View>
                </ThemedView>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
    </ThemedView>
  );
}

/* ============================
   Styles for a modern look
   (no child components were changed)
   ============================ */
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#F7F7FB",
  },

  headerGradient: {
    paddingBottom: 6,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: "hidden",
  },

  scrollContent: {
    paddingBottom: 120, // reserve space for bottom button
    paddingTop: 12,
  },

  // Image area
  imageSection: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 12,
    backgroundColor: IMAGE_SECTION_BG,
    paddingBottom: 14,
  },
  imageCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    // soft elevation
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 6,
    padding: 10,
  },

  // Tabs container keeps tabs separated visually
  tabsContainer: {
    marginTop: 8,
    marginHorizontal: HORIZONTAL_PADDING,
    marginBottom: 6,
    backgroundColor: "transparent",
  },

  // Generic section card used for details and UGC
  sectionCard: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    // softer shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },

  sectionRow: {
    marginHorizontal: HORIZONTAL_PADDING,
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  cashbackCard: {
    backgroundColor: "#F3EFFA",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignSelf: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  // Fixed bottom
  fixedBottom: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: Platform.OS === "android" ? 18 : 26,
    zIndex: 999,
  },

  // Error toast (small)
  errorToast: {
    position: "absolute",
    left: 16,
    right: 16,
    top: Platform.OS === "ios" ? 52 : 36,
    zIndex: 1200,
  },
  errorInner: {
    backgroundColor: "#FEF3F2",
    borderLeftWidth: 4,
    borderLeftColor: "#FECACA",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  errorDot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: "#F87171",
  },
  errorText: {
    color: "#991B1B",
    fontSize: 13,
    fontWeight: "600",
  },
});
