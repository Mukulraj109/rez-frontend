import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
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
import CategoryImageCard from '@/components/categories/CategoryImageCard';
import CategoryGridSkeleton from '@/components/skeletons/CategoryGridSkeleton';
import categoriesApi from '@/services/categoriesApi';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SIDEBAR_WIDTH = 90;
const CONTENT_WIDTH = SCREEN_WIDTH - SIDEBAR_WIDTH;
const ITEMS_PER_PAGE = 12;

// ============ CATEGORY GROUPS CONFIG ============
interface CategoryGroup {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  keywords: string[];
  image: string;
}

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    id: 'fashion-beauty',
    name: 'Fashion & Beauty',
    icon: 'shirt-outline',
    color: '#E91E63',
    bgColor: '#FCE4EC',
    keywords: ['fashion', 'clothing', 'shirt', 'dress', 'wear', 'shoes', 'footwear', 'sandal', 'heel', 'beauty', 'makeup', 'cosmetic', 'skincare', 'haircare', 'fragrance', 'perfume', 'jewelry', 'jewellery', 'watch', 'accessori', 'bag', 'wallet', 'belt', 'sunglass', 'eyewear', 'hat', 'cap'],
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=200&h=200&fit=crop',
  },
  {
    id: 'food-dining',
    name: 'Food & Dining',
    icon: 'restaurant-outline',
    color: '#FF5722',
    bgColor: '#FBE9E7',
    keywords: ['food', 'restaurant', 'cuisine', 'cafe', 'bakery', 'dessert', 'sweet', 'snack', 'beverage', 'drink', 'continental', 'italian', 'chinese', 'indian', 'fast-food', 'pizza', 'burger'],
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop',
  },
  {
    id: 'grocery-essentials',
    name: 'Grocery',
    icon: 'cart-outline',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
    keywords: ['grocery', 'supermarket', 'vegetable', 'fruit', 'dairy', 'meat', 'seafood', 'organic', 'fresh', 'frozen', 'staple', 'essential'],
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop',
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: 'phone-portrait-outline',
    color: '#2196F3',
    bgColor: '#E3F2FD',
    keywords: ['electronic', 'mobile', 'phone', 'laptop', 'computer', 'tablet', 'camera', 'audio', 'headphone', 'speaker', 'tv', 'television', 'appliance', 'refrigerator', 'washing', 'air-condition', 'smart', 'gadget', 'wearable'],
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop',
  },
  {
    id: 'home-living',
    name: 'Home & Living',
    icon: 'home-outline',
    color: '#795548',
    bgColor: '#EFEBE9',
    keywords: ['home', 'furniture', 'decor', 'kitchen', 'bedding', 'bath', 'curtain', 'rug', 'lighting', 'storage', 'garden', 'outdoor', 'cookware', 'dinnerware'],
    image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=200&h=200&fit=crop',
  },
  {
    id: 'health-wellness',
    name: 'Health',
    icon: 'fitness-outline',
    color: '#00BCD4',
    bgColor: '#E0F7FA',
    keywords: ['health', 'medicine', 'pharmacy', 'medical', 'wellness', 'fitness', 'gym', 'supplement', 'vitamin', 'personal-care', 'hygiene'],
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop',
  },
  {
    id: 'auto-vehicles',
    name: 'Auto',
    icon: 'car-outline',
    color: '#607D8B',
    bgColor: '#ECEFF1',
    keywords: ['auto', 'car', 'vehicle', 'bike', 'motorcycle', 'two-wheeler', 'four-wheeler', 'commercial', 'fleet', 'electric-vehicle'],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=200&h=200&fit=crop',
  },
  {
    id: 'kids-toys',
    name: 'Kids & Toys',
    icon: 'happy-outline',
    color: '#FF9800',
    bgColor: '#FFF3E0',
    keywords: ['kid', 'baby', 'toy', 'game', 'children', 'infant', 'maternity', 'boys', 'girls'],
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=200&h=200&fit=crop',
  },
  {
    id: 'sports-outdoor',
    name: 'Sports',
    icon: 'football-outline',
    color: '#8BC34A',
    bgColor: '#F1F8E9',
    keywords: ['sport', 'fitness', 'outdoor', 'camping', 'hiking', 'cycling', 'swimming', 'gym', 'exercise', 'yoga'],
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=200&h=200&fit=crop',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: 'game-controller-outline',
    color: '#9C27B0',
    bgColor: '#F3E5F5',
    keywords: ['entertainment', 'gaming', 'movie', 'music', 'book', 'stationery', 'amusement', 'park', 'travel', 'hotel', 'luggage'],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=200&h=200&fit=crop',
  },
  {
    id: 'services',
    name: 'Services',
    icon: 'construct-outline',
    color: '#3F51B5',
    bgColor: '#E8EAF6',
    keywords: ['service', 'repair', 'cleaning', 'professional', 'home-service', 'maintenance'],
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=200&h=200&fit=crop',
  },
];

// Get group for a category
function getCategoryGroup(category: { name: string; slug: string }): CategoryGroup | null {
  const searchText = `${category.name} ${category.slug}`.toLowerCase();
  for (const group of CATEGORY_GROUPS) {
    for (const keyword of group.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return group;
      }
    }
  }
  return null;
}

// Group categories
function groupCategories(categories: Category[]): Map<string, Category[]> {
  const grouped = new Map<string, Category[]>();
  CATEGORY_GROUPS.forEach(group => grouped.set(group.id, []));
  grouped.set('other', []);

  categories.forEach(category => {
    const group = getCategoryGroup(category);
    if (group) {
      grouped.get(group.id)?.push(category);
    } else {
      grouped.get('other')?.push(category);
    }
  });

  return grouped;
}

// Get group by ID
function getGroupById(id: string): CategoryGroup | undefined {
  return CATEGORY_GROUPS.find(g => g.id === id);
}

// ============ INTERFACES ============
interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  type?: string;
  metadata?: {
    color?: string;
    featured?: boolean;
  };
  sortOrder?: number;
}

// ============ SIDEBAR COMPONENT ============
interface SidebarProps {
  groups: CategoryGroup[];
  selectedGroup: string | null;
  onGroupPress: (groupId: string) => void;
  groupCounts: Map<string, number>;
}

const Sidebar: React.FC<SidebarProps> = ({ groups, selectedGroup, onGroupPress, groupCounts }) => (
  <View style={sidebarStyles.container}>
    <View style={sidebarStyles.header}>
      <Ionicons name="star" size={18} color="#FF9800" />
      <ThemedText style={sidebarStyles.headerTitle}>Categories</ThemedText>
    </View>
    <ScrollView style={sidebarStyles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* All Option */}
      <TouchableOpacity
        style={[sidebarStyles.item, selectedGroup === null && sidebarStyles.itemSelected]}
        onPress={() => onGroupPress('')}
      >
        <View style={[sidebarStyles.iconBox, { backgroundColor: '#E8F5E9' }, selectedGroup === null && sidebarStyles.iconBoxSelected]}>
          <Ionicons name="apps" size={22} color="#00C06A" />
        </View>
        <ThemedText style={[sidebarStyles.itemText, selectedGroup === null && sidebarStyles.itemTextSelected]}>All</ThemedText>
      </TouchableOpacity>

      {/* Groups */}
      {groups.map((group) => {
        const isSelected = selectedGroup === group.id;
        const count = groupCounts.get(group.id) || 0;
        return (
          <TouchableOpacity
            key={group.id}
            style={[sidebarStyles.item, isSelected && sidebarStyles.itemSelected]}
            onPress={() => onGroupPress(group.id)}
          >
            <View style={[sidebarStyles.iconBox, { backgroundColor: group.bgColor }, isSelected && sidebarStyles.iconBoxSelected]}>
              {group.image ? (
                <Image source={{ uri: group.image }} style={sidebarStyles.iconImage} />
              ) : (
                <Ionicons name={group.icon} size={22} color={group.color} />
              )}
            </View>
            <ThemedText style={[sidebarStyles.itemText, isSelected && sidebarStyles.itemTextSelected]} numberOfLines={2}>
              {group.name}
            </ThemedText>
            {count > 0 && <ThemedText style={sidebarStyles.countText}>{count}</ThemedText>}
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
  iconBox: { width: 44, height: 44, borderRadius: 10, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  iconBoxSelected: { borderWidth: 2, borderColor: '#00C06A' },
  iconImage: { width: '100%', height: '100%' },
  itemText: { fontSize: 9, fontWeight: '500', color: '#64748B', textAlign: 'center', marginTop: 4, lineHeight: 11 },
  itemTextSelected: { color: '#00C06A', fontWeight: '700' },
  countText: { fontSize: 8, color: '#9CA3AF', marginTop: 1 },
});

// ============ MAIN COMPONENT ============
export default function CategoriesScreen() {
  const router = useRouter();
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const groupedCategories = useMemo(() => groupCategories(allCategories), [allCategories]);

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    groupedCategories.forEach((cats, groupId) => counts.set(groupId, cats.length));
    return counts;
  }, [groupedCategories]);

  const displayedCategories = useMemo(() => {
    if (!selectedGroup) {
      const topCategories: Category[] = [];
      CATEGORY_GROUPS.forEach(group => {
        const groupCats = groupedCategories.get(group.id) || [];
        topCategories.push(...groupCats.slice(0, 3));
      });
      return showAll ? allCategories : topCategories.slice(0, ITEMS_PER_PAGE);
    }
    const groupCats = groupedCategories.get(selectedGroup) || [];
    return showAll ? groupCats : groupCats.slice(0, ITEMS_PER_PAGE);
  }, [selectedGroup, groupedCategories, showAll, allCategories]);

  const currentGroup = useMemo(() => selectedGroup ? getGroupById(selectedGroup) : null, [selectedGroup]);

  const totalInCurrentView = useMemo(() => {
    if (!selectedGroup) return allCategories.length;
    return groupedCategories.get(selectedGroup)?.length || 0;
  }, [selectedGroup, groupedCategories, allCategories]);

  const fetchCategories = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [goingOutResult, homeDeliveryResult] = await Promise.all([
        categoriesApi.getCategories({ type: 'going_out' }),
        categoriesApi.getCategories({ type: 'home_delivery' }),
      ]);

      const process = (result: any) => (result?.data || result || [])
        .map((cat: any) => ({ ...cat, id: cat._id || cat.id || cat.slug }))
        .sort((a: Category, b: Category) => (a.sortOrder || 0) - (b.sortOrder || 0));

      setAllCategories([...process(goingOutResult), ...process(homeDeliveryResult)]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, []);

  const handleCategoryPress = useCallback((slug: string) => {
    router.push(`/category/${slug}` as any);
  }, [router]);

  const handleGroupPress = useCallback((groupId: string) => {
    setSelectedGroup(groupId || null);
    setShowAll(false);
  }, []);

  const numColumns = 3;
  const itemWidth = (CONTENT_WIDTH - 24) / numColumns;
  const hasMore = totalInCurrentView > displayedCategories.length;

  const renderItem = ({ item }: { item: Category }) => (
    <View style={[styles.gridItem, { width: itemWidth }]}>
      <CategoryImageCard category={item} onPress={handleCategoryPress} size="medium" />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#00C06A', '#00A05A', '#008B4A']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Categories</ThemedText>
            <ThemedText style={styles.headerSubtitle}>{allCategories.length} items to explore</ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.mainContainer}>
        {!loading && (
          <Sidebar
            groups={CATEGORY_GROUPS}
            selectedGroup={selectedGroup}
            onGroupPress={handleGroupPress}
            groupCounts={groupCounts}
          />
        )}

        <View style={styles.contentContainer}>
          {loading && !refreshing && (
            <View style={styles.loadingContainer}>
              <CategoryGridSkeleton numItems={9} numColumns={3} />
            </View>
          )}

          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
              <TouchableOpacity style={styles.retryButton} onPress={() => fetchCategories()}>
                <ThemedText style={styles.retryText}>Retry</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {!loading && !error && (
            <FlatList
              data={displayedCategories}
              renderItem={renderItem}
              keyExtractor={(item) => item.id || item.slug}
              numColumns={numColumns}
              contentContainerStyle={styles.gridContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchCategories(true)} colors={['#00C06A']} tintColor="#00C06A" />
              }
              ListHeaderComponent={
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    {currentGroup ? (
                      <>
                        <View style={[styles.groupBadge, { backgroundColor: currentGroup.bgColor }]}>
                          <Ionicons name={currentGroup.icon} size={14} color={currentGroup.color} />
                        </View>
                        <ThemedText style={styles.sectionTitle}>{currentGroup.name}</ThemedText>
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
                  <ThemedText style={styles.emptyText}>No categories found</ThemedText>
                </View>
              }
              ListFooterComponent={
                <View style={styles.footerContainer}>
                  {hasMore && !showAll && (
                    <TouchableOpacity style={styles.seeAllButton} onPress={() => setShowAll(true)}>
                      <ThemedText style={styles.seeAllText}>See All {totalInCurrentView}</ThemedText>
                      <Ionicons name="chevron-forward" size={16} color="#00C06A" />
                    </TouchableOpacity>
                  )}
                  <ThemedText style={styles.showingText}>
                    Showing {displayedCategories.length} of {totalInCurrentView}
                  </ThemedText>
                  <View style={{ height: 80 }} />
                </View>
              }
            />
          )}
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
  loadingContainer: { padding: 16 },
  gridContent: { paddingHorizontal: 8, paddingBottom: 16 },
  gridItem: { alignItems: 'center', marginBottom: 4 },
  sectionHeader: { paddingHorizontal: 8, paddingTop: 12, paddingBottom: 8 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1F2937' },
  countText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 20 },
  errorText: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginTop: 12, marginBottom: 20 },
  retryButton: { backgroundColor: '#00C06A', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
  footerContainer: { alignItems: 'center', paddingVertical: 16 },
  seeAllButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, gap: 4, marginBottom: 8 },
  seeAllText: { fontSize: 13, fontWeight: '600', color: '#00C06A' },
  showingText: { fontSize: 11, color: '#9CA3AF' },
});
