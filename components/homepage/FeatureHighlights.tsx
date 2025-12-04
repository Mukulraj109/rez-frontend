// Feature Highlights Component
// Displays prominent feature cards with gradients

import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface FeatureHighlight {
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  route: string;
  cta: string;
  badge?: string;
}

const featureHighlights: FeatureHighlight[] = [
  {
    title: 'Get Premium',
    description: '2x Cashback + Free Delivery',
    icon: 'diamond',
    gradient: ['#FFC857', '#FFB020'],
    route: '/subscription/plans',
    cta: 'Upgrade Now',
    badge: 'POPULAR',
  },
  {
    title: 'Upload Bills',
    description: 'Earn 5% on offline shopping',
    icon: 'document-text',
    gradient: ['#00C06A', '#00A16B'],
    route: '/bill-upload',
    cta: 'Upload Now',
    badge: 'NEW',
  },
  {
    title: 'Refer Friends',
    description: 'Get 100 coins per referral',
    icon: 'people',
    gradient: ['#00796B', '#005B52'],
    route: '/referral',
    cta: 'Share Now',
    badge: 'HOT',
  },
];

export default function FeatureHighlights() {
  const router = useRouter();

  const handleFeaturePress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Featured</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Exclusive rewards & benefits
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16}
        decelerationRate="fast"
      >
        {featureHighlights.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { width: CARD_WIDTH }]}
            onPress={() => handleFeaturePress(feature.route)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={feature.gradient}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {feature.badge && (
                <View style={styles.badge}>
                  <ThemedText style={styles.badgeText}>{feature.badge}</ThemedText>
                </View>
              )}

              <View style={styles.cardContent}>
                <View style={styles.iconContainer}>
                  <Ionicons name={feature.icon as any} size={40} color="white" />
                </View>

                <View style={styles.textContainer}>
                  <ThemedText style={styles.title}>{feature.title}</ThemedText>
                  <ThemedText style={styles.description}>
                    {feature.description}
                  </ThemedText>
                </View>

                <View style={styles.ctaContainer}>
                  <ThemedText style={styles.ctaText}>{feature.cta}</ThemedText>
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Poppins-Bold',
    color: '#00796B',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#0B2240',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  card: {
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.1)',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardGradient: {
    padding: 20,
    minHeight: 160,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(11, 34, 64, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  cardContent: {
    flex: 1,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  textContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 22,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
});
