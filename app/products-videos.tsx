import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { usePlayPageData } from '@/hooks/usePlayPageData';
import { UGCVideoItem, PLAY_PAGE_COLORS } from '@/types/playPage.types';
import ThumbnailVideoCard from '@/components/playPage/ThumbnailVideoCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

export default function ProductsVideosPage() {
  const router = useRouter();
  const { state, actions } = usePlayPageData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All', icon: 'grid-outline' },
    { id: 'fashion', label: 'Fashion', icon: 'shirt-outline' },
    { id: 'beauty', label: 'Beauty', icon: 'sparkles-outline' },
    { id: 'lifestyle', label: 'Lifestyle', icon: 'home-outline' },
    { id: 'tech', label: 'Tech', icon: 'phone-portrait-outline' },
  ];

  // Filter products based on search and category
  const filteredProducts = state.merchantVideos.filter((video) => {
    const matchesSearch = video.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleVideoPress = useCallback((video: UGCVideoItem) => {
    actions.navigateToDetail(video);
  }, [actions]);

  const renderVideoCard = ({ item }: { item: UGCVideoItem }) => (
    <View style={{ width: CARD_WIDTH }}>
      <ThumbnailVideoCard
        item={item}
        onPress={handleVideoPress}
        showHashtags={true}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Animated Header with Glassmorphism */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7', '#C084FC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              {/* Back Button */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={24} color="#FFF" />
              </TouchableOpacity>

              {/* Title */}
              <View style={styles.headerTitleContainer}>
                <ThemedText style={styles.headerTitle}>Products</ThemedText>
                <ThemedText style={styles.headerSubtitle}>
                  {filteredProducts.length} videos
                </ThemedText>
              </View>

              {/* Filter Button */}
              <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
                <Ionicons name="options-outline" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
          </BlurView>
        ) : (
          <View style={styles.headerContent}>
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>

            {/* Title */}
            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Products</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                {filteredProducts.length} videos
              </ThemedText>
            </View>

            {/* Filter Button */}
            <TouchableOpacity style={styles.filterButton} activeOpacity={0.7}>
              <Ionicons name="options-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Search Bar with Glassmorphism */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#8B5CF6"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryPill,
              selectedCategory === category.id && styles.categoryPillActive,
            ]}
            onPress={() => setSelectedCategory(category.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={category.icon as any}
              size={18}
              color={selectedCategory === category.id ? '#FFF' : '#8B5CF6'}
            />
            <ThemedText
              style={[
                styles.categoryPillText,
                selectedCategory === category.id && styles.categoryPillTextActive,
              ]}
            >
              {category.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderVideoCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <LinearGradient
              colors={['rgba(139, 92, 246, 0.1)', 'rgba(168, 85, 247, 0.05)']}
              style={styles.emptyGradient}
            >
              <Ionicons name="videocam-off-outline" size={64} color="#C084FC" />
              <ThemedText style={styles.emptyTitle}>No Products Found</ThemedText>
              <ThemedText style={styles.emptySubtitle}>
                Try adjusting your search or filters
              </ThemedText>
            </LinearGradient>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  headerBlur: {
    paddingHorizontal: 16,
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  clearButton: {
    padding: 4,
  },
  categoriesContainer: {
    maxHeight: 60,
    backgroundColor: '#F9FAFB',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 12,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFF',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryPillActive: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  categoryPillText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  categoryPillTextActive: {
    color: '#FFF',
  },
  gridRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  gridContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyGradient: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    borderRadius: 24,
    width: SCREEN_WIDTH - 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
  },
});
