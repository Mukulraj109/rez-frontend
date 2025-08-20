import React from 'react';
import { 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  View 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { BrandedStoreCardProps } from '@/types/homepage.types';

export default function BrandedStoreCard({ 
  store, 
  onPress, 
  width = 200 
}: BrandedStoreCardProps) {
  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={() => {
        try {
          onPress(store);
        } catch (error) {
          console.error('Branded store card press error:', error);
        }
      }}
      activeOpacity={0.8}
      delayPressIn={0}
      delayPressOut={0}
    >
      <ThemedView style={[
        styles.card,
        { backgroundColor: store.backgroundColor || '#F8F9FA' }
      ]}>
        {/* Discount Badge */}
        <View style={styles.discountBadge}>
          <ThemedText style={styles.discountText}>
            {store.discount.description}
          </ThemedText>
        </View>

        {/* Brand Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: store.brandLogo }} 
            style={styles.logo}
            resizeMode="contain"
            fadeDuration={0}
          />
        </View>

        {/* Brand Name */}
        <ThemedText style={styles.brandName}>
          {store.brandName}
        </ThemedText>

        {/* Cashback Info */}
        <View style={styles.cashbackContainer}>
          <ThemedText style={styles.cashbackText}>
            {store.cashback.description}
          </ThemedText>
        </View>

        {/* Partner Badge */}
        {store.isPartner && (
          <View style={[
            styles.partnerBadge,
            store.partnerLevel === 'gold' && styles.goldPartner,
            store.partnerLevel === 'silver' && styles.silverPartner,
            store.partnerLevel === 'bronze' && styles.bronzePartner
          ]}>
            <ThemedText style={[
              styles.partnerText,
              store.partnerLevel === 'gold' && styles.goldPartnerText,
              store.partnerLevel === 'silver' && styles.silverPartnerText,
              store.partnerLevel === 'bronze' && styles.bronzePartnerText
            ]}>
              {store.partnerLevel?.toUpperCase()} PARTNER
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // Container styles handled by parent
    flex: 0,
    flexShrink: 0,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
    minHeight: 160,
    justifyContent: 'space-between',
  },
  discountBadge: {
    position: 'absolute',
    top: -8,
    left: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  logoContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  cashbackContainer: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    textAlign: 'center',
  },
  partnerBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'center',
  },
  goldPartner: {
    backgroundColor: '#FEF3C7',
  },
  silverPartner: {
    backgroundColor: '#F3F4F6',
  },
  bronzePartner: {
    backgroundColor: '#FED7AA',
  },
  partnerText: {
    fontSize: 10,
    fontWeight: '700',
  },
  goldPartnerText: {
    color: '#92400E',
  },
  silverPartnerText: {
    color: '#374151',
  },
  bronzePartnerText: {
    color: '#9A3412',
  },
});