// Transaction Tabs Component
// Tab navigation for filtering transactions by category

import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { WalletTab, TransactionCategory } from '@/types/wallet.types';

interface TransactionTabsProps {
  tabs: WalletTab[];
  activeTab: TransactionCategory;
  onTabPress: (tabId: TransactionCategory) => void;
}

export default function TransactionTabs({ tabs, activeTab, onTabPress }: TransactionTabsProps) {
  
  const renderTab = (tab: WalletTab) => {
    const isActive = tab.id === activeTab;
    
    return (
      <TouchableOpacity
        key={tab.id}
        style={[
          styles.tab,
          isActive && styles.activeTab,
        ]}
        onPress={() => onTabPress(tab.id)}
        activeOpacity={0.7}
      >
        <ThemedText style={[
          styles.tabText,
          isActive && styles.activeTabText,
        ]}>
          {tab.title}
        </ThemedText>
        
        {tab.count !== undefined && tab.count > 0 && (
          <View style={[
            styles.badge,
            isActive && styles.activeBadge,
          ]}>
            <ThemedText style={[
              styles.badgeText,
              isActive && styles.activeBadgeText,
            ]}>
              {tab.count}
            </ThemedText>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabsScroll}
      >
        {tabs.map(renderTab)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tabsScroll: {
    flexGrow: 0,
  },
  tabsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: 'white',
  },
  badge: {
    backgroundColor: '#8B5CF6',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  activeBadge: {
    backgroundColor: 'white',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'white',
  },
  activeBadgeText: {
    color: '#8B5CF6',
  },
});