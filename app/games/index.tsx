import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
  Alert,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { useGamification } from '@/contexts/GamificationContext';
import walletApi from '@/services/walletApi';
import { useAuth } from '@/contexts/AuthContext';
import GameErrorBoundary from '@/components/common/GameErrorBoundary';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  navy: '#0B2240',
  surface: '#F7FAFC',
  cardBg: '#FFFFFF',
};

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  rewardCoins: number;
  status: 'active' | 'coming_soon' | 'locked';
}

const games: Game[] = [
  {
    id: 'spin-wheel',
    title: 'Spin & Win',
    description: 'Spin the wheel daily for rewards',
    icon: '🎡',
    route: '/games/spin-wheel',
    color: '#FF6B6B',
    rewardCoins: 50,
    status: 'active',
  },
  {
    id: 'scratch-card',
    title: 'Scratch Card',
    description: 'Scratch to reveal prizes',
    icon: '🎫',
    route: '/scratch-card',
    color: '#4ECDC4',
    rewardCoins: 100,
    status: 'active',
  },
  {
    id: 'quiz',
    title: 'Daily Quiz',
    description: 'Answer questions, earn coins',
    icon: '🧠',
    route: '/games/quiz',
    color: '#95E1D3',
    rewardCoins: 75,
    status: 'coming_soon',
  },
  {
    id: 'trivia',
    title: 'Trivia Challenge',
    description: 'Test your knowledge',
    icon: '🎯',
    route: '/games/trivia',
    color: '#FFD93D',
    rewardCoins: 150,
    status: 'coming_soon',
  },
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Match cards to win coins',
    icon: '🃏',
    route: '/games/memory',
    color: '#A8E6CF',
    rewardCoins: 80,
    status: 'coming_soon',
  },
  {
    id: 'slot-machine',
    title: 'Slot Machine',
    description: 'Try your luck with slots',
    icon: '🎰',
    route: '/games/slots',
    color: '#FF8B94',
    rewardCoins: 200,
    status: 'locked',
  },
];

export default function GamesPage() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [dayStreak, setDayStreak] = useState(0);

  const { state: authState } = useAuth();
  const { state: gamificationState, actions: gamificationActions } = useGamification();

  useEffect(() => {
    // Load data if user is authenticated
    if (authState.isAuthenticated && authState.user) {
      loadUserData();
    } else if (!authState.isLoading && !authState.isAuthenticated) {
      // Only redirect if auth check is complete and user is not authenticated
      router.replace({
        pathname: '/sign-in',
        params: { returnTo: '/games' },
      } as any);
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.user]);

  // Sync with gamification context (which now uses wallet API)
  useEffect(() => {
    if (gamificationState.coinBalance.total > 0) {
      setUserCoins(gamificationState.coinBalance.total);
    }
    setDayStreak(gamificationState.dailyStreak);
  }, [gamificationState.coinBalance.total, gamificationState.dailyStreak]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      if (authState.user) {
        try {
          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const rezCoin = walletResponse.data.coins.find((c: any) => c.type === 'rez');
            const actualWalletCoins = rezCoin?.amount || 0;
            setUserCoins(actualWalletCoins);
          } else {
            // Fallback: sync gamification context from wallet
            console.warn('⚠️ [GAMES] Wallet API failed, syncing from gamification context...');
            await gamificationActions.syncCoinsFromWallet();
            setUserCoins(gamificationState.coinBalance.total);
          }
        } catch (walletError) {
          console.error('❌ [GAMES] Error fetching wallet balance:', walletError);
          // Fallback: sync gamification context from wallet
          await gamificationActions.syncCoinsFromWallet();
          setUserCoins(gamificationState.coinBalance.total);
        }

        // Fetch gamification stats (achievements, challenges only - NOT coins)
        try {
          await gamificationActions.loadGamificationData();

          // Set games won from achievement progress
          if (gamificationState.achievementProgress) {
            const gamesPlayed = gamificationState.achievementProgress.gamesPlayed || 0;
            // Use actual games won if available, otherwise estimate
            const actualGamesWon = gamificationState.achievementProgress.gamesWon;
            const gamesWonCount = actualGamesWon !== undefined
              ? actualGamesWon
              : Math.floor(gamesPlayed * 0.6);
            setGamesWon(gamesWonCount);
          }
        } catch (gamificationError) {
          console.error('❌ [GAMES] Error fetching gamification data:', gamificationError);
        }
      }
    } catch (error) {
      console.error('❌ [GAMES] Error loading user data:', error);
      Alert.alert('Error', 'Failed to load game data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const handleGamePress = (game: Game) => {
    if (game.status === 'active') {
      router.push(game.route as any);
    } else if (game.status === 'coming_soon') {
      router.push(game.route as any);
    } else if (game.status === 'locked') {
      Alert.alert('Game Locked', 'Complete more challenges to unlock this game!');
    }
  };

  const renderGameCard = (game: Game) => {
    const isDisabled = game.status !== 'active';

    return (
      <TouchableOpacity
        key={game.id}
        style={styles.gameCard}
        onPress={() => handleGamePress(game)}
        activeOpacity={0.8}
        disabled={game.status === 'locked'}
      >
        <LinearGradient
          colors={isDisabled ? ['#E5E7EB', '#D1D5DB'] : [game.color, adjustColor(game.color, -20)]}
          style={styles.gameGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.gameContent}>
            <View style={styles.gameIconContainer}>
              <Text style={styles.gameIcon}>{game.icon}</Text>
              {game.status === 'coming_soon' && (
                <View style={styles.comingSoonBadge}>
                  <Text style={styles.comingSoonText}>SOON</Text>
                </View>
              )}
              {game.status === 'locked' && (
                <View style={styles.lockedBadge}>
                  <Ionicons name="lock-closed" size={16} color="white" />
                </View>
              )}
            </View>
            <View style={styles.gameInfo}>
              <Text style={styles.gameTitle}>{game.title}</Text>
              <Text style={styles.gameDescription}>{game.description}</Text>
              {game.status === 'active' && (
                <View style={styles.rewardContainer}>
                  <Ionicons name="star" size={14} color={COLORS.gold} />
                  <Text style={styles.rewardText}>Win up to {game.rewardCoins} coins</Text>
                </View>
              )}
            </View>
            {game.status === 'active' && (
              <Ionicons name="chevron-forward" size={24} color="white" />
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <GameErrorBoundary
      gameName="Games Hub"
      onReturnToGames={() => router.push('/' as any)}
      onReset={() => {
        setLoading(false);
        loadUserData();
      }}
    >
      <Stack.Screen
        options={{
          title: 'Games & Challenges',
          headerStyle: {
            backgroundColor: COLORS.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Premium Glassmorphism Header */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          {/* Glass overlay */}
          <View style={styles.glassOverlay} />

          {/* Decorative elements */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
          <View style={styles.decorCircle3} />

          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>Games & Challenges</Text>
              <View style={styles.titleUnderline} />
              <Text style={styles.headerSubtitle}>Play games, earn rewards!</Text>
            </View>
            <TouchableOpacity
              style={styles.coinsContainer}
              onPress={() => router.push('/WalletScreen' as any)}
              activeOpacity={0.7}
              accessibilityLabel={`Total coins: ${userCoins}`}
              accessibilityRole="button"
              accessibilityHint="Tap to view your wallet"
            >
              <Ionicons name="star" size={18} color={COLORS.gold} />
              <Text style={styles.coinsText}>{userCoins.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <View style={styles.infoBannerIconContainer}>
            <Ionicons name="information-circle" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.infoBannerText}>
            <Text style={styles.infoBannerTitle}>How it works</Text>
            <Text style={styles.infoBannerDescription}>
              Play games daily to earn coins. Use coins to redeem rewards and vouchers!
            </Text>
          </View>
        </View>

        {/* Games Grid */}
        <View style={styles.gamesSection}>
          <ThemedText style={styles.sectionTitle}>Available Games</ThemedText>
          <View style={styles.gamesGrid}>
            {games.map((game) => renderGameCard(game))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <ThemedText style={styles.sectionTitle}>Your Stats</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trophy" size={28} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>{gamesWon}</Text>
              <Text style={styles.statLabel}>Games Won</Text>
            </View>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                <Ionicons name="flame" size={28} color="#FF6B6B" />
              </View>
              <Text style={styles.statValue}>{dayStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name="star" size={28} color={COLORS.gold} />
              </View>
              <Text style={styles.statValue}>{userCoins.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Coins</Text>
            </View>
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/gamification' as any)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.ctaGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.ctaText}>View All Challenges</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </GameErrorBoundary>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const clamp = (val: number) => Math.min(Math.max(val, 0), 255);
  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `#${clamp(r + amount).toString(16).padStart(2, '0')}${clamp(g + amount).toString(16).padStart(2, '0')}${clamp(b + amount).toString(16).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px 8px 32px rgba(0, 192, 106, 0.35)',
      },
    }),
  },
  glassOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  decorCircle1: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    top: 60,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
  },
  decorCircle3: {
    position: 'absolute',
    bottom: -20,
    right: 60,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.3,
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.1)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
      },
    }),
  },
  titleUnderline: {
    width: 40,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.gold,
    marginTop: 6,
    marginBottom: 8,
    opacity: 0.9,
  },
  headerSubtitle: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
    }),
  },
  coinsText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  infoBannerIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 14,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  infoBannerDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  gamesSection: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
  gamesGrid: {
    gap: 12,
  },
  gameCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 6px 20px rgba(11, 34, 64, 0.12)',
      },
    }),
  },
  gameGradient: {
    padding: 18,
  },
  gameContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameIconContainer: {
    position: 'relative',
    marginRight: 16,
  },
  gameIcon: {
    fontSize: 44,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  comingSoonText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  lockedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rewardText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    marginLeft: 4,
  },
  statsSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.08)',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 200, 87, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.navy,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  footer: {
    padding: 16,
    paddingBottom: 100,
  },
  ctaButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 6px 24px rgba(0, 192, 106, 0.35)',
      },
    }),
  },
  ctaGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
});
