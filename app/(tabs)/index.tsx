import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Platform,
  InteractionManager,
  Image,
  Animated,
} from 'react-native';
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
  RecommendationCard,
} from '@/components/homepage';
import { useHomepage, useHomepageNavigation } from '@/hooks/useHomepage';
import {
  EventItem,
  StoreItem,
  ProductItem,
  BrandedStoreItem,
  RecommendationItem,
  HomepageSectionItem,
} from '@/types/homepage.types';
import { useProfile, useProfileMenu } from '@/contexts/ProfileContext';
import ProfileMenuModal from '@/components/profile/ProfileMenuModal';
import { profileMenuSections } from '@/data/profileData';
import VoucherNavButton from '@/components/voucher/VoucherNavButton';
import { GreetingDisplay, LocationDisplay } from '@/components/location';
import { useCart } from '@/contexts/CartContext';

export default function HomeScreen() {
  const router = useRouter();
  const { state, actions } = useHomepage();
  const { handleItemPress, handleAddToCart } = useHomepageNavigation();
  const { user, isModalVisible, showModal, hideModal } = useProfile();
  const { handleMenuItemPress } = useProfileMenu();
  const { state: cartState } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);
  const [showDetailedLocation, setShowDetailedLocation] = React.useState(false);
  const animatedHeight = React.useRef(new Animated.Value(0)).current;
  const animatedOpacity = React.useRef(new Animated.Value(0)).current;


  const handleRefresh = React.useCallback(
    async () => {
      setRefreshing(true);
      try {
        await actions.refreshAllSections();
      } catch (error) {
        console.error('Failed to refresh homepage:', error);
      } finally {
        setRefreshing(false);
      }
    },
    [actions]
  );

  const handleFashionPress = () => {
    router.push('/FashionPage');
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

  const handlePartnerPress = () => {
    router.push('/profile/partner');
  };

  const handleSearchPress = () => {
    router.push('/search');
  };

  const handleGoingOutViewAll = () => {
    router.push('/going-out');
  };
  
  const handleHomeDeliveryViewAll = () => {
    router.push('/home-delivery');
  };

  const handleCategoryPress = (categorySlug: string) => {
    router.push(`/category/${categorySlug}` as any);
  };

  const renderEventCard = (item: HomepageSectionItem) => {
    const event = item as EventItem;
    return (
      <EventCard
        event={event}
        onPress={eventItem => {
          actions.trackSectionView('events');
          actions.trackItemClick('events', eventItem.id);
          handleItemPress('events', eventItem);
        }}
      />
    );
  };

  const renderRecommendationCard = (item: HomepageSectionItem) => {
    const recommendation = item as RecommendationItem;
    return (
      <RecommendationCard
        recommendation={recommendation}
        onPress={rec => {
          actions.trackSectionView('just_for_you');
          actions.trackItemClick('just_for_you', rec.id);
          handleItemPress('just_for_you', rec);
        }}
        onAddToCart={rec => {
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
        onPress={storeItem => {
          actions.trackSectionView(sectionId);
          actions.trackItemClick(sectionId, storeItem.id);
          handleItemPress(sectionId, storeItem);
        }}
      />
    );
  };

  const renderBrandedStoreCard = (item: HomepageSectionItem) => {
    const store = item as BrandedStoreItem;
    return (
      <BrandedStoreCard
        store={store}
        onPress={storeItem => {
          actions.trackSectionView('top_stores');
          actions.trackItemClick('top_stores', storeItem.id);
          handleItemPress('top_stores', storeItem);
        }}
        width={200}
      />
    );
  };

  const renderProductCard = (item: HomepageSectionItem) => {
    const product = item as ProductItem;
    const productId = product._id || product.id;
    const cartItem = cartState.items.find(i => i.productId === productId);
    const inCart = cartItem ? cartItem.quantity : 0;

    return (
      <ProductCard
        key={`${productId}-${inCart}`}
        product={product}
        onPress={productItem => {
          actions.trackSectionView('new_arrivals');
          actions.trackItemClick('new_arrivals', productItem.id);
          handleItemPress('new_arrivals', productItem);
        }}
        onAddToCart={productItem => {
          actions.trackItemClick('new_arrivals', productItem.id);
          handleAddToCart(productItem);
        }}
      />
    );
  };

  return (
    <ScrollView
      style={viewStyles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#8B5CF6" colors={['#8B5CF6']} />
      }
    >
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#A855F7']} style={viewStyles.header}>
        <View style={viewStyles.headerTop}>
          <TouchableOpacity
            style={viewStyles.locationContainer}
            onPress={() => {
              const newState = !showDetailedLocation;
              setShowDetailedLocation(newState);

              // Smooth animation for expand/collapse
              Animated.parallel([
                Animated.timing(animatedHeight, {
                  toValue: newState ? 1 : 0,
                  duration: 300,
                  useNativeDriver: false,
                }),
                Animated.timing(animatedOpacity, {
                  toValue: newState ? 1 : 0,
                  duration: 300,
                  useNativeDriver: true,
                }),
              ]).start();
            }}
            activeOpacity={0.7}
          >
            <LocationDisplay
              compact={true}
              showCoordinates={false}
              showLastUpdated={false}
              showRefreshButton={false}
              style={viewStyles.locationDisplay}
              textStyle={textStyles.locationText}
            />
            <Ionicons
              name={showDetailedLocation ? "chevron-up" : "chevron-down"}
              size={16}
              color="white"
              style={viewStyles.locationArrow}
            />
          </TouchableOpacity>

          <View style={viewStyles.headerRight}>
            <TouchableOpacity
              style={viewStyles.coinsContainer}
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
              <ThemedText style={textStyles.coinsText}>382</ThemedText>
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
              style={viewStyles.profileAvatar}
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
              <ThemedText style={textStyles.profileText}>{user?.initials || 'R'}</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Detailed Location Section - Animated */}
        <Animated.View
          style={[
            viewStyles.detailedLocationContainer,
            {
              height: animatedHeight.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 120], // Adjust based on content height
              }),
              opacity: animatedOpacity,
              overflow: 'hidden',
            },
          ]}
        >
          <View style={viewStyles.detailedLocationContent}>
            {/* Full Address Section */}
            <View style={viewStyles.addressSection}>
              <View style={viewStyles.addressHeader}>
                <Ionicons name="location" size={16} color="#8B5CF6" />
                <Text style={viewStyles.addressHeaderText}>Current Location</Text>
              </View>
              <LocationDisplay
                compact={false}
                showCoordinates={false}
                showLastUpdated={false}
                showRefreshButton={false}
                style={viewStyles.detailedLocationDisplay}
                textStyle={viewStyles.detailedLocationText}
              />
            </View>

            {/* Coordinates Section */}
            <View style={viewStyles.coordinatesSection}>
              <View style={viewStyles.coordinatesHeader}>
                <Ionicons name="navigate" size={14} color="#666" />
                <Text style={viewStyles.coordinatesHeaderText}>Coordinates</Text>
              </View>
              <LocationDisplay
                compact={true}
                showCoordinates={true}
                showLastUpdated={false}
                showRefreshButton={false}
                style={viewStyles.coordinatesDisplay}
                textStyle={viewStyles.coordinatesText}
              />
            </View>

            {/* Refresh Button */}
            <View style={viewStyles.refreshSection}>
              <LocationDisplay
                compact={true}
                showCoordinates={false}
                showLastUpdated={true}
                showRefreshButton={true}
                style={viewStyles.refreshDisplay}
                textStyle={viewStyles.refreshText}
              />
            </View>
          </View>
        </Animated.View>

        {/* Dynamic Greeting */}
        <View style={viewStyles.greetingContainer}>
          <GreetingDisplay
            showEmoji={true}
            showTime={false}
            showLocation={true}
            animationType="fade"
            maxLength={40}
            style={viewStyles.greetingCard}
            textStyle={textStyles.greeting}
          />
        </View>

        <TouchableOpacity style={viewStyles.searchContainer} onPress={handleSearchPress} activeOpacity={0.85}>
          <Ionicons name="search" size={20} color="#666" style={viewStyles.searchIcon} />
          <Text style={textStyles.searchPlaceholder}>Search for the service</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Content */}
      <View style={viewStyles.content}>
        {/* Partner Card */}
        <TouchableOpacity style={viewStyles.partnerCard} onPress={handlePartnerPress} activeOpacity={0.9}>
          <View style={viewStyles.partnerInfo}>
            <View style={viewStyles.partnerIcon}>
              <Ionicons name="star" size={20} color="#8B5CF6" />
            </View>
            <View>
              <ThemedText style={textStyles.partnerLevel}>Partner</ThemedText>
              <ThemedText style={textStyles.level1}>Level 1</ThemedText>
            </View>
          </View>

          <View style={viewStyles.partnerStats}>
            <View style={viewStyles.stat}>
              <ThemedText style={textStyles.statNumber}>12/15</ThemedText>
              <ThemedText style={textStyles.statLabel}>Orders</ThemedText>
            </View>

            <View style={viewStyles.progressDot} />

            <View style={viewStyles.stat}>
              <ThemedText style={textStyles.statNumber}>3 Orders in 44</ThemedText>
              <ThemedText style={textStyles.statLabel}>Days to go</ThemedText>
            </View>
          </View>

          <View style={viewStyles.partnerArrow}>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </View>
        </TouchableOpacity>

        {/* Quick Actions */}
        <View style={viewStyles.quickActions}>
          <TouchableOpacity
            style={viewStyles.actionItem}
            onPress={() => {
              try {
                router.push('/tracking');
              } catch (error) {
                console.error('Tracking action press error:', error);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={viewStyles.actionIcon}>
              <Ionicons name="location-outline" size={24} color="#333" />
            </View>
            <ThemedText style={textStyles.actionLabel}>Track Orders</ThemedText>
            <ThemedText style={textStyles.actionValue}>2 Active</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={viewStyles.actionItem}
            onPress={() => {
              try {
                handleWalletPress();
              } catch (error) {
                console.error('Wallet action press error:', error);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={viewStyles.actionIcon}>
              <Ionicons name="wallet-outline" size={24} color="#333" />
            </View>
            <ThemedText style={textStyles.actionLabel}>Wallet</ThemedText>
            <ThemedText style={textStyles.actionValue}>₹ 0</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={viewStyles.actionItem}
            onPress={() => {
              try {
                handleOffersPress();
              } catch (error) {
                console.error('Offers action press error:', error);
              }
            }}
            activeOpacity={0.8}
          >
            <View style={viewStyles.actionIcon}>
              <Ionicons name="pricetag-outline" size={24} color="#333" />
            </View>
            <ThemedText style={textStyles.actionLabel}>Offers</ThemedText>
            <ThemedText style={textStyles.actionValue}>2 New</ThemedText>
          </TouchableOpacity>

          <View style={viewStyles.actionItem}>
            <TouchableOpacity
              style={Platform.OS === 'ios' ? viewStyles.iosActionWrapper : viewStyles.defaultActionWrapper}
              onPress={() => {
                try {
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
              activeOpacity={Platform.OS === 'ios' ? 0.6 : 0.8}
            >
              <View style={viewStyles.actionIcon}>
                <Ionicons name="storefront-outline" size={24} color="#333" />
              </View>
              <ThemedText style={textStyles.actionLabel}>Store</ThemedText>
              <ThemedText style={textStyles.actionValue}>Explore</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {/* Online Voucher Button */}
        <VoucherNavButton variant="minimal" style={{ marginBottom: 20 }} />

        {/* Going Out Section */}
        <View style={viewStyles.section}>
          <View style={viewStyles.sectionHeader}>
            <ThemedText style={textStyles.sectionTitle}>Going Out</ThemedText>
            <TouchableOpacity 
              style={viewStyles.viewAllButton}
              onPress={handleGoingOutViewAll}
              activeOpacity={0.8}
            >
              <ThemedText style={textStyles.viewAllText}>View all</ThemedText>
            </TouchableOpacity>
          </View>

          {Platform.OS === 'web' ? (
            <View style={viewStyles.webScrollContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={viewStyles.webScrollContent}>
                <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={handleFashionPress} activeOpacity={0.85}>
                  <View style={viewStyles.categoryIcon}>
                    <Ionicons name="shirt-outline" size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={textStyles.categoryLabel}>Fashion</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('fleet')} activeOpacity={0.85}>
                  <View style={viewStyles.categoryIcon}>
                    <Ionicons name="car-outline" size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={textStyles.categoryLabel}>Fleet Market</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('gift')} activeOpacity={0.85}>
                  <View style={viewStyles.categoryIcon}>
                    <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={textStyles.categoryLabel}>Gift</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('restaurant')} activeOpacity={0.85}>
                  <View style={viewStyles.categoryIcon}>
                    <Ionicons name="restaurant-outline" size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={textStyles.categoryLabel}>Restaurant</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('electronics')} activeOpacity={0.85}>
                  <View style={viewStyles.categoryIcon}>
                    <Ionicons name="phone-portrait-outline" size={24} color="#8B5CF6" />
                  </View>
                  <ThemedText style={textStyles.categoryLabel}>Electronic</ThemedText>
                </TouchableOpacity>
              </ScrollView>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={viewStyles.horizontalScrollContent}>
              <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={handleFashionPress} activeOpacity={0.85}>
                <View style={viewStyles.categoryIcon}>
                  <Ionicons name="shirt-outline" size={24} color="#8B5CF6" />
                </View>
                <ThemedText style={textStyles.categoryLabel}>Fashion</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={() => handleCategoryPress('fleet')} activeOpacity={0.85}>
                <View style={viewStyles.categoryIcon}>
                  <Ionicons name="car-outline" size={24} color="#8B5CF6" />
                </View>
                <ThemedText style={textStyles.categoryLabel}>Fleet Market</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={() => handleCategoryPress('gift')} activeOpacity={0.85}>
                <View style={viewStyles.categoryIcon}>
                  <Ionicons name="gift-outline" size={24} color="#8B5CF6" />
                </View>
                <ThemedText style={textStyles.categoryLabel}>Gift</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={() => handleCategoryPress('restaurant')} activeOpacity={0.85}>
                <View style={viewStyles.categoryIcon}>
                  <Ionicons name="restaurant-outline" size={24} color="#8B5CF6" />
                </View>
                <ThemedText style={textStyles.categoryLabel}>Restaurant</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={() => handleCategoryPress('electronics')} activeOpacity={0.85}>
                <View style={viewStyles.categoryIcon}>
                  <Ionicons name="phone-portrait-outline" size={24} color="#8B5CF6" />
                </View>
                <ThemedText style={textStyles.categoryLabel}>Electronic</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Home Delivery Section */}
        <View style={viewStyles.section}>
          <View style={viewStyles.sectionHeader}>
            <ThemedText style={textStyles.sectionTitle}>Home Delivery</ThemedText>
            <TouchableOpacity 
              style={viewStyles.viewAllButton}
              onPress={handleHomeDeliveryViewAll}
              activeOpacity={0.8}
            >
              <ThemedText style={textStyles.viewAllText}>View all</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={viewStyles.horizontalScrollContent}>
            <TouchableOpacity style={viewStyles.horizontalCategoryItem} onPress={() => handleCategoryPress('organic')} activeOpacity={0.85}>
              <View style={viewStyles.categoryIcon}>
                <Ionicons name="leaf-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={textStyles.categoryLabel}>Organic</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('grocery')} activeOpacity={0.85}>
              <View style={viewStyles.categoryIcon}>
                <Ionicons name="basket-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={textStyles.categoryLabel}>Grocery</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('medicine')} activeOpacity={0.85}>
              <View style={viewStyles.categoryIcon}>
                <Ionicons name="medical-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={textStyles.categoryLabel}>Medicine</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('fruit')} activeOpacity={0.85}>
              <View style={viewStyles.categoryIcon}>
                <Ionicons name="nutrition-outline" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={textStyles.categoryLabel}>Fruit</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[viewStyles.horizontalCategoryItem, viewStyles.horizontalCategorySpacing]} onPress={() => handleCategoryPress('meat')} activeOpacity={0.85}>
              <View style={viewStyles.categoryIcon}>
                <Ionicons name="restaurant" size={24} color="#8B5CF6" />
              </View>
              <ThemedText style={textStyles.categoryLabel}>Meat</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Sections from state */}
        {state.sections.map(section => (
          <HorizontalScrollSection
            key={`${section.id}-${cartState.items.length}`}
            section={section}
            onItemPress={item => handleItemPress(section.id, item)}
            onRefresh={() => actions.refreshSection(section.id)}
            renderCard={item => {
              switch (section.type) {
                case 'events':
                  return renderEventCard(item);
                case 'recommendations':
                  return renderRecommendationCard(item);
                case 'stores':
                  return renderStoreCard(item, section.id);
                case 'branded_stores':
                  return renderBrandedStoreCard(item);
                case 'products':
                  return renderProductCard(item);
                default:
                  return renderStoreCard(item, section.id);
              }
            }}
            cardWidth={
              section.id === 'new_arrivals' ? 180 :
              section.id === 'just_for_you' ? 230 :
              section.type === 'branded_stores' ? 200 : 280
            }
            spacing={
              section.id === 'new_arrivals' ? 12 :
              section.id === 'just_for_you' ? 12 : 16
            }
            showIndicator={false}
            extraData={cartState.items}
          />
        ))}
      </View>

      {/* Profile Menu Modal */}
      {user && (
        <ProfileMenuModal visible={isModalVisible} onClose={hideModal} user={user} menuSections={profileMenuSections} onMenuItemPress={handleMenuItemPress} />
      )}
    </ScrollView>
  );
}

/* ---------------------------
   Styles: split into textStyles and viewStyles
   --------------------------- */

const textStyles = StyleSheet.create({
  locationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  coinsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  profileText: {
    color: '#333',
    fontWeight: '700',
    fontSize: 14,
  },
  greeting: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: '#666',
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
  statNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  actionLabel: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginTop: 8,
  },
  actionValue: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  categoryLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 8,
  },
});

const viewStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  locationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  locationArrow: {
    marginLeft: 8,
  },
  detailedLocationContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.1)',
  },
  detailedLocationContent: {
    padding: 16,
  },
  addressSection: {
    marginBottom: 12,
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 6,
  },
  coordinatesSection: {
    marginBottom: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
  },
  coordinatesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  coordinatesHeaderText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  coordinatesDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  coordinatesText: {
    color: '#666',
    fontSize: 12,
    fontFamily: 'monospace',
  },
  refreshSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
  },
  refreshDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
    alignSelf: 'stretch',
  },
  refreshText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
  },
  detailedLocationDisplay: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    padding: 0,
  },
  detailedLocationText: {
    color: '#333',
    fontSize: 14,
    lineHeight: 20,
  },
  greetingContainer: {
    marginVertical: 8,
  },
  greetingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
        outline: 'none',
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  partnerCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 3,
    marginBottom: 16,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  partnerStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  progressDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#8B5CF6',
    marginHorizontal: 6,
  },
  partnerArrow: {
    padding: 4,
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 12,
    elevation: 3,
    marginBottom: 18,
  },
  actionItem: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllButton: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  viewAll: {
    // view-only; if you want text, use textStyles.viewAll
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  horizontalScrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  webScrollContainer: {
    paddingHorizontal: 4,
  },
  webScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  horizontalCategoryItem: {
    alignItems: 'center',
    minWidth: 70,
    marginRight: 12,
  },
  horizontalCategorySpacing: {
    marginLeft: 8,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  iosActionWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  defaultActionWrapper: {
    flex: 1,
    alignItems: 'center',
  },
});
