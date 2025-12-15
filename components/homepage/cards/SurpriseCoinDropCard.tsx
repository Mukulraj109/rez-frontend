import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  white: '#FFFFFF',
  textDark: '#0B2240',
};

interface SurpriseCoinDropCardProps {
  available: boolean;
  coins: number;
  message: string | null;
  onPress: () => void;
}

const SurpriseCoinDropCard: React.FC<SurpriseCoinDropCardProps> = ({
  available,
  coins,
  message,
  onPress,
}) => {
  const gradientColors: readonly [string, string, string] = available
    ? ['#FFB020', '#FFA010', '#FF9000']
    : ['#9CA3AF', '#6B7280', '#4B5563'];

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (available) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [available, pulseAnim]);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        available && { transform: [{ scale: pulseAnim }] },
      ]}
    >
      <TouchableOpacity
        activeOpacity={available ? 0.9 : 1}
        onPress={available ? onPress : undefined}
        style={styles.touchable}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.glassOverlay}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons
                name={available ? 'gift' : 'gift-outline'}
                size={24}
                color={COLORS.white}
              />
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.cardTitle}>Surprise Drop</Text>
              <Text style={styles.cardSubtitle}>
                {available ? 'Lucky you!' : 'Check back later'}
              </Text>
            </View>

            {/* Coins Badge (if available) */}
            {available && coins > 0 && (
              <View style={styles.badgeContainer}>
                <View style={styles.coinBadge}>
                  <Ionicons name="sparkles" size={12} color="#FFD700" />
                  <Text style={styles.coinText}>+{coins}</Text>
                </View>
              </View>
            )}

            {/* Action */}
            {available ? (
              <View style={styles.actionIndicator}>
                <Ionicons name="sparkles" size={14} color={COLORS.white} />
                <Text style={styles.actionText}>Claim Now!</Text>
              </View>
            ) : (
              <View style={styles.waitingContainer}>
                <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
                <Text style={styles.waitingText}>Coming soon...</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FFB020',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  touchable: {
    flex: 1,
  },
  cardGradient: {
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    minHeight: 140,
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  contentContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  coinBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  actionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
  waitingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  waitingText: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default SurpriseCoinDropCard;
