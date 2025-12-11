import React, { useCallback, Suspense } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ScrollView,
  Dimensions,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CATEGORY_CONFIGS, SubcategoryItem } from '@/config/categoryConfig';
import { getSubcategoryIcon } from '@/config/categoryIcons';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import { profileMenuSections } from '@/data/profileData';
import { useAuth } from '@/contexts/AuthContext';

// Lazy-loaded components
const ProfileMenuModal = React.lazy(() => import('@/components/profile/ProfileMenuModal'));

const ModalFallback = () => null;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 4;
const ITEM_WIDTH = (SCREEN_WIDTH - 32) / NUM_COLUMNS;

// ============ INTERFACES ============
interface CategorySection {
  id: string;
  name: string;
  color: string;
  subcategories: SubcategoryItem[];
}

// Generate category sections from config
const CATEGORY_SECTIONS: CategorySection[] = Object.values(CATEGORY_CONFIGS).map(cat => ({
  id: cat.slug,
  name: cat.name,
  color: cat.primaryColor,
  subcategories: cat.subcategories,
}));

// ============ MAIN COMPONENT ============
export default function CategoriesScreen() {
  const router = useRouter();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: authState } = useAuth();

  // Handle wallet press - navigate to WalletScreen
  const handleWalletPress = () => {
    router.push('/WalletScreen');
  };

  // Handle subcategory press - navigate to StoreListPage
  const handleSubcategoryPress = useCallback((subcategory: SubcategoryItem, parentSlug: string) => {
    router.push({
      pathname: '/StoreListPage',
      params: {
        category: subcategory.slug,
        parentCategory: parentSlug,
        title: subcategory.name,
      },
    } as any);
  }, [router]);

  // Render subcategory item
  const renderSubcategoryItem = (item: SubcategoryItem, parentSlug: string, color: string) => {
    const customIcon = getSubcategoryIcon(item.slug);
    return (
      <TouchableOpacity
        key={item.slug}
        style={styles.gridItem}
        onPress={() => handleSubcategoryPress(item, parentSlug)}
        activeOpacity={0.7}
      >
        <View style={[styles.itemCard, { backgroundColor: '#F8F8F8' }]}>
          {customIcon ? (
            <Image source={customIcon} style={styles.itemImage} resizeMode="contain" />
          ) : (
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons
                name={(item.icon as keyof typeof Ionicons.glyphMap) || 'grid-outline'}
                size={32}
                color={color}
              />
            </View>
          )}
        </View>
        <ThemedText style={styles.itemName} numberOfLines={2}>
          {item.name}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  // Render category section
  const renderCategorySection = (section: CategorySection) => (
    <View key={section.id} style={styles.sectionContainer}>
      <ThemedText style={styles.sectionTitle}>{section.name}</ThemedText>
      <View style={styles.gridContainer}>
        {section.subcategories.map(sub => renderSubcategoryItem(sub, section.id, section.color))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFD814" />

      {/* Yellow Header like Blinkit */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.brandText}>Rez</ThemedText>
            <ThemedText style={styles.deliveryTime}>Quick Services</ThemedText>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIcon} onPress={handleWalletPress}>
              <Ionicons name="wallet-outline" size={22} color="#1F2937" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileAvatar}
              onPress={showModal}
              activeOpacity={0.7}
            >
              <ThemedText style={styles.profileText}>
                {user?.initials ||
                  (authState.user?.profile?.firstName ? authState.user.profile.firstName.charAt(0).toUpperCase() :
                    (authState.isAuthenticated ? 'U' : '?')
                  )}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/search' as any)}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder='Search "services"'
            placeholderTextColor="#9CA3AF"
            editable={false}
          />
          <Ionicons name="mic-outline" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Categories ScrollView */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORY_SECTIONS.map(section => renderCategorySection(section))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Profile Menu Modal */}
      <Suspense fallback={<ModalFallback />}>
        <ProfileMenuModal
          visible={isModalVisible}
          onClose={hideModal}
          user={user}
          menuSections={profileMenuSections}
          onMenuItemPress={handleMenuItemPress}
        />
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFD814',
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  brandText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  deliveryTime: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 8,
  },
  sectionContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    marginBottom: 16,
  },
  itemCard: {
    width: ITEM_WIDTH - 12,
    height: ITEM_WIDTH - 12,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  itemImage: {
    width: '85%',
    height: '85%',
  },
  iconContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  itemName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 14,
    paddingHorizontal: 2,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEAA7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F6D55C',
  },
  profileText: {
    color: '#1F2937',
    fontWeight: '700',
    fontSize: 14,
  },
});
