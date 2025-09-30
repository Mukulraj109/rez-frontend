import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ThemedText';
import { HomeDeliveryHeaderProps } from '@/types/home-delivery.types';

export function HomeDeliveryHeader({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onBack,
  onHideSearch,
  onShowSearch,
  showSearchBar = false,
  suggestions = [],
  showSuggestions = false,
}: HomeDeliveryHeaderProps) {
  const [animatedValue] = useState(new Animated.Value(0));
  const [searchBarHeight] = useState(new Animated.Value(0));
  const searchInputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleSearchIconPress = () => {
    if (!showSearchBar) {
      // Show search bar
      onShowSearch?.();
      Animated.timing(searchBarHeight, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Auto focus the input after animation
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      });
    } else {
      // Submit search if search bar is already visible
      onSearchSubmit(searchQuery);
    }
  };

  const handleHideSearchInternal = () => {
    if (showSearchBar) {
      searchInputRef.current?.blur();
      Animated.timing(searchBarHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        onHideSearch?.();
      });
    }
  };

  const handleSearch = () => {
    onSearchSubmit(searchQuery);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <View style={styles.container}>
      {/* Header Gradient Background */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#9333EA']}
        style={[
          styles.headerGradient,
          showSearchBar && styles.headerGradientExpanded
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header Content */}
        <View style={styles.headerContent}>
          {/* Back Button and Title */}
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            
            <ThemedText style={styles.headerTitle}>Home delivery</ThemedText>
            
            <TouchableOpacity
              style={styles.searchIconButton}
              onPress={handleSearchIconPress}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={showSearchBar ? "search" : "search"} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>

          {/* Animated Search Bar */}
          <Animated.View
            style={[
              styles.searchBarContainer,
              {
                height: searchBarHeight.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 60],
                }),
                opacity: searchBarHeight.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 1],
                }),
                transform: [{
                  translateY: searchBarHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                }],
              },
            ]}
          >
            {showSearchBar && (
              <Animated.View
                style={[
                  styles.searchContainer,
                  {
                    backgroundColor: animatedValue.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 1)'],
                    }),
                  },
                ]}
              >
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder="Search products, brands..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={onSearchChange}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  onSubmitEditing={handleSearch}
                  returnKeyType="search"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={handleClearSearch}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </Animated.View>
            )}
          </Animated.View>

          {/* Decorative Elements */}
          <View style={styles.decorativeElements}>
            <View style={[styles.floatingCircle, styles.circle1]} />
            <View style={[styles.floatingCircle, styles.circle2]} />
            <View style={[styles.floatingCircle, styles.circle3]} />
          </View>
        </View>
      </LinearGradient>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && showSearchBar && (
        <View style={styles.suggestionsContainer}>
          <BlurView intensity={100} style={styles.suggestionsBlur}>
            {suggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => onSearchSubmit(suggestion.text)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={
                    suggestion.type === 'product'
                      ? 'cube-outline'
                      : suggestion.type === 'category'
                      ? 'grid-outline'
                      : 'business-outline'
                  }
                  size={16}
                  color="#6B7280"
                  style={styles.suggestionIcon}
                />
                <ThemedText style={styles.suggestionText}>
                  {suggestion.text}
                </ThemedText>
                {suggestion.productCount && (
                  <ThemedText style={styles.suggestionCount}>
                    {suggestion.productCount} items
                  </ThemedText>
                )}
              </TouchableOpacity>
            ))}
          </BlurView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 10,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 24,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerGradientExpanded: {
    paddingBottom: 32,
  },
  headerContent: {
    position: 'relative',
    zIndex: 2,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  searchIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    overflow: 'hidden',
    marginTop: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 0, // Remove orange border
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  floatingCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 50,
  },
  circle1: {
    width: 60,
    height: 60,
    top: 20,
    right: 40,
  },
  circle2: {
    width: 40,
    height: 40,
    top: 80,
    left: 30,
  },
  circle3: {
    width: 80,
    height: 80,
    bottom: 20,
    right: -20,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: 'transparent',
  },
  suggestionsBlur: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '400',
  },
});