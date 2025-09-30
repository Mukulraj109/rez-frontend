import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  SearchPageState,
  SearchSection,
  SearchCategory,
  SearchResult,
  SearchSuggestion,
  SearchViewMode,
} from '@/types/search.types';
import { searchDummyData } from '@/data/searchData';
import { SearchHeader, SearchSection as SearchSectionComponent } from '@/components/search';

const { width } = Dimensions.get('window');

export default function SearchPage() {
  const params = useLocalSearchParams();
  const initialQuery = (params.q as string) || '';

  const [searchState, setSearchState] = useState<SearchPageState>({
    query: initialQuery,
    isSearching: false,
    sections: [],
    results: [],
    suggestions: [],
    activeFilters: {},
    availableFilters: [],
    sortBy: 'relevance',
    searchHistory: [],
    recentSearches: [],
    showSuggestions: false,
    showFilters: false,
    loading: true,
    error: null,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      hasMore: false,
    },
  });

  const [viewMode, setViewMode] = useState<SearchViewMode>(initialQuery ? 'results' : 'categories');
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    // Load initial data
    setTimeout(() => {
      setSearchState(prev => ({
        ...prev,
        sections: searchDummyData.sections,
        suggestions: searchDummyData.suggestions.slice(0, 5),
        loading: false,
      }));
    }, 300);
  }, []);

  useEffect(() => {
    // Perform search if initial query exists
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleBack = () => {
    router.back();
  };

  const handleQueryChange = (text: string) => {
    setSearchState(prev => ({ ...prev, query: text }));

    if (text.length > 0) {
      setViewMode('suggestions');
      setSearchState(prev => ({ ...prev, showSuggestions: true }));
      // TODO: Add debounced search suggestions
    } else {
      setViewMode('categories');
      setSearchState(prev => ({ ...prev, showSuggestions: false }));
    }
  };

  const performSearch = useCallback((query: string) => {
    if (!query.trim()) return;

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      loading: true,
      showSuggestions: false,
    }));
    setViewMode('results');

    // Simulate API call
    setTimeout(() => {
      const filteredResults = searchDummyData.results.filter(result =>
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.category.toLowerCase().includes(query.toLowerCase())
      );

      setSearchState(prev => ({
        ...prev,
        results: filteredResults,
        isSearching: false,
        loading: false,
        pagination: {
          ...prev.pagination,
          total: filteredResults.length,
          hasMore: false,
        },
      }));
    }, 800);
  }, []);

  const handleSearch = () => {
    if (searchState.query.trim()) {
      performSearch(searchState.query);
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setSearchState(prev => ({ ...prev, query: suggestion.text }));
    performSearch(suggestion.text);
  };

  const handleCategoryPress = (category: SearchCategory) => {
    setSearchState(prev => ({ ...prev, query: category.name }));
    performSearch(category.name);
  };

  const handleResultPress = (result: SearchResult) => {
    Alert.alert('Result Selected', `Selected: ${result.title}`);
    // TODO: Navigate to result detail page
  };

  const renderHeader = () => (
    <LinearGradient colors={['#7C3AED', '#8B5CF6', '#C084FC']} style={styles.header}>
      <View style={styles.headerContent}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <View style={styles.backButtonContainer}>
            <Ionicons name="arrow-back" size={20} color="white" />
          </View>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, inputFocused && styles.searchInputFocused]}>
            <Ionicons name="search" size={20} color="#8B5CF6" style={styles.searchIcon} />
            <TextInput
              style={[
                styles.searchInput,
                // web-only inline style to remove web focus outline; cast to any to satisfy TS
                Platform.OS === 'web'
                  ? ({
                      outlineWidth: 0,
                      outlineColor: 'transparent',
                      outlineStyle: 'none',
                      WebkitTapHighlightColor: 'transparent',
                    } as any)
                  : undefined,
              ]}
              placeholder="Search for a service, store or category"
              placeholderTextColor="#9CA3AF"
              value={searchState.query}
              onChangeText={handleQueryChange}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={!initialQuery}
              underlineColorAndroid="transparent"
              importantForAutofill="no"
            />

            {searchState.query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.filterButton} activeOpacity={0.8}>
          <Ionicons name="options-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Decorative elements */}
      <View style={styles.floatingElement1} />
      <View style={styles.floatingElement2} />
    </LinearGradient>
  );

  const renderCategories = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {searchState.sections.map((section, index) => (
        <View key={section.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {section.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.9}
              >
                <View style={styles.categoryImageContainer}>
                  {category.image ? (
                    <Image source={{ uri: category.image }} style={styles.categoryImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.categoryImagePlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#8B5CF6" />
                    </View>
                  )}
                </View>

                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <View style={styles.cashbackRow}>
                    <View style={styles.cashbackBadge}>
                      <Text style={styles.cashbackBadgeText}>Upto {category.cashbackPercentage}%</Text>
                    </View>
                    <Text style={styles.categoryCashback}>cash back</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderSuggestions = () => (
    <View style={styles.suggestionsContainer}>
      <Text style={styles.suggestionsTitle}>Search Suggestions</Text>
      {searchState.suggestions
        .filter(s => s.text.toLowerCase().includes(searchState.query.toLowerCase()))
        .slice(0, 8)
        .map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={styles.suggestionItem}
            onPress={() => handleSuggestionPress(suggestion)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={suggestion.type === 'category' ? 'grid-outline' : 'search-outline'}
              size={16}
              color="#6B7280"
            />
            <Text style={styles.suggestionText}>{suggestion.text}</Text>
            {suggestion.resultCount && <Text style={styles.suggestionCount}>({suggestion.resultCount})</Text>}
          </TouchableOpacity>
        ))}
    </View>
  );

  const renderResults = () => (
    <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {searchState.results.length} results for "{searchState.query}"
        </Text>
      </View>

      {searchState.results.map((result) => (
        <TouchableOpacity key={result.id} style={styles.resultCard} onPress={() => handleResultPress(result)} activeOpacity={0.9}>
          <View style={styles.resultImageContainer}>
            {result.image ? (
              <Image source={{ uri: result.image }} style={styles.resultImage} resizeMode="cover" />
            ) : (
              <View style={styles.resultImagePlaceholder}>
                <Text style={styles.resultImageText}>{result.title.charAt(0)}</Text>
              </View>
            )}
          </View>

          <View style={styles.resultInfo}>
            <Text style={styles.resultTitle}>{result.title}</Text>
            <Text style={styles.resultDescription} numberOfLines={2}>
              {result.description}
            </Text>
            <View style={styles.resultMeta}>
              <View style={styles.resultCashback}>
                <Ionicons name="cash-outline" size={14} color="#10B981" />
                <Text style={styles.resultCashbackText}>{result.cashbackPercentage}% cashback</Text>
              </View>
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{result.category}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderContent = () => {
    if (searchState.loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    switch (viewMode) {
      case 'suggestions':
        return renderSuggestions();
      case 'results':
        return renderResults();
      default:
        return renderCategories();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#7C3AED" />
      {renderHeader()}
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 12 : 20,
    paddingBottom: 22,
    paddingHorizontal: 16,
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
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
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  searchContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  searchInputFocused: {
    shadowOpacity: 0.12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
    // make sure no border is present by default:
    borderWidth: 0,
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  floatingElement1: {
    position: 'absolute',
    top: -10,
    right: 40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    zIndex: 1,
  },
  floatingElement2: {
    position: 'absolute',
    top: 40,
    left: -20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.03)',
    zIndex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  section: {
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 14,
    color: '#7C3AED',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 56) / 2,
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    borderWidth: 0.4,
    borderColor: 'rgba(15,23,42,0.03)',
  },
  categoryImageContainer: {
    marginBottom: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: 110,
    borderRadius: 12,
  },
  categoryImagePlaceholder: {
    width: '100%',
    height: 110,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryImageText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  categoryInfo: {
    alignItems: 'flex-start',
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cashbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cashbackBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  cashbackBadgeText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryCashback: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 14,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 6,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  suggestionCount: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    borderWidth: 0.4,
    borderColor: 'rgba(15,23,42,0.03)',
  },
  resultImageContainer: {
    marginRight: 12,
  },
  resultImage: {
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  resultImagePlaceholder: {
    width: 72,
    height: 72,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultImageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  resultInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  resultDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 18,
  },
  resultMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultCashback: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultCashbackText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '700',
    marginLeft: 6,
  },
  categoryTag: {
    backgroundColor: 'rgba(124,58,237,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  categoryTagText: {
    color: '#5B21B6',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
});
