import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Dimensions,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Brand } from '@/types/voucher.types';
import VoucherData from '@/data/voucherData';

const { width } = Dimensions.get('window');

export default function BrandDetailPage() {
  const router = useRouter();
  const { brandId } = useLocalSearchParams();
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrandDetails();
  }, [brandId]);

  const loadBrandDetails = async () => {
    try {
      setLoading(true);
      const brandData = await VoucherData.api.getBrandDetails(brandId as string);
      setBrand(brandData);
    } catch (error) {
      console.error('Failed to load brand details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    console.log('📱 Share brand:', brand?.name);
  };

  const handleFavorite = () => {
    console.log('❤️ Favorite brand:', brand?.name);
  };

  const renderHeader = () => (
    <LinearGradient 
      colors={['#8B5CF6', '#7C3AED']} 
      style={styles.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          activeOpacity={0.8}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>{brand?.name || 'Brand'}</ThemedText>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={20} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerActionButton}
            onPress={handleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );

  const renderBrandIllustration = () => (
    <View style={styles.illustrationContainer}>
      <View style={styles.illustrationBackground}>
        <ThemedText style={styles.illustration}>{brand?.illustration || '🏪'}</ThemedText>
      </View>
      
      <View style={styles.brandLogoContainer}>
        <View style={[styles.brandLogo, { backgroundColor: brand?.backgroundColor || '#F3F4F6' }]}>
          <ThemedText style={[styles.brandLogoText, { color: brand?.logoColor || '#000' }]}>
            {brand?.logo}
          </ThemedText>
        </View>
        <ThemedText style={styles.brandName}>{brand?.name}</ThemedText>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <ThemedText style={styles.statValue}>
          {brand?.rating ? `${brand.rating}%` : '95%'} Positive rating by {brand?.reviewCount || '7.8k+ users'}
        </ThemedText>
      </View>
      
      <View style={styles.statItem}>
        <ThemedText style={styles.statValue}>
          {brand?.rewardCount || '55 lakh+ Rewards given in last month'}
        </ThemedText>
      </View>
    </View>
  );

  const renderOfferDetails = () => (
    <View style={styles.offerSection}>
      {brand?.bigSavingDays && (
        <View style={styles.offerCard}>
          <ThemedText style={styles.offerTitle}>{brand.bigSavingDays.title}</ThemedText>
          <ThemedText style={styles.offerDescription}>{brand.bigSavingDays.description}</ThemedText>
          {brand.extraOffers?.map((offer, index) => (
            <ThemedText key={index} style={styles.extraOffer}>{offer}</ThemedText>
          ))}
        </View>
      )}
      
      {brand?.wasilRewards && (
        <View style={styles.wasilRewardsCard}>
          <ThemedText style={styles.wasilRewardsText}>
            + Upto {brand.wasilRewards.percentage}% wasil Rewards
          </ThemedText>
        </View>
      )}
      
      <View style={styles.instructionCard}>
        <ThemedText style={styles.instructionText}>
          Add Products to your cart/Wishlist /save for later only after going via Wasil
        </ThemedText>
      </View>
    </View>
  );

  const renderActionButton = () => (
    <View style={styles.actionSection}>
      <TouchableOpacity 
        style={styles.rewardButton}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8B5CF6', '#7C3AED']}
          style={styles.rewardButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <ThemedText style={styles.rewardButtonText}>
            Earn upto {brand?.cashbackRate || 7}% Reward
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderBottomTabs = () => (
    <View style={styles.bottomSection}>
      {/* Timeline */}
      <View style={styles.timelineContainer}>
        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <View style={styles.purpleDot} />
          </View>
          <View style={styles.timelineContent}>
            <ThemedText style={styles.timelineTitle}>Purchase</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>Today</ThemedText>
          </View>
        </View>
        
        <View style={styles.timelineLine} />
        
        <View style={styles.timelineItem}>
          <View style={styles.timelineIcon}>
            <View style={styles.purpleDot} />
          </View>
          <View style={styles.timelineContent}>
            <ThemedText style={styles.timelineTitle}>Reward track</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>in 30 min</ThemedText>
            <ThemedText style={styles.timelineSubtitle}>Today</ThemedText>
          </View>
        </View>
      </View>
      
      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity 
          style={[styles.bottomButton, styles.rewardsRatesButton]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.bottomButtonGradient}
          >
            <ThemedText style={styles.bottomButtonText}>Rewards Rates</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.bottomButton, styles.offerTermsButton]}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.bottomButtonGradient}
          >
            <ThemedText style={styles.bottomButtonText}>Offer Terms</ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        {renderHeader()}
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading brand details...</ThemedText>
        </View>
      </View>
    );
  }

  if (!brand) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
        {renderHeader()}
        <View style={styles.errorContent}>
          <ThemedText style={styles.errorText}>Brand not found</ThemedText>
          <TouchableOpacity 
            style={styles.backToVouchersButton}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.backToVouchersText}>Back to Vouchers</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {renderHeader()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderBrandIllustration()}
        {renderStats()}
        {renderOfferDetails()}
        {renderActionButton()}
        {renderBottomTabs()}
        
        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Content
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Illustration
  illustrationContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginBottom: 8,
  },
  illustrationBackground: {
    width: width * 0.8,
    height: 160,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  illustration: {
    fontSize: 48,
  },
  brandLogoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  brandLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    fontSize: 24,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  
  // Stats
  statsContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  statItem: {
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    color: '#111827',
    textAlign: 'center',
    lineHeight: 24,
  },
  
  // Offers
  offerSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  offerCard: {
    marginBottom: 16,
  },
  offerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  offerDescription: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  extraOffer: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  wasilRewardsCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  wasilRewardsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    textAlign: 'center',
  },
  instructionCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  instructionText: {
    fontSize: 14,
    color: '#7C3AED',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Action Button
  actionSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginBottom: 8,
  },
  rewardButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  rewardButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Bottom Section
  bottomSection: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  timelineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  timelineItem: {
    alignItems: 'center',
    flex: 1,
  },
  timelineIcon: {
    marginBottom: 8,
  },
  purpleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
  },
  timelineContent: {
    alignItems: 'center',
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  timelineSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  timelineLine: {
    width: 60,
    height: 2,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bottomButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  bottomButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  
  // Loading State
  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  
  // Error State
  errorContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToVouchersButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToVouchersText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  // Bottom Space
  bottomSpace: {
    height: 40,
  },
});