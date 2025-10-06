// FAQ Page
// Comprehensive Frequently Asked Questions page with search and categories

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  RefreshControl,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  LayoutAnimation,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import supportService, { FAQ, FAQCategory } from '@/services/supportApi';

export default function FAQPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search bar is HIDDEN by default - only shown when user clicks search icon
  const [showSearch, setShowSearch] = useState(false);

  const [allFAQs, setAllFAQs] = useState<FAQ[]>([]);
  const [displayedFAQs, setDisplayedFAQs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());

  // Track feedback for FAQs
  const [faqFeedback, setFaqFeedback] = useState<{ [key: string]: boolean | null }>({});

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFAQs();
  }, [selectedCategory, allFAQs, searchQuery]);

  // If FAQ ID is passed in params, expand that FAQ
  useEffect(() => {
    if (params.id && typeof params.id === 'string') {
      setExpandedFAQs(new Set([params.id]));
      // Scroll to that FAQ (implement if needed)
    }
  }, [params.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [faqsResponse, categoriesResponse] = await Promise.all([
        supportService.getAllFAQs(),
        supportService.getFAQCategories(),
      ]);

      if (faqsResponse.success && faqsResponse.data) {
        setAllFAQs(faqsResponse.data.faqs);
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (error) {
      console.error('Failed to load FAQ data:', error);
      Alert.alert('Error', 'Failed to load FAQs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterFAQs = () => {
    let filtered = allFAQs;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(faq =>
        faq.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        faq.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setDisplayedFAQs(filtered);
  };

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      // If query is empty, just filter locally
      if (!query.trim()) {
        return;
      }

      // Perform API search for better results
      setSearching(true);
      try {
        const response = await supportService.searchFAQs(query, 50);
        if (response.success && response.data) {
          setDisplayedFAQs(response.data.faqs);
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setSearching(false);
      }
    },
    []
  );

  const toggleFAQ = async (faqId: string) => {
    if (Platform.OS === 'ios') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }

    const newExpanded = new Set(expandedFAQs);
    const wasExpanded = newExpanded.has(faqId);

    if (wasExpanded) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
      // Track view when FAQ is expanded
      try {
        await supportService.trackFAQView(faqId);
      } catch (error) {
        console.error('Failed to track FAQ view:', error);
      }
    }

    setExpandedFAQs(newExpanded);
  };

  const handleFAQFeedback = async (faqId: string, helpful: boolean) => {
    try {
      await supportService.markFAQHelpful(faqId, helpful);
      setFaqFeedback(prev => ({ ...prev, [faqId]: helpful }));

      // Show success feedback
      Alert.alert(
        'Thank you!',
        'Your feedback helps us improve our support.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
    }
  };

  const expandAll = () => {
    setExpandedFAQs(new Set(displayedFAQs.map(faq => faq._id)));
  };

  const collapseAll = () => {
    setExpandedFAQs(new Set());
  };

  const handleBackPress = () => {
    // Check if there's a previous screen to go back to
    if (router.canGoBack()) {
      router.back();
    } else {
      // If no previous screen (e.g., page was refreshed), navigate to account page
      router.push('/account' as any);
    }
  };

  const handleContactSupport = () => {
    // Navigate to support hub for live chat/ticket creation
    router.push('/support' as any);
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      order: '#8B5CF6',
      payment: '#10B981',
      product: '#F59E0B',
      account: '#EF4444',
      technical: '#3B82F6',
      delivery: '#EC4899',
      refund: '#14B8A6',
      other: '#6B7280',
    };
    return colors[category.toLowerCase()] || '#6B7280';
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: string } = {
      order: 'cube-outline',
      payment: 'card-outline',
      product: 'pricetag-outline',
      account: 'person-outline',
      technical: 'construct-outline',
      delivery: 'car-outline',
      refund: 'arrow-undo-outline',
      other: 'help-circle-outline',
    };
    return icons[category.toLowerCase()] || 'help-circle-outline';
  };

  const renderCategoryFilter = () => {
    const allCategories = [
      { key: 'all', name: 'All', count: allFAQs.length },
      ...categories.map(cat => ({
        key: cat.category.toLowerCase(),
        name: cat.category.charAt(0).toUpperCase() + cat.category.slice(1),
        count: cat.count,
      })),
    ];

    return (
      <View style={styles.categoryFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryFilter}
          contentContainerStyle={styles.categoryFilterContent}
        >
          {allCategories.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryButton,
                selectedCategory === category.key && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.key)}
            >
              <Ionicons
                name={getCategoryIcon(category.key) as any}
                size={16}
                color={selectedCategory === category.key ? 'white' : '#6B7280'}
              />
              <ThemedText
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category.key && styles.selectedCategoryButtonText,
                ]}
              >
                {category.name}
              </ThemedText>
              {category.count > 0 && (
                <View
                  style={[
                    styles.categoryBadge,
                    selectedCategory === category.key && styles.selectedCategoryBadge,
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.categoryBadgeText,
                      selectedCategory === category.key && styles.selectedCategoryBadgeText,
                    ]}
                  >
                    {category.count}
                  </ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFAQItem = (faq: FAQ) => {
    const isExpanded = expandedFAQs.has(faq._id);
    const categoryColor = getCategoryColor(faq.category);
    const feedback = faqFeedback[faq._id];

    return (
      <View
        key={faq._id}
        style={[styles.faqItem, isExpanded && styles.expandedFAQItem]}
      >
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => toggleFAQ(faq._id)}
          activeOpacity={0.7}
        >
          <View style={styles.questionContainer}>
            <View
              style={[
                styles.categoryIndicator,
                { backgroundColor: `${categoryColor}20` },
              ]}
            >
              <Ionicons
                name={getCategoryIcon(faq.category) as any}
                size={14}
                color={categoryColor}
              />
            </View>
            <ThemedText style={styles.questionText}>{faq.question}</ThemedText>
          </View>
          <Animated.View
            style={[
              styles.expandIcon,
              { transform: [{ rotate: isExpanded ? '180deg' : '0deg' }] },
            ]}
          >
            <Ionicons name="chevron-down" size={20} color="#6B7280" />
          </Animated.View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.faqContent}>
            <ThemedText style={styles.answerText}>{faq.answer}</ThemedText>

            {/* View count and helpful stats */}
            <View style={styles.faqMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="eye-outline" size={14} color="#9CA3AF" />
                <ThemedText style={styles.metaText}>{faq.viewCount} views</ThemedText>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="thumbs-up-outline" size={14} color="#10B981" />
                <ThemedText style={styles.metaText}>{faq.helpfulCount}</ThemedText>
              </View>
              <View style={styles.categoryTag}>
                <ThemedText style={[styles.categoryTagText, { color: categoryColor }]}>
                  {faq.category}
                </ThemedText>
              </View>
            </View>

            {/* Helpful feedback */}
            {feedback === null || feedback === undefined ? (
              <View style={styles.feedbackContainer}>
                <ThemedText style={styles.feedbackQuestion}>Was this helpful?</ThemedText>
                <View style={styles.feedbackButtons}>
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() => handleFAQFeedback(faq._id, true)}
                  >
                    <Ionicons name="thumbs-up-outline" size={20} color="#10B981" />
                    <ThemedText style={[styles.feedbackButtonText, { color: '#10B981' }]}>
                      Yes
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.feedbackButton}
                    onPress={() => handleFAQFeedback(faq._id, false)}
                  >
                    <Ionicons name="thumbs-down-outline" size={20} color="#EF4444" />
                    <ThemedText style={[styles.feedbackButtonText, { color: '#EF4444' }]}>
                      No
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.feedbackThanks}>
                <Ionicons
                  name={feedback ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={feedback ? '#10B981' : '#EF4444'}
                />
                <ThemedText style={styles.feedbackThanksText}>
                  Thank you for your feedback!
                </ThemedText>
              </View>
            )}

            {/* Related questions */}
            {faq.relatedQuestions && faq.relatedQuestions.length > 0 && (
              <View style={styles.relatedQuestions}>
                <ThemedText style={styles.relatedTitle}>Related Questions:</ThemedText>
                {faq.relatedQuestions.slice(0, 3).map((relatedFaq) => (
                  <TouchableOpacity
                    key={relatedFaq._id}
                    style={styles.relatedItem}
                    onPress={() => toggleFAQ(relatedFaq._id)}
                  >
                    <Ionicons name="arrow-forward" size={14} color="#8B5CF6" />
                    <ThemedText style={styles.relatedText} numberOfLines={1}>
                      {relatedFaq.question}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" translucent={true} />

        {/* Header */}
        <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <View style={styles.backButtonInner}>
              <Ionicons name="arrow-back" size={22} color="white" />
            </View>
          </TouchableOpacity>

          <View style={styles.headerTitleSection}>
            <ThemedText style={styles.headerTitle}>FAQs</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Find answers to common questions
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => setShowSearch(!showSearch)}
          >
            <View style={styles.backButtonInner}>
              <Ionicons name={showSearch ? 'close' : 'search'} size={22} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchBarContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#9CA3AF" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search FAQs..."
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus={true}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              {searching && <ActivityIndicator size="small" color="#8B5CF6" />}
            </View>
          </View>
        )}
      </LinearGradient>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Controls */}
      <View style={styles.controls}>
        <ThemedText style={styles.controlsInfo}>
          Showing {displayedFAQs.length} of {allFAQs.length} questions
        </ThemedText>
        <View style={styles.controlButtons}>
          <TouchableOpacity style={styles.controlButton} onPress={expandAll}>
            <Ionicons name="chevron-down-circle-outline" size={16} color="#8B5CF6" />
            <ThemedText style={styles.controlButtonText}>Expand All</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={collapseAll}>
            <Ionicons name="chevron-up-circle-outline" size={16} color="#8B5CF6" />
            <ThemedText style={styles.controlButtonText}>Collapse All</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* FAQ List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <ThemedText style={styles.loadingText}>Loading FAQs...</ThemedText>
          </View>
        ) : displayedFAQs.length > 0 ? (
          <View style={styles.faqList}>
            {displayedFAQs.map(renderFAQItem)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyStateTitle}>No FAQs Found</ThemedText>
            <ThemedText style={styles.emptyStateText}>
              {searchQuery
                ? `No results found for "${searchQuery}"`
                : 'No questions found for this category.'}
            </ThemedText>
            {searchQuery && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => setSearchQuery('')}
              >
                <ThemedText style={styles.clearSearchText}>Clear Search</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Contact Support Card */}
        <TouchableOpacity style={styles.contactCard} onPress={handleContactSupport}>
          <LinearGradient colors={['#8B5CF6', '#A78BFA']} style={styles.contactGradient}>
            <View style={styles.contactContent}>
              <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              <View style={styles.contactText}>
                <ThemedText style={styles.contactTitle}>Still need help?</ThemedText>
                <ThemedText style={styles.contactDescription}>
                  Chat with our support team
                </ThemedText>
              </View>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.footer} />
      </ScrollView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 50 : 45,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    marginRight: 12,
  },
  searchButton: {
    marginLeft: 12,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitleSection: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  searchBarContainer: {
    marginTop: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  categoryFilterWrapper: {
    backgroundColor: '#F3F4F6',
  },
  categoryFilter: {
    flexGrow: 0,
    paddingVertical: 16,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
    gap: 6,
    height: 42,
  },
  selectedCategoryButton: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedCategoryButtonText: {
    color: 'white',
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  selectedCategoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
  },
  selectedCategoryBadgeText: {
    color: 'white',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  controlsInfo: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlButtonText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  faqList: {
    padding: 16,
  },
  faqItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  expandedFAQItem: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F9FAFB',
    shadowOpacity: 0.12,
    elevation: 4,
    borderWidth: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  questionContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  expandIcon: {
    marginLeft: 12,
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  answerText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  faqMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  categoryTag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  feedbackContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  feedbackQuestion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  feedbackButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: 'white',
  },
  feedbackButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  feedbackThanks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    marginTop: 8,
  },
  feedbackThanksText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '500',
  },
  relatedQuestions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  relatedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
  },
  relatedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  relatedText: {
    flex: 1,
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  loadingContainer: {
    padding: 80,
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  emptyState: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 24,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  clearSearchButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearSearchText: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
  contactCard: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  contactGradient: {
    padding: 20,
  },
  contactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  contactText: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  footer: {
    height: 40,
  },
});
