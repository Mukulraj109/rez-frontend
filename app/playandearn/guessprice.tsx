import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Product {
  id: number;
  name: string;
  image: string;
  actualPrice: number;
  category: string;
}

interface Feedback {
  message: string;
  earnedCoins: number;
  actualPrice: number;
  difference: number;
  percentDiff: string;
}

const GuessPrice = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentProduct, setCurrentProduct] = useState(0);
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const products: Product[] = [
    { id: 1, name: 'iPhone 15 Pro', image: '📱', actualPrice: 134900, category: 'Electronics' },
    { id: 2, name: 'Nike Air Max', image: '👟', actualPrice: 12995, category: 'Fashion' },
    { id: 3, name: 'PS5 Console', image: '🎮', actualPrice: 49990, category: 'Gaming' },
    { id: 4, name: 'Starbucks Latte', image: '☕', actualPrice: 320, category: 'Food' },
    { id: 5, name: 'MacBook Air M2', image: '💻', actualPrice: 114900, category: 'Electronics' }
  ];

  const startGame = () => {
    setGameState('playing');
    setCurrentProduct(0);
    setScore(0);
    setGuess('');
    setFeedback(null);
  };

  const submitGuess = () => {
    if (!guess || parseInt(guess) <= 0) return;

    const product = products[currentProduct];
    const guessValue = parseInt(guess);
    const actualPrice = product.actualPrice;
    const difference = Math.abs(guessValue - actualPrice);
    const percentDiff = (difference / actualPrice) * 100;

    let earnedCoins = 0;
    let message = '';

    if (percentDiff <= 5) {
      earnedCoins = 50;
      message = 'Perfect! Within 5%';
    } else if (percentDiff <= 10) {
      earnedCoins = 30;
      message = 'Great! Within 10%';
    } else if (percentDiff <= 20) {
      earnedCoins = 15;
      message = 'Good! Within 20%';
    } else {
      earnedCoins = 5;
      message = 'Try again!';
    }

    setScore(score + earnedCoins);
    setFeedback({
      message,
      earnedCoins,
      actualPrice,
      difference,
      percentDiff: percentDiff.toFixed(1)
    });

    setTimeout(() => {
      if (currentProduct < products.length - 1) {
        setCurrentProduct(currentProduct + 1);
        setGuess('');
        setFeedback(null);
      } else {
        setGameState('result');
      }
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Guess the Price</Text>
          <Text style={styles.headerSubtitle}>How well do you know prices?</Text>
        </View>
        {gameState === 'playing' && (
          <View style={styles.scoreBadge}>
            <Ionicons name="cash" size={20} color="#10B981" />
            <Text style={styles.scoreText}>{score}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Start Screen */}
        {gameState === 'start' && (
          <View style={styles.content}>
            <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.heroCard}>
              <View style={styles.heroIcon}>
                <Text style={styles.heroIconText}>💰</Text>
              </View>
              <Text style={styles.heroTitle}>Guess the Price</Text>
              <Text style={styles.heroSubtitle}>Guess prices correctly and win coins!</Text>
              <View style={styles.heroInfo}>
                <Text style={styles.heroInfoValue}>Up to 50 coins per guess</Text>
                <Text style={styles.heroInfoLabel}>Unlimited plays daily</Text>
              </View>
            </LinearGradient>

            <View style={styles.rulesCard}>
              <Text style={styles.rulesTitle}>Scoring Rules</Text>
              {[
                { range: 'Within 5%', coins: 50, color: '#22C55E' },
                { range: 'Within 10%', coins: 30, color: '#3B82F6' },
                { range: 'Within 20%', coins: 15, color: '#A855F7' },
                { range: 'Over 20%', coins: 5, color: '#F97316' }
              ].map((rule, idx) => (
                <View key={idx} style={styles.ruleRow}>
                  <Text style={styles.ruleRange}>{rule.range}</Text>
                  <Text style={[styles.ruleCoins, { color: rule.color }]}>+{rule.coins} coins</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity onPress={startGame} style={styles.startButtonContainer}>
              <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.startButton}>
                <Text style={styles.startButtonText}>Start Game</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <View style={styles.content}>
            <Text style={styles.progressText}>
              Product {currentProduct + 1} of {products.length}
            </Text>

            <View style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <Text style={styles.productImage}>{products[currentProduct].image}</Text>
              </View>
              <Text style={styles.productName}>{products[currentProduct].name}</Text>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{products[currentProduct].category}</Text>
              </View>

              {!feedback && (
                <View style={styles.guessContainer}>
                  <Text style={styles.guessLabel}>Enter your guess (in ₹)</Text>
                  <TextInput
                    style={styles.guessInput}
                    value={guess}
                    onChangeText={setGuess}
                    placeholder="Enter price..."
                    placeholderTextColor="#6B7280"
                    keyboardType="numeric"
                    textAlign="center"
                  />
                  <TouchableOpacity
                    onPress={submitGuess}
                    disabled={!guess || parseInt(guess) <= 0}
                    style={styles.submitButtonContainer}
                  >
                    <LinearGradient
                      colors={!guess || parseInt(guess) <= 0 ? ['#4B5563', '#374151'] : ['#10B981', '#14B8A6']}
                      style={styles.submitButton}
                    >
                      <Text style={styles.submitButtonText}>Submit Guess</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {feedback && (
                <View style={styles.feedbackContainer}>
                  <View style={[
                    styles.feedbackCard,
                    { backgroundColor: feedback.earnedCoins >= 30 ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.15)' }
                  ]}>
                    <Text style={[
                      styles.feedbackMessage,
                      { color: feedback.earnedCoins >= 30 ? '#22C55E' : '#F97316' }
                    ]}>
                      {feedback.message}
                    </Text>
                    <View style={styles.feedbackCoins}>
                      <Ionicons name="cash" size={24} color="#10B981" />
                      <Text style={styles.feedbackCoinsText}>+{feedback.earnedCoins}</Text>
                    </View>
                  </View>
                  <View style={styles.actualPriceCard}>
                    <Text style={styles.actualPriceLabel}>Actual Price</Text>
                    <Text style={styles.actualPriceValue}>₹{feedback.actualPrice.toLocaleString()}</Text>
                    <Text style={styles.percentOffText}>You were {feedback.percentDiff}% off</Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
          <View style={styles.content}>
            <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.resultCard}>
              <View style={styles.resultIcon}>
                <Ionicons name="trophy" size={48} color="#FFF" />
              </View>
              <Text style={styles.resultTitle}>Game Complete!</Text>
              <Text style={styles.resultSubtitle}>You guessed {products.length} products</Text>
              <View style={styles.totalEarnedCard}>
                <View style={styles.totalEarnedRow}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                  <Text style={styles.totalEarnedValue}>+{score}</Text>
                </View>
                <Text style={styles.totalEarnedLabel}>Total Coins Earned</Text>
              </View>
            </LinearGradient>

            <View style={styles.actionsContainer}>
              <TouchableOpacity onPress={startGame} style={styles.actionButtonContainer}>
                <LinearGradient colors={['#10B981', '#14B8A6']} style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Play Again</Text>
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
  scoreBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },
  scrollView: { flex: 1 },
  content: { padding: 16 },
  heroCard: { padding: 24, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroIconText: { fontSize: 40 },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 16 },
  heroInfo: { padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  heroInfoValue: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  heroInfoLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  rulesCard: { padding: 20, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 24 },
  rulesTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF', marginBottom: 12 },
  ruleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 8 },
  ruleRange: { fontSize: 14, color: '#FFF' },
  ruleCoins: { fontSize: 14, fontWeight: 'bold' },
  startButtonContainer: { borderRadius: 16, overflow: 'hidden' },
  startButton: { paddingVertical: 16, alignItems: 'center', borderRadius: 16 },
  startButtonText: { fontSize: 16, fontWeight: 'bold', color: '#FFF' },
  progressText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginBottom: 16 },
  productCard: { padding: 24, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  productImageContainer: { width: 128, height: 128, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  productImage: { fontSize: 64 },
  productName: { fontSize: 24, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 16, backgroundColor: 'rgba(59,130,246,0.2)', marginBottom: 24 },
  categoryText: { fontSize: 12, fontWeight: '500', color: '#3B82F6' },
  guessContainer: { width: '100%' },
  guessLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  guessInput: { width: '100%', padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  submitButtonContainer: { borderRadius: 12, overflow: 'hidden' },
  submitButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  submitButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  feedbackContainer: { width: '100%', gap: 16 },
  feedbackCard: { padding: 16, borderRadius: 12, alignItems: 'center' },
  feedbackMessage: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  feedbackCoins: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedbackCoinsText: { fontSize: 24, fontWeight: 'bold', color: '#10B981' },
  actualPriceCard: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center' },
  actualPriceLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
  actualPriceValue: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  percentOffText: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  resultCard: { padding: 32, borderRadius: 16, alignItems: 'center', marginBottom: 24 },
  resultIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  resultTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginBottom: 8 },
  resultSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: 24 },
  totalEarnedCard: { padding: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  totalEarnedRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  totalEarnedValue: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  totalEarnedLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  actionsContainer: { gap: 12 },
  actionButtonContainer: { borderRadius: 12, overflow: 'hidden' },
  actionButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 12 },
  actionButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
  secondaryButton: { paddingVertical: 14, alignItems: 'center', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  secondaryButtonText: { fontSize: 14, fontWeight: '600', color: '#FFF' },
});

export default GuessPrice;
