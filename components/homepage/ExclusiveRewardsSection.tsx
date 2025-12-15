import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// ReZ Brand Colors
const COLORS = {
  primary: '#00C06A',
  primaryDark: '#00A159',
  primaryLight: '#26C97D',
  gold: '#FFC857',
  goldDark: '#F5A623',
  goldLight: '#FFD87A',
  white: '#FFFFFF',
  textDark: '#0B2240',
  textMuted: '#6B7280',
  cardShadow: 'rgba(0, 0, 0, 0.1)',
};

// Reward categories data - using different shades of ReZ brand colors (green & gold)
const rewardCategories = [
  {
    id: 'students',
    title: 'Students',
    subtitle: 'Campus Zone Deals',
    icon: 'school-outline',
    gradientColors: ['#00C06A', '#00A859', '#008F4A'] as const, // Primary green
  },
  {
    id: 'employees',
    title: 'Employees',
    subtitle: 'Corporate Zone Offers',
    icon: 'briefcase-outline',
    gradientColors: ['#FFC857', '#F5B740', '#E6A830'] as const, // Primary gold
  },
  {
    id: 'women',
    title: 'Women Exclusive',
    subtitle: 'Special Rewards',
    icon: 'heart-outline',
    gradientColors: ['#26C97D', '#1DBF70', '#14B563'] as const, // Light green
  },
  {
    id: 'birthday',
    title: 'Birthday Specials',
    subtitle: 'Celebrate & Save',
    icon: 'gift-outline',
    gradientColors: ['#FFD87A', '#FFCE5C', '#FFC23D'] as const, // Light gold
  },
  {
    id: 'loyalty',
    title: 'Loyalty Progress',
    subtitle: 'Tier-based Rewards',
    icon: 'star-outline',
    gradientColors: ['#00A159', '#008F4A', '#007D3B'] as const, // Deep green
  },
  {
    id: 'army',
    title: 'Armed Forces',
    subtitle: 'Military Heroes Deals',
    icon: 'shield-outline',
    gradientColors: ['#F5A623', '#E69515', '#D68507'] as const, // Deep gold/amber
  },
  {
    id: 'medical',
    title: 'Doctor / Nurse',
    subtitle: 'Healthcare Heroes',
    icon: 'medkit-outline',
    gradientColors: ['#4DD294', '#3DC987', '#2DC07A'] as const, // Mint green
  },
  {
    id: 'disabled',
    title: 'Specially Abled',
    subtitle: 'Inclusive Rewards',
    icon: 'accessibility-outline',
    gradientColors: ['#FFB020', '#FFA010', '#FF9000'] as const, // Orange gold
  },
];

interface RewardCardProps {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  gradientColors: readonly [string, string, string];
  onPress: () => void;
}

const RewardCard: React.FC<RewardCardProps> = ({
  title,
  subtitle,
  icon,
  gradientColors,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={styles.cardContainer}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.cardGradient}
      >
        {/* Glass overlay for glassy effect */}
        <View style={styles.glassOverlay}>
          <View style={styles.cardContent}>
            <View style={styles.iconContainer}>
              <Ionicons name={icon} size={20} color={COLORS.white} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardSubtitle}>{subtitle}</Text>
            </View>
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const ExclusiveRewardsSection: React.FC = () => {
  const router = useRouter();

  const handleCategoryPress = () => {
    router.push('/offers');
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconContainer}>
            <LinearGradient
              colors={[COLORS.gold, COLORS.goldDark]}
              style={styles.headerIconGradient}
            >
              <Ionicons name="trophy" size={18} color={COLORS.white} />
            </LinearGradient>
          </View>
          <View>
            <Text style={styles.headerTitle}>Exclusive ReZ Rewards</Text>
            <Text style={styles.headerSubtitle}>Personalized deals just for you</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={handleCategoryPress}
        >
          <Text style={styles.viewAllText}>View All</Text>
          <Ionicons name="arrow-forward" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Reward Cards */}
      <View style={styles.cardsContainer}>
        {rewardCategories.map((category) => (
          <RewardCard
            key={category.id}
            title={category.title}
            subtitle={category.subtitle}
            icon={category.icon as keyof typeof Ionicons.glyphMap}
            gradientColors={category.gradientColors}
            onPress={handleCategoryPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    marginHorizontal: 0,
    marginVertical: 12,
    paddingTop: 20,
    paddingBottom: 8,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIconContainer: {
    shadowColor: COLORS.gold,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  headerIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    gap: 10,
  },
  cardContainer: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardGradient: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  glassOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: -0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardSubtitle: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },
  arrowContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});

export default ExclusiveRewardsSection;
