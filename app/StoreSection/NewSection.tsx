import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';
import PayBillCard from './PayBillCard';
import InstagramCard from './InstagramCard';

export default function NewSection() {
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
      <PayBillCard />
      <InstagramCard />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Base styles - responsive values applied inline
  },
});