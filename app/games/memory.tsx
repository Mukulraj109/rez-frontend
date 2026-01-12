import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function MemoryPage() {
  const handleBackPress = () => {
    router.back();
  };

  const handleBackToGames = () => {
    router.push('/games' as any);
  };

  const handleNotifyInterest = () => {
    router.push('/profile' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Memory Match',
          headerStyle: {
            backgroundColor: '#A8E6CF',
          },
          headerTintColor: '#111827',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <LinearGradient
            colors={['#A8E6CF', '#8FD9B8', '#7CCCA0']}
            style={styles.gradient}
          >
            {/* Coming Soon Badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>COMING SOON</ThemedText>
              </View>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#6366F1', '#4F46E5']}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>🃏</Text>
              </LinearGradient>
            </View>

            {/* Content */}
            <ThemedText style={styles.title}>Memory Match</ThemedText>
            <ThemedText style={styles.subtitle}>
              Match cards to win amazing prizes
            </ThemedText>

            {/* Game Preview */}
            <View style={styles.previewCard}>
              <View style={styles.cardGrid}>
                {[...Array(6)].map((_, index) => (
                  <View key={index} style={styles.cardPlaceholder}>
                    <Ionicons name="help" size={24} color="#A8E6CF" />
                  </View>
                ))}
              </View>
            </View>

            {/* Features List */}
            <View style={styles.featuresContainer}>
              <ThemedText style={styles.featuresTitle}>What to Expect</ThemedText>
              <View style={styles.featureItem}>
                <Ionicons name="time" size={24} color="#8B5CF6" />
                <View style={styles.featureContent}>
                  <ThemedText style={styles.featureTitle}>Timed Challenges</ThemedText>
                  <ThemedText style={styles.featureText}>
                    Race against the clock to match all pairs
                  </ThemedText>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="trophy" size={24} color="#8B5CF6" />
                <View style={styles.featureContent}>
                  <ThemedText style={styles.featureTitle}>Progressive Difficulty</ThemedText>
                  <ThemedText style={styles.featureText}>
                    Start easy, advance to harder levels
                  </ThemedText>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="star" size={24} color="#8B5CF6" />
                <View style={styles.featureContent}>
                  <ThemedText style={styles.featureTitle}>Earn Rewards</ThemedText>
                  <ThemedText style={styles.featureText}>
                    Win up to 80 coins per game
                  </ThemedText>
                </View>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="podium" size={24} color="#8B5CF6" />
                <View style={styles.featureContent}>
                  <ThemedText style={styles.featureTitle}>Leaderboard Rankings</ThemedText>
                  <ThemedText style={styles.featureText}>
                    Compete with players worldwide
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Rewards Info */}
            <View style={styles.rewardsCard}>
              <View style={styles.rewardsBadge}>
                <Ionicons name="gift" size={32} color="white" />
              </View>
              <ThemedText style={styles.rewardsTitle}>Exciting Rewards</ThemedText>
              <ThemedText style={styles.rewardsText}>
                Match all pairs quickly to earn bonus coins and unlock special achievements!
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleNotifyInterest}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <Ionicons name="notifications" size={20} color="white" />
                  <ThemedText style={styles.primaryButtonText}>
                    Show Interest
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToGames}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryButtonInner}>
                  <Ionicons name="game-controller" size={20} color="#111827" />
                  <ThemedText style={styles.secondaryButtonText}>
                    Browse Other Games
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer Note */}
            <View style={styles.footer}>
              <Ionicons name="information-circle" size={20} color="#6B7280" />
              <ThemedText style={styles.footerText}>
                We're working hard to bring you this game. Stay tuned!
              </ThemedText>
            </View>
          </LinearGradient>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    marginLeft: Platform.OS === 'ios' ? 8 : 16,
    padding: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  badgeContainer: {
    marginBottom: 20,
  },
  badge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 32,
    textAlign: 'center',
  },
  previewCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  cardPlaceholder: {
    width: 80,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  featuresContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureContent: {
    flex: 1,
    marginLeft: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  rewardsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  rewardsBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#A8E6CF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rewardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  rewardsText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    flex: 1,
  },
});
