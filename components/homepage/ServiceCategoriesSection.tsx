import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import serviceCategoriesApi, { ServiceCategory } from '@/services/serviceCategoriesApi';

const { width: screenWidth } = Dimensions.get('window');
const PARENT_PADDING = 20;
const CARD_GAP = 12;
const AVAILABLE_WIDTH = screenWidth - (PARENT_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

interface ServiceCategoriesSectionProps {
  title?: string;
}

// Service Category Card Component
const ServiceCategoryCard = memo(({
  category,
  onPress
}: {
  category: ServiceCategory;
  onPress: () => void;
}) => {
  const renderIcon = () => {
    // Safely get icon - ensure it's a string
    const iconValue = typeof category.icon === 'string' ? category.icon : '🔧';

    if (category.iconType === 'url' && iconValue && iconValue.startsWith('http')) {
      return (
        <Image
          source={{ uri: iconValue }}
          style={styles.categoryIcon}
          resizeMode="contain"
        />
      );
    }
    // For emoji or icon-name, display as text
    return (
      <ThemedText style={styles.categoryEmoji}>
        {iconValue}
      </ThemedText>
    );
  };

  // Safely get name and cashback - ensure we're rendering strings not objects
  const categoryName = typeof category.name === 'string' ? category.name : 'Service';
  const cashbackPercent = typeof category.cashbackPercentage === 'number'
    ? category.cashbackPercentage
    : 0;

  return (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>
      <ThemedText style={styles.categoryName} numberOfLines={1}>
        {categoryName}
      </ThemedText>
      <ThemedText style={styles.cashbackText}>
        Up to {cashbackPercent}% cash back
      </ThemedText>
    </TouchableOpacity>
  );
});

function ServiceCategoriesSection({
  title = 'Services',
}: ServiceCategoriesSectionProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📦 [SERVICES UI] Fetching service categories...');
      const response = await serviceCategoriesApi.getServiceCategories();

      if (response.success && response.data) {
        console.log('✅ [SERVICES UI] Got', response.data.length, 'categories');
        setCategories(response.data);
      } else {
        console.log('❌ [SERVICES UI] Failed:', response);
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('❌ [SERVICES UI] Error:', err);
      setError('Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryPress = (category: ServiceCategory) => {
    router.push(`/services/${category.slug}`);
  };

  const renderCategory = useCallback(({ item, index }: { item: ServiceCategory; index: number }) => {
    return (
      <ServiceCategoryCard
        category={item}
        onPress={() => handleCategoryPress(item)}
      />
    );
  }, []);

  const keyExtractor = useCallback((item: ServiceCategory, index: number) =>
    item._id || `service-cat-${index}`, []);

  // Render items in a grid (2 columns)
  const renderRow = useCallback(({ item, index }: { item: ServiceCategory[]; index: number }) => {
    return (
      <View style={styles.row}>
        {item.map((category, i) => (
          <ServiceCategoryCard
            key={category._id || `cat-${index}-${i}`}
            category={category}
            onPress={() => handleCategoryPress(category)}
          />
        ))}
        {/* Add empty space if odd number of items */}
        {item.length === 1 && <View style={styles.emptyCard} />}
      </View>
    );
  }, []);

  // Group categories into rows of 2
  const groupedCategories = React.useMemo(() => {
    const result: ServiceCategory[][] = [];
    for (let i = 0; i < categories.length; i += 2) {
      result.push(categories.slice(i, i + 2));
    }
    return result;
  }, [categories]);

  // Don't render if no categories and not loading
  if (!loading && categories.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchCategories}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {groupedCategories.map((row, rowIndex) => (
            <View key={`row-${rowIndex}`} style={styles.row}>
              {row.map((category) => (
                <ServiceCategoryCard
                  key={category._id}
                  category={category}
                  onPress={() => handleCategoryPress(category)}
                />
              ))}
              {row.length === 1 && <View style={styles.emptyCard} />}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  gridContainer: {
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    tintColor: '#7C3AED',
  },
  categoryEmoji: {
    fontSize: 28,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7C3AED',
    textAlign: 'center',
    marginBottom: 4,
  },
  cashbackText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(ServiceCategoriesSection);
