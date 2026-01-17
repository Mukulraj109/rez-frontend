/**
 * Experience Detail Page - Production Ready
 * Fetches experience data and stores from backend API
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { experiencesApi, StoreExperience } from '@/services/experiencesApi';
import PremiumStoreCard from '@/components/experience/PremiumStoreCard';
import ThinkOutsideTheBox from '@/components/experience/ThinkOutsideTheBox';
import { getTheme } from '@/constants/experienceThemes';

const COLORS = {
  white: '#FFFFFF',
  navy: '#0F172A',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray400: '#94A3B8',
  gray600: '#64748B',
  green500: '#10B981',
  blue500: '#3B82F6',
  amber500: '#F59E0B',
};

const ExperienceDetailPage: React.FC = () => {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [experience, setExperience] = useState<StoreExperience | null>(null);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);

  // Get Theme based on type (handles aliases like "fast-delivery")
  const currentTheme = getTheme(type);

  useEffect(() => {
    const fetchExperienceData = async () => {
      if (!type) return;

      try {
        setIsLoading(true);

        // Fetch experience details
        const expResponse = await experiencesApi.getExperienceById(type);
        if (expResponse.success && expResponse.data) {
          setExperience(expResponse.data);
        } else {
          // Fallback structure using Theme
          setExperience({
            _id: type,
            slug: type,
            title: capitalizeLine(type.replace(/-/g, ' ')),
            type: type,
            icon: currentTheme.icon,
            sortOrder: 1,
            isActive: true,
            isFeatured: false,
            iconType: 'emoji',
          });
        }

        // Fetch stores (initial load)
        const storesResponse = await experiencesApi.getStoresByExperience(type, {
          page: 1,
          limit: 50,
          q: searchQuery, // Pass search query to backend if active
        });

        if (storesResponse.success && storesResponse.data) {
          const fetchedStores = storesResponse.data.stores || [];
          setStores(fetchedStores);

          // Extract unique categories (only on initial load or if not filtering)
          if (!searchQuery) {
            const uniqueCategories = Array.from(
              new Set(fetchedStores.map((s: any) => s.category?.name || 'Other'))
            );
            setCategories(['all', ...uniqueCategories]);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce search requests
    const timer = setTimeout(() => {
      fetchExperienceData();
    }, isSearchActive ? 500 : 0);

    return () => clearTimeout(timer);
  }, [type, searchQuery]);

  const capitalizeLine = (str: string) => str.replace(/\b\w/g, l => l.toUpperCase());

  // Filter Logic
  const filteredStores = stores.filter((store: any) => {
    const matchesCategory = selectedFilter === 'all' || (store.category?.name || store.category || 'Other') === selectedFilter;
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleStorePress = (store: any) => {
    const storeId = store._id || store.id;
    if (storeId) {
      router.push(`/store/${storeId}` as any);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.blue500} />
      </View>
    );
  }

  // Display Vars (Backend > Theme > Defaults)
  const displayTitle = experience?.title || capitalizeLine(type);
  const displaySubtitle = experience?.subtitle || 'Curated for you';
  const displayDesc = experience?.description || currentTheme.description;
  // Use Theme Gradient if backend missing or default, for better contrast
  const displayGradient = currentTheme.gradientColors;
  const benefits = experience?.benefits && experience.benefits.length > 0 ? experience.benefits : (currentTheme.benefits || []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Sticky Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.navy} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{displayTitle}</Text>
          <TouchableOpacity onPress={() => setIsSearchActive(!isSearchActive)} style={styles.iconButton}>
            <Ionicons name={isSearchActive ? "close" : "search"} size={24} color={COLORS.navy} />
          </TouchableOpacity>
        </View>

        {isSearchActive && (
          <View style={styles.searchBarContainer}>
            <Ionicons name="search" size={20} color={COLORS.gray400} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search stores..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
          </View>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Dynamic Gradient Hero */}
        <LinearGradient
          colors={displayGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroIconContainer}>
              <Text style={styles.heroIcon}>{experience?.icon || currentTheme.icon}</Text>
            </View>
            <Text style={styles.heroTitle}>{displayTitle}</Text>
            <Text style={styles.heroSubtitle}>{displaySubtitle}</Text>
            <Text style={styles.heroDescription}>{displayDesc}</Text>
          </View>

          {/* Floated Stats Card */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stores.length}+</Text>
              <Text style={styles.statLabel}>Stores</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>50%</Text>
              <Text style={styles.statLabel}>Avg Savings</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentContainer}>

          {/* New Section: Think Outside The Box */}
          <ThinkOutsideTheBox experienceType={type as string} searchQuery={searchQuery} />

          {/* Benefits Grid */}
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={20} color={COLORS.amber500} />
            <Text style={styles.sectionTitle}>Why shop here?</Text>
          </View>
          <View style={styles.benefitsGrid}>
            {benefits.map((benefit: string, idx: number) => (
              <View key={idx} style={styles.benefitCard}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.green500} style={{ marginRight: 8 }} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Store Browser */}
          <View style={[styles.sectionHeader, { marginTop: 32 }]}>
            <Text style={styles.sectionTitle}>Browse Stores</Text>
          </View>

          {/* Categories Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ paddingRight: 20 }}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedFilter(cat)}
                style={[
                  styles.filterChip,
                  selectedFilter === cat && styles.filterChipActive
                ]}
              >
                <Text style={[
                  styles.filterText,
                  selectedFilter === cat && styles.filterTextActive
                ]}>
                  {cat === 'all' ? 'All Stores' : cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Stores List */}
          <View style={styles.storesList}>
            {filteredStores.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="storefront-outline" size={48} color={COLORS.gray200} />
                <Text style={styles.emptyText}>No stores found matching your criteria</Text>
              </View>
            ) : (
              filteredStores.map((store: any, index: number) => (
                <PremiumStoreCard
                  key={store.id || index}
                  store={store}
                  onPress={handleStorePress}
                />
              ))
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
    zIndex: 100,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.navy,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.navy,
  },
  heroSection: {
    paddingTop: 32,
    paddingBottom: 60, // Space for the floated card
    paddingHorizontal: 20,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    marginBottom: 40,
    position: 'relative',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  heroIcon: {
    fontSize: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 4,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    fontWeight: '500',
  },
  heroDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: '90%',
  },
  statsContainer: {
    position: 'absolute',
    bottom: -30,
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    flexDirection: 'row',
    paddingVertical: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.navy,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray600,
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.gray200,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.navy,
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  benefitCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  benefitText: {
    fontSize: 13,
    color: COLORS.navy,
    fontWeight: '500',
    flex: 1,
  },
  filterScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderRadius: 100,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterChipActive: {
    backgroundColor: COLORS.navy,
    borderColor: COLORS.navy,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: COLORS.white,
  },
  storesList: {
    gap: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.gray400,
    marginTop: 12,
    fontSize: 16,
  },
});

export default ExperienceDetailPage;
