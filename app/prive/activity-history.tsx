/**
 * Privé Activity History Page
 * Campaign and activity history
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PRIVE_COLORS, PRIVE_SPACING, PRIVE_RADIUS } from '@/components/prive/priveTheme';

const ACTIVITY_DATA = [
  { id: '1', brand: 'Artisan Watch Co', title: 'Product Review', status: 'completed', reward: 500, date: 'Dec 18' },
  { id: '2', brand: 'Luxury Café', title: 'Visit & Share', status: 'active', reward: 300, date: 'Dec 15' },
  { id: '3', brand: 'Premium Spa', title: 'Experience Review', status: 'completed', reward: 750, date: 'Dec 10' },
  { id: '4', brand: 'StyleHub', title: 'Brand Ambassador', status: 'completed', reward: 1000, date: 'Dec 5' },
  { id: '5', brand: 'Tech Store', title: 'Unboxing Video', status: 'pending', reward: 400, date: 'Dec 3' },
];

export default function ActivityHistoryScreen() {
  const router = useRouter();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return PRIVE_COLORS.status.success;
      case 'active':
        return PRIVE_COLORS.status.info;
      case 'pending':
        return PRIVE_COLORS.status.warning;
      default:
        return PRIVE_COLORS.text.tertiary;
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1F2937', '#111827', '#0A0A0A']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={PRIVE_COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Activity History</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Card */}
          <View style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>47</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.9</Text>
              <Text style={styles.statLabel}>Avg Rating</Text>
            </View>
          </View>

          {/* Activity List */}
          <Text style={styles.sectionTitle}>All Activity</Text>
          {ACTIVITY_DATA.map((item) => (
            <TouchableOpacity key={item.id} style={styles.activityCard} activeOpacity={0.8}>
              <View style={styles.activityLeft}>
                <Text style={styles.activityBrand}>{item.brand}</Text>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDate}>{item.date}</Text>
              </View>
              <View style={styles.activityRight}>
                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.rewardText}>+{item.reward}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: PRIVE_SPACING.xl,
    paddingVertical: PRIVE_SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: PRIVE_SPACING.xl,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.xl,
    padding: PRIVE_SPACING.xl,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.goldMuted,
    marginBottom: PRIVE_SPACING.xl,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '300',
    color: PRIVE_COLORS.gold.primary,
  },
  statLabel: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: PRIVE_COLORS.transparent.white10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.text.primary,
    marginBottom: PRIVE_SPACING.lg,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: PRIVE_COLORS.background.card,
    borderRadius: PRIVE_RADIUS.lg,
    padding: PRIVE_SPACING.lg,
    borderWidth: 1,
    borderColor: PRIVE_COLORS.border.primary,
    marginBottom: PRIVE_SPACING.md,
  },
  activityLeft: {
    flex: 1,
  },
  activityBrand: {
    fontSize: 12,
    color: PRIVE_COLORS.gold.primary,
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: PRIVE_COLORS.text.primary,
  },
  activityDate: {
    fontSize: 12,
    color: PRIVE_COLORS.text.tertiary,
    marginTop: 4,
  },
  activityRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: PRIVE_SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: PRIVE_SPACING.md,
    paddingVertical: PRIVE_SPACING.xs,
    borderRadius: PRIVE_RADIUS.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIVE_COLORS.status.success,
  },
});
