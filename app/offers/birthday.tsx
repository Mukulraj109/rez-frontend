// Birthday Rewards Page
// Special birthday month offers

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface BirthdayReward {
  id: string;
  title: string;
  store: string;
  type: 'free' | 'discount' | 'cashback';
  value: string;
  description: string;
  image: string;
  claimed: boolean;
}

const MOCK_REWARDS: BirthdayReward[] = [
  { id: '1', title: 'Free Birthday Cake', store: 'Theobroma', type: 'free', value: 'FREE', description: 'Get a free slice of cake', image: '🎂', claimed: false },
  { id: '2', title: 'Birthday Discount', store: 'Myntra', type: 'discount', value: '25%', description: '25% off on your birthday', image: '🎁', claimed: false },
  { id: '3', title: 'Extra Cashback', store: 'Amazon', type: 'cashback', value: '10%', description: 'Birthday special cashback', image: '🎈', claimed: false },
  { id: '4', title: 'Free Coffee', store: 'Starbucks', type: 'free', value: 'FREE', description: 'Any drink on your birthday', image: '☕', claimed: true },
  { id: '5', title: 'Movie Ticket 50% Off', store: 'PVR', type: 'discount', value: '50%', description: 'Birthday movie treat', image: '🎬', claimed: false },
  { id: '6', title: 'Spa Discount', store: 'O2 Spa', type: 'discount', value: '30%', description: 'Pamper yourself', image: '💆', claimed: false },
];

export default function BirthdayRewardsPage() {
  const router = useRouter();
  const [birthdaySet, setBirthdaySet] = useState(true); // Mock: birthday is set
  const [birthday, setBirthday] = useState('December 25');

  const renderReward = ({ item }: { item: BirthdayReward }) => (
    <TouchableOpacity
      style={[styles.rewardCard, item.claimed && styles.rewardCardClaimed]}
      onPress={() => router.push(`/offers/${item.id}` as any)}
      disabled={item.claimed}
    >
      {item.claimed && (
        <View style={styles.claimedOverlay}>
          <Ionicons name="checkmark-circle" size={40} color={Colors.success} />
          <ThemedText style={styles.claimedText}>Claimed</ThemedText>
        </View>
      )}
      <View style={styles.rewardImage}>
        <ThemedText style={styles.rewardEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.rewardInfo}>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <ThemedText style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.value} {item.type === 'free' ? '' : 'OFF'}
          </ThemedText>
        </View>
        <ThemedText style={styles.rewardTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.rewardStore}>{item.store}</ThemedText>
        <ThemedText style={styles.rewardDescription}>{item.description}</ThemedText>
      </View>
      {!item.claimed && (
        <TouchableOpacity style={styles.claimButton}>
          <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free': return Colors.success;
      case 'discount': return Colors.primary[600];
      case 'cashback': return Colors.gold;
      default: return Colors.gray[500];
    }
  };

  if (!birthdaySet) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#EC4899" />
        <LinearGradient colors={['#EC4899', '#F472B6']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Birthday Rewards</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.setupContent}>
          <View style={styles.birthdayIcon}>
            <ThemedText style={styles.birthdayEmoji}>🎂</ThemedText>
          </View>
          <ThemedText style={styles.setupTitle}>When's Your Birthday?</ThemedText>
          <ThemedText style={styles.setupSubtitle}>
            Add your birthday to unlock special rewards and offers
          </ThemedText>

          <View style={styles.dateInputContainer}>
            <TouchableOpacity style={styles.dateInput}>
              <Ionicons name="calendar" size={24} color={Colors.primary[600]} />
              <ThemedText style={styles.dateInputText}>Select your birthday</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => setBirthdaySet(true)}
          >
            <ThemedText style={styles.saveButtonText}>Save Birthday</ThemedText>
          </TouchableOpacity>

          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed" size={16} color={Colors.text.tertiary} />
            <ThemedText style={styles.privacyText}>
              Your birthday is private and only used to send you special rewards
            </ThemedText>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#EC4899" />

      <LinearGradient
        colors={['#EC4899', '#F472B6']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Birthday Rewards</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <View style={styles.cakeContainer}>
            <ThemedText style={styles.cakeEmoji}>🎂</ThemedText>
          </View>
          <ThemedText style={styles.heroTitle}>Happy Birthday!</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Your birthday is on {birthday}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_REWARDS.length}</ThemedText>
            <ThemedText style={styles.statLabel}>Rewards Available</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{MOCK_REWARDS.filter(r => r.claimed).length}</ThemedText>
            <ThemedText style={styles.statLabel}>Claimed</ThemedText>
          </View>
        </View>
      </LinearGradient>

      <FlatList
        data={MOCK_REWARDS}
        renderItem={renderReward}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.infoCard}>
            <Ionicons name="gift" size={20} color="#EC4899" />
            <ThemedText style={styles.infoText}>
              Claim your birthday rewards within 7 days of your birthday!
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  cakeContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cakeEmoji: {
    fontSize: 40,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFF',
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Typography.h2,
    color: '#FFF',
  },
  statLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  setupContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  birthdayIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EC4899' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  birthdayEmoji: {
    fontSize: 60,
  },
  setupTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  setupSubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  dateInputContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  dateInputText: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  saveButton: {
    width: '100%',
    backgroundColor: '#EC4899',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.base,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  saveButtonText: {
    ...Typography.button,
    color: '#FFF',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  privacyText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    flex: 1,
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EC4899' + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    flex: 1,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  rewardCardClaimed: {
    opacity: 0.6,
  },
  claimedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    zIndex: 1,
  },
  claimedText: {
    ...Typography.label,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  rewardImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  rewardEmoji: {
    fontSize: 30,
  },
  rewardInfo: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.xs,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  rewardTitle: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  rewardStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  rewardDescription: {
    ...Typography.caption,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  claimButton: {
    backgroundColor: '#EC4899',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  claimButtonText: {
    ...Typography.label,
    color: '#FFF',
  },
});
