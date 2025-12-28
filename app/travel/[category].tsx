/**
 * Travel Category Page - Dynamic route
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const COLORS = { white: '#FFFFFF', navy: '#0B2240', gray50: '#F9FAFB', gray100: '#F3F4F6', gray200: '#E5E7EB', gray600: '#6B7280', green500: '#22C55E', cyan500: '#06B6D4', amber500: '#F59E0B' };

const categoryData: Record<string, any> = {
  flights: { title: 'Flights', icon: '✈️', gradientColors: ['#3B82F6', '#2563EB'], items: [
    { id: 1, name: 'Delhi - Mumbai', type: 'Domestic', price: '₹2,499', cashback: '15%', image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400' },
    { id: 2, name: 'Bangalore - Goa', type: 'Domestic', price: '₹1,999', cashback: '18%', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
    { id: 3, name: 'Delhi - Dubai', type: 'International', price: '₹15,999', cashback: '20%', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400' },
  ]},
  hotels: { title: 'Hotels', icon: '🏨', gradientColors: ['#EC4899', '#DB2777'], items: [
    { id: 4, name: 'Taj Mahal Palace', type: '5 Star', price: '₹12,999/night', cashback: '25%', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400' },
    { id: 5, name: 'ITC Grand', type: '5 Star', price: '₹8,999/night', cashback: '22%', image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400' },
    { id: 6, name: 'OYO Rooms', type: 'Budget', price: '₹999/night', cashback: '30%', image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400' },
  ]},
  trains: { title: 'Trains', icon: '🚂', gradientColors: ['#22C55E', '#16A34A'], items: [
    { id: 7, name: 'Rajdhani Express', type: 'Premium', price: '₹1,999', cashback: '10%', image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=400' },
    { id: 8, name: 'Shatabdi Express', type: 'Premium', price: '₹899', cashback: '12%', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' },
  ]},
  bus: { title: 'Bus', icon: '🚌', gradientColors: ['#F97316', '#EA580C'], items: [
    { id: 9, name: 'Volvo AC Sleeper', type: 'Luxury', price: '₹999', cashback: '15%', image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400' },
    { id: 10, name: 'Seater Bus', type: 'Economy', price: '₹499', cashback: '10%', image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=400' },
  ]},
  cab: { title: 'Cab', icon: '🚕', gradientColors: ['#EAB308', '#CA8A04'], items: [
    { id: 11, name: 'Outstation Cab', type: 'Intercity', price: '₹12/km', cashback: '20%', image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400' },
    { id: 12, name: 'Airport Transfer', type: 'Local', price: '₹799', cashback: '15%', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400' },
  ]},
  packages: { title: 'Tour Packages', icon: '🎒', gradientColors: ['#8B5CF6', '#7C3AED'], items: [
    { id: 13, name: 'Goa 3N/4D', type: 'Beach', price: '₹9,999', cashback: '25%', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400' },
    { id: 14, name: 'Kerala 5N/6D', type: 'Nature', price: '₹14,999', cashback: '22%', image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400' },
    { id: 15, name: 'Rajasthan 7N/8D', type: 'Heritage', price: '₹19,999', cashback: '20%', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400' },
  ]},
};

const TravelCategoryPage: React.FC = () => {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category: string }>();
  const data = categoryData[category || 'flights'] || categoryData['flights'];

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
            <TouchableOpacity key={item.id} style={styles.itemCard} onPress={() => router.push(`/booking` as any)} activeOpacity={0.8}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.cashbackBadge}><Text style={styles.cashbackText}>{item.cashback}</Text></View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <View style={styles.typeBadge}><Text style={styles.typeText}>{item.type}</Text></View>
                <View style={styles.itemFooter}>
                  <Text style={styles.priceText}>{item.price}</Text>
                  <TouchableOpacity style={styles.bookButton}><Text style={styles.bookButtonText}>Book</Text></TouchableOpacity>
                </View>
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
  itemImage: { width: '100%', height: 160 },
  cashbackBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: COLORS.green500, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  cashbackText: { fontSize: 12, fontWeight: '700', color: COLORS.white },
  itemInfo: { padding: 16 },
  itemName: { fontSize: 18, fontWeight: '700', color: COLORS.navy, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.gray100, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  typeText: { fontSize: 11, fontWeight: '600', color: COLORS.gray600 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceText: { fontSize: 18, fontWeight: '700', color: COLORS.green500 },
  bookButton: { backgroundColor: COLORS.cyan500, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  bookButtonText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});

export default TravelCategoryPage;
