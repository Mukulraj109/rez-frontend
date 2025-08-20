import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/ThemedText';
import { CategoryHeaderProps, PLAY_PAGE_COLORS } from '@/types/playPage.types';

export default function CategoryHeader({ 
  categories, 
  onCategoryPress 
}: CategoryHeaderProps) {
  
  return (
    <LinearGradient
      colors={PLAY_PAGE_COLORS.gradient.header as any}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header Title */}
      <View style={styles.headerTop}>
        <ThemedText style={styles.headerTitle}>
          Watch & Shop Your Favorites
        </ThemedText>
      </View>

      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
        contentContainerStyle={styles.tabsContent}
      >
        {categories.map((category) => {
          const isActive = category.isActive;
          return (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tabButton,
                isActive && styles.activeTabButton
              ]}
              onPress={() => onCategoryPress(category)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={
                  isActive 
                    ? ['#FFFFFF', 'rgba(255,255,255,0.7)'] 
                    : ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.05)']
                }
                style={styles.tabContent}
              >
                <ThemedText style={styles.tabEmoji}>
                  {category.emoji}
                </ThemedText>
                <ThemedText 
                  style={[
                    styles.tabText,
                    isActive && styles.activeTabText
                  ]}
                >
                  {category.title}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingBottom: 38,
    borderBottomLeftRadius: 28, // rounded bottom corners
    borderBottomRightRadius: 28,
    marginBottom:30,
    overflow: 'hidden', // ensure gradient respects rounding
  },
  headerTop: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 26,
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  tabsContainer: {
    paddingLeft: 20,
  },
  tabsContent: {
    paddingRight: 20,
    alignItems: 'center',
  },
  tabButton: {
    marginRight: 16,
    borderRadius: 28,
    overflow: 'hidden',
    minWidth: 120,
  },
  activeTabButton: {
    transform: [{ scale: 1.05 }],
    shadowColor: '#FFF',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 28,
  },
  tabEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  tabText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  activeTabText: {
    color: '#111',
    fontWeight: '700',
  },
});
