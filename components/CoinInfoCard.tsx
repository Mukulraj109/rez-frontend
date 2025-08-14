// components/CoinInfoCard.tsx
import React from 'react';
import { View, Image, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { CoinInfoCardProps } from '@/types/profile';

export const CoinInfoCard: React.FC<CoinInfoCardProps> = ({ 
  image, 
  title, 
  subtitle,
  onPress 
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;
  return (
    <CardComponent style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <Image
        source={image}
        style={styles.image}
        resizeMode="cover" 
      />
      {(title || subtitle) && (
        <View style={styles.textOverlay}>
          {title && <Text style={styles.title}>{title}</Text>}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
    </CardComponent>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 16,
  },
  image: {
    width: width * 0.9,
    height: width * 0.4,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 8,
  },
  title: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    color: '#555',
    fontSize: 12,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
