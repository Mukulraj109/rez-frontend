import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

export type TabId = 'rez' | 'rez-mall' | 'cash-store';

interface HomeTabBarProps {
  activeTab: TabId;
  onTabChange: (tabId: TabId) => void;
}

const HomeTabBar: React.FC<HomeTabBarProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.gridContainer}>
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    gap: 8,
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
  // Active tab - Green background
  tabActive: {
    backgroundColor: '#059669',
  },
  // Inactive tab - White background
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
  // Text styles
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
  // Active text - White
  tabTextActive: {
    color: '#FFFFFF',
  },
  // Inactive text - Green
  tabTextInactive: {
    color: '#059669',
  },
});

export default HomeTabBar;
