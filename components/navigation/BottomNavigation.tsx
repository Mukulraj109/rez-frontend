import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import logger from '@/utils/logger';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomNavigationProps {
  style?: any;
}

// Curved background SVG - creates white navbar with semi-circle dip in center
const CurvedBackground = () => {
  const width = SCREEN_WIDTH;
  const height = 80;
  const scale = width / 375; // Scale based on 375px design

  // SVG path: flat on sides, curves DOWN in center to create semi-circle dip
  const path = `
    M 0 0
    L ${Math.floor(120 * scale)} 0
    C ${Math.floor(140 * scale)} 0 ${Math.floor(150 * scale)} 5 ${Math.floor(160 * scale)} 18
    C ${Math.floor(170 * scale)} 32 ${Math.floor(180 * scale)} 38 ${Math.floor(187.5 * scale)} 38
    C ${Math.floor(195 * scale)} 38 ${Math.floor(205 * scale)} 32 ${Math.floor(215 * scale)} 18
    C ${Math.floor(225 * scale)} 5 ${Math.floor(235 * scale)} 0 ${Math.floor(255 * scale)} 0
    L ${width} 0
    L ${width} ${height}
    L 0 ${height}
    Z
  `.trim();

  return (
    <View style={curvedBgStyles.container}>
      <Svg width={width} height={height}>
        <Path d={path} fill="#FFFFFF" />
      </Svg>
    </View>
  );
};

// Styles for curved background (separate to avoid circular reference)
const curvedBgStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    // Shadow to make the curve visible
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 10,
  },
});

const BottomNavigation: React.FC<BottomNavigationProps> = ({ style }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Hide bottom navigation on auth/onboarding pages
  const hidePages = [
    '/sign-in',
    '/onboarding',
    '/index', // Landing page
  ];
  
  const shouldHide = hidePages.some(page => pathname?.startsWith(page));
  
  if (shouldHide) {
    return null;
  }

  // Determine which tab is active based on pathname
  const getActiveTab = () => {
    // Handle empty pathname - treat as home
    if (!pathname || pathname === '' || pathname === '/') {
      logger.debug('[BOTTOM NAV] ✅ Home tab active (empty/root pathname)');
      return 'Home';
    }
    
    // Normalize pathname for comparison (remove trailing slash)
    const normalizedPath = pathname.replace(/\/$/, '');
    
    logger.debug('[BOTTOM NAV] Checking pathname:', normalizedPath || '(empty)');
    
    // Check for Categories tab - multiple formats
    if (
      normalizedPath === '/categories' ||
      normalizedPath === '/(tabs)/categories' ||
      normalizedPath.startsWith('/categories/') ||
      normalizedPath.startsWith('/(tabs)/categories/')
    ) {
      logger.debug('[BOTTOM NAV] ✅ Categories tab active');
      return 'Categories';
    }

    // Check for Play tab - multiple formats (check first to avoid conflicts)
    if (
      normalizedPath === '/play' ||
      normalizedPath === '/(tabs)/play' ||
      normalizedPath.startsWith('/play/') ||
      normalizedPath.startsWith('/(tabs)/play/')
    ) {
      logger.debug('[BOTTOM NAV] ✅ Play tab active');
      return 'Play';
    }
    
    // Check for Earn tab - multiple formats (check first to avoid conflicts)
    if (
      normalizedPath === '/earn' ||
      normalizedPath === '/(tabs)/earn' ||
      normalizedPath.startsWith('/earn/') ||
      normalizedPath.startsWith('/(tabs)/earn/')
    ) {
      logger.debug('[BOTTOM NAV] ✅ Earn tab active');
      return 'Earn';
    }
    
    // Check for Home tab - handle multiple formats
    // Home is at /(tabs) or /(tabs)/index, or root /
    // IMPORTANT: Check home last, after other tabs, to avoid conflicts
    if (
      normalizedPath === '/(tabs)' ||
      normalizedPath === '/(tabs)/index' ||
      normalizedPath.startsWith('/(tabs)/index/') ||
      // If pathname includes (tabs) but doesn't match other tabs, it's home
      (normalizedPath.includes('/(tabs)') &&
       !normalizedPath.includes('/play') &&
       !normalizedPath.includes('/earn') &&
       !normalizedPath.includes('/categories'))
    ) {
      logger.debug('[BOTTOM NAV] ✅ Home tab active');
      return 'Home';
    }
    
    // Default: no tab is active on other pages (offers, store, etc.)
    logger.debug('[BOTTOM NAV] ❌ No tab active');
    return null;
  };

  const activeTab = getActiveTab();

  const tabs = [
    {
      name: 'Home',
      route: '/(tabs)',
      icon: 'home',
      isActive: activeTab === 'Home',
      isCenter: false,
    },
    {
      name: 'Categories',
      route: '/(tabs)/categories',
      icon: 'grid-outline',
      isActive: activeTab === 'Categories',
      isCenter: false,
    },
    {
      name: 'Pay in Store',
      route: '/PayInStore',
      icon: 'qr-code',
      isActive: false,
      isCenter: true,
    },
    {
      name: 'Play',
      route: '/(tabs)/play',
      icon: 'play-circle',
      isActive: activeTab === 'Play',
      isCenter: false,
    },
    {
      name: 'Earn',
      route: '/(tabs)/earn',
      icon: 'wallet',
      isActive: activeTab === 'Earn',
      isCenter: false,
    },
  ];

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  // Split tabs: left (Home, Categories), center (Pay in Store), right (Play, Earn)
  const leftTabs = tabs.filter(t => !t.isCenter).slice(0, 2);
  const rightTabs = tabs.filter(t => !t.isCenter).slice(2);
  const centerTab = tabs.find(t => t.isCenter)!;

  // Render a regular tab item
  const renderTab = (tab: typeof tabs[0]) => (
    <TouchableOpacity
      key={tab.name}
      style={styles.tab}
      onPress={() => handleTabPress(tab.route)}
      activeOpacity={0.7}
      accessibilityLabel={`${tab.name} tab`}
      accessibilityRole="tab"
      accessibilityState={{ selected: tab.isActive }}
    >
      <Ionicons
        name={tab.icon as any}
        size={24}
        color={tab.isActive ? '#00C06A' : '#0F0F0F'}
      />
      <Text style={[
        styles.tabLabelText,
        { color: tab.isActive ? '#00C06A' : '#0F0F0F' }
      ]}>
        {tab.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Layer 1: Curved white background */}
      <CurvedBackground />

      {/* Layer 2: Floating center button (above the curve) */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => handleTabPress(centerTab.route)}
          activeOpacity={0.8}
          accessibilityLabel={`${centerTab.name} tab`}
          accessibilityRole="tab"
        >
          <LinearGradient
            colors={['#00C06A', '#00A05A']}
            style={styles.floatingButtonGradient}
          >
            <Ionicons name="qr-code" size={26} color="white" />
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.floatingButtonLabel}>{centerTab.name}</Text>
      </View>

      {/* Layer 3: Tab bar with left and right tabs */}
      <View style={styles.tabBar}>
        {/* Left tabs: Home, Categories */}
        <View style={styles.leftTabs}>
          {leftTabs.map(renderTab)}
        </View>

        {/* Center spacer (for the floating button area) */}
        <View style={styles.centerSpacer} />

        {/* Right tabs: Play, Earn */}
        <View style={styles.rightTabs}>
          {rightTabs.map(renderTab)}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Main container - holds everything
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 110, // Taller to accommodate floating button
    zIndex: 1000,
    overflow: 'visible',
  },

  // Floating center button container - positioned above the curve
  floatingButtonContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },

  // The touchable button wrapper
  floatingButton: {
    // No extra styling needed
  },

  // The gradient circle button
  floatingButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    // Shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  // Label below floating button
  floatingButtonLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
  },

  // Tab bar container
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    zIndex: 10,
  },

  // Left tabs section (Home, Categories)
  leftTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },

  // Center spacer for floating button
  centerSpacer: {
    width: 80,
  },

  // Right tabs section (Play, Earn)
  rightTabs: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingRight: 10,
  },

  // Individual tab button
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },

  // Tab label text
  tabLabelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default BottomNavigation;
