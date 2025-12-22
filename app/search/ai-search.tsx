// AI Search Page
// Natural language product search

import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  TextInput,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

interface AIResult {
  id: string;
  type: 'product' | 'store' | 'offer';
  title: string;
  subtitle: string;
  price?: string;
  image: string;
  relevance: number;
}

const EXAMPLE_PROMPTS = [
  "Find me a gift for my mom under ₹2000",
  "Best coffee shops near me with wifi",
  "Comfortable running shoes for beginners",
  "Romantic dinner date options",
  "Healthy meal delivery options",
];

const MOCK_RESULTS: AIResult[] = [
  { id: '1', type: 'product', title: 'Spa Gift Set', subtitle: 'Perfect for mothers', price: '₹1,499', image: '💆', relevance: 95 },
  { id: '2', type: 'product', title: 'Silk Scarf Collection', subtitle: 'Premium quality', price: '₹1,899', image: '🧣', relevance: 90 },
  { id: '3', type: 'store', title: 'The Body Shop', subtitle: 'Skincare & wellness', image: '🧴', relevance: 88 },
  { id: '4', type: 'offer', title: '30% Off Jewelry', subtitle: 'Limited time offer', price: 'Save ₹600', image: '💎', relevance: 85 },
  { id: '5', type: 'product', title: 'Aromatherapy Candles', subtitle: 'Handcrafted', price: '₹899', image: '🕯️', relevance: 82 },
];

export default function AISearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AIResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    setHasSearched(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setResults(MOCK_RESULTS);
    setSearching(false);
  };

  const handlePromptSelect = (prompt: string) => {
    setQuery(prompt);
    inputRef.current?.focus();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'product': return Colors.primary[600];
      case 'store': return Colors.info;
      case 'offer': return Colors.success;
      default: return Colors.gray[500];
    }
  };

  const renderResult = ({ item }: { item: AIResult }) => (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => router.push(`/${item.type}/${item.id}` as any)}
    >
      <View style={styles.relevanceBadge}>
        <ThemedText style={styles.relevanceText}>{item.relevance}% match</ThemedText>
      </View>

      <View style={styles.resultImage}>
        <ThemedText style={styles.resultEmoji}>{item.image}</ThemedText>
      </View>

      <View style={styles.resultInfo}>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <ThemedText style={[styles.typeText, { color: getTypeColor(item.type) }]}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </ThemedText>
        </View>
        <ThemedText style={styles.resultTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.resultSubtitle}>{item.subtitle}</ThemedText>
        {item.price && (
          <ThemedText style={styles.resultPrice}>{item.price}</ThemedText>
        )}
      </View>

      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary[600]} />

      <LinearGradient
        colors={[Colors.primary[600], Colors.secondary[700]]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>AI Search</ThemedText>
          <TouchableOpacity style={styles.voiceButton}>
            <Ionicons name="mic-outline" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="sparkles" size={20} color={Colors.gold} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Describe what you're looking for..."
              placeholderTextColor="rgba(255,255,255,0.6)"
              multiline
              onSubmitEditing={handleSearch}
            />
          </View>
          <TouchableOpacity
            style={[styles.searchButton, !query.trim() && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!query.trim() || searching}
          >
            {searching ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Ionicons name="search" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {!hasSearched ? (
        <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
          <View style={styles.aiInfoCard}>
            <View style={styles.aiIconContainer}>
              <Ionicons name="sparkles" size={32} color={Colors.gold} />
            </View>
            <ThemedText style={styles.aiTitle}>AI-Powered Search</ThemedText>
            <ThemedText style={styles.aiText}>
              Describe what you need in your own words, and our AI will find the perfect matches for you.
            </ThemedText>
          </View>

          <ThemedText style={styles.sectionTitle}>Try asking...</ThemedText>
          <View style={styles.promptsContainer}>
            {EXAMPLE_PROMPTS.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={styles.promptCard}
                onPress={() => handlePromptSelect(prompt)}
              >
                <Ionicons name="chatbubble-outline" size={16} color={Colors.primary[600]} />
                <ThemedText style={styles.promptText}>{prompt}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.featuresSection}>
            <ThemedText style={styles.featuresTitle}>What AI Search can do</ThemedText>
            <View style={styles.featureItem}>
              <Ionicons name="bulb-outline" size={20} color={Colors.gold} />
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureLabel}>Understand Context</ThemedText>
                <ThemedText style={styles.featureText}>
                  "Gift for techie husband" → Tech gadgets, accessories
                </ThemedText>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="pricetag-outline" size={20} color={Colors.success} />
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureLabel}>Budget Aware</ThemedText>
                <ThemedText style={styles.featureText}>
                  "Under ₹5000" → Filters by your budget
                </ThemedText>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="location-outline" size={20} color={Colors.info} />
              <View style={styles.featureContent}>
                <ThemedText style={styles.featureLabel}>Location Smart</ThemedText>
                <ThemedText style={styles.featureText}>
                  "Near me" → Uses your location
                </ThemedText>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : searching ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingAnimation}>
            <Ionicons name="sparkles" size={48} color={Colors.gold} />
          </View>
          <ThemedText style={styles.loadingTitle}>Finding perfect matches...</ThemedText>
          <ThemedText style={styles.loadingText}>
            Analyzing your request and searching across products, stores, and offers
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <ThemedText style={styles.resultsTitle}>
                {results.length} results for "{query}"
              </ThemedText>
              <ThemedText style={styles.resultsSubtitle}>
                Sorted by relevance
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.text.tertiary} />
              <ThemedText style={styles.emptyTitle}>No results found</ThemedText>
              <ThemedText style={styles.emptyText}>
                Try rephrasing your search or being more specific
              </ThemedText>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
  },
  voiceButton: {
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: '#FFF',
    maxHeight: 80,
  },
  searchButton: {
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  searchButtonDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  aiInfoCard: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.subtle,
  },
  aiIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gold + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  aiTitle: {
    ...Typography.h3,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  aiText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  sectionTitle: {
    ...Typography.label,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
  },
  promptsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  promptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    ...Shadows.subtle,
  },
  promptText: {
    ...Typography.body,
    color: Colors.text.primary,
    flex: 1,
  },
  featuresSection: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.subtle,
  },
  featuresTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureContent: {
    flex: 1,
  },
  featureLabel: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  featureText: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  loadingAnimation: {
    marginBottom: Spacing.lg,
  },
  loadingTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  loadingText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  resultsHeader: {
    marginBottom: Spacing.lg,
  },
  resultsTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
  },
  resultsSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.md,
    position: 'relative',
    ...Shadows.subtle,
  },
  relevanceBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.gold + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  relevanceText: {
    ...Typography.caption,
    color: Colors.gold,
    fontSize: 10,
    fontWeight: '700',
  },
  resultImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultEmoji: {
    fontSize: 28,
  },
  resultInfo: {
    flex: 1,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginBottom: Spacing.xs,
  },
  typeText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  resultTitle: {
    ...Typography.label,
    color: Colors.text.primary,
  },
  resultSubtitle: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  resultPrice: {
    ...Typography.label,
    color: Colors.success,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
