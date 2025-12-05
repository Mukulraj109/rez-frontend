import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  useAnimatedScrollHandler,
  runOnJS,
} from "react-native-reanimated";
import { FashionCategory } from "@/hooks/useFashionData";

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const CARD_WIDTH = 100;
const CARD_SPACING = 14; // marginRight
const CARD_TOTAL_WIDTH = CARD_WIDTH + CARD_SPACING;

interface CategoryCardProps {
  category: FashionCategory;
  index: number;
  scrollX: Animated.SharedValue<number>;
  onPress: (category: FashionCategory) => void;
}

const CategoryCard = ({ category, index, scrollX, onPress }: CategoryCardProps) => {
  // 3D Carousel Animation based on scroll position (like ProductCarousel)
  const inputRange = [
    (index - 1) * CARD_TOTAL_WIDTH,
    index * CARD_TOTAL_WIDTH,
    (index + 1) * CARD_TOTAL_WIDTH,
  ];

  const animatedStyle = useAnimatedStyle(() => {
    // Subtle scale based on scroll position
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.9, 1.05, 0.9],
      Extrapolate.CLAMP
    );

    // Subtle 3D rotation based on scroll position
    const rotateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, -20],
      Extrapolate.CLAMP
    );

    // Subtle depth effect with translateZ
    const translateZ = interpolate(
      scrollX.value,
      inputRange,
      [-30, 0, -30],
      Extrapolate.CLAMP
    );

    // Subtle vertical translation for depth
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [10, 0, 10],
      Extrapolate.CLAMP
    );

    // Opacity based on scroll position
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.7, 1, 0.7],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateY: `${rotateY}deg` },
        { translateZ },
        { translateY },
      ],
      opacity,
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    const shadowOpacity = interpolate(
      scrollX.value,
      inputRange,
      [0.1, 0.3, 0.1],
      Extrapolate.CLAMP
    );

    const shadowRadius = interpolate(
      scrollX.value,
      inputRange,
      [8, 18, 8],
      Extrapolate.CLAMP
    );

    const shadowOffsetY = interpolate(
      scrollX.value,
      inputRange,
      [2, 8, 2],
      Extrapolate.CLAMP
    );

    return {
      shadowColor: '#00C06A',
      shadowOpacity,
      shadowRadius,
      shadowOffset: {
        width: 0,
        height: shadowOffsetY,
      },
      elevation: interpolate(
        scrollX.value,
        inputRange,
        [6, 15, 6],
        Extrapolate.CLAMP
      ),
    };
  });

  // Map category names to icons and colors
  // First use icon from database, then fall back to pattern matching
  const getCategoryStyle = (category: FashionCategory) => {
    // First, check if category has icon from database
    if (category.icon) {
      // Use icon from database
      // Get gradient colors from metadata or use default based on category name
      const metadataColor = category.metadata?.color || '#00C06A';
      const gradientColors = getGradientColorsFromMetadata(metadataColor);
      
      return {
        icon: category.icon as any,
        gradientColors,
        iconColor: '#FFFFFF',
      };
    }
    
    // Fall back to pattern matching if no icon in database
    const lowerName = category.name.toLowerCase();
    
    if (lowerName.includes('men') && !lowerName.includes('women')) {
      return {
        icon: 'shirt-outline' as const,
        gradientColors: ['#4E65FF', '#92EFFD'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('women')) {
      return {
        icon: 'rose-outline' as const,
        gradientColors: ['#FF6B9D', '#FFA8D8'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('kid') || lowerName.includes('child')) {
      return {
        icon: 'happy-outline' as const,
        gradientColors: ['#FFA800', '#FFD60A'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('foot') || lowerName.includes('shoe')) {
      return {
        icon: 'footsteps-outline' as const,
        gradientColors: ['#A770EF', '#CF8BF3'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('access') || lowerName.includes('watch') || lowerName.includes('bag')) {
      return {
        icon: 'watch-outline' as const,
        gradientColors: ['#FFA800', '#FFD60A'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('sale') || lowerName.includes('offer') || lowerName.includes('discount')) {
      return {
        icon: 'pricetag-outline' as const,
        gradientColors: ['#FF6B6B', '#FF8E53'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('gift') || lowerName.includes('present')) {
      return {
        icon: 'gift-outline' as const,
        gradientColors: ['#EC4899', '#F472B6'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('fruit')) {
      return {
        icon: 'nutrition-outline' as const,
        gradientColors: ['#F59E0B', '#FBBF24'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('grocery') || lowerName.includes('grocery')) {
      return {
        icon: 'basket-outline' as const,
        gradientColors: ['#F59E0B', '#FBBF24'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('meat') || lowerName.includes('chicken') || lowerName.includes('mutton')) {
      return {
        icon: 'restaurant-outline' as const,
        gradientColors: ['#EF4444', '#F87171'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('restaurant') || lowerName.includes('food') || lowerName.includes('dining')) {
      return {
        icon: 'restaurant-outline' as const,
        gradientColors: ['#10B981', '#34D399'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('electronic') || lowerName.includes('gadget') || lowerName.includes('tech')) {
      return {
        icon: 'phone-portrait-outline' as const,
        gradientColors: ['#3B82F6', '#60A5FA'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('organic')) {
      return {
        icon: 'leaf-outline' as const,
        gradientColors: ['#10B981', '#34D399'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('medicine') || lowerName.includes('pharmacy') || lowerName.includes('health')) {
      return {
        icon: 'medical-outline' as const,
        gradientColors: ['#EF4444', '#F87171'],
        iconColor: '#FFFFFF',
      };
    }
    if (lowerName.includes('fleet') || lowerName.includes('car') || lowerName.includes('vehicle')) {
      return {
        icon: 'car-outline' as const,
        gradientColors: ['#6366F1', '#818CF8'],
        iconColor: '#FFFFFF',
      };
    }
    
    // Default
    return {
      icon: 'grid-outline' as const,
      gradientColors: ['#8B5CF6', '#A855F7'],
      iconColor: '#FFFFFF',
    };
  };

  // Helper to create gradient colors from metadata color
  const getGradientColorsFromMetadata = (color: string): [string, string] => {
    // If metadata color exists, create a gradient with a lighter/darker variant
    // For now, use the same color for both gradient stops
    // You can enhance this to generate complementary colors
    return [color, color];
  };

  const categoryStyle = getCategoryStyle(category);

  return (
    <TouchableOpacity
      onPress={() => onPress(category)}
      activeOpacity={0.9}
    >
      <Animated.View style={[styles.categoryCard, animatedStyle, shadowStyle]}>
        <LinearGradient
          colors={categoryStyle.gradientColors}
          style={styles.gradientCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          {/* Icon Container */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={categoryStyle.icon}
              size={28}
              color={categoryStyle.iconColor}
            />
          </View>
        </LinearGradient>

        <Text style={styles.categoryName} numberOfLines={1}>
          {category.name}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ProductionCategorySliderProps {
  categories: FashionCategory[];
  isLoading: boolean;
}

const ProductionCategorySlider = ({ categories, isLoading }: ProductionCategorySliderProps) => {
  const router = useRouter();
  const scrollX = useSharedValue(0);
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const isScrollingRef = useRef(false);
  const lastScrollXRef = useRef(0);

  const handleCategoryPress = (category: FashionCategory) => {
    // Navigate to category page with filter
    router.push(`/category/${category.slug || category._id}` as any);
  };

  // Create infinite loop by duplicating categories
  const getLoopCategories = () => {
    if (categories.length === 0) return [];
    
    const displayCategories = categories.slice(0, 8);
    
    // Need at least 3 items for smooth looping
    if (displayCategories.length < 3) {
      return displayCategories;
    }
    
    // Duplicate items for seamless loop: [last 3, ...original, ...first 3]
    const lastThree = displayCategories.slice(-3);
    const firstThree = displayCategories.slice(0, 3);
    
    return [...lastThree, ...displayCategories, ...firstThree];
  };

  const loopCategories = getLoopCategories();
  const originalLength = Math.min(categories.length, 8);
  const paddingHorizontal = 16; // From styles.scrollContent
  const startOffset = originalLength >= 3 ? 3 * CARD_TOTAL_WIDTH + paddingHorizontal : paddingHorizontal;

  // Handle infinite scroll looping - check on scroll end
  const handleScrollLoop = (contentOffsetX: number) => {
    if (isScrollingRef.current || loopCategories.length < 3) return;
    
    // Skip if scroll position hasn't changed much (avoid duplicate calls)
    if (Math.abs(contentOffsetX - lastScrollXRef.current) < 10) {
      return;
    }
    lastScrollXRef.current = contentOffsetX;
    
    // Calculate the real content boundaries
    const realContentStart = paddingHorizontal + (3 * CARD_TOTAL_WIDTH);
    const realContentEnd = paddingHorizontal + (3 * CARD_TOTAL_WIDTH) + (originalLength * CARD_TOTAL_WIDTH);
    const threshold = CARD_TOTAL_WIDTH * 1.5; // Threshold for jumping
    
    // If scrolled past the end (into duplicate), jump to beginning of real content
    if (contentOffsetX >= realContentEnd - threshold) {
      isScrollingRef.current = true;
      const newPosition = realContentStart;
      // Use getNode() for AnimatedScrollView if needed
      const scrollView = scrollViewRef.current as any;
      if (scrollView) {
        const scrollNode = scrollView.getNode ? scrollView.getNode() : scrollView;
        scrollNode.scrollTo({
          x: newPosition,
          animated: false,
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 200);
      }
      return;
    }
    
    // If scrolled before the beginning (into duplicate), jump to end of real content
    if (contentOffsetX <= realContentStart + threshold && startOffset > paddingHorizontal) {
      isScrollingRef.current = true;
      const newPosition = realContentEnd - CARD_TOTAL_WIDTH;
      // Use getNode() for AnimatedScrollView if needed
      const scrollView = scrollViewRef.current as any;
      if (scrollView) {
        const scrollNode = scrollView.getNode ? scrollView.getNode() : scrollView;
        scrollNode.scrollTo({
          x: newPosition,
          animated: false,
        });
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 200);
      }
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  const onScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    handleScrollLoop(contentOffsetX);
  };

  // Initialize scroll position to start of real content
  useEffect(() => {
    if (loopCategories.length >= 3 && startOffset > paddingHorizontal) {
      // Use a longer delay to ensure component is mounted
      const timer = setTimeout(() => {
        (scrollViewRef.current as any)?.scrollTo({
          x: startOffset,
          animated: false,
        });
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [loopCategories.length, startOffset, paddingHorizontal]);

  // Loading skeleton
  if (isLoading && categories.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
        </View>
      </View>
    );
  }

  // Empty state
  if (categories.length === 0) {
    return null; // Don't show anything if no categories
  }

  return (
    <View style={styles.container}>
      <AnimatedScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={scrollHandler}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        decelerationRate="fast"
        pagingEnabled={false}
      >
        {loopCategories.map((category, index) => (
          <CategoryCard
            key={`${category._id}-${index}`}
            category={category}
            index={index}
            scrollX={scrollX}
            onPress={handleCategoryPress}
          />
        ))}
      </AnimatedScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  categoryCard: {
    alignItems: "center",
    marginRight: 14,
    width: 85,
  },
  gradientCard: {
    width: 85,
    height: 85,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    // Base shadow will be enhanced by animated shadowStyle
    shadowColor: "#8B5CF6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.25)",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    top: -15,
    right: -15,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    bottom: -8,
    left: -8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.4)",
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2D3748",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  // Loading states
  loadingContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ProductionCategorySlider;

