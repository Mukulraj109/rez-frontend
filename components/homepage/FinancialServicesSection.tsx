/**
 * Financial Services Section - Converted from V2
 * Pay Bills, OTT Plans, Recharge, Gold, Insurance, Offers
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
const CARD_GAP = 10;

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray600: '#6B7280',
  green500: '#22C55E',
};

const FinancialServicesSection: React.FC = () => {
  const router = useRouter();

  const handleViewAll = () => {
    router.push('/financial' as any);
  };

  const handlePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>💳 Financial Services</Text>
          <Text style={styles.headerSubtitle}>Pay bills, recharge & more</Text>
        </View>
        <TouchableOpacity onPress={handleViewAll}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Cards Row */}
      <View style={styles.mainRow}>
        {/* Pay Bills Card */}
        <TouchableOpacity
          style={styles.billsCard}
          onPress={() => handlePress('/financial/bills')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#1E3A8A', '#1E40AF', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.billsGradient}
          >
            <View style={styles.billsIconBox}>
              <Text style={styles.billsIcon}>💳</Text>
            </View>
            <Text style={styles.billsTitle}>Pay Bills</Text>
            <Text style={styles.billsSubtitle}>Electricity • Water • Gas</Text>
            <View style={styles.billsBadges}>
              <View style={styles.cashbackBadge}>
                <Text style={styles.cashbackText}>3% Cashback</Text>
              </View>
              <Text style={styles.secureText}>SECURE</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* OTT Plans Card */}
        <TouchableOpacity
          style={styles.ottCard}
          onPress={() => handlePress('/financial/ott')}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={['#7C3AED', '#8B5CF6', '#A78BFA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ottGradient}
          >
            <View style={styles.ottIconBox}>
              <Text style={styles.ottIcon}>📺</Text>
            </View>
            <Text style={styles.ottTitle}>OTT Plans</Text>
            <Text style={styles.ottSubtitle}>Netflix • Prime • Disney+</Text>
            <View style={styles.specialBadge}>
              <Text style={styles.specialText}>Special Prices</Text>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Bottom Row - Quick Actions */}
      <View style={styles.bottomRow}>
        {/* Recharge */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/financial/recharge')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Text style={styles.bottomIcon}>📱</Text>
          </View>
          <Text style={styles.bottomTitle}>Recharge</Text>
        </TouchableOpacity>

        {/* Gold */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/financial/gold')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🪙</Text>
          </View>
          <Text style={styles.bottomTitle}>Gold</Text>
        </TouchableOpacity>

        {/* Insurance */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/financial/insurance')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🛡️</Text>
          </View>
          <Text style={styles.bottomTitle}>Insurance</Text>
        </TouchableOpacity>

        {/* Offers */}
        <TouchableOpacity
          style={styles.bottomCard}
          onPress={() => handlePress('/financial/offers')}
          activeOpacity={0.9}
        >
          <View style={[styles.bottomIconBox, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Text style={styles.bottomIcon}>🎁</Text>
          </View>
          <Text style={styles.bottomTitle}>Offers</Text>
        </TouchableOpacity>
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

  // Main Row
  mainRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: CARD_GAP,
  },

  // Bills Card
  billsCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  billsGradient: {
    padding: 16,
    minHeight: 170,
  },
  billsIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  billsIcon: {
    fontSize: 28,
  },
  billsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  billsSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  billsBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cashbackBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  secureText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
  },

  // OTT Card
  ottCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  ottGradient: {
    padding: 16,
    minHeight: 170,
  },
  ottIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ottIcon: {
    fontSize: 28,
  },
  ottTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  ottSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
  },
  specialBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  specialText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    alignItems: 'center',
  },
  bottomIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  bottomIcon: {
    fontSize: 20,
  },
  bottomTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.navy,
  },
});

export default FinancialServicesSection;
