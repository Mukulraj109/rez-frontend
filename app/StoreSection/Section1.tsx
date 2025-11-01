import React from 'react';
import { View, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

interface Section1Props {
  dynamicData?: {
    title?: string;
    image?: string;
    category?: string;
    merchant?: string;
    [key: string]: any;
  } | null;
  cardType?: string;
}

export default function Section1({ dynamicData, cardType }: Section1Props) {
  const backgroundColor = useThemeColor({}, 'background');
  
  // Generate dynamic images based on product data
  const storeImages = dynamicData ? [
    { 
      uri: dynamicData.image || 'https://picsum.photos/id/1011/300/200', 
      title: `${dynamicData.title || 'Product'} images` 
    },
    { 
      uri: 'https://picsum.photos/id/1012/300/200', 
      title: `${dynamicData.title || 'Product'} Videos` 
    },
    { 
      uri: 'https://picsum.photos/id/1013/300/200', 
      title: `${dynamicData.category || 'Product'} Collection` 
    },
  ] : [
    { uri: 'https://picsum.photos/id/1011/300/200', title: 'Product images' },
    { uri: 'https://picsum.photos/id/1012/300/200', title: 'Product Videos' },
    { uri: 'https://picsum.photos/id/1013/300/200', title: 'Collection' },
  ];

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ThemedText style={styles.title}>
        {dynamicData ? `${dynamicData.title || 'Product'} Gallery` : 'Product Gallery'}
      </ThemedText>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {storeImages.map((item, index) => (
          <TouchableOpacity key={index} style={styles.imageContainer} activeOpacity={0.8}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <View style={styles.imageOverlay}>
              <ThemedText style={styles.imageTitle}>{item.title}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 20,
    letterSpacing: -0.3,
  },
  scrollContainer: {
    marginHorizontal: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: 240,
    height: 150,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  imageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});
