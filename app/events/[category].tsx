/**
 * Events Category Page - Dynamic route for event categories
 * movies, concerts, parks, workshops, gaming, sports
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

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
  red500: '#EF4444',
};

const categoryData: Record<string, any> = {
  movies: {
    title: 'Movies',
    icon: '🎬',
    gradientColors: ['#EF4444', '#DC2626'],
    events: [
      { id: 1, title: 'Avengers: Secret Wars', venue: 'PVR Cinemas', time: 'Multiple Shows', price: '₹299', rating: 4.8, image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400', cashback: '20%' },
      { id: 2, title: 'Pushpa 3', venue: 'INOX', time: '10:30 AM, 2:30 PM', price: '₹249', rating: 4.5, image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', cashback: '15%' },
      { id: 3, title: 'Avatar 3', venue: 'Cinepolis', time: '6:00 PM, 9:30 PM', price: '₹399', rating: 4.9, image: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400', cashback: '25%' },
    ],
  },
  concerts: {
    title: 'Concerts',
    icon: '🎵',
    gradientColors: ['#8B5CF6', '#7C3AED'],
    events: [
      { id: 4, title: 'Coldplay Live', venue: 'DY Patil Stadium', time: 'Jan 15, 7:00 PM', price: '₹4,999', rating: 4.9, image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=400', cashback: '15%' },
      { id: 5, title: 'Arijit Singh Concert', venue: 'MMRDA Grounds', time: 'Jan 20, 6:00 PM', price: '₹2,499', rating: 4.7, image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400', cashback: '20%' },
      { id: 6, title: 'AR Rahman Live', venue: 'Jio Garden', time: 'Feb 5, 7:30 PM', price: '₹3,999', rating: 4.8, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400', cashback: '18%' },
    ],
  },
  parks: {
    title: 'Theme Parks',
    icon: '🎢',
    gradientColors: ['#22C55E', '#16A34A'],
    events: [
      { id: 7, title: 'Imagica Theme Park', venue: 'Khopoli', time: 'Open Daily', price: '₹1,499', rating: 4.6, image: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?w=400', cashback: '25%' },
      { id: 8, title: 'EsselWorld', venue: 'Gorai', time: 'Open Daily', price: '₹999', rating: 4.4, image: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=400', cashback: '20%' },
      { id: 9, title: 'Water Kingdom', venue: 'Gorai', time: 'Open Daily', price: '₹799', rating: 4.3, image: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=400', cashback: '15%' },
    ],
  },
  workshops: {
    title: 'Workshops',
    icon: '🎨',
    gradientColors: ['#F59E0B', '#D97706'],
    events: [
      { id: 10, title: 'Pottery Workshop', venue: 'Art Studio', time: 'Sat, 10:00 AM', price: '₹599', rating: 4.7, image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400', cashback: '30%' },
      { id: 11, title: 'Photography Masterclass', venue: 'Creative Hub', time: 'Sun, 2:00 PM', price: '₹1,299', rating: 4.8, image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=400', cashback: '25%' },
      { id: 12, title: 'Cooking Class', venue: 'Culinary Academy', time: 'Sat, 4:00 PM', price: '₹899', rating: 4.6, image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400', cashback: '20%' },
    ],
  },
  gaming: {
    title: 'Gaming',
    icon: '🎮',
    gradientColors: ['#3B82F6', '#2563EB'],
    events: [
      { id: 13, title: 'BGMI Tournament', venue: 'Gaming Arena', time: 'Jan 5, 12:00 PM', price: '₹199', rating: 4.5, image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400', cashback: '35%' },
      { id: 14, title: 'VR Experience', venue: 'VR Zone', time: 'Open Daily', price: '₹499', rating: 4.6, image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=400', cashback: '20%' },
      { id: 15, title: 'Esports Finals', venue: 'Convention Center', time: 'Jan 15, 5:00 PM', price: '₹299', rating: 4.7, image: 'https://images.unsplash.com/photo-1493711662062-fa541f7f55a4?w=400', cashback: '25%' },
    ],
  },
  sports: {
    title: 'Sports Events',
    icon: '⚽',
    gradientColors: ['#10B981', '#059669'],
    events: [
      { id: 16, title: 'IPL 2025 Match', venue: 'Wankhede Stadium', time: 'Mar 22, 7:30 PM', price: '₹999', rating: 4.9, image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400', cashback: '15%' },
      { id: 17, title: 'ISL Football', venue: 'Salt Lake Stadium', time: 'Jan 10, 7:00 PM', price: '₹499', rating: 4.5, image: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400', cashback: '20%' },
      { id: 18, title: 'Marathon 2025', venue: 'Marine Drive', time: 'Jan 19, 6:00 AM', price: '₹1,500', rating: 4.8, image: 'https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=400', cashback: '10%' },
    ],
  },
};

const EventsCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const data = categoryData[category || 'movies'] || categoryData['movies'];
  const filters = ['all', 'Today', 'This Week', 'This Month'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={data.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.events.length} events available</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}>
            <Ionicons name="search" size={24} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => setSelectedFilter(filter)}
              style={[
                styles.filterChip,
                selectedFilter === filter && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterChipText,
                selectedFilter === filter && styles.filterChipTextActive
              ]}>
                {filter === 'all' ? 'All' : filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Events List */}
        <View style={styles.eventsList}>
          {data.events.map((event: any) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => router.push(`/events/${event.id}` as any)}
              activeOpacity={0.8}
            >
              <Image source={{ uri: event.image }} style={styles.eventImage} />
              <View style={styles.cashbackBadge}>
                <Text style={styles.cashbackText}>{event.cashback}</Text>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.eventMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={14} color={COLORS.gray600} />
                    <Text style={styles.metaText}>{event.venue}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color={COLORS.gray600} />
                    <Text style={styles.metaText}>{event.time}</Text>
                  </View>
                </View>
                <View style={styles.eventFooter}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color={COLORS.amber500} />
                    <Text style={styles.ratingText}>{event.rating}</Text>
                  </View>
                  <Text style={styles.priceText}>{event.price}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingTop: Platform.OS === 'ios' ? 56 : 16,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  searchButton: {
    padding: 8,
  },
  filtersContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
  },
  filterChipText: {
    fontSize: 14,
    color: COLORS.gray600,
  },
  filterChipTextActive: {
    color: COLORS.white,
    fontWeight: '600',
  },
  eventsList: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  cashbackBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: COLORS.green500,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cashbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  eventInfo: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
    marginBottom: 8,
  },
  eventMeta: {
    gap: 6,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.navy,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.green500,
  },
});

export default EventsCategoryPage;
