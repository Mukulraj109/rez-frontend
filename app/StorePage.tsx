import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
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
import { createSimpleMockHandlers } from '@/utils/simple-mock-handlers';

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
  const [cardData, setCardData] = useState<DynamicCardData | null>(null);
  const [isDynamic, setIsDynamic] = useState(false);

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
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});