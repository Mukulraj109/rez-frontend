import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  white: '#FFFFFF',
  textDark: '#1A1A2E',
  textMuted: '#6B7280',
  background: '#F9FAFB',
  border: 'rgba(0, 0, 0, 0.08)',
};

export default function SurveyCompletePage() {
  const router = useRouter();
  const { coinsEarned, timeSpent, surveyTitle } = useLocalSearchParams<{
    coinsEarned: string;
    timeSpent: string;
    surveyTitle: string;
  }>();

  // Animations
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const [displayedCoins, setDisplayedCoins] = useState(0);

  const coins = parseInt(coinsEarned || '0', 10);
  const time = parseInt(timeSpent || '0', 10);
  const timeMinutes = Math.floor(time / 60);
  const timeSeconds = time % 60;

  useEffect(() => {
    // Run entrance animations
    Animated.sequence([
      // Check mark scale in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
      // Content fade and slide
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Coin count animation using timer
    const duration = 1500;
    const steps = 30;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuad = progress * (2 - progress); // easing function
      setDisplayedCoins(Math.round(coins * easeOutQuad));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayedCoins(coins);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [coins]);

  const handleBackToSurveys = () => {
    router.replace('/surveys');
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

        <View style={styles.content}>
          {/* Success Animation */}
          <Animated.View
            style={[
              styles.successCircle,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#10B981', '#00C06A']}
              style={styles.successGradient}
            >
              <Ionicons name="checkmark" size={56} color={COLORS.white} />
            </LinearGradient>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={styles.title}>Survey Completed!</Text>
            <Text style={styles.subtitle}>
              Thank you for sharing your feedback
            </Text>
          </Animated.View>

          {/* Reward Card */}
          <Animated.View
            style={[
              styles.rewardCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={['rgba(0, 192, 106, 0.1)', 'rgba(16, 185, 129, 0.1)']}
              style={styles.rewardGradient}
            >
              <View style={styles.rewardIconContainer}>
                <Ionicons name="wallet" size={32} color={COLORS.primary} />
              </View>
              <Text style={styles.rewardLabel}>You earned</Text>
              <Text style={styles.rewardValue}>+{displayedCoins}</Text>
              <Text style={styles.rewardCurrency}>ReZ Coins</Text>
            </LinearGradient>
          </Animated.View>

          {/* Stats */}
          <Animated.View
            style={[
              styles.statsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              </View>
              <Text style={styles.statValue}>
                {timeMinutes > 0 ? `${timeMinutes}m ${timeSeconds}s` : `${timeSeconds}s`}
              </Text>
              <Text style={styles.statLabel}>Time Taken</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statIcon}>
                <Ionicons name="document-text-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{surveyTitle || 'Survey'}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </Animated.View>

          {/* Info Banner */}
          <Animated.View
            style={[
              styles.infoBanner,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
            <Text style={styles.infoText}>
              Coins have been added to your wallet and can be used for rewards
            </Text>
          </Animated.View>
        </View>

        {/* Bottom Buttons */}
        <Animated.View
          style={[
            styles.bottomButtons,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleGoHome}
          >
            <Ionicons name="home-outline" size={20} color={COLORS.textDark} />
            <Text style={styles.secondaryButtonText}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleBackToSurveys}
          >
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButtonGradient}
            >
              <Text style={styles.primaryButtonText}>More Surveys</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </LinearGradient>
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
  successCircle: {
    marginBottom: 32,
  },
  successGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  rewardCard: {
    width: '100%',
    marginBottom: 24,
  },
  rewardGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  rewardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  rewardLabel: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  rewardValue: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.primary,
  },
  rewardCurrency: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 2,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: 16,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(107, 114, 128, 0.08)',
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 12,
    overflow: 'hidden',
  },
  primaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.white,
  },
});
