import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CategoryTileProps, CategoryColor } from '@/types/earnPage.types';
import { CATEGORY_GRADIENTS, CATEGORY_SOLID_COLORS, EARN_COLORS } from '@/constants/EarnPageColors';

export default function CategoryTile({ 
  category, 
  onPress, 
  size = 'medium' 
}: CategoryTileProps) {
  const gradient = CATEGORY_GRADIENTS[category.color];
  const solidColor = CATEGORY_SOLID_COLORS[category.color];
  
  const getSizeStyles = (size: string) => {
    switch (size) {
      case 'small':
        return {
          container: { height: 80 },
          iconSize: 20,
          fontSize: 11,
          padding: 12,
        };
      case 'large':
        return {
          container: { height: 120 },
          iconSize: 28,
          fontSize: 15,
          padding: 20,
        };
      default: // medium
        return {
          container: { height: 100 },
          iconSize: 24,
          fontSize: 13,
          padding: 16,
        };
    }
  };

  const sizeStyles = getSizeStyles(size);

  return (
    <TouchableOpacity 
      style={[styles.container, sizeStyles.container]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={gradient}
        style={[styles.gradient, { padding: sizeStyles.padding }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={category.icon as any} 
              size={sizeStyles.iconSize} 
              color="#FFFFFF" 
            />
          </View>
          
          <ThemedText 
            style={[
              styles.categoryName, 
              { fontSize: sizeStyles.fontSize }
            ]} 
            numberOfLines={2}
          >
            {category.name}
          </ThemedText>
          
          {category.projectCount > 0 && (
            <View style={styles.projectCount}>
              <ThemedText style={styles.projectCountText}>
                {category.projectCount}
              </ThemedText>
            </View>
          )}
        </View>
        
        {!category.isActive && (
          <View style={styles.inactiveOverlay}>
            <ThemedText style={styles.inactiveText}>Coming Soon</ThemedText>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 4,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    marginBottom: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 6,
  },
  categoryName: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  projectCount: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  projectCountText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  inactiveOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inactiveText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});