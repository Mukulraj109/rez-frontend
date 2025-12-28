/**
 * Coin Hunt Game - Converted from V2 Web
 * Exact match to Rez_v-2-main/src/pages/earn/CoinHunt.jsx
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_AREA_HEIGHT = SCREEN_HEIGHT * 0.5;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  blue400: '#60A5FA',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  green500: '#22C55E',
  teal500: '#14B8A6',
  black: '#000000',
  blackOverlay: 'rgba(0, 0, 0, 0.8)',
};

interface Coin {
  id: number;
  x: number;
  y: number;
  value: number;
  animation: Animated.Value;
}

const CoinHuntScreen: React.FC = () => {
  const router = useRouter();
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [coins, setCoins] = useState<Coin[]>([]);
  const coinIdRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const coinSpawnRef = useRef<NodeJS.Timeout | null>(null);

  // Game timer
  useEffect(() => {
    if (gameStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameStarted(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [gameStarted]);

  // Coin spawner
  useEffect(() => {
    if (gameStarted) {
      coinSpawnRef.current = setInterval(() => {
        spawnCoin();
      }, 800);
      return () => {
        if (coinSpawnRef.current) clearInterval(coinSpawnRef.current);
      };
    }
  }, [gameStarted]);

  const spawnCoin = () => {
    const newCoin: Coin = {
      id: coinIdRef.current++,
      x: Math.random() * (SCREEN_WIDTH - 80) + 20,
      y: Math.random() * (GAME_AREA_HEIGHT - 100) + 20,
      value: [5, 10, 15, 25][Math.floor(Math.random() * 4)],
      animation: new Animated.Value(1),
    };

    setCoins(prev => [...prev, newCoin]);

    // Auto-remove coin after 2 seconds
    setTimeout(() => {
      setCoins(prev => prev.filter(c => c.id !== newCoin.id));
    }, 2000);
  };

  const startGame = () => {
    setGameStarted(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(30);
    setCoins([]);
    coinIdRef.current = 0;
  };

  const catchCoin = (coin: Coin) => {
    // Animate coin out
    Animated.timing(coin.animation, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start();

    setScore(prev => prev + coin.value);
    setCoins(prev => prev.filter(c => c.id !== coin.id));
  };

  const handleGoBack = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (coinSpawnRef.current) clearInterval(coinSpawnRef.current);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🪙 Coin Hunt</Text>
          <Text style={styles.headerSubtitle}>Catch falling coins!</Text>
        </View>
      </View>

      {/* Score & Timer */}
      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Ionicons name="wallet" size={18} color={COLORS.amber400} />
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={[styles.statBadge, styles.timerBadge]}>
          <Ionicons name="time" size={18} color={COLORS.blue400} />
          <Text style={[styles.statValue, styles.timerValue]}>{timeLeft}s</Text>
        </View>
      </View>

      {/* Game Container */}
      <View style={styles.gameContainer}>
        {!gameStarted && !gameOver ? (
          // Start Screen
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.startScreen}
          >
            <Text style={styles.trophyIcon}>🏆</Text>
            <Text style={styles.readyTitle}>Ready to Hunt?</Text>
            <Text style={styles.readySubtitle}>
              Tap coins before they disappear!{'\n'}You have 30 seconds
            </Text>
            <TouchableOpacity onPress={startGame} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.purple500, COLORS.pink500]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>Start Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        ) : (
          // Game Area
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.1)', 'rgba(139, 92, 246, 0.1)']}
            style={styles.gameArea}
          >
            {/* Coins */}
            {gameStarted && coins.map(coin => (
              <Animated.View
                key={coin.id}
                style={[
                  styles.coinWrapper,
                  {
                    left: coin.x,
                    top: coin.y,
                    opacity: coin.animation,
                    transform: [{ scale: coin.animation }],
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => catchCoin(coin)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[COLORS.amber400, COLORS.amber500]}
                    style={styles.coin}
                  >
                    <Text style={styles.coinValue}>+{coin.value}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <View style={styles.gameOverOverlay}>
                <Text style={styles.gameOverTrophy}>🏆</Text>
                <Text style={styles.gameOverTitle}>Game Over!</Text>
                <Text style={styles.gameOverScore}>You earned {score} coins</Text>
                <TouchableOpacity onPress={startGame} activeOpacity={0.8}>
                  <LinearGradient
                    colors={[COLORS.green500, COLORS.teal500]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.playAgainButton}
                  >
                    <Text style={styles.playAgainText}>Play Again</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </LinearGradient>
        )}
      </View>

      {/* How to Play */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>How to play:</Text>
        <Text style={styles.infoItem}>• Tap coins before they disappear</Text>
        <Text style={styles.infoItem}>• Each coin is worth 5-25 points</Text>
        <Text style={styles.infoItem}>• Play unlimited times per day</Text>
        <Text style={styles.infoItem}>• Earn bonus multipliers for streaks</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  timerBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.amber400,
  },
  timerValue: {
    color: COLORS.blue400,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  startScreen: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  trophyIcon: {
    fontSize: 80,
    marginBottom: 16,
  },
  readyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  readySubtitle: {
    fontSize: 14,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  startButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  gameArea: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    overflow: 'hidden',
    position: 'relative',
  },
  coinWrapper: {
    position: 'absolute',
  },
  coin: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  coinValue: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  gameOverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.blackOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  gameOverTrophy: {
    fontSize: 64,
  },
  gameOverTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
  },
  gameOverScore: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.amber400,
  },
  playAgainButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  playAgainText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  infoCard: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 4,
  },
});

export default CoinHuntScreen;
