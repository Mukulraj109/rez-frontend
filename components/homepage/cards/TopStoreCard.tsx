import React, { useMemo, useCallback } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import FastImage from '@/components/common/FastImage';

export interface TopStoreCardProps {
  store: {
    id: string;
    name: string;
    image?: string;
    banner?: string | string[];
    logo?: string;
    rating: {
      value: number;
      count?: number;
    };
    distance?: string;
    cashback?: {
      percentage: number;
      maxAmount?: number;
    };
    category?: string;
  };
  onPress: (store: any) => void;
  width?: number;
}

// Calculate earn amount based on cashback percentage and average order
const calculateEarnAmount = (cashbackPercentage: number): number => {
  const avgOrderAmount = 1200; // Estimated average order amount in INR
  return Math.round((cashbackPercentage / 100) * avgOrderAmount);
};

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: TopStoreCardProps, nextProps: TopStoreCardProps) => {
  return (
    prevProps.store.id === nextProps.store.id &&
    prevProps.width === nextProps.width &&
    prevProps.store.rating?.value === nextProps.store.rating?.value &&
    prevProps.store.distance === nextProps.store.distance &&
    prevProps.store.cashback?.percentage === nextProps.store.cashback?.percentage
  );
};

function TopStoreCard({ store, onPress, width = 180 }: TopStoreCardProps) {
  // Get the image URL (prioritize banner, then image, then logo)
  const imageUrl = useMemo(() => {
    if (store.banner) {
      if (Array.isArray(store.banner) && store.banner.length > 0) {
        return store.banner[0];
      }
      if (typeof store.banner === 'string') {
        return store.banner;
      }
    }
    return store.image || store.logo || '';
  }, [store.banner, store.image, store.logo]);

  // Format rating
  const formattedRating = useMemo(() => {
    return typeof store.rating?.value === 'number'
      ? store.rating.value.toFixed(1)
      : store.rating?.value || '0.0';
  }, [store.rating?.value]);

  // Calculate earn amount
  const earnAmount = useMemo(() => {
    const percentage = store.cashback?.percentage || 10;
    return calculateEarnAmount(percentage);
  }, [store.cashback?.percentage]);

  // Handle press
  const handlePress = useCallback(() => {
    try {
      onPress(store);
    } catch (error) {
      console.error('TopStoreCard press error:', error);
    }
  }, [onPress, store]);

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
      delayPressIn={0}
      delayPressOut={0}
    >
      <ThemedView style={styles.card}>
        {/* Store Image */}
        <View style={styles.imageContainer}>
          {imageUrl ? (
            <FastImage
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              showLoader={true}
            />
          ) : (
            <View style={[styles.image, styles.placeholderImage]}>
              <Ionicons name="storefront-outline" size={40} color="#9CA3AF" />
            </View>
          )}
        </View>

        {/* Store Details */}
        <View style={styles.content}>
          {/* Store Name */}
          <ThemedText style={styles.name} numberOfLines={1}>
            {store.name}
          </ThemedText>

          {/* Rating and Distance Row */}
          <View style={styles.infoRow}>
            <Ionicons name="star" size={14} color="#FFC857" />
            <ThemedText style={styles.ratingText}>
              {formattedRating}
            </ThemedText>
            {store.distance && (
              <>
                <View style={styles.dot} />
                <ThemedText style={styles.distanceText}>
                  {store.distance}
                </ThemedText>
              </>
            )}
          </View>

          {/* Earn Badge */}
          <View style={styles.earnBadge}>
            <ThemedText style={styles.earnText}>
              Earn ₹{earnAmount}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default React.memo(TopStoreCard, arePropsEqual);

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    width: '100%',
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    marginLeft: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#9CA3AF',
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#6B7280',
  },
  earnBadge: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  earnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
