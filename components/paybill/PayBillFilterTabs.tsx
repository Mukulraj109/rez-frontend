import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { PayBillFilterTabsProps, PAYBILL_FILTERS } from '@/types/paybill.types';

export function PayBillFilterTabs({ 
  activeFilter, 
  onFilterChange, 
  transactionCounts 
}: PayBillFilterTabsProps) {
  const filterTabs = [
    {
      key: PAYBILL_FILTERS.TYPE.ALL,
      label: 'All',
      icon: 'list-outline',
      count: transactionCounts.all,
    },
    {
      key: PAYBILL_FILTERS.TYPE.CREDIT,
      label: 'Added Money',
      icon: 'add-circle-outline',
      count: transactionCounts.credit,
    },
    {
      key: PAYBILL_FILTERS.TYPE.DEBIT,
      label: 'Spent',
      icon: 'remove-circle-outline',
      count: transactionCounts.debit,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        {filterTabs.map((tab) => {
          const isActive = activeFilter === tab.key;
          
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
              onPress={() => onFilterChange(tab.key)}
              activeOpacity={0.7}
              accessibilityLabel={`${tab.label} tab`}
              accessibilityRole="tab"
              accessibilityHint={`Double tap to filter ${tab.label} transactions`}
              accessibilityState={{ selected: isActive }}
            >
              <View style={styles.tabContent}>
                <View style={styles.tabIconContainer}>
                  <Ionicons
                    name={tab.icon as any}
                    size={18}
                    color={isActive ? '#FFFFFF' : '#6B7280'}
                  />
                </View>
                
                <Text style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}>
                  {tab.label}
                </Text>
                
                {/* Count Badge */}
                <View style={[
                  styles.countBadge,
                  isActive && styles.countBadgeActive,
                ]}>
                  <Text style={[
                    styles.countText,
                    isActive && styles.countTextActive,
                  ]}>
                    {tab.count}
                  </Text>
                </View>
              </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  filterTabActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  tabContent: {
    alignItems: 'center',
    gap: 4,
  },
  tabIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
});


