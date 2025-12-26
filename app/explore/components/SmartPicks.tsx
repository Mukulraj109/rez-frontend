import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const smartPicks = [
  {
    id: 1,
    title: 'Popular with people like you',
    icon: 'people',
    color: '#3B82F6',
    items: [
      { id: 1, name: 'Premium Haircut', store: 'Style Studio', price: 399, cashback: '20%', distance: '0.6 km', buyers: 45 },
      { id: 2, name: 'Veg Thali', store: 'Sagar Ratna', price: 250, cashback: '15%', distance: '1.2 km', buyers: 78 },
    ],
  },
  {
    id: 2,
    title: 'Best deals in your budget',
    icon: 'wallet',
    color: '#10B981',
    items: [
      { id: 3, name: 'Coffee & Sandwich', store: 'Cafe Delight', price: 180, cashback: '12%', distance: '0.4 km', trending: true },
      { id: 4, name: 'Movie Ticket', store: 'PVR Cinemas', price: 350, cashback: '10%', distance: '2.1 km', trending: true },
    ],
  },
  {
    id: 3,
    title: 'Based on your recent visits',
    icon: 'time',
    color: '#A855F7',
    items: [
      { id: 5, name: 'Chicken Wings', store: 'Buffalo Wild Wings', price: 499, cashback: '18%', distance: '1.5 km', buyers: 32 },
      { id: 6, name: 'Gym Day Pass', store: 'Cult Fit', price: 199, cashback: '25%', distance: '0.8 km', trending: true },
    ],
  },
];

const SmartPicks = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <View style={styles.titleRow}>
            <Text style={styles.sectionTitle}>Smart Picks by ReZ</Text>
            <View style={styles.aiTag}>
              <Ionicons name="sparkles" size={12} color="#FFFFFF" />
              <Text style={styles.aiTagText}>AI</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>Personalized just for you</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.picksContainer}
      >
        {smartPicks.map((category) => (
          <View key={category.id} style={styles.pickCard}>
            {/* Category Header */}
            <View style={styles.pickHeader}>
              <View style={[styles.iconBadge, { backgroundColor: category.color + '20' }]}>
                <Ionicons name={category.icon as any} size={20} color={category.color} />
              </View>
              <Text style={styles.pickTitle}>{category.title}</Text>
            </View>

            {/* Items */}
            {category.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemRow,
                  index < category.items.length - 1 && styles.itemBorder,
                ]}
                onPress={() => navigateTo(`/MainStorePage?id=${item.id}`)}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.itemMeta}>
                    <Text style={styles.itemStore}>{item.store}</Text>
                    <View style={styles.dot} />
                    <Ionicons name="location" size={10} color="#9CA3AF" />
                    <Text style={styles.itemDistance}>{item.distance}</Text>
                  </View>
                </View>
                <View style={styles.itemRight}>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>
                  <View style={styles.cashbackBadge}>
                    <Text style={styles.cashbackText}>{item.cashback}</Text>
                  </View>
                  {item.buyers && (
                    <View style={styles.buyersRow}>
                      <Ionicons name="people" size={10} color="#6B7280" />
                      <Text style={styles.buyersText}>{item.buyers} bought</Text>
                    </View>
                  )}
                  {item.trending && (
                    <View style={styles.trendingRow}>
                      <Ionicons name="trending-up" size={10} color="#EF4444" />
                      <Text style={styles.trendingText}>Trending</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* View More */}
            <TouchableOpacity style={styles.viewMoreButton}>
              <Text style={styles.viewMoreText}>See more like this</Text>
              <Ionicons name="arrow-forward" size={14} color="#00C06A" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0B2240',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#A855F7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  picksContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  pickCard: {
    width: width * 0.8,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  pickHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
    flex: 1,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0B2240',
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  itemStore: {
    fontSize: 12,
    color: '#6B7280',
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#9CA3AF',
  },
  itemDistance: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0B2240',
  },
  cashbackBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  cashbackText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#00C06A',
  },
  buyersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  buyersText: {
    fontSize: 10,
    color: '#6B7280',
  },
  trendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  trendingText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '500',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 6,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00C06A',
  },
});

export default SmartPicks;
