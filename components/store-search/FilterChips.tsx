import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { FilterChipsProps, SearchFilters, FilterOption } from '@/types/store-search';
import { 
  FILTER_CATEGORIES, 
  GENDER_OPTIONS, 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  BORDER_RADIUS 
} from '@/constants/search-constants';

const FilterChips: React.FC<FilterChipsProps> = ({
  filters,
  availableFilters,
  onFilterChange,
  isLoading = false,
}) => {
  const [showGenderModal, setShowGenderModal] = useState(false);
  const screenWidth = Dimensions.get('window').width;

  // Handle fashion filter toggle
  const handleFashionToggle = () => {
    const newCategories = filters.categories.includes('fashion')
      ? filters.categories.filter(cat => cat !== 'fashion')
      : [...filters.categories, 'fashion'];
    
    onFilterChange({
      ...filters,
      categories: newCategories,
    });
  };

  // Handle gender selection
  const handleGenderSelect = (genderId: string) => {
    const newGenders = filters.gender.includes(genderId as any)
      ? filters.gender.filter(g => g !== genderId)
      : [...filters.gender, genderId as any];
    
    onFilterChange({
      ...filters,
      gender: newGenders,
    });
  };

  // Handle Rez Pay toggle
  const handleRezPayToggle = () => {
    onFilterChange({
      ...filters,
      hasRezPay: !filters.hasRezPay,
    });
  };

  // Check if filter is active
  const isFashionActive = filters.categories.includes('fashion');
  const isGenderActive = filters.gender.length > 0;
  const isRezPayActive = filters.hasRezPay;

  const styles = createStyles(screenWidth);

  // Render gender selection modal
  const renderGenderModal = () => (
    <Modal
      visible={showGenderModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowGenderModal(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowGenderModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Select Gender</ThemedText>
            <TouchableOpacity
              onPress={() => setShowGenderModal(false)}
              style={styles.modalCloseButton}
            >
              <Ionicons name="close" size={24} color={COLORS.GRAY_600} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={Object.values(GENDER_OPTIONS)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  filters.gender.includes(item.id as any) && styles.genderOptionSelected
                ]}
                onPress={() => handleGenderSelect(item.id)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={filters.gender.includes(item.id as any) ? COLORS.WHITE : item.color}
                />
                <ThemedText style={[
                  styles.genderOptionText,
                  filters.gender.includes(item.id as any) && styles.genderOptionTextSelected
                ]}>
                  {item.label}
                </ThemedText>
                {filters.gender.includes(item.id as any) && (
                  <Ionicons
                    name="checkmark-circle"
                    size={22}
                    color={COLORS.WHITE}
                  />
                )}
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
      >
        {/* Fashion Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            isFashionActive && styles.filterChipActive,
            isLoading && styles.filterChipDisabled
          ]}
          onPress={handleFashionToggle}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons
            name={FILTER_CATEGORIES.FASHION.icon as any}
            size={16}
            color={isFashionActive ? '#FFFFFF' : FILTER_CATEGORIES.FASHION.color}
            style={styles.chipIcon}
          />
          <ThemedText style={[
            styles.chipText,
            isFashionActive && styles.chipTextActive
          ]}>
            {FILTER_CATEGORIES.FASHION.label}
          </ThemedText>
        </TouchableOpacity>

        {/* Gender Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            isGenderActive && styles.filterChipActive,
            isLoading && styles.filterChipDisabled
          ]}
          onPress={() => setShowGenderModal(true)}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons
            name={FILTER_CATEGORIES.GENDER.icon as any}
            size={16}
            color={isGenderActive ? '#FFFFFF' : FILTER_CATEGORIES.GENDER.color}
            style={styles.chipIcon}
          />
          <ThemedText style={[
            styles.chipText,
            isGenderActive && styles.chipTextActive
          ]}>
            {filters.gender.length > 0
              ? `Gender (${filters.gender.length})`
              : FILTER_CATEGORIES.GENDER.label
            }
          </ThemedText>
          <Ionicons
            name="chevron-down"
            size={14}
            color={isGenderActive ? '#FFFFFF' : FILTER_CATEGORIES.GENDER.color}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        {/* Rez Pay Filter */}
        <TouchableOpacity
          style={[
            styles.filterChip,
            styles.rezPayChip,
            isRezPayActive && styles.rezPayChipActive,
            isLoading && styles.filterChipDisabled
          ]}
          onPress={handleRezPayToggle}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons
            name={FILTER_CATEGORIES.REZ_PAY.icon as any}
            size={16}
            color={isRezPayActive ? '#FFFFFF' : FILTER_CATEGORIES.REZ_PAY.color}
            style={styles.chipIcon}
          />
          <ThemedText style={[
            styles.chipText,
            styles.rezPayText,
            isRezPayActive && styles.rezPayTextActive
          ]}>
            {FILTER_CATEGORIES.REZ_PAY.label}
          </ThemedText>
        </TouchableOpacity>

        {/* Clear Filters Button (shows when any filter is active) */}
        {(isFashionActive || isGenderActive || isRezPayActive) && (
          <TouchableOpacity
            style={styles.clearFiltersChip}
            onPress={() => onFilterChange({
              categories: [],
              gender: [],
              hasRezPay: false,
              priceRange: undefined,
              distance: undefined,
              storeStatus: [],
            })}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color="#DC2626"
              style={styles.chipIcon}
            />
            <ThemedText style={styles.clearFiltersText}>
              Clear All
            </ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Gender Selection Modal */}
      {renderGenderModal()}
    </View>
  );
};

const createStyles = (screenWidth: number) => {
  const isTablet = screenWidth > 768;
  const horizontalPadding = isTablet ? 24 : 16;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F8F9FA',
      paddingVertical: 10,
    },
    scrollContent: {
      paddingHorizontal: horizontalPadding,
      gap: 6,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.WHITE,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1.5,
      borderColor: '#E8E8E8',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    filterChipActive: {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
      shadowColor: '#7C3AED',
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    filterChipDisabled: {
      opacity: 0.5,
    },
    rezPayChip: {
      backgroundColor: '#FFF7ED',
      borderColor: '#FDBA74',
    },
    rezPayChipActive: {
      backgroundColor: '#F97316',
      borderColor: '#F97316',
      shadowColor: '#F97316',
      shadowOpacity: 0.25,
    },
    clearFiltersChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FEE2E2',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginRight: 8,
      borderWidth: 1.5,
      borderColor: '#FCA5A5',
    },
    chipIcon: {
      marginRight: 4,
    },
    chevronIcon: {
      marginLeft: 2,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#1F2937',
      letterSpacing: 0.1,
    },
    chipTextActive: {
      color: COLORS.WHITE,
      fontWeight: '700',
    },
    rezPayText: {
      color: '#EA580C',
      fontWeight: '700',
    },
    rezPayTextActive: {
      color: COLORS.WHITE,
      fontWeight: '700',
    },
    clearFiltersText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#DC2626',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.LG,
    },
    modalContent: {
      backgroundColor: COLORS.WHITE,
      borderRadius: 24,
      padding: SPACING.XL,
      width: '90%',
      maxWidth: 400,
      maxHeight: '70%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 15,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.XL,
      paddingBottom: SPACING.MD,
      borderBottomWidth: 2,
      borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#111827',
      letterSpacing: 0.3,
    },
    modalCloseButton: {
      padding: 8,
      backgroundColor: '#F3F4F6',
      borderRadius: 20,
    },
    genderOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: SPACING.LG,
      borderRadius: 16,
      marginBottom: 10,
      backgroundColor: '#F9FAFB',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    genderOptionSelected: {
      backgroundColor: '#7C3AED',
      borderColor: '#7C3AED',
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    genderOptionText: {
      flex: 1,
      marginLeft: 12,
      fontSize: 16,
      fontWeight: '600',
      color: '#374151',
      letterSpacing: 0.2,
    },
    genderOptionTextSelected: {
      color: COLORS.WHITE,
      fontWeight: '700',
    },
  });
};

export default FilterChips;