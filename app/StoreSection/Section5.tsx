import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import wishlistApi from '@/services/wishlistApi';

interface Section5Props {
  dynamicData?: {
    id?: string;
    _id?: string;
    title?: string;
    name?: string;
    price?: number;
    pricing?: {
      selling?: number;
    };
  } | null;
  cardType?: string;
}

export default function Section5({ dynamicData, cardType }: Section5Props) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveDeal = async () => {
    try {
      setIsSaving(true);

      const productId = dynamicData?.id || dynamicData?._id;
      if (!productId) {
        Alert.alert('Error', 'Product information not available');
        return;
      }

      // Add to wishlist/saved deals
      const response = await wishlistApi.addToWishlist({
        itemType: 'product',
        itemId: productId,
        notes: `Saved at ₹${dynamicData?.price || dynamicData?.pricing?.selling || 0}`,
        priority: 'medium'
      });

      if (response.success) {
        Alert.alert(
          'Deal Saved!',
          `${dynamicData?.title || dynamicData?.name || 'This deal'} has been saved to your wishlist`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to save deal');
      }
    } catch (error) {
      console.error('Save deal error:', error);
      Alert.alert('Error', 'Unable to save deal. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.button, isSaving && styles.buttonDisabled]}
        onPress={handleSaveDeal}
        disabled={isSaving}
      >
        <View style={styles.iconContainer}>
          <ThemedText style={styles.icon}>{isSaving ? '⏳' : '🔄'}</ThemedText>
        </View>
        <View style={styles.textContainer}>
          <ThemedText style={styles.title}>
            {isSaving ? 'Saving...' : 'Save Deal for Later'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Keep this offer saved in your list
          </ThemedText>
        </View>
      </TouchableOpacity>
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e8e6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icon: {
    fontSize: 24,
    color: '#6c63ff',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
});
