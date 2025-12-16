/**
 * MallCollections Component
 *
 * Horizontal scrolling section for curated collections
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MallCollection } from '../../types/mall.types';
import MallCollectionCard from './cards/MallCollectionCard';

interface MallCollectionsProps {
  collections: MallCollection[];
  isLoading?: boolean;
  onCollectionPress: (collection: MallCollection) => void;
  onViewAllPress?: () => void;
}

const MallCollections: React.FC<MallCollectionsProps> = ({
  collections,
  isLoading = false,
  onCollectionPress,
  onViewAllPress,
}) => {
  const renderCollection = useCallback(
    ({ item }: { item: MallCollection }) => (
      <MallCollectionCard collection={item} onPress={onCollectionPress} />
    ),
    [onCollectionPress]
  );

  const keyExtractor = useCallback((item: MallCollection) => item.id || item._id, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="grid" size={20} color="#8B5CF6" />
            <Text style={styles.title}>Curated Collections</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading collections...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!collections || collections.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="grid" size={20} color="#8B5CF6" />
          <Text style={styles.title}>Curated Collections</Text>
        </View>
        {onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Handpicked selections for every occasion
      </Text>

      {/* Collections List */}
      <FlatList
        data={collections}
        renderItem={renderCollection}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default memo(MallCollections);
