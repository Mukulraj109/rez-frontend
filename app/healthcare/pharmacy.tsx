import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Alert,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import apiClient from '@/services/apiClient';

const { width } = Dimensions.get('window');

// TypeScript Interfaces
interface PharmacyStore {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  address: {
    street?: string;
    city: string;
    state: string;
    pincode?: string;
  };
  contact: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  isActive: boolean;
  metadata?: {
    deliveryTime?: string;
    minimumOrder?: number;
    deliveryFee?: number;
    acceptsPrescription?: boolean;
    is24Hours?: boolean;
    hasHomeDelivery?: boolean;
  };
}

interface Medicine {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  images: string[];
  price: {
    mrp: number;
    selling: number;
    discount?: number;
  };
  category: string;
  subCategory?: string;
  storeId: string;
  store?: PharmacyStore;
  metadata?: {
    manufacturer?: string;
    composition?: string;
    packSize?: string;
    requiresPrescription?: boolean;
  };
}

interface MedicineCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

// Medicine categories
const medicineCategories: MedicineCategory[] = [
  { id: 'all', name: 'All', icon: 'grid', color: '#06B6D4' },
  { id: 'pain_relief', name: 'Pain Relief', icon: 'bandage', color: '#EF4444' },
  { id: 'vitamins', name: 'Vitamins', icon: 'nutrition', color: '#F59E0B' },
  { id: 'diabetes', name: 'Diabetes', icon: 'water', color: '#3B82F6' },
  { id: 'cardiac', name: 'Cardiac', icon: 'heart', color: '#EC4899' },
  { id: 'skin_care', name: 'Skin Care', icon: 'sparkles', color: '#8B5CF6' },
  { id: 'baby_care', name: 'Baby Care', icon: 'happy', color: '#10B981' },
  { id: 'ayurveda', name: 'Ayurveda', icon: 'leaf', color: '#059669' },
];

export default function PharmacyPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<PharmacyStore[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cart state
  const [cart, setCart] = useState<{ medicine: Medicine; quantity: number }[]>([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);

  // Prescription upload modal
  const [prescriptionModalVisible, setPrescriptionModalVisible] = useState(false);
  const [prescriptionImage, setPrescriptionImage] = useState<string | null>(null);
  const [prescriptionNotes, setPrescriptionNotes] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Fetch medicines and pharmacies
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch pharmacies
      const pharmacyResponse = await apiClient.get('/stores?category=healthcare&type=pharmacy');
      if (pharmacyResponse.success && pharmacyResponse.data?.stores) {
        setPharmacies(pharmacyResponse.data.stores);
      }

      // Fetch medicines/products
      const medicineResponse = await apiClient.get('/products?category=healthcare&type=medicine');
      if (medicineResponse.success && medicineResponse.data?.products) {
        setMedicines(medicineResponse.data.products);
        setFilteredMedicines(medicineResponse.data.products);
      }
    } catch (error) {
      console.error('Error fetching pharmacy data:', error);
      Alert.alert('Error', 'Failed to load pharmacy data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter medicines based on search and category
  useEffect(() => {
    let filtered = medicines;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(query) ||
          medicine.metadata?.manufacturer?.toLowerCase().includes(query) ||
          medicine.metadata?.composition?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (medicine) =>
          medicine.subCategory?.toLowerCase() === selectedCategory.toLowerCase() ||
          medicine.category.toLowerCase().includes(selectedCategory.replace('_', ' '))
      );
    }

    setFilteredMedicines(filtered);
  }, [searchQuery, selectedCategory, medicines]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, []);

  // Cart functions
  const addToCart = (medicine: Medicine) => {
    const existingItem = cart.find((item) => item.medicine._id === medicine._id);
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.medicine._id === medicine._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { medicine, quantity: 1 }]);
    }
    Alert.alert('Added to Cart', `${medicine.name} added to cart`);
  };

  const removeFromCart = (medicineId: string) => {
    setCart(cart.filter((item) => item.medicine._id !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
    } else {
      setCart(
        cart.map((item) =>
          item.medicine._id === medicineId ? { ...item, quantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce(
      (total, item) => total + item.medicine.price.selling * item.quantity,
      0
    );
  };

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  // Prescription upload functions
  const pickPrescriptionImage = async (fromCamera: boolean) => {
    try {
      let result;

      if (fromCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Camera access is required to take photos.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('Permission Required', 'Gallery access is required to select images.');
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets[0]) {
        setPrescriptionImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image.');
    }
  };

  const submitPrescription = async () => {
    if (!prescriptionImage) {
      Alert.alert('Required', 'Please upload a prescription image');
      return;
    }

    try {
      setIsUploading(true);

      // In a real implementation, upload the image to Cloudinary
      // and create an order with prescription
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulated delay

      Alert.alert(
        'Prescription Submitted',
        'Your prescription has been submitted. Our pharmacist will review it and contact you shortly.',
        [
          {
            text: 'OK',
            onPress: () => {
              setPrescriptionModalVisible(false);
              setPrescriptionImage(null);
              setPrescriptionNotes('');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting prescription:', error);
      Alert.alert('Error', 'Failed to submit prescription. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to cart before checkout.');
      return;
    }

    // Navigate to checkout or process order
    Alert.alert(
      'Proceed to Checkout',
      `Total: Rs ${getCartTotal()}\n\nThis will process your order for ${getCartItemCount()} items.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: () => {
            // Process order
            Alert.alert('Order Placed', 'Your order has been placed successfully!');
            setCart([]);
            setCartModalVisible(false);
          },
        },
      ]
    );
  };

  // Render category chip
  const renderCategoryChip = (category: MedicineCategory) => {
    const isSelected = selectedCategory === category.id;
    return (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryChip,
          isSelected && { backgroundColor: category.color },
        ]}
        onPress={() => setSelectedCategory(category.id)}
      >
        <Ionicons
          name={category.icon as any}
          size={16}
          color={isSelected ? '#fff' : category.color}
        />
        <Text
          style={[
            styles.categoryChipText,
            isSelected && styles.categoryChipTextSelected,
          ]}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render pharmacy card
  const renderPharmacyCard = (pharmacy: PharmacyStore) => (
    <TouchableOpacity key={pharmacy._id} style={styles.pharmacyCard}>
      <View style={styles.pharmacyLogo}>
        {pharmacy.logo ? (
          <Image source={{ uri: pharmacy.logo }} style={styles.pharmacyLogoImg} />
        ) : (
          <Ionicons name="medical" size={28} color="#06B6D4" />
        )}
      </View>
      <View style={styles.pharmacyInfo}>
        <Text style={styles.pharmacyName} numberOfLines={1}>
          {pharmacy.name}
        </Text>
        <Text style={styles.pharmacyLocation} numberOfLines={1}>
          {pharmacy.address.city}
        </Text>
        <View style={styles.pharmacyMeta}>
          {pharmacy.metadata?.is24Hours && (
            <View style={styles.pharmacyBadge}>
              <Text style={styles.pharmacyBadgeText}>24/7</Text>
            </View>
          )}
          {pharmacy.metadata?.hasHomeDelivery && (
            <View style={[styles.pharmacyBadge, { backgroundColor: '#10B981' }]}>
              <Text style={styles.pharmacyBadgeText}>Delivery</Text>
            </View>
          )}
        </View>
      </View>
      <View style={styles.pharmacyRating}>
        <Ionicons name="star" size={12} color="#F59E0B" />
        <Text style={styles.pharmacyRatingText}>
          {pharmacy.ratings.average.toFixed(1)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render medicine card
  const renderMedicineCard = (medicine: Medicine) => {
    const discount = medicine.price.discount ||
      Math.round(((medicine.price.mrp - medicine.price.selling) / medicine.price.mrp) * 100);

    return (
      <TouchableOpacity key={medicine._id} style={styles.medicineCard}>
        <View style={styles.medicineImageContainer}>
          {medicine.images && medicine.images.length > 0 ? (
            <Image source={{ uri: medicine.images[0] }} style={styles.medicineImage} />
          ) : (
            <View style={styles.medicineImagePlaceholder}>
              <Ionicons name="medical" size={32} color="#D1D5DB" />
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
          {medicine.metadata?.requiresPrescription && (
            <View style={styles.rxBadge}>
              <Text style={styles.rxText}>Rx</Text>
            </View>
          )}
        </View>

        <View style={styles.medicineContent}>
          <Text style={styles.medicineName} numberOfLines={2}>
            {medicine.name}
          </Text>
          {medicine.metadata?.packSize && (
            <Text style={styles.medicinePackSize}>{medicine.metadata.packSize}</Text>
          )}
          {medicine.metadata?.manufacturer && (
            <Text style={styles.medicineManufacturer} numberOfLines={1}>
              {medicine.metadata.manufacturer}
            </Text>
          )}

          <View style={styles.priceContainer}>
            <Text style={styles.sellingPrice}>Rs {medicine.price.selling}</Text>
            {medicine.price.mrp > medicine.price.selling && (
              <Text style={styles.mrpPrice}>Rs {medicine.price.mrp}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => addToCart(medicine)}
          >
            <Ionicons name="cart-outline" size={16} color="#fff" />
            <Text style={styles.addToCartText}>Add</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#06B6D4', '#0891B2']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Online Pharmacy</Text>
            <Text style={styles.headerSubtitle}>Medicines delivered to your door</Text>
          </View>
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setCartModalVisible(true)}
          >
            <Ionicons name="cart" size={24} color="#fff" />
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#6B7280" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, health products..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#06B6D4']} />
        }
      >
        {/* Upload Prescription Banner */}
        <TouchableOpacity
          style={styles.prescriptionBanner}
          onPress={() => setPrescriptionModalVisible(true)}
        >
          <View style={styles.prescriptionBannerIcon}>
            <Ionicons name="document-text" size={28} color="#fff" />
          </View>
          <View style={styles.prescriptionBannerContent}>
            <Text style={styles.prescriptionBannerTitle}>Upload Prescription</Text>
            <Text style={styles.prescriptionBannerText}>
              Order medicines by uploading your prescription
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#fff" />
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {medicineCategories.map(renderCategoryChip)}
          </ScrollView>
        </View>

        {/* Pharmacies */}
        {pharmacies.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nearby Pharmacies</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pharmaciesScroll}
            >
              {pharmacies.slice(0, 5).map(renderPharmacyCard)}
            </ScrollView>
          </View>
        )}

        {/* Medicines Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'all' ? 'All Products' : medicineCategories.find(c => c.id === selectedCategory)?.name}
            </Text>
            <Text style={styles.resultCount}>{filteredMedicines.length} products</Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#06B6D4" />
              <Text style={styles.loadingText}>Loading medicines...</Text>
            </View>
          ) : filteredMedicines.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="medical-outline" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No medicines found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Check back later for available medicines'}
              </Text>
            </View>
          ) : (
            <View style={styles.medicinesGrid}>
              {filteredMedicines.map(renderMedicineCard)}
            </View>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Cart Button Fixed at Bottom */}
      {cart.length > 0 && (
        <TouchableOpacity
          style={styles.floatingCartButton}
          onPress={() => setCartModalVisible(true)}
        >
          <View style={styles.floatingCartContent}>
            <View style={styles.floatingCartInfo}>
              <Text style={styles.floatingCartItems}>{getCartItemCount()} items</Text>
              <Text style={styles.floatingCartTotal}>Rs {getCartTotal()}</Text>
            </View>
            <View style={styles.floatingCartAction}>
              <Text style={styles.floatingCartActionText}>View Cart</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cartModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity onPress={() => setCartModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            {cart.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Ionicons name="cart-outline" size={64} color="#D1D5DB" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
                <TouchableOpacity
                  style={styles.continueShopping}
                  onPress={() => setCartModalVisible(false)}
                >
                  <Text style={styles.continueShoppingText}>Continue Shopping</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScrollView style={styles.cartItems}>
                  {cart.map((item) => (
                    <View key={item.medicine._id} style={styles.cartItem}>
                      <View style={styles.cartItemImage}>
                        {item.medicine.images && item.medicine.images.length > 0 ? (
                          <Image
                            source={{ uri: item.medicine.images[0] }}
                            style={styles.cartItemImg}
                          />
                        ) : (
                          <Ionicons name="medical" size={24} color="#D1D5DB" />
                        )}
                      </View>
                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName} numberOfLines={2}>
                          {item.medicine.name}
                        </Text>
                        <Text style={styles.cartItemPrice}>
                          Rs {item.medicine.price.selling}
                        </Text>
                      </View>
                      <View style={styles.cartItemActions}>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() =>
                            updateCartQuantity(item.medicine._id, item.quantity - 1)
                          }
                        >
                          <Ionicons name="remove" size={18} color="#06B6D4" />
                        </TouchableOpacity>
                        <Text style={styles.quantityText}>{item.quantity}</Text>
                        <TouchableOpacity
                          style={styles.quantityButton}
                          onPress={() =>
                            updateCartQuantity(item.medicine._id, item.quantity + 1)
                          }
                        >
                          <Ionicons name="add" size={18} color="#06B6D4" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </ScrollView>

                <View style={styles.cartSummary}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>Rs {getCartTotal()}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Delivery</Text>
                    <Text style={styles.summaryValueFree}>FREE</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>Rs {getCartTotal()}</Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={handleCheckout}
                  >
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Prescription Upload Modal */}
      <Modal
        visible={prescriptionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setPrescriptionModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.prescriptionModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Prescription</Text>
              <TouchableOpacity onPress={() => setPrescriptionModalVisible(false)}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.prescriptionInfo}>
                Upload a clear photo of your prescription. Our pharmacist will verify it
                and contact you within 2 hours.
              </Text>

              {prescriptionImage ? (
                <View style={styles.prescriptionPreview}>
                  <Image
                    source={{ uri: prescriptionImage }}
                    style={styles.prescriptionPreviewImage}
                  />
                  <TouchableOpacity
                    style={styles.removePreviewButton}
                    onPress={() => setPrescriptionImage(null)}
                  >
                    <Ionicons name="close-circle" size={28} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.uploadOptions}>
                  <TouchableOpacity
                    style={styles.uploadOption}
                    onPress={() => pickPrescriptionImage(true)}
                  >
                    <View style={styles.uploadOptionIcon}>
                      <Ionicons name="camera" size={32} color="#06B6D4" />
                    </View>
                    <Text style={styles.uploadOptionText}>Take Photo</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.uploadOption}
                    onPress={() => pickPrescriptionImage(false)}
                  >
                    <View style={styles.uploadOptionIcon}>
                      <Ionicons name="images" size={32} color="#06B6D4" />
                    </View>
                    <Text style={styles.uploadOptionText}>From Gallery</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.modalSectionTitle}>Additional Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Any specific instructions or medicine names..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                value={prescriptionNotes}
                onChangeText={setPrescriptionNotes}
              />

              <View style={styles.prescriptionTips}>
                <Text style={styles.tipsTitle}>Tips for a valid prescription:</Text>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>
                    Must be issued by a registered doctor
                  </Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>Should be dated within last 6 months</Text>
                </View>
                <View style={styles.tipRow}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.tipText}>
                    Clear and readable handwriting or print
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitPrescriptionButton,
                  (!prescriptionImage || isUploading) && styles.submitButtonDisabled,
                ]}
                onPress={submitPrescription}
                disabled={!prescriptionImage || isUploading}
              >
                {isUploading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="#fff" />
                    <Text style={styles.submitPrescriptionText}>Submit Prescription</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
    color: '#1F2937',
  },
  content: {
    flex: 1,
  },
  prescriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0891B2',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  prescriptionBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prescriptionBannerContent: {
    flex: 1,
  },
  prescriptionBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  prescriptionBannerText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  section: {
    paddingVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#06B6D4',
    fontWeight: '600',
  },
  resultCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoriesScroll: {
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  categoryChipText: {
    fontSize: 13,
    color: '#4B5563',
    fontWeight: '500',
    marginLeft: 6,
  },
  categoryChipTextSelected: {
    color: '#fff',
  },
  pharmaciesScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pharmacyCard: {
    width: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
  },
  pharmacyLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  pharmacyLogoImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  pharmacyInfo: {
    flex: 1,
  },
  pharmacyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  pharmacyLocation: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  pharmacyMeta: {
    flexDirection: 'row',
    marginTop: 6,
    gap: 4,
  },
  pharmacyBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pharmacyBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  pharmacyRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  pharmacyRatingText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  medicinesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  medicineCard: {
    width: (width - 40) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 4,
    overflow: 'hidden',
  },
  medicineImageContainer: {
    height: 120,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  medicineImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  medicineImagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  rxBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rxText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  medicineContent: {
    padding: 10,
  },
  medicineName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    minHeight: 36,
  },
  medicinePackSize: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  medicineManufacturer: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  sellingPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  mrpPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 4,
  },
  addToCartText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bottomPadding: {
    height: 100,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: '#06B6D4',
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  floatingCartContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  floatingCartInfo: {},
  floatingCartItems: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  floatingCartTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  floatingCartAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  floatingCartActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  cartModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  prescriptionModalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  emptyCartContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
    marginBottom: 20,
  },
  continueShopping: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#06B6D4',
    borderRadius: 8,
  },
  continueShoppingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cartItems: {
    maxHeight: 300,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  cartItemImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartItemImg: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  cartItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#06B6D4',
    marginTop: 4,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFEFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginHorizontal: 12,
  },
  cartSummary: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  summaryValueFree: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#06B6D4',
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 16,
    gap: 8,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  // Prescription Modal Styles
  prescriptionInfo: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  uploadOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 20,
    gap: 20,
  },
  uploadOption: {
    alignItems: 'center',
    backgroundColor: '#ECFEFF',
    padding: 20,
    borderRadius: 12,
    width: 120,
  },
  uploadOptionIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  uploadOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0891B2',
  },
  prescriptionPreview: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  prescriptionPreviewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removePreviewButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
  },
  modalSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  notesInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    fontSize: 14,
    color: '#1F2937',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  prescriptionTips: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 8,
    flex: 1,
  },
  submitPrescriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06B6D4',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitPrescriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
