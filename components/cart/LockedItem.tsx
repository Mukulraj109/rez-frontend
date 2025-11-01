import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';

interface LockedItemProps {
  item: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    image?: string;
    store?: string;
    variant?: {
      type?: string;
      value?: string;
    };
    lockedAt: Date;
    expiresAt: Date;
    notes?: string;
    productId?: string;
  };
  onMoveToCart: (id: string, productId: string) => void;
  onUnlock: (id: string, productId: string) => void;
  showAnimation?: boolean;
}

export default function LockedItem({
  item,
  onMoveToCart,
  onUnlock,
  showAnimation = true,
}: LockedItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Calculate time remaining
  const now = new Date();
  const timeRemaining = item.expiresAt.getTime() - now.getTime();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const isExpired = timeRemaining <= 0;

  const handleUnlock = () => {
    if (showAnimation) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onUnlock(item.id, item.productId || item.id);
      });
    } else {
      onUnlock(item.id, item.productId || item.id);
    }
  };

  const handleMoveToCart = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onMoveToCart(item.id, item.productId || item.id);
    });
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
          marginHorizontal: isSmallScreen ? 12 : 16,
        },
        isExpired && styles.expiredContainer,
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} style={styles.itemContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.productImage, styles.placeholderImage]}>
              <Ionicons name="image-outline" size={32} color="#9CA3AF" />
            </View>
          )}
          {/* Lock Badge */}
          <View style={styles.lockBadge}>
            <Ionicons name="lock-closed" size={12} color="#fff" />
          </View>
        </View>

        {/* Product Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.headerRow}>
            <View style={styles.nameContainer}>
              <ThemedText style={styles.productName} numberOfLines={2}>
                {item.name}
              </ThemedText>
              {item.store && (
                <ThemedText style={styles.storeName} numberOfLines={1}>
                  {item.store}
                </ThemedText>
              )}
            </View>

            {/* Delete Icon */}
            <TouchableOpacity
              onPress={handleUnlock}
              style={styles.deleteButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close-circle" size={24} color="#EF4444" />
            </TouchableOpacity>
          </View>

          {/* Variant */}
          {item.variant && item.variant.type && (
            <View style={styles.variantContainer}>
              <ThemedText style={styles.variantText}>
                {item.variant.type}: {item.variant.value}
              </ThemedText>
            </View>
          )}

          {/* Timer */}
          <View style={[styles.timerContainer, isExpired && styles.expiredTimer]}>
            <Ionicons
              name="time-outline"
              size={14}
              color={isExpired ? '#EF4444' : '#F59E0B'}
            />
            <ThemedText style={[styles.timerText, isExpired && styles.expiredTimerText]}>
              {isExpired
                ? 'Expired'
                : `${hoursRemaining}h ${minutesRemaining}m remaining`}
            </ThemedText>
          </View>

          {/* Price and Actions */}
          <View style={styles.bottomRow}>
            <View style={styles.priceContainer}>
              <ThemedText style={styles.price}>₹{item.price}</ThemedText>
              {item.originalPrice && item.originalPrice > item.price && (
                <ThemedText style={styles.originalPrice}>
                  ₹{item.originalPrice}
                </ThemedText>
              )}
              <View style={styles.quantityBadge}>
                <ThemedText style={styles.quantityText}>Qty: {item.quantity}</ThemedText>
              </View>
            </View>

            {/* Move to Cart Button */}
            {!isExpired && (
              <TouchableOpacity
                onPress={handleMoveToCart}
                style={styles.moveButtonWrapper}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#8B5CF6', '#7C3AED']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.moveButton}
                >
                  <Ionicons name="cart" size={16} color="#fff" />
                  <ThemedText style={styles.moveButtonText}>Move to Cart</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  expiredContainer: {
    opacity: 0.6,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  nameContainer: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  storeName: {
    fontSize: 12,
    color: '#6B7280',
  },
  deleteButton: {
    padding: 2,
  },
  variantContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  variantText: {
    fontSize: 11,
    color: '#6B7280',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  expiredTimer: {
    backgroundColor: '#FEE2E2',
  },
  timerText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
    marginLeft: 4,
  },
  expiredTimerText: {
    color: '#DC2626',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  quantityBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quantityText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '500',
  },
  moveButtonWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  moveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  moveButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
