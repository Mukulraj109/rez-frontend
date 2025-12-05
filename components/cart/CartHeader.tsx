import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { CartHeaderProps } from '@/types/cart';

export default function CartHeader({ onBack, title = 'Cart' }: CartHeaderProps) {
  const { width, height } = Dimensions.get('window');
  const isSmallScreen = width < 360;
  const statusBarHeight =
    Platform.OS === 'ios'
      ? height > 800
        ? 44
        : 20
      : StatusBar.currentHeight || 24;

  return (
    <LinearGradient
      colors={['#00C06A', '#00996B']}
      style={[styles.container, { paddingTop: statusBarHeight + 10 }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
    >
      <View style={styles.content}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.85}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <ThemedText
          style={[
            styles.title,
            { fontSize: isSmallScreen ? 18 : 20 },
          ]}
        >
          {title}
        </ThemedText>

        {/* Spacer */}
        <View style={styles.spacer} />
      </View>
    </LinearGradient>
);
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    minHeight: 52,
  },
  backButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#00C06A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  spacer: {
    width: 46,
  },
});
