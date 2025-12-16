/**
 * HowItWorksPreview Component
 *
 * Simple 4-step preview of how Cash Store works with Learn More link
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface HowItWorksPreviewProps {
  onLearnMore: () => void;
}

const STEPS = [
  {
    id: 1,
    icon: 'search',
    title: 'Browse',
    description: 'Find your favorite brand',
    color: '#3B82F6',
  },
  {
    id: 2,
    icon: 'cart',
    title: 'Shop',
    description: 'Click through to shop',
    color: '#8B5CF6',
  },
  {
    id: 3,
    icon: 'bag-check',
    title: 'Purchase',
    description: 'Complete your order',
    color: '#F59E0B',
  },
  {
    id: 4,
    icon: 'wallet',
    title: 'Earn',
    description: 'Get cashback credited',
    color: '#00C06A',
  },
];

const HowItWorksPreview: React.FC<HowItWorksPreviewProps> = ({ onLearnMore }) => {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F0FDF4', '#ECFDF5', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name="help-circle" size={20} color="#00C06A" />
            <Text style={styles.title}>How It Works</Text>
          </View>
          <TouchableOpacity onPress={onLearnMore} style={styles.learnMoreButton}>
            <Text style={styles.learnMoreText}>Learn More</Text>
            <Ionicons name="chevron-forward" size={14} color="#00C06A" />
          </TouchableOpacity>
        </View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepItem}>
              {/* Step Icon */}
              <View style={[styles.stepIconContainer, { backgroundColor: `${step.color}15` }]}>
                <Ionicons name={step.icon as any} size={20} color={step.color} />
              </View>

              {/* Step Number */}
              <View style={[styles.stepNumber, { backgroundColor: step.color }]}>
                <Text style={styles.stepNumberText}>{step.id}</Text>
              </View>

              {/* Step Content */}
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepDescription}>{step.description}</Text>

              {/* Connector Line */}
              {index < STEPS.length - 1 && <View style={styles.connector} />}
            </View>
          ))}
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={onLearnMore}>
          <Text style={styles.ctaText}>See Detailed Guide</Text>
          <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  learnMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    position: 'absolute',
    top: 32,
    right: '30%',
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  stepNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 14,
  },
  connector: {
    position: 'absolute',
    top: 22,
    right: -15,
    width: 30,
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00C06A',
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(HowItWorksPreview);
