/**
 * ExclusiveOffersSection Component
 * Horizontal scrollable exclusive offer cards
 * Adapted from Rez_v-2-main FashionExclusiveCard
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { exclusiveOffersData, ExclusiveOffer } from '@/data/categoryDummyData';

interface ExclusiveOffersSectionProps {
  categorySlug?: string;
  offers?: ExclusiveOffer[];
  onOfferPress?: (offer: ExclusiveOffer) => void;
}

const CARD_WIDTH = 180;

const OfferCard = memo(({
  offer,
  onPress,
}: {
  offer: ExclusiveOffer;
  onPress: () => void;
}) => (
  <TouchableOpacity
    style={styles.offerCard}
    onPress={onPress}
    activeOpacity={0.9}
    accessibilityLabel={`${offer.title} offer`}
    accessibilityRole="button"
  >
    <LinearGradient
      colors={offer.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradient}
    >
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{offer.icon}</Text>
      </View>

      <Text style={styles.offerTitle}>{offer.title}</Text>
      <Text style={styles.offerDiscount}>{offer.discount}</Text>
      <Text style={styles.offerDescription}>{offer.description}</Text>

      <View style={styles.claimButton}>
        <Text style={styles.claimText}>Claim Now</Text>
      </View>
    </LinearGradient>
  </TouchableOpacity>
));

OfferCard.displayName = 'OfferCard';

const ExclusiveOffersSection: React.FC<ExclusiveOffersSectionProps> = ({
  categorySlug,
  offers = exclusiveOffersData,
  onOfferPress,
}) => {
  const router = useRouter();

  const handlePress = useCallback((offer: ExclusiveOffer) => {
    if (onOfferPress) {
      onOfferPress(offer);
    } else {
      router.push({
        pathname: '/offer/[id]',
        params: { id: offer.id },
      } as any);
    }
  }, [router, onOfferPress]);

  if (!offers || offers.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.crownEmoji}>👑</Text>
          <Text style={styles.sectionTitle}>Exclusive For You</Text>
        </View>
        <TouchableOpacity
          style={styles.seeAllButton}
          onPress={() => router.push('/offers/exclusive' as any)}
          accessibilityLabel="See all exclusive offers"
        >
          <Text style={styles.seeAllText}>All Offers</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
      >
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onPress={() => handlePress(offer)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 20,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  crownEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
  },
  seeAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  offerCard: {
    width: CARD_WIDTH,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 16,
    height: 180,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 22,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  offerDiscount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  offerDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  claimText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default memo(ExclusiveOffersSection);
