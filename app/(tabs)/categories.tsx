import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CATEGORY_CONFIGS, getAllCategories, CategoryConfig, SubcategoryItem } from '@/config/categoryConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 90;
const CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;

// ============ SIDEBAR CATEGORIES FROM CONFIG ============
interface SidebarCategory {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  subcategoryCount: number;
  image?: string;
}

// Generate sidebar categories from categoryConfig
const SIDEBAR_CATEGORIES: SidebarCategory[] = Object.values(CATEGORY_CONFIGS).map(cat => ({
  id: cat.slug,
  name: cat.name,
  icon: cat.icon as keyof typeof Ionicons.glyphMap,
  color: cat.primaryColor,
  bgColor: `${cat.primaryColor}20`, // 20% opacity
  subcategoryCount: cat.subcategories.length,
}));

// Images for main categories (using unsplash for better quality)
const CATEGORY_IMAGES: Record<string, string> = {
  'food-dining': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=100&h=100&fit=crop',
  'grocery-essentials': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop',
  'beauty-wellness': 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=100&h=100&fit=crop',
  'healthcare': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop',
  'fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=100&h=100&fit=crop',
  'fitness-sports': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=100&h=100&fit=crop',
  'education-learning': 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=100&h=100&fit=crop',
  'home-services': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop',
  'travel-experiences': 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=100&h=100&fit=crop',
  'entertainment': 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&h=100&fit=crop',
  'financial-lifestyle': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=100&h=100&fit=crop',
};

// Calculate total subcategories
const TOTAL_SUBCATEGORIES = Object.values(CATEGORY_CONFIGS).reduce(
  (sum, cat) => sum + cat.subcategories.length,
  0
);

// ============ INTERFACES ============
interface SubcategoryWithParent extends SubcategoryItem {
  parentSlug: string;
  parentName: string;
  color: string;
}

// ============ SIDEBAR COMPONENT ============
interface SidebarProps {
  categories: SidebarCategory[];
  selectedCategory: string | null;
  onCategoryPress: (categoryId: string | null) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ categories, selectedCategory, onCategoryPress }) => (
  <View style={sidebarStyles.container}>
    <View style={sidebarStyles.header}>
      <Ionicons name="star" size={18} color="#FF9800" />
      <ThemedText style={sidebarStyles.headerTitle}>Categories</ThemedText>
    </View>
    <ScrollView style={sidebarStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* All Option */}
      <TouchableOpacity
        style={[sidebarStyles.item, selectedCategory === null && sidebarStyles.itemSelected]}
        onPress={() => onCategoryPress(null)}
      >
        <View style={[sidebarStyles.iconBox, { backgroundColor: '#E8F5E9' }, selectedCategory === null && sidebarStyles.iconBoxSelected]}>
          <Ionicons name="apps" size={22} color="#00C06A" />
        </View>
        <ThemedText style={[sidebarStyles.itemText, selectedCategory === null && sidebarStyles.itemTextSelected]}>All</ThemedText>
      </TouchableOpacity>

      {/* Category Items */}
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;
        const categoryImage = CATEGORY_IMAGES[category.id];
        return (
          <TouchableOpacity
            key={category.id}
            style={[sidebarStyles.item, isSelected && sidebarStyles.itemSelected]}
            onPress={() => onCategoryPress(category.id)}
          >
            <View style={[sidebarStyles.iconBox, { backgroundColor: category.bgColor }, isSelected && sidebarStyles.iconBoxSelected]}>
              {categoryImage ? (
                <Image source={{ uri: categoryImage }} style={sidebarStyles.iconImage} />
              ) : (
                <Ionicons name={category.icon} size={22} color={category.color} />
              )}
            </View>
            <ThemedText style={[sidebarStyles.itemText, isSelected && sidebarStyles.itemTextSelected]} numberOfLines={2}>
              {category.name}
            </ThemedText>
            <ThemedText style={sidebarStyles.countText}>{category.subcategoryCount}</ThemedText>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const sidebarStyles = StyleSheet.create({
  container: { width: 85, backgroundColor: '#F8FAFC', borderRightWidth: 1, borderRightColor: '#E2E8F0' },
  header: { alignItems: 'center', paddingVertical: 10, backgroundColor: '#FFF9E6', borderBottomWidth: 1, borderBottomColor: '#FFE082' },
  headerTitle: { fontSize: 9, fontWeight: '700', color: '#F57C00', marginTop: 2 },
  scrollView: { flex: 1 },
  item: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 4, borderLeftWidth: 3, borderLeftColor: 'transparent' },
  itemSelected: { backgroundColor: '#FFFFFF', borderLeftColor: '#00C06A' },
  iconBox: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  iconBoxSelected: { borderWidth: 2, borderColor: '#00C06A' },
  iconImage: { width: '100%', height: '100%' },
  itemText: { fontSize: 9, fontWeight: '500', color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 11 },
  itemTextSelected: { color: '#00C06A', fontWeight: '700' },
  countText: { fontSize: 8, color: '#9CA3AF', marginTop: 1 },
});

// ============ MAIN COMPONENT ============
export default function CategoriesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  // Get subcategories based on selected category
  const displayedSubcategories = useMemo((): SubcategoryWithParent[] => {
    if (!selectedCategory) {
      // "All" selected - show first 2 subcategories from each main category
      return Object.values(CATEGORY_CONFIGS).flatMap(cat =>
        cat.subcategories.slice(0, 2).map(sub => ({
          ...sub,
          parentSlug: cat.slug,
          parentName: cat.name,
          color: cat.primaryColor,
        }))
      );
    }
    const config = CATEGORY_CONFIGS[selectedCategory];
    return config?.subcategories.map(sub => ({
      ...sub,
      parentSlug: config.slug,
      parentName: config.name,
      color: config.primaryColor,
    })) || [];
  }, [selectedCategory]);

  const currentCategory = useMemo(() =>
    selectedCategory ? SIDEBAR_CATEGORIES.find(c => c.id === selectedCategory) : null,
  [selectedCategory]);

  const totalInCurrentView = useMemo(() => {
    if (!selectedCategory) return TOTAL_SUBCATEGORIES;
    return CATEGORY_CONFIGS[selectedCategory]?.subcategories.length || 0;
  }, [selectedCategory]);

  // Handle subcategory press - navigate to StoreListPage
  const handleSubcategoryPress = useCallback((subcategory: SubcategoryWithParent) => {
    router.push({
      pathname: '/StoreListPage',
      params: {
        category: subcategory.parentSlug,
        title: subcategory.name,
      },
    } as any);
  }, [router]);

  const handleCategoryPress = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setShowAll(false);
  }, []);

  const numColumns = 3;
  const itemWidth = (CONTENT_WIDTH - 24) / numColumns;

  const renderItem = ({ item, index }: { item: SubcategoryWithParent; index: number }) => {
    // Mix of picsum images and colored icon circles for variety
    // Use images for 2 out of 3 items
    const usePicsumImage = index % 3 !== 2;
    const imageUrl = usePicsumImage
      ? `https://picsum.photos/100/100?random=${item.slug.charCodeAt(0) + index * 7}`
      : null;

    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: itemWidth }]}
        onPress={() => handleSubcategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.circleCard,
          !imageUrl && { backgroundColor: item.color + '20' }
        ]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.circleImage} />
          ) : (
            <Ionicons
              name={(item.icon as keyof typeof Ionicons.glyphMap) || 'grid-outline'}
              size={28}
              color={item.color}
            />
          )}
        </View>
        <ThemedText style={styles.subcategoryName} numberOfLines={2}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#00C06A', '#00A05A', '#008B4A']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Categories</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{TOTAL_SUBCATEGORIES} items to explore</ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.mainContainer}>
        <Sidebar
          categories={SIDEBAR_CATEGORIES}
          selectedCategory={selectedCategory}
          onCategoryPress={handleCategoryPress}
        />

        <View style={styles.contentContainer}>
          <FlatList
            data={displayedSubcategories}
            renderItem={renderItem}
            keyExtractor={(item) => `${item.parentSlug}-${item.slug}`}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  {currentCategory ? (
                    <>
                      <View style={[styles.groupBadge, { backgroundColor: currentCategory.bgColor }]}>
                        <Ionicons name={currentCategory.icon} size={14} color={currentCategory.color} />
                      </View>
                      <ThemedText style={styles.sectionTitle}>{currentCategory.name}</ThemedText>
                    </>
                  ) : (
                    <>
                      <Ionicons name="apps" size={18} color="#00C06A" />
                      <ThemedText style={styles.sectionTitle}>All Categories</ThemedText>
                    </>
                  )}
                  <ThemedText style={styles.countText}>({totalInCurrentView})</ThemedText>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
                <ThemedText style={styles.emptyText}>No subcategories found</ThemedText>
              </View>
            }
            ListFooterComponent={
              <View style={styles.footerContainer}>
                {!selectedCategory && (
                  <TouchableOpacity style={styles.seeAllButton} onPress={() => setShowAll(true)}>
                    <ThemedText style={styles.seeAllText}>See All {TOTAL_SUBCATEGORIES}</ThemedText>
                    <Ionicons name="chevron-forward" size={16} color="#00C06A" />
                  </TouchableOpacity>
                )}
                <ThemedText style={styles.showingText}>
                  Showing {displayedSubcategories.length} of {totalInCurrentView}
                </ThemedText>
                <View style={{ height: 80 }} />
              </View>
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0, paddingBottom: 12, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  mainContainer: { flex: 1, flexDirection: 'row' },
  contentContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  gridContent: { paddingHorizontal: 8, paddingBottom: 16 },
  gridItem: { alignItems: 'center', marginBottom: 16, paddingHorizontal: 4 },
  circleCard: {
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  circleImage: {
    width: '100%',
    height: '100%',
  },
  subcategoryName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    maxWidth: 80,
  },
  sectionHeader: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  countText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
  footerContainer: { alignItems: 'center', paddingVertical: 16 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, gap: 4, marginBottom: 8 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: '#00C06A' },
  showingText: { fontSize: 11, color: '#9CA3AF' },
});
