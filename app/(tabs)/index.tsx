import React from 'react';
import { View, ScrollView, StyleSheet, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Platform, InteractionManager } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { 
  HorizontalScrollSection,
  EventCard,
  StoreCard,
  ProductCard,
  BrandedStoreCard,
  RecommendationCard 
} from '@/components/homepage';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
import { 
  EventItem, 
  StoreItem, 
  ProductItem, 
  BrandedStoreItem, 
  RecommendationItem,
  HomepageSectionItem 
} from '@/types/homepage.types';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';

export default function HomeScreen() {
  const router = useRouter();
  const { state, actions } = useHomepage();
  const { handleItemPress, handleAddToCart } = useHomepageNavigation();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await actions.refreshAllSections();
    } catch (error) {
      console.error('Failed to refresh homepage:', error);
    } finally {
      setRefreshing(false);
    }
  }, [actions]);

  const handleFashionPress = () => {
    router.push('/FashionPage'); // Keep existing fashion page for now
  };

  const handleMainStorePress = () => {
    router.push('/Store');
  };

  const handleWalletPress = () => {
    router.push('/WalletScreen');
  };

  const handleOffersPress = () => {
    router.push('/offers');
  };

  // New dynamic category navigation handlers
  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/category/${categorySlug}` as any);
  };

  // Card render functions with analytics tracking
  const renderEventCard = (item: HomepageSectionItem) => {
    const event = item as EventItem;
    return (
      <EventCard 
        event={event} 
        onPress={(event) => {
          actions.trackSectionView('events');
          actions.trackItemClick('events', event.id);
          handleItemPress('events', event);
        }} 
      />
    );
  };

  const renderRecommendationCard = (item: HomepageSectionItem) => {
    const recommendation = item as RecommendationItem;
    return (
      <RecommendationCard 
        recommendation={recommendation}
        onPress={(rec) => {
          actions.trackSectionView('just_for_you');
          actions.trackItemClick('just_for_you', rec.id);
          handleItemPress('just_for_you', rec);
        }}
        onAddToCart={(rec) => {
          actions.trackItemClick('just_for_you', rec.id);
          handleAddToCart(rec);
        }}
      />
    );
  };

  const renderStoreCard = (item: HomepageSectionItem, sectionId: string) => {
    const store = item as StoreItem;
    return (
      <StoreCard 
        store={store}
        onPress={(store) => {
          actions.trackSectionView(sectionId);
          actions.trackItemClick(sectionId, store.id);
          handleItemPress(sectionId, store);
        }}
      />
    );
  };

  const renderBrandedStoreCard = (item: HomepageSectionItem) => {
    const store = item as BrandedStoreItem;
    return (
      <BrandedStoreCard 
        store={store}
        onPress={(store) => {
          actions.trackSectionView('top_stores');
          actions.trackItemClick('top_stores', store.id);
          handleItemPress('top_stores', store);
        }}
        width={200}
      />
    );
  };

  const renderProductCard = (item: HomepageSectionItem) => {
    const product = item as ProductItem;
    return (
      <ProductCard 
        product={product}
        onPress={(product) => {
          actions.trackSectionView('new_arrivals');
          actions.trackItemClick('new_arrivals', product.id);
          handleItemPress('new_arrivals', product);
        }}
        onAddToCart={(product) => {
          actions.trackItemClick('new_arrivals', product.id);
          handleAddToCart(product);
        }}
      />
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#8B5CF6"
          colors={['#8B5CF6']}
        />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={['#8B5CF6', '#A855F7']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={16} color="white" />
            <ThemedText style={styles.locationText}>BTM,Bangalore</ThemedText>
            <Ionicons name="chevron-down" size={16} color="white" />
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.coinsContainer} 
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CoinPage'), 50);
                } else {
                  router.push('/CoinPage');
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            >
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.coinsText}>382</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => router.push('/CartPage'), 50);
                } else {
                  router.push('/CartPage');
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            >
              <Ionicons name="cart-outline" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.profileAvatar} 
              onPress={() => {
                if (Platform.OS === 'ios') {
                  setTimeout(() => showModal(), 50);
                } else {
                  showModal();
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
            >
              <ThemedText style={styles.profileText}>
                {user?.initials || 'R'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Greeting */}
        <ThemedText style={styles.greeting}>Good night Rejaul!</ThemedText>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search for the service"
            placeholderTextColor="#666"
          />
        </View>
      </LinearGradient>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Partner Status Card */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerInfo}>
            <View style={styles.partnerIcon}>
              <Ionicons name="star" size={20} color="#8B5CF6" />
            </View>
            <View>
              <ThemedText style={styles.partnerLevel}>Partner</ThemedText>
              <ThemedText style={styles.level1}>Level 1</ThemedText>
            </View>
          </View>
          <View style={styles.partnerStats}>
            <View style={styles.stat}>
              <ThemedText style={styles.statNumber}>0/10</ThemedText>
              <ThemedText style={styles.statLabel}>Orders</ThemedText>
            </View>
            <View style={styles.progressDot} />
            <View style={styles.stat}>
              <ThemedText style={styles.statNumber}>20 Orders in 67</ThemedText>
              <ThemedText style={styles.statLabel}>Days to go</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={0}
            onPress={() => {
              try {
                console.log('Chevron pressed - expand/collapse functionality');
                // TODO: Add expand/collapse functionality
              } catch (error) {
                console.error('Chevron press error:', error);
              }
            }}
          >
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => {
              try {
                console.log('Voucher pressed - not implemented yet');
                // TODO: Add voucher navigation
              } catch (error) {
                console.error('Voucher action press error:', error);
              }
            }}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={0}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="receipt-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Voucher</ThemedText>
            <ThemedText style={styles.actionValue}>0</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => {
              try {
                handleWalletPress();
              } catch (error) {
                console.error('Wallet action press error:', error);
              }
            }}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={0}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="wallet-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Wallet</ThemedText>
            <ThemedText style={styles.actionValue}>₹ 0</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => {
              try {
                handleOffersPress();
              } catch (error) {
                console.error('Offers action press error:', error);
              }
            }}
            activeOpacity={0.7}
            delayPressIn={0}
            delayPressOut={0}
          >
            <View style={styles.actionIcon}>
              <Ionicons name="pricetag-outline" size={24} color="#333" />
            </View>
            <ThemedText style={styles.actionLabel}>Offers</ThemedText>
            <ThemedText style={styles.actionValue}>2 New</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.actionItem}>
            <TouchableOpacity 
              style={Platform.OS === 'ios' ? styles.iosActionWrapper : styles.defaultActionWrapper}
              onPress={() => {
                try {
                  // Use InteractionManager on iOS to ensure all animations complete
                  if (Platform.OS === 'ios') {
                    InteractionManager.runAfterInteractions(() => {
                      handleMainStorePress();
                    });
                  } else {
                    handleMainStorePress();
                  }
                } catch (error) {
                  console.error('Store action press error:', error);
                }
              }}
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.7}
              delayPressIn={Platform.OS === 'ios' ? 50 : 0}
              delayPressOut={Platform.OS === 'ios' ? 100 : 0}
            >
              <View style={styles.actionIcon}>
                <Ionicons name="storefront-outline" size={24} color="#333" />
              </View>
              <ThemedText style={styles.actionLabel}>Store</ThemedText>
              <ThemedText style={styles.actionValue}>Explore</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Going Out Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Going Out</ThemedText>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            decelerationRate="fast"
          >
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={handleFashionPress}>
              <View style={styles.categoryIcon}>
                <Ionicons name="shirt-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fashion</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('fleet')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="car-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fleet Market</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('gift')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Gift</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('restaurant')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="restaurant-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Restaurant</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('electronics')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="phone-portrait-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Electronic</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Home Delivery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Home Delivery</ThemedText>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
            decelerationRate="fast"
          >
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('organic')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="leaf-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Organic</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('grocery')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="basket-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Grocery</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('medicine')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="medical-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Medicine</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('fruit')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="nutrition-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Fruit</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.horizontalCategoryItem} onPress={() => handleCategoryPress('meat')}>
              <View style={styles.categoryIcon}>
                <Ionicons name="restaurant" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.categoryLabel}>Meat</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* New Homepage Sections */}
        {state.sections.map((section) => (
          <HorizontalScrollSection
            key={section.id}
            section={section}
            onItemPress={(item) => handleItemPress(section.id, item)}
            onRefresh={() => actions.refreshSection(section.id)}
            renderCard={(item) => {
              switch (section.type) {
                case 'events':
                  return renderEventCard(item);
                case 'recommendations':
                  return renderRecommendationCard(item);
                case 'stores':
                  return renderStoreCard(item, section.id);
                case 'branded_stores':
                  return renderBrandedStoreCard(item);
                default:
                  return renderStoreCard(item, section.id);
              }
            }}
            cardWidth={section.type === 'branded_stores' ? 200 : 280}
            spacing={section.id === 'new_arrivals' ? 4 : 16}
            showIndicator={false}
          />
        ))}
      </View>
      
      {/* Profile Menu Modal */}
      {user && (
        <ProfileMenuModal
          visible={isModalVisible}
          onClose={hideModal}
          user={user}
          menuSections={profileMenuSections}
          onMenuItemPress={handleMenuItemPress}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 16,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  content: {
    padding: 20,
    gap: 20,
  },
  partnerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partnerLevel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  level1: {
    fontSize: 12,
    color: '#666',
  },
  partnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  actionValue: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  section: {
    gap: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAll: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 4,
    gap: 20,
  },
  categoryItem: {
    width: '18%',
    alignItems: 'center',
    gap: 8,
  },
  horizontalCategoryItem: {
    alignItems: 'center',
    gap: 8,
    minWidth: 70,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  // iOS-specific styles to prevent animation conflicts
  iosActionWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  defaultActionWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
});
