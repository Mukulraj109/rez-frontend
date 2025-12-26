// Alliance Store Page
// Partner alliance stores with combined loyalty

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  SafeAreaView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface AllianceStore {
  id: string;
  name: string;
  image: string;
  category: string;
  cashback: string;
  partnerPoints: string;
  alliance: string;
}

const ALLIANCES = [
  { id: 'all', name: 'All', color: '#00C06A' },
  { id: 'tata', name: 'Tata', color: '#00539F' },
  { id: 'reliance', name: 'Reliance', color: '#0055A5' },
  { id: 'aditya', name: 'Aditya Birla', color: '#C7161C' },
];

const MOCK_STORES: AllianceStore[] = [
  { id: '1', name: 'Croma', image: '📱', category: 'Electronics', cashback: '5%', partnerPoints: '2X Neu Coins', alliance: 'tata' },
  { id: '2', name: 'Westside', image: '👗', category: 'Fashion', cashback: '8%', partnerPoints: '2X Neu Coins', alliance: 'tata' },
  { id: '3', name: 'BigBasket', image: '🛒', category: 'Grocery', cashback: '3%', partnerPoints: '1.5X Neu Coins', alliance: 'tata' },
  { id: '4', name: 'Reliance Fresh', image: '🥬', category: 'Grocery', cashback: '4%', partnerPoints: '2X One Points', alliance: 'reliance' },
  { id: '5', name: 'AJIO', image: '👟', category: 'Fashion', cashback: '10%', partnerPoints: '2X One Points', alliance: 'reliance' },
  { id: '6', name: 'Reliance Digital', image: '💻', category: 'Electronics', cashback: '6%', partnerPoints: '2X One Points', alliance: 'reliance' },
  { id: '7', name: 'Pantaloons', image: '👔', category: 'Fashion', cashback: '7%', partnerPoints: '1.5X AB Points', alliance: 'aditya' },
  { id: '8', name: 'More Supermarket', image: '🏪', category: 'Grocery', cashback: '5%', partnerPoints: '2X AB Points', alliance: 'aditya' },
];

export default function AllianceStorePage() {
  const router = useRouter();
  const [selectedAlliance, setSelectedAlliance] = useState('all');

  const filteredStores = selectedAlliance === 'all'
    ? MOCK_STORES
    : MOCK_STORES.filter(s => s.alliance === selectedAlliance);

  const getAllianceColor = (alliance: string) => {
    return ALLIANCES.find(a => a.id === alliance)?.color || Colors.primary[600];
  };

  const renderStore = ({ item }: { item: AllianceStore }) => (
    <TouchableOpacity
      style={styles.storeCard}
      onPress={() => router.push(`/store/${item.id}` as any)}
      activeOpacity={0.8}
    >
      <View style={[styles.allianceBadge, { backgroundColor: getAllianceColor(item.alliance) + '20' }]}>
        <ThemedText style={[styles.allianceText, { color: getAllianceColor(item.alliance) }]}>
          {ALLIANCES.find(a => a.id === item.alliance)?.name}
        </ThemedText>
      </View>
      
      <View style={styles.storeImageContainer}>
        <View style={styles.storeImage}>
          <ThemedText style={styles.storeEmoji}>{item.image}</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.storeName} numberOfLines={1}>{item.name}</ThemedText>
      <ThemedText style={styles.storeCategory} numberOfLines={1}>{item.category}</ThemedText>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <View style={styles.benefitIconContainer}>
            <Ionicons name="wallet" size={12} color={Colors.success} />
          </View>
          <ThemedText style={styles.benefitText} numberOfLines={1}>{item.cashback} Cashback</ThemedText>
        </View>
        <View style={styles.benefitRow}>
          <View style={styles.benefitIconContainer}>
            <Ionicons name="star" size={12} color={Colors.gold} />
          </View>
          <ThemedText style={styles.benefitText} numberOfLines={1}>{item.partnerPoints}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#00C06A" />
      
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        {/* Modern Gradient Header */}
        <LinearGradient
          colors={['#00C06A', '#00A85A', '#00996B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <View style={styles.backButtonInner}>
                <Ionicons name="chevron-back" size={22} color="#00C06A" />
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Alliance Stores</ThemedText>
            </View>
            
            <View style={styles.placeholder} />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="link" size={32} color="#FFF" />
            </View>
            <ThemedText style={styles.heroTitle}>Partner Benefits</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              Earn ReZ Coins + Partner Points together
            </ThemedText>
          </View>
        </LinearGradient>

        {/* Enhanced Filter Tabs */}
        <View style={styles.allianceTabsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.allianceTabs}
          >
            {ALLIANCES.map((alliance, index) => {
              const isActive = selectedAlliance === alliance.id;
              return (
                <TouchableOpacity
                  key={alliance.id}
                  style={[
                    styles.allianceTab,
                    isActive && styles.allianceTabActive,
                    isActive && { backgroundColor: alliance.color },
                  ]}
                  onPress={() => setSelectedAlliance(alliance.id)}
                  activeOpacity={0.8}
                >
                  <ThemedText style={[
                    styles.allianceTabText,
                    isActive && styles.allianceTabTextActive,
                  ]}>
                    {alliance.name}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Store Grid */}
        <FlatList
          data={filteredStores}
          renderItem={renderStore}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.infoCard}>
              <LinearGradient
                colors={['#E6F7F0', '#F0FDF4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.infoCardGradient}
              >
                <View style={styles.infoIconContainer}>
                  <LinearGradient
                    colors={['#00C06A', '#00A85A']}
                    style={styles.infoIconGradient}
                  >
                    <Ionicons name="gift" size={20} color="#FFF" />
                  </LinearGradient>
                </View>
                <View style={styles.infoContent}>
                  <ThemedText style={styles.infoTitle}>Double Rewards</ThemedText>
                  <ThemedText style={styles.infoText}>
                    Shop at alliance stores to earn both ReZ Coins and partner loyalty points
                  </ThemedText>
                </View>
              </LinearGradient>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={64} color={Colors.text.tertiary} />
              <ThemedText style={styles.emptyText}>No stores found</ThemedText>
              <ThemedText style={styles.emptySubtext}>Try selecting a different alliance</ThemedText>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 8 : 12,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    ...Shadows.medium,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.subtle,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Shadows.subtle,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    fontWeight: '500',
  },
  allianceTabsContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  allianceTabs: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  allianceTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    minHeight: 40,
    ...Shadows.subtle,
  },
  allianceTabActive: {
    backgroundColor: Colors.primary[600],
    ...Shadows.medium,
  },
  allianceTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  allianceTabTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
  infoCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.subtle,
  },
  infoCardGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  infoIconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00C06A',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 18,
  },
  storeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
    ...Shadows.subtle,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  allianceBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  allianceText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  storeImageContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  storeImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  storeEmoji: {
    fontSize: 36,
  },
  storeName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
    width: '100%',
  },
  storeCategory: {
    fontSize: 12,
    color: Colors.text.tertiary,
    marginBottom: 12,
    textAlign: 'center',
    width: '100%',
  },
  benefitsContainer: {
    width: '100%',
    gap: 6,
    marginTop: 'auto',
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#F9FAFB',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  benefitIconContainer: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 11,
    color: Colors.text.secondary,
    fontWeight: '600',
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.text.tertiary,
  },
});
