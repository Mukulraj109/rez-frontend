/**
 * Events & Experiences Section - Converted from V2
 * Magazine-style grid layout with Movies, Concerts, Workshops, Parks, Gaming
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_GAP = 8;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
};

const EventsExperiencesSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/events' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🎉 Events & Experiences</Text>
          <Text style={styles.headerSubtitle}>Book tickets, save money, earn rewards</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Magazine Grid */}
      <View style={styles.grid}>
        {/* Row 1 */}
        <View style={styles.row1}>
          {/* Movies - Large Card (2 rows height) */}
          <TouchableOpacity
            style={styles.moviesCard}
            onPress={() => handlePress('/events/movies')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#9333EA', '#EC4899', '#7C3AED']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.moviesGradient}
            >
              <View style={styles.moviesTop}>
                <Text style={styles.moviesIcon}>🎬</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>Up to 20% off</Text>
                </View>
              </View>
              <View style={styles.moviesBottom}>
                <Text style={styles.moviesTitle}>Movies</Text>
                <Text style={styles.moviesSubtitle}>Latest blockbusters</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Concerts */}
            <TouchableOpacity
              style={styles.concertsCard}
              onPress={() => handlePress('/events/concerts')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#F97316', '#DC2626']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.concertsGradient}
              >
                <Text style={styles.concertsIcon}>🎤</Text>
                <View>
                  <Text style={styles.concertsTitle}>Concerts</Text>
                  <Text style={styles.concertsSubtitle}>Live music</Text>
                  <Text style={styles.concertsCoins}>2x coins</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Parks */}
            <TouchableOpacity
              style={styles.smallCard}
              onPress={() => handlePress('/events/parks')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.3)', 'rgba(16, 185, 129, 0.2)']}
                style={styles.smallCardGradient}
              >
                <Text style={styles.smallCardIcon}>🎢</Text>
                <Text style={styles.smallCardTitle}>Parks</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2 */}
        <View style={styles.row2}>
          {/* Workshops - Wide Card */}
          <TouchableOpacity
            style={styles.workshopsCard}
            onPress={() => handlePress('/events/workshops')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.2)', 'rgba(99, 102, 241, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.workshopsGradient}
            >
              <View style={styles.workshopsIconBox}>
                <Text style={styles.workshopsIcon}>📚</Text>
              </View>
              <View style={styles.workshopsContent}>
                <Text style={styles.workshopsTitle}>Workshops</Text>
                <Text style={styles.workshopsSubtitle}>Learn & grow</Text>
              </View>
              <Text style={styles.workshopsArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Gaming */}
          <TouchableOpacity
            style={styles.smallCard}
            onPress={() => handlePress('/events/gaming')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['rgba(168, 85, 247, 0.3)', 'rgba(236, 72, 153, 0.2)']}
              style={styles.smallCardGradient}
            >
              <Text style={styles.smallCardIcon}>🎮</Text>
              <Text style={styles.smallCardTitle}>Gaming</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  grid: {
    gap: CARD_GAP,
  },
  row1: {
    flexDirection: 'row',
    height: 200,
    gap: CARD_GAP,
  },
  row2: {
    flexDirection: 'row',
    height: 60,
    gap: CARD_GAP,
  },

  // Movies Card
  moviesCard: {
    flex: 1.2,
    borderRadius: 24,
    overflow: 'hidden',
  },
  moviesGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  moviesTop: {
    gap: 12,
  },
  moviesIcon: {
    fontSize: 40,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  discountText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  moviesBottom: {},
  moviesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  moviesSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },

  // Right Column
  rightColumn: {
    flex: 1,
    gap: CARD_GAP,
  },

  // Concerts Card
  concertsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  concertsGradient: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  concertsIcon: {
    fontSize: 28,
  },
  concertsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 2,
  },
  concertsSubtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  concertsCoins: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },

  // Small Cards (Parks, Gaming)
  smallCard: {
    flex: 0.5,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  smallCardGradient: {
    flex: 1,
    padding: 10,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  smallCardIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  smallCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },

  // Workshops Card
  workshopsCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  workshopsGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 10,
  },
  workshopsIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workshopsIcon: {
    fontSize: 20,
  },
  workshopsContent: {
    flex: 1,
  },
  workshopsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.navy,
  },
  workshopsSubtitle: {
    fontSize: 11,
    color: COLORS.gray600,
  },
  workshopsArrow: {
    fontSize: 18,
    color: '#3B82F6',
  },
});

export default EventsExperiencesSection;
