// AccountTabs Component
// Tab navigation for account settings page

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AccountTabsProps, AccountTabType } from '@/types/account.types';
import { ACCOUNT_COLORS } from '@/types/account.types';

export default function AccountTabs({
  tabs,
  activeTab,
  onTabPress,
}: AccountTabsProps) {
  
  const handleTabPress = (tabId: AccountTabType) => {
    onTabPress(tabId);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            tab.isActive && styles.activeTab,
            index === 0 && styles.firstTab,
            index === tabs.length - 1 && styles.lastTab,
          ]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <ThemedText
            style={[
              styles.tabText,
              tab.isActive && styles.activeTabText,
            ]}
          >
            {tab.title}
          </ThemedText>
          
          {tab.isActive && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 4,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 4,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ACCOUNT_COLORS.surface,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: ACCOUNT_COLORS.primary,
    shadowColor: ACCOUNT_COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 0,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: ACCOUNT_COLORS.textSecondary,
    textAlign: 'center',
  },
  activeTabText: {
    color: 'white',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 8,
    width: 20,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 1.5,
  },
});