import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function TriviaPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handleNotifyMe = () => {
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address to get notified.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    // Here you would typically send the email to your backend
    setSubscribed(true);
    Alert.alert(
      'Thanks! 🎉',
      "You'll be the first to know when Trivia Challenge launches!",
      [{ text: 'Awesome!' }]
    );
  };

  const handleBackToGames = () => {
    router.push('/games' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Trivia Challenge',
          headerStyle: {
            backgroundColor: '#FFD93D',
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
        <LinearGradient
          colors={['#FFD93D', '#FFC93D', '#FFB93D']}
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
              colors={['#FF6B6B', '#EF4444']}
              style={styles.iconGradient}
            >
              <Text style={styles.icon}>🎯</Text>
            </LinearGradient>
          </View>

          {/* Content */}
          <ThemedText style={styles.title}>Trivia Challenge</ThemedText>
          <ThemedText style={styles.subtitle}>
            Test your knowledge across multiple categories
          </ThemedText>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <ThemedText style={styles.featureText}>
                Multiple difficulty levels
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <ThemedText style={styles.featureText}>
                Various categories to choose from
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <ThemedText style={styles.featureText}>
                Compete with friends on leaderboard
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              <ThemedText style={styles.featureText}>
                Win up to 150 coins per game
              </ThemedText>
            </View>
          </View>

          {/* Rewards Preview */}
          <View style={styles.rewardsCard}>
            <Ionicons name="trophy" size={40} color="#FFD700" />
            <ThemedText style={styles.rewardsTitle}>Rewards</ThemedText>
            <ThemedText style={styles.rewardsText}>
              Win up to 150 coins per challenge
            </ThemedText>
          </View>

          {/* Subscribe Form */}
          {!subscribed ? (
            <View style={styles.subscribeContainer}>
              <ThemedText style={styles.subscribeTitle}>
                Get notified when it launches!
              </ThemedText>
              <View style={styles.inputContainer}>
                <Ionicons name="mail" size={20} color="#6B7280" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              <TouchableOpacity
                style={styles.notifyButton}
                onPress={handleNotifyMe}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  style={styles.notifyButtonGradient}
                >
                  <Ionicons name="notifications" size={20} color="white" />
                  <ThemedText style={styles.notifyButtonText}>Notify Me</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.subscribedContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <ThemedText style={styles.subscribedTitle}>You're all set!</ThemedText>
              <ThemedText style={styles.subscribedText}>
                We'll notify you when Trivia Challenge is ready.
              </ThemedText>
            </View>
          )}

          {/* Back to Games Button */}
          <TouchableOpacity
            style={styles.backToGamesButton}
            onPress={handleBackToGames}
            activeOpacity={0.8}
          >
            <View style={styles.backToGamesButtonInner}>
              <Ionicons name="game-controller" size={20} color="#111827" />
              <ThemedText style={styles.backToGamesButtonText}>
                Browse Other Games
              </ThemedText>
            </View>
          </TouchableOpacity>
        </LinearGradient>
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
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  rewardsCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  rewardsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 4,
  },
  rewardsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  subscribeContainer: {
    width: '100%',
    marginBottom: 20,
  },
  subscribeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    marginLeft: 12,
  },
  notifyButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  notifyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  notifyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  subscribedContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subscribedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 16,
    marginBottom: 8,
  },
  subscribedText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  backToGamesButton: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backToGamesButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  backToGamesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
});
