import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchSectionProps } from '@/types/search.types';
import CategoryCard from './CategoryCard';

const { width } = Dimensions.get('window');
const cardWidth = (width - 56) / 2; // Account for padding and gap

export default function SearchSection({
  section,
  onCategoryPress,
  onViewAllPress,
}: SearchSectionProps) {
  const handleViewAll = () => {
    if (onViewAllPress) {
      onViewAllPress(section);
    }
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.subtitle && (
            <Text style={styles.sectionSubtitle}>{section.subtitle}</Text>
          )}
        </View>
        
        {onViewAllPress && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={handleViewAll}
            activeOpacity={0.7}
          >
            <Text style={styles.viewAllText}>View all</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories Grid */}
      <View style={styles.categoriesGrid}>
        {section.categories.map((category, index) => (
          <CategoryCard
            key={category.id}
            category={category}
            onPress={onCategoryPress}
            size="medium"
            showCashback={true}
          />
        ))}
      </View>

      {/* Section Stats */}
      <View style={styles.sectionStats}>
        <View style={styles.statItem}>
          <Ionicons name="grid-outline" size={14} color="#6B7280" />
          <Text style={styles.statText}>
            {section.categories.length} categories
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={14} color="#10B981" />
          <Text style={styles.statText}>
            {section.categories.filter(c => c.isPopular).length} popular
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={14} color="#F59E0B" />
          <Text style={styles.statText}>
            Up to {Math.max(...section.categories.map(c => c.cashbackPercentage))}% cashback
          </Text>
        </View>
      </View>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2,
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F5F3FF',
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(139, 92, 246, 0.15)',
      },
    }),
  },
  viewAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '700',
    marginRight: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    }),
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 4,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});