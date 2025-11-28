/**
 * CategorySections Component
 *
 * Extracted from app/(tabs)/index.tsx (lines 719-873)
 * Displays horizontal scrollable category sections (Going Out, Home Delivery)
 *
 * @component
 */

import React from 'react';
import { View, ScrollView, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

/**
 * Category Item Interface
 */
export interface CategoryItem {
  /** Unique identifier */
  id: string;
  /** Category slug for navigation */
  slug: string;
  /** Display label */
  label: string;
  /** Icon name from Ionicons */
  icon: keyof typeof Ionicons.glyphMap;
  /** Callback when category is pressed */
  onPress: () => void;
}

/**
 * CategorySection Interface
 */
export interface CategorySection {
  /** Section title */
  title: string;
  /** Array of category items */
  categories: CategoryItem[];
  /** Callback for 'View all' button */
  onViewAll: () => void;
}

/**
 * CategorySections Props Interface
 */
export interface CategorySectionsProps {
  /** Array of category sections to display */
  sections: CategorySection[];
  /** Custom container styles */
  style?: any;
}

/**
 * CategorySections Component
 *
 * Renders category sections with:
 * - Section header with title and 'View all' button
 * - Horizontal scrollable category items
 * - Platform-specific rendering (web vs native)
 */
export const CategorySections: React.FC<CategorySectionsProps> = ({ sections, style }) => {
  return (
    <View style={style}>
      {sections.map((section, index) => (
        <View key={index} style={styles.section}>
          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={section.onViewAll}
              activeOpacity={0.8}
              accessibilityLabel={`View all ${section.title.toLowerCase()} categories`}
              accessibilityRole="button"
              accessibilityHint={`Double tap to view all ${section.title.toLowerCase()} category options`}
            >
              <ThemedText style={styles.viewAllText}>View all</ThemedText>
            </TouchableOpacity>
          </View>

          {/* Category Items - Platform-specific rendering */}
          {Platform.OS === 'web' ? (
            // Web: Use wrapper for better layout control
            <View style={styles.webScrollContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.webScrollContent}
              >
                {section.categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.horizontalCategoryItem}
                    onPress={category.onPress}
                    activeOpacity={0.85}
                    accessibilityLabel={`${category.label} category`}
                    accessibilityRole="button"
                    accessibilityHint={`Double tap to browse ${category.label.toLowerCase()} stores and products`}
                  >
                    <View style={styles.categoryIcon}>
                      <Ionicons name={category.icon} size={24} color="#8B5CF6" />
                    </View>
                    <ThemedText style={styles.categoryLabel}>{category.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          ) : (
            // Native: Direct ScrollView
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {section.categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={styles.horizontalCategoryItem}
                  onPress={category.onPress}
                  activeOpacity={0.85}
                  accessibilityLabel={`${category.label} category`}
                  accessibilityRole="button"
                  accessibilityHint={`Double tap to browse ${category.label.toLowerCase()} stores and products`}
                >
                  <View style={styles.categoryIcon}>
                    <Ionicons name={category.icon} size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={styles.categoryLabel}>{category.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  webScrollContainer: {
    paddingHorizontal: 4,
  },
  webScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalCategoryItem: {
    alignItems: 'center',
    minWidth: 70,
    marginRight: 12,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
});

export default CategorySections;
