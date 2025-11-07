import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SpinWheelGame from '@/components/gamification/SpinWheelGame';
import SpinHistory from '@/components/gamification/SpinHistory';
import CelebrationModal from '@/components/gamification/CelebrationModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useGamification } from '@/contexts/GamificationContext';
import gamificationAPI from '@/services/gamificationApi';
import type { SpinWheelSegment, SpinWheelResult } from '@/types/gamification.types';

export default function SpinWheelPage() {
  const [loading, setLoading] = useState(true);
  const [segments, setSegments] = useState<SpinWheelSegment[]>([]);
  const [spinsRemaining, setSpinsRemaining] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastResult, setLastResult] = useState<SpinWheelResult | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newBalance, setNewBalance] = useState(0);

  const { state: gamificationState, actions: gamificationActions } = useGamification();

  useEffect(() => {
    // ✅ FIX: Load gamification data on mount to ensure coins are synced
    gamificationActions.loadGamificationData(true);
    loadSpinWheelData();
  }, []);

  const loadSpinWheelData = async () => {
    try {
      setLoading(true);
      const response = await gamificationAPI.getSpinWheelData();

      if (response.success && response.data) {
        setSegments(response.data.segments || getDefaultSegments());
        // ✅ FIX: Check for undefined/null, not falsy (0 is valid!)
        setSpinsRemaining(response.data.spinsRemaining !== undefined ? response.data.spinsRemaining : 3);
      } else {
        // Fallback to default segments
        setSegments(getDefaultSegments());
        setSpinsRemaining(3);
      }
    } catch (error: any) {
      console.error('Error loading spin wheel data:', error);
      Alert.alert(
        'Error',
        'Failed to load spin wheel data. Using default configuration.',
        [{ text: 'OK' }]
      );
      // Use default segments on error
      setSegments(getDefaultSegments());
      setSpinsRemaining(3);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSegments = (): SpinWheelSegment[] => {
    return [
      {
        id: '1',
        label: '10 Coins',
        value: 10,
        color: '#FF6B6B',
        type: 'coins',
        icon: 'star',
      },
      {
        id: '2',
        label: '5 Coins',
        value: 5,
        color: '#4ECDC4',
        type: 'coins',
        icon: 'star',
      },
      {
        id: '3',
        label: '25 Coins',
        value: 25,
        color: '#FFD93D',
        type: 'coins',
        icon: 'star',
      },
      {
        id: '4',
        label: 'Try Again',
        value: 0,
        color: '#95E1D3',
        type: 'nothing',
        icon: 'refresh',
      },
      {
        id: '5',
        label: '50 Coins',
        value: 50,
        color: '#FF8B94',
        type: 'coins',
        icon: 'star',
      },
      {
        id: '6',
        label: '15 Coins',
        value: 15,
        color: '#A8E6CF',
        type: 'coins',
        icon: 'star',
      },
    ];
  };

  const handleSpinComplete = async (result: SpinWheelResult, coins: number, balance: number) => {
    try {
      setLastResult(result);
      setCoinsEarned(coins);
      setNewBalance(balance);

      // Reward is already claimed by the spin endpoint in SpinWheelGame component
      // Just update local state
      setSpinsRemaining((prev) => Math.max(0, prev - 1));

      // ✅ FIX: Force refresh to get latest coins from backend (bypass cache)
      await gamificationActions.loadGamificationData(true);

      // ✅ FIX: Update daily streak (for daily activity tracking)
      await gamificationActions.updateDailyStreak();

      // Reload spin wheel data to get updated spinsRemaining
      await loadSpinWheelData();

      // Show result modal with animation
      setShowResult(true);
    } catch (error: any) {
      console.error('Error after spin complete:', error);
      // Non-critical error, just log it
    }
  };

  const handleCloseModal = () => {
    setShowResult(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <ThemedText style={styles.loadingText}>Loading Spin Wheel...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Spin & Win',
          headerStyle: {
            backgroundColor: '#8B5CF6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB']}
            style={styles.infoBannerGradient}
          >
            <Ionicons name="information-circle" size={24} color="#8B5CF6" />
            <View style={styles.infoBannerTextContainer}>
              <ThemedText style={styles.infoBannerTitle}>How to Play</ThemedText>
              <ThemedText style={styles.infoBannerText}>
                Tap "SPIN NOW" and watch the wheel spin! You can win coins, vouchers, or other
                amazing rewards. You have {spinsRemaining} spin{spinsRemaining !== 1 ? 's' : ''}{' '}
                remaining today.
              </ThemedText>
            </View>
          </LinearGradient>
        </View>

        {/* Spin Wheel Game Component */}
        <SpinWheelGame
          segments={segments}
          onSpinComplete={handleSpinComplete}
          spinsRemaining={spinsRemaining}
          isLoading={loading}
        />

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <ThemedText style={styles.statsTitle}>Your Stats</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="star" size={28} color="#FFD700" />
              <ThemedText style={styles.statValue}>
                {gamificationState.coinBalance.total.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.statLabel}>Total Coins</ThemedText>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="refresh-circle" size={28} color="#8B5CF6" />
              <ThemedText style={styles.statValue}>{spinsRemaining}</ThemedText>
              <ThemedText style={styles.statLabel}>Spins Left</ThemedText>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={28} color="#FF6B6B" />
              <ThemedText style={styles.statValue}>{gamificationState.dailyStreak}</ThemedText>
              <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
            </View>
          </View>
        </View>

        {/* Spin History Section */}
        <View style={styles.historySection}>
          <SpinHistory limit={10} />
        </View>

        {/* CTA Section */}
        {spinsRemaining === 0 && (
          <View style={styles.ctaSection}>
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED']}
              style={styles.ctaCard}
            >
              <Ionicons name="trophy" size={48} color="white" />
              <ThemedText style={styles.ctaTitle}>No Spins Left!</ThemedText>
              <ThemedText style={styles.ctaText}>
                Come back tomorrow for more spins or complete challenges to earn extra spins!
              </ThemedText>
              <TouchableOpacity
                style={styles.ctaButton}
                onPress={() => router.push('/gamification' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.ctaButtonInner}>
                  <ThemedText style={styles.ctaButtonText}>View Challenges</ThemedText>
                  <Ionicons name="arrow-forward" size={20} color="#8B5CF6" />
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </ScrollView>

      {/* Celebration Modal */}
      <CelebrationModal
        visible={showResult}
        result={lastResult}
        coinsEarned={coinsEarned}
        newBalance={newBalance}
        onClose={handleCloseModal}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  backButton: {
    marginLeft: Platform.OS === 'ios' ? 8 : 16,
    padding: 4,
  },
  infoBanner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBannerGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  infoBannerTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  statsSection: {
    margin: 16,
    marginTop: 24,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  historySection: {
    margin: 16,
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 200,
  },
  ctaSection: {
    margin: 16,
  },
  ctaCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  ctaButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  ctaButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
});
