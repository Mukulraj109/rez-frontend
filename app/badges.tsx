/**
 * Badges/Achievements Screen - Converted from V2 Web
 * Exact match to Rez_v-2-main/src/pages/earn/Achievements.jsx
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 2;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  green500: '#22C55E',
  amber400: '#FBBF24',
  amber500: '#F59E0B',
  purple500: '#8B5CF6',
  purple600: '#7C3AED',
  pink500: '#EC4899',
  blue500: '#3B82F6',
  cyan500: '#06B6D4',
  teal500: '#14B8A6',
  emerald500: '#10B981',
};

interface Achievement {
  id: number;
  title: string;
  desc: string;
  icon: string;
  unlocked: boolean;
  coins: number;
  category: string;
  progress?: number;
}

const achievements: Achievement[] = [
  { id: 1, title: 'First Purchase', desc: 'Make your first purchase', icon: '🎯', unlocked: true, coins: 100, category: 'Shopping' },
  { id: 2, title: 'Week Streak', desc: 'Login 7 days in a row', icon: '🔥', unlocked: true, coins: 500, category: 'Engagement' },
  { id: 3, title: 'Social Butterfly', desc: 'Refer 10 friends', icon: '🦋', unlocked: false, coins: 300, progress: 60, category: 'Social' },
  { id: 4, title: 'Deal Hunter', desc: 'Redeem 20 offers', icon: '🎪', unlocked: false, coins: 400, progress: 25, category: 'Shopping' },
  { id: 5, title: 'Review Master', desc: 'Write 15 reviews', icon: '⭐', unlocked: false, coins: 250, progress: 40, category: 'Social' },
  { id: 6, title: 'Big Spender', desc: 'Spend ₹10,000', icon: '💰', unlocked: false, coins: 1000, progress: 75, category: 'Shopping' },
  { id: 7, title: 'Early Bird', desc: 'Check-in before 8 AM', icon: '🌅', unlocked: true, coins: 150, category: 'Engagement' },
  { id: 8, title: 'Night Owl', desc: 'Shop after 10 PM', icon: '🦉', unlocked: false, coins: 150, progress: 0, category: 'Engagement' },
  { id: 9, title: 'Game Master', desc: 'Play 50 games', icon: '🎮', unlocked: false, coins: 500, progress: 30, category: 'Gaming' },
  { id: 10, title: 'Cashback King', desc: 'Earn ₹5,000 cashback', icon: '👑', unlocked: false, coins: 2000, progress: 45, category: 'Shopping' },
  { id: 11, title: 'Explorer', desc: 'Visit 30 stores', icon: '🗺️', unlocked: false, coins: 350, progress: 50, category: 'Shopping' },
  { id: 12, title: 'Loyal Member', desc: '30 days streak', icon: '💎', unlocked: false, coins: 1500, progress: 20, category: 'Engagement' },
];

const categories = ['All', 'Shopping', 'Social', 'Engagement', 'Gaming'];

const BadgesScreen: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAchievements = activeCategory === 'All'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalCoins = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.coins, 0);
  const completionPercent = Math.round((totalUnlocked / achievements.length) * 100);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.navy} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🏅 Achievements</Text>
          <Text style={styles.headerSubtitle}>Unlock badges & earn coins</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{totalUnlocked}/{achievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(245, 158, 11, 0.2)', 'rgba(234, 179, 8, 0.2)']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: COLORS.amber400 }]}>{totalCoins}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: COLORS.green500 }]}>{completionPercent}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.categoryButtonActive
              ]}
              onPress={() => setActiveCategory(cat)}
            >
              <Text style={[
                styles.categoryText,
                activeCategory === cat && styles.categoryTextActive
              ]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements Grid */}
        <View style={styles.achievementsGrid}>
          {filteredAchievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementCardUnlocked
              ]}
            >
              {!achievement.unlocked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={14} color={COLORS.gray400} />
                </View>
              )}

              <View style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                {achievement.unlocked && <Text style={styles.checkIcon}>✅</Text>}
              </View>

              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              <Text style={styles.achievementCoins}>+{achievement.coins} coins</Text>

              {!achievement.unlocked && achievement.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <LinearGradient
                      colors={[COLORS.emerald500, COLORS.teal500]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${achievement.progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{achievement.progress}% complete</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* CTAs Section */}
        <View style={styles.ctasSection}>
          <Text style={styles.ctasTitle}>Quick Actions to Unlock More</Text>

          {/* Shopping CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/mall')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.2)', 'rgba(236, 72, 153, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
                <Ionicons name="bag-handle" size={20} color={COLORS.purple600} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Shop & Unlock Deals</Text>
                <Text style={styles.ctaSubtitle}>Complete shopping achievements</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.purple600} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Referral CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/refer')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(6, 182, 212, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Ionicons name="people" size={20} color={COLORS.blue500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Refer Friends</Text>
                <Text style={styles.ctaSubtitle}>Unlock social achievements & earn</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.blue500} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Games CTA */}
          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/games')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(34, 197, 94, 0.2)', 'rgba(16, 185, 129, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.2)' }]}>
                <Ionicons name="game-controller" size={20} color={COLORS.green500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Play Games</Text>
                <Text style={styles.ctaSubtitle}>Complete gaming challenges</Text>
              </View>
              <Ionicons name="trending-up" size={20} color={COLORS.green500} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Daily Check-in CTA */}
          <View style={styles.ctaCard}>
            <LinearGradient
              colors={['rgba(245, 158, 11, 0.2)', 'rgba(234, 179, 8, 0.2)']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconBox, { backgroundColor: 'rgba(245, 158, 11, 0.2)' }]}>
                <Ionicons name="ribbon" size={20} color={COLORS.amber500} />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaTitle}>Daily Check-in</Text>
                <Text style={styles.ctaSubtitle}>Build streaks & unlock rewards</Text>
              </View>
              <TouchableOpacity activeOpacity={0.8}>
                <LinearGradient
                  colors={[COLORS.amber500, '#EAB308']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.checkInButton}
                >
                  <Text style={styles.checkInText}>Check In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.gray500,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.green500,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.gray600,
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  achievementCard: {
    width: CARD_WIDTH,
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.gray100,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    position: 'relative',
  },
  achievementCardUnlocked: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  lockIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementIcon: {
    fontSize: 36,
  },
  checkIcon: {
    fontSize: 18,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 11,
    color: COLORS.gray500,
    marginBottom: 8,
  },
  achievementCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.amber400,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.gray200,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: COLORS.gray500,
    marginTop: 4,
  },
  ctasSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  ctasTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 16,
  },
  ctaCard: {
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  ctaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  ctaSubtitle: {
    fontSize: 12,
    color: COLORS.gray500,
  },
  checkInButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  checkInText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default BadgesScreen;
