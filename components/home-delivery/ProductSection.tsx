import React from 'react';
import {
  View,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { HomeDeliveryProductCard } from './HomeDeliveryProductCard';
import { ProductSectionProps, HomeDeliveryProduct } from '@/types/home-delivery.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // Account for padding and gap

export function ProductSection({
  section,
  onProductPress,
  onViewAll,
}: ProductSectionProps) {
  const displayProducts = section.maxProducts 
    ? section.products.slice(0, section.maxProducts)
    : section.products;

  const renderProductCard = ({ item }: { item: HomeDeliveryProduct }) => (
    <View style={{ width: CARD_WIDTH }}>
      <HomeDeliveryProductCard
        product={item}
        onPress={() => onProductPress(item)}
        showCashback={true}
        showDeliveryTime={true}
      />
    </View>
  );

  if (section.products.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleContainer}>
          <ThemedText style={styles.sectionTitle}>
            {section.title}
          </ThemedText>
          {section.subtitle && (
            <ThemedText style={styles.sectionSubtitle}>
              {section.subtitle}
            </ThemedText>
          )}
        </View>
        
        {section.showViewAll && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAll}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.viewAllText}>View all</ThemedText>
          </TouchableOpacity>
        )}
      </View>

      {/* Products Grid */}
      <FlatList
        data={displayProducts}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.productsGrid}
        columnWrapperStyle={styles.row}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400',
  },
  viewAllButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  productsGrid: {
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  separator: {
    height: 12,
  },
});