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

export default function CartItem({
  item,
  onRemove,
  showAnimation = true,
}: CartItemProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

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
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.95}
        accessibilityLabel={`${item.name}, ${item.price} rupees`}
        accessibilityRole="button"
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={
              typeof item.image === 'string'
                ? { uri: item.image }
                : item.image
            }
            style={styles.productImage}
            resizeMode="cover"
            defaultSource={require('@/assets/images/icon.png')}
          />
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <ThemedText
            style={[
              styles.productName,
              { fontSize: isSmallScreen ? 15 : 16 },
            ]}
          >
            {item.name}
          </ThemedText>
          <ThemedText
            style={[
              styles.productPrice,
              { fontSize: isSmallScreen ? 14 : 15 },
            ]}
          >
            ₹{item.price}
          </ThemedText>
          <View style={styles.cashbackBadge}>
            <ThemedText style={styles.cashbackText}>
              {item.cashback}
            </ThemedText>
          </View>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.75}
          accessibilityLabel="Remove item from cart"
          accessibilityRole="button"
        >
          <Ionicons name="trash-outline" size={20} color="#8B5CF6" />
        </TouchableOpacity>
      </TouchableOpacity>
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
});
