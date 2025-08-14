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
                  size={20} 
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
                    name="checkmark" 
                    size={20} 
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
            color={isFashionActive ? FILTER_CATEGORIES.FASHION.activeColor : FILTER_CATEGORIES.FASHION.color}
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
            color={isGenderActive ? FILTER_CATEGORIES.GENDER.activeColor : FILTER_CATEGORIES.GENDER.color}
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
            color={isGenderActive ? FILTER_CATEGORIES.GENDER.activeColor : FILTER_CATEGORIES.GENDER.color}
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
            color={isRezPayActive ? FILTER_CATEGORIES.REZ_PAY.activeColor : FILTER_CATEGORIES.REZ_PAY.color}
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
              color={COLORS.GRAY_600}
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
      backgroundColor: COLORS.WHITE,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.BORDER_DEFAULT,
      paddingVertical: SPACING.SM,
    },
    scrollContent: {
      paddingHorizontal: horizontalPadding,
      paddingVertical: SPACING.XS,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: FILTER_CATEGORIES.FASHION.backgroundColor,
      borderRadius: BORDER_RADIUS.XL,
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.SM,
      marginRight: SPACING.SM,
      borderWidth: 1,
      borderColor: COLORS.BORDER_LIGHT,
    },
    filterChipActive: {
      backgroundColor: FILTER_CATEGORIES.FASHION.activeBackgroundColor,
      borderColor: FILTER_CATEGORIES.FASHION.activeBackgroundColor,
    },
    filterChipDisabled: {
      opacity: 0.6,
    },
    rezPayChip: {
      backgroundColor: FILTER_CATEGORIES.REZ_PAY.backgroundColor,
    },
    rezPayChipActive: {
      backgroundColor: FILTER_CATEGORIES.REZ_PAY.activeBackgroundColor,
      borderColor: FILTER_CATEGORIES.REZ_PAY.activeBackgroundColor,
    },
    clearFiltersChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.GRAY_100,
      borderRadius: BORDER_RADIUS.XL,
      paddingHorizontal: SPACING.MD,
      paddingVertical: SPACING.SM,
      marginRight: SPACING.SM,
      borderWidth: 1,
      borderColor: COLORS.BORDER_DEFAULT,
    },
    chipIcon: {
      marginRight: SPACING.XS,
    },
    chevronIcon: {
      marginLeft: SPACING.XS,
    },
    chipText: {
      fontSize: TYPOGRAPHY.FONT_SIZE_SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
      color: COLORS.TEXT_PRIMARY,
    },
    chipTextActive: {
      color: COLORS.WHITE,
    },
    rezPayText: {
      color: FILTER_CATEGORIES.REZ_PAY.color,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_SEMIBOLD,
    },
    rezPayTextActive: {
      color: FILTER_CATEGORIES.REZ_PAY.activeColor,
    },
    clearFiltersText: {
      fontSize: TYPOGRAPHY.FONT_SIZE_SM,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
      color: COLORS.GRAY_600,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: COLORS.OVERLAY,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: COLORS.WHITE,
      borderRadius: BORDER_RADIUS.XL,
      padding: SPACING.XL,
      width: '80%',
      maxHeight: '60%',
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: SPACING.LG,
    },
    modalTitle: {
      fontSize: TYPOGRAPHY.FONT_SIZE_XL,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_BOLD,
      color: COLORS.TEXT_PRIMARY,
    },
    modalCloseButton: {
      padding: SPACING.XS,
    },
    genderOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: SPACING.MD,
      paddingHorizontal: SPACING.LG,
      borderRadius: BORDER_RADIUS.LG,
      marginBottom: SPACING.SM,
      backgroundColor: COLORS.GRAY_50,
    },
    genderOptionSelected: {
      backgroundColor: COLORS.PRIMARY,
    },
    genderOptionText: {
      flex: 1,
      marginLeft: SPACING.SM,
      fontSize: TYPOGRAPHY.FONT_SIZE_BASE,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_MEDIUM,
      color: COLORS.TEXT_PRIMARY,
    },
    genderOptionTextSelected: {
      color: COLORS.WHITE,
    },
  });
};

export default FilterChips;