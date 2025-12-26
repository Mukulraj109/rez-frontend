import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const Achievements = () => {
  const router = useRouter();

  const achievements = [
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
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredAchievements = activeCategory === 'All'
    ? achievements
    : achievements.filter(a => a.category === activeCategory);

  const totalUnlocked = achievements.filter(a => a.unlocked).length;
  const totalCoins = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.coins, 0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>🏅 Achievements</Text>
          <Text style={styles.headerSubtitle}>Unlock badges & earn coins</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsContainer}>
          <LinearGradient
            colors={['#A855F720', '#EC489920']}
            style={styles.statCard}
          >
            <Text style={styles.statValue}>{totalUnlocked}/{achievements.length}</Text>
            <Text style={styles.statLabel}>Unlocked</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#F59E0B20', '#EAB30820']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: '#F59E0B' }]}>{totalCoins}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </LinearGradient>
          <LinearGradient
            colors={['#22C55E20', '#10B98120']}
            style={styles.statCard}
          >
            <Text style={[styles.statValue, { color: '#22C55E' }]}>{Math.round((totalUnlocked/achievements.length)*100)}%</Text>
            <Text style={styles.statLabel}>Complete</Text>
          </LinearGradient>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map(cat => (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              style={[
                styles.categoryButton,
                activeCategory === cat && styles.categoryButtonActive
              ]}
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

        {/* Achievements List */}
        <View style={styles.achievementsGrid}>
          {filteredAchievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementCard,
                achievement.unlocked && styles.achievementUnlocked
              ]}
            >
              {!achievement.unlocked && (
                <View style={styles.lockIcon}>
                  <Ionicons name="lock-closed" size={16} color="#6B7280" />
                </View>
              )}

              <View style={styles.achievementHeader}>
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                {achievement.unlocked && <Text style={styles.checkmark}>✅</Text>}
              </View>

              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.desc}</Text>
              <Text style={styles.achievementCoins}>+{achievement.coins} coins</Text>

              {!achievement.unlocked && achievement.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${achievement.progress}%` }]} />
                  </View>
                  <Text style={styles.progressText}>{achievement.progress}% complete</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* CTAs Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Quick Actions to Unlock More</Text>

          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/mall' as any)}
          >
            <LinearGradient
              colors={['#A855F720', '#EC489920']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconContainer, { backgroundColor: '#A855F730' }]}>
                <Ionicons name="bag" size={20} color="#A855F7" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaCardTitle}>Shop & Unlock Deals</Text>
                <Text style={styles.ctaCardDesc}>Complete shopping achievements</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#A855F7" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/refer' as any)}
          >
            <LinearGradient
              colors={['#3B82F620', '#06B6D420']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconContainer, { backgroundColor: '#3B82F630' }]}>
                <Ionicons name="people" size={20} color="#3B82F6" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaCardTitle}>Refer Friends</Text>
                <Text style={styles.ctaCardDesc}>Unlock social achievements & earn</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#3B82F6" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.ctaCard}
            onPress={() => router.push('/games' as any)}
          >
            <LinearGradient
              colors={['#22C55E20', '#10B98120']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconContainer, { backgroundColor: '#22C55E30' }]}>
                <Ionicons name="game-controller" size={20} color="#22C55E" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaCardTitle}>Play Games</Text>
                <Text style={styles.ctaCardDesc}>Complete gaming challenges</Text>
              </View>
              <Ionicons name="trending-up" size={20} color="#22C55E" />
            </LinearGradient>
          </TouchableOpacity>

          <View style={styles.checkinCard}>
            <LinearGradient
              colors={['#F59E0B20', '#EAB30820']}
              style={styles.ctaGradient}
            >
              <View style={[styles.ctaIconContainer, { backgroundColor: '#F59E0B30' }]}>
                <Ionicons name="ribbon" size={20} color="#F59E0B" />
              </View>
              <View style={styles.ctaContent}>
                <Text style={styles.ctaCardTitle}>Daily Check-in</Text>
                <Text style={styles.ctaCardDesc}>Build streaks & unlock rewards</Text>
              </View>
              <TouchableOpacity style={styles.checkinButton}>
                <LinearGradient
                  colors={['#F59E0B', '#EAB308']}
                  style={styles.checkinButtonGradient}
                >
                  <Text style={styles.checkinButtonText}>Check In</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  categoryScroll: {
    paddingHorizontal: 16,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  categoryButtonActive: {
    backgroundColor: '#00C06A',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  achievementCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  achievementUnlocked: {
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderColor: 'rgba(245,158,11,0.3)',
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
  checkmark: {
    fontSize: 18,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  achievementDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  achievementCoins: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
  ctaSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ctaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
  },
  ctaCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 2,
  },
  ctaCardDesc: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  checkinCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkinButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  checkinButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  checkinButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

export default Achievements;
