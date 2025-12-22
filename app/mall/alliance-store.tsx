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
  { id: 'all', name: 'All' },
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
    >
      <View style={[styles.allianceBadge, { backgroundColor: getAllianceColor(item.alliance) + '20' }]}>
        <ThemedText style={[styles.allianceText, { color: getAllianceColor(item.alliance) }]}>
          {ALLIANCES.find(a => a.id === item.alliance)?.name}
        </ThemedText>
      </View>
      <View style={styles.storeImage}>
        <ThemedText style={styles.storeEmoji}>{item.image}</ThemedText>
      </View>
      <ThemedText style={styles.storeName}>{item.name}</ThemedText>
      <ThemedText style={styles.storeCategory}>{item.category}</ThemedText>

      <View style={styles.benefitsContainer}>
        <View style={styles.benefitRow}>
          <Ionicons name="wallet" size={14} color={Colors.success} />
          <ThemedText style={styles.benefitText}>{item.cashback} Cashback</ThemedText>
        </View>
        <View style={styles.benefitRow}>
          <Ionicons name="star" size={14} color={Colors.gold} />
          <ThemedText style={styles.benefitText}>{item.partnerPoints}</ThemedText>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Alliance Stores</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.heroSection}>
          <Ionicons name="link" size={40} color="#FFF" />
          <ThemedText style={styles.heroTitle}>Partner Benefits</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Earn ReZ Coins + Partner Points together
          </ThemedText>
        </View>
      </LinearGradient>

      <View style={styles.allianceTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {ALLIANCES.map(alliance => (
            <TouchableOpacity
              key={alliance.id}
              style={[
                styles.allianceTab,
                selectedAlliance === alliance.id && styles.allianceTabActive,
                selectedAlliance === alliance.id && alliance.color && { backgroundColor: alliance.color },
              ]}
              onPress={() => setSelectedAlliance(alliance.id)}
            >
              <ThemedText style={[
                styles.allianceTabText,
                selectedAlliance === alliance.id && styles.allianceTabTextActive,
              ]}>
                {alliance.name}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

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
            <View style={styles.infoIcon}>
              <Ionicons name="gift" size={24} color={Colors.primary[600]} />
            </View>
            <View style={styles.infoContent}>
              <ThemedText style={styles.infoTitle}>Double Rewards</ThemedText>
              <ThemedText style={styles.infoText}>
                Shop at alliance stores to earn both ReZ Coins and partner loyalty points
              </ThemedText>
            </View>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h2,
    color: '#FFF',
    marginTop: Spacing.md,
  },
  heroSubtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.9)',
  },
  allianceTabs: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  allianceTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  allianceTabActive: {
    backgroundColor: Colors.primary[600],
  },
  allianceTabText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  allianceTabTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  row: {
    justifyContent: 'space-between',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: Colors.primary[50],
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  infoIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    ...Typography.label,
    color: Colors.primary[600],
    marginBottom: Spacing.xs,
  },
  infoText: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  storeCard: {
    width: '48%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    alignItems: 'center',
    position: 'relative',
    ...Shadows.subtle,
  },
  allianceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  allianceText: {
    ...Typography.caption,
    fontSize: 9,
    fontWeight: '700',
  },
  storeImage: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  storeEmoji: {
    fontSize: 32,
  },
  storeName: {
    ...Typography.label,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  storeCategory: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  benefitsContainer: {
    width: '100%',
    gap: Spacing.xs,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  benefitText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
});
