import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { productApi, HomepageProduct } from '@/services/productApi';

const { width: screenWidth } = Dimensions.get('window');
// Parent content has padding: 20 on each side, so available width is screenWidth - 40
const PARENT_PADDING = 20;
const CARD_GAP = 12;
const AVAILABLE_WIDTH = screenWidth - (PARENT_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

interface HotDealProduct extends HomepageProduct {
  cashbackPercentage?: number;
}

interface HotDealsSectionProps {
  title?: string;
  limit?: number;
}

function HotDealsSection({
  title = 'Hot deals',
  limit = 10,
}: HotDealsSectionProps) {
  const router = useRouter();
  const [products, setProducts] = useState<HotDealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotDeals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getHotDeals({ limit });

      if (response.success && response.data) {
        setProducts(response.data as HotDealProduct[]);
      } else {
        setError('Failed to load hot deals');
      }
    } catch (err) {
      setError('Failed to load hot deals');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchHotDeals();
  }, [fetchHotDeals]);

  const handleViewAll = () => {
    router.push('/search?sortBy=cashback');
  };

  const handleProductPress = (product: HotDealProduct) => {
    const productId = product._id || product.id;
    router.push(`/ProductPage?cardId=${productId}&cardType=product`);
  };

  const renderProduct = useCallback(({ item, index }: { item: HotDealProduct; index: number }) => {
    const storeName = item.store?.name || 'Store';
    const cashback = item.cashbackPercentage || item.discount || 0;

    // Format deal text like in the screenshot
    const dealText = cashback > 0
      ? `${storeName}: ${cashback}% cashback sale`
      : `${storeName}: Special offer`;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.85}
      >
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image || 'https://via.placeholder.com/200' }}
            style={styles.productImage}
            resizeMode="cover"
          />
          {/* Cashback Badge */}
          {cashback > 0 && (
            <View style={styles.cashbackBadge}>
              <ThemedText style={styles.cashbackBadgeText}>
                {cashback}% OFF
              </ThemedText>
            </View>
          )}
        </View>

        {/* Card Content */}
        <View style={styles.cardContent}>
          <ThemedText style={styles.dealText} numberOfLines={2}>
            {dealText}
          </ThemedText>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback((item: HotDealProduct, index: number) =>
    (item._id || item.id || `hotdeal-${index}`), []);

  // Don't render if no products and not loading
  if (!loading && products.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleViewAll}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.viewAllText}>View all</ThemedText>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00C06A" />
          <ThemedText style={styles.loadingText}>Fetching hot deals...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchHotDeals}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={keyExtractor}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          initialNumToRender={6}
          maxToRenderPerBatch={8}
          ItemSeparatorComponent={() => <View style={styles.rowSeparator} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 28,
    marginBottom: 24,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B2240',
    fontFamily: 'Poppins-Bold',
  },
  viewAllButton: {
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 192, 106, 0.2)',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
    fontFamily: 'Inter-SemiBold',
  },
  listContent: {
    // No padding needed - parent content View already has padding: 20
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  rowSeparator: {
    height: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'visible',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    ...Platform.select({
      ios: {
        shadowColor: '#0B2240',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 12px rgba(11, 34, 64, 0.08)',
      },
    }),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  cashbackBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFC857',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC857',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  cashbackBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0B2240',
    letterSpacing: 0.3,
  },
  cardContent: {
    padding: 14,
    minHeight: 60,
    justifyContent: 'center',
  },
  dealText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    lineHeight: 20,
    fontFamily: 'Inter-SemiBold',
  },
  loadingContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9AA7B2',
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#00C06A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#00C06A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default memo(HotDealsSection);
