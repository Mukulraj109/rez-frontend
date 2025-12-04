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
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';

// Module-level variable to persist scroll position across re-renders
let persistedScrollPosition = 0;
let persistedActiveCategory = 'for-you';

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

// Category data
const CATEGORIES = [
  { id: 'for-you', label: 'For You', icon: 'sparkles', iconOutline: 'sparkles-outline' as const, route: null },
  { id: 'dining', label: 'Dining', icon: 'restaurant', iconOutline: 'restaurant-outline' as const, route: '/category/restaurant' },
  { id: 'events', label: 'Events', icon: 'ticket', iconOutline: 'ticket-outline' as const, route: '/EventPage' },
  { id: 'stores', label: 'Stores', icon: 'storefront', iconOutline: 'storefront-outline' as const, route: '/StoreListPage' },
  { id: 'fashion', label: 'Fashion', icon: 'shirt', iconOutline: 'shirt-outline' as const, route: '/FashionPage' },
  { id: 'grocery', label: 'Grocery', icon: 'basket', iconOutline: 'basket-outline' as const, route: '/category/grocery' },
  { id: 'electronics', label: 'Electronics', icon: 'phone-portrait', iconOutline: 'phone-portrait-outline' as const, route: '/category/electronics' },
  { id: 'gifts', label: 'Gifts', icon: 'gift', iconOutline: 'gift-outline' as const, route: '/category/gift' },
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeCategory, setActiveCategory] = useState(persistedActiveCategory);

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
    persistedActiveCategory = category.id;
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
  const [activeCategory, setActiveCategory] = useState(persistedActiveCategory);

  const handleCategoryPress = (category: typeof CATEGORIES[0]) => {
    persistedActiveCategory = category.id;
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
