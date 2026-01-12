import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi, { ExploreStatsSummary } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

const steps = [
  {
    id: 1,
    icon: 'storefront',
    title: 'Visit Store',
    subtitle: 'Choose from nearby stores',
    color: '#3B82F6',
    bgColor: '#EBF5FF',
  },
  {
    id: 2,
    icon: 'card',
    title: 'Pay with ReZ',
    subtitle: 'Scan QR or enter amount',
    color: '#A855F7',
    bgColor: '#F3E8FF',
  },
  {
    id: 3,
    icon: 'share-social',
    title: 'Share / Review',
    subtitle: 'Help others discover',
    color: '#EC4899',
    bgColor: '#FCE7F3',
  },
  {
    id: 4,
    icon: 'wallet',
    title: 'Earn More',
    subtitle: 'Get cashback + bonus coins',
    color: '#00C06A',
    bgColor: '#F0FDF4',
  },
];

const EarnLikeThem = () => {
  const router = useRouter();
  const [stats, setStats] = useState<ExploreStatsSummary>({
    partnerStores: 1000,
    maxCashback: 25,
    totalUsers: 50000,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatsSummary();
  }, []);

  const fetchStatsSummary = async () => {
    try {
      const response = await exploreApi.getStatsSummary();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('[EarnLikeThem] Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${Math.floor(num / 1000)}k+`;
    }
    return `${num}+`;
  };

  // Update steps subtitle with dynamic store count
  const dynamicSteps = steps.map((step) => {
    if (step.id === 1) {
      return {
        ...step,
        subtitle: `Choose from ${formatNumber(stats.partnerStores)} nearby stores`,
      };
    }
    return step;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0FDF4', '#ECFDF5', '#D1FAE5']}
        style={styles.card}
      >
        {/* Header */}
        <Text style={styles.title}>Earn Like Them</Text>
        <Text style={styles.subtitle}>Start your rewarding journey in 4 simple steps</Text>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {dynamicSteps.map((step) => (
            <View key={step.id} style={styles.stepRow}>
              <View style={styles.stepNumberContainer}>
                <LinearGradient
                  colors={[step.color, step.color]}
                  style={styles.stepNumber}
                >
                  <Text style={styles.stepNumberText}>{step.id}</Text>
                </LinearGradient>
              </View>
              <View style={[styles.stepIconContainer, { backgroundColor: step.bgColor }]}>
                <Ionicons name={step.icon as any} size={22} color={step.color} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepSubtitle}>{step.subtitle}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0B2240" />
            ) : (
              <>
                <Text style={styles.statValue}>{formatNumber(stats.partnerStores)}</Text>
                <Text style={styles.statLabel}>Partner Stores</Text>
              </>
            )}
          </View>
          <View style={[styles.statBox, styles.statBoxHighlight]}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text style={[styles.statValue, styles.statValueHighlight]}>
                  Up to {stats.maxCashback}%
                </Text>
                <Text style={[styles.statLabel, styles.statLabelHighlight]}>Cashback</Text>
              </>
            )}
          </View>
        </View>

        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigateTo('/explore/map')}
        >
          <Text style={styles.ctaText}>Start Earning Nearby</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Join {formatNumber(stats.totalUsers)} users who are earning while spending
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0B2240',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNumberContainer: {
    position: 'relative',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2240',
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 70,
  },
  statBoxHighlight: {
    backgroundColor: '#00C06A',
    borderColor: '#00C06A',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0B2240',
  },
  statValueHighlight: {
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  statLabelHighlight: {
    color: 'rgba(255,255,255,0.9)',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00C06A',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default EarnLikeThem;
