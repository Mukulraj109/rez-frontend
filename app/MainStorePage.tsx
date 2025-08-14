// MainStorePage.tsx
import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
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
import AboutModal from "@/components/AboutModal";
import WalkInDealsModal from "@/components/WalkInDealsModal";
import ReviewModal from "@/components/ReviewModal";
import { mockReviews, mockRatingBreakdown, mockReviewStats } from "@/utils/mock-reviews-data";

export default function MainStorePage({ productId, initialProduct }: MainStorePageProps = {}) {
  const router = useRouter();
  const [screenData, setScreenData] = useState(Dimensions.get("window"));
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const HORIZONTAL_PADDING = screenData.width < 375 ? 12 : screenData.width > 768 ? 24 : 16;

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        setScreenData(window);
      }, 100);
    });

    return () => {
      subscription?.remove();
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  const [activeTab, setActiveTab] = useState<TabKey>("deals");
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showDealsModal, setShowDealsModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

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
      Alert.alert(
        next ? "Added to Favorites" : "Removed from Favorites",
        `${productData.title} ${next ? "added to" : "removed from"} favorites.`
      );
      return next;
    });
  }, [productData.title]);

  // FIX: Allow reopening modals even if tab is already active
  const handleTabChange = useCallback((tab: TabKey) => {
    setActiveTab(tab);

    if (tab === "about") {
      setShowAboutModal(true);
    } else if (tab === "deals") {
      setShowDealsModal(true);
    } else if (tab === "reviews") {
      setShowReviewModal(true);
    }
  }, []);

  const handleCloseAboutModal = useCallback(() => setShowAboutModal(false), []);
  const handleCloseDealsModal = useCallback(() => setShowDealsModal(false), []);
  const handleCloseReviewModal = useCallback(() => setShowReviewModal(false), []);

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

  useEffect(() => {
    if (!error) return;
    const id = setTimeout(() => setError(null), 4500);
    return () => clearTimeout(id);
  }, [error]);

  const styles = useMemo(() => createStyles(HORIZONTAL_PADDING, screenData), [HORIZONTAL_PADDING, screenData]);

  return (
    <ThemedView style={styles.page}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />

      <LinearGradient colors={["#7C3AED", "#8B5CF6"]} style={styles.headerGradient}>
        <MainStoreHeader storeName={productData.storeName} onBack={handleBackPress} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

        <View style={styles.tabsContainer}>
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </View>

        <View style={styles.sectionCard}>
          <ProductDetails
            title={productData.title}
            description={productData.description}
            location={productData.location}
            distance={productData.distance}
            isOpen={productData.isOpen}
          />
        </View>

        <View style={styles.cashbackFullWidth}>
          <CashbackOffer percentage={productData.cashbackPercentage} />
        </View>

        <View style={styles.sectionCard}>
          <UGCSection onViewAllPress={handleViewAllPress} onImagePress={handleImagePress} />
        </View>
      </ScrollView>

      <View style={styles.fixedBottom}>
        <VisitStoreButton onPress={handleVisitStorePress} loading={isLoading} disabled={!!error} />
      </View>

      {error && (
        <View style={styles.errorToast}>
          <TouchableOpacity onPress={() => setError(null)} activeOpacity={0.8}>
            <View style={styles.errorInner}>
              <View style={styles.errorDot} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.errorText as any}>{error}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <AboutModal
        visible={showAboutModal}
        onClose={handleCloseAboutModal}
        storeData={{
          name: productData.storeName,
          establishedYear: 2020,
          address: {
            doorNo: "40A",
            floor: "1st floor",
            street: "5th A Main Rd",
            area: "H Block, HBR Layout",
            city: "Bengaluru",
            state: "Karnataka",
            pinCode: "560043",
          },
          isOpen: productData.isOpen,
          categories: ["Boys", "Girls", "Personal items", "Gift cards", "Loyalty program"],
          hours: [
            { day: "Monday", time: "10:00 AM - 6:00 PM" },
            { day: "Tuesday", time: "10:00 AM - 6:00 PM" },
            { day: "Wednesday", time: "10:00 AM - 6:00 PM" },
            { day: "Thursday", time: "10:00 AM - 6:00 PM" },
            { day: "Friday", time: "10:00 AM - 6:00 PM" },
            { day: "Saturday", time: "10:00 AM - 6:00 PM" },
            { day: "Sunday", time: "Closed" },
          ],
        }}
      />

      <WalkInDealsModal visible={showDealsModal} onClose={handleCloseDealsModal} storeId={productData.storeId} />

      <ReviewModal
        visible={showReviewModal}
        onClose={handleCloseReviewModal}
        storeName={productData.storeName}
        storeId={productData.storeId}
        averageRating={mockReviewStats.averageRating}
        totalReviews={mockReviewStats.totalReviews}
        ratingBreakdown={mockRatingBreakdown}
        reviews={mockReviews}
      />
    </ThemedView>
  );
}

const createStyles = (HORIZONTAL_PADDING: number, screenData: { width: number; height: number }) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    headerGradient: {
      paddingBottom: 8,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      overflow: "hidden",
      shadowColor: "#7C3AED",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
    scrollContent: {
      paddingBottom: 100,
      paddingTop: 16,
    },
    imageSection: {
      paddingHorizontal: HORIZONTAL_PADDING,
      paddingTop: 16,
      paddingBottom: 16,
    },
    imageCard: {
      backgroundColor: "#fff",
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24,
      elevation: 10,
      padding: 12,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.8)",
    },
    tabsContainer: {
      marginTop: 16,
      marginHorizontal: HORIZONTAL_PADDING,
      marginBottom: 8,
    },
    sectionCard: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 16,
      backgroundColor: "#fff",
      borderRadius: 18,
      paddingVertical: 16,
      paddingHorizontal: 16,
    },
    cashbackFullWidth: {
      marginHorizontal: HORIZONTAL_PADDING,
      marginTop: 16,
      paddingVertical: 18,
      paddingHorizontal: 20,
      borderRadius: 18,
    },
    fixedBottom: {
      position: "absolute",
      left: HORIZONTAL_PADDING,
      right: HORIZONTAL_PADDING,
      bottom: Platform.OS === "ios" ? 34 : 16,
    },
    errorToast: {
      position: "absolute",
      left: HORIZONTAL_PADDING + 4,
      right: HORIZONTAL_PADDING + 4,
      top: Platform.OS === "ios" ? 60 : 44,
    },
    errorInner: {
      backgroundColor: "#FEF2F2",
      borderLeftWidth: 6,
      borderLeftColor: "#EF4444",
      padding: 16,
      borderRadius: 16,
      flexDirection: "row",
      alignItems: "center",
    },
    errorDot: {
      width: 12,
      height: 12,
      borderRadius: 8,
      backgroundColor: "#EF4444",
    },
    errorText: {
      color: "#991B1B",
      fontSize: 14,
      fontWeight: "600",
    },
  });
