import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { CategoryTabsProps } from '@/types/going-out.types';

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const getIconForCategory = (categorySlug: string) => {
    const iconMap: Record<string, string> = {
      all: 'grid-outline',
      perfume: 'flower-outline',
      gold: 'diamond-outline',
      gifts: 'gift-outline',
    };
    return iconMap[categorySlug] || 'ellipse-outline';
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {categories.map((category, index) => {
          const isActive = category.id === activeCategory;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tabButton,
                isActive && styles.activeTabButton,
                index === 0 && styles.firstTab,
                index === categories.length - 1 && styles.lastTab,
              ]}
              onPress={() => onCategoryChange(category.id)}
              activeOpacity={0.8}
            >
              {/* Tab Content */}
              <View style={styles.tabContent}>
                {/* Icon */}
                <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                  <Ionicons
                    name={getIconForCategory(category.slug) as any}
                    size={20}
                    color={isActive ? '#8B5CF6' : '#6B7280'}
                  />
                </View>
                
                {/* Label */}
                <ThemedText
                  style={[
                    styles.tabLabel,
                    isActive && styles.activeTabLabel,
                  ]}
                >
                  {category.name}
                </ThemedText>

                {/* Product Count Badge (Optional) */}
                {category.productCount && category.productCount > 0 && (
                  <View style={[styles.countBadge, isActive && styles.activeCountBadge]}>
                    <ThemedText style={[styles.countText, isActive && styles.activeCountText]}>
                      {category.productCount}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Active Indicator */}
              {isActive && (
                <View style={styles.activeIndicator} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 16,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  tabButton: {
    position: 'relative',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 80,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  activeTabButton: {
    backgroundColor: '#EEF2FF',
    borderColor: '#8B5CF6',
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(139, 92, 246, 0.1)',
      },
    }),
  },
  firstTab: {
    marginLeft: 0,
  },
  lastTab: {
    marginRight: 20,
  },
  tabContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 2,
  },
  activeTabLabel: {
    color: '#8B5CF6',
    fontWeight: '700',
  },
  countBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCountBadge: {
    backgroundColor: '#8B5CF6',
  },
  countText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  activeCountText: {
    color: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -17,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
});