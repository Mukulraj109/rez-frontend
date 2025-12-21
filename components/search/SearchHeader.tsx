import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SearchHeaderProps, SearchSuggestion } from '@/types/search.types';

export default function SearchHeader({
  query,
  onQueryChange,
  onSearch,
  onBack,
  showSuggestions,
  suggestions,
  onSuggestionPress,
}: SearchHeaderProps) {
  const [inputFocused, setInputFocused] = useState(false);
  const [animatedValue] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: inputFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [inputFocused]);

  const handleClear = () => {
    onQueryChange('');
  };

  const handleSubmit = () => {
    if (query.trim()) {
      onSearch(query);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={['#8B5CF6', '#A78BFA', '#C084FC']} 
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={onBack}
            style={styles.backButton}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            accessibilityHint="Double tap to return to previous screen"
          >
            <View style={styles.backButtonContainer}>
              <Ionicons name="arrow-back" size={20} color="white" />
            </View>
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <Animated.View style={[
              styles.searchInputContainer,
              {
                backgroundColor: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['white', '#F8FAFC'],
                }),
              }
            ]}>
              <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search for the service"
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={onQueryChange}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                onSubmitEditing={handleSubmit}
                returnKeyType="search"
                autoFocus={!query}
                accessibilityLabel="Search input"
                accessibilityHint="Enter search terms to find services"
              />
              {query.length > 0 && (
                <TouchableOpacity
                  onPress={handleClear}
                  style={styles.clearButton}
                  accessibilityLabel="Clear search"
                  accessibilityRole="button"
                  accessibilityHint="Double tap to clear search text"
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
            </Animated.View>
          </View>

          <TouchableOpacity
            style={styles.filterButton}
            accessibilityLabel="Open filters"
            accessibilityRole="button"
            accessibilityHint="Double tap to open filter options"
          >
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Decorative floating elements */}
        <View style={styles.floatingElement1} />
        <View style={styles.floatingElement2} />
        <View style={styles.floatingElement3} />
      </LinearGradient>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsDropdown}>
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>
              Search Suggestions
            </Text>
            {suggestions.slice(0, 6).map((suggestion) => (
              <TouchableOpacity
                key={suggestion.id}
                style={styles.suggestionItem}
                onPress={() => onSuggestionPress(suggestion)}
                activeOpacity={0.7}
                accessibilityLabel={`Search suggestion: ${suggestion.text}`}
                accessibilityRole="button"
                accessibilityHint="Double tap to search for this suggestion"
              >
                <View style={styles.suggestionIconContainer}>
                  <Ionicons 
                    name={getSuggestionIcon(suggestion.type)} 
                    size={16} 
                    color="#6B7280" 
                  />
                </View>
                <Text style={styles.suggestionText}>{suggestion.text}</Text>
                {suggestion.resultCount && (
                  <Text style={styles.suggestionCount}>
                    ({suggestion.resultCount})
                  </Text>
                )}
                {suggestion.isRecent && (
                  <View style={styles.recentBadge}>
                    <Text style={styles.recentBadgeText}>Recent</Text>
                  </View>
                )}
                <Ionicons name="arrow-up-forward" size={14} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
);
}

const getSuggestionIcon = (type: SearchSuggestion['type']): string => {
  switch (type) {
    case 'category':
      return 'grid-outline';
    case 'product':
      return 'cube-outline';
    case 'service':
      return 'build-outline';
    case 'location':
      return 'location-outline';
    default:
      return 'search-outline';
  }
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    zIndex: 2,
  },
  backButton: {
    zIndex: 3,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
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
    }),
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    color: '#1F2937',
    ...Platform.select({
      web: {
        outlineWidth: 0,
        outlineStyle: 'none',
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  floatingElement1: {
    position: 'absolute',
    top: 10,
    right: 60,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 60,
    left: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    zIndex: 1,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: -10,
    right: 20,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1001,
    paddingTop: 8,
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
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
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)',
      },
    }),
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 2,
  },
  suggestionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
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
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recentBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  recentBadgeText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
});