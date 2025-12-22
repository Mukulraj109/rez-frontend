import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  LayoutChangeEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import CategoryCashbackGrid from './CategoryCashbackGrid';

// Updated to 4 tabs
export type TabId = 'near-u' | 'mall' | 'cash' | 'prive';

// Comprehensive theme configuration for each tab
const TAB_THEMES: Record<TabId, {
  heroGradient: string[];
  tabActiveColor: string;
  tabActiveTextColor: string;
  tabInactiveTextColor: string;
  categoryIconColor: string;
  containerBg: string;
}> = {
  'near-u': {
    heroGradient: ['#A7F3D0', '#86EFAC', '#4ADE80'],
    tabActiveColor: '#059669',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#059669',
    categoryIconColor: '#00C06A',
    containerBg: '#ECFDF5',
  },
  'mall': {
    heroGradient: ['#A7F3D0', '#6EE7B7', '#34D399'],
    tabActiveColor: '#0D9488',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#0D9488',
    categoryIconColor: '#0D9488',
    containerBg: '#ECFDF5',
  },
  'cash': {
    heroGradient: ['#FEF3C7', '#FDE68A', '#FCD34D'],
    tabActiveColor: '#F59E0B',
    tabActiveTextColor: '#FFFFFF',
    tabInactiveTextColor: '#F59E0B',
    categoryIconColor: '#F59E0B',
    containerBg: '#FFFBEB',
  },
  'prive': {
    heroGradient: ['#1F2937', '#374151', '#4B5563'],
    tabActiveColor: '#C9A962',
    tabActiveTextColor: '#C9A962',
    tabInactiveTextColor: '#C9A962',
    categoryIconColor: '#C9A962',
    containerBg: '#111827',
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
  isPriveEligible?: boolean;
  onPriveLockedPress?: () => void;
}

// Tab order for layout calculations
const TAB_ORDER: TabId[] = ['near-u', 'mall', 'cash', 'prive'];

const HomeTabSection: React.FC<HomeTabSectionProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  coinBalance = 0,
  onCoinPress,
  selectedCategory = 'all',
  onCategoryChange,
  isPriveEligible = false,
  onPriveLockedPress,
}) => {
  const theme = TAB_THEMES[activeTab];
  const isPriveMode = activeTab === 'prive';
  const [containerWidth, setContainerWidth] = useState(0);
  const [tabLayouts, setTabLayouts] = useState<Record<TabId, TabLayout>>({
    'near-u': { x: 0, width: 0 },
    'mall': { x: 0, width: 0 },
    'cash': { x: 0, width: 0 },
    'prive': { x: 0, width: 0 },
  });

  // Handle container layout measurement
  const handleContainerLayout = useCallback((event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  }, []);

  // Handle individual tab layout measurement
  const handleTabLayout = useCallback((tabId: TabId, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts(prev => ({
      ...prev,
      [tabId]: { x: x + 9, width },
    }));
  }, []);

  // Handle Privé tab press - always switch to Privé tab
  // Eligibility is now handled inside PriveSectionContainer
  const handlePrivePress = useCallback(() => {
    onTabChange('prive');
  }, [onTabChange]);

  // Generate SVG path for curved background
  const generateCurvedPath = useCallback(() => {
    const activeLayout = tabLayouts[activeTab];
    if (!containerWidth || !activeLayout.width) return '';

    const curveRadius = 14;
    const tabRowBottom = 70;
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

  // Get container background based on mode
  const containerBg = isPriveMode ? '#111827' : '#ECFDF5';

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]} onLayout={handleContainerLayout}>
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
        {/* Tab 1: Near U */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('near-u')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('near-u', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'near-u'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabText,
              { color: activeTab === 'near-u'
                ? '#059669'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Near U</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 2: Mall */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('mall')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('mall', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'mall'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabText,
              { color: activeTab === 'mall'
                ? '#0D9488'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Mall</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 3: Cash */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('cash')}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('cash', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'cash'
              ? styles.tabActiveTransparent
              : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabText,
              { color: activeTab === 'cash'
                ? '#F59E0B'
                : TAB_THEMES[activeTab].tabInactiveTextColor
              }
            ]}>Cash</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 4: Privé */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={handlePrivePress}
          activeOpacity={0.85}
          onLayout={(e) => handleTabLayout('prive', e)}
        >
          <View style={[
            styles.tab,
            styles.tabPill,
            activeTab === 'prive'
              ? styles.tabActiveTransparent
              : [styles.tabInactive, !isPriveEligible && styles.tabLocked]
          ]}>
            <View style={styles.priveTabContent}>
              {!isPriveEligible && activeTab !== 'prive' && (
                <Ionicons
                  name="lock-closed"
                  size={12}
                  color={TAB_THEMES[activeTab].tabInactiveTextColor}
                  style={styles.lockIcon}
                />
              )}
              <Text style={[
                styles.tabText,
                { color: activeTab === 'prive'
                  ? '#C9A962'
                  : TAB_THEMES[activeTab].tabInactiveTextColor
                }
              ]}>Privé</Text>
            </View>
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
        {/* Search Row with Promo Banner */}
        <View style={styles.searchRow}>
          {/* Compact Search Bar */}
          <TouchableOpacity
            style={[
              styles.searchContainerCompact,
              isPriveMode && styles.searchContainerPrive
            ]}
            onPress={onSearchPress}
            activeOpacity={0.85}
          >
            <Ionicons
              name="search"
              size={18}
              color={isPriveMode ? '#A0A0A0' : '#9CA3AF'}
              style={styles.searchIcon}
            />
            <Text style={[
              styles.searchPlaceholderCompact,
              isPriveMode && styles.searchPlaceholderPrive
            ]}>
              {isPriveMode ? 'Search exclusive offers...' : 'Search products...'}
            </Text>
          </TouchableOpacity>

          {/* Promotional Banner */}
          <TouchableOpacity
            style={styles.promoBannerContainer}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isPriveMode ? ['#2A2A2A', '#1F1F1F'] : ['#FFF5F5', '#FFFFFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.promoBannerGradient}
            >
              <View style={styles.promoBannerContent}>
                <Text style={[
                  styles.promoBannerTitle,
                  isPriveMode && styles.promoBannerTitlePrive
                ]}>
                  {isPriveMode ? 'EXCLUSIVE' : 'FRESH'}
                </Text>
                <Text style={[
                  styles.promoBannerSubtitle,
                  isPriveMode && styles.promoBannerSubtitlePrive
                ]}>
                  {isPriveMode ? 'ACCESS' : 'DEALS'}
                </Text>
              </View>
              <View style={[
                styles.promoBannerIconWrapper,
                isPriveMode && styles.promoBannerIconWrapperPrive
              ]}>
                <Ionicons
                  name={isPriveMode ? 'diamond' : 'pricetag'}
                  size={18}
                  color={isPriveMode ? '#C9A962' : '#DC2626'}
                />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Category Cashback Grid - Only show when near-u tab is selected */}
        {activeTab === 'near-u' && (
          <CategoryCashbackGrid
            onCategoryPress={onCategoryChange}
            style={styles.categoryCashbackGrid}
          />
        )}

        {/* Privé mode exclusive content teaser */}
        {isPriveMode && (
          <View style={styles.priveTeaser}>
            <Text style={styles.priveTeaserIcon}>✦</Text>
            <Text style={styles.priveTeaserText}>
              Exclusive offers for Privé members
            </Text>
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
    gap: 6,
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
    paddingHorizontal: 10,
    minHeight: 54,
  },
  tabActiveTransparent: {
    backgroundColor: 'transparent',
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
  tabLocked: {
    opacity: 0.7,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  priveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    marginRight: 4,
  },
  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 10,
  },
  searchContainerCompact: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
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
  searchContainerPrive: {
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholderCompact: {
    fontSize: 13,
    color: '#9CA3AF',
    flex: 1,
  },
  searchPlaceholderPrive: {
    color: '#6B7280',
  },
  // Promotional Banner
  promoBannerContainer: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  promoBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },
  promoBannerContent: {
    flex: 1,
  },
  promoBannerTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  promoBannerTitlePrive: {
    color: '#C9A962',
  },
  promoBannerSubtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#991B1B',
    letterSpacing: 0.3,
    marginTop: -2,
  },
  promoBannerSubtitlePrive: {
    color: '#A88B4A',
  },
  promoBannerIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBannerIconWrapperPrive: {
    backgroundColor: 'rgba(201, 169, 98, 0.15)',
  },
  // Category Cashback Grid Container
  categoryCashbackGrid: {
    marginTop: 8,
    backgroundColor: 'transparent',
  },
  // Privé teaser
  priveTeaser: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  priveTeaserIcon: {
    fontSize: 16,
    color: '#C9A962',
  },
  priveTeaserText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#C9A962',
    letterSpacing: 0.3,
  },
});

export default HomeTabSection;
