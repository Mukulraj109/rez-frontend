import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import PayBillCard from '@/components/store/PayBillCard';
import InstagramCard from './InstagramCard';

interface NewSectionProps {
  dynamicData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    price?: number;
    pricing?: {
      selling?: number;
    };
    productType?: 'product' | 'service';
  } | null;
  cardType?: string;
}

export default function NewSection({ dynamicData, cardType }: NewSectionProps) {
  const backgroundColor = useThemeColor({}, 'background');
  const { width } = Dimensions.get('window');

  // Responsive spacing based on screen width
  const responsivePadding = width < 360 ? 16 : 24;
  const cardGap = width < 360 ? 12 : 16;

  return (
    <View style={[
      styles.container,
      {
        backgroundColor,
        paddingVertical: responsivePadding,
        gap: cardGap,
      }
    ]}>
      <PayBillCard
        productData={dynamicData}
        initialAmount=""
        discountPercentage={20}
      />
      <InstagramCard productData={dynamicData} />
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    // Base styles - responsive values applied inline
  },
});