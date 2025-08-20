import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useOnboarding } from '@/hooks/useOnboarding';

interface BrandItem {
  id: string;
  name: string;
  icon: string;
  originalPrice: number;
  discountedPrice: number;
  isEnabled: boolean;
  backgroundColor: string;
}

const brands: BrandItem[] = [
  { 
    id: 'puma', 
    name: 'Puma', 
    icon: 'fitness-outline', 
    originalPrice: 1000, 
    discountedPrice: 800, 
    isEnabled: true,
    backgroundColor: '#FEE2E2'
  },
  { 
    id: 'nike', 
    name: 'Nike', 
    icon: 'checkmark-outline', 
    originalPrice: 2000, 
    discountedPrice: 1800, 
    isEnabled: true,
    backgroundColor: '#DBEAFE'
  },
  { 
    id: 'kfc', 
    name: 'KFC', 
    icon: 'restaurant-outline', 
    originalPrice: 3000, 
    discountedPrice: 2800, 
    isEnabled: true,
    backgroundColor: '#FEF3C7'
  },
  { 
    id: 'dominos', 
    name: "Domino's", 
    icon: 'pizza-outline', 
    originalPrice: 2500, 
    discountedPrice: 2000, 
    isEnabled: true,
    backgroundColor: '#FECACA'
  },
  { 
    id: 'pizzahut', 
    name: 'Pizza HUT', 
    icon: 'fast-food-outline', 
    originalPrice: 1000, 
    discountedPrice: 800, 
    isEnabled: false,
    backgroundColor: '#E5E7EB'
  },
];

export default function TransactionsPreviewScreen() {
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();

  const handleFinish = async () => {
    await completeOnboarding();
    // After onboarding, user should sign in to access the app
    router.replace('/sign-in');
  };

  const renderBrandItem = (brand: BrandItem) => (
    <View
      key={brand.id}
      style={[
        styles.brandItem,
        { backgroundColor: brand.backgroundColor },
        !brand.isEnabled && styles.brandItemDisabled,
      ]}
    >
      <View style={styles.brandInfo}>
        <View style={styles.brandIcon}>
          <Ionicons 
            name={brand.icon as any} 
            size={24} 
            color={brand.isEnabled ? '#374151' : '#9CA3AF'} 
          />
        </View>
        <Text style={[
          styles.brandName,
          !brand.isEnabled && styles.brandNameDisabled,
        ]}>
          {brand.name}
        </Text>
      </View>
      
      <View style={styles.priceInfo}>
        <Text style={[
          styles.originalPrice,
          !brand.isEnabled && styles.priceDisabled,
        ]}>
          ₹{brand.originalPrice}
        </Text>
        <Ionicons 
          name="arrow-forward" 
          size={16} 
          color={brand.isEnabled ? '#10B981' : '#9CA3AF'} 
          style={styles.arrowIcon}
        />
        <Text style={[
          styles.discountedPrice,
          !brand.isEnabled && styles.priceDisabled,
        ]}>
          ₹{brand.discountedPrice}
        </Text>
      </View>
    </View>
  );

  return (
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Seamless Transactions{'\n'}& Rewards!</Text>
          <View style={styles.underline} />
          
          <Text style={styles.subtitle}>
            Purchase your favorite brands using UPI and get{'\n'}
            a 10% discount.{'\n'}
            Earn the Brand Coin!
          </Text>
          
          {/* Floating Coins */}
          <View style={styles.coinsContainer}>
            <View style={[styles.coin, styles.coin1]}>
              <Text style={styles.coinText}>₹</Text>
            </View>
            <View style={[styles.coin, styles.coin2]}>
              <Text style={styles.coinText}>₹</Text>
            </View>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <Text style={styles.transactionsTitle}>Transactions</Text>
          
          <View style={styles.brandsList}>
            {brands.map(renderBrandItem)}
          </View>
        </View>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
        >
          <Text style={styles.finishButtonText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  coinsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  coin: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  coinText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  coin1: {
    top: 20,
    left: 40,
  },
  coin2: {
    top: 60,
    right: 30,
  },
  transactionsSection: {
    flex: 1,
    paddingTop: 20,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  brandsList: {
    gap: 12,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  brandItemDisabled: {
    opacity: 0.5,
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  brandNameDisabled: {
    color: '#9CA3AF',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  arrowIcon: {
    marginHorizontal: 8,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  priceDisabled: {
    color: '#9CA3AF',
  },
  finishButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});