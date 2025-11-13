// FAQ Page
// Frequently Asked Questions with search and categories

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import supportService, { FAQ as FAQType, FAQCategory } from '@/services/supportApi';

export default function FAQPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [faqs, setFaqs] = useState<FAQType[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchFAQs();
    } else if (searchQuery.length === 0) {
      loadData();
    }
  }, [searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [faqsResponse, categoriesResponse] = await Promise.all([
        supportService.getAllFAQs(selectedCategory || undefined),
        supportService.getFAQCategories(),
      ]);

      if (faqsResponse.success && faqsResponse.data) {
        setFaqs(faqsResponse.data.faqs);
      } else {
        throw new Error(faqsResponse.error || 'Failed to fetch FAQs');
      }

      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data.categories);
      }
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load FAQs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const searchFAQs = async () => {
    try {
      const response = await supportService.searchFAQs(searchQuery, 50);

      if (response.success && response.data) {
        setFaqs(response.data.faqs);
      }
    } catch (err) {
      console.error('Error searching FAQs:', err);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    setSearchQuery('');
    loadData();
  };

  const handleFAQPress = async (faq: FAQType) => {
    if (expandedFAQ === faq._id) {
      setExpandedFAQ(null);
    } else {
      setExpandedFAQ(faq._id);

      // Track view
      try {
        await supportService.trackFAQView(faq._id);
      } catch (err) {
        console.error('Error tracking FAQ view:', err);
      }
    }
  };

  const handleHelpful = async (faqId: string, helpful: boolean) => {
    try {
      await supportService.markFAQHelpful(faqId, helpful);
    } catch (err) {
      console.error('Error marking FAQ helpful:', err);
    }
  };

  const renderCategory = (category: FAQCategory, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.categoryChip,
        selectedCategory === category.category && styles.categoryChipActive,
      ]}
      onPress={() => handleCategorySelect(category.category)}
      accessible={true}
      accessibilityLabel={`${category.category} category, ${category.count} FAQs`}
      accessibilityRole="button"
      accessibilityState={{ selected: selectedCategory === category.category }}
      accessibilityHint={`Filter FAQs by ${category.category}`}
    >
      <ThemedText
        style={[
          styles.categoryText,
          selectedCategory === category.category && styles.categoryTextActive,
        ]}
      >
        {category.category} ({category.count})
      </ThemedText>
    </TouchableOpacity>
  );

  const renderFAQ = (faq: FAQType) => {
    const isExpanded = expandedFAQ === faq._id;

    return (
      <View key={faq._id} style={styles.faqCard}>
        <TouchableOpacity
          style={styles.faqHeader}
          onPress={() => handleFAQPress(faq)}
          activeOpacity={0.7}
          accessible={true}
          accessibilityLabel={`FAQ: ${faq.question}`}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessibilityHint={isExpanded ? "Collapse answer" : "Expand to view answer"}
        >
          <View style={styles.faqIcon}>
            <Ionicons name="help-circle" size={24} color="#3B82F6" />
          </View>
          <ThemedText style={styles.faqQuestion}>{faq.question}</ThemedText>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#9CA3AF"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.faqContent}>
            <ThemedText style={styles.faqAnswer}>{faq.answer}</ThemedText>

            {faq.tags && faq.tags.length > 0 && (
              <View style={styles.faqTags}>
                {faq.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.faqFooter}>
              <ThemedText style={styles.helpfulText}>Was this helpful?</ThemedText>
              <View style={styles.helpfulButtons}>
                <TouchableOpacity
                  style={styles.helpfulButton}
                  onPress={() => handleHelpful(faq._id, true)}
                  accessible={true}
                  accessibilityLabel={`Mark as helpful, ${faq.helpfulCount} users found this helpful`}
                  accessibilityRole="button"
                  accessibilityHint="Rate this FAQ as helpful"
                >
                  <Ionicons name="thumbs-up-outline" size={18} color="#10B981" />
                  <ThemedText style={styles.helpfulCount}>{faq.helpfulCount}</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.helpfulButton}
                  onPress={() => handleHelpful(faq._id, false)}
                  accessible={true}
                  accessibilityLabel={`Mark as not helpful, ${faq.notHelpfulCount} users found this not helpful`}
                  accessibilityRole="button"
                  accessibilityHint="Rate this FAQ as not helpful"
                >
                  <Ionicons name="thumbs-down-outline" size={18} color="#EF4444" />
                  <ThemedText style={styles.helpfulCount}>{faq.notHelpfulCount}</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    );
  };

  if (loading && !faqs.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              accessible={true}
              accessibilityLabel="Go back"
              accessibilityRole="button"
              accessibilityHint="Navigate to previous screen"
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle} accessible={true} accessibilityRole="header">FAQs</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#667eea" accessible={true} accessibilityLabel="Loading FAQs" />
          <ThemedText style={styles.loadingText}>Loading FAQs...</ThemedText>
        </View>
      </View>
    );
  }

  if (error && !faqs.length) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#667eea" />
        <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>FAQs</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" translucent={true} />

      {/* Header */}
      <LinearGradient colors={['#667eea', '#764ba2'] as const} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>FAQs</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessible={true}
            accessibilityLabel="Search FAQs"
            accessibilityRole="search"
            accessibilityHint="Enter keywords to search frequently asked questions"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              accessible={true}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
              accessibilityHint="Clear the search field"
            >
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {/* Categories */}
        {categories.length > 0 && !searchQuery && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Categories</ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              <TouchableOpacity
                style={[
                  styles.categoryChip,
                  selectedCategory === null && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(null)}
              >
                <ThemedText
                  style={[
                    styles.categoryText,
                    selectedCategory === null && styles.categoryTextActive,
                  ]}
                >
                  All
                </ThemedText>
              </TouchableOpacity>
              {categories.map(renderCategory)}
            </ScrollView>
          </View>
        )}

        {/* FAQs List */}
        <View style={styles.section}>
          {searchQuery && (
            <ThemedText style={styles.resultsText}>
              {faqs.length} result{faqs.length !== 1 ? 's' : ''} for "{searchQuery}"
            </ThemedText>
          )}
          {faqs.length > 0 ? (
            faqs.map(renderFAQ)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color="#E5E7EB" />
              <ThemedText style={styles.emptyTitle}>No FAQs Found</ThemedText>
              <ThemedText style={styles.emptyDescription}>
                Try adjusting your search or browsing different categories
              </ThemedText>
            </View>
          )}
        </View>

        {/* Contact Support */}
        <View style={styles.section}>
          <View style={styles.contactCard}>
            <Ionicons name="chatbubbles" size={32} color="#667eea" />
            <View style={styles.contactContent}>
              <ThemedText style={styles.contactTitle}>Still need help?</ThemedText>
              <ThemedText style={styles.contactDescription}>
                Contact our support team for personalized assistance
              </ThemedText>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => router.push('/support' as any)}
              accessible={true}
              accessibilityLabel="Contact support team"
              accessibilityRole="button"
              accessibilityHint="Navigate to support page for personalized assistance"
            >
              <ThemedText style={styles.contactButtonText}>Contact Us</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  categoriesScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  categoryTextActive: {
    color: '#FFF',
  },
  faqCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  faqIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  faqContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  faqTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
  },
  faqFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  helpfulText: {
    fontSize: 14,
    color: '#6B7280',
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  helpfulCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  contactCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  contactContent: {
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  contactDescription: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
  },
  contactButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});
