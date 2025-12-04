/**
 * StickySearchHeader Component
 *
 * A sticky search bar with glass/blur effect that appears when scrolling
 * Includes the category tab bar below it
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CategoryTabBar from './CategoryTabBar';

interface StickySearchHeaderProps {
  /** Current scroll position for animation */
  scrollY: Animated.Value;
  /** Threshold to show sticky header */
  showThreshold?: number;
  /** Callback when search is pressed */
  onSearchPress?: () => void;
  /** Currently selected category */
  selectedCategory?: string;
  /** Callback when category changes */
  onCategoryChange?: (categoryId: string) => void;
}

export const StickySearchHeader: React.FC<StickySearchHeaderProps> = ({
  scrollY,
  showThreshold = 200,
  onSearchPress,
  selectedCategory,
  onCategoryChange,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isVisible, setIsVisible] = useState(false);

  // Listen to scroll position to toggle pointer events
  useEffect(() => {
    const listenerId = scrollY.addListener(({ value }) => {
      setIsVisible(value >= showThreshold);
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY, showThreshold]);

  // Animated opacity based on scroll position
  const headerOpacity = scrollY.interpolate({
    inputRange: [showThreshold - 50, showThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Animated translate for slide-in effect
  const headerTranslateY = scrollY.interpolate({
    inputRange: [showThreshold - 50, showThreshold],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  const handleSearchPress = () => {
    if (onSearchPress) {
      onSearchPress();
    } else {
      if (Platform.OS === 'ios') {
        setTimeout(() => router.push('/search'), 50);
      } else {
        router.push('/search');
      }
    }
  };

  const HeaderContent = () => (
    <View style={[styles.headerContent, { paddingTop: insets.top + 8 }]}>
      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchContainer}
        onPress={handleSearchPress}
        activeOpacity={0.85}
        accessibilityLabel="Search bar"
        accessibilityRole="search"
      >
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for stores, products..."
          placeholderTextColor="#999"
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>

      {/* Category Tab Bar */}
      <CategoryTabBar
        selectedCategory={selectedCategory}
        onCategorySelect={onCategoryChange}
        isSticky={false}
        style={styles.categoryBar}
      />
    </View>
  );

  // Native platforms with blur
  if (Platform.OS !== 'web') {
    return (
      <Animated.View
        style={[
          styles.container,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
        pointerEvents={isVisible ? 'auto' : 'none'}
      >
        <BlurView
          intensity={90}
          tint="light"
          style={styles.blurContainer}
        >
          <HeaderContent />
        </BlurView>
      </Animated.View>
    );
  }

  // Web version with CSS backdrop-filter
  return (
    <Animated.View
      style={[
        styles.container,
        styles.webContainer,
        {
          opacity: headerOpacity,
          transform: [{ translateY: headerTranslateY }],
        },
      ]}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <HeaderContent />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurContainer: {
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 192, 106, 0.1)',
  },
  webContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 192, 106, 0.1)',
    ...Platform.select({
      web: {
        boxShadow: '0 4px 20px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  headerContent: {
    paddingBottom: 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(247, 250, 252, 0.9)',
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0B2240',
    fontFamily: Platform.select({
      ios: 'Inter-Regular',
      android: 'Inter-Regular',
      default: undefined,
    }),
  },
  categoryBar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
});

export default StickySearchHeader;
