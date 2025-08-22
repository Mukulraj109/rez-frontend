// Store Detail Page
// Shows store information with navigation to reviews

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';

interface StoreDetails {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  rating: number;
  reviewCount: number;
  image: string;
  hours: { [key: string]: string };
  services: string[];
  features: string[];
}

export default function StoreDetailPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState<StoreDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoreDetails(id as string);
  }, [id]);

  const loadStoreDetails = async (storeId: string) => {
    try {
      // Mock store data - in real app, this would fetch from API
      const mockStore: StoreDetails = {
        id: storeId,
        name: 'TechHub Electronics',
        category: 'Electronics & Gadgets',
        description: 'Your one-stop destination for all electronic needs. We offer the latest gadgets, computers, mobile phones, and accessories at competitive prices with excellent customer service.',
        address: '123 Tech Street, Digital City, DC 12345',
        phone: '+1 (555) 123-4567',
        email: 'contact@techHub.com',
        website: 'www.techHub.com',
        rating: 4.3,
        reviewCount: 847,
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=500',
        hours: {
          'Monday': '9:00 AM - 9:00 PM',
          'Tuesday': '9:00 AM - 9:00 PM',
          'Wednesday': '9:00 AM - 9:00 PM',
          'Thursday': '9:00 AM - 9:00 PM',
          'Friday': '9:00 AM - 10:00 PM',
          'Saturday': '10:00 AM - 10:00 PM',
          'Sunday': '11:00 AM - 8:00 PM',
        },
        services: [
          'Home Delivery',
          'Installation Service',
          'Technical Support',
          'Extended Warranty',
          'Trade-in Program',
          'Repair Services',
        ],
        features: [
          'Free Parking',
          'WiFi Available',
          'Customer Lounge',
          'Product Demo Area',
          'Gift Wrapping',
          'Return Policy',
        ],
      };

      setStore(mockStore);
    } catch (error) {
      console.error('Error loading store:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleViewReviews = () => {
    router.push(`/store/${store?.id}/reviews`);
  };

  const handleCall = () => {
    console.log('Call store:', store?.phone);
  };

  const handleEmail = () => {
    console.log('Email store:', store?.email);
  };

  const handleWebsite = () => {
    console.log('Visit website:', store?.website);
  };

  const handleDirections = () => {
    console.log('Get directions to:', store?.address);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading store details...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (!store) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#666" />
          <ThemedText style={styles.errorTitle}>Store Not Found</ThemedText>
          <ThemedText style={styles.errorText}>
            The store you're looking for could not be found.
          </ThemedText>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        
        <ThemedText style={styles.headerTitle}>Store Details</ThemedText>
        
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Store Image */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: store.image }}
            style={styles.storeImage}
            resizeMode="cover"
          />
        </View>

        {/* Store Info */}
        <View style={styles.infoSection}>
          <ThemedText style={styles.storeName}>{store.name}</ThemedText>
          <ThemedText style={styles.storeCategory}>{store.category}</ThemedText>
          
          <View style={styles.ratingRow}>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <ThemedText style={styles.rating}>{store.rating}</ThemedText>
              <ThemedText style={styles.reviewCount}>({store.reviewCount} reviews)</ThemedText>
            </View>
            
            <TouchableOpacity style={styles.reviewsButton} onPress={handleViewReviews}>
              <ThemedText style={styles.reviewsButtonText}>View Reviews</ThemedText>
              <Ionicons name="chevron-forward" size={16} color="#8B5CF6" />
            </TouchableOpacity>
          </View>

          <ThemedText style={styles.description}>{store.description}</ThemedText>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Contact Information</ThemedText>
          
          <TouchableOpacity style={styles.contactItem} onPress={handleDirections}>
            <Ionicons name="location-outline" size={20} color="#8B5CF6" />
            <View style={styles.contactText}>
              <ThemedText style={styles.contactLabel}>Address</ThemedText>
              <ThemedText style={styles.contactValue}>{store.address}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleCall}>
            <Ionicons name="call-outline" size={20} color="#8B5CF6" />
            <View style={styles.contactText}>
              <ThemedText style={styles.contactLabel}>Phone</ThemedText>
              <ThemedText style={styles.contactValue}>{store.phone}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
            <Ionicons name="mail-outline" size={20} color="#8B5CF6" />
            <View style={styles.contactText}>
              <ThemedText style={styles.contactLabel}>Email</ThemedText>
              <ThemedText style={styles.contactValue}>{store.email}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem} onPress={handleWebsite}>
            <Ionicons name="globe-outline" size={20} color="#8B5CF6" />
            <View style={styles.contactText}>
              <ThemedText style={styles.contactLabel}>Website</ThemedText>
              <ThemedText style={styles.contactValue}>{store.website}</ThemedText>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Store Hours */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Store Hours</ThemedText>
          {Object.entries(store.hours).map(([day, hours]) => (
            <View key={day} style={styles.hoursRow}>
              <ThemedText style={styles.dayText}>{day}</ThemedText>
              <ThemedText style={styles.hoursText}>{hours}</ThemedText>
            </View>
          ))}
        </View>

        {/* Services */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Services</ThemedText>
          <View style={styles.tagsContainer}>
            {store.services.map((service, index) => (
              <View key={index} style={styles.tag}>
                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                <ThemedText style={styles.tagText}>{service}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Features */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Store Features</ThemedText>
          <View style={styles.tagsContainer}>
            {store.features.map((feature, index) => (
              <View key={index} style={styles.tag}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <ThemedText style={styles.tagText}>{feature}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerRight: {
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  imageSection: {
    backgroundColor: 'white',
  },
  storeImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#F3F4F6',
  },
  infoSection: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reviewsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
    marginRight: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginLeft: 4,
  },
  bottomSpace: {
    height: 20,
  },
});