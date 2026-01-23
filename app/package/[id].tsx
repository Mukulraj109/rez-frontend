/**
 * Package Details Page - Dedicated page for package bookings
 * Production-ready with complete booking flow
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Modal,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import productsApi from '@/services/productsApi';
import { useWishlist } from '@/contexts/WishlistContext';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useRegion } from '@/contexts/RegionContext';
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import PackageBookingFlow from '../../components/package/PackageBookingFlow';
import PackageBookingConfirmation from '../../components/package/PackageBookingConfirmation';
import RelatedPackagesSection from '../../components/package/RelatedPackagesSection';
import PackageInfoCard from '../../components/package/PackageInfoCard';
import PackageAmenities from '../../components/package/PackageAmenities';
import PackageCancellationPolicy from '../../components/package/PackageCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface PackageDetails {
  id: string;
  name: string;
  destination?: string;
  duration?: {
    nights: number;
    days: number;
  };
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  cashback: {
    percentage: number;
    amount: number;
  };
  rating: number;
  reviewCount: number;
  store: {
    id: string;
    name: string;
    logo?: string;
  };
  amenities: string[];
  inclusions?: string[];
  cancellationPolicy: {
    freeCancellation: boolean;
    cancellationDeadline: string; // days before travel
    refundPercentage: number;
  };
  accommodationOptions: {
    standard: { price: number; available: boolean; description?: string };
    deluxe: { price: number; available: boolean; description?: string };
    luxury: { price: number; available: boolean; description?: string };
  };
}

interface BookingData {
  travelDate: Date;
  returnDate: Date;
  travelers: {
    adults: number;
    children: number;
  };
  accommodationType: 'standard' | 'deluxe' | 'luxury';
  mealPlan: 'none' | 'breakfast' | 'halfBoard' | 'fullBoard';
  selectedAddons: {
    sightseeing?: boolean;
    transfers?: boolean;
    travelInsurance?: boolean;
    guide?: boolean;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  travelerDetails: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function PackageDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { getCurrencySymbol, getLocale } = useRegion();
  const currencySymbol = getCurrencySymbol();
  const locale = getLocale();

  const [packageData, setPackageData] = useState<PackageDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  
  // Animation for button
  const buttonScale = useRef(new Animated.Value(1)).current;

  // Reviews
  const {
    reviews,
    summary: reviewSummary,
    isLoading: reviewsLoading,
    refreshReviews,
  } = useProductReviews({
    productId: id as string,
    autoLoad: true,
  });

  useEffect(() => {
    if (id) {
      loadPackageDetails();
    }
  }, [id]);

  const loadPackageDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Package not found');
        return;
      }

      const productData = response.data;

      // Check if this is a package service
      const isPackage = productData.serviceCategory?.slug === 'packages' || 
                       productData.category?.slug === 'packages' ||
                       productData.name?.toLowerCase().includes('package') ||
                       productData.name?.toLowerCase().includes('tour');

      if (!isPackage) {
        router.replace(`/product/${id}`);
        return;
      }

      // Extract destination and duration from name (e.g., "Goa 3N/4D Package")
      let destination = 'Travel Destination';
      let nights = 3;
      let days = 4;
      
      const namePatterns = [
        /(.+?)\s+(\d+)N\/(\d+)D/i,
        /(.+?)\s+(\d+)\s+nights/i,
        /(.+?)\s+package/i,
      ];
      
      for (const pattern of namePatterns) {
        const match = productData.name.match(pattern);
        if (match) {
          destination = match[1].trim();
          if (match[2]) nights = parseInt(match[2]) || 3;
          if (match[3]) days = parseInt(match[3]) || nights + 1;
          break;
        }
      }

      // If no match, try to extract destination from name
      if (destination === 'Travel Destination') {
        const destinations = ['Goa', 'Kerala', 'Rajasthan', 'Himachal', 'Manali', 'Shimla', 'Darjeeling'];
        for (const dest of destinations) {
          if (productData.name.toLowerCase().includes(dest.toLowerCase())) {
            destination = dest;
            break;
          }
        }
      }

      // Get cashback
      const cashbackPercentage = (() => {
        if (productData.cashback?.percentage) return productData.cashback.percentage;
        if (productData.serviceCategory?.cashbackPercentage) return productData.serviceCategory.cashbackPercentage;
        if (productData.category?.maxCashback) return productData.category.maxCashback;
        if (typeof productData.cashback === 'number') return productData.cashback;
        return 22;
      })();

      // Calculate price
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Transform to PackageDetails
      const packageDetails: PackageDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        destination,
        duration: {
          nights,
          days,
        },
        price: basePrice,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        images: (() => {
          if (!productData.images || !Array.isArray(productData.images)) {
            return ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop'];
          }
          
          const processedImages = productData.images
            .map((img: any) => {
              if (typeof img === 'string') return img.trim();
              if (img && typeof img === 'object') return img.url || img.uri || img.src || null;
              return null;
            })
            .filter((url: string | null): url is string => Boolean(url && typeof url === 'string' && url.length > 0));
          
          return processedImages.length > 0 ? processedImages : ['https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&h=600&fit=crop'];
        })(),
        description: productData.description || productData.shortDescription || 'Complete travel package with hotel, meals, and sightseeing.',
        cashback: {
          percentage: cashbackPercentage,
          amount: Math.round(basePrice * cashbackPercentage / 100),
        },
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        store: {
          id: productData.store?.id || productData.store?._id,
          name: productData.store?.name || 'Wanderlust Tours',
          logo: productData.store?.logo,
        },
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'luxury': ['Hotel', 'Meals', 'Transport', 'Sightseeing', 'Guide', 'Wi-Fi', 'AC'],
            'premium': ['Hotel', 'Meals', 'Transport', 'Sightseeing', 'Wi-Fi'],
            'budget': ['Hotel', 'Breakfast', 'Transport', 'Sightseeing'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          
          return ['Hotel', 'Meals', 'Transport', 'Sightseeing', 'Wi-Fi'];
        })(),
        inclusions: ['Hotel Accommodation', 'Meals', 'Transport', 'Sightseeing', 'Entry Tickets'],
        cancellationPolicy: {
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '7',
          refundPercentage: 80,
        },
        accommodationOptions: {
          standard: { 
            price: basePrice, 
            available: true,
            description: 'Comfortable standard accommodation',
          },
          deluxe: { 
            price: Math.round(basePrice * 1.3), 
            available: true,
            description: 'Premium deluxe accommodation',
          },
          luxury: { 
            price: Math.round(basePrice * 1.6), 
            available: true,
            description: 'Luxury accommodation with premium amenities',
          },
        },
      };

      setPackageData(packageDetails);
    } catch (error) {
      console.error('Error loading package details:', error);
      setError('Failed to load package details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    setShowBookingFlow(true);
  };

  const handleBookingComplete = (data: BookingData) => {
    setBookingData(data);
    setShowBookingFlow(false);
    setShowConfirmation(true);
  };

  const handleBack = () => {
    router.back();
  };

  const handleFavorite = async () => {
    if (!packageData) return;
    
    try {
      if (isInWishlist(packageData.id)) {
        await removeFromWishlist(packageData.id);
      } else {
        await addToWishlist(packageData.id);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Loading package details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !packageData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Package not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPackageDetails}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Image */}
        <View style={styles.headerContainer}>
          {(() => {
            const imageUrl = packageData.images?.[selectedImageIndex] || packageData.images?.[0];
            const hasValidImage = imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0;
            
            if (hasValidImage && !imageError) {
              return (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.headerImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                  onLoadStart={() => setImageError(false)}
                />
              );
            }
            
            return (
              <View style={[styles.headerImage, styles.placeholderImage]}>
                <Ionicons name="bag" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Package Image</Text>
              </View>
            );
          })()}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.headerGradient}
          />
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.headerRightActions}>
              <TouchableOpacity style={styles.actionButton} onPress={handleFavorite}>
                <Ionicons
                  name={isInWishlist(packageData.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(packageData.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {packageData.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {packageData.images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    selectedImageIndex === index && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Package Info Card */}
        <View style={styles.infoCardWrapper}>
          <PackageInfoCard package={packageData} />
        </View>

        {/* Store/Provider Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Tour Operator</Text>
          </View>
          <View style={styles.storeCard}>
            {packageData.store.logo && (
              <Image source={{ uri: packageData.store.logo }} style={styles.storeLogo} />
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{packageData.store.name}</Text>
              <View style={styles.storeBadge}>
                <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                <Text style={styles.storeBadgeText}>Verified</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.viewStoreButton}>
              <Text style={styles.viewStoreButtonText}>View Store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Price & Cashback */}
        <View style={styles.section}>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <View style={styles.priceValueContainer}>
                  <Text style={styles.priceValue}>{currencySymbol}{packageData.price.toLocaleString(locale)}</Text>
                  {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                    <Text style={styles.originalPrice}>{currencySymbol}{packageData.originalPrice.toLocaleString(locale)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.cashbackBadge}>
                <Ionicons name="cash" size={20} color="#FFFFFF" />
                <Text style={styles.cashbackText}>
                  {packageData.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>{currencySymbol}{packageData.cashback.amount}</Text>
              </View>
            </View>
            {packageData.discount && packageData.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{packageData.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Package Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {packageData.duration?.nights || 3}N/{packageData.duration?.days || 4}D
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="location-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>{packageData.destination || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="star" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>{packageData.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="people-outline" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.detailLabel}>Reviews</Text>
              <Text style={styles.detailValue}>{packageData.reviewCount}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#8B5CF6" />
            <Text style={styles.sectionTitle}>Inclusions & Amenities</Text>
          </View>
          <PackageAmenities amenities={packageData.amenities} inclusions={packageData.inclusions} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionTitle}>About This Package</Text>
          <Text style={styles.description}>{packageData.description}</Text>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <PackageCancellationPolicy policy={packageData.cancellationPolicy} />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <ProductReviewsSection
            productId={id as string}
            productName={packageData.name}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Packages */}
        <View style={styles.section}>
          <RelatedPackagesSection currentPackageId={packageData.id} />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        <View style={styles.priceInfoCard}>
          <View style={styles.priceInfoRow}>
            <View style={styles.priceInfoLeft}>
              <Text style={styles.priceInfoLabel}>Total Price</Text>
              <View style={styles.priceInfoValueContainer}>
                <Text style={styles.priceInfoValue}>
                  {currencySymbol}{packageData.price.toLocaleString(locale)}
                </Text>
                {packageData.originalPrice && packageData.originalPrice > packageData.price && (
                  <Text style={styles.priceInfoOriginal}>{currencySymbol}{packageData.originalPrice.toLocaleString(locale)}</Text>
                )}
              </View>
            </View>
            <View style={styles.cashbackInfo}>
              <Ionicons name="cash" size={18} color="#8B5CF6" />
              <Text style={styles.cashbackInfoText}>{packageData.cashback.percentage}% Cashback</Text>
            </View>
          </View>
        </View>
        
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookNow}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#8B5CF6', '#7C3AED', '#6D28D9']}
              style={styles.bookButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.bookButtonContent}>
                <View style={styles.bookButtonLeft}>
                  <Ionicons name="calendar" size={22} color="#FFFFFF" />
                  <Text style={styles.bookButtonText}>Book Now</Text>
                </View>
                <View style={styles.bookButtonRight}>
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Booking Flow Modal */}
      <Modal
        visible={showBookingFlow}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBookingFlow(false)}
      >
        {packageData && (
          <PackageBookingFlow
            package={packageData}
            onComplete={handleBookingComplete}
            onClose={() => setShowBookingFlow(false)}
          />
        )}
      </Modal>

      {/* Booking Confirmation Modal */}
      <Modal
        visible={showConfirmation}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowConfirmation(false);
          router.back();
        }}
      >
        {bookingData && packageData && (
          <PackageBookingConfirmation
            package={packageData}
            bookingData={bookingData}
            onClose={() => {
              setShowConfirmation(false);
              router.back();
            }}
          />
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    width: screenWidth,
    height: 300,
    position: 'relative',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
  headerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
  },
  headerActions: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
    width: 24,
  },
  infoCardWrapper: {
    marginTop: -20,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  storeLogo: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  storeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  storeBadgeText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '500',
  },
  viewStoreButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  viewStoreButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  priceContainer: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  priceValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  cashbackBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cashbackText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  cashbackAmount: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#22C55E',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  detailItem: {
    width: (screenWidth - 48) / 2,
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3E8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  bookButtonContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 16,
    zIndex: 1001,
  },
  priceInfoCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceInfoLeft: {
    flex: 1,
  },
  priceInfoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceInfoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceInfoValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  priceInfoOriginal: {
    fontSize: 16,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  cashbackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  cashbackInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B21A8',
  },
  bookButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  bookButtonGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },
  bookButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bookButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bookButtonRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
