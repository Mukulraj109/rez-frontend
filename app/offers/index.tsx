import React from 'react';
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
import { useOffersData } from '@/hooks/useOffersData';
import { shareOffersPage } from '@/utils/shareUtils';
import { Offer, OfferSection } from '@/types/offers.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2; // 2 cards per row with padding

export default function OffersScreen() {
  const router = useRouter();
  const { 
    offersData, 
    sections, 
    loading, 
    error 
  } = useOffersData();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleShare = async () => {
    await shareOffersPage();
  };

  const handleFavorite = () => {
    // Implement favorite functionality
    console.log('Toggle favorite');
  };


  const ProductCard = ({ offer }: { offer: Offer }) => (
    <TouchableOpacity style={styles.productCard}>
      <Image 
        source={{ uri: offer.image }} 
        style={styles.productImage}
        resizeMode="cover"
      />
      
      
      <View style={styles.productInfo}>
        <ThemedText style={styles.productTitle} numberOfLines={2}>
          {offer.title}
        </ThemedText>
        <ThemedText style={styles.cashBack}>
          Upto {offer.cashBackPercentage}% cash back
        </ThemedText>
        <View style={styles.distanceContainer}>
          <Ionicons name="location-outline" size={12} color="#666" />
          <ThemedText style={styles.distance}>{offer.distance}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  const SectionHeader = ({ section }: { section: OfferSection }) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      {section.viewAllEnabled && (
        <TouchableOpacity>
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
          <ProductCard key={offer.id} offer={offer} />
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
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <TouchableOpacity 
              style={styles.pointsContainer}
              onPress={() => router.push('/CoinPage')}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.pointsText}>{offersData.userPoints}</ThemedText>
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleFavorite} style={styles.headerButton}>
              <Ionicons name="heart-outline" size={20} color="white" />
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
        <View style={styles.heroBanner}>
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
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <ThemedText style={styles.loadingText}>Loading offers...</ThemedText>
          </View>
        )}

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <TouchableOpacity style={styles.retryButton}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Offer Sections */}
        {!loading && !error && sections.map((section) => (
          <OfferSectionComponent key={section.id} section={section} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  pointsText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  megaOffersBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  megaOffersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: '#4F46E5',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '-5deg' }],
  },
  offersTextContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    transform: [{ rotate: '5deg' }],
  },
  offersText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  scalloped: {
    height: 20,
    backgroundColor: '#8B5CF6',
    position: 'relative',
  },
  scallopedInner: {
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
  heroBanner: {
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