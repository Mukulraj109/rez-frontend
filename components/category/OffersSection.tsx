/**
 * OffersSection Component
 * Displays category-specific offers from the API
 * Used in FoodDiningCategoryPage and other category pages with offers tabs
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { categoriesApi } from '@/services/categoriesApi';

interface Offer {
  _id: string;
  title: string;
  description?: string;
  discountType: 'percentage' | 'flat' | 'cashback';
  discountValue: number;
  code?: string;
  store?: {
    _id: string;
    name: string;
    logo?: string;
  };
  validity?: {
    startDate: string;
    endDate: string;
    isActive: boolean;
  };
  image?: string;
}

interface OffersSectionProps {
  categorySlug: string;
  categoryId?: string;
}

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
};

export default function OffersSection({ categorySlug, categoryId }: OffersSectionProps) {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [bankOffers, setBankOffers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      // For now, use dummy bank offers data since getBankOffers doesn't exist
      // TODO: Implement proper bank offers API endpoint
      setBankOffers([
        { _id: '1', bank: 'HDFC Bank', discount: 'Up to 20% Off', icon: '🏦', gradient: ['#3B82F6', '#1D4ED8'] },
        { _id: '2', bank: 'SBI Card', discount: '15% Cashback', icon: '💳', gradient: ['#10B981', '#059669'] },
        { _id: '3', bank: 'ICICI Bank', discount: 'Up to 25% Off', icon: '🏦', gradient: ['#8B5CF6', '#7C3AED'] },
        { _id: '4', bank: 'Axis Bank', discount: '10% Cashback', icon: '💳', gradient: ['#EC4899', '#DB2777'] },
      ]);

      // If we have categoryId, fetch category-specific offers
      // For now, we'll use bank offers as the main offers source
      setOffers([]);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [categorySlug, categoryId]);

  const handleOfferPress = (offer: any) => {
    if (offer.store?._id) {
      router.push(`/MainStorePage?storeId=${offer.store._id}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Loading offers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bank Offers Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="card-outline" size={20} color="#3B82F6" />
          <Text style={styles.sectionTitle}>Bank Offers</Text>
          <TouchableOpacity onPress={() => router.push('/offers')}>
            <Text style={styles.sectionSeeAll}>View All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bankOffersList}>
          {bankOffers.map((offer, index) => (
            <TouchableOpacity key={offer._id || index} style={styles.bankOfferCard}>
              <LinearGradient
                colors={offer.gradient || ['#3B82F6', '#1D4ED8']}
                style={styles.bankOfferGradient}
              >
                <View style={styles.bankOfferContent}>
                  <Text style={styles.bankOfferIcon}>{offer.icon || '🏦'}</Text>
                  <View style={styles.bankOfferText}>
                    <Text style={styles.bankOfferTitle} numberOfLines={1}>{offer.bank || offer.title}</Text>
                    <Text style={styles.bankOfferDiscount}>{offer.discount || 'Up to 20% Off'}</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Today's Deals Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionEmoji}>🏷️</Text>
          <Text style={styles.sectionTitle}>Today's Deals</Text>
        </View>
        <View style={styles.dealsGrid}>
          {[
            { title: 'Flat 50% Off', subtitle: 'On first order', icon: '🎉', color: '#EC4899' },
            { title: 'Free Delivery', subtitle: 'Orders above ₹199', icon: '🚚', color: '#3B82F6' },
            { title: '2X Cashback', subtitle: 'Pay via UPI', icon: '💰', color: '#10B981' },
            { title: 'BOGO', subtitle: 'Buy 1 Get 1 Free', icon: '🍕', color: '#F59E0B' },
          ].map((deal, index) => (
            <TouchableOpacity key={index} style={styles.dealCard}>
              <View style={[styles.dealIcon, { backgroundColor: deal.color + '20' }]}>
                <Text style={styles.dealIconText}>{deal.icon}</Text>
              </View>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealSubtitle}>{deal.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Promo Codes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="ticket-outline" size={20} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Promo Codes</Text>
        </View>
        <View style={styles.promoList}>
          {[
            { code: 'FIRSTBITE50', discount: '50% OFF', description: 'Max ₹100 off on first order', expiry: 'Expires in 2 days' },
            { code: 'WEEKEND25', discount: '25% OFF', description: 'Valid on weekends only', expiry: 'Expires in 5 days' },
            { code: 'HEALTHYFOOD', discount: '20% OFF', description: 'On healthy food options', expiry: 'Expires in 7 days' },
          ].map((promo, index) => (
            <View key={index} style={styles.promoCard}>
              <View style={styles.promoLeft}>
                <Text style={styles.promoDiscount}>{promo.discount}</Text>
                <Text style={styles.promoDescription}>{promo.description}</Text>
                <Text style={styles.promoExpiry}>{promo.expiry}</Text>
              </View>
              <View style={styles.promoRight}>
                <View style={styles.promoCodeBox}>
                  <Text style={styles.promoCode}>{promo.code}</Text>
                </View>
                <TouchableOpacity style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>COPY</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionEmoji: {
    fontSize: 20,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  sectionSeeAll: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  bankOffersList: {
    gap: 12,
    paddingRight: 16,
  },
  bankOfferCard: {
    width: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bankOfferGradient: {
    padding: 16,
  },
  bankOfferContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bankOfferIcon: {
    fontSize: 28,
  },
  bankOfferText: {
    flex: 1,
  },
  bankOfferTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: 4,
  },
  bankOfferDiscount: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  dealsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  dealCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  dealIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  dealIconText: {
    fontSize: 24,
  },
  dealTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  dealSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  promoList: {
    gap: 12,
  },
  promoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primaryGreen,
  },
  promoLeft: {
    flex: 1,
  },
  promoDiscount: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primaryGreen,
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 13,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  promoExpiry: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  promoRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  promoCodeBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  promoCode: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  copyButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 6,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
});
