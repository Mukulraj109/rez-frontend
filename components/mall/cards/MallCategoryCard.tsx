/**
 * MallCategoryCard Component
 *
 * Glassmorphism card for displaying mall category
 * Features gradient backgrounds, blur effects, and modern styling
 */

import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  ImageSourcePropType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { MallCategory } from '../../../types/mall.types';

// Category images from assets
const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  fashion: require('@/assets/category-icons/Shopping/Fashion.png'),
  'food & dining': require('@/assets/category-icons/FOOD-DINING/Family-restaurants.png'),
  food: require('@/assets/category-icons/FOOD-DINING/Cafes.png'),
  entertainment: require('@/assets/category-icons/ENTERTAINMENT/Gaming-cafes.png'),
  healthcare: require('@/assets/category-icons/HEALTHCARE/Clinics.png'),
  health: require('@/assets/category-icons/HEALTHCARE/Clinics.png'),
  travel: require('@/assets/category-icons/TRAVEL-EXPERIENCES/Hotels.png'),
  'travel & experiences': require('@/assets/category-icons/TRAVEL-EXPERIENCES/Tours.png'),
  education: require('@/assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  'education & learning': require('@/assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  electronics: require('@/assets/category-icons/Shopping/Mobile-accessories.png'),
  beauty: require('@/assets/category-icons/BEAUTY-WELLNESS/Beauty-services.png'),
  groceries: require('@/assets/category-icons/GROCERY-ESSENTIALS/Supermarkets.png'),
  sports: require('@/assets/category-icons/FITNESS-SPORTS/Gyms.png'),
  home: require('@/assets/category-icons/HOME-SERVICES/Cleaning.png'),
  lifestyle: require('@/assets/category-icons/FINANCIAL-LIFESTYLE/Gold-savings.png'),
};

interface MallCategoryCardProps {
  category: MallCategory;
  onPress: (category: MallCategory) => void;
  width?: number;
  index?: number;
}

// Vibrant gradient color schemes for each category
const CATEGORY_THEMES: Record<string, {
  gradient: [string, string];
  iconBg: string;
  iconColor: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  fashion: {
    gradient: ['#FF6B9D', '#C44569'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'shirt-outline',
  },
  'food & dining': {
    gradient: ['#FF9A56', '#FF6B35'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'restaurant-outline',
  },
  food: {
    gradient: ['#FF9A56', '#FF6B35'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'restaurant-outline',
  },
  entertainment: {
    gradient: ['#A855F7', '#7C3AED'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'game-controller-outline',
  },
  healthcare: {
    gradient: ['#22D3EE', '#06B6D4'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'medical-outline',
  },
  health: {
    gradient: ['#22D3EE', '#06B6D4'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'medical-outline',
  },
  travel: {
    gradient: ['#60A5FA', '#3B82F6'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'airplane-outline',
  },
  'travel & experiences': {
    gradient: ['#60A5FA', '#3B82F6'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'airplane-outline',
  },
  education: {
    gradient: ['#34D399', '#10B981'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'school-outline',
  },
  'education & learning': {
    gradient: ['#34D399', '#10B981'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'school-outline',
  },
  electronics: {
    gradient: ['#818CF8', '#6366F1'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'laptop-outline',
  },
  beauty: {
    gradient: ['#F472B6', '#EC4899'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'sparkles-outline',
  },
  groceries: {
    gradient: ['#4ADE80', '#22C55E'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'cart-outline',
  },
  sports: {
    gradient: ['#FB923C', '#F97316'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'fitness-outline',
  },
  home: {
    gradient: ['#A78BFA', '#8B5CF6'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'home-outline',
  },
  lifestyle: {
    gradient: ['#F87171', '#EF4444'],
    iconBg: 'rgba(255, 255, 255, 0.25)',
    iconColor: '#FFFFFF',
    icon: 'heart-outline',
  },
};

// Fallback gradients for categories not in the map
const FALLBACK_GRADIENTS: [string, string][] = [
  ['#667EEA', '#764BA2'],
  ['#F093FB', '#F5576C'],
  ['#4FACFE', '#00F2FE'],
  ['#43E97B', '#38F9D7'],
  ['#FA709A', '#FEE140'],
  ['#A18CD1', '#FBC2EB'],
];

const MallCategoryCard: React.FC<MallCategoryCardProps> = ({
  category,
  onPress,
  width,
  index = 0,
}) => {
  // Get theme based on category name (lowercase)
  const categoryKey = category.name.toLowerCase();
  const theme = CATEGORY_THEMES[categoryKey];

  // If no theme found, use fallback gradient based on index
  const gradient = theme?.gradient || FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];
  const iconName = theme?.icon || 'grid-outline';

  // Calculate coin reward text
  const rewardText = category.maxCashback > 0
    ? `Up to ${category.maxCashback}% coins`
    : 'Earn ReZ Coins';

  return (
    <TouchableOpacity
      style={[styles.container, width ? { width } : {}]}
      onPress={() => onPress(category)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        {/* Glassmorphism overlay */}
        <View style={styles.glassOverlay}>
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          {/* Content */}
          <View style={styles.content}>
            {/* Icon/Image Container with glass effect */}
            <View style={styles.iconWrapper}>
              <View style={styles.iconContainer}>
                {CATEGORY_IMAGES[categoryKey] ? (
                  <Image
                    source={CATEGORY_IMAGES[categoryKey]}
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                ) : (
                  <Ionicons
                    name={iconName}
                    size={22}
                    color="#FFFFFF"
                  />
                )}
              </View>
            </View>

            {/* Category Info */}
            <View style={styles.infoContainer}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.name}
              </Text>

              {/* Coins Info with pill */}
              <View style={styles.coinsPill}>
                <Ionicons name="flash" size={10} color="#FFFFFF" />
                <Text style={styles.coinsText}>{rewardText}</Text>
              </View>
            </View>

            {/* Arrow indicator */}
            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.8)" />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 6,
  },
  gradientCard: {
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 110,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  glassOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    marginBottom: 12,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  categoryImage: {
    width: 28,
    height: 28,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  coinsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  coinsText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  arrowContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
});

export default memo(MallCategoryCard);
