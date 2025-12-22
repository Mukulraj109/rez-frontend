// Heroes Zone Page
// Special offers for Army/Doctor/Disabled/Teachers

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography } from '@/constants/DesignSystem';

type HeroCategory = 'army' | 'doctor' | 'teacher' | 'disabled';

interface HeroOffer {
  id: string;
  title: string;
  store: string;
  discount: string;
  category: HeroCategory[];
  image: string;
}

const HERO_CATEGORIES = [
  { id: 'army' as HeroCategory, label: 'Armed Forces', icon: '🎖️', color: '#059669' },
  { id: 'doctor' as HeroCategory, label: 'Healthcare', icon: '🩺', color: '#0EA5E9' },
  { id: 'teacher' as HeroCategory, label: 'Teachers', icon: '📚', color: '#8B5CF6' },
  { id: 'disabled' as HeroCategory, label: 'Differently Abled', icon: '♿', color: '#F59E0B' },
];

const MOCK_OFFERS: HeroOffer[] = [
  { id: '1', title: '30% Off Travel', store: 'MakeMyTrip', discount: '30%', category: ['army', 'doctor'], image: '✈️' },
  { id: '2', title: 'Free Health Checkup', store: 'Apollo', discount: 'FREE', category: ['army', 'teacher'], image: '🏥' },
  { id: '3', title: 'Education Discount', store: 'Coursera', discount: '50%', category: ['teacher', 'disabled'], image: '🎓' },
  { id: '4', title: 'Accessible Travel', store: 'Uber', discount: '25%', category: ['disabled'], image: '🚗' },
  { id: '5', title: 'Grocery Savings', store: 'BigBasket', discount: '15%', category: ['army', 'doctor', 'teacher', 'disabled'], image: '🛒' },
  { id: '6', title: 'Electronics Deal', store: 'Croma', discount: '20%', category: ['army', 'doctor'], image: '📱' },
];

export default function HeroesZonePage() {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<HeroCategory | null>(null);
  const [verificationStep, setVerificationStep] = useState<'select' | 'upload' | 'review'>('select');

  const filteredOffers = selectedCategory
    ? MOCK_OFFERS.filter(o => o.category.includes(selectedCategory))
    : MOCK_OFFERS;

  const handleCategorySelect = (category: HeroCategory) => {
    setSelectedCategory(category);
    setVerificationStep('upload');
  };

  const handleUploadDocument = async () => {
    setVerifying(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setVerifying(false);
    setVerificationStep('review');
  };

  const handleVerificationComplete = () => {
    setIsVerified(true);
  };

  const getCategoryInfo = (category: HeroCategory) => {
    return HERO_CATEGORIES.find(c => c.id === category);
  };

  const renderOffer = ({ item }: { item: HeroOffer }) => (
    <TouchableOpacity
      style={styles.offerCard}
      onPress={() => router.push(`/offers/${item.id}` as any)}
    >
      <View style={styles.offerImage}>
        <ThemedText style={styles.offerEmoji}>{item.image}</ThemedText>
      </View>
      <View style={styles.offerInfo}>
        <ThemedText style={styles.offerTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.offerStore}>{item.store}</ThemedText>
        <View style={styles.offerMeta}>
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>{item.discount} OFF</ThemedText>
          </View>
          <View style={styles.categoryIcons}>
            {item.category.slice(0, 2).map(cat => (
              <ThemedText key={cat} style={styles.categoryIcon}>
                {getCategoryInfo(cat)?.icon}
              </ThemedText>
            ))}
            {item.category.length > 2 && (
              <ThemedText style={styles.moreCategories}>+{item.category.length - 2}</ThemedText>
            )}
          </View>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={Colors.text.tertiary} />
    </TouchableOpacity>
  );

  if (!isVerified) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#059669" />
        <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <ThemedText style={styles.headerTitle}>Heroes Zone</ThemedText>
            <View style={styles.placeholder} />
          </View>
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.verifyContent}>
          {verificationStep === 'select' && (
            <>
              <View style={styles.verifyIcon}>
                <ThemedText style={styles.verifyEmoji}>🦸</ThemedText>
              </View>
              <ThemedText style={styles.verifyTitle}>Saluting Our Heroes</ThemedText>
              <ThemedText style={styles.verifySubtitle}>
                Select your category to unlock exclusive benefits
              </ThemedText>

              <View style={styles.categoriesGrid}>
                {HERO_CATEGORIES.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryCard, { borderColor: category.color }]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '20' }]}>
                      <ThemedText style={styles.categoryEmoji}>{category.icon}</ThemedText>
                    </View>
                    <ThemedText style={styles.categoryLabel}>{category.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {verificationStep === 'upload' && selectedCategory && (
            <>
              <View style={[styles.verifyIcon, { backgroundColor: getCategoryInfo(selectedCategory)?.color + '15' }]}>
                <ThemedText style={styles.verifyEmoji}>{getCategoryInfo(selectedCategory)?.icon}</ThemedText>
              </View>
              <ThemedText style={styles.verifyTitle}>
                {getCategoryInfo(selectedCategory)?.label} Verification
              </ThemedText>
              <ThemedText style={styles.verifySubtitle}>
                Upload your official ID or certificate for verification
              </ThemedText>

              <View style={styles.uploadSection}>
                <TouchableOpacity style={styles.uploadButton} onPress={handleUploadDocument}>
                  {verifying ? (
                    <ActivityIndicator color={getCategoryInfo(selectedCategory)?.color} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={40} color={getCategoryInfo(selectedCategory)?.color} />
                      <ThemedText style={styles.uploadText}>Tap to upload document</ThemedText>
                      <ThemedText style={styles.uploadHint}>
                        Accepted: ID Card, Certificate, Letter
                      </ThemedText>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.backToCategories}
                onPress={() => setVerificationStep('select')}
              >
                <ThemedText style={styles.backToCategoriesText}>← Choose different category</ThemedText>
              </TouchableOpacity>
            </>
          )}

          {verificationStep === 'review' && (
            <>
              <View style={styles.reviewIcon}>
                <Ionicons name="hourglass-outline" size={60} color={Colors.gold} />
              </View>
              <ThemedText style={styles.verifyTitle}>Under Review</ThemedText>
              <ThemedText style={styles.verifySubtitle}>
                Your document is being verified. This usually takes 24-48 hours.
              </ThemedText>

              <View style={styles.reviewInfo}>
                <View style={styles.reviewStep}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                  <ThemedText style={styles.reviewStepText}>Document uploaded</ThemedText>
                </View>
                <View style={styles.reviewStep}>
                  <Ionicons name="time" size={24} color={Colors.gold} />
                  <ThemedText style={styles.reviewStepText}>Verification in progress</ThemedText>
                </View>
                <View style={styles.reviewStep}>
                  <Ionicons name="ellipse-outline" size={24} color={Colors.gray[300]} />
                  <ThemedText style={[styles.reviewStepText, { color: Colors.gray[400] }]}>Benefits unlocked</ThemedText>
                </View>
              </View>

              {/* For demo, allow skipping verification */}
              <TouchableOpacity
                style={styles.skipButton}
                onPress={handleVerificationComplete}
              >
                <ThemedText style={styles.skipButtonText}>Skip for Demo</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#059669" />
      <LinearGradient colors={['#059669', '#10B981']} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Heroes Zone</ThemedText>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.verifiedBadge}>
          <Ionicons name="shield-checkmark" size={20} color="#FFF" />
          <ThemedText style={styles.verifiedText}>
            {getCategoryInfo(selectedCategory || 'army')?.label} Verified
          </ThemedText>
        </View>
      </LinearGradient>

      <FlatList
        data={filteredOffers}
        renderItem={renderOffer}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.thanksCard}>
            <ThemedText style={styles.thanksEmoji}>🙏</ThemedText>
            <ThemedText style={styles.thanksTitle}>Thank You for Your Service</ThemedText>
            <ThemedText style={styles.thanksText}>
              Enjoy exclusive benefits as our token of gratitude
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 40,
    paddingBottom: Spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    flex: 1,
    ...Typography.h3,
    color: '#FFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  verifyContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  verifyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#059669' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  verifyEmoji: {
    fontSize: 48,
  },
  verifyTitle: {
    ...Typography.h2,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  verifySubtitle: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  categoriesGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    ...Shadows.subtle,
  },
  categoryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  categoryEmoji: {
    fontSize: 30,
  },
  categoryLabel: {
    ...Typography.label,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  uploadSection: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  uploadButton: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.gray[300],
    ...Shadows.subtle,
  },
  uploadText: {
    ...Typography.label,
    color: Colors.text.primary,
    marginTop: Spacing.md,
  },
  uploadHint: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  backToCategories: {
    padding: Spacing.md,
  },
  backToCategoriesText: {
    ...Typography.body,
    color: Colors.primary[600],
  },
  reviewIcon: {
    marginBottom: Spacing.lg,
  },
  reviewInfo: {
    width: '100%',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.subtle,
  },
  reviewStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  reviewStepText: {
    ...Typography.body,
    color: Colors.text.primary,
  },
  skipButton: {
    padding: Spacing.md,
  },
  skipButtonText: {
    ...Typography.body,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  verifiedText: {
    ...Typography.label,
    color: '#FFF',
  },
  listContent: {
    padding: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  thanksCard: {
    backgroundColor: '#059669' + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#059669' + '30',
  },
  thanksEmoji: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  thanksTitle: {
    ...Typography.h4,
    color: '#059669',
    marginBottom: Spacing.xs,
  },
  thanksText: {
    ...Typography.body,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  offerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    ...Shadows.subtle,
  },
  offerImage: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  offerEmoji: {
    fontSize: 28,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  offerStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  offerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  discountBadge: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  discountText: {
    ...Typography.caption,
    color: Colors.success,
    fontWeight: '700',
  },
  categoryIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
    marginLeft: 2,
  },
  moreCategories: {
    ...Typography.caption,
    color: Colors.text.tertiary,
    marginLeft: 4,
  },
});
