/**
 * Bus Details Page - Dedicated page for bus bookings
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
import ProductReviewsSection from '@/components/reviews/ProductReviewsSection';
import BusBookingFlow from '../../components/bus/BusBookingFlow';
import BusBookingConfirmation from '../../components/bus/BusBookingConfirmation';
import RelatedBusesSection from '../../components/bus/RelatedBusesSection';
import BusInfoCard from '../../components/bus/BusInfoCard';
import BusAmenities from '../../components/bus/BusAmenities';
import BusCancellationPolicy from '../../components/bus/BusCancellationPolicy';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface BusDetails {
  id: string;
  name: string;
  route?: {
    from: string;
    to: string;
    fromTerminal?: string;
    toTerminal?: string;
  };
  busNumber?: string;
  busType?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  description: string;
  duration: number; // in minutes
  departureTime?: string;
  arrivalTime?: string;
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
  cancellationPolicy: {
    freeCancellation: boolean;
    cancellationDeadline: string; // hours before departure
    refundPercentage: number;
  };
  classOptions: {
    seater: { price: number; available: boolean };
    sleeper: { price: number; available: boolean };
    semiSleeper: { price: number; available: boolean };
    ac: { price: number; available: boolean };
  };
}

interface BookingData {
  travelDate: Date;
  returnDate?: Date;
  tripType: 'one-way' | 'round-trip';
  passengers: {
    adults: number;
    children: number;
  };
  busClass: 'seater' | 'sleeper' | 'semiSleeper' | 'ac';
  selectedExtras: {
    meals?: boolean;
    insurance?: boolean;
    cancellation?: boolean;
  };
  contactInfo: {
    name: string;
    email: string;
    phone: string;
  };
  passengerDetails: Array<{
    firstName: string;
    lastName: string;
    age: number;
    gender: 'male' | 'female' | 'other';
    seatPreference?: 'window' | 'aisle' | 'no-preference';
  }>;
  bookingId?: string;
  bookingNumber?: string;
}

export default function BusDetailsPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  
  const [bus, setBus] = useState<BusDetails | null>(null);
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
      loadBusDetails();
    }
  }, [id]);

  const loadBusDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await productsApi.getProductById(id as string);

      if (!response.success || !response.data) {
        setError('Bus not found');
        return;
      }

      const productData = response.data;

      // Check if this is a bus service
      const isBus = productData.serviceCategory?.slug === 'bus' || 
                   productData.category?.slug === 'bus' ||
                   productData.name?.toLowerCase().includes('bus');

      if (!isBus) {
        router.replace(`/product/${id}`);
        return;
      }

      // Extract route from name if available
      let from = 'Origin';
      let to = 'Destination';
      const routePatterns = [
        /(.+?)\s+to\s+(.+?)\s+bus/i,
        /(.+?)\s*-\s*(.+?)\s+bus/i,
        /(.+?)\s+→\s+(.+?)\s+bus/i,
        /(.+?)\s+bus\s+to\s+(.+?)/i,
      ];
      
      for (const pattern of routePatterns) {
        const match = productData.name.match(pattern);
        if (match) {
          from = match[1].trim();
          to = match[2] ? match[2].trim() : 'Destination';
          break;
        }
      }

      // If no route found, use defaults
      if (from === 'Origin') {
        if (productData.name.toLowerCase().includes('volvo')) {
          from = 'Bangalore';
          to = 'Mumbai';
        } else if (productData.name.toLowerCase().includes('sleeper')) {
          from = 'Delhi';
          to = 'Jaipur';
        }
      }

      // Calculate times based on duration - ensure valid number
      const rawDuration = productData.serviceDetails?.duration;
      const duration = (typeof rawDuration === 'number' && !isNaN(rawDuration) && rawDuration > 0) 
        ? rawDuration 
        : 480; // Default to 8 hours if invalid
      
      const durationHours = Math.floor(duration / 60);
      const durationMins = duration % 60;
      const baseDepartureHour = 8;
      const baseDepartureMin = 0;
      const arrivalHour = (baseDepartureHour + durationHours + Math.floor((baseDepartureMin + durationMins) / 60)) % 24;
      const arrivalMin = (baseDepartureMin + durationMins) % 60;
      
      const formatTime = (hours: number, mins: number) => {
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
      };

      // Get cashback from multiple sources
      const cashbackPercentage = (() => {
        if (productData.cashback?.percentage) return productData.cashback.percentage;
        if (productData.serviceCategory?.cashbackPercentage) return productData.serviceCategory.cashbackPercentage;
        if (productData.category?.maxCashback) return productData.category.maxCashback;
        if (typeof productData.cashback === 'number') return productData.cashback;
        return 15;
      })();

      // Calculate price properly
      const basePrice = productData.pricing?.selling || productData.pricing?.basePrice || productData.price?.current || 0;
      const originalPrice = productData.pricing?.original || productData.pricing?.basePrice || productData.price?.original;
      const calculatedDiscount = originalPrice && basePrice && originalPrice > basePrice
        ? Math.round(((originalPrice - basePrice) / originalPrice) * 100)
        : productData.pricing?.discount || 0;

      // Extract bus number from SKU or generate
      const busNumber = productData.sku || productData.barcode || 
        `${productData.name.substring(0, 3).toUpperCase()}${(productData.id || productData._id || '').toString().slice(-4)}`;

      // Transform to BusDetails
      const busDetails: BusDetails = {
        id: productData.id || productData._id,
        name: productData.name,
        route: {
          from,
          to,
          fromTerminal: `${from} Bus Terminal`,
          toTerminal: `${to} Bus Terminal`,
        },
        busNumber,
        busType: (() => {
          if (productData.name.toLowerCase().includes('volvo')) return 'Volvo AC Sleeper';
          if (productData.name.toLowerCase().includes('sleeper')) return 'Sleeper';
          if (productData.name.toLowerCase().includes('seater')) return 'Seater';
          if (productData.name.toLowerCase().includes('ac')) return 'AC Bus';
          return 'Sleeper';
        })(),
        price: basePrice,
        originalPrice: originalPrice && originalPrice > basePrice ? originalPrice : undefined,
        discount: calculatedDiscount > 0 ? calculatedDiscount : undefined,
        images: (() => {
          if (!productData.images || !Array.isArray(productData.images)) {
            return ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop'];
          }
          
          const processedImages = productData.images
            .map((img: any) => {
              if (typeof img === 'string') return img.trim();
              if (img && typeof img === 'object') return img.url || img.uri || img.src || null;
              return null;
            })
            .filter((url: string | null): url is string => Boolean(url && typeof url === 'string' && url.length > 0));
          
          // Validate images are bus-related
          const validatedImages = processedImages.map(url => {
            if ((url.toLowerCase().includes('train') || url.toLowerCase().includes('cab') || 
                 url.toLowerCase().includes('airplane') || url.toLowerCase().includes('hotel')) &&
                !url.toLowerCase().includes('bus')) {
              return 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop';
            }
            return url;
          });
          
          return validatedImages.length > 0 ? validatedImages : ['https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=600&fit=crop'];
        })(),
        description: productData.description || productData.shortDescription || 'Comfortable bus journey with excellent service.',
        duration: duration,
        departureTime: formatTime(baseDepartureHour, baseDepartureMin),
        arrivalTime: formatTime(arrivalHour, arrivalMin),
        cashback: {
          percentage: cashbackPercentage,
          amount: Math.round(basePrice * cashbackPercentage / 100),
        },
        rating: reviewSummary?.averageRating || productData.ratings?.average || 0,
        reviewCount: reviewSummary?.totalReviews || productData.ratings?.count || 0,
        store: {
          id: productData.store?.id || productData.store?._id,
          name: productData.store?.name || 'BusConnect',
          logo: productData.store?.logo,
        },
        amenities: (() => {
          const tagAmenities: Record<string, string[]> = {
            'premium': ['AC', 'Wi-Fi', 'Reclining Seats', 'Charging Point', 'Entertainment', 'Meals'],
            'sleeper': ['AC', 'Reclining Seats', 'Charging Point', 'Reading Light', 'Blankets'],
            'seater': ['AC', 'Reclining Seats', 'Charging Point', 'Water'],
          };
          
          const tags = productData.tags || [];
          for (const [key, amenities] of Object.entries(tagAmenities)) {
            if (tags.some((tag: string) => tag.toLowerCase().includes(key))) {
              return amenities;
            }
          }
          
          // Default amenities based on bus type
          if (productData.name.toLowerCase().includes('volvo') || 
              productData.name.toLowerCase().includes('ac')) {
            return ['AC', 'Wi-Fi', 'Reclining Seats', 'Charging Point', 'Entertainment'];
          }
          return ['AC', 'Reclining Seats', 'Charging Point', 'Water'];
        })(),
        cancellationPolicy: {
          freeCancellation: productData.specifications?.some((s: any) => 
            s.key?.toLowerCase().includes('cancellation') && s.value?.toLowerCase().includes('free')
          ) || true,
          cancellationDeadline: '24',
          refundPercentage: 80,
        },
        classOptions: {
          seater: { 
            price: basePrice, 
            available: true 
          },
          sleeper: { 
            price: Math.round(basePrice * 1.3), 
            available: true 
          },
          semiSleeper: { 
            price: Math.round(basePrice * 1.2), 
            available: true 
          },
          ac: { 
            price: Math.round(basePrice * 1.5), 
            available: true 
          },
        },
      };

      setBus(busDetails);
    } catch (error) {
      console.error('Error loading bus details:', error);
      setError('Failed to load bus details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    // Animate button press
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
    if (!bus) return;
    
    try {
      if (isInWishlist(bus.id)) {
        await removeFromWishlist(bus.id);
      } else {
        await addToWishlist(bus.id);
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
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={styles.loadingText}>Loading bus details...</Text>
            <Text style={styles.loadingSubtext}>Please wait</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !bus) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error || 'Bus not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadBusDetails}>
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
            const imageUrl = bus.images?.[selectedImageIndex] || bus.images?.[0];
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
                <Ionicons name="bus" size={64} color="#9CA3AF" />
                <Text style={styles.placeholderText}>Bus Image</Text>
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
                  name={isInWishlist(bus.id) ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isInWishlist(bus.id) ? '#EF4444' : '#FFFFFF'}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Ionicons name="share-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Image Indicators */}
          {bus.images.length > 1 && (
            <View style={styles.imageIndicators}>
              {bus.images.map((_, index) => (
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

        {/* Bus Info Card */}
        <View style={styles.infoCardWrapper}>
          <BusInfoCard bus={bus} />
        </View>

        {/* Store/Provider Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="business" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>Service Provider</Text>
          </View>
          <View style={styles.storeCard}>
            {bus.store.logo && (
              <Image source={{ uri: bus.store.logo }} style={styles.storeLogo} />
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{bus.store.name}</Text>
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
                  <Text style={styles.priceValue}>₹{bus.price.toLocaleString('en-IN')}</Text>
                  {bus.originalPrice && bus.originalPrice > bus.price && (
                    <Text style={styles.originalPrice}>₹{bus.originalPrice.toLocaleString('en-IN')}</Text>
                  )}
                </View>
              </View>
              <View style={styles.cashbackBadge}>
                <Ionicons name="cash" size={20} color="#FFFFFF" />
                <Text style={styles.cashbackText}>
                  {bus.cashback.percentage}% Cashback
                </Text>
                <Text style={styles.cashbackAmount}>₹{bus.cashback.amount}</Text>
              </View>
            </View>
            {bus.discount && bus.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{bus.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Details Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>Trip Details</Text>
          </View>
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="time-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>
                {Math.floor(bus.duration / 60)}h {bus.duration % 60}m
              </Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="bus-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.detailLabel}>Bus Type</Text>
              <Text style={styles.detailValue}>{bus.busType || 'Sleeper'}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="ticket-outline" size={20} color="#F97316" />
              </View>
              <Text style={styles.detailLabel}>Bus Number</Text>
              <Text style={styles.detailValue}>{bus.busNumber || 'N/A'}</Text>
            </View>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Ionicons name="star" size={20} color="#F97316" />
              </View>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>{bus.rating.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Amenities */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={24} color="#F97316" />
            <Text style={styles.sectionTitle}>Amenities</Text>
          </View>
          <BusAmenities amenities={bus.amenities} />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.descriptionTitle}>About This Service</Text>
          <Text style={styles.description}>{bus.description}</Text>
        </View>

        {/* Cancellation Policy */}
        <View style={styles.section}>
          <BusCancellationPolicy policy={bus.cancellationPolicy} />
        </View>

        {/* Reviews */}
        <View style={styles.section}>
          <ProductReviewsSection
            productId={id as string}
            productName={bus.name}
            reviews={reviews}
            summary={reviewSummary}
            isLoading={reviewsLoading}
            onRefresh={refreshReviews}
          />
        </View>

        {/* Related Buses */}
        <View style={styles.section}>
          <RelatedBusesSection currentBusId={bus.id} route={bus.route} />
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 200 }} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.bookButtonContainer}>
        {/* Price Info Card */}
        <View style={styles.priceInfoCard}>
          <View style={styles.priceInfoRow}>
            <View style={styles.priceInfoLeft}>
              <Text style={styles.priceInfoLabel}>Total Price</Text>
              <View style={styles.priceInfoValueContainer}>
                <Text style={styles.priceInfoValue}>
                  ₹{bus.price.toLocaleString('en-IN')}
                </Text>
                {bus.originalPrice && bus.originalPrice > bus.price && (
                  <Text style={styles.priceInfoOriginal}>₹{bus.originalPrice.toLocaleString('en-IN')}</Text>
                )}
              </View>
            </View>
            <View style={styles.cashbackInfo}>
              <Ionicons name="cash" size={18} color="#F97316" />
              <Text style={styles.cashbackInfoText}>{bus.cashback.percentage}% Cashback</Text>
            </View>
          </View>
        </View>
        
        {/* Book Now Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity 
            style={styles.bookButton} 
            onPress={handleBookNow}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C', '#C2410C']}
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
        {bus && (
          <BusBookingFlow
            bus={bus}
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
        {bookingData && bus && (
          <BusBookingConfirmation
            bus={bus}
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
    backgroundColor: '#F97316',
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
    backgroundColor: '#F97316',
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
    color: '#F97316',
  },
  originalPrice: {
    fontSize: 18,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  cashbackBadge: {
    backgroundColor: '#F97316',
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
    backgroundColor: '#FEF3C7',
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
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  cashbackInfoText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  bookButton: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#F97316',
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
