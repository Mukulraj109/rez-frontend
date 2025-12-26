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

const { width } = Dimensions.get('window');

const Quiz = () => {
  const router = useRouter();
  const [gameState, setGameState] = useState<'start' | 'playing' | 'result'>('start');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [todayPlays, setTodayPlays] = useState(2);
  const maxPlays = 5;

  const quizQuestions = [
    {
      id: 1,
      question: 'Which brand offers the highest cashback on electronics?',
      options: ['Amazon', 'Flipkart', 'Croma', 'Reliance Digital'],
      correct: 1,
      coins: 50,
      category: 'Shopping'
    },
    {
      id: 2,
      question: 'What is the minimum order value for free delivery on most food apps?',
      options: ['₹99', '₹149', '₹199', '₹299'],
      correct: 2,
      coins: 50,
      category: 'Food & Dining'
    },
    {
      id: 3,
      question: 'Which ReZ coin can be used to buy gift cards?',
      options: ['ReZ Coin', 'Branded Coin', 'Privé Coin', 'Promo Coin'],
      correct: 2,
      coins: 50,
      category: 'ReZ System'
    },
    {
      id: 4,
      question: 'Best time to book flights for maximum savings?',
      options: ['Monday morning', 'Tuesday afternoon', 'Friday evening', 'Sunday night'],
      correct: 1,
      coins: 50,
      category: 'Travel'
    },
    {
      id: 5,
      question: 'Which payment method gives extra ReZ coins?',
      options: ['Cash', 'Credit Card', 'ReZ Wallet', 'Net Banking'],
      correct: 2,
      coins: 50,
      category: 'ReZ System'
    }
  ];

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0 && selectedAnswer === null) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && selectedAnswer === null) {
      handleAnswer(-1);
    }
  }, [timeLeft, gameState, selectedAnswer]);

  const startGame = () => {
    if (todayPlays >= maxPlays) return;
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setTimeLeft(15);
    setStreak(0);
  };

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === quizQuestions[currentQuestion].correct;

    if (isCorrect) {
      setScore(score + quizQuestions[currentQuestion].coins);
      setStreak(streak + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setTimeLeft(15);
      } else {
        setGameState('result');
        setTodayPlays(todayPlays + 1);
      }
    }, 1500);
  };

  const getStreakBonus = () => {
    if (streak >= 5) return score * 0.5;
    if (streak >= 3) return score * 0.25;
    return 0;
  };

  const totalEarned = score + getStreakBonus();

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
        <View style={styles.headerContent}>
          <View style={styles.headerTitleRow}>
            <Ionicons name="bulb" size={24} color="#A855F7" />
            <Text style={styles.headerTitle}>Quiz Master</Text>
          </View>
          <Text style={styles.headerSubtitle}>Test your knowledge, earn coins</Text>
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
            {/* Hero */}
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              style={styles.heroCard}
            >
              <View style={styles.heroIcon}>
                <Ionicons name="bulb" size={40} color="#FFF" />
              </View>
              <Text style={styles.heroTitle}>Quiz Master</Text>
              <Text style={styles.heroSubtitle}>Answer 5 questions correctly and earn coins!</Text>
              <View style={styles.heroStats}>
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>250</Text>
                  <Text style={styles.heroStatLabel}>Max Coins</Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroStat}>
                  <Text style={styles.heroStatValue}>{todayPlays}/{maxPlays}</Text>
                  <Text style={styles.heroStatLabel}>Plays Left</Text>
                </View>
              </View>
            </LinearGradient>

            {/* How to Play */}
            <View style={styles.howToPlayCard}>
              <Text style={styles.howToPlayTitle}>How to Play</Text>
              <View style={styles.howToPlaySteps}>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: '#A855F730' }]}>
                    <Text style={[styles.stepNumberText, { color: '#A855F7' }]}>1</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Answer 5 questions</Text>
                    <Text style={styles.stepDesc}>Each question has 15 seconds</Text>
                  </View>
                </View>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: '#3B82F630' }]}>
                    <Text style={[styles.stepNumberText, { color: '#3B82F6' }]}>2</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Earn 50 coins per correct answer</Text>
                    <Text style={styles.stepDesc}>Plus streak bonuses!</Text>
                  </View>
                </View>
                <View style={styles.step}>
                  <View style={[styles.stepNumber, { backgroundColor: '#F59E0B30' }]}>
                    <Text style={[styles.stepNumberText, { color: '#F59E0B' }]}>3</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepTitle}>Get streak bonuses</Text>
                    <Text style={styles.stepDesc}>3+ streak: +25% | 5 streak: +50%</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Start Button */}
            <TouchableOpacity
              onPress={startGame}
              disabled={todayPlays >= maxPlays}
              style={styles.startButtonContainer}
            >
              <LinearGradient
                colors={todayPlays >= maxPlays ? ['#4B5563', '#374151'] : ['#A855F7', '#EC4899']}
                style={styles.startButton}
              >
                <Text style={styles.startButtonText}>
                  {todayPlays >= maxPlays ? 'Come Back Tomorrow' : 'Start Quiz'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Playing Screen */}
        {gameState === 'playing' && (
          <View style={styles.content}>
            {/* Progress */}
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <Text style={styles.progressText}>Question {currentQuestion + 1}/5</Text>
                {streak > 0 && (
                  <View style={styles.streakBadge}>
                    <Ionicons name="flash" size={12} color="#F59E0B" />
                    <Text style={styles.streakBadgeText}>{streak} Streak</Text>
                  </View>
                )}
              </View>
              <View style={styles.scoreContainer}>
                <Ionicons name="cash" size={16} color="#10B981" />
                <Text style={styles.scoreText}>{score}</Text>
              </View>
            </View>

            {/* Question Card */}
            <View style={styles.questionCard}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{quizQuestions[currentQuestion].category}</Text>
              </View>
              <Text style={styles.questionText}>{quizQuestions[currentQuestion].question}</Text>

              {/* Answer Options */}
              <View style={styles.optionsContainer}>
                {quizQuestions[currentQuestion].options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === quizQuestions[currentQuestion].correct;
                  const showResult = selectedAnswer !== null;

                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      style={[
                        styles.optionButton,
                        showResult && isCorrect && styles.optionCorrect,
                        showResult && isSelected && !isCorrect && styles.optionWrong,
                      ]}
                    >
                      <Text style={styles.optionText}>{option}</Text>
                      {showResult && isCorrect && (
                        <Ionicons name="checkmark-circle" size={20} color="#22C55E" />
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <Ionicons name="close-circle" size={20} color="#EF4444" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Progress Bar */}
            <View style={styles.timeProgressContainer}>
              <View style={[styles.timeProgressBar, { width: `${(timeLeft / 15) * 100}%` }]} />
            </View>
          </View>
        )}

        {/* Result Screen */}
        {gameState === 'result' && (
          <View style={styles.content}>
            {/* Result Card */}
            <LinearGradient
              colors={['#A855F7', '#EC4899']}
              style={styles.resultCard}
            >
              <View style={styles.resultIcon}>
                <Ionicons name="trophy" size={48} color="#FFF" />
              </View>
              <Text style={styles.resultTitle}>Quiz Complete!</Text>
              <Text style={styles.resultSubtitle}>You answered {score / 50} out of 5 correctly</Text>

              <View style={styles.totalEarnedCard}>
                <View style={styles.totalEarnedRow}>
                  <Ionicons name="cash" size={24} color="#FFF" />
                  <Text style={styles.totalEarnedValue}>+{Math.round(totalEarned)}</Text>
                </View>
                <Text style={styles.totalEarnedLabel}>Total Coins Earned</Text>
              </View>

              {getStreakBonus() > 0 && (
                <View style={styles.streakBonusCard}>
                  <Ionicons name="flash" size={16} color="#FFF" />
                  <Text style={styles.streakBonusText}>+{Math.round(getStreakBonus())} Streak Bonus!</Text>
                </View>
              )}
            </LinearGradient>

            {/* Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="locate" size={24} color="#3B82F6" />
                <Text style={styles.statValue}>{((score / 250) * 100).toFixed(0)}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="flash" size={24} color="#F59E0B" />
                <Text style={styles.statValue}>{streak}</Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                onPress={startGame}
                disabled={todayPlays >= maxPlays}
                style={styles.actionButtonContainer}
              >
                <LinearGradient
                  colors={todayPlays >= maxPlays ? ['#4B5563', '#374151'] : ['#A855F7', '#EC4899']}
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
  headerContent: {
    flex: 1,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.3)',
  },
  timerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F97316',
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
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
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
  howToPlayCard: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 24,
  },
  howToPlayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
  },
  howToPlaySteps: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  stepDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  startButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  startButton: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 16,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  streakBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
  },
  questionCard: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.2)',
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A855F7',
  },
  questionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 24,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionCorrect: {
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderColor: '#22C55E',
    borderWidth: 2,
  },
  optionWrong: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  timeProgressContainer: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  timeProgressBar: {
    height: '100%',
    backgroundColor: '#A855F7',
    borderRadius: 4,
  },
  resultCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
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
  resultTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 24,
  },
  totalEarnedCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalEarnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  totalEarnedValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFF',
  },
  totalEarnedLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  streakBonusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(245,158,11,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
  },
  streakBonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actionsContainer: {
    gap: 12,
  },
  actionButtonContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
  secondaryButton: {
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default Quiz;
