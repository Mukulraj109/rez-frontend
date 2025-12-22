// Nearby Hotspots Page
// Location-based popular areas

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Hotspot {
  id: string;
  name: string;
  type: 'mall' | 'market' | 'street' | 'area';
  distance: string;
  stores: number;
  offers: number;
  image: string;
  trending: boolean;
}

const MOCK_HOTSPOTS: Hotspot[] = [
  { id: '1', name: 'Phoenix Marketcity', type: 'mall', distance: '1.2 km', stores: 120, offers: 45, image: '🏬', trending: true },
  { id: '2', name: 'Linking Road', type: 'market', distance: '0.8 km', stores: 80, offers: 32, image: '🛍️', trending: true },
  { id: '3', name: 'Hill Road', type: 'street', distance: '1.5 km', stores: 65, offers: 28, image: '🚶', trending: false },
  { id: '4', name: 'Inorbit Mall', type: 'mall', distance: '2.3 km', stores: 95, offers: 38, image: '🏢', trending: true },
  { id: '5', name: 'Colaba Causeway', type: 'market', distance: '3.8 km', stores: 150, offers: 52, image: '🌆', trending: false },
  { id: '6', name: 'Lokhandwala Market', type: 'area', distance: '4.2 km', stores: 70, offers: 25, image: '🏘️', trending: false },
];

type ViewMode = 'list' | 'map';

export default function HotspotsPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const types = [
    { id: null, label: 'All' },
    { id: 'mall', label: 'Malls' },
    { id: 'market', label: 'Markets' },
    { id: 'street', label: 'Streets' },
    { id: 'area', label: 'Areas' },
  ];

  const filteredHotspots = selectedType
    ? MOCK_HOTSPOTS.filter(h => h.type === selectedType)
    : MOCK_HOTSPOTS;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mall': return 'business';
      case 'market': return 'cart';
      case 'street': return 'walk';
      case 'area': return 'map';
      default: return 'location';
    }
  };

  const renderHotspot = ({ item }: { item: Hotspot }) => (
    <TouchableOpacity
      style={styles.hotspotCard}
      onPress={() => router.push(`/hotspot/${item.id}` as any)}
    >
      {item.trending && (
        <View style={styles.trendingBadge}>
          <Ionicons name="flame" size={12} color="#FFF" />
          <ThemedText style={styles.trendingText}>Trending</ThemedText>
        </View>
      )}

      <View style={styles.hotspotImage}>
        <ThemedText style={styles.hotspotEmoji}>{item.image}</ThemedText>
      </View>

      <View style={styles.hotspotInfo}>
        <View style={styles.hotspotHeader}>
          <ThemedText style={styles.hotspotName}>{item.name}</ThemedText>
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate" size={12} color={Colors.primary[600]} />
            <ThemedText style={styles.distanceText}>{item.distance}</ThemedText>
          </View>
        </View>

        <View style={styles.typeBadge}>
          <Ionicons name={getTypeIcon(item.type) as any} size={12} color={Colors.text.secondary} />
          <ThemedText style={styles.typeText}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </ThemedText>
        </View>

        <View style={styles.hotspotStats}>
          <View style={styles.statItem}>
            <Ionicons name="storefront-outline" size={14} color={Colors.text.tertiary} />
            <ThemedText style={styles.statText}>{item.stores} stores</ThemedText>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="pricetag-outline" size={14} color={Colors.success} />
            <ThemedText style={[styles.statText, { color: Colors.success }]}>
              {item.offers} offers
            </ThemedText>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.directionsButton}>
        <Ionicons name="navigate-circle" size={32} color={Colors.primary[600]} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <View style={styles.mapPlaceholder}>
        <Ionicons name="map" size={64} color={Colors.text.tertiary} />
        <ThemedText style={styles.mapPlaceholderText}>Map View</ThemedText>
        <ThemedText style={styles.mapPlaceholderSubtext}>
          Interactive map with hotspot markers
        </ThemedText>
      </View>

      {/* Floating Hotspot Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mapCardsScroll}
        contentContainerStyle={styles.mapCardsContainer}
      >
        {filteredHotspots.map(hotspot => (
          <TouchableOpacity
            key={hotspot.id}
            style={styles.mapCard}
            onPress={() => router.push(`/hotspot/${hotspot.id}` as any)}
          >
            <View style={styles.mapCardImage}>
              <ThemedText style={styles.mapCardEmoji}>{hotspot.image}</ThemedText>
            </View>
            <View style={styles.mapCardInfo}>
              <ThemedText style={styles.mapCardName}>{hotspot.name}</ThemedText>
              <ThemedText style={styles.mapCardDistance}>{hotspot.distance}</ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
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
          <ThemedText style={styles.headerTitle}>Nearby Hotspots</ThemedText>
          <View style={styles.viewToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Ionicons
                name="list"
                size={18}
                color={viewMode === 'list' ? Colors.primary[600] : '#FFF'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
              onPress={() => setViewMode('map')}
            >
              <Ionicons
                name="map"
                size={18}
                color={viewMode === 'map' ? Colors.primary[600] : '#FFF'}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.locationBar}>
          <Ionicons name="location" size={18} color={Colors.gold} />
          <ThemedText style={styles.locationText}>Bandra West, Mumbai</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.changeLocation}>Change</ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Type Filter */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {types.map(type => (
            <TouchableOpacity
              key={type.id || 'all'}
              style={[
                styles.filterChip,
                selectedType === type.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <ThemedText style={[
                styles.filterChipText,
                selectedType === type.id && styles.filterChipTextActive,
              ]}>
                {type.label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={filteredHotspots}
          renderItem={renderHotspot}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.summaryCard}>
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>{filteredHotspots.length}</ThemedText>
                <ThemedText style={styles.summaryLabel}>Hotspots</ThemedText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>
                  {filteredHotspots.reduce((sum, h) => sum + h.stores, 0)}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Stores</ThemedText>
              </View>
              <View style={styles.summaryDivider} />
              <View style={styles.summaryItem}>
                <ThemedText style={styles.summaryValue}>
                  {filteredHotspots.reduce((sum, h) => sum + h.offers, 0)}
                </ThemedText>
                <ThemedText style={styles.summaryLabel}>Offers</ThemedText>
              </View>
            </View>
          }
        />
      ) : (
        renderMapView()
      )}
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
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  toggleButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  toggleButtonActive: {
    backgroundColor: '#FFF',
  },
  locationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  locationText: {
    ...Typography.body,
    color: '#FFF',
    flex: 1,
  },
  changeLocation: {
    ...Typography.label,
    color: Colors.gold,
  },
  filterContainer: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.primary,
    marginRight: Spacing.sm,
    ...Shadows.subtle,
  },
  filterChipActive: {
    backgroundColor: Colors.primary[600],
  },
  filterChipText: {
    ...Typography.label,
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    ...Typography.h3,
    color: Colors.primary[600],
  },
  summaryLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: Colors.border.light,
  },
  hotspotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    position: 'relative',
    ...Shadows.subtle,
  },
  trendingBadge: {
    position: 'absolute',
    top: 0,
    left: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.error,
    borderBottomLeftRadius: BorderRadius.sm,
    borderBottomRightRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  trendingText: {
    ...Typography.caption,
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  hotspotImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotspotEmoji: {
    fontSize: 30,
  },
  hotspotInfo: {
    flex: 1,
  },
  hotspotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  hotspotName: {
    ...Typography.label,
    color: Colors.text.primary,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    ...Typography.caption,
    color: Colors.primary[600],
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  typeText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  hotspotStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  directionsButton: {
    padding: Spacing.xs,
  },
  mapContainer: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapPlaceholderText: {
    ...Typography.h3,
    color: Colors.text.tertiary,
    marginTop: Spacing.md,
  },
  mapPlaceholderSubtext: {
    ...Typography.body,
    color: Colors.text.tertiary,
  },
  mapCardsScroll: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: 0,
    right: 0,
  },
  mapCardsContainer: {
    paddingHorizontal: Spacing.base,
  },
  mapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginRight: Spacing.md,
    width: 200,
    ...Shadows.medium,
  },
  mapCardImage: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  mapCardEmoji: {
    fontSize: 24,
  },
  mapCardInfo: {
    flex: 1,
  },
  mapCardName: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  mapCardDistance: {
    ...Typography.caption,
    color: Colors.primary[600],
  },
});
