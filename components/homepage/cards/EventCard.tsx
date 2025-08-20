import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  View 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EventCardProps } from '@/types/homepage.types';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function EventCard({ 
  event, 
  onPress, 
  width = 280 
}: EventCardProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const cardBackground = useThemeColor({ light: '#FFFFFF', dark: '#1F2937' }, 'background');
  const textColor = useThemeColor({}, 'text');
  const textSecondary = useThemeColor({ light: '#6B7280', dark: '#9CA3AF' }, 'text');
  const borderColor = useThemeColor({ light: '#E5E7EB', dark: '#374151' }, 'border');
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = () => {
    if (event.price.isFree) {
      return 'Free';
    }
    return `${event.price.currency}${event.price.amount}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => onPress(event)}
      activeOpacity={0.95}
    >
      <ThemedView style={[styles.card, { backgroundColor: cardBackground, borderColor }]}>
        {/* Event Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: event.image }} 
            style={styles.image}
            resizeMode="cover"
            fadeDuration={0}
          />
          {/* Image Overlay Gradient */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.imageOverlay}
          />
          {event.isOnline && (
            <View style={styles.onlineBadge}>
              <ThemedText style={styles.onlineBadgeText}>Online</ThemedText>
            </View>
          )}
          {/* Price Badge on Image */}
          <View style={[styles.priceBadge, { backgroundColor: event.price.isFree ? '#10B981' : '#8B5CF6' }]}>
            <ThemedText style={styles.priceBadgeText}>{formatPrice()}</ThemedText>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.content}>
          <ThemedText style={[styles.title, { color: textColor }]} numberOfLines={2}>
            {event.title}
          </ThemedText>
          
          <ThemedText style={[styles.subtitle, { color: textSecondary }]} numberOfLines={1}>
            {event.subtitle}
          </ThemedText>

          <View style={styles.metaInfo}>
            <View style={styles.locationContainer}>
              <ThemedText style={[styles.location, { color: textSecondary }]}>
                📍 {event.isOnline ? 'Online Event' : event.location}
              </ThemedText>
            </View>

            <View style={styles.dateContainer}>
              <ThemedText style={[styles.date, { color: textColor }]}>
                📅 {formatDate(event.date)}
              </ThemedText>
              {event.time && (
                <ThemedText style={[styles.time, { color: textSecondary }]}>
                  🕐 {event.time}
                </ThemedText>
              )}
            </View>
          </View>

          {/* Category Badge */}
          <View style={[styles.categoryBadge, { backgroundColor: `${textSecondary}15`, borderColor }]}>
            <ThemedText style={[styles.categoryText, { color: textSecondary }]}>
              {event.category}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexShrink: 0,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  onlineBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  onlineBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  priceBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  metaInfo: {
    gap: 8,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  date: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});