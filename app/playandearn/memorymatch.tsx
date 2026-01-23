import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import gameApi from '../../services/gameApi';
import walletApi from '@/services/walletApi';
import { useGamification } from '@/contexts/GamificationContext';

const { width } = Dimensions.get('window');

// ReZ App Theme Colors - White/Green Theme
const COLORS = {
  // Primary Green
  primary: '#00C06A',
  primaryLight: '#4ADE80',
  primaryDark: '#00A05A',
  primaryBg: '#E6F9F0',
  primaryBgLight: '#F0FDF4',

  // Gold for rewards
  gold: '#FFC857',
  goldLight: '#FFE4A0',
  goldDark: '#F5A623',
  goldBg: '#FFFBEB',

  // Backgrounds - Light theme
  background: '#F7FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F4F8',

  // Text colors
  navy: '#0B2240',
  text: '#0B2240',
  textSecondary: '#334E68',
  textMuted: '#627D98',
  textLight: '#9AA7B2',

  // Borders
  border: '#E2E8F0',
  borderLight: '#F0F4F8',

  // Status
  success: '#00C06A',
  warning: '#F59E0B',
  error: '#EF4444',

  // Shadows
  shadow: 'rgba(11, 34, 64, 0.08)',
  shadowGreen: 'rgba(0, 192, 106, 0.2)',
};

interface Card {
  id: number;
  emoji: string;
}

interface AnimatedCardProps {
  card: Card;
  index: number;
  isFlipped: boolean;
  isMatched: boolean;
  onPress: () => void;
  cardSize: number;
  disabled: boolean;
}

// Animated Card Component
const AnimatedCard: React.FC<AnimatedCardProps> = ({
  card, index, isFlipped, isMatched, onPress, cardSize, disabled
}) => {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(flipAnim, {
      toValue: isFlipped || isMatched ? 1 : 0,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();

    if (isMatched) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isFlipped, isMatched]);

  // Use opacity for web compatibility
  const backOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  });

  const frontOpacity = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isFlipped || isMatched}
      activeOpacity={0.8}
      style={[styles.cardWrapper, { width: cardSize, height: cardSize }]}
    >
      {/* Card Back (Question mark) */}
      <Animated.View style={[
        styles.cardFace,
        styles.cardBack,
        { width: cardSize - 4, height: cardSize - 4, opacity: backOpacity, transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.cardBackInner}>
          <Text style={styles.cardQuestion}>?</Text>
        </View>
      </Animated.View>

      {/* Card Front (Emoji) */}
      <Animated.View style={[
        styles.cardFace,
        styles.cardFront,
        isMatched && styles.cardMatched,
        { width: cardSize - 4, height: cardSize - 4, opacity: frontOpacity, transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={[styles.cardFrontInner, isMatched && styles.cardFrontMatched]}>
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Confetti particle for celebration
const ConfettiParticle: React.FC<{ delay: number; color: string }> = ({ delay, color }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startAnimation = () => {
      translateY.setValue(0);
      translateX.setValue(Math.random() * 200 - 100);
      opacity.setValue(1);
      rotate.setValue(0);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 300,
          duration: 2500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    const timeout = setTimeout(startAnimation, delay);
    return () => clearTimeout(timeout);
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        {
          backgroundColor: color,
          transform: [{ translateY }, { translateX }, { rotate: spin }],
          opacity,
        },
      ]}
    />
  );
};

const MemoryMatch = () => {
  const router = useRouter();
  const { actions: gamificationActions } = useGamification();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [todayPlays, setTodayPlays] = useState(0);
  const [maxPlays, setMaxPlays] = useState(3);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);

  const progressAnim = useRef(new Animated.Value(1)).current;
  const cardEmojis = ['🛍️', '💳', '🎁', '⭐', '💰', '🏪', '🎯', '🔥'];

  // Fetch daily limits and wallet balance
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [limitsResponse, walletResponse] = await Promise.all([
          gameApi.getDailyLimits(),
          walletApi.getBalance(),
        ]);

        if (limitsResponse.data) {
          const memoryLimits = limitsResponse.data.memory_match;
          if (memoryLimits) {
            setTodayPlays(memoryLimits.used);
            setMaxPlays(memoryLimits.limit);
          }
        }

        if (walletResponse.success && walletResponse.data) {
          // Get ReZ coin balance from coins array or balance object
          const rezCoin = walletResponse.data.coins?.find((c: any) => c.type === 'rez');
          const balance = rezCoin?.amount ||
                          walletResponse.data.balance?.available ||
                          walletResponse.data.balance?.total ||
                          0;
          setWalletBalance(balance);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
        Animated.timing(progressAnim, {
          toValue: (timeLeft - 1) / 60,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  useEffect(() => {
    if (flipped.length === 2) {
      const [first, second] = flipped;
      if (cards[first].emoji === cards[second].emoji) {
        setMatched([...matched, cards[first].emoji]);
        setFlipped([]);
        setScore(score + 25);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
      setMoves(moves + 1);
    }
  }, [flipped]);

  useEffect(() => {
    if (matched.length === cardEmojis.length && gameState === 'playing') {
      endGame();
    }
  }, [matched]);

  const initializeGame = async () => {
    const shuffled = [...cardEmojis, ...cardEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }));
    setCards(shuffled);
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTimeLeft(60);
    setScore(0);
    progressAnim.setValue(1);
    setGameState('playing');

    try {
      const response = await gameApi.startMemoryMatch();
      if (response.data?.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index].emoji)) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  const endGame = async () => {
    setGameState('result');
    let bonus = 0;
    if (matched.length === cardEmojis.length) {
      bonus = 50;
      if (timeLeft > 40) bonus += 25;
      if (moves <= 12) bonus += 25;
    }
    const finalScore = score + bonus;
    setScore(finalScore);

    if (sessionId) {
      try {
        const response = await gameApi.completeMemoryMatch(sessionId, finalScore, 60 - timeLeft, moves);
        if (response.data) {
          if (response.data.coins !== undefined) {
            setScore(response.data.coins);
          }
          if (response.data.newBalance !== undefined) {
            setWalletBalance(response.data.newBalance);
          }
        }
        // Refresh daily limits to get accurate plays count
        const limitsResponse = await gameApi.getDailyLimits();
        if (limitsResponse.data?.memory_match) {
          setTodayPlays(limitsResponse.data.memory_match.used);
        }
        // IMPORTANT: Sync global GamificationContext to update coin balance across the app
        await gamificationActions.syncCoinsFromWallet();
      } catch (error) {
        console.error('Error completing game:', error);
        // Fallback: increment locally if API fails
        setTodayPlays(todayPlays + 1);
      }
    } else {
      // No session - increment locally
      setTodayPlays(todayPlays + 1);
    }
  };

  const getPerformanceRating = () => {
    if (matched.length === cardEmojis.length && timeLeft > 40 && moves <= 12) return { text: 'Perfect!', icon: 'star' as const, color: COLORS.gold };
    if (matched.length === cardEmojis.length && timeLeft > 30) return { text: 'Excellent!', icon: 'trophy' as const, color: COLORS.primary };
    if (matched.length === cardEmojis.length) return { text: 'Good Job!', icon: 'thumbs-up' as const, color: COLORS.primary };
    if (matched.length >= 5) return { text: 'Nice Try!', icon: 'happy' as const, color: COLORS.gold };
    return { text: 'Try Again!', icon: 'refresh' as const, color: COLORS.textMuted };
  };

  const cardSize = (width - 56) / 4;
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={COLORS.navy} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={styles.headerIcon}>🃏</Text>
            <Text style={styles.headerTitle}>Memory Match</Text>
          </View>
          <Text style={styles.headerSubtitle}>Match pairs to earn coins</Text>
        </View>

        {gameState === 'playing' ? (
          <View style={[styles.timerBadge, timeLeft <= 10 && styles.timerBadgeWarning]}>
            <Ionicons name="time-outline" size={16} color={timeLeft <= 10 ? '#EF4444' : COLORS.primary} />
            <Text style={[styles.timerText, timeLeft <= 10 && styles.timerTextWarning]}>{timeLeft}s</Text>
          </View>
        ) : (
          <TouchableOpacity style={styles.coinsBadge} onPress={() => router.push('/wallet' as any)}>
            <Image
              source={require('@/assets/images/rez-coin.png')}
              style={styles.coinIcon}
              resizeMode="contain"
            />
            <Text style={styles.coinsText}>{walletBalance.toLocaleString()}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Start Screen */}
        {gameState === 'start' && (
          <View style={styles.content}>
            {/* Hero Card */}
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.heroCard}
            >
              <View style={styles.heroIconWrapper}>
                <View style={styles.heroIconBg}>
                  <Text style={styles.heroIconText}>🃏</Text>
                </View>
              </View>

              <Text style={styles.heroTitle}>Memory Match</Text>
              <Text style={styles.heroSubtitle}>Match all card pairs within 60 seconds!</Text>

              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatBox}>
                  <Image
                    source={require('@/assets/images/rez-coin.png')}
                    style={styles.heroStatIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.heroStatValue}>150</Text>
                  <Text style={styles.heroStatLabel}>Max Coins</Text>
                </View>

                <View style={styles.heroStatDivider} />

                <View style={styles.heroStatBox}>
                  <Ionicons name="game-controller" size={24} color="#FFF" />
                  <Text style={styles.heroStatValue}>{maxPlays - todayPlays}/{maxPlays}</Text>
                  <Text style={styles.heroStatLabel}>Plays Left</Text>
                </View>
              </View>

              {/* Decorative circles */}
              <View style={[styles.decorCircle, styles.decorCircle1]} />
              <View style={[styles.decorCircle, styles.decorCircle2]} />
            </LinearGradient>

            {/* How to Play */}
            <View style={styles.howToPlayCard}>
              <View style={styles.howToPlayHeader}>
                <Ionicons name="help-circle" size={20} color={COLORS.primary} />
                <Text style={styles.howToPlayTitle}>How to Play</Text>
              </View>

              <View style={styles.stepsContainer}>
                {[
                  { num: '1', color: COLORS.primary, title: 'Tap cards to flip them', desc: 'Find matching pairs', icon: 'hand-left' },
                  { num: '2', color: COLORS.gold, title: 'Match all 8 pairs', desc: '25 coins per match', icon: 'grid' },
                  { num: '3', color: '#8B5CF6', title: 'Earn bonus coins', desc: 'Speed +25 • Efficiency +25 • Complete +50', icon: 'trophy' },
                ].map((step, idx) => (
                  <View key={idx} style={styles.stepRow}>
                    <View style={[styles.stepBadge, { backgroundColor: `${step.color}15` }]}>
                      <Text style={[styles.stepBadgeText, { color: step.color }]}>{step.num}</Text>
                    </View>
                    <View style={styles.stepTextContainer}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                    <View style={[styles.stepIconBg, { backgroundColor: `${step.color}10` }]}>
                      <Ionicons name={step.icon as any} size={18} color={step.color} />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              onPress={initializeGame}
              disabled={todayPlays >= maxPlays}
              activeOpacity={0.9}
              style={styles.startButtonWrapper}
            >
              <LinearGradient
                colors={todayPlays >= maxPlays ? ['#9CA3AF', '#6B7280'] : [COLORS.primary, COLORS.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Ionicons
                  name={todayPlays >= maxPlays ? "time-outline" : "play"}
                  size={22}
                  color="#FFF"
                />
                <Text style={styles.startButtonText}>
                  {todayPlays >= maxPlays ? 'Come Back Tomorrow' : 'Start Game'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <View style={styles.content}>
            {/* Stats Bar */}
            <View style={styles.gameStatsBar}>
              <View style={styles.gameStatItem}>
                <Text style={styles.gameStatLabel}>MOVES</Text>
                <Text style={styles.gameStatValue}>{moves}</Text>
              </View>

              <View style={styles.gameStatDivider} />

              <View style={styles.gameStatItem}>
                <Text style={styles.gameStatLabel}>MATCHED</Text>
                <Text style={styles.gameStatValue}>{matched.length}<Text style={styles.gameStatTotal}>/8</Text></Text>
              </View>

              <View style={styles.gameStatDivider} />

              <View style={styles.gameStatItem}>
                <Text style={styles.gameStatLabel}>SCORE</Text>
                <View style={styles.scoreRow}>
                  <Image source={require('@/assets/images/rez-coin.png')} style={styles.miniCoin} resizeMode="contain" />
                  <Text style={[styles.gameStatValue, { color: COLORS.primary }]}>{score}</Text>
                </View>
              </View>
            </View>

            {/* Game Board */}
            <View style={styles.gameBoard}>
              {cards.map((card, index) => (
                <AnimatedCard
                  key={card.id}
                  card={card}
                  index={index}
                  isFlipped={flipped.includes(index)}
                  isMatched={matched.includes(card.emoji)}
                  onPress={() => handleCardClick(index)}
                  cardSize={cardSize}
                  disabled={flipped.length === 2}
                />
              ))}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrapper}>
              <View style={styles.progressBg}>
                <Animated.View style={[styles.progressFill, { width: progressWidth }]}>
                  <LinearGradient
                    colors={timeLeft <= 10 ? ['#EF4444', '#DC2626'] : [COLORS.primary, COLORS.primaryLight]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.progressGradient}
                  />
                </Animated.View>
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>0s</Text>
                <Text style={[styles.progressLabel, styles.progressLabelCenter, timeLeft <= 10 && { color: COLORS.error }]}>
                  {timeLeft}s remaining
                </Text>
                <Text style={styles.progressLabel}>60s</Text>
              </View>
            </View>
          </View>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
          <View style={styles.content}>
            {/* Confetti */}
            {matched.length === cardEmojis.length && (
              <View style={styles.confettiContainer}>
                {[...Array(15)].map((_, i) => (
                  <ConfettiParticle
                    key={i}
                    delay={i * 150}
                    color={[COLORS.primary, COLORS.gold, '#8B5CF6', '#EC4899'][i % 4]}
                  />
                ))}
              </View>
            )}

            {/* Result Card */}
            <View style={styles.resultCard}>
              <LinearGradient
                colors={matched.length === cardEmojis.length ? [COLORS.primary, COLORS.primaryDark] : [COLORS.surfaceSecondary, COLORS.surface]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.resultGradient}
              >
                <View style={[styles.resultIconWrapper, { backgroundColor: matched.length === cardEmojis.length ? 'rgba(255,255,255,0.2)' : COLORS.primaryBg }]}>
                  <Ionicons
                    name={getPerformanceRating().icon}
                    size={48}
                    color={matched.length === cardEmojis.length ? '#FFF' : getPerformanceRating().color}
                  />
                </View>

                <Text style={[styles.resultTitle, { color: matched.length === cardEmojis.length ? '#FFF' : COLORS.navy }]}>
                  {getPerformanceRating().text}
                </Text>
                <Text style={[styles.resultSubtitle, { color: matched.length === cardEmojis.length ? 'rgba(255,255,255,0.9)' : COLORS.textMuted }]}>
                  You matched {matched.length} of {cardEmojis.length} pairs
                </Text>

                <View style={[styles.earnedBox, { backgroundColor: matched.length === cardEmojis.length ? 'rgba(255,255,255,0.15)' : COLORS.goldBg }]}>
                  <View style={styles.earnedRow}>
                    <Image source={require('@/assets/images/rez-coin.png')} style={styles.earnedCoin} resizeMode="contain" />
                    <Text style={[styles.earnedValue, { color: matched.length === cardEmojis.length ? '#FFF' : COLORS.gold }]}>+{score}</Text>
                  </View>
                  <Text style={[styles.earnedLabel, { color: matched.length === cardEmojis.length ? 'rgba(255,255,255,0.8)' : COLORS.textMuted }]}>
                    Coins Earned
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="flash" size={22} color={COLORS.gold} />
                </View>
                <Text style={styles.statValue}>{moves}</Text>
                <Text style={styles.statLabel}>Moves</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="time" size={22} color="#3B82F6" />
                </View>
                <Text style={styles.statValue}>{60 - timeLeft}s</Text>
                <Text style={styles.statLabel}>Time</Text>
              </View>

              <View style={styles.statCard}>
                <View style={[styles.statIconBg, { backgroundColor: COLORS.primaryBg }]}>
                  <Ionicons name="checkmark-done" size={22} color={COLORS.primary} />
                </View>
                <Text style={styles.statValue}>{matched.length}/{cardEmojis.length}</Text>
                <Text style={styles.statLabel}>Matched</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={initializeGame}
                disabled={todayPlays >= maxPlays}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={todayPlays >= maxPlays ? ['#9CA3AF', '#6B7280'] : [COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.primaryAction}
                >
                  <Ionicons
                    name={todayPlays >= maxPlays ? "time-outline" : "refresh"}
                    size={20}
                    color="#FFF"
                  />
                  <Text style={styles.primaryActionText}>
                    {todayPlays >= maxPlays
                      ? `No Plays Left (${todayPlays}/${maxPlays})`
                      : `Play Again (${maxPlays - todayPlays} left)`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push('/playandearn' as any)}
                style={styles.secondaryAction}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={18} color={COLORS.textMuted} />
                <Text style={styles.secondaryActionText}>Back to Games</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 52,
    paddingBottom: 16,
    gap: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.primaryBg,
  },
  timerBadgeWarning: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
  timerTextWarning: {
    color: '#EF4444',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.goldBg,
  },
  coinIcon: {
    width: 20,
    height: 20,
  },
  coinsText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.goldDark,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },

  // Hero Card
  heroCard: {
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroIconWrapper: {
    marginBottom: 16,
  },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroIconText: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 24,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  heroStatBox: {
    alignItems: 'center',
  },
  heroStatIcon: {
    width: 28,
    height: 28,
    marginBottom: 8,
  },
  heroStatValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFF',
  },
  heroStatLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  heroStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle1: {
    width: 120,
    height: 120,
    top: -40,
    right: -40,
  },
  decorCircle2: {
    width: 100,
    height: 100,
    bottom: -30,
    left: -30,
  },

  // How to Play
  howToPlayCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  howToPlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  howToPlayTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.navy,
  },
  stepsContainer: {
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 2,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  stepIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Start Button
  startButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },

  // Game Stats Bar
  gameStatsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  gameStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  gameStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gameStatValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
  },
  gameStatTotal: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  gameStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  miniCoin: {
    width: 18,
    height: 18,
  },

  // Game Board
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
    justifyContent: 'center',
  },
  cardWrapper: {
    perspective: 1000,
  },
  cardFace: {
    position: 'absolute',
    borderRadius: 14,
    overflow: 'hidden',
  },
  cardBack: {
    zIndex: 2,
  },
  cardFront: {
    zIndex: 1,
  },
  cardMatched: {
    // Matched state handled by inner styles
  },
  cardBackInner: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardFrontInner: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardFrontMatched: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primary,
  },
  cardQuestion: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  cardEmoji: {
    fontSize: 32,
  },

  // Progress Bar
  progressWrapper: {
    marginBottom: 8,
  },
  progressBg: {
    height: 10,
    backgroundColor: COLORS.surfaceSecondary,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressGradient: {
    flex: 1,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  progressLabelCenter: {
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Confetti
  confettiContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
    left: '50%',
    top: -10,
  },

  // Result Card
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  resultGradient: {
    padding: 32,
    alignItems: 'center',
  },
  resultIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 15,
    marginBottom: 24,
  },
  earnedBox: {
    paddingHorizontal: 32,
    paddingVertical: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  earnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  earnedCoin: {
    width: 36,
    height: 36,
  },
  earnedValue: {
    fontSize: 44,
    fontWeight: '800',
  },
  earnedLabel: {
    fontSize: 13,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Actions
  actionsContainer: {
    gap: 12,
  },
  primaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  primaryActionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});

export default MemoryMatch;
