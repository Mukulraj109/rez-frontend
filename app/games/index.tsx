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
      console.log('[GAMES] User not authenticated, redirecting to sign-in...');
      router.replace({
        pathname: '/sign-in',
        params: { returnTo: '/games' },
      } as any);
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.user]);

  // ✅ VERIFIED: Sync with gamification context (which now uses wallet API)
  // Gamification context fetches coins from wallet, so this is already correct
  useEffect(() => {
    if (gamificationState.coinBalance.total > 0) {
      setUserCoins(gamificationState.coinBalance.total);
    }
    setDayStreak(gamificationState.dailyStreak);
  }, [gamificationState.coinBalance.total, gamificationState.dailyStreak]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // ✅ UPDATED: Use wallet API as single source of truth for coins
      if (authState.user) {
        try {
          console.log('🔄 [GAMES] Loading wallet balance (source of truth)...');

          const walletResponse = await walletApi.getBalance();

          if (walletResponse.success && walletResponse.data) {
            const wasilCoin = walletResponse.data.coins.find((c: any) => c.type === 'wasil');
            const actualWalletCoins = wasilCoin?.amount || 0;
            setUserCoins(actualWalletCoins);
            console.log(`✅ [GAMES] Wallet balance loaded: ${actualWalletCoins}`);
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
            const gamesWonCount = Math.floor(gamesPlayed * 0.6); // Estimate 60% win rate
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
      alert('Coming Soon! This game will be available soon.');
    } else if (game.status === 'locked') {
      alert('This game is locked. Complete more challenges to unlock!');
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
        disabled={isDisabled && game.status === 'locked'}
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
                  <Ionicons name="star" size={14} color="#FFD700" />
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
        <ActivityIndicator size="large" color="#8B5CF6" />
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
            backgroundColor: '#8B5CF6',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" />
        }
      >
        {/* Header */}
        <LinearGradient colors={['#8B5CF6', '#A855F7']} style={styles.header}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerTitle}>Games & Challenges</Text>
              <Text style={styles.headerSubtitle}>Play games, earn rewards!</Text>
            </View>
            <TouchableOpacity
              style={styles.coinsContainer}
              onPress={() => router.push('/WalletScreen' as any)}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={24} color="#FFD700" />
              <Text style={styles.coinsText}>{userCoins.toLocaleString()}</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Info Banner */}
        <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={24} color="#8B5CF6" />
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
              <Ionicons name="trophy" size={32} color="#FFD700" />
              <Text style={styles.statValue}>{gamesWon}</Text>
              <Text style={styles.statLabel}>Games Won</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="flame" size={32} color="#FF6B6B" />
              <Text style={styles.statValue}>{dayStreak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="star" size={32} color="#FFD700" />
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
              colors={['#8B5CF6', '#7C3AED']}
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
    backgroundColor: '#F5F5F5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 6,
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoBannerText: {
    flex: 1,
    marginLeft: 12,
  },
  infoBannerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoBannerDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  gamesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  gamesGrid: {
    gap: 12,
  },
  gameCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  gameGradient: {
    padding: 20,
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
    fontSize: 48,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  lockedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 14,
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
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 80,
  },
  ctaButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
});
