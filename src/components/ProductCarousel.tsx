import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

interface Product {
  id: string;
  brand: string;
  title: string;
  subtitle: string;
  image: string;
  cashback: number;
}

const products: Product[] = [
  {
    id: '1',
    brand: 'Zara',
    title: 'Power',
    subtitle: 'Your Rules',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=300&h=400&fit=crop',
    cashback: 10,
  },
  {
    id: '2',
    brand: 'Zara',
    title: 'Elegance',
    subtitle: 'Redefined',
    image:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop',
    cashback: 12,
  },
  {
    id: '3',
    brand: 'Zara',
    title: 'Style',
    subtitle: 'Statement',
    image:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&h=400&fit=crop',
    cashback: 15,
  },
];

const ProductCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / CARD_WIDTH);
    setActiveIndex(index);
  };

  const renderProduct = (product: Product) => (
    <TouchableOpacity
      key={product.id}
      style={[styles.productCard, { width: CARD_WIDTH }]}
      activeOpacity={0.95}
    >
      <ImageBackground
        source={{ uri: product.image }}
        style={styles.productImage}
        imageStyle={styles.imageStyle}
      >
        {/* Dark gradient overlay */}
        <LinearGradient
          colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.6)']}
          style={styles.overlay}
        >
          {/* Brand Name */}
          <Text style={styles.brandText}>{product.brand}</Text>

          {/* Cashback Ribbon */}
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>CASHBACK {product.cashback}%</Text>
          </View>

          {/* Title + Subtitle */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{product.title}</Text>
            <Text style={styles.subtitle}>{product.subtitle}</Text>
          </View>

          {/* Cashback + Arrow */}
          <TouchableOpacity style={styles.bottomButton}>
            <Text style={styles.cashbackInfo}>
              Cashback upto {product.cashback} %
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  const renderDots = () => (
    <View style={styles.dotsContainer}>
      {products.map((_, index) => (
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

  return (
    <View style={styles.container}>
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
        {products.map(renderProduct)}
      </ScrollView>
      {renderDots()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
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

export default ProductCarousel;
