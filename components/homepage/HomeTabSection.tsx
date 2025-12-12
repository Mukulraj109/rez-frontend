import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import CategoryTabBar from './CategoryTabBar';

export type TabId = 'rez' | 'rez-mall' | 'cash-store' | '1-rupee-store';

// Comprehensive theme configuration for each tab
const TAB_THEMES: Record<TabId, {
  heroGradient: string[];
  tabActiveColor: string;
  tabActiveTextColor: string;
  tabInactiveTextColor: string;
  categoryIconColor: string;
  containerBg: string;
}> = {
  'rez': {
    heroGradient: ['#A7F3D0', '#86EFAC', '#4ADE80'],
    tabActiveColor: '#059669',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#059669',
    categoryIconColor: '#00C06A',
    containerBg: '#ECFDF5',
  },
  'rez-mall': {
    heroGradient: ['#A7F3D0', '#6EE7B7', '#34D399'],
    tabActiveColor: '#0D9488',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#0D9488',
    categoryIconColor: '#0D9488',
    containerBg: '#ECFDF5',
  },
  'cash-store': {
    heroGradient: ['#BBF7D0', '#86EFAC', '#4ADE80'],
    tabActiveColor: '#166534',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#166534',
    categoryIconColor: '#166534',
    containerBg: '#F0FDF4',
  },
  '1-rupee-store': {
    heroGradient: ['#99F6E4', '#5EEAD4', '#2DD4BF'],
    tabActiveColor: '#0891B2',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#0891B2',
    categoryIconColor: '#0891B2',
    containerBg: '#ECFEF7',
  },
};

// Tab position interface for curve calculations
interface TabLayout {
  x: number;
  width: number;
}

interface HomeTabSectionProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  onSearchPress: () => void;
  coinBalance?: number;
  onCoinPress?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

// Tab order for layout calculations
const TAB_ORDER: TabId[] = ['rez', 'rez-mall', 'cash-store', '1-rupee-store'];

const HomeTabSection: React.FC<HomeTabSectionProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  coinBalance = 0,
  onCoinPress,
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  const theme = TAB_THEMES[activeTab];
  const [containerWidth, setContainerWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<TabId, TabLayout>>({
    'rez': { x: 0, width: 0 },
    'rez-mall': { x: 0, width: 0 },
    'cash-store': { x: 0, width: 0 },
    '1-rupee-store': { x: 0, width: 0 },
  });

  // Handle container layout measurement
  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Handle individual tab layout measurement
  const handleTabLayout = useCallback((tabId: TabId, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    // x is relative to tabsRow content area. Add padding offset
    setTabLayouts(prev => ({
      ...prev,
      [tabId]: { x: x + 9, width }, // Adjusted offset for better alignment
    }));
  }, []);

  // Generate SVG path for curved background
  const generateCurvedPath = useCallback(() => {
    const activeLayout = tabLayouts[activeTab];
    if (!containerWidth || !activeLayout.width) return '';

    const curveRadius = 14;
    const tabRowBottom = 70; // Moved down to match larger tabs
    const tabTop = 6;
    const leftX = activeLayout.x + 2;
    const rightX = activeLayout.x + activeLayout.width - 2;
    const totalWidth = containerWidth;

    const path = `
      M 0 ${tabRowBottom}
      L ${Math.max(0, leftX - curveRadius)} ${tabRowBottom}
      C ${leftX - curveRadius / 2} ${tabRowBottom} ${leftX} ${tabRowBottom - curveRadius / 2} ${leftX} ${tabRowBottom - curveRadius}
      L ${leftX} ${tabTop + curveRadius}
      C ${leftX} ${tabTop + curveRadius / 2} ${leftX + curveRadius / 2} ${tabTop} ${leftX + curveRadius} ${tabTop}
      L ${rightX - curveRadius} ${tabTop}
      C ${rightX - curveRadius / 2} ${tabTop} ${rightX} ${tabTop + curveRadius / 2} ${rightX} ${tabTop + curveRadius}
      L ${rightX} ${tabRowBottom - curveRadius}
      C ${rightX} ${tabRowBottom - curveRadius / 2} ${rightX + curveRadius / 2} ${tabRowBottom} ${rightX + curveRadius} ${tabRowBottom}
      L ${totalWidth} ${tabRowBottom}
      L ${totalWidth} 350
      L 0 350
      Z
    `;
    return path;
  }, [activeTab, tabLayouts, containerWidth]);

  return (
    <View style={[styles.container, { backgroundColor: '#ECFDF5' }]} onLayout={handleContainerLayout}>
      {/* SVG Curved Background */}
      {containerWidth > 0 && (
        <View style={styles.svgContainer}>
          <Svg width={containerWidth} height={350} style={styles.svg}>
            <Path
              d={generateCurvedPath()}
              fill={theme.heroGradient[0]}
            />
          </Svg>
        </View>
      )}

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {/* Tab 1: Rez */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('rez')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('rez', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'rez'
              ? styles.tabActiveTransparent // Invisible - text floats on curved background
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.rezText,
              { color: activeTab === 'rez'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Rez</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 2: Rez Mall */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('rez-mall')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('rez-mall', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'rez-mall'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSmall,
              { color: activeTab === 'rez-mall'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Rez</Text>
            <Text style={[
              styles.tabTextLarge,
              { color: activeTab === 'rez-mall'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Mall.</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 3: Cash Store */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('cash-store')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('cash-store', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'cash-store'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSmall,
              { color: activeTab === 'cash-store'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Cash</Text>
            <Text style={[
              styles.tabTextLarge,
              { color: activeTab === 'cash-store'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Store</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 4: 1₹ Store */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('1-rupee-store')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('1-rupee-store', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === '1-rupee-store'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSmall,
              { color: activeTab === '1-rupee-store'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>1₹</Text>
            <Text style={[
              styles.tabTextLarge,
              { color: activeTab === '1-rupee-store'
                ? '#FFFFFF'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Store</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Middle section with dynamic gradient based on active tab */}
      <LinearGradient
        colors={theme.heroGradient as [string, string, ...string[]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.middleSection}
      >
        {/* Search Row with ReZCoin */}
        <View style={styles.searchRow}>
          <TouchableOpacity
            style={styles.searchContainer}
            onPress={onSearchPress}
            activeOpacity={0.85}
          >
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Search for products and services</Text>
          </TouchableOpacity>

          {/* ReZCoin Display - Wallet Style with overlapping balance */}
          <TouchableOpacity
            style={styles.coinContainer}
            onPress={onCoinPress}
            activeOpacity={0.85}
          >
            <View style={styles.coinIconCircle}>
              <Image
                source={require('@/assets/images/rez-coin.png')}
                style={styles.coinImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.coinBalanceCloud}>
              <Text style={styles.coinBalance}>{coinBalance}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Category TabBar - Only show when rez tab is selected */}
        {activeTab === 'rez' && (
          <View style={styles.categoryContainer}>
            <CategoryTabBar
              selectedCategory={selectedCategory}
              onCategorySelect={onCategoryChange}
              style={styles.categoryTabBar}
              activeThemeColor={theme.categoryIconColor}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingTop: 8,
    paddingBottom: 0,
    marginTop: -1,
    position: 'relative',
    overflow: 'hidden',
  },
  // SVG curved background
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 0,
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  middleSection: {
    paddingTop: 12,
    paddingBottom: 0,
    zIndex: 1,
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 4,
    zIndex: 2,
  },
  tabItem: {
    flex: 1,
  },
  tab: {
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  tabPill: {
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  tabActive: {
  backgroundColor: 'rgba(245, 245, 245, 0.8)',
  },
  tabActiveTransparent: {
    backgroundColor: 'transparent', // No background - text floats on the curved SVG background
  },
  rezText: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  tabTextSmall: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 13,
  },
  tabTextLarge: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  tabTextMedium: {
    fontSize: 13,
    fontWeight: '800',
    flexShrink: 0,
  },
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  coinContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    minWidth: 50,
    marginTop: -2,
  },
  coinIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinImage: {
    width: 32,
    height: 32,
  },
  coinBalanceCloud: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: -8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  coinBalance: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  // Category TabBar Container
  categoryContainer: {
    marginTop: -12,
    borderRadius: 0,
    overflow: 'visible',
    marginHorizontal: 0,
    backgroundColor: 'transparent',
  },
  categoryTabBar: {
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
});

export default HomeTabSection;
