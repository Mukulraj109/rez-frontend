import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import gameApi from '../../services/gameApi';
import { useGamification } from '@/contexts/GamificationContext';

const { width } = Dimensions.get('window');

interface Coin {
  id: number;
  x: number;
  y: number;
  value: number;
}

const CoinHunt = () => {
  const router = useRouter();
  const { actions: gamificationActions } = useGamification();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const [todayPlays, setTodayPlays] = useState(0);
  const [maxPlays, setMaxPlays] = useState(5);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [coinsCollected, setCoinsCollected] = useState(0);

  // Fetch daily limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await gameApi.getDailyLimits();
        if (response.data) {
          const huntLimits = response.data.coin_hunt;
          if (huntLimits) {
            setTodayPlays(huntLimits.used);
            setMaxPlays(huntLimits.limit);
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

  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && gameStarted) {
      endGame();
    }
  }, [gameStarted, timeLeft]);

  const endGame = async () => {
    setGameStarted(false);

    // Submit results to backend
    if (sessionId) {
      try {
        const response = await gameApi.completeCoinHunt(
          sessionId,
          coinsCollected,
          score
        );
        if (response.data) {
          if (response.data.coinsEarned !== undefined) {
            setScore(response.data.coinsEarned);
          }
        }
        // Refresh daily limits to get accurate plays count
        const limitsResponse = await gameApi.getDailyLimits();
        if (limitsResponse.data?.coin_hunt) {
          setTodayPlays(limitsResponse.data.coin_hunt.used);
        }
        // Sync global GamificationContext to update coin balance across the app
        await gamificationActions.syncCoinsFromWallet();
      } catch (error) {
        console.error('Error completing coin hunt:', error);
        // Fallback: increment locally if API fails
        setTodayPlays(todayPlays + 1);
      }
    } else {
      // No session - increment locally
      setTodayPlays(todayPlays + 1);
    }
  };

  useEffect(() => {
    if (gameStarted) {
      const interval = setInterval(() => {
        const newCoin: Coin = {
          id: Date.now(),
          x: Math.random() * 70 + 10,
          y: Math.random() * 50 + 10,
          value: [5, 10, 15, 25][Math.floor(Math.random() * 4)]
        };
        setCoins(prev => [...prev, newCoin]);
        setTimeout(() => {
          setCoins(prev => prev.filter(c => c.id !== newCoin.id));
        }, 2000);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [gameStarted]);

  const startGame = async () => {
    if (todayPlays >= maxPlays) return;

    setGameStarted(true);
    setScore(0);
    setTimeLeft(30);
    setCoins([]);
    setCoinsCollected(0);

    // Start session with backend
    try {
      const response = await gameApi.startCoinHunt();
      if (response.data?.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error starting coin hunt session:', error);
    }
  };

  const catchCoin = (coin: Coin) => {
    setScore(prev => prev + coin.value);
    setCoins(prev => prev.filter(c => c.id !== coin.id));
    setCoinsCollected(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🪙 Coin Hunt</Text>
          <Text style={styles.headerSubtitle}>Catch falling coins!</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Score & Timer */}
          <View style={styles.statsRow}>
            <View style={[styles.statBadge, { backgroundColor: 'rgba(245,158,11,0.2)' }]}>
              <Ionicons name="cash" size={20} color="#F59E0B" />
              <Text style={[styles.statValue, { color: '#F59E0B' }]}>{score}</Text>
            </View>
            <View style={[styles.statBadge, { backgroundColor: 'rgba(59,130,246,0.2)' }]}>
              <Ionicons name="locate" size={20} color="#3B82F6" />
              <Text style={[styles.statValue, { color: '#3B82F6' }]}>{timeLeft}s</Text>
            </View>
          </View>

          {/* Game Container */}
          {!gameStarted && timeLeft === 30 ? (
            <LinearGradient
              colors={['#A855F720', '#EC489920']}
              style={styles.startScreen}
            >
              <Ionicons name="trophy" size={80} color="#A855F7" />
              <View style={styles.startContent}>
                <Text style={styles.startTitle}>Ready to Hunt?</Text>
                <Text style={styles.startDesc}>
                  Tap coins before they disappear!{'\n'}You have 30 seconds
                </Text>
              </View>
              <TouchableOpacity onPress={startGame}>
                <LinearGradient
                  colors={['#A855F7', '#EC4899']}
                  style={styles.startButton}
                >
                  <Text style={styles.startButtonText}>Start Game</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          ) : (
            <View style={styles.gameContainer}>
              <LinearGradient
                colors={['rgba(59,130,246,0.1)', 'rgba(168,85,247,0.1)']}
                style={styles.gameArea}
              >
                {gameStarted && coins.map(coin => (
                  <TouchableOpacity
                    key={coin.id}
                    onPress={() => catchCoin(coin)}
                    style={[
                      styles.coinButton,
                      { left: `${coin.x}%`, top: `${coin.y}%` }
                    ]}
                  >
                    <LinearGradient
                      colors={['#F59E0B', '#EAB308']}
                      style={styles.coinGradient}
                    >
                      <Text style={styles.coinValue}>+{coin.value}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                {timeLeft === 0 && (
                  <View style={styles.gameOverOverlay}>
                    <Ionicons name="trophy" size={64} color="#F59E0B" />
                    <Text style={styles.gameOverTitle}>Game Over!</Text>
                    <Text style={styles.gameOverScore}>You earned {score} coins</Text>
                    <TouchableOpacity onPress={startGame}>
                      <LinearGradient
                        colors={['#10B981', '#14B8A6']}
                        style={styles.playAgainButton}
                      >
                        <Text style={styles.playAgainText}>Play Again</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>How to play:</Text>
            <View style={styles.infoList}>
              <Text style={styles.infoItem}>• Tap coins before they disappear</Text>
              <Text style={styles.infoItem}>• Each coin is worth 5-25 points</Text>
              <Text style={styles.infoItem}>• Play unlimited times per day</Text>
              <Text style={styles.infoItem}>• Earn bonus multipliers for streaks</Text>
            </View>
          </View>
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
    borderRadius: 20,
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  startScreen: {
    aspectRatio: 4 / 3,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(168,85,247,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  startContent: {
    alignItems: 'center',
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  startDesc: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gameContainer: {
    aspectRatio: 4 / 3,
    borderRadius: 24,
    overflow: 'hidden',
  },
  gameArea: {
    flex: 1,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.2)',
    borderRadius: 24,
    position: 'relative',
  },
  coinButton: {
    position: 'absolute',
    width: 48,
    height: 48,
  },
  coinGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  coinValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  gameOverScore: {
    fontSize: 20,
    color: '#F59E0B',
  },
  playAgainButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 8,
  },
  playAgainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  infoCard: {
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  infoList: {
    gap: 4,
  },
  infoItem: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});

export default CoinHunt;
