import React, { memo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface ProductDetailsProps {
  title?: string;
  description?: string;
  price?: string;
  location?: string;
  distance?: string;
  isOpen?: boolean;
  onOpenMap?: () => void;
}

export default memo(function ProductDetails({
  title,
  description,
  location,
  distance,
  isOpen,
  onOpenMap,
}: ProductDetailsProps) {
  // Show error state if required data is missing
  if (!title || !description) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
        <ThemedText style={styles.errorText}>
          Product information unavailable
        </ThemedText>
      </View>
    );
  }
  const { width } = Dimensions.get('window');
  const isSmall = width < 360;

  return (
    <View
      style={[styles.container, isSmall && styles.containerCompact]}
      accessibilityRole="region"
      accessibilityLabel={`Product details. ${title}. ${distance} away in ${location}. ${isOpen ? 'Open now' : 'Currently closed'}`}
    >
      <View style={styles.rowTop}>
        <ThemedText
          style={[styles.title, isSmall && styles.titleSmall]}
          numberOfLines={2}
          accessibilityRole="header"
        >
          {title}
        </ThemedText>


      </View>

      <ThemedText style={[styles.description, isSmall && styles.descriptionSmall]} numberOfLines={3}>
        {description}
      </ThemedText>

      <View style={styles.rowBottom}>
        {(distance || location) && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenMap}
            style={styles.locationPill}
            accessibilityRole="button"
            accessibilityLabel={`Location: ${distance || ''} ${distance && location ? 'away at' : ''} ${location || ''}`}
            accessibilityHint="Double tap to open map"
          >
            <Ionicons name="location-outline" size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
            <ThemedText 
              style={styles.locationText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {distance && location ? `${distance} • ${location}` : distance || location || 'Location not available'}
            </ThemedText>
          </TouchableOpacity>
        )}

        {isOpen !== undefined && (
          <View
            style={[styles.openBadge, { backgroundColor: isOpen ? '#E6FDF3' : '#FEF3F2' }]}
            accessibilityLabel={isOpen ? 'Store is open' : 'Store is closed'}
            accessibilityRole="text"
          >
            <ThemedText style={[styles.openText, { color: isOpen ? '#059669' : '#DC2626' }]}>
              {isOpen ? 'Open' : 'Closed'}
            </ThemedText>
          </View>
        )}
      </View>
    </View>
);
});

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    // subtle bottom divider look (keeps visual separation when stacked)
    borderBottomWidth: 0,
    overflow: 'hidden', // Prevent content from overflowing
  },
  containerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  errorText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 28,
    marginRight: 12,
  },
  titleSmall: {
    fontSize: 20,
    lineHeight: 26,
  },
  priceWrap: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 82,
  },
  price: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: '800',
  },
  description: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  descriptionSmall: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowBottom: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 10,
    flexWrap: 'wrap',
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EEF2FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    flex: 1,
    minWidth: 0, // Allow shrinking below content size
    maxWidth: '100%', // Prevent overflow
  },
  locationText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    flexShrink: 1, // Allow text to shrink
  },
  openBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
    flexShrink: 0, // Prevent badge from shrinking
  },
  openText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
