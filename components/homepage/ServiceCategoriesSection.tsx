import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
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
const PARENT_PADDING = 16;
const CARD_GAP = 12;
const AVAILABLE_WIDTH = screenWidth - (PARENT_PADDING * 2);
const CARD_WIDTH = Math.floor((AVAILABLE_WIDTH - CARD_GAP) / 2);

// ReZ Design System Colors from TASK.md
const COLORS = {
  // Primary
  primary: '#00C06A',
  primaryLight: 'rgba(0, 192, 106, 0.1)',
  primaryMedium: 'rgba(0, 192, 106, 0.2)',
  // Deep Teal
  teal: '#00796B',
  // Gold (rewards)
  gold: '#FFC857',
  goldLight: 'rgba(255, 200, 87, 0.15)',
  // Navy
  navy: '#0B2240',
  // Text
  textPrimary: '#0B2240',
  textSecondary: '#1F2D3D',
  textMuted: '#9AA7B2',
  // Surface
  surface: '#F7FAFC',
  white: '#FFFFFF',
  // Card border (from Standard Card spec)
  cardBorder: 'rgba(0, 0, 0, 0.04)',
};

interface ServiceCategoriesSectionProps {
  title?: string;
}

// Service Category Card Component - ReZ Premium Design
const ServiceCategoryCard = memo(({
  category,
  onPress
}: {
  category: ServiceCategory;
  onPress: () => void;
}) => {
  const renderIcon = () => {
    const iconValue = typeof category.icon === 'string' ? category.icon : '🔧';

    // Display URL images as full-color (no tint)
    if (category.iconType === 'url' && iconValue && iconValue.startsWith('http')) {
      return (
        <Image
          source={{ uri: iconValue }}
          style={styles.categoryImage}
          resizeMode="contain"
        />
      );
    }
    // For emoji, display as text
    return (
      <ThemedText style={styles.categoryEmoji}>
        {iconValue}
      </ThemedText>
    );
  };

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
      {/* Icon Container - shows full color image */}
      <View style={styles.iconContainer}>
        {renderIcon()}
      </View>

      {/* Category Name - Navy text */}
      <ThemedText style={styles.categoryName} numberOfLines={1}>
        {categoryName}
      </ThemedText>

      {/* Cashback Pill - ReZ Green style from TASK.md */}
      <View style={styles.cashbackPill}>
        <ThemedText style={styles.cashbackText}>
          Up to {cashbackPercent}% cash back
        </ThemedText>
      </View>
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
      const response = await serviceCategoriesApi.getServiceCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        setError('Failed to load services');
      }
    } catch (err) {
      console.error('Error fetching services:', err);
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
      {/* Header - Poppins H2 style */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <ThemedText style={styles.loadingText}>Fetching your savings...</ThemedText>
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
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: PARENT_PADDING,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  // H2: Poppins 22 (700) from TASK.md Typography
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.navy,
    letterSpacing: -0.3,
  },
  gridContainer: {
    gap: CARD_GAP,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  // Standard Card from TASK.md
  categoryCard: {
    width: CARD_WIDTH,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    // Border from Standard Card spec
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    // Shadow from Standard Card spec: 0 2px 8px rgba(11, 34, 64, 0.04), 0 8px 24px rgba(11, 34, 64, 0.08)
    shadowColor: '#0B2240',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyCard: {
    width: CARD_WIDTH,
  },
  // Icon container - subtle background for images
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  // Full color image (no tint)
  categoryImage: {
    width: 36,
    height: 36,
  },
  categoryEmoji: {
    fontSize: 28,
  },
  // H3 style: Poppins 18 (600) - adjusted for cards
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  // Cashback Pill from TASK.md
  cashbackPill: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryMedium,
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textMuted,
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
  // Primary Button style from TASK.md
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    // Primary button shadow
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});

export default memo(ServiceCategoriesSection);
