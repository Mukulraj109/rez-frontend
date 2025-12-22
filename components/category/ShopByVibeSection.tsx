/**
 * ShopByVibeSection Component
 * Horizontal scrollable vibe cards for mood-based shopping
 * Adapted from Rez_v-2-main FashionVibeCard
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getVibesForCategory, Vibe } from '@/data/categoryDummyData';

interface ShopByVibeSectionProps {
  categorySlug: string;
  vibes?: Vibe[];
  onVibePress?: (vibe: Vibe) => void;
}

const CARD_WIDTH = 130;

const VibeCard = memo(({
  vibe,
  onPress,
}: {
  vibe: Vibe;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={[styles.vibeCard, { backgroundColor: `${vibe.color}12` }]}
    onPress={onPress}
    activeOpacity={0.8}
    accessibilityLabel={`Shop ${vibe.name} vibe`}
    accessibilityRole="button"
  >
    <View style={[styles.iconContainer, { backgroundColor: `${vibe.color}20` }]}>
      <Text style={styles.icon}>{vibe.icon}</Text>
    </View>
    <Text style={[styles.vibeName, { color: vibe.color }]}>{vibe.name}</Text>
    <Text style={styles.vibeDescription} numberOfLines={2}>{vibe.description}</Text>
  </TouchableOpacity>
));

VibeCard.displayName = 'VibeCard';

const ShopByVibeSection: React.FC<ShopByVibeSectionProps> = ({
  categorySlug,
  vibes,
  onVibePress,
}) => {
  const router = useRouter();
  const displayVibes = vibes || getVibesForCategory(categorySlug);

  const handlePress = useCallback((vibe: Vibe) => {
    if (onVibePress) {
      onVibePress(vibe);
    } else {
      router.push({
        pathname: '/products',
        params: { vibe: vibe.id, category: categorySlug },
      } as any);
    }
  }, [router, categorySlug, onVibePress]);

  if (!displayVibes || displayVibes.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.vibeEmoji}>✨</Text>
          <Text style={styles.sectionTitle}>Shop by Vibe</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {displayVibes.map((vibe) => (
          <VibeCard
            key={vibe.id}
            vibe={vibe}
            onPress={() => handlePress(vibe)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(11, 34, 64, 0.04), 0 8px 24px rgba(11, 34, 64, 0.06)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  vibeEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  vibeCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 26,
  },
  vibeName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  vibeDescription: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 15,
  },
});

export default memo(ShopByVibeSection);
