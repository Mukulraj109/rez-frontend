/**
 * Student Zone Page
 * Redesigned student-exclusive offers page with verification
 * Based on Rez_v-2-main design, adapted for rez-frontend theme
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { Colors, Spacing, BorderRadius, Shadows, Typography, Gradients } from '@/constants/DesignSystem';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dummy data for student deals
interface StudentDeal {
  id: string;
  store: string;
  title: string;
  discount: string;
  category: string;
  description: string;
  image?: string;
  originalPrice?: string;
}

const DUMMY_STUDENT_DEALS: StudentDeal[] = [
  {
    id: 'stu1',
    store: 'Cafe Coffee Day',
    title: 'Student Special: 30% OFF',
    discount: '30%',
    category: 'Food & Dining',
    description: 'Show your student ID and get 30% off on all beverages',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400',
  },
  {
    id: 'stu2',
    store: 'Spotify',
    title: 'Student Plan at ₹59/month',
    discount: '₹59',
    originalPrice: '₹119',
    category: 'Entertainment',
    description: 'Premium music streaming at student-friendly prices',
    image: 'https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=400',
  },
  {
    id: 'stu3',
    store: 'Zomato',
    title: 'Campus Meals: 40% OFF',
    discount: '40%',
    category: 'Food & Dining',
    description: 'Affordable meals delivered to your campus',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400',
  },
  {
    id: 'stu4',
    store: 'Amazon Prime',
    title: 'Prime Student: 50% OFF',
    discount: '50%',
    category: 'Shopping',
    description: 'All Prime benefits at half the price',
    image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=400',
  },
  {
    id: 'stu5',
    store: 'Headspace',
    title: 'Free Premium for Students',
    discount: 'FREE',
    category: 'Wellness',
    description: 'Meditation and mindfulness for stressed students',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
  },
  {
    id: 'stu6',
    store: 'Decathlon',
    title: 'Student Sports Gear: 25% OFF',
    discount: '25%',
    category: 'Sports',
    description: 'Affordable sports equipment for active students',
    image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400',
  },
];

const CATEGORIES = [
  { id: 'All', icon: '🎓', label: 'All' },
  { id: 'Food & Dining', icon: '🍕', label: 'Food' },
  { id: 'Entertainment', icon: '🎬', label: 'Entertainment' },
  { id: 'Shopping', icon: '🛍️', label: 'Shopping' },
  { id: 'Wellness', icon: '🧘', label: 'Wellness' },
  { id: 'Sports', icon: '⚽', label: 'Sports' },
];

export default function StudentZonePage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isVerified, setIsVerified] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Bottom padding = Fixed CTA height (80px) + Bottom nav bar (70px) + Safe area bottom
  const bottomPadding = 80 + 70 + insets.bottom;

  const filteredDeals =
    selectedCategory === 'All'
      ? DUMMY_STUDENT_DEALS
      : DUMMY_STUDENT_DEALS.filter((d) => d.category === selectedCategory);

  const handleVerify = () => {
    // TODO: Implement verification flow
    setIsVerified(true);
  };

  const handleDealPress = (deal: StudentDeal) => {
    // TODO: Navigate to deal detail page
    console.log('Deal pressed:', deal.id);
  };

  const renderDealCard = ({ item }: { item: StudentDeal }) => (
    <TouchableOpacity
      style={styles.dealCard}
      onPress={() => handleDealPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.dealImageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.dealImage} resizeMode="cover" />
        ) : (
          <View style={styles.dealImagePlaceholder}>
            <Ionicons name="school" size={32} color={Colors.primary[600]} />
          </View>
        )}
      </View>

      <View style={styles.dealContent}>
        <View style={styles.dealHeader}>
          <View style={styles.dealInfo}>
            <ThemedText style={styles.dealStore}>{item.store}</ThemedText>
            <ThemedText style={styles.dealTitle}>{item.title}</ThemedText>
          </View>
          <View style={styles.discountBadge}>
            <ThemedText style={styles.discountText}>{item.discount}</ThemedText>
          </View>
        </View>

        <ThemedText style={styles.dealDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>

        <View style={styles.dealTags}>
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>🎓 Students Only</ThemedText>
          </View>
          <View style={styles.tag}>
            <ThemedText style={styles.tagText}>{item.category}</ThemedText>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3B82F6" translucent />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#3B82F6', '#2563EB', '#1D4ED8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.safeHeader}>
          <View style={styles.headerContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerTitleContainer}>
              <ThemedText style={styles.headerTitle}>Student Zone</ThemedText>
              <ThemedText style={styles.headerSubtitle}>Campus deals & student discounts</ThemedText>
            </View>

            <View style={styles.headerIcon}>
              <ThemedText style={styles.graduationEmoji}>🎓</ThemedText>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.3)', 'rgba(139, 92, 246, 0.3)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons name="school" size={32} color="#60A5FA" />
              </View>
              <View style={styles.heroTextContainer}>
                <ThemedText style={styles.heroTitle}>Exclusive Student Discounts</ThemedText>
                <ThemedText style={styles.heroSubtitle}>
                  Verified students get access to special deals
                </ThemedText>
              </View>
            </View>

            {/* Verification Status */}
            <View style={styles.verificationCard}>
              {isVerified ? (
                <View style={styles.verifiedStatus}>
                  <View style={styles.verifiedLeft}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <ThemedText style={styles.verifiedText}>Student Verified</ThemedText>
                  </View>
                  <View style={styles.activeBadge}>
                    <ThemedText style={styles.activeBadgeText}>Active</ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.unverifiedStatus}>
                  <View style={styles.unverifiedLeft}>
                    <Ionicons name="alert-circle" size={20} color="#FBBF24" />
                    <ThemedText style={styles.unverifiedText}>Verify to unlock all deals</ThemedText>
                  </View>
                  <TouchableOpacity
                    style={styles.verifyButton}
                    onPress={handleVerify}
                    activeOpacity={0.8}
                  >
                    <ThemedText style={styles.verifyButtonText}>Verify Now</ThemedText>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: '#60A5FA' }]}>
              {DUMMY_STUDENT_DEALS.length}+
            </ThemedText>
            <ThemedText style={styles.statLabel}>Active Deals</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: '#A78BFA' }]}>50%</ThemedText>
            <ThemedText style={styles.statLabel}>Max Discount</ThemedText>
          </View>
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: Colors.success }]}>₹5000+</ThemedText>
            <ThemedText style={styles.statLabel}>Avg. Savings</ThemedText>
          </View>
        </View>

        {/* Browse by Category */}
        <View style={styles.categorySection}>
          <ThemedText style={styles.sectionTitle}>Browse by Category</ThemedText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat.id && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <ThemedText style={styles.categoryIcon}>{cat.icon}</ThemedText>
                <ThemedText
                  style={[
                    styles.categoryLabel,
                    selectedCategory === cat.id && styles.categoryLabelActive,
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Deals List */}
        <View style={styles.dealsSection}>
          <ThemedText style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Student Deals' : `${selectedCategory} Deals`}
          </ThemedText>
          {filteredDeals.map((deal) => (
            <View key={deal.id}>{renderDealCard({ item: deal })}</View>
          ))}
        </View>

        {/* How to Verify */}
        {!isVerified && (
          <View style={styles.howToVerify}>
            <ThemedText style={styles.howToVerifyTitle}>How to Verify</ThemedText>
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>1</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Enter your college email (.edu)</ThemedText>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>2</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Upload student ID (optional)</ThemedText>
              </View>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>3</ThemedText>
                </View>
                <ThemedText style={styles.stepText}>Get verified in 24 hours</ThemedText>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed CTA Button */}
      <View style={styles.fixedCTA}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={isVerified ? () => {} : handleVerify}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={Gradients.primary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaGradient}
          >
            <ThemedText style={styles.ctaButtonText}>
              {isVerified ? 'Browse All Student Deals' : 'Verify Student Status'}
            </ThemedText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
  },
  safeHeader: {
    paddingBottom: Spacing.base,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSubtitle: {
    ...Typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerIcon: {
    width: 40,
    alignItems: 'center',
  },
  graduationEmoji: {
    fontSize: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150, // Will be overridden by dynamic padding
  },
  heroBanner: {
    margin: Spacing.base,
    borderRadius: BorderRadius['2xl'],
    overflow: 'hidden',
    ...Shadows.medium,
  },
  heroGradient: {
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: BorderRadius['2xl'],
  },
  heroContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  heroIconContainer: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(96, 165, 250, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.base,
  },
  heroTextContainer: {
    flex: 1,
  },
  heroTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  heroSubtitle: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
  },
  verificationCard: {
    marginTop: Spacing.base,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  verifiedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  verifiedText: {
    ...Typography.label,
    color: Colors.success,
  },
  activeBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  activeBadgeText: {
    ...Typography.caption,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  unverifiedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unverifiedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unverifiedText: {
    ...Typography.body,
    color: '#FBBF24',
  },
  verifyButton: {
    backgroundColor: '#FBBF24',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  verifyButtonText: {
    ...Typography.labelSmall,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.base,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.subtle,
  },
  statValue: {
    ...Typography.h2,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.text.tertiary,
  },
  categorySection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[100],
    gap: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryLabel: {
    ...Typography.labelSmall,
    color: Colors.text.secondary,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
  },
  dealsSection: {
    paddingHorizontal: Spacing.base,
  },
  dealCard: {
    flexDirection: 'row',
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    ...Shadows.subtle,
  },
  dealImageContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.base,
  },
  dealImage: {
    width: '100%',
    height: '100%',
  },
  dealImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dealContent: {
    flex: 1,
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  dealInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  dealStore: {
    ...Typography.bodySmall,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  dealTitle: {
    ...Typography.label,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  discountText: {
    ...Typography.labelSmall,
    color: '#3B82F6',
    fontWeight: '700',
  },
  dealDescription: {
    ...Typography.bodySmall,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  dealTags: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tagText: {
    ...Typography.caption,
    color: Colors.text.secondary,
  },
  howToVerify: {
    margin: Spacing.base,
    marginTop: Spacing.lg,
    padding: Spacing.base,
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.lg,
    ...Shadows.subtle,
  },
  howToVerifyTitle: {
    ...Typography.h4,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  stepsContainer: {
    gap: Spacing.md,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...Typography.caption,
    color: '#3B82F6',
    fontWeight: '700',
  },
  stepText: {
    ...Typography.body,
    color: Colors.text.secondary,
    flex: 1,
    paddingTop: 2,
  },
  fixedCTA: {
    position: 'absolute',
    bottom: 70, // Above bottom nav bar (70px height)
    left: 0,
    right: 0,
    padding: Spacing.base,
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
    ...Shadows.medium,
  },
  ctaButton: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    ...Typography.button,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
