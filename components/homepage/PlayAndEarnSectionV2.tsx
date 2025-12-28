/**
 * Play & Earn Section - Converted from V2 Web
 * Exact match to Rez_v-2-main/src/components/home/PlayAndEarnSection.jsx
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Colors matching V2 design
const COLORS = {
  // Light mode
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  gray200: '#E5E7EB',
  green500: '#22C55E',
  green600: '#16A34A',
  green400: '#4ADE80',
  amber500: '#F59E0B',
  amber600: '#D97706',
  amber400: '#FBBF24',
  // Gradients
  greenGradientStart: 'rgba(34, 197, 94, 0.2)',
  greenGradientEnd: 'rgba(16, 185, 129, 0.1)',
  amberGradientStart: 'rgba(245, 158, 11, 0.2)',
  amberGradientEnd: 'rgba(249, 115, 22, 0.1)',
  // Borders
  greenBorder: 'rgba(34, 197, 94, 0.3)',
  amberBorder: 'rgba(245, 158, 11, 0.3)',
};

interface GameCardProps {
  icon: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  reward: string;
  rewardColor: string;
  gradientColors: string[];
  borderColor: string;
  onPress: () => void;
}

const GameCard: React.FC<GameCardProps> = ({
  icon,
  badge,
  badgeColor,
  title,
  subtitle,
  reward,
  rewardColor,
  gradientColors,
  borderColor,
  onPress,
}) => (
  <TouchableOpacity
    style={[styles.gameCard, { borderColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <LinearGradient
      colors={gradientColors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gameCardGradient}
    >
      <View style={styles.gameCardHeader}>
        <Text style={styles.gameIcon}>{icon}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>
      <Text style={styles.gameTitle}>{title}</Text>
      <Text style={styles.gameSubtitle}>{subtitle}</Text>
      <Text style={[styles.gameReward, { color: rewardColor }]}>{reward}</Text>
    </LinearGradient>
  </TouchableOpacity>
);

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={styles.quickAction}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <Text style={styles.quickActionIcon}>{icon}</Text>
    <Text style={styles.quickActionLabel}>{label}</Text>
  </TouchableOpacity>
);

const PlayAndEarnSectionV2: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/playandearn');
  };

  const handleCoinHunt = () => {
    router.push('/coin-hunt');
  };

  const handleScratchCard = () => {
    router.push('/scratch-card');
  };

  const handleBadges = () => {
    router.push('/badges');
  };

  const handleLeaderboard = () => {
    router.push('/playandearn/leaderboard');
  };

  const handleMissions = () => {
    router.push('/missions');
  };

  const handleMore = () => {
    router.push('/playandearn');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎮 Play & Earn</Text>
          <Text style={styles.headerSubtitle}>Free games, real rewards</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Game Cards Row */}
      <View style={styles.gameCardsRow}>
        <GameCard
          icon="🪙"
          badge="PLAY"
          badgeColor={COLORS.green500}
          title="Coin Hunt"
          subtitle="Catch falling coins"
          reward="Earn up to 200 coins"
          rewardColor={COLORS.green600}
          gradientColors={[COLORS.greenGradientStart, COLORS.greenGradientEnd]}
          borderColor={COLORS.greenBorder}
          onPress={handleCoinHunt}
        />
        <GameCard
          icon="🎫"
          badge="DAILY"
          badgeColor={COLORS.amber500}
          title="Scratch Card"
          subtitle="1 free card daily"
          reward="Win 25-200 coins"
          rewardColor={COLORS.amber600}
          gradientColors={[COLORS.amberGradientStart, COLORS.amberGradientEnd]}
          borderColor={COLORS.amberBorder}
          onPress={handleScratchCard}
        />
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActionsRow}>
        <QuickAction icon="🏅" label="Badges" onPress={handleBadges} />
        <QuickAction icon="🏆" label="Leaderboard" onPress={handleLeaderboard} />
        <QuickAction icon="🎯" label="Missions" onPress={handleMissions} />
        <QuickAction icon="🎮" label="More" onPress={handleMore} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  gameCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  gameCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gameCardGradient: {
    padding: 16,
  },
  gameCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  gameIcon: {
    fontSize: 28,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.white,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
    marginBottom: 4,
  },
  gameSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginBottom: 8,
  },
  gameReward: {
    fontSize: 12,
    fontWeight: '700',
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  quickActionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.navy,
  },
});

export default PlayAndEarnSectionV2;
