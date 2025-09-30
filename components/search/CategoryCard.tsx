import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { CategoryCardProps } from '@/types/search.types';

export default function CategoryCard({
  category,
  onPress,
  size = 'medium',
  showCashback = true,
}: CategoryCardProps) {
  const cardSize = getCardSize(size);

  const handlePress = () => {
    onPress(category);
  };

  const renderImage = () => {
    if (category.image) {
      return (
        <Image
          source={{ uri: category.image }}
          style={[styles.categoryImage, { height: cardSize.imageHeight }]}
          resizeMode="cover"
        />
      );
    }

    // Fallback with gradient and icon/text
    return (
      <LinearGradient
        colors={getCategoryGradient(category.name)}
        style={[styles.categoryImagePlaceholder, { height: cardSize.imageHeight }]}
      >
        <View style={styles.placeholderContent}>
          {category.icon ? (
            <Ionicons name={category.icon as any} size={cardSize.iconSize} color="white" />
          ) : (
            <Text style={[styles.placeholderText, { fontSize: cardSize.textSize }]}>
              {category.name.charAt(0)}
            </Text>
          )}
        </View>
      </LinearGradient>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.categoryCard, cardSize.container]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Category Image */}
      <View style={styles.imageContainer}>
        {renderImage()}
        
        {/* Popular Badge */}
        {category.isPopular && (
          <View style={styles.popularBadge}>
            <Ionicons name="trending-up" size={10} color="white" />
            <Text style={styles.popularBadgeText}>Popular</Text>
          </View>
        )}

        {/* Cashback Badge */}
        {showCashback && (
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashbackText}>
              {category.cashbackPercentage}%
            </Text>
          </View>
        )}
      </View>

      {/* Category Info */}
      <View style={styles.categoryInfo}>
        <Text style={[styles.categoryName, { fontSize: cardSize.nameSize }]}>
          {category.name}
        </Text>
        {showCashback && (
          <Text style={[styles.categoryCashback, { fontSize: cardSize.cashbackSize }]}>
            Upto {category.cashbackPercentage}% cash back
          </Text>
        )}
        {category.description && size !== 'small' && (
          <Text style={[styles.categoryDescription, { fontSize: cardSize.descriptionSize }]}>
            {category.description}
          </Text>
        )}
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrowContainer}>
        <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
}

const getCardSize = (size: 'small' | 'medium' | 'large') => {
  switch (size) {
    case 'small':
      return {
        container: { width: 140, minHeight: 160 },
        imageHeight: 80,
        iconSize: 20,
        textSize: 18,
        nameSize: 14,
        cashbackSize: 10,
        descriptionSize: 11,
      };
    case 'large':
      return {
        container: { width: '100%', minHeight: 120 },
        imageHeight: 100,
        iconSize: 28,
        textSize: 24,
        nameSize: 18,
        cashbackSize: 14,
        descriptionSize: 13,
      };
    default: // medium
      return {
        container: { width: 160, minHeight: 180 },
        imageHeight: 90,
        iconSize: 24,
        textSize: 20,
        nameSize: 16,
        cashbackSize: 12,
        descriptionSize: 12,
      };
  }
};

const getCategoryGradient = (categoryName: string): string[] => {
  const gradients: Record<string, string[]> = {
    'Perfume': ['#FF6B9D', '#C44569'],
    'Gold': ['#FFD700', '#FFA500'],
    'Fashion': ['#8B5CF6', '#A78BFA'],
    'Gifts': ['#10B981', '#059669'],
    'Electronic': ['#3B82F6', '#1E40AF'],
    'Restaurant': ['#EF4444', '#DC2626'],
    'Groceries': ['#22C55E', '#16A34A'],
    'Fruits': ['#F59E0B', '#D97706'],
    'Meat & Seafood': ['#DC2626', '#B91C1C'],
    'Pet Care': ['#8B5CF6', '#7C3AED'],
  };

  return gradients[categoryName] || ['#6B7280', '#4B5563'];
};

const styles = StyleSheet.create({
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  categoryImage: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  categoryImagePlaceholder: {
    width: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontWeight: '700',
    color: 'white',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 2,
  },
  popularBadgeText: {
    fontSize: 9,
    color: 'white',
    fontWeight: '600',
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 11,
    color: 'white',
    fontWeight: '700',
  },
  categoryInfo: {
    flex: 1,
    alignItems: 'flex-start',
  },
  categoryName: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  categoryCashback: {
    color: '#10B981',
    fontWeight: '500',
    marginBottom: 4,
  },
  categoryDescription: {
    color: '#6B7280',
    lineHeight: 16,
  },
  arrowContainer: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
});