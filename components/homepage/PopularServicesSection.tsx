import React, { useEffect, useState, useCallback, memo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import servicesService from '@/services/servicesApi';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75;
const CARD_GAP = 12;

interface PopularService {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  images?: string[];
  price?: number;
  pricing?: {
    original: number;
    selling: number;
    discount?: number;
    currency?: string;
  };
  rating?: number;
  ratings?: {
    average: number;
    count: number;
  };
  store?: {
    _id: string;
    name: string;
    logo?: string;
  };
  serviceCategory?: string | {
    _id: string;
    name: string;
    icon: string;
    slug?: string;
    cashbackPercentage?: number;
  };
  serviceDetails?: {
    duration: number;
    serviceType: 'home' | 'store' | 'online';
  };
  cashback?: {
    percentage: number;
    maxAmount?: number;
    isActive?: boolean;
  };
}

interface PopularServicesSectionProps {
  title?: string;
  limit?: number;
}

// Popular Service Card Component
const PopularServiceCard = memo(({
  service,
  onPress
}: {
  service: PopularService;
  onPress: () => void;
}) => {
  const imageUrl = service.image || service.images?.[0] || 'https://via.placeholder.com/300x200';
  const description = service.shortDescription || service.description || 'Professional service';

  // Safely get category name - handle case where serviceCategory might be a string or object
  let categoryName = 'Service';
  if (service.serviceCategory) {
    if (typeof service.serviceCategory === 'string') {
      categoryName = service.serviceCategory;
    } else if (typeof service.serviceCategory === 'object' && service.serviceCategory.name) {
      categoryName = typeof service.serviceCategory.name === 'string'
        ? service.serviceCategory.name
        : 'Service';
    }
  }

  return (
    <View style={styles.serviceCard}>
      <View style={styles.cardContent}>
        {/* Left side - Text content */}
        <View style={styles.textContent}>
          <ThemedText style={styles.categoryLabel}>
            {categoryName}
          </ThemedText>
          <ThemedText style={styles.serviceDescription} numberOfLines={2}>
            {description}
          </ThemedText>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={onPress}
            activeOpacity={0.85}
          >
            <ThemedText style={styles.bookButtonText}>Book now</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Right side - Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.serviceImage}
            resizeMode="cover"
          />
        </View>
      </View>
    </View>
  );
});

function PopularServicesSection({
  title = 'Popular Services',
  limit = 6,
}: PopularServicesSectionProps) {
  const router = useRouter();
  const [services, setServices] = useState<PopularService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPopularServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('⭐ [POPULAR SERVICES UI] Fetching popular services...');
      const response = await servicesService.getPopularServices(limit);

      if (response.success && response.data) {
        console.log('✅ [POPULAR SERVICES UI] Got', response.data.length, 'services');
        setServices(response.data as PopularService[]);
      } else {
        console.log('❌ [POPULAR SERVICES UI] Failed:', response);
        setError('Failed to load popular services');
      }
    } catch (err) {
      console.error('❌ [POPULAR SERVICES UI] Error:', err);
      setError('Failed to load popular services');
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchPopularServices();
  }, [fetchPopularServices]);

  const handleServicePress = (service: PopularService) => {
    const serviceId = service._id || service.id;
    router.push(`/ProductPage?cardId=${serviceId}&cardType=product`);
  };

  // Don't render if no services and not loading
  if (!loading && services.length === 0 && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.title}>{title}</ThemedText>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
          <ThemedText style={styles.loadingText}>Loading services...</ThemedText>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchPopularServices}>
            <ThemedText style={styles.retryText}>Retry</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {services.map((service, index) => (
            <PopularServiceCard
              key={service._id || service.id || `popular-svc-${index}`}
              service={service}
              onPress={() => handleServicePress(service)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  listContainer: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  textContent: {
    flex: 1,
    paddingRight: 16,
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
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
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default memo(PopularServicesSection);
