// CoinPage.tsx
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
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
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 5,
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
});
