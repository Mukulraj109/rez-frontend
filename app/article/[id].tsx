import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { ThemedText } from '@/components/ThemedText';
import { Article } from '@/types/article.types';
import articlesService from '@/services/articlesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ArticleDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const isCreateMode = id === 'create';
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState<string | null>(null);

  // Fetch article from backend
  useEffect(() => {
    if (!isCreateMode && id) {
      fetchArticle();
    }
  }, [id, isCreateMode]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📰 [ArticleDetail] Fetching article:', id);

      const response = await articlesService.getArticleById(id as string);

      if (response.success && response.data.article) {
        setArticle(response.data.article as any);
        console.log('✅ [ArticleDetail] Article loaded:', response.data.article);
      } else {
        setError('Article not found');
        console.error('❌ [ArticleDetail] Article not found');
      }
    } catch (err) {
      console.error('❌ [ArticleDetail] Error fetching article:', err);
      setError('Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Article</ThemedText>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <ThemedText style={styles.loadingText}>Loading article...</ThemedText>
        </View>
      </View>
    );
  }

  // Error or not found state
  if (!article && !isCreateMode) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#8B5CF6', '#A855F7', '#C084FC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerGradient}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Article</ThemedText>
            </View>
          </View>
        </LinearGradient>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
          <ThemedText style={styles.errorTitle}>{error || 'Article not found'}</ThemedText>
          <ThemedText style={styles.errorSubtitle}>
            The article you're looking for doesn't exist or has been removed.
          </ThemedText>
          <TouchableOpacity
            style={styles.backToListButton}
            onPress={() => router.back()}
          >
            <LinearGradient
              colors={['#8B5CF6', '#A855F7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.backToListGradient}
            >
              <Ionicons name="arrow-back" size={20} color="#FFF" />
              <ThemedText style={styles.backToListText}>Go Back</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Floating Back Button */}
      <TouchableOpacity
        style={styles.floatingBackButton}
        onPress={() => router.back()}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.4)']}
          style={styles.floatingBackGradient}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Hero Cover Image */}
        {article?.coverImage && (
          <View style={styles.heroImageContainer}>
            <Image
              source={{ uri: article.coverImage }}
              style={styles.heroImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0, 0, 0, 0.7)']}
              style={styles.heroGradient}
            />
          </View>
        )}

        {/* Article Content */}
        <View style={styles.articleContainer}>
          {/* Category Badge */}
          {article?.category && (
            <View style={styles.categoryBadge}>
              <LinearGradient
                colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.05)']}
                style={styles.categoryBadgeGradient}
              >
                <ThemedText style={styles.categoryText}>
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </ThemedText>
              </LinearGradient>
            </View>
          )}

          {/* Title */}
          <ThemedText style={styles.articleTitle}>{article?.title}</ThemedText>

          {/* Author & Meta Info */}
          {article?.author && (
            <View style={styles.authorSection}>
              <View style={styles.authorContainer}>
                {article.author.avatar ? (
                  <Image
                    source={{ uri: article.author.avatar }}
                    style={styles.authorAvatar}
                  />
                ) : (
                  <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                    <Ionicons name="person" size={20} color="#8B5CF6" />
                  </View>
                )}
                <View style={styles.authorInfo}>
                  <ThemedText style={styles.authorName}>
                    {article.author.name}
                  </ThemedText>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                    <ThemedText style={styles.metaText}>
                      {article.readTime || '5 min read'}
                    </ThemedText>
                    <ThemedText style={styles.metaDot}>•</ThemedText>
                    <Ionicons name="eye-outline" size={14} color="#6B7280" />
                    <ThemedText style={styles.metaText}>{article.viewCount}</ThemedText>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="heart-outline" size={24} color="#EF4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="bookmark-outline" size={24} color="#8B5CF6" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Ionicons name="share-social-outline" size={24} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Article Content with Markdown Rendering */}
          {article?.content && (
            <View style={styles.contentSection}>
              <Markdown style={markdownStyles}>
                {article.content}
              </Markdown>
            </View>
          )}

          {/* Tags */}
          {article?.tags && article.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <View style={styles.tagsDivider} />
              <ThemedText style={styles.tagsLabel}>Related Topics</ThemedText>
              <View style={styles.tagsContainer}>
                {article.tags.map((tag, index) => (
                  <TouchableOpacity key={index} style={styles.tag} activeOpacity={0.7}>
                    <Ionicons name="pricetag" size={14} color="#8B5CF6" />
                    <ThemedText style={styles.tagText}>
                      {tag.replace(/-/g, ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </View>
      </ScrollView>
    </View>
  );
}

// Markdown Styles
const markdownStyles = StyleSheet.create({
  body: {
    color: '#374151',
    fontSize: 17,
    lineHeight: 28,
    fontWeight: '400',
  },
  heading1: {
    color: '#1F2937',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 16,
    lineHeight: 36,
  },
  heading2: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: '700',
    marginTop: 24,
    marginBottom: 14,
    lineHeight: 32,
  },
  heading3: {
    color: '#374151',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    lineHeight: 28,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 16,
    color: '#374151',
    fontSize: 17,
    lineHeight: 28,
  },
  strong: {
    fontWeight: '700',
    color: '#1F2937',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginBottom: 16,
  },
  ordered_list: {
    marginBottom: 16,
  },
  list_item: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet_list_icon: {
    color: '#8B5CF6',
    fontSize: 20,
    lineHeight: 28,
    marginRight: 8,
  },
  blockquote: {
    backgroundColor: 'rgba(139, 92, 246, 0.05)',
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  code_inline: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    color: '#8B5CF6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  code_block: {
    backgroundColor: '#1F2937',
    color: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  link: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  floatingBackButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  floatingBackGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  heroImageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.75,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  articleContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 24,
    paddingHorizontal: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryBadgeGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  articleTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 40,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  authorSection: {
    marginBottom: 24,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  contentSection: {
    marginBottom: 32,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 24,
  },
  tagsLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'capitalize',
  },
  bottomSpacing: {
    height: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  backToListButton: {
    width: 200,
    height: 50,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backToListGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
