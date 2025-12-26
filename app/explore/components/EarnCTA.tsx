import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const topEarners = [
  { id: 1, name: 'Rahul K.', avatar: 'https://i.pravatar.cc/100?img=12', earned: 12500, rank: 1 },
  { id: 2, name: 'Priya S.', avatar: 'https://i.pravatar.cc/100?img=5', earned: 10200, rank: 2 },
  { id: 3, name: 'Arjun M.', avatar: 'https://i.pravatar.cc/100?img=11', earned: 8900, rank: 3 },
];

const EarnCTA = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      {/* Main CTA Card */}
      <TouchableOpacity
        style={styles.ctaCard}
        onPress={() => navigateTo('/refer')}
      >
        <LinearGradient
          colors={['#00C06A', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaGradient}
        >
          <View style={styles.ctaContent}>
            <View style={styles.ctaLeft}>
              <Text style={styles.ctaTitle}>Earn Like Them!</Text>
              <Text style={styles.ctaSubtitle}>
                Refer friends & earn up to ₹500 per referral
              </Text>
              <View style={styles.ctaButton}>
                <Text style={styles.ctaButtonText}>Start Earning</Text>
                <Ionicons name="arrow-forward" size={16} color="#00C06A" />
              </View>
            </View>

            <View style={styles.earnBadge}>
              <Text style={styles.earnAmount}>₹500</Text>
              <Text style={styles.earnLabel}>per referral</Text>
            </View>
          </View>

          {/* Top Earners */}
          <View style={styles.earnersSection}>
            <Text style={styles.earnersTitle}>Top Earners This Week</Text>
            <View style={styles.earnersRow}>
              {topEarners.map((earner) => (
                <View key={earner.id} style={styles.earnerItem}>
                  <View style={styles.earnerAvatarContainer}>
                    <Image source={{ uri: earner.avatar }} style={styles.earnerAvatar} />
                    <View style={[
                      styles.rankBadge,
                      earner.rank === 1 && styles.rankGold,
                      earner.rank === 2 && styles.rankSilver,
                      earner.rank === 3 && styles.rankBronze,
                    ]}>
                      <Text style={styles.rankText}>{earner.rank}</Text>
                    </View>
                  </View>
                  <Text style={styles.earnerName}>{earner.name}</Text>
                  <Text style={styles.earnerAmount}>₹{earner.earned.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="people" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statValue}>5,234</Text>
          <Text style={styles.statLabel}>Active Earners</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#FEF3C7' }]}>
            <Ionicons name="wallet" size={20} color="#D97706" />
          </View>
          <Text style={styles.statValue}>₹2.4L</Text>
          <Text style={styles.statLabel}>Earned Today</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIcon, { backgroundColor: '#F0FDF4' }]}>
            <Ionicons name="trending-up" size={20} color="#00C06A" />
          </View>
          <Text style={styles.statValue}>₹458</Text>
          <Text style={styles.statLabel}>Avg. Earnings</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  ctaCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaGradient: {
    padding: 20,
  },
  ctaContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  ctaLeft: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 14,
    lineHeight: 18,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#00C06A',
  },
  earnBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  earnAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  earnLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.9)',
  },
  earnersSection: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    padding: 14,
  },
  earnersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  earnersRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  earnerItem: {
    alignItems: 'center',
  },
  earnerAvatarContainer: {
    position: 'relative',
  },
  earnerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankGold: {
    backgroundColor: '#F59E0B',
  },
  rankSilver: {
    backgroundColor: '#9CA3AF',
  },
  rankBronze: {
    backgroundColor: '#B45309',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  earnerName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 6,
  },
  earnerAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0B2240',
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default EarnCTA;
