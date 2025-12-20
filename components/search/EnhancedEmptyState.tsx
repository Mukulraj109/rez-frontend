import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProductItem, StoreItem } from '@/services/searchDiscoveryApi';
import SmartSuggestionCard from './SmartSuggestionCard';

interface EnhancedEmptyStateProps {
  query: string;
  similarProducts: ProductItem[];
  nearbyStores: StoreItem[];
  onTryKeywords: () => void;
  onExpandDistance: () => void;
  onCheckOnline: () => void;
  onProductPress?: (product: ProductItem) => void;
  onStorePress?: (store: StoreItem) => void;
}

export default function EnhancedEmptyState({
  query,
  similarProducts,
  nearbyStores,
  onTryKeywords,
  onExpandDistance,
  onCheckOnline,
  onProductPress,
  onStorePress,
}: EnhancedEmptyStateProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.messageContainer}>
        <Ionicons name="search-outline" size={48} color="#9CA3AF" />
        <Text style={styles.messageTitle}>No exact results found</Text>
        <Text style={styles.messageText}>
          We couldn't find any results for "{query}". Try different keywords or browse similar items.
        </Text>
      </View>

      {similarProducts && similarProducts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Products</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {similarProducts.map((product) => (
              <SmartSuggestionCard
                key={product._id}
                product={product}
                onPress={onProductPress || (() => {})}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {nearbyStores && nearbyStores.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby Stores</Text>
          <View style={styles.storesList}>
            {nearbyStores.slice(0, 3).map((store) => (
              <TouchableOpacity 
                key={store._id} 
                style={styles.storeItem}
                onPress={() => onStorePress?.(store)}
                activeOpacity={0.7}
              >
                {store.logo ? (
                  <Image source={{ uri: store.logo }} style={styles.storeLogo} resizeMode="cover" />
                ) : (
                  <View style={styles.storeLogoPlaceholder}>
                    <Ionicons name="storefront-outline" size={24} color="#9CA3AF" />
                  </View>
                )}
                <View style={styles.storeInfo}>
                  <Text style={styles.storeName}>{store.name}</Text>
                  {store.distance && (
                    <Text style={styles.storeDistance}>{store.distance.toFixed(1)} km away</Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onTryKeywords}>
          <Ionicons name="refresh-outline" size={20} color="#00C06A" />
          <Text style={styles.actionText}>Try different keywords</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onExpandDistance}>
          <Ionicons name="location-outline" size={20} color="#00C06A" />
          <Text style={styles.actionText}>Expand distance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onCheckOnline}>
          <Ionicons name="globe-outline" size={20} color="#00C06A" />
          <Text style={styles.actionText}>Check online stores</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  content: {
    paddingVertical: 24,
  },
  messageContainer: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  messageTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  messageText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  storesList: {
    paddingHorizontal: 16,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  storeLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeDistance: {
    fontSize: 12,
    color: '#6B7280',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#00C06A',
    gap: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00C06A',
  },
});




