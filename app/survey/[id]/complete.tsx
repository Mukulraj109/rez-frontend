import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

const COLORS = {
  primary: '#00C06A',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  gold: '#FFD700',
  success: '#10B981',
};

export default function SurveyCompletePage() {
  const router = useRouter();
  const { coinsEarned, timeSpent } = useLocalSearchParams<{
    coinsEarned: string;
    timeSpent: string;
  }>();

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const coinScaleAnim = useRef(new Animated.Value(0)).current;
  const coinRotateAnim = useRef(new Animated.Value(0)).current;
  const statsSlideAnim = useRef(new Animated.Value(50)).current;
  const buttonSlideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // Check mark scale in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Fade in content
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Coin animation (parallel)
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.spring(coinScaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(coinRotateAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Stats slide in
    Animated.sequence([
      Animated.delay(500),
      Animated.spring(statsSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Button slide in
    Animated.sequence([
      Animated.delay(700),
      Animated.spring(buttonSlideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const coins = parseInt(coinsEarned || '0', 10);
  const time = parseInt(timeSpent || '0', 10);

  const coinRotation = coinRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          {/* Success Icon */}
          <Animated.View
            style={[
              styles.successIconContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.successIconGradient}
            >
              <Ionicons name="checkmark" size={64} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.title}>Survey Completed!</Text>
            <Text style={styles.subtitle}>
              Thank you for your valuable feedback
            </Text>
          </Animated.View>

          {/* Coins Earned */}
          <Animated.View
            style={[
              styles.coinsContainer,
              {
                transform: [
                  { scale: coinScaleAnim },
                  { rotate: coinRotation },
                ],
              },
            ]}
          >
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              style={styles.coinsGradient}
            >
              <Ionicons name="wallet" size={32} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          <Animated.View
            style={[
              styles.coinsTextContainer,
              { transform: [{ scale: coinScaleAnim }] },
            ]}
          >
            <Text style={styles.coinsLabel}>You earned</Text>
            <Text style={styles.coinsValue}>+{coins}</Text>
            <Text style={styles.coinsUnit}>ReZ Coins</Text>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              { transform: [{ translateY: statsSlideAnim }] },
            ]}
          >
            <View style={styles.statCard}>
              <Ionicons name="time-outline" size={24} color="#3B82F6" />
              <Text style={styles.statValue}>{formatTime(time)}</Text>
              <Text style={styles.statLabel}>Time Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCard}>
              <Ionicons name="star" size={24} color="#F59E0B" />
              <Text style={styles.statValue}>100%</Text>
              <Text style={styles.statLabel}>Completion</Text>
            </View>
          </Animated.View>

          {/* Message */}
          <Animated.View
            style={[
              styles.messageContainer,
              { transform: [{ translateY: statsSlideAnim }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.1)', 'rgba(5, 150, 105, 0.1)']}
              style={styles.messageGradient}
            >
              <Ionicons name="gift-outline" size={20} color={COLORS.success} />
              <Text style={styles.messageText}>
                Your coins have been added to your wallet!
              </Text>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <Animated.View
          style={[
            styles.bottomContainer,
            { transform: [{ translateY: buttonSlideAnim }] },
          ]}
        >
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace('/surveys')}
          >
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>Browse More Surveys</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.secondaryButtonText}>Go to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successIconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 32,
  },
  coinsContainer: {
    marginBottom: 16,
  },
  coinsGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  coinsTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  coinsLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  coinsValue: {
    fontSize: 48,
    fontWeight: '800',
    color: COLORS.primary,
  },
  coinsUnit: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 32,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  statCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  messageContainer: {
    width: '100%',
  },
  messageGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  messageText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.success,
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 20 : 24,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
