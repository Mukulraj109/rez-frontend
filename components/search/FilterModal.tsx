import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@/components/common/CrossPlatformSlider';

const { width } = Dimensions.get('window');

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00796B',
  gold: '#FFC857',
  navy: '#0B2240',
  slate: '#1F2D3D',
  muted: '#9AA7B2',
  surface: '#F7FAFC',
};

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApplyFilters: (filters: FilterState) => void;
  currentFilters: FilterState;
}

export interface FilterState {
  priceRange: { min: number; max: number };
  rating: number | null;
  categories: string[];
  inStock: boolean;
  cashbackMin: number;
}

const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait-outline' },
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline' },
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline' },
  { id: 'groceries', name: 'Groceries', icon: 'cart-outline' },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles-outline' },
  { id: 'services', name: 'Services', icon: 'construct-outline' },
];

const RATING_OPTIONS = [
  { value: 4, label: '4+ Stars' },
  { value: 3, label: '3+ Stars' },
  { value: 2, label: '2+ Stars' },
  { value: 1, label: '1+ Stars' },
];

export default function FilterModal({
  visible,
  onClose,
  onApplyFilters,
  currentFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: FilterState = {
      priceRange: { min: 0, max: 100000 },
      rating: null,
      categories: [],
      inStock: false,
      cashbackMin: 0,
    };
    setFilters(resetFilters);
  };

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId],
    }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header with ReZ Brand Colors */}
          <LinearGradient
            colors={['#00C06A', '#00A85A', '#008F4A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.headerTitleContainer}>
                <Ionicons name="options-outline" size={22} color="white" style={styles.headerIcon} />
                <Text style={styles.headerTitle}>Filters</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Price Range */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              
              {/* Price Display Cards */}
              <View style={styles.priceCardsContainer}>
                <View style={styles.priceCard}>
                  <Text style={styles.priceCardLabel}>Min Price</Text>
                  <Text style={styles.priceCardValue}>₹{filters.priceRange.min.toLocaleString()}</Text>
                </View>
                <View style={styles.priceCardDivider} />
                <View style={styles.priceCard}>
                  <Text style={styles.priceCardLabel}>Max Price</Text>
                  <Text style={styles.priceCardValue}>₹{filters.priceRange.max.toLocaleString()}</Text>
                </View>
              </View>

              {/* Min Price Slider */}
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>Minimum Price</Text>
                  <Text style={styles.sliderValue}>₹{filters.priceRange.min.toLocaleString()}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={filters.priceRange.max}
                    step={1000}
                    value={filters.priceRange.min}
                    onValueChange={(value) => {
                      const newMin = Math.min(value, filters.priceRange.max - 1000);
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, min: newMin },
                      }));
                    }}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor={COLORS.primary}
                  />
                </View>
                <View style={styles.sliderRangeLabels}>
                  <Text style={styles.rangeLabel}>₹0</Text>
                  <Text style={styles.rangeLabel}>₹{filters.priceRange.max.toLocaleString()}</Text>
                </View>
              </View>

              {/* Max Price Slider */}
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>Maximum Price</Text>
                  <Text style={styles.sliderValue}>₹{filters.priceRange.max.toLocaleString()}</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={filters.priceRange.min}
                    maximumValue={100000}
                    step={1000}
                    value={filters.priceRange.max}
                    onValueChange={(value) => {
                      const newMax = Math.max(value, filters.priceRange.min + 1000);
                      setFilters(prev => ({
                        ...prev,
                        priceRange: { ...prev.priceRange, max: newMax },
                      }));
                    }}
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor={COLORS.primary}
                  />
                </View>
                <View style={styles.sliderRangeLabels}>
                  <Text style={styles.rangeLabel}>₹{filters.priceRange.min.toLocaleString()}</Text>
                  <Text style={styles.rangeLabel}>₹1,00,000</Text>
                </View>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {RATING_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.ratingOption,
                      filters.rating === option.value && styles.ratingOptionActive,
                    ]}
                    onPress={() => setFilters(prev => ({ ...prev, rating: option.value }))}
                  >
                    <Ionicons
                      name="star"
                      size={16}
                      color={filters.rating === option.value ? '#FFFFFF' : COLORS.gold}
                    />
                    <Text
                      style={[
                        styles.ratingText,
                        filters.rating === option.value && styles.ratingTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[
                    styles.ratingOption,
                    filters.rating === null && styles.ratingOptionActive,
                  ]}
                  onPress={() => setFilters(prev => ({ ...prev, rating: null }))}
                >
                  <Text
                    style={[
                      styles.ratingText,
                      filters.rating === null && styles.ratingTextActive,
                    ]}
                  >
                    Any
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              <View style={styles.categoriesGrid}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryChip,
                      filters.categories.includes(category.id) && styles.categoryChipActive,
                    ]}
                    onPress={() => toggleCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={18}
                      color={
                        filters.categories.includes(category.id) ? '#FFFFFF' : COLORS.primary
                      }
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        filters.categories.includes(category.id) && styles.categoryChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cashback */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Cashback</Text>
              
              {/* Cashback Display Card */}
              <View style={styles.cashbackCard}>
                <Text style={styles.cashbackCardLabel}>Cashback Percentage</Text>
                <Text style={styles.cashbackCardValue}>{filters.cashbackMin}%</Text>
              </View>

              {/* Cashback Slider */}
              <View style={styles.sliderWrapper}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.sliderLabel}>Select Cashback</Text>
                  <Text style={styles.sliderValue}>{filters.cashbackMin}%</Text>
                </View>
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={20}
                    step={1}
                    value={filters.cashbackMin}
                    onValueChange={(value) =>
                      setFilters(prev => ({ ...prev, cashbackMin: value }))
                    }
                    minimumTrackTintColor={COLORS.primary}
                    maximumTrackTintColor="#E5E7EB"
                    thumbTintColor={COLORS.primary}
                  />
                </View>
                <View style={styles.sliderRangeLabels}>
                  <Text style={styles.rangeLabel}>0%</Text>
                  <Text style={styles.rangeLabel}>20%</Text>
                </View>
              </View>
            </View>

            {/* In Stock */}
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setFilters(prev => ({ ...prev, inStock: !prev.inStock }))}
              >
                <Text style={styles.toggleLabel}>Show in-stock items only</Text>
                <View
                  style={[
                    styles.toggle,
                    filters.inStock && styles.toggleActive,
                  ]}
                >
                  <View style={[
                    styles.toggleThumb,
                    filters.inStock && styles.toggleThumbActive
                  ]}>
                    {filters.inStock && (
                      <Ionicons name="checkmark" size={12} color={COLORS.primary} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer with ReZ Brand Colors */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.7}>
              <Ionicons name="refresh-outline" size={18} color={COLORS.primaryDark} />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, '#00A85A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.applyButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0px -8px 32px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 18,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIcon: {
    marginTop: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      },
    }),
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  priceCardsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  priceCard: {
    flex: 1,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 192, 106, 0.1)',
      },
    }),
  },
  priceCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  priceCardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  priceCardDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  sliderWrapper: {
    marginBottom: 24,
  },
  sliderLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sliderLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: 0.2,
  },
  sliderValue: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  sliderContainer: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ratingOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  ratingOptionActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 12px rgba(0, 192, 106, 0.25)',
      },
    }),
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  ratingTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.gold,
    borderWidth: 2,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0px 3px 12px rgba(0, 192, 106, 0.25)',
      },
    }),
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cashbackCard: {
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 192, 106, 0.15)',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 192, 106, 0.1)',
      },
    }),
  },
  cashbackCardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  cashbackCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  sliderRangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 4,
  },
  rangeLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primaryDark,
  },
  toggle: {
    width: 52,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    paddingHorizontal: 3,
    position: 'relative',
  },
  toggleActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  toggleThumbActive: {
    left: 'auto',
    right: 3,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1.5,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FAFBFC',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
    letterSpacing: 0.2,
  },
  applyButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0px 4px 16px rgba(0, 192, 106, 0.3)',
      },
    }),
  },
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
});

