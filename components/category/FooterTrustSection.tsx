/**
 * FooterTrustSection Component
 * Trust indicators and coin info footer
 * Adapted from Rez_v-2-main FooterTrust pattern
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { loyaltyData } from '@/data/categoryDummyData';

interface FooterTrustSectionProps {
  coinsEarnable?: number;
  expiringCoins?: number;
  expiryDays?: number;
}

const FooterTrustSection: React.FC<FooterTrustSectionProps> = ({
  coinsEarnable = 500,
  expiringCoins = loyaltyData.coins.expiring,
  expiryDays = loyaltyData.coins.expiryDays,
}) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Trust Badges */}
      <View style={styles.trustBadges}>
        <View style={styles.trustBadge}>
          <Ionicons name="shield-checkmark" size={18} color="#00C06A" />
          <Text style={styles.trustText}>Secure Payments</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="refresh" size={18} color="#3B82F6" />
          <Text style={styles.trustText}>Easy Returns</Text>
        </View>
        <View style={styles.trustBadge}>
          <Ionicons name="headset" size={18} color="#8B5CF6" />
          <Text style={styles.trustText}>24/7 Support</Text>
        </View>
      </View>

      {/* Coins Info */}
      <View style={styles.coinsInfo}>
        <View style={styles.coinsRow}>
          <Text style={styles.coinEmoji}>🪙</Text>
          <Text style={styles.coinsLabel}>
            Earn up to <Text style={styles.coinsHighlight}>{coinsEarnable} coins</Text> on this page
          </Text>
        </View>

        {expiringCoins > 0 && (
          <TouchableOpacity
            style={styles.expiryWarning}
            onPress={() => router.push('/wallet' as any)}
          >
            <Ionicons name="alert-circle" size={14} color="#EF4444" />
            <Text style={styles.expiryText}>
              {expiringCoins} coins expiring in {expiryDays} days - Use them now!
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Badge */}
      <View style={styles.appBadge}>
        <Text style={styles.appName}>Rez</Text>
        <Text style={styles.appTagline}>Shop Smart. Earn More.</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(11, 34, 64, 0.04), 0 8px 24px rgba(11, 34, 64, 0.06)',
      },
    }),
  },
  trustBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trustText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  coinsInfo: {
    width: '100%',
    backgroundColor: '#FEF9E6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  coinsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coinEmoji: {
    fontSize: 16,
  },
  coinsLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  coinsHighlight: {
    fontWeight: '700',
    color: '#D97706',
  },
  expiryWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  expiryText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '500',
  },
  appBadge: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#00C06A',
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
});

export default memo(FooterTrustSection);
