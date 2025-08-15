import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import OnboardingContainer from '@/components/onboarding/OnboardingContainer';
import { useOnboarding } from '@/hooks/useOnboarding';

interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  isEnabled: boolean;
}

const categories: CategoryItem[] = [
  { id: 'fashion', name: 'Fashion', icon: 'shirt-outline', isEnabled: true },
  { id: 'food', name: 'Food', icon: 'restaurant-outline', isEnabled: true },
  { id: 'medicine', name: 'Madeine', icon: 'medical-outline', isEnabled: false },
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
    router.push('/onboarding/rewards-intro');
  };

  return (
    <OnboardingContainer useGradient={false} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Search & Find Best{'\n'}Deals</Text>
          <View style={styles.underline} />
          
          <Text style={styles.subtitle}>20 best offers{'\n'}waiting near you</Text>
          
          <View style={styles.cashbackBadge}>
            <Text style={styles.cashText}>CASH</Text>
            <Text style={styles.backText}>BACK</Text>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <Text style={styles.categoriesTitle}>Categories</Text>
          
          <View style={styles.categoriesList}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryItem,
                  selectedCategories.includes(category.id) && styles.categoryItemSelected,
                  !category.isEnabled && styles.categoryItemDisabled,
                ]}
                onPress={() => handleCategorySelect(category.id, category.isEnabled)}
                disabled={!category.isEnabled}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons 
                    name={category.icon as any} 
                    size={24} 
                    color={!category.isEnabled ? '#9CA3AF' : selectedCategories.includes(category.id) ? '#8B5CF6' : '#374151'} 
                  />
                </View>
                <Text style={[
                  styles.categoryName,
                  selectedCategories.includes(category.id) && styles.categoryNameSelected,
                  !category.isEnabled && styles.categoryNameDisabled,
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </OnboardingContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#8B5CF6',
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 8,
  },
  underline: {
    width: 60,
    height: 3,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  cashbackBadge: {
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
  },
  cashText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#8B5CF6',
    marginBottom: -2,
  },
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EC4899',
  },
  categoriesSection: {
    flex: 1,
    paddingTop: 20,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 20,
  },
  categoriesList: {
    gap: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryItemSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F0FF',
  },
  categoryItemDisabled: {
    opacity: 0.5,
    backgroundColor: '#F9FAFB',
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  categoryNameSelected: {
    color: '#8B5CF6',
  },
  categoryNameDisabled: {
    color: '#9CA3AF',
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});