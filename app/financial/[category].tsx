/**
 * Financial Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', purple500: '#8B5CF6', amber500: '#F59E0B' };

const categoryData: Record<string, any> = {
  bills: { title: 'Bill Payment', icon: '📄', gradientColors: ['#3B82F6', '#2563EB'], items: [
    { id: 1, name: 'Electricity', type: 'Utility', cashback: '5%', image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400' },
    { id: 2, name: 'Water Bill', type: 'Utility', cashback: '3%', image: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=400' },
    { id: 3, name: 'Gas Bill', type: 'Utility', cashback: '4%', image: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400' },
  ]},
  ott: { title: 'OTT & DTH', icon: '📺', gradientColors: ['#EF4444', '#DC2626'], items: [
    { id: 4, name: 'Netflix', type: 'OTT', cashback: '10%', image: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400' },
    { id: 5, name: 'Amazon Prime', type: 'OTT', cashback: '8%', image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=400' },
    { id: 6, name: 'Tata Sky', type: 'DTH', cashback: '5%', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' },
  ]},
  recharge: { title: 'Mobile Recharge', icon: '📱', gradientColors: ['#22C55E', '#16A34A'], items: [
    { id: 7, name: 'Jio Prepaid', type: 'Prepaid', cashback: '3%', image: 'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?w=400' },
    { id: 8, name: 'Airtel Prepaid', type: 'Prepaid', cashback: '3%', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400' },
    { id: 9, name: 'Vi Postpaid', type: 'Postpaid', cashback: '5%', image: 'https://images.unsplash.com/photo-1556656793-08538906a9f8?w=400' },
  ]},
  gold: { title: 'Digital Gold', icon: '🪙', gradientColors: ['#F59E0B', '#D97706'], items: [
    { id: 10, name: 'Buy Gold', type: '24K Pure', cashback: '0.5%', image: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?w=400' },
    { id: 11, name: 'Gold SIP', type: 'Monthly', cashback: '1%', image: 'https://images.unsplash.com/photo-1624365168968-f283d506c6b6?w=400' },
  ]},
  insurance: { title: 'Insurance', icon: '🛡️', gradientColors: ['#8B5CF6', '#7C3AED'], items: [
    { id: 12, name: 'Health Insurance', type: 'Medical', cashback: '10%', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400' },
    { id: 13, name: 'Life Insurance', type: 'Term', cashback: '12%', image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400' },
    { id: 14, name: 'Car Insurance', type: 'Vehicle', cashback: '8%', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
  ]},
  loans: { title: 'Loans', icon: '💳', gradientColors: ['#EC4899', '#DB2777'], items: [
    { id: 15, name: 'Personal Loan', type: 'Unsecured', cashback: '₹500', image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400' },
    { id: 16, name: 'Home Loan', type: 'Secured', cashback: '₹2000', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400' },
  ]},
};

const FinancialCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const data = categoryData[category || 'bills'] || categoryData['bills'];

  return (
    <View style={styles.container}>
      <LinearGradient colors={data.gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color={COLORS.white} /></TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>{data.icon} {data.title}</Text>
            <Text style={styles.headerSubtitle}>{data.items.length} options</Text>
          </View>
          <TouchableOpacity style={styles.searchButton}><Ionicons name="search" size={24} color={COLORS.white} /></TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.itemsList}>
          {data.items.map((item: any) => (
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push(`/bill-payment` as any)} activeOpacity={0.8}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{item.cashback}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type}</Text></View>
                <TouchableOpacity style={styles.payButton}><Text style={styles.payButtonText}>Pay Now</Text></TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { paddingTop: Platform.OS === 'ios' ? 56 : 16, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  backButton: { padding: 8 },
  headerTitleContainer: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: COLORS.white },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)' },
  searchButton: { padding: 8 },
  itemsList: { padding: 16, gap: 16 },
  itemCard: { backgroundColor: COLORS.white, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.gray200 },
  itemImage: { width: '100%', height: 140 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  payButton: { backgroundColor: COLORS.purple500, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  payButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default FinancialCategoryPage;
