/**
 * Events Page - Main events hub
 * Converted from V2
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  white: '#FFFFFF',
  navy: '#0B2240',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#6B7280',
  green500: '#22C55E',
  emerald500: '#10B981',
  amber500: '#F59E0B',
  blue500: '#3B82F6',
  purple500: '#8B5CF6',
  pink500: '#EC4899',
  red500: '#EF4444',
};

const categories = [
  { id: 'movies', title: 'Movies', icon: '🎬', color: '#EF4444', route: '/events/movies' },
  { id: 'concerts', title: 'Concerts', icon: '🎵', color: '#8B5CF6', route: '/events/concerts' },
  { id: 'parks', title: 'Parks', icon: '🎢', color: '#22C55E', route: '/events/parks' },
  { id: 'workshops', title: 'Workshops', icon: '🎨', color: '#F59E0B', route: '/events/workshops' },
  { id: 'gaming', title: 'Gaming', icon: '🎮', color: '#3B82F6', route: '/events/gaming' },
  { id: 'sports', title: 'Sports', icon: '⚽', color: '#10B981', route: '/events/sports' },
];

const featuredEvents = [
  {
    id: 1,
    title: 'Avengers: Secret Wars',
    type: 'Movie',
    date: 'Now Showing',
    location: 'PVR Cinemas',
    price: '₹299',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
    cashback: '20%',
  },
  {
    id: 2,
    title: 'Coldplay Live',
    type: 'Concert',
    date: 'Jan 15, 2025',
    location: 'DY Patil Stadium',
    price: '₹4,999',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400',
    cashback: '15%',
  },
  {
    id: 3,
    title: 'Imagica Theme Park',
    type: 'Park',
    date: 'Open Daily',
    location: 'Khopoli',
    price: '₹1,499',
    image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=400',
    cashback: '25%',
  },
];

const upcomingEvents = [
  {
    id: 4,
    title: 'Art Workshop',
    type: 'Workshop',
    date: 'Dec 30',
    price: '₹599',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=300',
  },
  {
    id: 5,
    title: 'Gaming Tournament',
    type: 'Gaming',
    date: 'Jan 5',
    price: '₹199',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=300',
  },
  {
    id: 6,
    title: 'Cricket Match',
    type: 'Sports',
    date: 'Jan 10',
    price: '₹999',
    image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=300',
  },
];

const EventsPage: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = (route: string) => {
    router.push(route as any);
  };

  const handleEventPress = (eventId: number) => {
    router.push(`/events/${eventId}` as any);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Events & Experiences</Text>
          <Text style={styles.headerSubtitle}>Book tickets, earn coins</Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color={COLORS.navy} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Browse Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
                onPress={() => handleCategoryPress(cat.route)}
                activeOpacity={0.8}
              >
                <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                  <Text style={styles.categoryEmoji}>{cat.icon}</Text>
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Events</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {featuredEvents.map((event) => (
              <TouchableOpacity
                key={event.id}
                style={styles.featuredCard}
                onPress={() => handleEventPress(event.id)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: event.image }} style={styles.featuredImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.featuredOverlay}
                >
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{event.cashback} Cashback</Text>
                  </View>
                  <Text style={styles.featuredTitle}>{event.title}</Text>
                  <Text style={styles.featuredMeta}>{event.type} • {event.date}</Text>
                  <View style={styles.featuredFooter}>
                    <View style={styles.locationContainer}>
                      <Ionicons name="location" size={14} color={COLORS.white} />
                      <Text style={styles.locationText}>{event.location}</Text>
                    </View>
                    <Text style={styles.priceText}>{event.price}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {upcomingEvents.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => handleEventPress(event.id)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.eventInfo}>
                <View style={styles.eventTypeBadge}>
                  <Text style={styles.eventTypeText}>{event.type}</Text>
                </View>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
              <View style={styles.eventPriceContainer}>
                <Text style={styles.eventPrice}>{event.price}</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.gray600} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <LinearGradient
            colors={['#8B5CF6', '#EC4899']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.promoGradient}
          >
            <Text style={styles.promoEmoji}>🎉</Text>
            <Text style={styles.promoTitle}>Earn Coins on Every Booking</Text>
            <Text style={styles.promoSubtitle}>Up to 500 coins per ticket • Extra cashback on weekends</Text>
          </LinearGradient>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  searchButton: {
    padding: 8,
  },
  categoriesSection: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  categoryCard: {
    width: (SCREEN_WIDTH - 56) / 3,
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.navy,
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
    color: COLORS.navy,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.green500,
  },
  featuredCard: {
    width: SCREEN_WIDTH * 0.75,
    height: 220,
    marginLeft: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  cashbackBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.green500,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.white,
  },
  featuredTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  featuredMeta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: COLORS.white,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 12,
    color: COLORS.gray600,
  },
  eventPriceContainer: {
    alignItems: 'flex-end',
  },
  eventPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.green500,
    marginBottom: 4,
  },
  promoBanner: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  promoGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  promoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});

export default EventsPage;
