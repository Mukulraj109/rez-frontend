import React from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { GoingOutProductCard } from './GoingOutProductCard';
import { CashbackHubSectionProps } from '@/types/going-out.types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = 160;
const CARD_SPACING = 12;

export function CashbackHubSection({
  section,
  onProductPress,
  onViewAll,
}: CashbackHubSectionProps) {
  const handleViewAll = () => {
    onViewAll(section);
  };

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
          {section.subtitle && (
            <ThemedText style={styles.sectionSubtitle}>{section.subtitle}</ThemedText>
          )}
        </View>
        
        {section.showViewAll && (
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={handleViewAll}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.viewAllText}>View all</ThemedText>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Products Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {section.products.map((product, index) => (
          <View
            key={product.id}
            style={[
              styles.productContainer,
              index === 0 && styles.firstProduct,
              index === section.products.length - 1 && styles.lastProduct,
            ]}
          >
            <GoingOutProductCard
              product={product}
              onPress={onProductPress}
              width={CARD_WIDTH}
              showAddToCart={true}
            />
          </View>
        ))}
      </ScrollView>

      {/* Section Stats */}
      <View style={styles.sectionStats}>
        <View style={styles.statItem}>
          <Ionicons name="cube-outline" size={14} color="#6B7280" />
          <ThemedText style={styles.statText}>
            {section.products.length} products
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="trending-up-outline" size={14} color="#10B981" />
          <ThemedText style={styles.statText}>
            {section.products.filter(p => p.rating && p.rating.value >= 4.5).length} top rated
          </ThemedText>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="cash-outline" size={14} color="#F59E0B" />
          <ThemedText style={styles.statText}>
            Up to {Math.max(...section.products.map(p => p.cashback.percentage))}% cashback
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
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
  scrollView: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingVertical: 4,
  },
  productContainer: {
    marginRight: CARD_SPACING,
  },
  firstProduct: {
    marginLeft: 20,
  },
  lastProduct: {
    marginRight: 20,
  },
  sectionStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
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
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
    textAlign: 'center',
  },
});