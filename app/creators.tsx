import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'all', name: 'All Creators', count: 156 },
  { id: 'fashion', name: 'Fashion', count: 48 },
  { id: 'beauty', name: 'Beauty', count: 32 },
  { id: 'lifestyle', name: 'Lifestyle', count: 28 },
  { id: 'tech', name: 'Tech', count: 24 },
  { id: 'fitness', name: 'Fitness', count: 24 },
];

const creators = [
  {
    id: 1,
    username: 'fashionista_riya',
    name: 'Riya Sharma',
    avatar: '👩',
    verified: true,
    category: 'Fashion',
    followers: '125K',
    products: 248,
    avgRating: 4.8,
    trending: true,
    bio: 'Minimalist fashion & sustainable style',
    tags: ['Sustainable', 'Minimalist', 'Ethnic'],
  },
  {
    id: 2,
    username: 'tech_guru_arjun',
    name: 'Arjun Mehta',
    avatar: '👨',
    verified: true,
    category: 'Tech',
    followers: '95K',
    products: 156,
    avgRating: 4.9,
    trending: true,
    bio: 'Gadget reviews & tech recommendations',
    tags: ['Gadgets', 'Smart Home', 'Gaming'],
  },
  {
    id: 3,
    username: 'beauty_by_priya',
    name: 'Priya Singh',
    avatar: '👩',
    verified: true,
    category: 'Beauty',
    followers: '210K',
    products: 312,
    avgRating: 4.7,
    bio: 'Clean beauty & skincare enthusiast',
    tags: ['Skincare', 'K-Beauty', 'Organic'],
  },
  {
    id: 4,
    username: 'fit_with_vikram',
    name: 'Vikram Reddy',
    avatar: '👨',
    verified: true,
    category: 'Fitness',
    followers: '88K',
    products: 124,
    avgRating: 4.6,
    trending: true,
    bio: 'Fitness gear & nutrition expert',
    tags: ['Fitness', 'Nutrition', 'Wellness'],
  },
  {
    id: 5,
    username: 'lifestyle_neha',
    name: 'Neha Kapoor',
    avatar: '👩',
    verified: true,
    category: 'Lifestyle',
    followers: '156K',
    products: 289,
    avgRating: 4.8,
    bio: 'Home decor & lifestyle curation',
    tags: ['Home Decor', 'Plants', 'Minimal'],
  },
  {
    id: 6,
    username: 'sneaker_king',
    name: 'Rohan Gupta',
    avatar: '👨',
    verified: false,
    category: 'Fashion',
    followers: '72K',
    products: 186,
    avgRating: 4.5,
    bio: 'Sneaker culture & streetwear',
    tags: ['Sneakers', 'Streetwear', 'Limited'],
  },
  {
    id: 7,
    username: 'makeup_magic_sara',
    name: 'Sara Khan',
    avatar: '👩',
    verified: true,
    category: 'Beauty',
    followers: '142K',
    products: 267,
    avgRating: 4.9,
    trending: true,
    bio: 'Makeup artist & beauty creator',
    tags: ['Makeup', 'Bridal', 'Tutorials'],
  },
  {
    id: 8,
    username: 'gadget_geek_amit',
    name: 'Amit Patel',
    avatar: '👨',
    verified: false,
    category: 'Tech',
    followers: '64K',
    products: 98,
    avgRating: 4.4,
    bio: 'Budget tech & accessories',
    tags: ['Budget Tech', 'Accessories', 'DIY'],
  },
];

export default function CreatorsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('trending');

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || creator.category.toLowerCase() === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedCreators = [...filteredCreators].sort((a, b) => {
    if (sortBy === 'trending') return (b.trending ? 1 : 0) - (a.trending ? 1 : 0);
    if (sortBy === 'followers') return parseInt(b.followers) - parseInt(a.followers);
    if (sortBy === 'rating') return b.avgRating - a.avgRating;
    return 0;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>All Creators</Text>
          <Text style={styles.headerSubtitle}>{sortedCreators.length} creators</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search creators..."
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      {/* Category Filters */}
      <View style={styles.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.categoryPill,
                selectedCategory === cat.id && styles.categoryPillActive,
              ]}
            >
              {selectedCategory === cat.id ? (
                <LinearGradient
                  colors={['#9333EA', '#EC4899']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.categoryPillGradient}
                >
                  <Text style={styles.categoryPillTextActive}>
                    {cat.name} ({cat.count})
                  </Text>
                </LinearGradient>
              ) : (
                <Text style={styles.categoryPillText}>
                  {cat.name} ({cat.count})
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Options */}
      <View style={styles.sortContainer}>
        {[
          { id: 'trending', name: 'Trending', icon: 'trending-up' },
          { id: 'followers', name: 'Most Followers', icon: 'people' },
          { id: 'rating', name: 'Top Rated', icon: 'star' },
        ].map((sort) => (
          <TouchableOpacity
            key={sort.id}
            onPress={() => setSortBy(sort.id)}
            style={[
              styles.sortPill,
              sortBy === sort.id && styles.sortPillActive,
            ]}
          >
            <Ionicons
              name={sort.icon as any}
              size={14}
              color={sortBy === sort.id ? '#FFFFFF' : '#6B7280'}
            />
            <Text style={[
              styles.sortPillText,
              sortBy === sort.id && styles.sortPillTextActive,
            ]}>
              {sort.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Creators List */}
        {sortedCreators.map((creator) => (
          <TouchableOpacity
            key={creator.id}
            style={styles.creatorCard}
            onPress={() => router.push(`/creator/${creator.username}`)}
          >
            {/* Creator Header */}
            <View style={styles.creatorHeader}>
              <LinearGradient
                colors={['#9333EA', '#EC4899']}
                style={styles.avatarContainer}
              >
                <Text style={styles.avatar}>{creator.avatar}</Text>
              </LinearGradient>
              <View style={styles.creatorInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.creatorName}>{creator.name}</Text>
                  {creator.verified && (
                    <Ionicons name="checkmark-circle" size={16} color="#3B82F6" />
                  )}
                  {creator.trending && (
                    <View style={styles.trendingBadge}>
                      <Ionicons name="trending-up" size={10} color="#EF4444" />
                      <Text style={styles.trendingText}>Trending</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.username}>@{creator.username}</Text>
                <Text style={styles.bio} numberOfLines={1}>{creator.bio}</Text>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {creator.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statsLeft}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={16} color="#9CA3AF" />
                  <Text style={styles.statValue}>{creator.followers}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="bag" size={16} color="#9CA3AF" />
                  <Text style={styles.statValue}>{creator.products}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="star" size={16} color="#F59E0B" />
                  <Text style={styles.statValue}>{creator.avgRating}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Become a Creator CTA */}
        <View style={styles.ctaContainer}>
          <LinearGradient
            colors={['rgba(147, 51, 234, 0.1)', 'rgba(236, 72, 153, 0.1)', 'rgba(249, 115, 22, 0.1)']}
            style={styles.ctaCard}
          >
            <LinearGradient
              colors={['#9333EA', '#EC4899']}
              style={styles.ctaIcon}
            >
              <Ionicons name="sparkles" size={32} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.ctaTitle}>Become a ReZ Creator</Text>
            <Text style={styles.ctaSubtitle}>
              Share your picks, build your store, earn from every sale
            </Text>
            <TouchableOpacity>
              <LinearGradient
                colors={['#9333EA', '#EC4899']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>Apply Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  categoryPill: {
    marginRight: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  categoryPillActive: {},
  categoryPillGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  categoryPillTextActive: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  sortPillActive: {
    backgroundColor: '#3B82F6',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  sortPillTextActive: {
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  creatorCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  creatorHeader: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    fontSize: 28,
  },
  creatorInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  trendingText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EF4444',
  },
  username: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  bio: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
  tagText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  statsLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
  },
  ctaContainer: {
    marginTop: 12,
  },
  ctaCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ctaButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
