import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function InstagramCard() {
  const { width } = Dimensions.get('window');
  const responsiveMargin = width < 360 ? 16 : 20;
  const responsivePadding = width < 360 ? 16 : 20;

  return (
    <TouchableOpacity style={[styles.container, { marginHorizontal: responsiveMargin }]} activeOpacity={0.8}>
      <LinearGradient
        colors={['#EC4899', '#8B5CF6']}
        style={[styles.gradientBackground, { padding: responsivePadding }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="logo-instagram" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Earn from Instagram</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  gradientBackground: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});