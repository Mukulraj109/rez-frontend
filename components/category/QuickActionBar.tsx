/**
 * QuickActionBar Component
 * Horizontal scrollable action buttons for quick navigation
 * Enhanced with better visual design and Rez brand colors
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
import { Ionicons } from '@expo/vector-icons';
import { quickActionsData, QuickAction } from '@/data/categoryDummyData';

interface QuickActionBarProps {
  categorySlug?: string;
  onActionPress?: (action: QuickAction) => void;
  actions?: QuickAction[];
}

// Quick action icons mapping for better visuals
const ACTION_ICONS: Record<string, string> = {
  offers: 'pricetag',
  cashback: 'wallet',
  exclusive: 'star',
  '60min': 'flash',
  compare: 'git-compare',
  play: 'game-controller',
  reviews: 'star',
  saved: 'heart',
};

const QuickActionItem = memo(({
  action,
  onPress,
  index,
}: {
  action: QuickAction;
  onPress: () => void;
  index: number;
}) => {
  const ionIconName = ACTION_ICONS[action.id];

  return (
    <TouchableOpacity
      style={styles.actionItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityLabel={action.name}
      accessibilityRole="button"
    >
      <View style={[styles.iconContainer, { backgroundColor: `${action.color}18` }]}>
        {ionIconName ? (
          <Ionicons name={ionIconName as any} size={22} color={action.color} />
        ) : (
          <Text style={styles.iconEmoji}>{action.icon}</Text>
        )}
      </View>
      <Text style={styles.actionName} numberOfLines={1}>{action.name}</Text>
      {action.id === '60min' && (
        <View style={styles.newBadge}>
          <Text style={styles.newBadgeText}>New</Text>
        </View>
      )}
    </TouchableOpacity>
  );
});

QuickActionItem.displayName = 'QuickActionItem';

const QuickActionBar: React.FC<QuickActionBarProps> = ({
  categorySlug,
  onActionPress,
  actions = quickActionsData,
}) => {
  const router = useRouter();

  const handlePress = useCallback((action: QuickAction) => {
    if (onActionPress) {
      onActionPress(action);
    } else if (action.route) {
      router.push(action.route as any);
    } else {
      // Default navigation based on action id
      switch (action.id) {
        case 'offers':
          router.push('/offers' as any);
          break;
        case 'cashback':
          router.push('/account/cashback' as any);
          break;
        case 'exclusive':
          router.push('/prive-offers' as any);
          break;
        case '60min':
          // Navigate to stores with 60-min filter
          router.push(`/stores?category=${categorySlug || 'food-dining'}&filter=try-buy` as any);
          break;
        case 'compare':
          router.push('/compare' as any);
          break;
        case 'play':
          router.push('/(tabs)/play' as any);
          break;
        case 'reviews':
          router.push('/explore/reviews' as any);
          break;
        case 'saved':
          router.push('/wishlist' as any);
          break;
        default:
          // Handle other actions
          break;
      }
    }
  }, [router, onActionPress, categorySlug]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {actions.map((action, index) => (
          <QuickActionItem
            key={action.id}
            action={action}
            index={index}
            onPress={() => handlePress(action)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 16,
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 12px rgba(11, 34, 64, 0.06)',
      },
    }),
  },
  scrollContent: {
    paddingHorizontal: 8,
    gap: 4,
  },
  actionItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    position: 'relative',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconEmoji: {
    fontSize: 22,
  },
  actionName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    maxWidth: 60,
  },
  newBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#00C06A',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default memo(QuickActionBar);
