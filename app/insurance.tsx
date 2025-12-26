/**
 * Insurance Page
 * Browse and buy insurance with cashback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const COLORS = {
  primaryGreen: '#00C06A',
  primaryGold: '#F59E0B',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  white: '#FFFFFF',
  background: '#F5F5F5',
  border: '#E5E7EB',
};

const INSURANCE_TYPES = [
  { id: 'health', name: 'Health Insurance', icon: '🏥', color: '#EF4444', cashback: 15 },
  { id: 'life', name: 'Life Insurance', icon: '❤️', color: '#EC4899', cashback: 12 },
  { id: 'vehicle', name: 'Vehicle Insurance', icon: '🚗', color: '#3B82F6', cashback: 18 },
  { id: 'travel', name: 'Travel Insurance', icon: '✈️', color: '#8B5CF6', cashback: 20 },
  { id: 'home', name: 'Home Insurance', icon: '🏠', color: '#10B981', cashback: 10 },
  { id: 'business', name: 'Business Insurance', icon: '💼', color: '#F59E0B', cashback: 8 },
];

const FEATURED_PLANS = [
  {
    id: '1',
    provider: 'HDFC Ergo',
    name: 'Health Shield',
    type: 'health',
    coverage: '₹5 Lakh',
    premium: '₹8,999/year',
    cashback: 15,
    features: ['Cashless hospitals', 'No claim bonus', 'Free health checkup'],
  },
  {
    id: '2',
    provider: 'ICICI Lombard',
    name: 'Motor Insurance',
    type: 'vehicle',
    coverage: 'Comprehensive',
    premium: '₹4,999/year',
    cashback: 18,
    features: ['Zero depreciation', 'RSA cover', 'NCB protection'],
  },
  {
    id: '3',
    provider: 'Max Life',
    name: 'Term Plan',
    type: 'life',
    coverage: '₹1 Crore',
    premium: '₹12,999/year',
    cashback: 12,
    features: ['Tax benefits', 'Critical illness', 'Accidental cover'],
  },
];

export default function InsurancePage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialType = params.type as string || '';

  const [selectedType, setSelectedType] = useState(initialType);

  const filteredPlans = selectedType
    ? FEATURED_PLANS.filter((plan) => plan.type === selectedType)
    : FEATURED_PLANS;

  const handlePlanPress = (plan: typeof FEATURED_PLANS[0]) => {
    router.push(`/insurance/${plan.id}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Insurance</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cashback Banner */}
        <View style={styles.banner}>
          <LinearGradient
            colors={['rgba(139, 92, 246, 0.15)', 'rgba(59, 130, 246, 0.15)']}
            style={styles.bannerGradient}
          >
            <Ionicons name="shield-checkmark" size={32} color="#8B5CF6" />
            <View style={styles.bannerText}>
              <Text style={styles.bannerTitle}>Protect & Earn Rewards</Text>
              <Text style={styles.bannerSubtitle}>Get up to 20% cashback on insurance premiums</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Insurance Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insurance Types</Text>
          <View style={styles.typesGrid}>
            {INSURANCE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardActive,
                ]}
                onPress={() => setSelectedType(selectedType === type.id ? '' : type.id)}
              >
                <View style={[styles.typeIcon, { backgroundColor: type.color + '20' }]}>
                  <Text style={styles.typeEmoji}>{type.icon}</Text>
                </View>
                <Text style={styles.typeName}>{type.name}</Text>
                <Text style={styles.typeCashback}>{type.cashback}% cashback</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Plans */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {selectedType ? `${INSURANCE_TYPES.find((t) => t.id === selectedType)?.name} Plans` : 'Featured Plans'}
          </Text>
          <View style={styles.plansList}>
            {filteredPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={styles.planCard}
                onPress={() => handlePlanPress(plan)}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planProvider}>{plan.provider}</Text>
                    <Text style={styles.planName}>{plan.name}</Text>
                  </View>
                  <View style={styles.planCashback}>
                    <Text style={styles.planCashbackText}>{plan.cashback}%</Text>
                    <Text style={styles.planCashbackLabel}>cashback</Text>
                  </View>
                </View>

                <View style={styles.planDetails}>
                  <View style={styles.planDetail}>
                    <Text style={styles.planDetailLabel}>Coverage</Text>
                    <Text style={styles.planDetailValue}>{plan.coverage}</Text>
                  </View>
                  <View style={styles.planDetail}>
                    <Text style={styles.planDetailLabel}>Premium</Text>
                    <Text style={styles.planDetailValue}>{plan.premium}</Text>
                  </View>
                </View>

                <View style={styles.planFeatures}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.planFeature}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.primaryGreen} />
                      <Text style={styles.planFeatureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                <TouchableOpacity style={styles.planButton}>
                  <Text style={styles.planButtonText}>Get Quote</Text>
                  <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Why Choose Us */}
        <View style={styles.whySection}>
          <Text style={styles.sectionTitle}>Why Buy Insurance on ReZ?</Text>
          <View style={styles.whyGrid}>
            {[
              { icon: 'cash-outline', title: 'Best Cashback', desc: 'Up to 20% cashback' },
              { icon: 'document-text-outline', title: 'Easy Claims', desc: 'Quick claim process' },
              { icon: 'shield-checkmark-outline', title: 'Trusted Partners', desc: 'Top insurers' },
              { icon: 'headset-outline', title: '24/7 Support', desc: 'Always available' },
            ].map((item, index) => (
              <View key={index} style={styles.whyCard}>
                <Ionicons name={item.icon as any} size={28} color={COLORS.primaryGreen} />
                <Text style={styles.whyTitle}>{item.title}</Text>
                <Text style={styles.whyDesc}>{item.desc}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  content: {
    flex: 1,
  },
  banner: {
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '31%',
    padding: 12,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    borderColor: COLORS.primaryGreen,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeEmoji: {
    fontSize: 24,
  },
  typeName: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
  },
  typeCashback: {
    fontSize: 10,
    color: COLORS.primaryGreen,
    fontWeight: '500',
  },
  plansList: {
    gap: 16,
  },
  planCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  planProvider: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planCashback: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 192, 106, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  planCashbackText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  planCashbackLabel: {
    fontSize: 10,
    color: COLORS.primaryGreen,
  },
  planDetails: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  planDetail: {},
  planDetailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  planDetailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  planFeatures: {
    gap: 8,
    marginBottom: 16,
  },
  planFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planFeatureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  planButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  whySection: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
  },
  whyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  whyCard: {
    width: '46%',
    alignItems: 'center',
    padding: 16,
  },
  whyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    marginBottom: 4,
  },
  whyDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
