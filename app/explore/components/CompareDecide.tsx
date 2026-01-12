import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import exploreApi, { FeaturedComparison } from '@/services/exploreApi';

const { width } = Dimensions.get('window');

interface CompareOption {
  id: string;
  platform: string;
  price: number;
  delivery: string;
  cashback: string;
  isBest: boolean;
}

const CompareDecide = () => {
  const router = useRouter();
  const [comparison, setComparison] = useState<FeaturedComparison | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedComparison();
  }, []);

  const fetchFeaturedComparison = async () => {
    try {
      const response = await exploreApi.getFeaturedComparison();
      if (response.success && response.data) {
        setComparison(response.data.comparison);
      }
    } catch (error) {
      console.error('[CompareDecide] Error fetching comparison:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  // Build options from comparison stores
  const buildOptions = (): CompareOption[] => {
    if (!comparison || !comparison.stores) return [];

    return comparison.stores.map((store, index) => ({
      id: store.id,
      platform: store.name,
      price: 0, // Price would come from product in real implementation
      delivery: 'Pickup',
      cashback: store.cashbackRate ? `${store.cashbackRate}% back` : 'No cashback',
      isBest: index === 0, // First store is best for now
    }));
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Compare & Decide</Text>
            <Text style={styles.sectionSubtitle}>Same product, best deal</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#00C06A" />
        </View>
      </View>
    );
  }

  // Empty state - show placeholder comparison
  if (!comparison || !comparison.stores || comparison.stores.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Compare & Decide</Text>
            <Text style={styles.sectionSubtitle}>Same product, best deal</Text>
          </View>
          <TouchableOpacity onPress={() => navigateTo('/explore/compare')}>
            <Text style={styles.compareMoreText}>Compare More</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="git-compare-outline" size={32} color="#9CA3AF" />
          <Text style={styles.emptyText}>No comparisons available</Text>
          <Text style={styles.emptySubtext}>Start comparing products to find the best deals</Text>
        </View>
      </View>
    );
  }

  const options = buildOptions();

  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Compare & Decide</Text>
          <Text style={styles.sectionSubtitle}>Same product, best deal</Text>
        </View>
        <TouchableOpacity onPress={() => navigateTo('/explore/compare')}>
          <Text style={styles.compareMoreText}>Compare More</Text>
        </TouchableOpacity>
      </View>

      {/* Compare Card */}
      <View style={styles.compareCard}>
        {/* Product Info */}
        <View style={styles.productRow}>
          <View style={styles.productImagePlaceholder}>
            <Ionicons name="layers-outline" size={32} color="#9CA3AF" />
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{comparison.name}</Text>
            <Text style={styles.optionsCount}>{comparison.stores.length} options available</Text>
          </View>
        </View>

        {/* Options Table */}
        <View style={styles.optionsTable}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionRow,
                option.isBest && styles.optionRowBest,
              ]}
              onPress={() => navigateTo(`/MainStorePage?storeId=${option.id}`)}
            >
              {/* Platform Icon & Name */}
              <View style={styles.platformCell}>
                <View style={[
                  styles.platformIcon,
                  option.isBest && styles.platformIconBest,
                ]}>
                  <Ionicons name="storefront" size={16} color={option.isBest ? '#FFFFFF' : '#6B7280'} />
                </View>
                <View>
                  <Text style={[
                    styles.platformName,
                    option.isBest && styles.platformNameBest,
                  ]}>
                    {option.platform}
                  </Text>
                  <Text style={styles.deliveryText}>{option.delivery}</Text>
                </View>
              </View>

              {/* Cashback */}
              <View style={[
                styles.cashbackCell,
                option.isBest && styles.cashbackCellBest,
                option.cashback === 'No cashback' && styles.cashbackCellNone,
              ]}>
                <Text style={[
                  styles.cashbackText,
                  option.isBest && styles.cashbackTextBest,
                  option.cashback === 'No cashback' && styles.cashbackTextNone,
                ]}>
                  {option.cashback}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* View All Options Button */}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => navigateTo('/explore/compare')}
        >
          <Text style={styles.viewAllText}>View All Options</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 24,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    marginHorizontal: 16,
    paddingVertical: 40,
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  compareMoreText: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
  compareCard: {
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  productImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInfo: {
    marginLeft: 14,
    flex: 1,
  },
  productName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0B2240',
  },
  optionsCount: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  optionsTable: {
    gap: 8,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  optionRowBest: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#00C06A',
  },
  platformCell: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  platformIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformIconBest: {
    backgroundColor: '#00C06A',
  },
  platformName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  platformNameBest: {
    color: '#0B2240',
  },
  deliveryText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  cashbackCell: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 75,
    alignItems: 'center',
  },
  cashbackCellBest: {
    backgroundColor: '#00C06A',
  },
  cashbackCellNone: {
    backgroundColor: '#F3F4F6',
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  cashbackTextBest: {
    color: '#FFFFFF',
  },
  cashbackTextNone: {
    color: '#9CA3AF',
  },
  viewAllButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});

export default CompareDecide;
