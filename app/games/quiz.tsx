import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import QuizGame from '@/components/gamification/QuizGame';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useGamification } from '@/contexts/GamificationContext';

export default function QuizPage() {
  const [gameComplete, setGameComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  const { actions: gamificationActions } = useGamification();

  const handleBackPress = () => {
    if (!gameComplete) {
      Alert.alert(
        'Quit Quiz?',
        'Are you sure you want to quit? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Quit', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleGameComplete = async (score: number, coins: number) => {
    setFinalScore(score);
    setCoinsEarned(coins);
    setGameComplete(true);

    // Refresh gamification data to update coins balance
    try {
      await gamificationActions.loadGamificationData();
    } catch (error) {
      console.error('Error refreshing gamification data:', error);
    }
  };

  const handlePlayAgain = () => {
    setGameComplete(false);
    setFinalScore(0);
    setCoinsEarned(0);
  };

  const handleViewChallenges = () => {
    router.push('/gamification' as any);
  };

  if (gameComplete) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Quiz Complete',
            headerStyle: {
              backgroundColor: '#8B5CF6',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
            ),
          }}
        />
        <ThemedView style={styles.completeContainer}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED', '#6366F1']}
            style={styles.completeCard}
          >
            <Ionicons name="trophy" size={80} color="#FFD700" />
            <ThemedText style={styles.completeTitle}>Quiz Complete!</ThemedText>
            <ThemedText style={styles.completeSubtitle}>Congratulations!</ThemedText>

            <View style={styles.resultsContainer}>
              <View style={styles.resultBox}>
                <Ionicons name="star" size={32} color="white" />
                <ThemedText style={styles.resultValue}>{finalScore}</ThemedText>
                <ThemedText style={styles.resultLabel}>Final Score</ThemedText>
              </View>
              <View style={styles.resultBox}>
                <Ionicons name="diamond" size={32} color="white" />
                <ThemedText style={styles.resultValue}>{coinsEarned}</ThemedText>
                <ThemedText style={styles.resultLabel}>Coins Earned</ThemedText>
              </View>
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handlePlayAgain}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonInner}>
                  <Ionicons name="refresh" size={20} color="#8B5CF6" />
                  <ThemedText style={styles.actionButtonText}>Play Again</ThemedText>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={handleViewChallenges}
                activeOpacity={0.8}
              >
                <View style={styles.actionButtonInner}>
                  <Ionicons name="trophy" size={20} color="white" />
                  <ThemedText style={styles.actionButtonTextSecondary}>
                    View Challenges
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Daily Quiz',
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
      <ThemedView style={styles.container}>
        <QuizGame
          difficulty="medium"
          category="general"
          onGameComplete={handleGameComplete}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  backButton: {
    marginLeft: Platform.OS === 'ios' ? 8 : 16,
    padding: 4,
  },
  completeContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completeCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  completeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 20,
    marginBottom: 8,
  },
  completeSubtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 32,
  },
  resultsContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 32,
  },
  resultBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  resultLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  actionButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
