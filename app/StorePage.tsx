import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, View, Modal, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import StoreHeader from './StoreSection/StoreHeader';
import ProductInfo from './StoreSection/ProductInfo';
import StoreActionButtons from './StoreSection/StoreActionButtons';
import NewSection from './StoreSection/NewSection';
import Section1 from './StoreSection/Section1';
import Section2 from './StoreSection/Section2';
import Section3 from './StoreSection/Section3';
import Section4 from './StoreSection/Section4';
import Section5 from './StoreSection/Section5';
import Section6 from './StoreSection/Section6';
import CombinedSection78 from './StoreSection/CombinedSection78';
import ReviewList from '@/components/reviews/ReviewList';
import ReviewForm from '@/components/reviews/ReviewForm';
import { createSimpleMockHandlers } from '@/utils/simple-mock-handlers';
import homepageDataService from '@/services/homepageDataService';
import { useAuth } from '@/contexts/AuthContext';

interface DynamicCardData {
  id: string;
  title: string;
  description?: string;
  image?: string;
  price?: number;
  rating?: number;
  category?: string;
  merchant?: string;
  type?: string;
  section?: string;
  [key: string]: any;
}

export default function StorePage() {
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const [cardData, setCardData] = useState<DynamicCardData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);
  const [backendData, setBackendData] = useState<any>(null);
  const [isLoadingBackend, setIsLoadingBackend] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Parse dynamic card data from navigation params
  useEffect(() => {
    if (params.cardData && params.cardId && params.cardType) {
      try {
        const parsedData = JSON.parse(params.cardData as string);
        setCardData(parsedData);
        setIsDynamic(true);
        console.log('📱 [DYNAMIC STORE] Loaded card data:', {
          cardId: params.cardId,
          cardType: params.cardType,
          title: parsedData.title,
          price: parsedData.price,
          rating: parsedData.rating,
          merchant: parsedData.merchant,
          fullData: parsedData
        });
        console.log('🎯 [DYNAMIC STORE] Components now using dynamic data:', {
          header: 'Dynamic image, section label, category badge',
          productInfo: 'Dynamic title, description, price, rating, discount, cashback',
          actionButtons: 'Dynamic pricing, availability status',
          sections: 'Section1 with dynamic gallery titles and images'
        });
      } catch (error) {
        console.error('❌ [DYNAMIC STORE] Failed to parse card data:', error);
        setIsDynamic(false);
      }
    } else {
      console.log('📱 [STATIC STORE] Loading default store page');
      setIsDynamic(false);
    }
  }, [params]);

  // Fetch additional backend data if we have a product ID
  useEffect(() => {
    async function fetchBackendData() {
      if (cardData?.id && isDynamic) {
        console.log('🔄 [BACKEND FETCH] Attempting to fetch backend data for product:', cardData.id);
        setIsLoadingBackend(true);
        
        try {
          // Try to get enhanced product data from backend
          const productDetails = await homepageDataService.getProductForStorePage(cardData.id);
          
          if (productDetails) {
            console.log('✅ [BACKEND FETCH] Successfully loaded backend data:', productDetails);
            setBackendData(productDetails);
            
            // Optionally merge backend data with existing cardData
            const enhancedCardData = {
              ...cardData,
              // Merge in additional backend fields if available
              description: productDetails.description || cardData.description,
              specifications: productDetails.specifications,
              similarProducts: productDetails.similarProducts,
              detailedRating: productDetails.rating,
              availability: productDetails.availabilityStatus,
              tags: productDetails.tags,
              // Keep original data for fallback
              backendEnhanced: true
            };
            
            setCardData(enhancedCardData);
            console.log('🎯 [BACKEND MERGE] Enhanced card data with backend details');
          } else {
            console.log('⚠️ [BACKEND FETCH] No backend data found, using original card data');
          }
        } catch (error) {
          console.error('❌ [BACKEND FETCH] Failed to fetch backend data:', error);
        } finally {
          setIsLoadingBackend(false);
        }
      }
    }

    // Only fetch if we have dynamic data and haven't already fetched
    if (cardData?.id && isDynamic && !backendData && !isLoadingBackend) {
      fetchBackendData();
    }
  }, [cardData?.id, isDynamic, backendData, isLoadingBackend]);

  // TODO: Replace with actual store data from backend API
  // const { data: storeData, isLoading } = useStoreData(storeId);
  // const storeType = storeData?.type || 'PRODUCT';
  
  // Get mock handlers for testing - TODO: Replace with actual API calls
  const { handleBuyPress, handleLockPress, handleBookingPress } = createSimpleMockHandlers();

  // Determine store type - dynamic or default
  const storeType = cardData?.type === 'product' ? 'PRODUCT' : 'SERVICE';

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Pass dynamic data to components */}
        <StoreHeader 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <ProductInfo 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        
        {/* Store Action Buttons - Conditional rendering based on store type */}
        <StoreActionButtons
          storeType={isDynamic ? storeType : "PRODUCT"}
          onBuyPress={handleBuyPress} // TODO: Replace with actual buy API call
          onLockPress={handleLockPress} // TODO: Replace with actual lock API call
          onBookingPress={handleBookingPress} // TODO: Conditionally provide based on storeType
          dynamicData={isDynamic ? cardData : null}
          // TODO: Add dynamic props from backend:
          // isBuyDisabled={!storeData?.actions?.canBuy}
          // isLockDisabled={!storeData?.actions?.canLock}
          // showBookingButton={storeData?.actions?.canBook}
        />
        
        <NewSection 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section1 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section2 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section3 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section4 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section5 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        <Section6 
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />
        

        <CombinedSection78
          dynamicData={isDynamic ? cardData : null}
          cardType={params.cardType as string}
        />

        {/* Reviews Section */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsSectionHeader}>
            <ThemedText style={styles.reviewsSectionTitle}>
              Customer Reviews
            </ThemedText>
            <TouchableOpacity
              style={styles.seeAllButton}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.seeAllText}>See All</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          {cardData?.id && (
            <ReviewList
              storeId={cardData.id}
              onWriteReviewPress={() => setShowReviewForm(true)}
              showWriteButton={true}
              currentUserId={user?.id}
            />
          )}
        </View>
      </ScrollView>

      {/* Review Form Modal */}
      <Modal
        visible={showReviewForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowReviewForm(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Write a Review</ThemedText>
            <TouchableOpacity
              onPress={() => setShowReviewForm(false)}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>

          {cardData?.id && (
            <ReviewForm
              storeId={cardData.id}
              onSubmit={(review) => {
                setShowReviewForm(false);
                // Optionally reload reviews or update UI
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          )}
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  reviewsSection: {
    marginTop: 24,
    marginBottom: 32,
  },
  reviewsSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  reviewsSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
});