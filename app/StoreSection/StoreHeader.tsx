import React from 'react';
import { View, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons , MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function StoreHeader() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const textColor = useThemeColor({}, 'text');
  
  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(99, 102, 241, 0.1)', 'rgba(139, 92, 246, 0.05)', 'transparent']}
        style={styles.gradientOverlay}
      />
      
      {/* Header actions */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.iconButton, { backgroundColor: surfaceColor }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={textColor} />
        </TouchableOpacity>
        
        <View style={styles.centerInfo}>
          <TouchableOpacity 
            style={[styles.ratingBadge, { backgroundColor: primaryColor }]}
            onPress={() => router.push('/CoinPage')}
          >
            <Ionicons name="star" size={16} color="#FFD700" />
            <ThemedText style={styles.ratingText}>382</ThemedText>
          </TouchableOpacity>
        </View>
        
        <View style={styles.rightIcons}>
          <TouchableOpacity 
            style={[styles.iconButton, { backgroundColor: surfaceColor }]}
            onPress={() => router.push('/CartPage')}
          >
            <Ionicons name="bag-outline" size={20} color={textColor} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { backgroundColor: surfaceColor }]}>
            <Ionicons name="heart-outline" size={20} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Product / Store image */}
      <View style={[styles.productImageContainer, { backgroundColor: surfaceColor }]}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?w=800&h=800&fit=crop' }} 
          style={styles.productImage} 
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.4)']}
          style={styles.imageGradient}
        />
        
        {/* Brand icon badge */}
        <View style={[styles.brandBadge, { backgroundColor: 'rgba(255, 255, 255, 0.95)' }]}>
          <Ionicons name="storefront" size={18} color={primaryColor} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative' },
  gradientOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 120, zIndex: 1,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 16, paddingTop: 50, zIndex: 2,
  },
  iconButton: {
    width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4,
  },
  centerInfo: { alignItems: 'center' },
  ratingBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 25,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4, gap: 4,
  },
  ratingText: { fontSize: 14, fontWeight: '700', color: '#ffffff' },
  rightIcons: { flexDirection: 'row', gap: 12 },
  productImageContainer: {
    position: 'relative', height: 340, marginHorizontal: 20, borderRadius: 24, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 8,
  },
  productImage: { width: '100%', height: '100%' },
  imageGradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 140 },
  brandBadge: {
    position: 'absolute', bottom: 20, left: 20, width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
  },
  textOverlay: {
    position: 'absolute', bottom: 20, left: 80, paddingRight: 20,
  },
  storeName: {
    fontSize: 20, fontWeight: '700', color: '#fff',
  },
  storeCategory: {
    fontSize: 14, color: '#eee', marginTop: 2,
  },
});
