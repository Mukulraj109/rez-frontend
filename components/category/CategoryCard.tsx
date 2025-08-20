import React from 'react';
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { CategoryItem } from '@/types/category.types';

interface CategoryCardProps {
  item: CategoryItem;
  layoutType?: 'compact' | 'detailed' | 'featured';
  onPress: (item: CategoryItem) => void;
  onAddToCart: (item: CategoryItem) => void;
  onToggleFavorite: (item: CategoryItem) => void;
  showQuickActions?: boolean;
  cardStyle?: 'elevated' | 'flat' | 'outlined';
}

export default function CategoryCard({
  item,
  layoutType = 'compact',
  onPress,
  onAddToCart,
  onToggleFavorite,
  showQuickActions = true,
  cardStyle = 'elevated',
}: CategoryCardProps) {
  
  const handlePress = () => {
    onPress(item);
  };

  const handleAddToCart = (e: any) => {
    e.stopPropagation();
    onAddToCart(item);
  };

  const handleToggleFavorite = (e: any) => {
    e.stopPropagation();
    onToggleFavorite(item);
  };

  // Get container style based on card style
  const getContainerStyle = () => {
    const baseStyle = [styles.container];
    
    switch (cardStyle) {
      case 'elevated':
        return [...baseStyle, styles.elevatedCard];
      case 'outlined':
        return [...baseStyle, styles.outlinedCard];
      case 'flat':
      default:
        return [...baseStyle, styles.flatCard];
    }
  };

  // Render price information
  const renderPrice = () => {
    if (!item.price) return null;

    return (
      <View style={styles.priceContainer}>
        <ThemedText style={styles.currentPrice}>
          {item.price.currency}{item.price.current}
        </ThemedText>
        {item.price.original && item.price.original > item.price.current && (
          <ThemedText style={styles.originalPrice}>
            {item.price.currency}{item.price.original}
          </ThemedText>
        )}
      </View>
    );
  };

  // Render rating information
  const renderRating = () => {
    if (!item.rating) return null;

    return (
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={12} color="#FFD700" />
        <ThemedText style={styles.ratingText}>
          {item.rating.value}
        </ThemedText>
        {item.rating.maxValue && item.rating.maxValue !== 5 && (
          <ThemedText style={styles.ratingMaxText}>
            /{item.rating.maxValue}
          </ThemedText>
        )}
        {item.rating.count && (
          <ThemedText style={styles.ratingCount}>
            ({item.rating.count})
          </ThemedText>
        )}
      </View>
    );
  };

  // Render timing information (delivery time, etc.)
  const renderTiming = () => {
    if (!item.timing?.deliveryTime) return null;

    return (
      <View style={styles.timingContainer}>
        <Ionicons name="time-outline" size={12} color="#6B7280" />
        <ThemedText style={styles.timingText}>
          {item.timing.deliveryTime}
        </ThemedText>
      </View>
    );
  };

  // Render cashback information
  const renderCashback = () => {
    if (!item.cashback) return null;

    return (
      <View style={styles.cashbackContainer}>
        <ThemedText style={styles.cashbackText}>
          Upto {item.cashback.percentage}% cash back
        </ThemedText>
      </View>
    );
  };

  // Render location information (for stores)
  const renderLocation = () => {
    if (!item.location) return null;

    return (
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={12} color="#6B7280" />
        <ThemedText style={styles.locationText} numberOfLines={1}>
          {item.location.address}
        </ThemedText>
      </View>
    );
  };

  // Render badges (featured, popular, new)
  const renderBadges = () => {
    const badges = [];
    
    if (item.isFeatured) {
      badges.push(
        <View key="featured" style={[styles.badge, styles.featuredBadge]}>
          <ThemedText style={styles.badgeText}>Featured</ThemedText>
        </View>
      );
    }
    
    if (item.isPopular) {
      badges.push(
        <View key="popular" style={[styles.badge, styles.popularBadge]}>
          <ThemedText style={styles.badgeText}>Popular</ThemedText>
        </View>
      );
    }
    
    if (item.isNew) {
      badges.push(
        <View key="new" style={[styles.badge, styles.newBadge]}>
          <ThemedText style={styles.badgeText}>New</ThemedText>
        </View>
      );
    }

    if (badges.length === 0) return null;

    return (
      <View style={styles.badgesContainer}>
        {badges}
      </View>
    );
  };

  // Render compact layout (default grid)
  const renderCompactLayout = () => (
    <TouchableOpacity style={getContainerStyle()} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} resizeMode="cover" />
        {renderBadges()}
        {showQuickActions && (
          <TouchableOpacity 
            style={styles.favoriteButton} 
            onPress={handleToggleFavorite}
          >
            <Ionicons 
              name="heart-outline" 
              size={18} 
              color="#6B7280" 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.content}>
        <ThemedText style={styles.title} numberOfLines={2}>
          {item.name}
        </ThemedText>
        
        <View style={styles.metaContainer}>
          {renderRating()}
          {renderTiming()}
        </View>
        
        {renderPrice()}
        {renderCashback()}
        
        {showQuickActions && (
          <TouchableOpacity 
            style={styles.addToCartButton} 
            onPress={handleAddToCart}
          >
            <ThemedText style={styles.addToCartText}>Add to cart</ThemedText>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  // Render detailed layout (list view)
  const renderDetailedLayout = () => (
    <TouchableOpacity style={[getContainerStyle(), styles.detailedContainer]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.detailedImageContainer}>
        <Image source={{ uri: item.image }} style={styles.detailedImage} resizeMode="cover" />
        {renderBadges()}
      </View>
      
      <View style={styles.detailedContent}>
        <View style={styles.detailedHeader}>
          <ThemedText style={styles.detailedTitle} numberOfLines={1}>
            {item.name}
          </ThemedText>
          {showQuickActions && (
            <TouchableOpacity onPress={handleToggleFavorite}>
              <Ionicons name="heart-outline" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        {item.metadata.description && (
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.metadata.description}
          </ThemedText>
        )}
        
        <View style={styles.detailedMeta}>
          {renderRating()}
          {renderLocation()}
          {renderTiming()}
        </View>
        
        <View style={styles.detailedFooter}>
          {renderPrice()}
          {renderCashback()}
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render featured layout (hero style)
  const renderFeaturedLayout = () => (
    <TouchableOpacity style={[getContainerStyle(), styles.featuredContainer]} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.featuredImageContainer}>
        <Image source={{ uri: item.image }} style={styles.featuredImage} resizeMode="cover" />
        <View style={styles.featuredOverlay} />
        {renderBadges()}
        
        <View style={styles.featuredContent}>
          <ThemedText style={styles.featuredTitle} numberOfLines={2}>
            {item.name}
          </ThemedText>
          
          {item.metadata.description && (
            <ThemedText style={styles.featuredDescription} numberOfLines={3}>
              {item.metadata.description}
            </ThemedText>
          )}
          
          <View style={styles.featuredMeta}>
            {renderRating()}
            {renderPrice()}
          </View>
        </View>
        
        {showQuickActions && (
          <View style={styles.featuredActions}>
            <TouchableOpacity style={styles.featuredFavoriteButton} onPress={handleToggleFavorite}>
              <Ionicons name="heart-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.featuredAddButton} onPress={handleAddToCart}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      {renderCashback()}
    </TouchableOpacity>
  );

  // Render based on layout type
  switch (layoutType) {
    case 'detailed':
      return renderDetailedLayout();
    case 'featured':
      return renderFeaturedLayout();
    case 'compact':
    default:
      return renderCompactLayout();
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  elevatedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  outlinedCard: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  flatCard: {
    // No additional styles for flat cards
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  featuredBadge: {
    backgroundColor: '#8B5CF6',
  },
  popularBadge: {
    backgroundColor: '#EF4444',
  },
  newBadge: {
    backgroundColor: '#10B981',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  ratingMaxText: {
    fontSize: 10,
    color: '#6B7280',
  },
  ratingCount: {
    fontSize: 10,
    color: '#6B7280',
  },
  timingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  timingText: {
    fontSize: 11,
    color: '#6B7280',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  currentPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  originalPrice: {
    fontSize: 12,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  cashbackContainer: {
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '500',
  },
  addToCartButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  
  // Detailed layout styles
  detailedContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  detailedImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  detailedImage: {
    width: '100%',
    height: '100%',
  },
  detailedContent: {
    flex: 1,
  },
  detailedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  detailedTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginRight: 8,
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 8,
  },
  detailedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  locationText: {
    fontSize: 11,
    color: '#6B7280',
  },
  detailedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  // Featured layout styles
  featuredContainer: {
    height: 200,
  },
  featuredImageContainer: {
    position: 'relative',
    flex: 1,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 60,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featuredDescription: {
    fontSize: 12,
    color: '#E5E7EB',
    lineHeight: 16,
    marginBottom: 8,
  },
  featuredMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featuredActions: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 8,
  },
  featuredFavoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredAddButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});