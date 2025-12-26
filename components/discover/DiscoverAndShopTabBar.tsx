// DiscoverAndShopTabBar.tsx - Modern glassy tab navigation for Discover & Shop
// ReZ Brand Colors: Green (#00C06A) and Golden (#FFC857)
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DiscoverTabType } from '@/types/discover.types';

// ReZ Brand Colors
const REZ_COLORS = {
  primaryGreen: '#00C06A',
  darkGreen: '#00796B',
  lightGreen: '#10B981',
  primaryGold: '#FFC857',
  navy: '#0B2240',
  gray: '#9CA3AF',
  lightGray: '#F3F4F6',
};

interface Tab {
  id: DiscoverTabType;
  label: string;
  icon: string;
  activeIcon: string;
}

const TABS: Tab[] = [
  {
    id: 'reels',
    label: 'Reels/UGC',
    icon: 'play-circle-outline',
    activeIcon: 'play-circle',
  },
  {
    id: 'posts',
    label: 'Posts',
    icon: 'grid-outline',
    activeIcon: 'grid',
  },
  {
    id: 'articles',
    label: 'Articles',
    icon: 'document-text-outline',
    activeIcon: 'document-text',
  },
  {
    id: 'images',
    label: 'Images',
    icon: 'images-outline',
    activeIcon: 'images',
  },
];

interface DiscoverAndShopTabBarProps {
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
}

export default function DiscoverAndShopTabBar({
  activeTab,
  onTabChange,
}: DiscoverAndShopTabBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.tabsWrapper}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.id)}
              activeOpacity={0.7}
              accessibilityLabel={`${tab.label} tab`}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              {isActive ? (
                <LinearGradient
                  colors={[REZ_COLORS.primaryGreen, REZ_COLORS.lightGreen]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons
                    name={tab.activeIcon as any}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.activeTabLabel}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={REZ_COLORS.gray}
                  />
                  <Text style={styles.tabLabel}>{tab.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: REZ_COLORS.lightGray,
  },
  tabsWrapper: {
    flexDirection: 'row',
    backgroundColor: REZ_COLORS.lightGray,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  activeTab: {
    ...Platform.select({
      ios: {
        shadowColor: REZ_COLORS.primaryGreen,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  activeTabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 5,
    borderRadius: 10,
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 5,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: REZ_COLORS.gray,
  },
  activeTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
