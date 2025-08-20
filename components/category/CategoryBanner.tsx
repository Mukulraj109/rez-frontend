import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { CategoryBanner as CategoryBannerType } from '@/types/category.types';

interface CategoryBannerProps {
  banner: CategoryBannerType;
  onPress?: (banner: CategoryBannerType) => void;
}

export default function CategoryBanner({ banner, onPress }: CategoryBannerProps) {
  const { width } = Dimensions.get('window');
  const bannerWidth = width - 32; // Account for horizontal padding

  const handlePress = () => {
    if (onPress) {
      onPress(banner);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { width: bannerWidth }]}
      onPress={handlePress}
      activeOpacity={0.9}
      disabled={!onPress}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: banner.image }} 
          style={styles.backgroundImage} 
          resizeMode="cover"
        />
        
        {/* Overlay gradient */}
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
          style={styles.overlay}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        
        {/* Content */}
        <View style={styles.content}>
          <View style={styles.textContent}>
            {banner.subtitle && (
              <ThemedText style={[styles.subtitle, { color: banner.textColor }]}>
                {banner.subtitle}
              </ThemedText>
            )}
            
            <ThemedText style={[styles.title, { color: banner.textColor }]}>
              {banner.title}
            </ThemedText>
            
            {banner.description && (
              <ThemedText style={[styles.description, { color: banner.textColor }]}>
                {banner.description}
              </ThemedText>
            )}
            
            {banner.action && (
              <TouchableOpacity style={styles.actionButton} onPress={handlePress}>
                <ThemedText style={styles.actionButtonText}>
                  {banner.action.label}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Cashback badge */}
          {banner.cashback && (
            <View style={styles.cashbackBadge}>
              <ThemedText style={styles.cashbackText}>
                {banner.cashback.percentage}%
              </ThemedText>
              <ThemedText style={styles.cashbackLabel}>
                Cashback
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  textContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 4,
    opacity: 0.9,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
    opacity: 0.9,
  },
  actionButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cashbackBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 60,
  },
  cashbackText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cashbackLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    opacity: 0.9,
  },
});