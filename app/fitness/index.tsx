/**
 * Fitness & Sports Hub Page
 * Converted from V2
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  orange500: '#F97316',
  amber500: '#F59E0B',
};

const categories = [
  { id: 'gyms', title: 'Gyms', icon: '🏋️', color: '#F97316', count: '200+' },
  { id: 'studios', title: 'Fitness Studios', icon: '🧘', color: '#8B5CF6', count: '150+' },
  { id: 'trainers', title: 'Personal Trainers', icon: '💪', color: '#10B981', count: '500+' },
  { id: 'store', title: 'Sports Store', icon: '🛒', color: '#3B82F6', count: '1000+ products' },
  { id: 'challenges', title: 'Challenges', icon: '🏆', color: '#EAB308', count: '50+ active' },
  { id: 'nutrition', title: 'Nutrition', icon: '🥗', color: '#22C55E', count: '100+ plans' },
];

const featuredGyms = [
  { id: 1, name: 'Gold\'s Gym', rating: 4.8, distance: '1.5 km', cashback: '25%', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400' },
  { id: 2, name: 'Cult.fit', rating: 4.7, distance: '0.8 km', cashback: '30%', image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400' },
  { id: 3, name: 'Anytime Fitness', rating: 4.6, distance: '2.0 km', cashback: '20%', image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400' },
];

const FitnessPage: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = (categoryId: string) => {
    router.push(`/fitness/${categoryId}` as any);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F97316', '#EA580C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Fitness & Sports</Text>
            <Text style={styles.headerSubtitle}>Stay fit, earn rewards</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>200+</Text>
            <Text style={styles.statLabel}>Gyms</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>30%</Text>
            <Text style={styles.statLabel}>Max Cashback</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3X</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
                <Text style={styles.categoryCount}>{cat.count}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Gyms</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredGyms.map((gym) => (
              <TouchableOpacity
                key={gym.id}
                style={styles.gymCard}
                onPress={() => router.push(`/store/${gym.id}` as any)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: gym.image }} style={styles.gymImage} />
                <View style={styles.cashbackBadge}>
                  <Text style={styles.cashbackText}>{gym.cashback}</Text>
                </View>
                <View style={styles.gymInfo}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <View style={styles.gymMeta}>
                    <View style={styles.ratingContainer}>
                      <Ionicons name="star" size={14} color={COLORS.amber500} />
                      <Text style={styles.ratingText}>{gym.rating}</Text>
                    </View>
                    <Text style={styles.distanceText}>{gym.distance}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#10B981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>💪</Text>
            <Text style={styles.promoTitle}>New Year Fitness Challenge</Text>
            <Text style={styles.promoSubtitle}>Join now & win up to 10,000 coins</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Join Challenge</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  statsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  statItem: { alignItems: 'center', paddingHorizontal: 20 },
  statValue: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  section: { padding: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 12 },
  viewAllText: { fontSize: 14, fontWeight: '600', color: COLORS.orange500 },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: (SCREEN_WIDTH - 56) / 3, alignItems: 'center', padding: 12, backgroundColor: COLORS.gray50, borderRadius: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  categoryEmoji: { fontSize: 24 },
  categoryTitle: { fontSize: 12, fontWeight: '600', color: COLORS.navy, marginBottom: 2, textAlign: 'center' },
  categoryCount: { fontSize: 10, color: COLORS.gray600 },
  gymCard: { width: 200, marginRight: 12, borderRadius: 16, overflow: 'hidden', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200 },
  gymImage: { width: '100%', height: 120 },
  cashbackBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: COLORS.green500, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  gymInfo: { padding: 12 },
  gymName: { fontSize: 15, fontWeight: '700', color: COLORS.navy, marginBottom: 4 },
  gymMeta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 13, fontWeight: '600', color: COLORS.navy },
  distanceText: { fontSize: 12, color: COLORS.gray600 },
  promoBanner: { marginHorizontal: 16 },
  promoGradient: { padding: 24, borderRadius: 16, alignItems: 'center' },
  promoEmoji: { fontSize: 40, marginBottom: 12 },
  promoTitle: { fontSize: 18, fontWeight: '700', color: COLORS.white, marginBottom: 4 },
  promoSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 16 },
  promoButton: { backgroundColor: COLORS.white, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24 },
  promoButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.green500 },
});

export default FitnessPage;
