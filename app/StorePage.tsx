import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
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

export default function StorePage() {
  // TODO: Replace with actual store data from backend API
  // const { data: storeData, isLoading } = useStoreData(storeId);
  // const storeType = storeData?.type || 'PRODUCT';
  
  // Get mock handlers for testing - TODO: Replace with actual API calls
  const { handleBuyPress, handleLockPress, handleBookingPress } = createSimpleMockHandlers();

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StoreHeader />
        <ProductInfo />
        
        {/* Store Action Buttons - Conditional rendering based on store type */}
        <StoreActionButtons
          storeType="PRODUCT" // TODO: Replace with {storeType} from backend API
          onBuyPress={handleBuyPress} // TODO: Replace with actual buy API call
          onLockPress={handleLockPress} // TODO: Replace with actual lock API call
          onBookingPress={handleBookingPress} // TODO: Conditionally provide based on storeType
          // TODO: Add dynamic props from backend:
          // isBuyDisabled={!storeData?.actions?.canBuy}
          // isLockDisabled={!storeData?.actions?.canLock}
          // showBookingButton={storeData?.actions?.canBook}
        />
        
        <NewSection />
        <Section1 />
        <Section2 />
        <Section3 />
        <Section4 />
        <Section5 />
        <Section6 />
        <CombinedSection78 />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});