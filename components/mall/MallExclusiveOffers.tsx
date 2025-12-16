/**
 * MallExclusiveOffers Component
 *
 * Horizontal scrolling section for exclusive mall offers
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
import { MallOffer } from '../../types/mall.types';
import MallOfferCard from './cards/MallOfferCard';

interface MallExclusiveOffersProps {
  offers: MallOffer[];
  isLoading?: boolean;
  onOfferPress: (offer: MallOffer) => void;
  onViewAllPress?: () => void;
}

const MallExclusiveOffers: React.FC<MallExclusiveOffersProps> = ({
  offers,
  isLoading = false,
  onOfferPress,
  onViewAllPress,
}) => {
  const renderOffer = useCallback(
    ({ item }: { item: MallOffer }) => (
      <MallOfferCard offer={item} onPress={onOfferPress} />
    ),
    [onOfferPress]
  );

  const keyExtractor = useCallback((item: MallOffer) => item.id || item._id, []);

  // Loading skeleton
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons name="pricetag" size={20} color="#EF4444" />
            <Text style={styles.title}>Exclusive Offers</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#EF4444" />
          <Text style={styles.loadingText}>Loading offers...</Text>
        </View>
      </View>
    );
  }

  // Empty state
  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="pricetag" size={20} color="#EF4444" />
          <Text style={styles.title}>Exclusive Offers</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveIndicator} />
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        </View>
        {onViewAllPress && (
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={onViewAllPress}
          >
            <Text style={styles.viewAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Limited time deals you don't want to miss
      </Text>

      {/* Offers List */}
      <FlatList
        data={offers}
        renderItem={renderOffer}
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
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EF4444',
    letterSpacing: 0.5,
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
    color: '#EF4444',
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

export default memo(MallExclusiveOffers);
