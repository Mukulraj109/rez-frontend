import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import gameApi from '../../services/gameApi';

const { width } = Dimensions.get('window');

interface Card {
  id: number;
  emoji: string;
}

const MemoryMatch = () => {
  const router = useRouter();
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

  const cardEmojis = ['🛍️', '💳', '🎁', '⭐', '💰', '🏪', '🎯', '🔥'];

  // Fetch daily limits on mount
  useEffect(() => {
    const fetchLimits = async () => {
      try {
        const response = await gameApi.getDailyLimits();
        if (response.data) {
          const memoryLimits = response.data.memory_match;
          if (memoryLimits) {
            setTodayPlays(memoryLimits.used);
            setMaxPlays(memoryLimits.limit);
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
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
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
    setGameState('playing');

    // Start session with backend
    try {
      const response = await gameApi.startMemoryMatch();
      if (response.data?.sessionId) {
        setSessionId(response.data.sessionId);
      }
    } catch (error) {
      console.error('Error starting memory match session:', error);
    }
  };

  const handleCardClick = (index: number) => {
    if (
      flipped.length === 2 ||
      flipped.includes(index) ||
      matched.includes(cards[index].emoji)
    ) {
      return;
    }
    setFlipped([...flipped, index]);
  };

  const endGame = async () => {
    setGameState('result');
    setTodayPlays(todayPlays + 1);
    let bonus = 0;
    if (matched.length === cardEmojis.length) {
      bonus = 50;
      if (timeLeft > 40) bonus += 25;
      if (moves <= 12) bonus += 25;
    }
    const finalScore = score + bonus;
    setScore(finalScore);

    // Submit results to backend
    if (sessionId) {
      try {
        const response = await gameApi.completeMemoryMatch(
          sessionId,
          finalScore,
          60 - timeLeft,  // timeSpent
          moves
        );
        if (response.data?.coins) {
          setScore(response.data.coins);
        }
      } catch (error) {
        console.error('Error completing memory match:', error);
      }
    }
  };

  const getPerformanceRating = () => {
    if (matched.length === cardEmojis.length && timeLeft > 40 && moves <= 12) return 'Perfect!';
    if (matched.length === cardEmojis.length && timeLeft > 30) return 'Excellent!';
    if (matched.length === cardEmojis.length) return 'Good!';
    if (matched.length >= 5) return 'Not Bad';
    return 'Try Again';
  };

  const cardSize = (width - 64) / 4;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Memory Match</Text>
          <Text style={styles.headerSubtitle}>Match all cards to win</Text>
        </View>
        {gameState === 'playing' && (
          <View style={styles.timerBadge}>
            <Ionicons name="time" size={16} color="#F97316" />
            <Text style={styles.timerText}>{timeLeft}s</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Start Screen */}
        {gameState === 'start' && (
          <View style={styles.content}>
            <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>🃏</Text>
              </View>
              <Text style={styles.heroTitle}>Memory Match</Text>
              <Text style={styles.heroSubtitle}>Match all card pairs within 60 seconds!</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>150</Text>
                  <Text style={styles.heroStatLabel}>Max Coins</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{todayPlays}/{maxPlays}</Text>
                  <Text style={styles.heroStatLabel}>Plays Left</Text>
                </View>
              </View>
            </LinearGradient>

            <View style={styles.howToPlayCard}>
              <Text style={styles.howToPlayTitle}>How to Play</Text>
              <View style={styles.steps}>
                {[
                  { num: '1', color: '#3B82F6', title: 'Tap cards to flip them', desc: 'Find matching pairs' },
                  { num: '2', color: '#A855F7', title: 'Match all 8 pairs', desc: '25 coins per match' },
                  { num: '3', color: '#F59E0B', title: 'Get bonuses', desc: 'Complete in 60s: +50 | Speed: +25 | Efficiency: +25' },
                ].map((step, idx) => (
                  <View key={idx} style={styles.step}>
                    <View style={[styles.stepNumber, { backgroundColor: `${step.color}30` }]}>
                      <Text style={[styles.stepNumberText, { color: step.color }]}>{step.num}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{step.title}</Text>
                      <Text style={styles.stepDesc}>{step.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <TouchableOpacity
              onPress={initializeGame}
              disabled={todayPlays >= maxPlays}
              style={styles.startButtonContainer}
            >
              <LinearGradient
                colors={todayPlays >= maxPlays ? ['#4B5563', '#374151'] : ['#3B82F6', '#A855F7']}
                style={styles.startButton}
              >
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
            <View style={styles.gameStats}>
              <View style={styles.gameStat}>
                <Text style={styles.gameStatLabel}>Moves</Text>
                <Text style={styles.gameStatValue}>{moves}</Text>
              </View>
              <View style={styles.gameStat}>
                <Text style={styles.gameStatLabel}>Matched</Text>
                <Text style={styles.gameStatValue}>{matched.length}/8</Text>
              </View>
              <View style={styles.scoreContainer}>
                <Ionicons name="cash" size={20} color="#10B981" />
                <Text style={styles.scoreText}>{score}</Text>
              </View>
            </View>

            <View style={styles.gameBoard}>
              {cards.map((card, index) => {
                const isFlipped = flipped.includes(index) || matched.includes(card.emoji);
                return (
                  <TouchableOpacity
                    key={card.id}
                    onPress={() => handleCardClick(index)}
                    disabled={isFlipped}
                    style={[styles.cardButton, { width: cardSize, height: cardSize }]}
                  >
                    <LinearGradient
                      colors={isFlipped ? ['#3B82F6', '#A855F7'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                      style={styles.cardGradient}
                    >
                      <Text style={styles.cardEmoji}>{isFlipped ? card.emoji : '?'}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.timeProgressContainer}>
              <View style={[styles.timeProgressBar, { width: `${(timeLeft / 60) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
          <View style={styles.content}>
            <LinearGradient colors={['#3B82F6', '#A855F7']} style={styles.resultCard}>
              <View style={styles.resultIcon}>
                <Ionicons
                  name={matched.length === cardEmojis.length ? 'trophy' : 'refresh'}
                  size={48}
                  color="#FFF"
                />
              </View>
              <Text style={styles.resultTitle}>{getPerformanceRating()}</Text>
              <Text style={styles.resultSubtitle}>
                You matched {matched.length} out of {cardEmojis.length} pairs
              </Text>
              <View style={styles.totalEarnedCard}>
                <View style={styles.totalEarnedRow}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                  <Text style={styles.totalEarnedValue}>+{score}</Text>
                </View>
                <Text style={styles.totalEarnedLabel}>Total Coins Earned</Text>
              </View>
            </LinearGradient>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{moves}</Text>
                <Text style={styles.statLabel}>Moves</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{60 - timeLeft}s</Text>
                <Text style={styles.statLabel}>Time Used</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="star" size={24} color="#A855F7" />
                <Text style={styles.statValue}>{matched.length}/{cardEmojis.length}</Text>
                <Text style={styles.statLabel}>Matched</Text>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={initializeGame}
                disabled={todayPlays >= maxPlays}
                style={styles.actionButtonContainer}
              >
                <LinearGradient
                  colors={todayPlays >= maxPlays ? ['#4B5563', '#374151'] : ['#3B82F6', '#A855F7']}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>
                    {todayPlays >= maxPlays
                      ? `No Plays Left (${todayPlays}/${maxPlays})`
                      : `Play Again (${todayPlays}/${maxPlays})`}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push('/playandearn' as any)}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Back to Earn</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 48, paddingBottom: 16, gap: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  backButton: { padding: 8, borderRadius: 12 },
  headerContent: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#9CA3AF' },
  timerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)' },
  timerText: { fontSize: 14, fontWeight: 'bold', color: '#F97316' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  heroCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroIconText: { fontSize: 40 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  heroStats: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  heroStat: { alignItems: 'center' },
  heroStatValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  heroStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  heroDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.3)' },
  howToPlayCard: { padding: 20, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  howToPlayTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 16 },
  steps: { gap: 12 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  stepNumber: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  stepNumberText: { fontSize: 12, fontWeight: 'bold' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '500', color: '#FFF' },
  stepDesc: { fontSize: 12, color: '#9CA3AF' },
  startButtonContainer: { borderRadius: 16, overflow: 'hidden' },
  startButton: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  startButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  gameStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  gameStat: { alignItems: 'center' },
  gameStatLabel: { fontSize: 12, color: '#9CA3AF' },
  gameStatValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  scoreContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  gameBoard: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  cardButton: { borderRadius: 12, overflow: 'hidden' },
  cardGradient: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 12 },
  cardEmoji: { fontSize: 28 },
  timeProgressContainer: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' },
  timeProgressBar: { height: '100%', backgroundColor: '#3B82F6', borderRadius: 4 },
  resultCard: { padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  resultIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  resultSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 24 },
  totalEarnedCard: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  totalEarnedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  totalEarnedValue: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  totalEarnedLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  actionsContainer: { gap: 12 },
  actionButtonContainer: { borderRadius: 12, overflow: 'hidden' },
  actionButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  secondaryButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});

export default MemoryMatch;
