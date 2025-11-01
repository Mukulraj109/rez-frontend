import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '@/types/search.types';

interface StoreResultCardProps {
  store: SearchResult;
  onPress: (store: SearchResult) => void;
}

export default function StoreResultCard({
  store,
  onPress,
}: StoreResultCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(store)}
      activeOpacity={0.7}
    >
      {/* Store Logo */}
      <View style={styles.logoContainer}>
        {store.image ? (
          <Image source={{ uri: store.image }} style={styles.logo} resizeMode="cover" />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Ionicons name="storefront-outline" size={32} color="#9CA3AF" />
          </View>
        )}
      </View>

      {/* Store Info */}
      <View style={styles.infoContainer}>
        {/* Store Name */}
        <Text style={styles.name} numberOfLines={1}>
          {store.title}
        </Text>

        {/* Description */}
        {store.description && (
          <Text style={styles.description} numberOfLines={2}>
            {store.description}
          </Text>
        )}

        {/* Meta Info */}
        <View style={styles.metaContainer}>
          {/* Rating */}
          {store.rating && (
            <View style={styles.metaItem}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.metaText}>{store.rating.toFixed(1)}</Text>
            </View>
          )}

          {/* Location */}
          {store.location && (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={styles.metaText} numberOfLines={1}>
                {store.location}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsRow}>
          {/* Cashback Badge */}
          {store.cashbackPercentage > 0 && (
            <View style={styles.cashbackBadge}>
              <Ionicons name="gift-outline" size={12} color="#10B981" />
              <Text style={styles.cashbackText}>
                {store.cashbackPercentage}% cashback
              </Text>
            </View>
          )}

          {/* Visit Button */}
          <View style={styles.visitButton}>
            <Text style={styles.visitButtonText}>Visit Store</Text>
            <Ionicons name="arrow-forward" size={14} color="#7C3AED" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    height: 120, // Fixed height for consistency
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(139, 92, 246, 0.12)',
      },
    }),
  },
  logoContainer: {
    marginRight: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
    lineHeight: 18,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  metaText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cashbackBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  cashbackText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  visitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  visitButtonText: {
    fontSize: 13,
    color: '#7C3AED',
    fontWeight: '600',
  },
});

