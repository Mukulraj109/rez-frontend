import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface ProductDetailsProps {
  title?: string;
  description?: string;
  location?: string;
  distance?: string;
  isOpen?: boolean;
  openText?: string;
}

export default function ProductDetails({
  title = "Little Big Comfort Tee",
  description = "Little Big Comfort Tee offers a perfect blend of relaxed fit and soft fabric for all-day comfort and effortless style",
  location = "BTM",
  distance = "0.7 Km",
  isOpen = true,
  openText = "• open"
}: ProductDetailsProps) {
  const { width } = Dimensions.get('window');
  const isSmallScreen = width < 360;

  return (
    <View style={styles.container}>
      {/* Product Title */}
      <ThemedText style={[
        styles.title,
        { fontSize: isSmallScreen ? 22 : 24 }
      ]}>
        {title}
      </ThemedText>

      {/* Product Description */}
      <ThemedText style={[
        styles.description,
        { fontSize: isSmallScreen ? 14 : 15 }
      ]}>
        {description}
      </ThemedText>

      {/* Price and Location Row */}
      <View style={styles.infoRow}>
        {/* Price */}

        {/* Location Info */}
        <View style={styles.locationContainer}>
          <View style={styles.locationInfo}>
            <Ionicons 
              name="location" 
              size={16} 
              color="#8B5CF6" 
              style={styles.locationIcon}
            />
            <ThemedText style={styles.locationText}>
              {distance}, {location}
            </ThemedText>
            
            {/* Open Status */}
            {isOpen && (
              <View style={styles.openBadge}>
                <ThemedText style={styles.openText}>
                  {openText}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontWeight: '700',
    color: '#1F2937',
    lineHeight: 32,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  infoRow: {
    flexDirection: 'column',
    gap: 12,
  },
  priceContainer: {
    alignSelf: 'flex-start',
  },
  price: {
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  locationContainer: {
    alignSelf: 'flex-start',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  locationIcon: {
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '500',
    marginRight: 8,
  },
  openBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  openText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});