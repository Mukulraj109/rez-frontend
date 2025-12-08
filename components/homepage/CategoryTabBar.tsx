/**
 * CategoryTabBar Component
 * Compact glassy horizontal scrollable category tabs
 */

import React, { useState, useRef, useEffect, useLayoutEffect, memo } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

// Category data - connected to MainCategory pages (all 11 main categories + Events & Stores)
const CATEGORIES = [
  { id: 'for-you', label: 'For You', icon: 'sparkles', iconOutline: 'sparkles-outline' as const, route: null },
  { id: 'dining', label: 'Dining', icon: 'restaurant', iconOutline: 'restaurant-outline' as const, route: '/MainCategory/food-dining' },
  { id: 'events', label: 'Events', icon: 'ticket', iconOutline: 'ticket-outline' as const, route: '/EventsListPage' },
  { id: 'stores', label: 'Stores', icon: 'storefront', iconOutline: 'storefront-outline' as const, route: '/StoreListPage' },
  { id: 'grocery', label: 'Grocery', icon: 'basket', iconOutline: 'basket-outline' as const, route: '/MainCategory/grocery-essentials' },
  { id: 'beauty', label: 'Beauty', icon: 'flower', iconOutline: 'flower-outline' as const, route: '/MainCategory/beauty-wellness' },
  { id: 'health', label: 'Health', icon: 'medical', iconOutline: 'medical-outline' as const, route: '/MainCategory/healthcare' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt', iconOutline: 'shirt-outline' as const, route: '/MainCategory/fashion' },
  { id: 'fitness', label: 'Fitness', icon: 'fitness', iconOutline: 'fitness-outline' as const, route: '/MainCategory/fitness-sports' },
  { id: 'education', label: 'Education', icon: 'school', iconOutline: 'school-outline' as const, route: '/MainCategory/education-learning' },
  { id: 'home', label: 'Home', icon: 'home', iconOutline: 'home-outline' as const, route: '/MainCategory/home-services' },
  { id: 'travel', label: 'Travel', icon: 'airplane', iconOutline: 'airplane-outline' as const, route: '/MainCategory/travel-experiences' },
  { id: 'entertainment', label: 'Fun', icon: 'film', iconOutline: 'film-outline' as const, route: '/MainCategory/entertainment' },
  { id: 'finance', label: 'Finance', icon: 'wallet', iconOutline: 'wallet-outline' as const, route: '/MainCategory/financial-lifestyle' },
];

interface CategoryTabBarProps {
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
  isSticky?: boolean;
  style?: any;
}

// Web component with glassy effect
const WebCategoryTabBar: React.FC<CategoryTabBarProps> = memo(({ style }) => {
  const router = useRouter();
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState('for-you');

  // Reset to 'for-you' when on homepage
  useEffect(() => {
    const isHomepage = pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (isHomepage) {
      setActiveCategory('for-you');
    }
  }, [pathname]);

  useLayoutEffect(() => {
    if (containerRef.current && persistedScrollPosition > 0) {
      containerRef.current.scrollLeft = persistedScrollPosition;
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      const handleScroll = () => {
        persistedScrollPosition = container.scrollLeft;
      };
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleCategoryClick = (category: typeof CATEGORIES[0]) => {
    if (containerRef.current) {
      persistedScrollPosition = containerRef.current.scrollLeft;
    }
    setActiveCategory(category.id);
    if (category.route) {
      router.push(category.route as any);
    }
  };

  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.6)',
      backdropFilter: 'blur(50px) saturate(200%)',
      WebkitBackdropFilter: 'blur(50px) saturate(200%)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
      ...(style || {}),
    }}>
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'row',
          overflowX: 'auto',
          gap: 0,
          padding: '8px 10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {CATEGORIES.map((category) => {
          const isActive = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '8px 14px',
                borderRadius: 12,
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                flexShrink: 0,
                minWidth: 62,
                position: 'relative',
                transition: 'all 0.15s ease',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isActive
                  ? `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.deepTeal} 100%)`
                  : 'transparent',
                marginBottom: 4,
                transition: 'all 0.15s ease',
                boxShadow: isActive ? '0 3px 10px rgba(0, 192, 106, 0.35)' : 'none',
              }}>
                <Ionicons
                  name={isActive ? category.icon as any : category.iconOutline}
                  size={18}
                  color={isActive ? COLORS.white : COLORS.mutedGray}
                />
              </div>

              {/* Label */}
              <span style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 500,
                color: isActive ? COLORS.primary : COLORS.mutedGray,
                letterSpacing: 0.3,
                textTransform: 'uppercase',
                fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                whiteSpace: 'nowrap',
              }}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
});

// Native component
const NativeCategoryTabBar: React.FC<CategoryTabBarProps> = memo(({ style, isSticky }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState('for-you');

  // Reset to 'for-you' when on homepage
  useEffect(() => {
    const isHomepage = pathname === '/' || pathname === '/index' || pathname === '/(tabs)' || pathname === '/(tabs)/index';
    if (isHomepage) {
      setActiveCategory('for-you');
    }
  }, [pathname]);

  const handleCategoryPress = (category: typeof CATEGORIES[0]) => {
    setActiveCategory(category.id);
    if (category.route) {
      router.push(category.route as any);
    }
  };

  const content = (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
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
            <View style={[styles.iconContainer, isActive && styles.iconContainerActive]}>
              <Ionicons
                name={isActive ? category.icon as any : category.iconOutline}
                size={16}
                color={isActive ? COLORS.white : COLORS.mutedGray}
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
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  iconContainerActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: COLORS.mutedGray,
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
