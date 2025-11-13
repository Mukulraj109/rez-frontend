import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import logger from '@/utils/logger';

interface BottomNavigationProps {
  style?: any;
}

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
    // IMPORTANT: Check home last, after play and earn, to avoid conflicts
    if (
      normalizedPath === '/(tabs)' ||
      normalizedPath === '/(tabs)/index' ||
      normalizedPath.startsWith('/(tabs)/index/') ||
      // If pathname includes (tabs) but doesn't match play or earn, it's home
      (normalizedPath.includes('/(tabs)') && 
       !normalizedPath.includes('/play') && 
       !normalizedPath.includes('/earn'))
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
    },
    {
      name: 'Play',
      route: '/(tabs)/play',
      icon: 'play-circle',
      isActive: activeTab === 'Play',
    },
    {
      name: 'Earn',
      route: '/(tabs)/earn',
      icon: 'wallet',
      isActive: activeTab === 'Earn',
    },
  ];

  const handleTabPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={[styles.container, style]}>
      <BlurView
        intensity={60}
        tint={Platform.OS === 'ios' ? 'light' : 'default'}
        style={styles.blurView}
      >
        <View style={styles.tabBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => handleTabPress(tab.route)}
              activeOpacity={0.7}
              accessibilityLabel={`${tab.name} tab`}
              accessibilityRole="tab"
              accessibilityHint={`Double tap to navigate to ${tab.name} screen`}
              accessibilityState={{ selected: tab.isActive }}
            >
              <Ionicons
                name={tab.icon as any}
                size={24}
                color={tab.isActive ? '#8B5CF6' : '#0F0F0F'}
              />
              <View style={styles.tabLabel}>
                <View style={[
                  styles.labelContainer,
                  tab.isActive && styles.activeLabelContainer
                ]}>
                  <Text style={[
                    styles.labelText,
                    { color: tab.isActive ? '#8B5CF6' : '#0F0F0F' }
                  ]}>
                    {tab.name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    zIndex: 1000,
  },
  blurView: {
    flex: 1,
    borderTopWidth: 0,
  },
  tabBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabLabel: {
    marginTop: 4,
  },
  labelContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  activeLabelContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default BottomNavigation;
