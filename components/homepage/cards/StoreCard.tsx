import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  View 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { StoreCardProps } from '@/types/homepage.types';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function StoreCard({ 
  store, 
  onPress, 
  width = 280,
  variant = 'default'
}: StoreCardProps) {
  const cardBackground = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const primaryColor = useThemeColor({}, 'tint');
  const renderRating = () => {
    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#F59E0B" />
        <ThemedText style={[styles.ratingText, { color: textColor }]}>
          {store.rating.value}
        </ThemedText>
        <ThemedText style={[styles.ratingCount, { color: textSecondary }]}>
          ({store.rating.count})
        </ThemedText>
      </View>
    );
  };

  const renderBadges = () => {
    const badges = [];
    
    if (store.isNew) {
      badges.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.newBadgeText}>New</ThemedText>
        </View>
      );
    }
    
    if (store.isTrending) {
      badges.push(
        <View key="trending" style={[styles.badge, styles.trendingBadge]}>
          <ThemedText style={styles.trendingBadgeText}>🔥 Trending</ThemedText>
        </View>
      );
    }

    return badges.length > 0 ? (
      <View style={styles.badgesContainer}>
        {badges}
      </View>
    ) : null;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => {
        try {
          onPress(store);
        } catch (error) {
          console.error('Store card press error:', error);
        }
      }}
      activeOpacity={0.8}
      delayPressIn={0}
      delayPressOut={0}
    >
      <ThemedView style={styles.card}>
        {/* Store Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: store.image }} 
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {renderBadges()}
        </View>

        {/* Store Details */}
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.name} numberOfLines={1}>
              {store.name}
            </ThemedText>
            {renderRating()}
          </View>
          
          <ThemedText style={styles.description} numberOfLines={2}>
            {store.description}
          </ThemedText>

          {/* Location and Delivery Info */}
          <View style={styles.locationInfo}>
            {store.location && (
              <View style={styles.locationContainer}>
                <Ionicons name="location-outline" size={14} color="#6B7280" />
                <ThemedText style={styles.locationText}>
                  {store.location.distance || store.location.city}
                </ThemedText>
              </View>
            )}
            
            {store.deliveryTime && (
              <View style={styles.deliveryContainer}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <ThemedText style={styles.deliveryText}>
                  {store.deliveryTime}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Cashback Information */}
          <View style={styles.footer}>
            <View style={styles.cashbackContainer}>
              <ThemedText style={styles.cashbackText}>
                Up to {store.cashback.percentage}% cash back
              </ThemedText>
            </View>
            
            {store.minimumOrder && (
              <ThemedText style={styles.minOrderText}>
                Min ₹{store.minimumOrder}
              </ThemedText>
            )}
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles handled by parent
    flex: 0,
    flexShrink: 0,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  trendingBadge: {
    backgroundColor: '#F59E0B',
  },
  trendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  ratingCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  locationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  deliveryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashbackContainer: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cashbackText: {
    fontSize: 12,
    color: '#4F46E5',
    fontWeight: '600',
  },
  minOrderText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});