import React, { memo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
// Local minimal type to avoid external dependency
export interface SearchCategory {
  id: string;
  name: string;
  image: string;
  description?: string;
  isPopular?: boolean;
  cashbackPercentage: number;
}

interface OptimizedCategoryCardProps {
  category: SearchCategory;
  onPress: (category: SearchCategory) => void;
  showCashback?: boolean;
}

const OptimizedCategoryCard: React.FC<OptimizedCategoryCardProps> = memo(({
  category,
  onPress,
  showCashback = true,
}) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(category)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: category.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.gradient}
      />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {category.name}
          </Text>
          {category.isPopular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>Popular</Text>
            </View>
          )}
        </View>
        
        {category.description && (
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        )}
        
        {showCashback && category.cashbackPercentage > 0 && (
          <View style={styles.cashbackContainer}>
            <Text style={styles.cashbackText}>
              {category.cashbackPercentage}% Cashback
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}, (prevProps: OptimizedCategoryCardProps, nextProps: OptimizedCategoryCardProps) => {
  // Custom comparison for better performance
  return (
    prevProps.category.id === nextProps.category.id &&
    prevProps.showCashback === nextProps.showCashback
  );
});

const styles = StyleSheet.create({
  card: {
    width: 160,
    height: 200,
    borderRadius: 16,
    marginRight: 16,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  content: {
    flex: 1,
    padding: 12,
    justifyContent: 'flex-end',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#FF6B2C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  cashbackContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backdropFilter: 'blur(10px)',
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});

OptimizedCategoryCard.displayName = 'OptimizedCategoryCard';

export default OptimizedCategoryCard;

