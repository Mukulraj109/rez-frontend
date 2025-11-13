import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useOffersPage } from '@/hooks/useOffersPage';
import { shareOffersPage } from '@/utils/shareUtils';
import { Offer, OfferSection } from '@/services/realOffersApi';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 cards per row with padding

export default function OffersScreen() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const { 
    state,
    actions,
    handlers
  } = useOffersPage();
  
  const [isFavorited, setIsFavorited] = useState(false);

  // Get user points - prioritize API response over auth state (API is more up-to-date)
  const userPoints = React.useMemo(() => {
    // Priority 1: Use API response (most up-to-date from Wallet model)
    if (state.pageData?.userEngagement?.userPoints !== undefined) {
      console.log('💰 [OFFERS PAGE] Using API response:', state.pageData.userEngagement.userPoints);
      return state.pageData.userEngagement.userPoints;
    }
    
    // Priority 2: Fallback to auth state
    const walletBalance = authState.user?.wallet?.balance || 0;
    console.log('💰 [OFFERS PAGE] Fallback to auth state:', walletBalance);
    return walletBalance;
  }, [state.pageData?.userEngagement?.userPoints, authState.user?.wallet?.balance]);

  const handleBack = () => {
    handlers.handleBack();
  };

  const handleShare = async () => {
    await handlers.handleShare();
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    handlers.handleFavorite();
  };

  const ProductCard = ({ offer }: { offer: Offer }) => {
    const [imageError, setImageError] = React.useState(false);

    return (
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handlers.handleOfferPress(offer)}
        accessibilityLabel={`${offer.title}. ${offer.cashbackPercentage} percent cashback. ${offer.store?.name || ''}${offer.distance ? `. ${offer.distance} kilometers away` : ''}`}
        accessibilityRole="button"
        accessibilityHint="Double tap to view offer details"
      >
        {imageError || !offer.image ? (
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#ccc" />
          </View>
        ) : (
          <Image 
            source={{ uri: offer.image }} 
            style={styles.productImage}
            resizeMode="cover"
            onError={() => {
              console.log('❌ [OFFER CARD] Failed to load image:', offer.image);
              setImageError(true);
            }}
            onLoad={() => {
              setImageError(false);
            }}
          />
        )}
        
        <View style={styles.productInfo}>
          <ThemedText style={styles.productTitle} numberOfLines={2}>
            {offer.title}
          </ThemedText>
          <ThemedText style={styles.cashBack}>
            Upto {offer.cashbackPercentage}% cash back
          </ThemedText>
          {offer.store?.name && (
            <ThemedText style={styles.storeName} numberOfLines={1}>
              {offer.store.name}
            </ThemedText>
          )}
          {offer.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <ThemedText style={styles.distance}>{offer.distance} km away</ThemedText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ section }: { section: OfferSection }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      {section.viewAllEnabled && (
        <TouchableOpacity
          onPress={() => handlers.handleViewAll(section.title)}
          accessibilityLabel={`View all ${section.title} offers`}
          accessibilityRole="button"
          accessibilityHint="Double tap to view all offers in this category"
        >
          <ThemedText style={styles.viewAll}>View all</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );

  const OfferSectionComponent = ({ section }: { section: OfferSection }) => (
    <View style={styles.section}>
      <SectionHeader section={section} />
      <View style={styles.productsGrid}>
        {section.offers.map((offer, index) => (
          <ProductCard key={offer._id} offer={offer} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Navigate to previous screen"
          >
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <TouchableOpacity 
              style={styles.pointsContainer}
              onPress={() => router.push('/CoinPage')}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.pointsText}>{userPoints}</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={handleShare}
              style={styles.headerButton}
              accessibilityLabel="Share offers page"
              accessibilityRole="button"
              accessibilityHint="Double tap to share this page"
            >
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleFavorite}
              style={styles.headerButton}
              accessibilityLabel={isFavorited ? "Remove from favorites" : "Add to favorites"}
              accessibilityRole="button"
              accessibilityHint={isFavorited ? "Double tap to remove from favorites" : "Double tap to add to favorites"}
            >
              <Ionicons
                name={isFavorited ? "heart" : "heart-outline"}
                size={20}
                color={isFavorited ? "#EF4444" : "white"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Mega Offers Banner */}
        <View style={styles.bannerContainer}>
          <View style={styles.megaOffersBanner}>
            <ThemedText style={styles.megaOffersText}>MEGA</ThemedText>
            <View style={styles.offersTextContainer}>
              <ThemedText style={styles.offersText}>OFFERS</ThemedText>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Scalloped Edge */}
      <View style={styles.scalloped}>
        <View style={styles.scallopedInner} />
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Hero Banner */}
        <View style={styles.heroBannerCard}>
          <View style={styles.heroContent}>
            <Image 
              source={require('@/assets/images/bag.png')} 
              style={styles.bagImage}
              resizeMode="contain"
            />
            <View style={styles.orderImageContainer}>
              <Image 
                source={require('@/assets/images/order-now.png')} 
                style={styles.orderNowImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        {/* Loading State */}
        {state.loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <ThemedText style={styles.loadingText}>Loading offers...</ThemedText>
          </View>
        )}

        {/* Error State */}
        {state.error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <ThemedText style={styles.errorText}>{state.error}</ThemedText>
            <TouchableOpacity style={styles.retryButton} onPress={actions.loadOffersPageData}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Hero Banner */}
        {!state.loading && !state.error && state.pageData?.heroBanner && (
          <View style={styles.heroBanner}>
            <Image 
              source={{ uri: state.pageData.heroBanner.image }} 
              style={styles.heroBannerImage}
              resizeMode="cover"
            />
            <View style={styles.heroBannerOverlay}>
              <ThemedText style={styles.heroBannerTitle}>
                {state.pageData.heroBanner.title}
              </ThemedText>
              {state.pageData.heroBanner.subtitle && (
                <ThemedText style={styles.heroBannerSubtitle}>
                  {state.pageData.heroBanner.subtitle}
                </ThemedText>
              )}
              <TouchableOpacity 
                style={styles.heroBannerButton}
                onPress={() => router.push('/offers/view-all' as any)}
              >
                <ThemedText style={styles.heroBannerButtonText}>
                  {state.pageData.heroBanner.ctaText}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Offer Sections */}
        {!state.loading && !state.error && state.pageData && (
          <>
            {/* Debug Info */}
            {}
            
            {/* Mega Offers Section */}
            {state.pageData.sections.mega.offers.length > 0 && (
              <OfferSectionComponent 
                key="mega" 
                section={{
                  id: 'mega',
                  title: state.pageData.sections.mega.title,
                  offers: state.pageData.sections.mega.offers.slice(0, 2), // Show only 2 offers
                  viewAllEnabled: true
                }} 
              />
            )}

            {/* Student Offers Section */}
            {state.pageData.sections.students.offers.length > 0 && (
              <OfferSectionComponent 
                key="students" 
                section={{
                  id: 'students',
                  title: state.pageData.sections.students.title,
                  offers: state.pageData.sections.students.offers.slice(0, 2), // Show only 2 offers
                  viewAllEnabled: true
                }} 
              />
            )}

            {/* New Arrivals Section */}
            {state.pageData.sections.newArrivals.offers.length > 0 && (
              <OfferSectionComponent 
                key="newArrivals" 
                section={{
                  id: 'newArrivals',
                  title: state.pageData.sections.newArrivals.title,
                  offers: state.pageData.sections.newArrivals.offers.slice(0, 2), // Show only 2 offers
                  viewAllEnabled: true
                }} 
              />
            )}

            {/* Trending Section */}
            {state.pageData.sections.trending.offers.length > 0 && (
              <OfferSectionComponent 
                key="trending" 
                section={{
                  id: 'trending',
                  title: state.pageData.sections.trending.title,
                  offers: state.pageData.sections.trending.offers.slice(0, 2), // Show only 2 offers
                  viewAllEnabled: true
                }} 
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heroBanner: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  heroBannerImage: {
    width: '100%',
    height: 200,
  },
  heroBannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 20,
  },
  heroBannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  heroBannerSubtitle: {
    fontSize: 16,
    color: 'white',
    marginBottom: 16,
    opacity: 0.9,
  },
  heroBannerButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  heroBannerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  pointsText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    alignItems: 'center',
  },
  megaOffersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  megaOffersText: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    transform: [{ rotate: '-5deg' }],
  },
  offersTextContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    transform: [{ rotate: '5deg' }],
  },
  offersText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1F2937',
  },
  scalloped: {
    height: 20,
    backgroundColor: '#8B5CF6',
    position: 'relative',
  },
  scallopedInner: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    gap: 20,
  },
  heroBannerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 10,
    minHeight: 180,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 0,
  },
  bagImage: {
    width: 180,
    height: 150,
    marginRight: 100,
    marginLeft: -10,
  },
  orderImageContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 100,
  },
  orderNowImage: {
    width: 240,
    height: 120,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f0f0f0',
  },
  productImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    padding: 12,
    gap: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  cashBack: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distance: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});