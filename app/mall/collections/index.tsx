/**
 * All Collections Page
 *
 * Displays all mall collections
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { mallApi } from '../../../services/mallApi';
import { MallCollection } from '../../../types/mall.types';
import MallEmptyState from '../../../components/mall/pages/MallEmptyState';
import MallLoadingSkeleton from '../../../components/mall/pages/MallLoadingSkeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CollectionCardProps {
  collection: MallCollection;
  onPress: (collection: MallCollection) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({ collection, onPress }) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'curated':
        return 'sparkles';
      case 'seasonal':
        return 'calendar';
      case 'trending':
        return 'trending-up';
      case 'personalized':
        return 'heart';
      default:
        return 'grid';
    }
  };

  return (
    <TouchableOpacity
      style={styles.collectionCard}
      onPress={() => onPress(collection)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: collection.image }}
        style={styles.collectionImage}
        resizeMode="cover"
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.cardOverlay}
      />
      <View style={styles.cardContent}>
        <View style={styles.typeBadge}>
          <Ionicons name={getTypeIcon(collection.type) as any} size={12} color="#FFFFFF" />
          <Text style={styles.typeBadgeText}>
            {collection.type.charAt(0).toUpperCase() + collection.type.slice(1)}
          </Text>
        </View>
        <Text style={styles.collectionName}>{collection.name}</Text>
        {collection.description && (
          <Text style={styles.collectionDescription} numberOfLines={2}>
            {collection.description}
          </Text>
        )}
        <View style={styles.brandCountRow}>
          <Ionicons name="storefront-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.brandCountText}>{collection.brandCount} brands</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function AllCollectionsPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [collections, setCollections] = useState<MallCollection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setError(null);
      const data = await mallApi.getCollections(50);
      setCollections(data);
    } catch (err: any) {
      console.error('Error fetching collections:', err);
      setError(err.message || 'Failed to load collections');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchCollections();
  }, [fetchCollections]);

  const handleCollectionPress = useCallback((collection: MallCollection) => {
    router.push(`/mall/collection/${collection.slug}` as any);
  }, [router]);

  const renderItem = useCallback(({ item }: { item: MallCollection }) => (
    <CollectionCard collection={item} onPress={handleCollectionPress} />
  ), [handleCollectionPress]);

  const keyExtractor = useCallback((item: MallCollection) =>
    item.id || item._id, []);

  const ListHeader = useCallback(() => (
    <View style={styles.listHeader}>
      <Text style={styles.headerTitle}>Curated Collections</Text>
      <Text style={styles.headerSubtitle}>
        Discover handpicked brands for every occasion
      </Text>
    </View>
  ), []);

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'All Collections' }} />
        <View style={styles.container}>
          <MallLoadingSkeleton count={4} type="list" />
        </View>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Stack.Screen options={{ headerTitle: 'All Collections' }} />
        <View style={styles.container}>
          <MallEmptyState
            title="Something went wrong"
            message={error}
            icon="alert-circle-outline"
            actionLabel="Try Again"
            onAction={handleRefresh}
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerTitle: 'All Collections' }} />

      <View style={styles.container}>
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <MallEmptyState
              title="No collections available"
              message="Check back later for new collections"
              icon="sparkles-outline"
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#00C06A"
              colors={['#00C06A']}
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  collectionCard: {
    width: SCREEN_WIDTH - 32,
    height: 200,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#374151',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  collectionName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  collectionDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
    lineHeight: 18,
  },
  brandCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandCountText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});
