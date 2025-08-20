import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
  Animated,
  Platform,
  Pressable
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryCarouselItem } from '@/types/category.types';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface CategoryCarouselProps {
  items: CategoryCarouselItem[];
  onItemPress?: (item: CategoryCarouselItem) => void;
  title?: string;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ 
  items, 
  onItemPress, 
  title = "Featured" 
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  const handleItemPress = (item: CategoryCarouselItem) => {
    if (onItemPress) {
      onItemPress(item);
    }
  };

  const renderProduct = (item: CategoryCarouselItem) => {
    // Create a local animated value for each product item
    const scaleAnim = new Animated.Value(1);

    const popIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 1.05, // scale up
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    const popOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1, // back to normal
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }).start();
    };

    const CardWrapper = Platform.OS === 'web' ? Pressable : TouchableOpacity;

    return (
      <CardWrapper
        key={item.id}
        style={{ width: CARD_WIDTH }}
        android_ripple={{ color: 'transparent' }} // No ripple
        onHoverIn={Platform.OS === 'web' ? popIn : undefined}
        onHoverOut={Platform.OS === 'web' ? popOut : undefined}
        activeOpacity={0.95}
        onPressIn={Platform.OS !== 'web' ? popIn : undefined}
        onPressOut={Platform.OS !== 'web' ? popOut : undefined}
        onPress={() => handleItemPress(item)}
      >
        <Animated.View style={[styles.productCard, { transform: [{ scale: scaleAnim }] }]}>
          <ImageBackground
            source={{ uri: item.image }}
            style={styles.productImage}
            imageStyle={styles.imageStyle}
          >
            <LinearGradient
              colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
              style={styles.overlay}
            >
              <Text style={styles.brandText}>{item.brand}</Text>

              <View style={styles.ribbon}>
                <Text style={styles.ribbonText}>CASHBACK {item.cashback}%</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>

              <TouchableOpacity 
                style={styles.bottomButton} 
                activeOpacity={0.7}
                onPress={() => handleItemPress(item)}
              >
                <Text style={styles.cashbackInfo}>
                  Cashback upto {item.cashback}%
                </Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            </LinearGradient>
          </ImageBackground>
        </Animated.View>
      </CardWrapper>
    );
  };

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {items.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: activeIndex === index ? '#8B5CF6' : '#E5E7EB',
              width: activeIndex === index ? 20 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {title && (
        <View style={styles.headerContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={CARD_WIDTH}
        snapToAlignment="start"
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {items.map(renderProduct)}
      </ScrollView>
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: (width - CARD_WIDTH) / 2,
  },
  productCard: {
    height: 320,
    marginHorizontal: 8,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  productImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderRadius: 16,
  },
  overlay: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
  },
  brandText: {
    position: 'absolute',
    top: 16,
    left: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  ribbon: {
    position: 'absolute',
    top: 16,
    right: -40,
    backgroundColor: '#8B5CF6',
    paddingVertical: 4,
    paddingHorizontal: 40,
    transform: [{ rotate: '45deg' }],
  },
  ribbonText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  textContainer: {
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  bottomButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cashbackInfo: {
    flex: 1,
    fontSize: 12,
    color: '#fff',
  },
  arrow: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
});

export default CategoryCarousel;