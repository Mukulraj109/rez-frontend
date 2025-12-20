import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TrendingSearch } from '@/services/searchDiscoveryApi';

interface TrendingSearchesSectionProps {
  searches: TrendingSearch[];
  onPress: (query: string) => void;
}

export default function TrendingSearchesSection({
  searches,
  onPress,
}: TrendingSearchesSectionProps) {
  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="flame" size={20} color="#EF4444" />
        <Text style={styles.headerText}>Trending on ReZ</Text>
      </View>

      <View style={styles.list}>
        {searches.map((search, index) => (
          <TouchableOpacity
            key={search._id || index}
            style={styles.item}
            onPress={() => onPress(search.query)}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up-outline" size={18} color="#6B7280" style={styles.itemIcon} />
            <Text style={styles.itemText} numberOfLines={1}>
              {search.query}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        ))}
      </View>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  list: {
    paddingHorizontal: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemIcon: {
    marginRight: 12,
  },
  itemText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
});




