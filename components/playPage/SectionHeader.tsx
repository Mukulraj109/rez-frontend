import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { SectionHeaderProps, PLAY_PAGE_COLORS } from '@/types/playPage.types';

export default function SectionHeader({ 
  title, 
  showViewAll = true, 
  onViewAllPress, 
  style 
}: SectionHeaderProps) {
  
  return (
    <View style={[styles.container, style]}>
      <ThemedText style={styles.title}>
        {title}
      </ThemedText>
      
      {showViewAll && (
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.viewAllText}>View all</ThemedText>
          <Ionicons name="arrow-forward" size={16} color={PLAY_PAGE_COLORS.primary} />
        </TouchableOpacity>
      )}
    </View>
);
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, // More horizontal padding
    paddingVertical: 18, // More vertical padding
    marginBottom: 8, // Add bottom margin
  },
  title: {
    fontSize: 22, // Larger title
    fontWeight: '700', // Bolder
    color: PLAY_PAGE_COLORS.text,
    letterSpacing: 0.3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.15)',
  },
  viewAllText: {
    fontSize: 15,
    fontWeight: '700',
    color: PLAY_PAGE_COLORS.primary,
    letterSpacing: 0.3,
  },
});