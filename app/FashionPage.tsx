import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import FashionHeader from '@/components/FashionHeader';

import CategorySlider from '@/src/components/CategorySlider';
import ProductCarousel from '@/src/components/ProductCarousel';
import QuickButtons from '@/src/components/QuickButtons';
import StoreList from '@/src/components/StoreList';
import BrandList from '@/src/components/BrandList';
import StepsCard from '@/src/components/StepsCard';

export default function FashionPage() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Fashion Header */}
      <FashionHeader />
      
      {/* Category Slider */}
      <CategorySlider />
      
      {/* Product Carousel */}
      <ProductCarousel />
      
      {/* Quick Buttons */}
      <QuickButtons />

      <StepsCard/>
      
      {/* Store List */}
      <StoreList />
      
      {/* Brand List */}
      <BrandList />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});