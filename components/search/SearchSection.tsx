import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
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
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginRight: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    fontWeight: '500',
    marginLeft: 4,
    textAlign: 'center',
  },
});