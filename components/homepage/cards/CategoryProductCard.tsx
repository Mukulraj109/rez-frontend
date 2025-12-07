import React, { memo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Image,
  View,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { HomepageProduct } from '@/services/productApi';
import { LinearGradient } from 'expo-linear-gradient';

interface CategoryProductCardProps {
  product: HomepageProduct;
  width?: number;
}

function CategoryProductCard({
  product,
  width = 156,
}: CategoryProductCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/ProductPage?cardId=${product._id || product.id}&cardType=product`);
  };

  // Get cashback percentage
  const cashbackPercentage = product.cashbackPercentage || 0;
  const hasCashback = cashbackPercentage > 0;

  return (
    <TouchableOpacity
      style={[styles.container, { width }]}
      onPress={handlePress}
      activeOpacity={0.85}
    >
      <View style={styles.card}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: product.image || 'https://via.placeholder.com/160x140?text=No+Image'
            }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Cashback Badge - Top Right */}
          {hasCashback && (
            <View style={styles.cashbackBadge}>
              <LinearGradient
                colors={['#00C06A', '#00796B']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cashbackGradient}
              >
                <ThemedText style={styles.cashbackBadgeText}>
                  {cashbackPercentage}%
                </ThemedText>
              </LinearGradient>
            </View>
          )}

          {/* Subtle overlay gradient at bottom of image */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.03)']}
            style={styles.imageOverlay}
          />
        </View>

        {/* Product Details */}
        <View style={styles.content}>
          <ThemedText style={styles.productName} numberOfLines={2}>
            {product.name}
          </ThemedText>

          {/* Cashback Pill */}
          <View style={styles.cashbackPill}>
            <View style={styles.coinIcon}>
              <ThemedText style={styles.coinText}>₹</ThemedText>
            </View>
            <ThemedText style={styles.cashbackPillText}>
              {hasCashback ? `Upto ${cashbackPercentage}% back` : 'Cashback'}
            </ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(11, 34, 64, 0.06), 0 12px 28px rgba(11, 34, 64, 0.1)',
      },
    }),
  },
  imageContainer: {
    position: 'relative',
    height: 130,
    width: '100%',
    backgroundColor: '#F7FAFC',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 30,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 8,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  cashbackGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cashbackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    letterSpacing: 0.2,
  },
  content: {
    padding: 12,
    paddingTop: 10,
    paddingBottom: 14,
    height: 80,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0B2240',
    fontFamily: 'Inter',
    lineHeight: 18,
    letterSpacing: -0.1,
    height: 36,
  },
  cashbackPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.15)',
  },
  coinIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFC857',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  coinText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0B2240',
  },
  cashbackPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00796B',
    fontFamily: 'Inter',
  },
});

export default memo(CategoryProductCard);
