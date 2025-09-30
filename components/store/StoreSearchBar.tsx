import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storeSearchService } from '@/services/storeSearchService';

interface SearchSuggestion {
  id: string;
  name: string;
  type: 'store' | 'category' | 'location';
  icon: string;
  description?: string;
}

interface StoreSearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  style?: any;
}

const StoreSearchBar: React.FC<StoreSearchBarProps> = ({
  onSearch,
  onSuggestionSelect,
  placeholder = 'Search stores, categories...',
  style,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  // Predefined suggestions for quick access
  const quickSuggestions: SearchSuggestion[] = [
    { id: 'fast-delivery', name: '30 min delivery', type: 'category', icon: '🚀' },
    { id: 'budget-friendly', name: '1 rupee store', type: 'category', icon: '💰' },
    { id: 'premium', name: 'Luxury store', type: 'category', icon: '👑' },
    { id: 'organic', name: 'Organic Store', type: 'category', icon: '🌱' },
    { id: 'alliance', name: 'Alliance Store', type: 'category', icon: '🤝' },
    { id: 'lowest-price', name: 'Lowest Price', type: 'category', icon: '💸' },
    { id: 'mall', name: 'Rez Mall', type: 'category', icon: '🏬' },
    { id: 'cash-store', name: 'Cash Store', type: 'category', icon: '💵' },
  ];

  const locationSuggestions: SearchSuggestion[] = [
    { id: 'nearby', name: 'Nearby stores', type: 'location', icon: '📍', description: 'Stores near you' },
    { id: 'delivery-available', name: 'Delivery available', type: 'location', icon: '🚚', description: 'Stores that deliver to you' },
  ];

  useEffect(() => {
    if (query.length === 0) {
      setSuggestions([...quickSuggestions, ...locationSuggestions]);
      setShowSuggestions(true);
      return;
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for search
    searchTimeoutRef.current = setTimeout(async () => {
      await performSearch(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    try {
      setLoading(true);
      
      // Search in quick suggestions first
      const quickMatches = quickSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Search in location suggestions
      const locationMatches = locationSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (suggestion.description && suggestion.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      // TODO: Add actual store search API call here
      // const storeResults = await storeSearchService.searchStores(searchQuery);
      
      const allSuggestions = [...quickMatches, ...locationMatches];
      setSuggestions(allSuggestions);
      setShowSuggestions(allSuggestions.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (text: string) => {
    setQuery(text);
  };

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow for touch events
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.name);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onSuggestionSelect(suggestion);
  };

  const handleSearchPress = () => {
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleClearPress = () => {
    setQuery('');
    setSuggestions([...quickSuggestions, ...locationSuggestions]);
    setShowSuggestions(true);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const renderSuggestion = ({ item, index }: { item: SearchSuggestion; index: number }) => (
    <TouchableOpacity
      style={[
        styles.suggestionItem,
        index === selectedIndex && styles.suggestionItemSelected,
      ]}
      onPress={() => handleSuggestionPress(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.suggestionIcon}>{item.icon}</Text>
      <View style={styles.suggestionContent}>
        <Text style={styles.suggestionName}>{item.name}</Text>
        {item.description && (
          <Text style={styles.suggestionDescription}>{item.description}</Text>
        )}
      </View>
      <View style={styles.suggestionType}>
        <Text style={styles.suggestionTypeText}>
          {item.type === 'category' ? 'Category' : 
           item.type === 'location' ? 'Location' : 'Store'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#999"
            value={query}
            onChangeText={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="search"
            onSubmitEditing={handleSearchPress}
            autoCorrect={false}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClearPress} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
          {loading && (
            <ActivityIndicator size="small" color="#7B61FF" style={styles.loadingIndicator} />
          )}
        </View>
        
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.id}
            style={styles.suggestionsList}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: '#7B61FF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    maxHeight: 300,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionItemSelected: {
    backgroundColor: '#f8f9ff',
  },
  suggestionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  suggestionDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  suggestionType: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  suggestionTypeText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});

export default StoreSearchBar;
