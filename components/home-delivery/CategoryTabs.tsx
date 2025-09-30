import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { CategoryTabsProps } from '@/types/home-delivery.types';

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategory;
          
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                isActive && styles.categoryTabActive,
              ]}
              onPress={() => onCategoryChange(category.id)}
              activeOpacity={0.7}
            >
              <View style={styles.categoryContent}>
                <View style={[
                  styles.iconContainer,
                  isActive && styles.iconContainerActive,
                ]}>
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={isActive ? '#8B5CF6' : '#6B7280'}
                  />
                </View>
                
                <ThemedText style={[
                  styles.categoryText,
                  isActive && styles.categoryTextActive,
                ]}>
                  {category.name}
                </ThemedText>
                
                {category.productCount > 0 && (
                  <View style={[
                    styles.countBadge,
                    isActive && styles.countBadgeActive,
                  ]}>
                    <ThemedText style={[
                      styles.countText,
                      isActive && styles.countTextActive,
                    ]}>
                      {category.productCount}
                    </ThemedText>
                  </View>
                )}
              </View>
              
              {isActive && <View style={styles.activeIndicator} />}
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
    borderBottomColor: '#F3F4F6',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    minWidth: 80,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  categoryTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(139, 92, 246, 0.15)',
      },
    }),
  },
  categoryContent: {
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#EDE9FE',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#8B5CF6',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    minWidth: 20,
  },
  countBadgeActive: {
    backgroundColor: '#8B5CF6',
  },
  countText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  countTextActive: {
    color: '#FFFFFF',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },
});