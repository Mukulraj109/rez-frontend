// Scheduled Coin Drops Page
// View upcoming coin rewards calendar

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface ScheduledDrop {
  id: string;
  title: string;
  amount: number;
  type: 'daily' | 'weekly' | 'special' | 'cashback';
  scheduledDate: string;
  description: string;
  icon: string;
  notifyEnabled: boolean;
}

const SCHEDULED_DROPS: ScheduledDrop[] = [
  { id: '1', title: 'Daily Login Bonus', amount: 5, type: 'daily', scheduledDate: '2024-12-21', description: 'Log in tomorrow', icon: 'calendar-outline', notifyEnabled: true },
  { id: '2', title: 'Weekly Streak Bonus', amount: 50, type: 'weekly', scheduledDate: '2024-12-22', description: '7-day login streak', icon: 'flame-outline', notifyEnabled: true },
  { id: '3', title: 'Bill Upload Cashback', amount: 120, type: 'cashback', scheduledDate: '2024-12-23', description: 'From Cafe Coffee Day', icon: 'receipt-outline', notifyEnabled: false },
  { id: '4', title: 'Christmas Bonus', amount: 200, type: 'special', scheduledDate: '2024-12-25', description: 'Holiday special reward', icon: 'gift-outline', notifyEnabled: true },
  { id: '5', title: 'Referral Bonus', amount: 100, type: 'special', scheduledDate: '2024-12-28', description: 'Friend joined ReZ', icon: 'people-outline', notifyEnabled: true },
  { id: '6', title: 'New Year Bonus', amount: 500, type: 'special', scheduledDate: '2025-01-01', description: 'Welcome 2025!', icon: 'sparkles', notifyEnabled: true },
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduledDropsPage() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [drops, setDrops] = useState(SCHEDULED_DROPS);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleNotify = (dropId: string) => {
    setDrops(drops.map(drop =>
      drop.id === dropId ? { ...drop, notifyEnabled: !drop.notifyEnabled } : drop
    ));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return Colors.primary[600];
      case 'weekly': return Colors.gold;
      case 'special': return Colors.error;
      case 'cashback': return Colors.secondary[600];
      default: return Colors.gray[500];
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'special': return 'Special';
      case 'cashback': return 'Cashback';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getDaysUntil = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff} days`;
  };

  // Generate calendar view for next 7 days
  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dropsOnDay = drops.filter(d => d.scheduledDate === dateString);
      days.push({
        date: dateString,
        dayName: WEEKDAYS[date.getDay()],
        dayNumber: date.getDate(),
        isToday: i === 0,
        drops: dropsOnDay,
        totalAmount: dropsOnDay.reduce((sum, d) => sum + d.amount, 0),
      });
    }
    return days;
  };

  const calendarDays = generateCalendarDays();
  const totalUpcoming = drops.reduce((sum, d) => sum + d.amount, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Scheduled Drops</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Total Upcoming */}
        <View style={styles.totalCard}>
          <ThemedText style={styles.totalLabel}>Total Upcoming</ThemedText>
          <ThemedText style={styles.totalAmount}>{totalUpcoming} RC</ThemedText>
          <ThemedText style={styles.totalSubtext}>in the next 30 days</ThemedText>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Calendar View */}
        <View style={styles.calendarSection}>
          <ThemedText style={styles.sectionTitle}>Next 7 Days</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarContent}
          >
            {calendarDays.map(day => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.calendarDay,
                  day.isToday && styles.calendarDayToday,
                  selectedDate === day.date && styles.calendarDaySelected,
                ]}
                onPress={() => setSelectedDate(day.date === selectedDate ? null : day.date)}
              >
                <ThemedText style={[
                  styles.dayName,
                  day.isToday && styles.dayTextToday,
                ]}>
                  {day.dayName}
                </ThemedText>
                <ThemedText style={[
                  styles.dayNumber,
                  day.isToday && styles.dayTextToday,
                ]}>
                  {day.dayNumber}
                </ThemedText>
                {day.totalAmount > 0 && (
                  <View style={styles.dropIndicator}>
                    <ThemedText style={styles.dropIndicatorText}>
                      +{day.totalAmount}
                    </ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Drops List */}
        <View style={styles.dropsSection}>
          <ThemedText style={styles.sectionTitle}>Upcoming Drops</ThemedText>
          {drops.map(drop => (
            <View key={drop.id} style={styles.dropCard}>
              <View style={[styles.dropIcon, { backgroundColor: getTypeColor(drop.type) + '20' }]}>
                <Ionicons
                  name={drop.icon as any}
                  size={24}
                  color={getTypeColor(drop.type)}
                />
              </View>
              <View style={styles.dropInfo}>
                <View style={styles.dropHeader}>
                  <ThemedText style={styles.dropTitle}>{drop.title}</ThemedText>
                  <View style={[styles.typeBadge, { backgroundColor: getTypeColor(drop.type) + '20' }]}>
                    <ThemedText style={[styles.typeText, { color: getTypeColor(drop.type) }]}>
                      {getTypeLabel(drop.type)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.dropDescription}>{drop.description}</ThemedText>
                <View style={styles.dropMeta}>
                  <ThemedText style={styles.dropDate}>
                    {formatDate(drop.scheduledDate)} · {getDaysUntil(drop.scheduledDate)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.dropRight}>
                <ThemedText style={styles.dropAmount}>+{drop.amount}</ThemedText>
                <ThemedText style={styles.dropCurrency}>RC</ThemedText>
                <TouchableOpacity
                  style={styles.notifyButton}
                  onPress={() => toggleNotify(drop.id)}
                >
                  <Ionicons
                    name={drop.notifyEnabled ? 'notifications' : 'notifications-outline'}
                    size={18}
                    color={drop.notifyEnabled ? Colors.primary[600] : Colors.text.tertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={Colors.info} />
          <View style={styles.infoContent}>
            <ThemedText style={styles.infoTitle}>How Coin Drops Work</ThemedText>
            <ThemedText style={styles.infoText}>
              Scheduled drops are automatically credited to your wallet on the scheduled date.
              Enable notifications to never miss a drop!
            </ThemedText>
          </View>
        </View>
      </ScrollView>
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
  totalCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  totalLabel: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.xs,
  },
  totalAmount: {
    ...Typography.priceLarge,
    color: '#FFF',
  },
  totalSubtext: {
    ...Typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  calendarSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  calendarContent: {
    gap: Spacing.sm,
  },
  calendarDay: {
    width: 64,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  calendarDayToday: {
    backgroundColor: Colors.primary[600],
  },
  calendarDaySelected: {
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  dayName: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  dayNumber: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  dayTextToday: {
    color: '#FFF',
  },
  dropIndicator: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  dropIndicatorText: {
    ...Typography.caption,
    color: Colors.midnightNavy,
    fontWeight: '700',
  },
  dropsSection: {
    marginBottom: Spacing.lg,
  },
  dropCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  dropIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropInfo: {
    flex: 1,
  },
  dropHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  dropTitle: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  typeBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  dropDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  dropMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropDate: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  dropRight: {
    alignItems: 'center',
  },
  dropAmount: {
    ...Typography.h3,
    color: Colors.success,
  },
  dropCurrency: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  notifyButton: {
    padding: Spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.label,
    color: Colors.info,
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
});
