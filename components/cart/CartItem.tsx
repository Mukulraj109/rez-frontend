import React, { useRef } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CartItemProps } from '@/types/cart';
import { useStockStatus } from '@/hooks/useStockStatus';

export default function CartItem({
  item,
  onRemove,
  onUpdateQuantity,
  showAnimation = true,
}: CartItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Stock status
  const stock = item.inventory?.stock ?? (item.availabilityStatus === 'out_of_stock' ? 0 : 100);
  const lowStockThreshold = item.inventory?.lowStockThreshold ?? 5;
  const { isOutOfStock, isLowStock, stockMessage } = useStockStatus({
    stock,
    lowStockThreshold,
  });

  const isAtMaxStock = (item.quantity || 1) >= stock;

  const handleDelete = () => {
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
        onRemove(item.id);
      });
    } else {
      onRemove(item.id);
    }
  };

  const handlePress = () => {
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
    ]).start();
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
      ]}
    >
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardTouchable}
          onPress={handlePress}
          activeOpacity={0.95}
          accessibilityLabel={`${item.name}, ${item.price} rupees`}
          accessibilityRole="button"
        >
          {/* Product Image */}
          <View style={styles.imageContainer}>
            {item.image && typeof item.image === 'string' && item.image.trim() !== '' ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
                onError={(e) => {
                  console.log('🖼️ Failed to load image:', item.image);
                  console.log('🖼️ Error details:', e.nativeEvent.error);
                }}
              />
            ) : (
              <View style={[styles.productImage, styles.placeholderImage]}>
                <Ionicons name="image-outline" size={32} color="#9CA3AF" />
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.infoContainer}>
            <ThemedText
              style={[
                styles.productName,
                { fontSize: isSmallScreen ? 14 : 15 },
              ]}
              numberOfLines={2}
            >
              {item.name}
            </ThemedText>
            <ThemedText
              style={[
                styles.productPrice,
                { fontSize: isSmallScreen ? 14 : 15 },
              ]}
            >
              ₹{item.price?.toLocaleString('en-IN') || 0}
            </ThemedText>
            {/* Stock Warning */}
            {(isLowStock || isOutOfStock) && (
              <View style={[
                styles.stockWarning,
                isOutOfStock ? styles.stockWarningError : styles.stockWarningLow
              ]}>
                <Ionicons
                  name={isOutOfStock ? 'close-circle' : 'alert-circle'}
                  size={12}
                  color={isOutOfStock ? '#DC2626' : '#D97706'}
                />
                <ThemedText style={[
                  styles.stockWarningText,
                  isOutOfStock ? styles.stockWarningTextError : styles.stockWarningTextLow
                ]}>
                  {stockMessage}
                </ThemedText>
              </View>
            )}
            {item.cashback && (
              <View style={styles.cashbackBadge}>
                <ThemedText style={styles.cashbackText}>
                  {item.cashback}
                </ThemedText>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Quantity Controls */}
        {onUpdateQuantity && (
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => {
                if (item.quantity && item.quantity > 1) {
                  onUpdateQuantity(item.id, item.quantity - 1);
                } else {
                  handleDelete();
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={item.quantity && item.quantity > 1 ? "remove" : "trash-outline"}
                size={18}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            <View style={styles.quantityDisplay}>
              <ThemedText style={styles.quantityText}>{item.quantity || 1}</ThemedText>
            </View>

            <TouchableOpacity
              style={[
                styles.quantityButton,
                isAtMaxStock && styles.quantityButtonDisabled
              ]}
              onPress={() => {
                if (!isAtMaxStock) {
                  onUpdateQuantity(item.id, (item.quantity || 1) + 1);
                }
              }}
              activeOpacity={isAtMaxStock ? 1 : 0.7}
              disabled={isAtMaxStock}
            >
              <Ionicons
                name="add"
                size={18}
                color={isAtMaxStock ? 'rgba(255, 255, 255, 0.5)' : '#FFFFFF'}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Delete Button - Show only if no quantity controls */}
        {!onUpdateQuantity && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            activeOpacity={0.75}
            accessibilityLabel="Remove item from cart"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    minHeight: 84,
  },
  cardTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  productName: {
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  productPrice: {
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F3E8FF',
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  cashbackText: {
    color: '#7C3AED',
    fontWeight: '500',
    fontSize: 12,
  },
  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  stockWarningLow: {
    backgroundColor: '#FEF3C7',
  },
  stockWarningError: {
    backgroundColor: '#FEE2E2',
  },
  stockWarningText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stockWarningTextLow: {
    color: '#D97706',
  },
  stockWarningTextError: {
    color: '#DC2626',
  },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 8,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  quantityText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
});
