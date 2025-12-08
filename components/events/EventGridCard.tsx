/**
 * EventGridCard Component
 * Compact event card for 2-column grid layout
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { EventItem } from '@/types/homepage.types';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = (screenWidth - 48) / 2; // 16px padding on each side + 16px gap
const CARD_IMAGE_HEIGHT = CARD_WIDTH * 0.75; // 4:3 aspect ratio

interface EventGridCardProps {
  event: EventItem;
  onPress: (event: EventItem) => void;
}

const EventGridCard: React.FC<EventGridCardProps> = ({ event, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(event);
  }, [event, onPress]);

  // Format date
  const formattedDate = useMemo(() => {
    try {
      const date = new Date(event.date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return event.date;
    }
  }, [event.date]);

  // Format price
  const priceDisplay = useMemo(() => {
    if (event.price?.isFree) {
      return 'Free';
    }
    return `${event.price?.currency || '₹'}${event.price?.amount || 0}`;
  }, [event.price]);

  const isFree = event.price?.isFree;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.9}
      accessibilityLabel={`${event.title}, ${formattedDate}, ${priceDisplay}`}
      accessibilityRole="button"
    >
      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <ThemedText style={styles.categoryText}>
            {event.category}
          </ThemedText>
        </View>

        {/* Online/Venue Badge */}
        <View
          style={[
            styles.typeBadge,
            event.isOnline ? styles.onlineBadge : styles.venueBadge,
          ]}
        >
          <Ionicons
            name={event.isOnline ? 'globe-outline' : 'location-outline'}
            size={10}
            color="#FFFFFF"
          />
          <ThemedText style={styles.typeBadgeText}>
            {event.isOnline ? 'Online' : 'Venue'}
          </ThemedText>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <ThemedText style={styles.title} numberOfLines={2}>
          {event.title}
        </ThemedText>

        {/* Date & Time */}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={12} color="#6B7280" />
          <ThemedText style={styles.dateText}>
            {formattedDate}
            {event.time && ` • ${event.time}`}
          </ThemedText>
        </View>

        {/* Price */}
        <View style={styles.priceRow}>
          {isFree ? (
            <View style={styles.freeBadge}>
              <ThemedText style={styles.freeText}>Free</ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.priceText}>{priceDisplay}</ThemedText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    height: CARD_IMAGE_HEIGHT,
    position: 'relative',
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    gap: 3,
  },
  onlineBadge: {
    backgroundColor: '#10B981',
  },
  venueBadge: {
    backgroundColor: '#F59E0B',
  },
  typeBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    padding: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 18,
    marginBottom: 6,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  dateText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  freeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  freeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
});

export default memo(EventGridCard);
