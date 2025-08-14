import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { SearchHeaderProps } from '@/types/store-search';
import { COLORS, TYPOGRAPHY, SPACING, DEFAULTS } from '@/constants/search-constants';

const SearchHeader: React.FC<SearchHeaderProps> = ({
  query,
  onQueryChange,
  onBack,
  placeholder = DEFAULTS.SEARCH_PLACEHOLDER,
  isLoading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const screenWidth = Dimensions.get('window').width;

  const handleClearSearch = () => {
    onQueryChange('');
    inputRef.current?.focus();
  };

  const handleSearchSubmit = () => {
    inputRef.current?.blur();
  };

  const styles = createStyles(screenWidth);

  return (
    <LinearGradient
      colors={[COLORS.PRIMARY, COLORS.PRIMARY_LIGHT]}
      style={styles.container}
    >
      {/* Header Content */}
      <View style={styles.headerContent}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={COLORS.WHITE} 
          />
        </TouchableOpacity>

        {/* Page Title */}
        <View style={styles.titleContainer}>
          <ThemedText style={styles.title}>Store list page</ThemedText>
        </View>

        {/* Right spacing */}
        <View style={styles.rightSpacer} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[
          styles.searchInputContainer,
          isFocused && styles.searchInputContainerFocused
        ]}>
          {/* Search Icon */}
          <Ionicons 
            name="search" 
            size={20} 
            color={COLORS.GRAY_400} 
            style={styles.searchIcon}
          />

          {/* Search Input */}
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            value={query}
            onChangeText={onQueryChange}
            placeholder={placeholder}
            placeholderTextColor={COLORS.GRAY_400}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            maxLength={100}
            editable={!isLoading}
            accessibilityLabel="Search products"
            accessibilityHint="Enter product name to search across stores"
             underlineColorAndroid="transparent" 
          />

          {/* Clear Button or Loading */}
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
              activeOpacity={0.7}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              {isLoading ? (
                <Ionicons 
                  name="refresh" 
                  size={18} 
                  color={COLORS.GRAY_400} 
                />
              ) : (
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color={COLORS.GRAY_400} 
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const createStyles = (screenWidth: number) => {
  const isTablet = screenWidth > 768;
  const horizontalPadding = isTablet ? 24 : 16;

  return StyleSheet.create({
    container: {
      paddingTop: Platform.OS === 'ios' ? SPACING.XL : SPACING.XXL,
      paddingBottom: SPACING.LG,
      paddingHorizontal: horizontalPadding,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: SPACING.LG,
      minHeight: 44,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
title: {
  color: COLORS.WHITE,
  fontSize: isTablet
    ? TYPOGRAPHY.FONT_SIZE_4XL // huge on tablets
    : TYPOGRAPHY.FONT_SIZE_3XL, // big on mobile
  fontWeight: TYPOGRAPHY.FONT_WEIGHT_BOLD,
  textAlign: 'center',
},


    rightSpacer: {
      width: 44,
    },
    searchContainer: {
      width: '100%',
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.WHITE,
      borderRadius: 30,
      paddingHorizontal: SPACING.LG,
      paddingVertical: Platform.OS === 'ios' ? SPACING.MD : SPACING.SM,
      minHeight: 48,
      shadowColor: COLORS.BLACK,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    searchInputContainerFocused: {
      shadowOpacity: 0.2,
      elevation: 5,
      borderWidth: 2,
      borderColor: COLORS.PRIMARY_LIGHT,
    },
    searchIcon: {
      marginRight: SPACING.SM,
    },
    searchInput: {
      flex: 1,
      fontSize: TYPOGRAPHY.FONT_SIZE_BASE,
      color: COLORS.TEXT_PRIMARY,
      fontWeight: TYPOGRAPHY.FONT_WEIGHT_NORMAL,
      paddingVertical: 0, // Remove default padding on Android
       outlineWidth: 0
    },
    clearButton: {
      padding: SPACING.XS,
      marginLeft: SPACING.XS,
    },
  });
};

export default SearchHeader;