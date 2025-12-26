import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const steps = [
  {
    id: 1,
    icon: 'storefront',
    title: 'Visit Store',
    subtitle: 'Choose from 1000+ nearby stores',
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

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

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
          {steps.map((step) => (
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
            <Text style={styles.statValue}>1000+</Text>
            <Text style={styles.statLabel}>Partner Stores</Text>
          </View>
          <View style={[styles.statBox, styles.statBoxHighlight]}>
            <Text style={[styles.statValue, styles.statValueHighlight]}>Up to 25%</Text>
            <Text style={[styles.statLabel, styles.statLabelHighlight]}>Cashback</Text>
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
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.footerText}>Join 50,000+ users who are earning while spending</Text>
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
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sparkle: {
    fontSize: 14,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default EarnLikeThem;
