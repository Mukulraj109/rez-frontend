import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useOnboarding } from '@/hooks/useOnboarding';
import { navigationDebugger } from '@/utils/navigationDebug';

// ReZ Design System Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A16B',
  deepTeal: '#00796B',
  gold: '#FFC857',
  goldDark: '#FF9F1C',
  textPrimary: '#0B2240',
  textMuted: '#9AA7B2',
  surface: '#F7FAFC',
  glassWhite: 'rgba(255, 255, 255, 0.9)',
  glassBorder: 'rgba(255, 255, 255, 0.5)',
};

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  isEnabled: boolean;
  color: string;
}

const categories: CategoryItem[] = [
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline', isEnabled: true, color: COLORS.primary },
  { id: 'food', name: 'Food & Dining', icon: 'restaurant-outline', isEnabled: true, color: COLORS.gold },
  { id: 'grocery', name: 'Grocery', icon: 'cart-outline', isEnabled: true, color: COLORS.primary },
  { id: 'electronics', name: 'Electronics', icon: 'phone-portrait-outline', isEnabled: true, color: COLORS.deepTeal },
  { id: 'beauty', name: 'Beauty', icon: 'sparkles-outline', isEnabled: true, color: COLORS.gold },
  { id: 'medicine', name: 'Medicine', icon: 'medical-outline', isEnabled: false, color: '#9CA3AF' },
];

export default function CategorySelectionScreen() {
  const router = useRouter();
  const { updateUserData } = useOnboarding();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const handleCategorySelect = (categoryId: string, isEnabled: boolean) => {
    if (!isEnabled) return;

    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleNext = () => {
    updateUserData({ selectedCategories });
    navigationDebugger.logNavigation('category-selection', 'rewards-intro', 'categories-selected');
    router.push('/onboarding/rewards-intro');
  };

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[COLORS.surface, '#EDF2F7', COLORS.surface]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Elements */}
      <View style={styles.decorativeCircles}>
        <View style={[styles.circle, styles.circleGreen]} />
        <View style={[styles.circle, styles.circleGold]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.glassCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
            style={styles.glassShine}
          />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Find Best Deals</Text>
            <Text style={styles.subtitle}>
              Select your favorite categories{'\n'}to personalize your experience
            </Text>

            <View style={styles.underlineContainer}>
              <LinearGradient
                colors={[COLORS.gold, COLORS.goldDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.underline}
              />
            </View>
          </View>

          {/* Cashback Badge */}
          <View style={styles.cashbackContainer}>
            <LinearGradient
              colors={[COLORS.gold, COLORS.goldDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cashbackBadge}
            >
              <Text style={styles.cashbackTitle}>CASHBACK</Text>
              <Text style={styles.cashbackSubtitle}>on every purchase</Text>
            </LinearGradient>
          </View>

          {/* Categories */}
          <View style={styles.categoriesSection}>
            <Text style={styles.categoriesTitle}>Choose Categories</Text>

            <View style={styles.categoriesList}>
              {categories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      isSelected && styles.categoryItemSelected,
                      !category.isEnabled && styles.categoryItemDisabled,
                    ]}
                    onPress={() => handleCategorySelect(category.id, category.isEnabled)}
                    disabled={!category.isEnabled}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.categoryIcon,
                        isSelected && { backgroundColor: `${category.color}15` },
                      ]}
                    >
                      <Ionicons
                        name={category.icon as any}
                        size={22}
                        color={!category.isEnabled ? '#9CA3AF' : isSelected ? category.color : COLORS.textPrimary}
                      />
                    </View>
                    <Text
                      style={[
                        styles.categoryName,
                        isSelected && { color: category.color },
                        !category.isEnabled && styles.categoryNameDisabled,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkmark, { backgroundColor: category.color }]}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    )}
                    {!category.isEnabled && (
                      <View style={styles.comingSoonBadge}>
                        <Text style={styles.comingSoonText}>Soon</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            style={styles.primaryButtonWrapper}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.deepTeal]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  // Decorative
  decorativeCircles: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 999,
  },
  circleGreen: {
    width: 200,
    height: 200,
    top: -60,
    right: -60,
    backgroundColor: 'rgba(0, 192, 106, 0.08)',
  },
  circleGold: {
    width: 150,
    height: 150,
    bottom: 100,
    left: -50,
    backgroundColor: 'rgba(255, 200, 87, 0.1)',
  },

  // Glass Card
  glassCard: {
    backgroundColor: COLORS.glassWhite,
    borderRadius: 28,
    padding: 28,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.glassBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 15,
    ...(Platform.OS === 'web' && {
      backdropFilter: 'blur(30px)',
    }),
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  underlineContainer: {
    alignItems: 'center',
  },
  underline: {
    width: 50,
    height: 4,
    borderRadius: 2,
  },

  // Cashback Badge
  cashbackContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  cashbackBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  cashbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  cashbackSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(11, 34, 64, 0.7)',
    marginTop: 2,
  },

  // Categories
  categoriesSection: {
    marginBottom: 24,
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  categoriesList: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 192, 106, 0.03)',
  },
  categoryItemDisabled: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  categoryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  categoryNameDisabled: {
    color: '#9CA3AF',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  comingSoonBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Primary Button
  primaryButtonWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
