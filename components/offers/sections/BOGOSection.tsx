/**
 * BOGOSection Component
 *
 * Buy 1 Get 1 offers
 * ReZ brand styling
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useOffersTheme } from '@/contexts/OffersThemeContext';
import { SectionHeader, HorizontalScrollSection } from '../common';
import { BOGOOffer } from '@/types/offers.types';
import { Spacing, BorderRadius, Shadows, Colors } from '@/constants/DesignSystem';

interface BOGOSectionProps {
  offers: BOGOOffer[];
  onViewAll?: () => void;
}

export const BOGOSection: React.FC<BOGOSectionProps> = ({
  offers,
  onViewAll,
}) => {
  const router = useRouter();
  const { theme, isDark } = useOffersTheme();

  if (offers.length === 0) return null;

  const handleOfferPress = (offer: BOGOOffer) => {
    router.push(`/offers/${offer.id}`);
  };

  const getBogoLabel = (type: string) => {
    switch (type) {
      case 'buy1get1':
        return 'BUY 1 GET 1';
      case 'buy2get1':
        return 'BUY 2 GET 1';
      case 'buy1get50':
        return 'BUY 1 GET 50%';
      default:
        return 'BOGO';
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: Spacing.lg,
    },
    card: {
      width: 170,
      backgroundColor: isDark ? theme.colors.background.card : '#FFFFFF',
      borderRadius: BorderRadius.lg,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 192, 106, 0.3)' : Colors.primary[200],
      overflow: 'hidden',
      ...(isDark ? {} : Shadows.medium),
    },
    bogoBanner: {
      backgroundColor: Colors.primary[600],
      paddingVertical: 6,
      alignItems: 'center',
    },
    bogoText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: 0.5,
    },
    imageContainer: {
      height: 90,
      position: 'relative',
      backgroundColor: '#F7FAFC',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    storeLogoContainer: {
      position: 'absolute',
      bottom: -12,
      left: 10,
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: '#FFFFFF',
      borderWidth: 2,
      borderColor: '#FFFFFF',
      overflow: 'hidden',
      ...Shadows.subtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    storeLogo: {
      width: 22,
      height: 22,
    },
    storeLogoPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: Colors.primary[600],
      alignItems: 'center',
      justifyContent: 'center',
    },
    storeLogoText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    content: {
      padding: Spacing.sm,
      paddingTop: Spacing.md,
    },
    storeName: {
      fontSize: 9,
      fontWeight: '600',
      color: theme.colors.text.tertiary,
      marginBottom: 2,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    title: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.primary,
      marginBottom: 2,
      letterSpacing: -0.2,
    },
    subtitle: {
      fontSize: 10,
      fontWeight: '500',
      color: theme.colors.text.secondary,
      marginBottom: Spacing.xs,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priceText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.text.primary,
    },
    cashbackBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(0, 192, 106, 0.1)' : '#E6F9F0',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 4,
    },
    cashbackText: {
      fontSize: 9,
      fontWeight: '700',
      color: Colors.primary[600],
      marginLeft: 2,
    },
  });

  return (
    <View style={styles.container}>
      <SectionHeader
        title="Buy 1 Get 1"
        subtitle="Double the joy"
        icon="gift"
        iconColor={Colors.primary[600]}
        showViewAll={offers.length > 3}
        onViewAll={onViewAll}
      />
      <HorizontalScrollSection>
        {offers.map((offer) => (
          <TouchableOpacity
            key={offer.id}
            style={styles.card}
            onPress={() => handleOfferPress(offer)}
            activeOpacity={0.8}
          >
            <View style={styles.bogoBanner}>
              <Text style={styles.bogoText}>{getBogoLabel(offer.bogoType)}</Text>
            </View>

            <View style={styles.imageContainer}>
              <Image
                source={{ uri: offer.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.storeLogoContainer}>
                {offer.store.logo ? (
                  <Image
                    source={{ uri: offer.store.logo }}
                    style={styles.storeLogo}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.storeLogoPlaceholder}>
                    <Text style={styles.storeLogoText}>
                      {offer.store.name.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.storeName} numberOfLines={1}>
                {offer.store.name}
              </Text>
              <Text style={styles.title} numberOfLines={1}>
                {offer.title}
              </Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {offer.subtitle}
              </Text>
              <View style={styles.footer}>
                <Text style={styles.priceText}>Rs.{offer.originalPrice.toFixed(0)}</Text>
                {offer.cashbackPercentage > 0 && (
                  <View style={styles.cashbackBadge}>
                    <Ionicons name="wallet-outline" size={9} color={Colors.primary[600]} />
                    <Text style={styles.cashbackText}>+{offer.cashbackPercentage}%</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </HorizontalScrollSection>
    </View>
  );
};

export default BOGOSection;
