import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import StoreHeader from './StoreSection/StoreHeader';
import ProductInfo from './StoreSection/ProductInfo';
import NewSection from './StoreSection/NewSection';
import Section1 from './StoreSection/Section1';
import Section2 from './StoreSection/Section2';
import Section3 from './StoreSection/Section3';
import Section4 from './StoreSection/Section4';
import Section5 from './StoreSection/Section5';
import Section6 from './StoreSection/Section6';
import CombinedSection78 from './StoreSection/CombinedSection78';

export default function StorePage() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <StoreHeader />
        <ProductInfo />
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