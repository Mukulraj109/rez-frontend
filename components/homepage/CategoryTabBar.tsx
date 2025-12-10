/**
 * CategoryTabBar Component
 * Compact glassy horizontal scrollable category tabs with images
 */

import React, { useRef, useEffect, useLayoutEffect, memo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';

// Module-level variable to persist scroll position across re-renders
let persistedScrollPosition = 0;

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  deepTeal: '#00796B',
  slate: '#1F2D3D',
  coolGray: '#9AA7B2',
  mutedGray: '#8E99A4',
  white: '#FFFFFF',
};

// Category images - using local assets
const CATEGORY_IMAGES = {
  dining: require('../../assets/category-icons/FOOD-DINING/Family-restaurants.png'),
  events: require('../../assets/category-icons/ENTERTAINMENT/Live-events.png'),
  stores: require('../../assets/category-icons/Shopping/Fashion.png'),
  grocery: require('../../assets/category-icons/GROCERY-ESSENTIALS/Supermarkets.png'),
  beauty: require('../../assets/category-icons/BEAUTY-WELLNESS/Beauty-services.png'),
  health: require('../../assets/category-icons/HEALTHCARE/Pharmacy.png'),
  fashion: require('../../assets/category-icons/Shopping/Fashion.png'),
  fitness: require('../../assets/category-icons/FITNESS-SPORTS/Gyms.png'),
  education: require('../../assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  travel: require('../../assets/category-icons/TRAVEL-EXPERIENCES/Hotels.png'),
};

// Category data - connected to MainCategory pages
const CATEGORIES = [
  { id: 'dining', label: 'Dining', image: CATEGORY_IMAGES.dining, route: '/MainCategory/food-dining' },
  { id: 'events', label: 'Events', image: CATEGORY_IMAGES.events, route: '/EventsListPage' },
  { id: 'stores', label: 'Stores', image: CATEGORY_IMAGES.stores, route: '/StoreListPage' },
  { id: 'grocery', label: 'Grocery', image: CATEGORY_IMAGES.grocery, route: '/MainCategory/grocery-essentials' },
  { id: 'beauty', label: 'Beauty', image: CATEGORY_IMAGES.beauty, route: '/MainCategory/beauty-wellness' },
  { id: 'health', label: 'Health', image: CATEGORY_IMAGES.health, route: '/MainCategory/healthcare' },
  { id: 'fashion', label: 'Fashion', image: CATEGORY_IMAGES.fashion, route: '/MainCategory/fashion' },
  { id: 'fitness', label: 'Fitness', image: CATEGORY_IMAGES.fitness, route: '/MainCategory/fitness-sports' },
  { id: 'education', label: 'Education', image: CATEGORY_IMAGES.education, route: '/MainCategory/education-learning' },
  { id: 'travel', label: 'Travel', image: CATEGORY_IMAGES.travel, route: '/MainCategory/travel-experiences' },
];

interface CategoryTabBarProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  isSticky?: boolean;
  style?: any;
}

// Web component with glassy effect - using React Native components for proper image handling
const WebCategoryTabBar: React.FC<CategoryTabBarProps> = memo(({ style }) => {
  const router = useRouter();
  const pathname = usePathname();
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine active category based on current route
  const getActiveCategory = () => {
    for (const category of CATEGORIES) {
      if (pathname === category.route || pathname.startsWith(category.route)) {
        return category.id;
      }
    }
    return null; // No active category on homepage
  };

  const activeCategory = getActiveCategory();

  // Restore scroll position when component mounts
  useLayoutEffect(() => {
    if (scrollViewRef.current && persistedScrollPosition > 0) {
      scrollViewRef.current.scrollTo({ x: persistedScrollPosition, animated: false });
    }
  });

  // Track scroll position
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    persistedScrollPosition = event.nativeEvent.contentOffset.x;
  };

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    if (category.route) {
      router.push(category.route as any);
    }
  };

  return (
    <View style={[webStyles.container, style]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={webStyles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => handleCategoryClick(category)}
              style={webStyles.tabButton}
              activeOpacity={0.7}
            >
              {/* Image Container */}
              <View style={[
                webStyles.imageContainer,
                isActive && webStyles.imageContainerActive
              ]}>
                <Image
                  source={category.image}
                  style={webStyles.categoryImage}
                  resizeMode="contain"
                />
              </View>

              {/* Label */}
              <Text style={[
                webStyles.label,
                isActive && webStyles.labelActive
              ]}>
                {category.label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
});

// Web-specific styles
const webStyles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 62,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    marginBottom: 4,
    overflow: 'hidden',
  },
  imageContainerActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  categoryImage: {
    width: 36,
    height: 36,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.slate,
    letterSpacing: 0.3,
  },
  labelActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});

// Native component
const NativeCategoryTabBar: React.FC<CategoryTabBarProps> = memo(({ style, isSticky }) => {
  const router = useRouter();
  const pathname = usePathname();
  const scrollViewRef = useRef<ScrollView>(null);

  // Determine active category based on current route
  const getActiveCategory = () => {
    for (const category of CATEGORIES) {
      if (pathname === category.route || pathname.startsWith(category.route)) {
        return category.id;
      }
    }
    return null; // No active category on homepage
  };

  const activeCategory = getActiveCategory();

  // Restore scroll position when component mounts
  useLayoutEffect(() => {
    if (scrollViewRef.current && persistedScrollPosition > 0) {
      scrollViewRef.current.scrollTo({ x: persistedScrollPosition, animated: false });
    }
  });

  // Track scroll position
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    persistedScrollPosition = event.nativeEvent.contentOffset.x;
  };

  const handleCategoryPress = (category: typeof CATEGORIES[0]) => {
    if (category.route) {
      router.push(category.route as any);
    }
  };

  const content = (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      onScroll={handleScroll}
      scrollEventThrottle={16}
    >
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={styles.tabItem}
            onPress={() => handleCategoryPress(category)}
            activeOpacity={0.7}
          >
            <View style={[styles.imageContainer, isActive && styles.imageContainerActive]}>
              <Image
                source={category.image}
                style={styles.categoryImage}
                resizeMode="contain"
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {category.label.toUpperCase()}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  if (isSticky && Platform.OS !== 'web') {
    return (
      <BlurView intensity={95} tint="light" style={[styles.container, style]}>
        {content}
      </BlurView>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
});

const CategoryTabBar: React.FC<CategoryTabBarProps> = (props) => {
  if (Platform.OS === 'web') {
    return <WebCategoryTabBar {...props} />;
  }
  return <NativeCategoryTabBar {...props} />;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabItem: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 62,
  },
  imageContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 245, 245, 0.8)',
    marginBottom: 4,
    overflow: 'hidden',
  },
  imageContainerActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryImage: {
    width: 36,
    height: 36,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.slate,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  tabLabelActive: {
    fontWeight: '600',
    color: COLORS.primary,
  },
});

export { CategoryTabBar };
export default CategoryTabBar;
