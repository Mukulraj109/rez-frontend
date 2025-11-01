// Earning Opportunities Section Component
// Displays various ways to earn rewards (bill upload, referrals, challenges, etc.)

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface EarningOpportunity {
  id: string;
  title: string;
  description: string;
  icon: string;
  coins: string;
  gradient: string[];
  route: string;
  highlight?: boolean;
  badge?: string;
}

const opportunities: EarningOpportunity[] = [
  {
    id: 'bill-upload',
    title: 'Upload Bills',
    description: 'Earn 5% cashback on offline purchases',
    icon: 'document-text',
    coins: '100+',
    gradient: ['#4CAF50', '#2E7D32'],
    route: '/bill-upload',
    highlight: true,
    badge: 'HOT',
  },
  {
    id: 'refer-friends',
    title: 'Refer Friends',
    description: 'Get 100 coins per referral',
    icon: 'people',
    coins: '100',
    gradient: ['#FF6B6B', '#E53E3E'],
    route: '/referral',
    highlight: true,
  },
  {
    id: 'premium',
    title: 'Get Premium',
    description: '2x Cashback + Free Delivery',
    icon: 'diamond',
    coins: '2x',
    gradient: ['#FFD700', '#FFA500'],
    route: '/subscription/plans',
    badge: 'NEW',
  },
  {
    id: 'spin-wheel',
    title: 'Spin Wheel',
    description: 'Daily chance to win coins',
    icon: 'radio-button-on',
    coins: '50-500',
    gradient: ['#9C27B0', '#7B1FA2'],
    route: '/games/spin-wheel',
  },
  {
    id: 'scratch-card',
    title: 'Scratch Card',
    description: 'Win instant rewards',
    icon: 'gift',
    coins: '25-1000',
    gradient: ['#FF9800', '#F57C00'],
    route: '/scratch-card',
  },
];

export default function EarningOpportunities() {
  const router = useRouter();

  const handleOpportunityPress = (opportunity: EarningOpportunity) => {
    router.push(opportunity.route as any);
  };

  const renderOpportunityCard = (opportunity: EarningOpportunity) => {
    const isHighlight = opportunity.highlight;

    return (
      <TouchableOpacity
        key={opportunity.id}
        style={[
          styles.opportunityCard,
          isHighlight && styles.highlightCard,
        ]}
        onPress={() => handleOpportunityPress(opportunity)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={opportunity.gradient as any}
          style={styles.cardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {opportunity.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{opportunity.badge}</Text>
            </View>
          )}

          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={opportunity.icon as any}
                size={isHighlight ? 32 : 28}
                color="white"
              />
            </View>

            <View style={styles.cardInfo}>
              <ThemedText style={styles.cardTitle}>
                {opportunity.title}
              </ThemedText>
              <ThemedText style={styles.cardDescription}>
                {opportunity.description}
              </ThemedText>
            </View>

            <View style={styles.coinsContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.coinsText}>
                {opportunity.coins}
              </ThemedText>
            </View>
          </View>

          <View style={styles.arrowContainer}>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Earning Opportunities</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Multiple ways to earn rewards
        </ThemedText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {opportunities.map(renderOpportunityCard)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  opportunityCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  highlightCard: {
    width: 300,
  },
  cardGradient: {
    padding: 16,
    minHeight: 120,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  coinsText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    marginLeft: 4,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});
