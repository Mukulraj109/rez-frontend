import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import gameApi from '../../services/gameApi';
import { useGamification } from '@/contexts/GamificationContext';

const { width } = Dimensions.get('window');

interface Prize {
  id: number;
  name: string;
  value: number;
  icon: string;
  chance: number;
  color: [string, string];
}

const LuckyDraw = () => {
  const router = useRouter();
  const { actions: gamificationActions } = useGamification();
  const [gameState, setGameState] = useState<'start' | 'spinning' | 'result' | 'error'>('start');
  const [spinning, setSpinning] = useState(false);
  const [prize, setPrize] = useState<Prize | null>(null);
  const [todayPlays, setTodayPlays] = useState(0);
  const [maxPlays, setMaxPlays] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const spinValue = useRef(new Animated.Value(0)).current;

  const prizes: Prize[] = [
    { id: 1, name: '1000 Coins', value: 1000, icon: '💰', chance: 5, color: ['#F59E0B', '#EAB308'] },
    { id: 2, name: '500 Coins', value: 500, icon: '🪙', chance: 10, color: ['#10B981', '#22C55E'] },
    { id: 3, name: '250 Coins', value: 250, icon: '💵', chance: 20, color: ['#3B82F6', '#06B6D4'] },
    { id: 4, name: '100 Coins', value: 100, icon: '💳', chance: 30, color: ['#A855F7', '#EC4899'] },
    { id: 5, name: '50 Coins', value: 50, icon: '🎁', chance: 35, color: ['#F97316', '#EF4444'] }
  ];

  // Fetch daily limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await gameApi.getDailyLimits();
        if (response.data) {
          const spinLimits = response.data.spin_wheel;
          if (spinLimits) {
            setTodayPlays(spinLimits.used);
            setMaxPlays(spinLimits.limit);
          }
        }
      } catch (error) {
        console.error('Error fetching daily limits:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLimits();
  }, []);

  const spin = async () => {
    if (todayPlays >= maxPlays || spinning) return;

    setSpinning(true);
    setGameState('spinning');
    setError(null);

    // Reset and start animation
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    try {
      // Call API to spin wheel
      const response = await gameApi.spinWheel();

      // Wait for animation to complete
      setTimeout(async () => {
        if (response.success && response.data?.result?.prize) {
          // Backend returns: { result: { won: true, prize: { type, value, description } } }
          const coinsWon = response.data.result.prize.value;
          // Find matching prize
          let wonPrize = prizes.find(p => p.value === coinsWon) || prizes[prizes.length - 1];
          setPrize({ ...wonPrize, value: coinsWon });
          setSpinning(false);
          setGameState('result');
          setTodayPlays(todayPlays + 1);

          // Sync coins from wallet to reflect the earned coins
          await gamificationActions.syncCoinsFromWallet();
        } else {
          // API returned but no valid prize data
          setSpinning(false);
          setError(response.error || 'Failed to get spin result');
          setGameState('error');
        }
      }, 3000);
    } catch (err) {
      console.error('Error spinning wheel:', err);
      // Show error after animation completes
      setTimeout(() => {
        setSpinning(false);
        setError('Unable to spin the wheel. Please try again.');
        setGameState('error');
      }, 3000);
    }
  };

  const retryGame = () => {
    setError(null);
    setGameState('start');
  };

  const spinRotation = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '1800deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Lucky Draw</Text>
          <Text style={styles.headerSubtitle}>Spin once daily, win big!</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hero */}
          <LinearGradient colors={['#F59E0B', '#F97316']} style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Text style={styles.heroIconText}>🎰</Text>
            </View>
            <Text style={styles.heroTitle}>Daily Lucky Draw</Text>
            <Text style={styles.heroSubtitle}>One free spin every day!</Text>
            <View style={styles.heroStats}>
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>1000</Text>
                <Text style={styles.heroStatLabel}>Max Prize</Text>
              </View>
              <View style={styles.heroDivider} />
              <View style={styles.heroStat}>
                <Text style={styles.heroStatValue}>{todayPlays}/{maxPlays}</Text>
                <Text style={styles.heroStatLabel}>Spins Left</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Wheel */}
          {gameState !== 'result' && (
            <View style={styles.wheelContainer}>
              <Animated.View
                style={[
                  styles.wheel,
                  spinning && { transform: [{ rotate: spinRotation }] },
                ]}
              >
                <LinearGradient
                  colors={['rgba(245,158,11,0.2)', 'rgba(249,115,22,0.2)']}
                  style={styles.wheelGradient}
                >
                  <Text style={styles.wheelIcon}>🎰</Text>
                  {!spinning && (
                    <Text style={styles.wheelText}>Tap to Spin!</Text>
                  )}
                </LinearGradient>
              </Animated.View>
              <TouchableOpacity
                onPress={spin}
                disabled={todayPlays >= maxPlays || spinning}
                style={styles.wheelTouchable}
              />
            </View>
          )}

          {/* Result */}
          {gameState === 'result' && prize && (
            <View style={styles.resultContainer}>
              <LinearGradient colors={prize.color} style={styles.resultCard}>
                <View style={styles.resultIcon}>
                  <Text style={styles.resultIconText}>{prize.icon}</Text>
                </View>
                <Text style={styles.resultTitle}>Congratulations!</Text>
                <Text style={styles.resultSubtitle}>You Won!</Text>
                <View style={styles.resultPrize}>
                  <Ionicons name="cash" size={32} color="#FFF" />
                  <Text style={styles.resultValue}>+{prize.value}</Text>
                </View>
              </LinearGradient>

              <TouchableOpacity
                style={styles.backToEarnButton}
                onPress={() => router.push('/playandearn' as any)}
              >
                <Text style={styles.backToEarnText}>Back to Earn</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Error State */}
          {gameState === 'error' && (
            <View style={styles.errorContainer}>
              <View style={styles.errorIcon}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
              </View>
              <Text style={styles.errorTitle}>Spin Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={retryGame}>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backToEarnButton}
                onPress={() => router.push('/playandearn' as any)}
              >
                <Text style={styles.backToEarnText}>Back to Earn</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Prize Table */}
          {gameState === 'start' && (
            <View style={styles.prizeTable}>
              <Text style={styles.prizeTableTitle}>Possible Prizes</Text>
              {prizes.map((p) => (
                <View key={p.id} style={styles.prizeRow}>
                  <View style={styles.prizeInfo}>
                    <Text style={styles.prizeIcon}>{p.icon}</Text>
                    <Text style={styles.prizeName}>{p.name}</Text>
                  </View>
                  <Text style={styles.prizeChance}>{p.chance}% chance</Text>
                </View>
              ))}
            </View>
          )}

          {/* Spin Button */}
          {gameState === 'start' && (
            <TouchableOpacity
              onPress={spin}
              disabled={todayPlays >= maxPlays}
              style={styles.spinButtonContainer}
            >
              <LinearGradient
                colors={todayPlays >= maxPlays ? ['#4B5563', '#374151'] : ['#F59E0B', '#F97316']}
                style={styles.spinButton}
              >
                <Text style={styles.spinButtonText}>
                  {todayPlays >= maxPlays ? 'Come Back Tomorrow' : 'Spin Now!'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  heroCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconText: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  heroDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  wheelContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  wheel: {
    width: width - 64,
    aspectRatio: 1,
    borderRadius: (width - 64) / 2,
    overflow: 'hidden',
  },
  wheelGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: (width - 64) / 2,
  },
  wheelIcon: {
    fontSize: 64,
  },
  wheelText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  wheelTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  resultContainer: {
    gap: 24,
  },
  resultCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  resultIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultIconText: {
    fontSize: 48,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  resultPrize: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  resultValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backToEarnButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  backToEarnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
  },
  prizeTable: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  prizeTableTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 12,
  },
  prizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 8,
  },
  prizeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  prizeIcon: {
    fontSize: 24,
  },
  prizeName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  prizeChance: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  spinButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  spinButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  spinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    gap: 16,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  errorText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default LuckyDraw;
