import React, { useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Dimensions, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { SlidingTabsProps, TabData } from '@/types/cart';

const defaultTabs: TabData[] = [
  { key: 'products', title: 'Products', icon: 'cube-outline' },
  { key: 'service', title: 'Service', icon: 'construct-outline' },
  { key: 'lockedproduct', title: 'Locked', icon: 'lock-closed-outline' }
];

/**
 * SlidingTabs Component - Enhanced for Three-Tab Support
 * 
 * Features:
 * - Dynamic tab width calculation
 * - Responsive font and icon sizing
 * - Smooth animated underline for any number of tabs
 * - Optimized for three-tab layout (Products, Service, Locked)
 * - Accessibility compliance
 */
export default function SlidingTabs({ 
  activeTab, 
  onTabChange, 
  tabs = defaultTabs 
}: SlidingTabsProps) {
  const { width } = Dimensions.get('window');
  const tabWidth = width / tabs.length;
  const underlinePosition = useRef(new Animated.Value(0)).current;
  
  // Responsive design considerations for three tabs
  const isSmallScreen = width < 375;
  const isVerySmallScreen = width < 320;
  
  // Dynamic sizing based on screen width and tab count
  const getResponsiveTabSizes = () => {
    if (tabs.length >= 3) {
      if (isVerySmallScreen) {
        return { fontSize: 13, iconSize: 15, spacing: 2 };
      } else if (isSmallScreen) {
        return { fontSize: 14, iconSize: 16, spacing: 3 };
      } else {
        return { fontSize: 15, iconSize: 17, spacing: 4 };
      }
    } else {
      return { fontSize: 16, iconSize: 18, spacing: 6 };
    }
  };
  
  const { fontSize: tabFontSize, iconSize: tabIconSize, spacing: iconSpacing } = getResponsiveTabSizes();

  useEffect(() => {
    const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
    animateUnderline(activeIndex);
  }, [activeTab, tabs]);

  const animateUnderline = (tabIndex: number) => {
    Animated.timing(underlinePosition, {
      toValue: tabIndex * tabWidth,
      duration: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  };

  const handleTabPress = (tabKey: string) => {
    if (tabKey !== activeTab) {
      onTabChange(tabKey as 'products' | 'service' | 'lockedproduct');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { width: tabWidth }]}
              onPress={() => handleTabPress(tab.key)}
              activeOpacity={0.8}
              accessibilityLabel={`${tab.title} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabContent}>
                <Ionicons 
                  name={tab.icon as any} 
                  size={tabIconSize} 
                  color={isActive ? '#8B5CF6' : '#9CA3AF'} 
                  style={[styles.tabIcon, { marginRight: iconSpacing }]}
                />
                <ThemedText style={[
                  styles.tabText,
                  { fontSize: tabFontSize },
                  isActive ? styles.activeTabText : styles.inactiveTabText
                ]}>
                  {tab.title}
                </ThemedText>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Animated Underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            width: tabWidth * 0.6, // 60% of tab width for better visual
            transform: [
              {
                translateX: underlinePosition.interpolate({
                  inputRange: tabs.map((_, index) => index * tabWidth),
                  outputRange: tabs.map((_, index) => (index * tabWidth) + (tabWidth * 0.2)),
                  extrapolate: 'clamp',
                })
              }
            ]
          }
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    position: 'relative',
  },
  tabsContainer: {
    flexDirection: 'row',
    height: 50,
  },
  tab: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8, // Reduced padding for three tabs
    minWidth: 0, // Allow tabs to shrink if needed
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1, // Allow content to shrink if needed
  },
  tabIcon: {
    marginRight: 4, // Reduced margin for three tabs
  },
  tabText: {
    fontSize: 16, // Will be overridden by inline style for responsiveness
    fontWeight: '500',
    letterSpacing: 0.1, // Reduced letter spacing for better fit
    flexShrink: 1, // Allow text to shrink if needed
  },
  activeTabText: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  inactiveTabText: {
    color: '#9CA3AF',
    fontWeight: '500',
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 1.5,
  },
});