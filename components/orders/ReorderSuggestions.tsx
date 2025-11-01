// ReorderSuggestions Component
// Displays smart reorder suggestions based on user's order history

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from 'react-native';
import { useReorderSuggestions } from '@/hooks/useReorder';
import { router } from 'expo-router';

interface ReorderSuggestionsProps {
  onAddToCart?: (productId: string, quantity: number) => void;
}

export default function ReorderSuggestions({ onAddToCart }: ReorderSuggestionsProps) {
  const { suggestions, loading, error, refresh } = useReorderSuggestions();

  useEffect(() => {
    refresh();
  }, []);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'consumable':
        return '🔄';
      case 'frequent':
        return '⭐';
      case 'subscription':
        return '📦';
      default:
        return '💡';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'consumable':
        return '#f59e0b';
      case 'frequent':
        return '#8b5cf6';
      case 'subscription':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const handleProductPress = (productId: string, storeId: string) => {
    router.push({
      pathname: '/ProductPage',
      params: { id: storeId, highlightProduct: productId }
    });
  };

  const handleQuickAdd = (productId: string, quantity: number) => {
    if (onAddToCart) {
      onAddToCart(productId, quantity);
    } else {
      // Navigate to product page
      router.push(`/ProductPage?highlightProduct=${productId}`);
    }
  };

  const renderSuggestion = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.suggestionCard}
      onPress={() => handleProductPress(item.productId, item.storeId)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={[
          styles.typeBadge,
          { backgroundColor: getTypeColor(item.type) + '20' }
        ]}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={[
            styles.typeText,
            { color: getTypeColor(item.type) }
          ]}>
            {item.type === 'consumable' ? 'Time to Restock' :
             item.type === 'frequent' ? 'Your Favorite' :
             'Subscribe & Save'}
          </Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Image
          source={{ uri: item.productImage }}
          style={styles.productImage}
          resizeMode="cover"
        />

        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
          <Text style={styles.storeName} numberOfLines={1}>
            {item.storeName}
          </Text>

          <Text style={styles.reason} numberOfLines={2}>
            {item.reason}
          </Text>

          <View style={styles.bottomRow}>
            <Text style={styles.price}>₹{item.currentPrice.toFixed(2)}</Text>

            {item.isAvailable ? (
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleQuickAdd(item.productId, item.suggestedQuantity);
                }}
              >
                <Text style={styles.quickAddText}>
                  Add {item.suggestedQuantity}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.unavailableBadge}>
                <Text style={styles.unavailableText}>Out of Stock</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {item.orderFrequency && (
        <View style={styles.frequencyInfo}>
          <Text style={styles.frequencyText}>
            You order this every {item.orderFrequency} days
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>No Suggestions Yet</Text>
      <Text style={styles.emptyText}>
        Order more items to get personalized reorder suggestions
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading suggestions...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return renderEmpty();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Suggestions for You</Text>
        <Text style={styles.headerSubtitle}>
          Based on your order history
        </Text>
      </View>

      <FlatList
        data={suggestions}
        renderItem={renderSuggestion}
        keyExtractor={item => item.productId}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280'
  },
  listContent: {
    paddingHorizontal: 16
  },
  suggestionCard: {
    width: 280,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden'
  },
  cardHeader: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  typeIcon: {
    fontSize: 14,
    marginRight: 6
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f3f4f6'
  },
  productInfo: {
    flex: 1,
    marginLeft: 12
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4
  },
  storeName: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8
  },
  reason: {
    fontSize: 12,
    color: '#6366f1',
    marginBottom: 8,
    fontStyle: 'italic'
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto'
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },
  quickAddButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6
  },
  quickAddText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600'
  },
  unavailableBadge: {
    backgroundColor: '#fef2f2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  unavailableText: {
    fontSize: 11,
    color: '#dc2626',
    fontWeight: '600'
  },
  frequencyInfo: {
    padding: 12,
    backgroundColor: '#f9fafb',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb'
  },
  frequencyText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280'
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center'
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 12
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center'
  }
});
