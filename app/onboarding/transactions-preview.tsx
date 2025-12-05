import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { navigationDebugger } from '@/utils/navigationDebug';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  textPrimary: '#0B2240',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

interface BrandItem {
  id: string;
  name: string;
  icon: string;
  originalPrice: number;
  discountedPrice: number;
  isEnabled: boolean;
  gradientColors: string[];
}

const brands: BrandItem[] = [
  {
    id: 'puma',
    name: 'Puma',
    icon: 'fitness-outline',
    originalPrice: 1000,
    discountedPrice: 800,
    isEnabled: true,
    gradientColors: [COLORS.primary, COLORS.deepTeal]
  },
  {
    id: 'nike',
    name: 'Nike',
    icon: 'checkmark-outline',
    originalPrice: 2000,
    discountedPrice: 1800,
    isEnabled: true,
    gradientColors: [COLORS.gold, COLORS.goldDark]
  },
  {
    id: 'kfc',
    name: 'KFC',
    icon: 'restaurant-outline',
    originalPrice: 3000,
    discountedPrice: 2800,
    isEnabled: true,
    gradientColors: [COLORS.primary, COLORS.deepTeal]
  },
  {
    id: 'dominos',
    name: "Domino's",
    icon: 'pizza-outline',
    originalPrice: 2500,
    discountedPrice: 2000,
    isEnabled: true,
    gradientColors: [COLORS.gold, COLORS.goldDark]
  },
  {
    id: 'pizzahut',
    name: 'Pizza HUT',
    icon: 'fast-food-outline',
    originalPrice: 1000,
    discountedPrice: 800,
    isEnabled: false,
    gradientColors: ['#D1D5DB', '#9CA3AF']
  },
];

export default function TransactionsPreviewScreen() {
  const router = useRouter();
  const { actions } = useAuth();

  const handleFinish = async () => {
    try {
      await actions.completeOnboarding({
        preferences: {
          notifications: {
            push: true,
            email: true,
            sms: true
          },
          theme: 'light'
        }
      });

      navigationDebugger.logNavigation('transactions-preview', '(tabs)', 'onboarding-completed');
      router.replace('/(tabs)');

    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.replace('/(tabs)');
    }
  };

  const renderBrandItem = (brand: BrandItem, index: number) => {
    const discount = brand.originalPrice - brand.discountedPrice;
    const discountPercentage = Math.round((discount / brand.originalPrice) * 100);

    return (
      <View
        key={brand.id}
        style={[
          styles.brandItem,
          !brand.isEnabled && styles.brandItemDisabled,
        ]}
        accessible={true}
        accessibilityLabel={`${brand.name} transaction example. Original price ${brand.originalPrice} rupees, discounted price ${brand.discountedPrice} rupees. Save ${discount} rupees, ${discountPercentage} percent off${!brand.isEnabled ? '. Coming soon' : ''}`}
        accessibilityRole="text"
      >
        <View style={styles.brandInfo}>
          <LinearGradient
            colors={brand.gradientColors}
            style={styles.brandIconGradient}
          >
            <Ionicons
              name={brand.icon as any}
              size={22}
              color="#FFFFFF"
            />
          </LinearGradient>
          <View style={styles.brandDetails}>
            <Text style={[
              styles.brandName,
              !brand.isEnabled && styles.brandNameDisabled,
            ]}>
              {brand.name}
            </Text>
            {brand.isEnabled && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save ₹{discount}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.priceInfo}>
          <Text style={[
            styles.originalPrice,
            !brand.isEnabled && styles.priceDisabled,
          ]}>
            ₹{brand.originalPrice}
          </Text>
          <View style={styles.arrowContainer}>
            <Ionicons
              name="arrow-forward"
              size={14}
              color={brand.isEnabled ? COLORS.primary : '#9CA3AF'}
            />
          </View>
          <Text style={[
            styles.discountedPrice,
            !brand.isEnabled && styles.priceDisabled,
          ]}>
            ₹{brand.discountedPrice}
          </Text>
        </View>

        {!brand.isEnabled && (
          <View style={styles.comingSoonOverlay}>
            <Text style={styles.comingSoonText}>Soon</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.surface, '#EDF2F7', COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circleGreen]} />
        <View style={[styles.circle, styles.circleGold]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.glassShine}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Seamless Transactions{'\n'}& Rewards!</Text>

            <View style={styles.underlineContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />
            </View>

            <Text style={styles.subtitle}>
              Purchase your favorite brands using UPI and get{'\n'}
              up to 10% discount. Earn ReZ Coins!
            </Text>

            {/* Floating Coins */}
            <View style={styles.coinsContainer}>
              <View style={[styles.coin, styles.coin1]}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.coinGradient}
                >
                  <Text style={styles.coinText}>R</Text>
                </LinearGradient>
              </View>
              <View style={[styles.coin, styles.coin2]}>
                <LinearGradient
                  colors={[COLORS.gold, COLORS.goldDark]}
                  style={styles.coinGradient}
                >
                  <Text style={styles.coinText}>R</Text>
                </LinearGradient>
              </View>
              <View style={[styles.coin, styles.coin3]}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.deepTeal]}
                  style={styles.coinGradient}
                >
                  <Ionicons name="gift" size={12} color="#FFF" />
                </LinearGradient>
              </View>
            </View>
          </View>

          {/* Transactions Section */}
          <View style={styles.transactionsSection}>
            <View style={styles.transactionsTitleRow}>
              <Text style={styles.transactionsTitle}>Sample Transactions</Text>
              <View style={styles.discountBadge}>
                <LinearGradient
                  colors={[COLORS.primary, COLORS.deepTeal]}
                  style={styles.discountBadgeGradient}
                >
                  <Text style={styles.discountBadgeText}>10% OFF</Text>
                </LinearGradient>
              </View>
            </View>

            <View style={styles.brandsList}>
              {brands.map(renderBrandItem)}
            </View>
          </View>

          {/* Finish Button */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={handleFinish}
            activeOpacity={0.9}
            accessibilityLabel="Complete onboarding and start shopping"
            accessibilityRole="button"
            accessibilityHint="Double tap to finish setup and explore the app"
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.deepTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Start Shopping</Text>
              <Ionicons name="rocket" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Decorative
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGreen: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  circleGold: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(30px)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  underlineContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Floating Coins
  coinsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  coin: {
    position: 'absolute',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  coinGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#B8860B',
  },
  coinText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  coin1: {
    top: 0,
    left: 10,
  },
  coin2: {
    top: 30,
    right: 5,
  },
  coin3: {
    top: 70,
    left: 30,
  },

  // Transactions Section
  transactionsSection: {
    marginBottom: 24,
  },
  transactionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  discountBadge: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  discountBadgeGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  brandsList: {
    gap: 12,
  },
  brandItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  brandItemDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  brandInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandIconGradient: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  brandDetails: {
    flex: 1,
  },
  brandName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  brandNameDisabled: {
    color: '#9CA3AF',
  },
  savingsBadge: {
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  arrowContainer: {
    marginHorizontal: 6,
  },
  discountedPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  priceDisabled: {
    color: '#9CA3AF',
  },
  comingSoonOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  comingSoonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
