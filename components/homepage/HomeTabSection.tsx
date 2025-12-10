import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CategoryTabBar from './CategoryTabBar';

export type TabId = 'rez' | 'rez-mall' | 'cash-store' | '1-rupee-store';

interface HomeTabSectionProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
  onSearchPress: () => void;
  coinBalance?: number;
  onCoinPress?: () => void;
  selectedCategory?: string;
  onCategoryChange?: (categoryId: string) => void;
}

const HomeTabSection: React.FC<HomeTabSectionProps> = ({
  activeTab,
  onTabChange,
  onSearchPress,
  coinBalance = 0,
  onCoinPress,
  selectedCategory = 'all',
  onCategoryChange,
}) => {
  return (
    <View style={styles.container}>
      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {/* Tab 1: rez */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('rez')}
          activeOpacity={0.85}
        >
          <View style={[
            styles.tab,
            activeTab === 'rez' ? styles.tabActive : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSingle,
              activeTab === 'rez' ? styles.tabTextActive : styles.tabTextInactive
            ]}>rez</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 2: Rez Mall */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('rez-mall')}
          activeOpacity={0.85}
        >
          <View style={[
            styles.tab,
            activeTab === 'rez-mall' ? styles.tabActive : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSmall,
              activeTab === 'rez-mall' ? styles.tabTextActive : styles.tabTextInactive
            ]}>Rez</Text>
            <Text style={[
              styles.tabTextLarge,
              activeTab === 'rez-mall' ? styles.tabTextActive : styles.tabTextInactive
            ]}>Mall.</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 3: Cash Store */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('cash-store')}
          activeOpacity={0.85}
        >
          <View style={[
            styles.tab,
            activeTab === 'cash-store' ? styles.tabActive : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextSmall,
              activeTab === 'cash-store' ? styles.tabTextActive : styles.tabTextInactive
            ]}>Cash</Text>
            <Text style={[
              styles.tabTextLarge,
              activeTab === 'cash-store' ? styles.tabTextActive : styles.tabTextInactive
            ]}>Store</Text>
          </View>
        </TouchableOpacity>

        {/* Tab 4: 1₹ Store */}
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => onTabChange('1-rupee-store')}
          activeOpacity={0.85}
        >
          <View style={[
            styles.tab,
            activeTab === '1-rupee-store' ? styles.tabActive : styles.tabInactive
          ]}>
            <Text style={[
              styles.tabTextMedium,
              activeTab === '1-rupee-store' ? styles.tabTextActive : styles.tabTextInactive
            ]}>1₹ Store</Text>
          </View>
        </TouchableOpacity>
      </View>

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

        {/* ReZCoin Display - Pill Style */}
        <TouchableOpacity
          style={styles.coinPill}
          onPress={onCoinPress}
          activeOpacity={0.85}
        >
          <View style={styles.coinIcon}>
            <Text style={styles.coinIconText}>R</Text>
          </View>
          <Text style={styles.coinBalance}>{coinBalance}</Text>
        </TouchableOpacity>
      </View>

      {/* Category TabBar - Only show when rez tab is selected */}
      {activeTab === 'rez' && (
        <View style={styles.categoryContainer}>
          <CategoryTabBar
            selectedCategory={selectedCategory}
            onCategorySelect={onCategoryChange}
            style={styles.categoryTabBar}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECFDF5',
    paddingTop: 8,
    paddingBottom: 16,
    marginTop: -1,
  },
  // Tabs
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  tabItem: {
    flex: 1,
  },
  tab: {
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  tabActive: {
    backgroundColor: '#059669',
  },
  tabInactive: {
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  tabTextSingle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  tabTextSmall: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  tabTextLarge: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },
  tabTextMedium: {
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  tabTextInactive: {
    color: '#059669',
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
  coinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC857',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(255, 200, 87, 0.3)',
      },
    }),
  },
  coinIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFC857',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00C06A',
  },
  coinIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0B2240',
  },
  coinBalance: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  // Category TabBar Container
  categoryContainer: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 0,
  },
  categoryTabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderBottomWidth: 0,
  },
});

export default HomeTabSection;
