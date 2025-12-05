import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { navigationDebugger } from '@/utils/navigationDebug';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  textPrimary: '#0B2240',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

export default function RewardsIntroScreen() {
  const router = useRouter();

  const handleNext = () => {
    navigationDebugger.logNavigation('rewards-intro', 'transactions-preview', 'rewards-understood');
    router.push('/onboarding/transactions-preview');
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.surface, '#EDF2F7', COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circleGreen]} />
        <View style={[styles.circle, styles.circleGold]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.glassShine}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Shop, Share & Earn!</Text>
            <Text style={styles.subtitle}>
              Share your purchases and earn{'\n'}ReZ Coins as rewards
            </Text>

            <View style={styles.underlineContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />
            </View>
          </View>

          {/* Social Media Mockup */}
          <View style={styles.illustrationContainer}>
            <View style={styles.socialMediaContainer}>
              {/* Main Post Card */}
              <View style={styles.postCard}>
                <View style={styles.postHeader}>
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.deepTeal]}
                    style={styles.profilePic}
                  >
                    <Text style={styles.profileInitial}>S</Text>
                  </LinearGradient>
                  <View style={styles.postInfo}>
                    <Text style={styles.username}>Sarah M.</Text>
                    <Text style={styles.timestamp}>Just now • Public</Text>
                  </View>
                  <View style={styles.verifiedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
                  </View>
                </View>

                <View style={styles.postContent}>
                  <View style={styles.foodImage}>
                    <View style={[styles.foodItem, styles.foodItem1]}>
                      <Ionicons name="pizza" size={20} color={COLORS.gold} />
                    </View>
                    <View style={[styles.foodItem, styles.foodItem2]}>
                      <Ionicons name="cafe" size={18} color={COLORS.primary} />
                    </View>
                    <View style={[styles.foodItem, styles.foodItem3]}>
                      <Ionicons name="ice-cream" size={16} color="#EC4899" />
                    </View>
                  </View>

                  <View style={styles.postActions}>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="heart" size={18} color="#EC4899" />
                      <Text style={styles.actionCount}>24</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="chatbubble-outline" size={18} color={COLORS.textMuted} />
                      <Text style={styles.actionCount}>5</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-social-outline" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Floating Coins */}
              <View style={[styles.coin, styles.coin1]}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.coinInner}
                >
                  <Text style={styles.coinText}>R</Text>
                </LinearGradient>
              </View>
              <View style={[styles.coin, styles.coin2]}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.coinInner}
                >
                  <Text style={styles.coinText}>R</Text>
                </LinearGradient>
              </View>
              <View style={[styles.coin, styles.coin3]}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.coinInner}
                >
                  <Text style={styles.coinText}>R</Text>
                </LinearGradient>
              </View>

              {/* Reward Badge */}
              <View style={styles.rewardBadge}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.deepTeal]}
                  style={styles.rewardBadgeInner}
                >
                  <Text style={styles.rewardText}>+50</Text>
                  <Text style={styles.rewardLabel}>coins</Text>
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* How it Works */}
          <View style={styles.howItWorks}>
            <Text style={styles.howItWorksTitle}>How it works</Text>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Shop anywhere</Text>
                <Text style={styles.stepDesc}>Make purchases at partner stores</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: COLORS.gold }]}>
                <Text style={[styles.stepNumberText, { color: COLORS.textPrimary }]}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share on social</Text>
                <Text style={styles.stepDesc}>Post about your experience</Text>
              </View>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Earn ReZ Coins</Text>
                <Text style={styles.stepDesc}>Get coins for every share</Text>
              </View>
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.deepTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Decorative
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGreen: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  circleGold: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(30px)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },

  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  socialMediaContainer: {
    position: 'relative',
    width: 240,
    height: 220,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    width: 200,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  profilePic: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  profileInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  postInfo: {
    flex: 1,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  verifiedBadge: {
    marginLeft: 4,
  },
  postContent: {
    flex: 1,
  },
  foodImage: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 20,
    position: 'relative',
    marginBottom: 12,
    height: 80,
  },
  foodItem: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  foodItem1: {
    top: 10,
    left: 20,
  },
  foodItem2: {
    top: 25,
    right: 30,
  },
  foodItem3: {
    bottom: 10,
    left: 50,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },

  // Floating Coins
  coin: {
    position: 'absolute',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  coinInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  coinText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  coin1: {
    top: 20,
    right: 10,
  },
  coin2: {
    bottom: 60,
    left: 5,
  },
  coin3: {
    bottom: 20,
    right: 40,
  },

  // Reward Badge
  rewardBadge: {
    position: 'absolute',
    top: 60,
    right: 0,
  },
  rewardBadgeInner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rewardLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // How it Works
  howItWorks: {
    marginBottom: 24,
  },
  howItWorksTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  stepDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
