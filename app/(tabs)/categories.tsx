import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
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
import { getSubcategoryIcon } from '@/config/categoryIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// Local images for main categories (consistent with homepage)
const CATEGORY_IMAGES: Record<string, any> = {
  'food-dining': require('../../assets/category-icons/FOOD-DINING/Cafes.png'),
  'grocery-essentials': require('../../assets/category-icons/GROCERY-ESSENTIALS/Supermarkets.png'),
  'beauty-wellness': require('../../assets/category-icons/BEAUTY-WELLNESS/Beauty-services.png'),
  'healthcare': require('../../assets/category-icons/HEALTHCARE/Clinics.png'),
  'fashion': require('../../assets/category-icons/Shopping/Fashion.png'),
  'fitness-sports': require('../../assets/category-icons/FITNESS-SPORTS/Gyms.png'),
  'education-learning': require('../../assets/category-icons/EDUCATION-LEARNING/Coaching-center.png'),
  'home-services': require('../../assets/category-icons/HOME-SERVICES/Cleaning.png'),
  'travel-experiences': require('../../assets/category-icons/TRAVEL-EXPERIENCES/Tours.png'),
  'entertainment': require('../../assets/category-icons/ENTERTAINMENT/Live-events.png'),
  'financial-lifestyle': require('../../assets/category-icons/FINANCIAL-LIFESTYLE/Bill-payments.png'),
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

// ============ MAIN COMPONENT ============
export default function CategoriesScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get subcategories when a category is selected
  const displayedSubcategories = useMemo((): SubcategoryWithParent[] => {
    if (!selectedCategory) return [];
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

  // Handle subcategory press - navigate to StoreListPage
  const handleSubcategoryPress = useCallback((subcategory: SubcategoryWithParent) => {
    router.push({
      pathname: '/StoreListPage',
      params: {
        category: subcategory.slug,
        parentCategory: subcategory.parentSlug,
        title: subcategory.name,
      },
    } as any);
  }, [router]);

  // Handle main category press - show subcategories
  const handleMainCategoryPress = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  // Handle back to categories
  const handleBackToCategories = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  const numColumns = 3;
  const FULL_WIDTH = SCREEN_WIDTH;
  const categoryItemWidth = (FULL_WIDTH - 48) / numColumns;
  const subcategoryItemWidth = (FULL_WIDTH - 48) / numColumns;

  // Render main category item
  const renderCategoryItem = ({ item }: { item: SidebarCategory }) => {
    const categoryImage = CATEGORY_IMAGES[item.id];
    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: categoryItemWidth }]}
        onPress={() => handleMainCategoryPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.circleCard}>
          {categoryImage ? (
            <Image source={categoryImage} style={styles.circleImage} resizeMode="cover" />
          ) : (
            <Ionicons name={item.icon} size={28} color={item.color} />
          )}
        </View>
        <ThemedText style={styles.categoryName} numberOfLines={2}>
          {item.name}
        </ThemedText>
        <ThemedText style={styles.subcategoryCountText}>
          {item.subcategoryCount} items
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Render subcategory item
  const renderSubcategoryItem = ({ item }: { item: SubcategoryWithParent }) => {
    const customIcon = getSubcategoryIcon(item.slug);
    return (
      <TouchableOpacity
        style={[styles.gridItem, { width: subcategoryItemWidth }]}
        onPress={() => handleSubcategoryPress(item)}
        activeOpacity={0.7}
      >
        <View style={[
          styles.circleCard,
          !customIcon && { backgroundColor: item.color + '20' }
        ]}>
          {customIcon ? (
            <Image source={customIcon} style={styles.circleImage} resizeMode="cover" />
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
          {selectedCategory ? (
            <TouchableOpacity style={styles.backButton} onPress={handleBackToCategories}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>
              {selectedCategory ? currentCategory?.name : 'Categories'}
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {selectedCategory
                ? `${displayedSubcategories.length} subcategories`
                : `${SIDEBAR_CATEGORIES.length} categories to explore`}
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.push('/search' as any)}>
            <Ionicons name="search-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.fullContentContainer}>
        {!selectedCategory ? (
          // Show main categories
          <FlatList
            data={SIDEBAR_CATEGORIES}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="apps" size={18} color="#00C06A" />
                  <ThemedText style={styles.sectionTitle}>All Categories</ThemedText>
                  <ThemedText style={styles.countText}>({SIDEBAR_CATEGORIES.length})</ThemedText>
                </View>
              </View>
            }
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        ) : (
          // Show subcategories for selected category
          <FlatList
            data={displayedSubcategories}
            renderItem={renderSubcategoryItem}
            keyExtractor={(item) => `${item.parentSlug}-${item.slug}`}
            numColumns={numColumns}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <View style={[styles.groupBadge, { backgroundColor: currentCategory?.bgColor }]}>
                    <Ionicons name={currentCategory?.icon || 'grid'} size={14} color={currentCategory?.color} />
                  </View>
                  <ThemedText style={styles.sectionTitle}>{currentCategory?.name}</ThemedText>
                  <ThemedText style={styles.countText}>({displayedSubcategories.length})</ThemedText>
                </View>
              </View>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="folder-open-outline" size={48} color="#9CA3AF" />
                <ThemedText style={styles.emptyText}>No subcategories found</ThemedText>
              </View>
            }
            ListFooterComponent={<View style={{ height: 100 }} />}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7FAFC' },
  header: { paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0, paddingBottom: 12, paddingHorizontal: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', paddingTop: 12 },
  headerLeft: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 13, color: 'rgba(255, 255, 255, 0.85)', fontWeight: '500' },
  headerButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  fullContentContainer: { flex: 1, backgroundColor: '#FFFFFF' },
  gridContent: { paddingHorizontal: 16, paddingBottom: 16 },
  gridItem: { alignItems: 'center', marginBottom: 20, paddingHorizontal: 4 },
  circleCard: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 16,
    maxWidth: 90,
  },
  subcategoryCountText: {
    fontSize: 10,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 2,
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
  sectionHeader: { paddingHorizontal: 8, paddingTop: 16, paddingBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  groupBadge: { width: 26, height: 26, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1F2937' },
  countText: { fontSize: 13, color: '#9CA3AF', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#9CA3AF', textAlign: 'center', marginTop: 12 },
});
