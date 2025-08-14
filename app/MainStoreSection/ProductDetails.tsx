import React from 'react';
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

export default function ProductDetails({
  title = 'Little Big Comfort Tee',
  description = 'Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric for all-day comfort and effortless style',
  location = 'BTM',
  distance = '0.7 Km',
  isOpen = true,
  onOpenMap,
}: ProductDetailsProps) {
  const { width } = Dimensions.get('window');
  const isSmall = width < 360;

  return (
    <View style={[styles.container, isSmall && styles.containerCompact]}>
      <View style={styles.rowTop}>
        <ThemedText style={[styles.title, isSmall && styles.titleSmall]} numberOfLines={2}>
          {title}
        </ThemedText>

       
      </View>

      <ThemedText style={[styles.description, isSmall && styles.descriptionSmall]} numberOfLines={3}>
        {description}
      </ThemedText>

      <View style={styles.rowBottom}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onOpenMap}
          style={styles.locationPill}
          accessibilityRole="button"
          accessibilityLabel={`Open map for ${location}`}
        >
          <Ionicons name="location-outline" size={16} color="#7C3AED" />
          <ThemedText style={styles.locationText}>{distance} • {location}</ThemedText>
        </TouchableOpacity>

        <View style={[styles.openBadge, { backgroundColor: isOpen ? '#E6FDF3' : '#FEF3F2' }]}>
          <ThemedText style={[styles.openText, { color: isOpen ? '#059669' : '#DC2626' }]}>
            {isOpen ? 'Open' : 'Closed'}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    // subtle bottom divider look (keeps visual separation when stacked)
    borderBottomWidth: 0,
  },
  containerCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    justifyContent: 'space-between',
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
  },
  locationText: {
    marginLeft: 8,
    color: '#374151',
    fontSize: 13,
    fontWeight: '600',
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
  },
  openText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
