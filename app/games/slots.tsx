import React from 'react';
import {
  View,
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
import { useGamification } from '@/contexts/GamificationContext';

export default function SlotsPage() {
  const { state: gamificationState } = useGamification();
  const currentLevel = gamificationState.level || 1;
  const requiredLevel = 10;
  const isLocked = currentLevel < requiredLevel;

  const handleBackPress = () => {
    router.back();
  };

  const handleViewChallenges = () => {
    router.push('/gamification' as any);
  };

  const handleBackToGames = () => {
    router.push('/games' as any);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Slot Machine',
          headerStyle: {
            backgroundColor: '#FF8B94',
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
            colors={['#FF8B94', '#FF7A85', '#FF6976']}
            style={styles.gradient}
          >
            {/* Locked Badge */}
            <View style={styles.badgeContainer}>
              <View style={styles.lockedBadge}>
                <Ionicons name="lock-closed" size={16} color="white" />
                <ThemedText style={styles.badgeText}>LOCKED</ThemedText>
              </View>
            </View>

            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#374151', '#1F2937']}
                style={styles.iconGradient}
              >
                <Text style={styles.icon}>🎰</Text>
                <View style={styles.lockOverlay}>
                  <Ionicons name="lock-closed" size={40} color="rgba(255, 255, 255, 0.8)" />
                </View>
              </LinearGradient>
            </View>

            {/* Content */}
            <ThemedText style={styles.title}>Slot Machine</ThemedText>
            <ThemedText style={styles.subtitle}>
              Unlock by reaching Level {requiredLevel}
            </ThemedText>

            {/* Progress Card */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <ThemedText style={styles.progressTitle}>Your Progress</ThemedText>
                <View style={styles.levelBadge}>
                  <Ionicons name="trophy" size={16} color="#FFD700" />
                  <ThemedText style={styles.levelText}>Level {currentLevel}</ThemedText>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={[
                      styles.progressFill,
                      { width: `${Math.min((currentLevel / requiredLevel) * 100, 100)}%` },
                    ]}
                  />
                </View>
                <ThemedText style={styles.progressText}>
                  {currentLevel} / {requiredLevel}
                </ThemedText>
              </View>

              <View style={styles.progressFooter}>
                <ThemedText style={styles.progressFooterText}>
                  {isLocked
                    ? `${requiredLevel - currentLevel} more level${requiredLevel - currentLevel !== 1 ? 's' : ''} to unlock!`
                    : 'Unlocked! Start playing now!'}
                </ThemedText>
              </View>
            </View>

            {/* Game Preview */}
            <View style={styles.previewCard}>
              <View style={styles.slotMachine}>
                <View style={styles.slotReels}>
                  <View style={styles.slotReel}>
                    <Text style={styles.slotSymbol}>🍒</Text>
                  </View>
                  <View style={styles.slotReel}>
                    <Text style={styles.slotSymbol}>💎</Text>
                  </View>
                  <View style={styles.slotReel}>
                    <Text style={styles.slotSymbol}>⭐</Text>
                  </View>
                </View>
              </View>
              <View style={styles.previewOverlay}>
                <Ionicons name="lock-closed" size={48} color="rgba(255, 255, 255, 0.9)" />
              </View>
            </View>

            {/* Unlock Benefits */}
            <View style={styles.benefitsContainer}>
              <ThemedText style={styles.benefitsTitle}>What You'll Get</ThemedText>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="star" size={24} color="#FFD700" />
                </View>
                <View style={styles.benefitContent}>
                  <ThemedText style={styles.benefitTitle}>Huge Rewards</ThemedText>
                  <ThemedText style={styles.benefitText}>
                    Win up to 200 coins per spin
                  </ThemedText>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="rocket" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.benefitContent}>
                  <ThemedText style={styles.benefitTitle}>Daily Spins</ThemedText>
                  <ThemedText style={styles.benefitText}>
                    Get 3 free spins every day
                  </ThemedText>
                </View>
              </View>
              <View style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name="trophy" size={24} color="#10B981" />
                </View>
                <View style={styles.benefitContent}>
                  <ThemedText style={styles.benefitTitle}>Jackpot Prizes</ThemedText>
                  <ThemedText style={styles.benefitText}>
                    Chance to win exclusive vouchers
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* How to Unlock */}
            <View style={styles.unlockCard}>
              <Ionicons name="key" size={32} color="#8B5CF6" />
              <ThemedText style={styles.unlockTitle}>How to Unlock</ThemedText>
              <ThemedText style={styles.unlockText}>
                Complete challenges, play games, and earn points to level up. The more active you
                are, the faster you'll reach Level {requiredLevel}!
              </ThemedText>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              {isLocked && (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleViewChallenges}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#8B5CF6', '#7C3AED']}
                    style={styles.buttonGradient}
                  >
                    <Ionicons name="trophy" size={20} color="white" />
                    <ThemedText style={styles.primaryButtonText}>
                      Complete Challenges
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleBackToGames}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryButtonInner}>
                  <Ionicons name="game-controller" size={20} color="#111827" />
                  <ThemedText style={styles.secondaryButtonText}>
                    Play Other Games
                  </ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer Note */}
            <View style={styles.footer}>
              <Ionicons name="flash" size={20} color="#6B7280" />
              <ThemedText style={styles.footerText}>
                Keep playing and leveling up to unlock this amazing game!
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
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
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
    position: 'relative',
  },
  icon: {
    fontSize: 56,
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
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
  progressCard: {
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
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  progressFooter: {
    alignItems: 'center',
  },
  progressFooterText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  previewCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  slotMachine: {
    alignItems: 'center',
  },
  slotReels: {
    flexDirection: 'row',
    gap: 12,
  },
  slotReel: {
    width: 80,
    height: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
  },
  slotSymbol: {
    fontSize: 40,
    opacity: 0.3,
  },
  previewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitsContainer: {
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
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  unlockCard: {
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
  unlockTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    marginBottom: 8,
  },
  unlockText: {
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
