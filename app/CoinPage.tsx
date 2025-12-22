// CoinPage.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Text, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import CardImg1 from '@/assets/images/card1.png';
import CardImg2 from '@/assets/images/card2.png';
import CardImg3 from '@/assets/images/card3.png';
import CardImg4 from '@/assets/images/card4.png';

const { width } = Dimensions.get('window');

const coinCardImages = [
  CardImg1,
  CardImg2,
  CardImg3,
  CardImg4,
];

export default function CoinPage() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={['#8146d0', '#411e7b']}
        style={styles.headerBg}
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backBtn} 
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color="#8146d0" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rez Coins</Text>
        </View>
      </LinearGradient>

      {/* Cards */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {coinCardImages.map((img, i) => (
          <View key={i} style={styles.cardWrap}>
            <TouchableOpacity activeOpacity={0.9} style={styles.cardBtn}>
              <Image
                source={img}
                style={styles.cardImg}
                resizeMode="cover"
                accessibilityLabel={`coin card ${i + 1}`}
              />
            </TouchableOpacity>
          </View>
        ))}

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/wallet/transfer')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="swap-horizontal" size={24} color="#0284C7" />
              </View>
              <Text style={styles.quickActionLabel}>Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/wallet/gift')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FCE7F3' }]}>
                <Ionicons name="gift" size={24} color="#DB2777" />
              </View>
              <Text style={styles.quickActionLabel}>Gift Coins</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/wallet/expiry-tracker')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="time" size={24} color="#D97706" />
              </View>
              <Text style={styles.quickActionLabel}>Expiry</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/wallet/gift-cards')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
                <Ionicons name="card" size={24} color="#059669" />
              </View>
              <Text style={styles.quickActionLabel}>Gift Cards</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={() => router.push('/wallet/scheduled-drops')}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="calendar" size={24} color="#7C3AED" />
              </View>
              <Text style={styles.quickActionLabel}>Drops</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#f7f4fd' 
  },
  headerBg: {
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: { 
    flex: 1, 
    paddingTop: 20 
  },
  cardWrap: {
    marginHorizontal: 18,
    marginBottom: 18,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  cardBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImg: {
    width: width - 36,
    height: 210, // increased height so "Get started" isn't cut off
    borderRadius: 20,
  },
  quickActionsContainer: {
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '18%',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
    textAlign: 'center',
  },
});
