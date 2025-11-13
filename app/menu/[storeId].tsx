// Menu Page - Restaurant/Store Menu Display with Pre-order
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { LinearGradient } from 'expo-linear-gradient';

// Reusable components
import MenuItemCard from '@/components/booking/MenuItemCard';

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  originalPrice?: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  preparationTime?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  spicyLevel?: number;
  allergens?: string[];
}

interface MenuCategory {
  id: string;
  name: string;
  items: MenuItem[];
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export default function MenuPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const storeId = params.storeId as string;

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch menu data
  const fetchMenu = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // TODO: Replace with actual API call to menuApi.getStoreMenu(storeId)
      // For now, using mock data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockData = {
        storeName: 'Restaurant Name',
        categories: [
          {
            id: 'appetizers',
            name: 'Appetizers',
            items: [
              {
                id: '1',
                name: 'Spring Rolls',
                description: 'Crispy vegetable spring rolls served with sweet chili sauce',
                price: 120,
                image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400',
                category: 'appetizers',
                isAvailable: true,
                preparationTime: '10 mins',
                isVegetarian: true,
              },
              {
                id: '2',
                name: 'Chicken Wings',
                description: 'Spicy buffalo wings with ranch dipping sauce',
                price: 180,
                originalPrice: 220,
                image: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=400',
                category: 'appetizers',
                isAvailable: true,
                preparationTime: '15 mins',
                spicyLevel: 2,
              },
            ],
          },
          {
            id: 'mains',
            name: 'Main Course',
            items: [
              {
                id: '3',
                name: 'Grilled Chicken',
                description: 'Tender grilled chicken breast with herbs and garlic',
                price: 350,
                image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
                category: 'mains',
                isAvailable: true,
                preparationTime: '25 mins',
              },
              {
                id: '4',
                name: 'Vegetable Pasta',
                description: 'Penne pasta with seasonal vegetables in creamy sauce',
                price: 280,
                image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
                category: 'mains',
                isAvailable: true,
                preparationTime: '20 mins',
                isVegetarian: true,
                isVegan: true,
              },
            ],
          },
          {
            id: 'desserts',
            name: 'Desserts',
            items: [
              {
                id: '5',
                name: 'Chocolate Brownie',
                description: 'Warm chocolate brownie with vanilla ice cream',
                price: 150,
                image: 'https://images.unsplash.com/photo-1564355808853-57faa9c45b9d?w=400',
                category: 'desserts',
                isAvailable: true,
                preparationTime: '10 mins',
                isVegetarian: true,
              },
            ],
          },
        ],
      };

      setStoreName(mockData.storeName);
      setCategories(mockData.categories);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load menu';
      setError(errorMessage);
      console.error('Error fetching menu:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchMenu();
    }
  }, [storeId, fetchMenu]);

  // Handle refresh
  const handleRefresh = () => {
    fetchMenu(true);
  };

  // Add to cart
  const handleAddToCart = (item: MenuItem) => {
    const existingItem = cart.find(cartItem => cartItem.menuItem.id === item.id);

    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.menuItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem
      ));
    } else {
      setCart([...cart, { menuItem: item, quantity: 1 }]);
    }

    // Show feedback
    Alert.alert('Added to Cart', `${item.name} added to your cart`);
  };

  // Remove from cart
  const handleRemoveFromCart = (itemId: string) => {
    const existingItem = cart.find(cartItem => cartItem.menuItem.id === itemId);

    if (existingItem && existingItem.quantity > 1) {
      setCart(cart.map(cartItem =>
        cartItem.menuItem.id === itemId
          ? { ...cartItem, quantity: cartItem.quantity - 1 }
          : cartItem
      ));
    } else {
      setCart(cart.filter(cartItem => cartItem.menuItem.id !== itemId));
    }
  };

  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Get filtered menu items
  const filteredItems = selectedCategory === 'all'
    ? categories.flatMap(cat => cat.items)
    : categories.find(cat => cat.id === selectedCategory)?.items || [];

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading menu...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Menu</ThemedText>
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchMenu()}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{storeName} Menu</ThemedText>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        <TouchableOpacity
          style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <ThemedText style={[styles.categoryText, selectedCategory === 'all' && styles.categoryTextActive]}>
            All
          </ThemedText>
        </TouchableOpacity>
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryChip, selectedCategory === category.id && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <ThemedText style={[styles.categoryText, selectedCategory === category.id && styles.categoryTextActive]}>
              {category.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#7C3AED" />
        }
      >
        {filteredItems.map((item) => {
          const cartItem = cart.find(c => c.menuItem.id === item.id);
          const quantity = cartItem?.quantity || 0;

          return (
            <MenuItemCard
              key={item.id}
              item={item}
              quantity={quantity}
              onAdd={() => handleAddToCart(item)}
              onRemove={() => handleRemoveFromCart(item.id)}
            />
          );
        })}

        {filteredItems.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={64} color="#D1D5DB" />
            <ThemedText style={styles.emptyText}>No items available</ThemedText>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Cart Footer */}
      {cart.length > 0 && (
        <View style={styles.cartFooter}>
          <LinearGradient
            colors={['#7C3AED', '#6D28D9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.cartGradient}
          >
            <View style={styles.cartInfo}>
              <View>
                <ThemedText style={styles.cartItemCount}>
                  {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                </ThemedText>
                <ThemedText style={styles.cartTotal}>₹{cartTotal}</ThemedText>
              </View>
              <TouchableOpacity
                style={styles.viewCartButton}
                onPress={() => {
                  // Navigate to cart or checkout
                  Alert.alert('Pre-order', 'Pre-order functionality will be implemented soon', [
                    { text: 'OK' }
                  ]);
                }}
              >
                <ThemedText style={styles.viewCartButtonText}>View Cart</ThemedText>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categoriesContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: '#7C3AED',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  menuContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#9CA3AF',
  },
  cartFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cartGradient: {
    padding: 16,
  },
  cartInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemCount: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  cartTotal: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  viewCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  viewCartButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
